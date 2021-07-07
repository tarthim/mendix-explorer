//A module to scan Mendix folders for structure and extra information
const fs = require('fs')

const checkFilePaths = [
    "\\deployment\\model\\metadata.json"
];

const XmlReader = require('xml-reader')



class MendixRole {
    constructor (id, name) {
        this.id = id
        this.name = name
        this.manageRoles = []
    }
}


//Mendix scanner object
class MendixScanner {
    constructor(baseDir) {
        this.baseDir = baseDir
        this.metadataPath = baseDir + `\\deployment\\model\\metadata.json`
        this.hasMendixFolder
        this.mendixMetadataJson

        //Refactor Mendix props into a seperate Mendix object?
        this.mendixVersion
        this.projectName
        this.mxAdminName
        this.mendixRoles = []
        this.pagesFound = false
        this.pagesDirectories = []
        this.widgets
        this.pages = []
    }
    
    //Init object. Runs callback after init.
    init = async (cb) => {
        await this.checkValidMendixDirectory()

        //If Mendix folder is found, load metadata etc
        if (this.hasMendixFolder) {
            //Load JSON object into MendixScanner
            await this.loadMendixMetadataJson()

            //Read project name
            this.projectName = this.mendixMetadataJson.ProjectName

            //Read runtime version
            this.mendixVersion = this.mendixMetadataJson.RuntimeVersion

            //Read MXadmin name
            this.mxAdminName = this.mendixMetadataJson.AdminUser

            //Read roles from metadata
            let allRoles = this.mendixMetadataJson.Roles

            //Create initial mapping (Refactor to _function)
            for (let role in allRoles) {
                //Create role object
                let selectedRole = allRoles[role]
                let roleName = selectedRole.Name

                let newRole = new MendixRole(role, roleName)
                newRole.manageRoles.push(selectedRole.ManageableRoles)
                this.mendixRoles.push(newRole)
            }

            //Loop through Mendix roles to add readable names to manageable role ids (Refactor to _function)
            this.mendixRoles.forEach((mendixRole) => {
                let manageRoles = mendixRole.manageRoles[0]
                if (manageRoles) { //Has manageable roles
                    manageRoles.forEach((findRoleValue, i) => { //Go through each role, find readable name
                        var originRoleID = manageRoles[i]
                        //Find this value in the mendix role list for this application. Return as foundRole.
                        let foundRole = this.mendixRoles.find((role) => {
                            return role.id === findRoleValue
                        })
                        //Value to add to array with roles (readable for end-user)
                        let foundRoleName = foundRole.name
                        //Replace just the ID value with ID and name
                        manageRoles[i] = {'ID': originRoleID, 'name': foundRoleName}
                    })
                }
                else {
                    //Has no roles to manage :-)
                }
            })

            //Read all widgets from widget folder
            await _readMendixWidgets(this) //Adds widgets as {name: name, seenOnPages: []}

            //Grab all XML directories for pages
            await _getMendixXMLDirectories(this)
            //Read XML files inside pages
            if (this.pagesFound) await _readXMLPages(this)
        }
        else {
            //Throw object error
            throw `No valid Mendix directory found at ${this.baseDir}`
        }

        //Bind callback to this object
        cb.bind(this)();
    }

    checkValidMendixDirectory = async () => {
        let validFolder = await _validateMendixFolder(this.baseDir)
        this.hasMendixFolder = validFolder
    }

    loadMendixMetadataJson = async () => {
        let metadataJson = await _loadMendixMetadataJson(this.metadataPath)
        this.mendixMetadataJson = metadataJson
    }
}



//Checks if a directory contains a valid Mendix build (including deployment\model)
_validateMendixFolder = async (dir) => {
    console.log(`Validating directory ${dir}`)

    //Basic vars
    var baseDir = dir

    var invalidDir = await _validateDirectoryFiles(baseDir)

    if (invalidDir == false) {
        //console.log('All file checks succesful')
        return true
    }
    else {
        //console.log('Could not find all neccesary files')
        return false
    }
}


_loadMendixMetadataJson = async (metadataPath) => {
    var jsonData = await _readJsonFile(metadataPath)
    return jsonData
}

async function _getMendixXMLDirectories(obj) {
    //Find XML directories. Each language has its own folder. First coding pass only has support for nl_NL
    let xmlDir = obj.baseDir + '\\deployment\\web\\pages\\nl_NL\\'
    console.log(`Checking ${xmlDir}`)
    var folderFound = await _checkFileExist(xmlDir)
    if (folderFound) {
        //Set pages found to true for easier handling at client side
        if (obj.pagesFound == false) obj.pagesFound = true
        //Check all folders in pages directory
        let subDirectories = 
            //Read all subdirectories in xmlDir
            fs.readdirSync(xmlDir, {withFileTypes: true})
                .filter(dirent => dirent.isDirectory())
                .map(dirent => dirent.name)
        //Add directory to XML list in mendixScanner obj
        for (let i in subDirectories) {
            let subDir = subDirectories[i]
            let xmlPageDir = xmlDir + subDir + `\\`
            obj.pagesDirectories.push(xmlPageDir)
        }
    }
}

async function _readMendixWidgets(obj) {
    let allWidgets = []
    let widgetDir = obj.baseDir + '\\widgets\\'
    let widgetFiles =
        fs.readdirSync(widgetDir, {withFileTypes: true})
            .filter(dirent => dirent.isDirectory() === false)
            .map(dirent => dirent.name)
    
    widgetFiles.forEach((widgetName) => {
        let widgetCleanName = widgetName.split('.mpk')[0]
        allWidgets.push({'name': widgetCleanName, 'seenOnPages': []})
    })
    obj.widgets = allWidgets
}

async function _readXMLPages(obj) {
    let pagesDirectories = obj.pagesDirectories
    let xmlDirs = []
    let allMendixObjects = []
    pagesDirectories.forEach((pagesDirectory) => {
        //Loop through each directory
        let directoryName = pagesDirectory
        console.log(pagesDirectory)
        //Create list of each xml file inside directory
        let xmlFiles = 
            fs.readdirSync(pagesDirectory, {withFileTypes: true})
                .filter(dirent => dirent.isDirectory() === false)
                .map(dirent => dirent.name)
        xmlDirs.push({'dir': directoryName, 'xml': xmlFiles})    
    })
    
    //Loop through all XML files :-)
    await Promise.all(xmlDirs.map(async (xmlDirObj) => {
        let xmlDir = xmlDirObj.dir
        let xmlFiles = xmlDirObj.xml
        
        let xmlFileCount = xmlFiles.length
        if (xmlFileCount > 0) {
            //Start scanning each XML file. 
            let baseDir = xmlDir

            await Promise.all(xmlFiles.map(async (xmlFile) => {
                let fullPath = baseDir + xmlFile
                let pageName = xmlFile.split('.')[0]
                
                await _readXMLFile(fullPath, pageName, allMendixObjects)
            }))
        }
    }))

    console.log('Done reading all Mendix pages')
    
    //Process allMendixObjects --> Every page in Mendix folder. Use this to fill up Widget analyser (extract function)
    allMendixObjects.forEach((mendixObject) => {
        //console.log(mendixObject)
        let mendixObjectType = mendixObject.obj.attributes['data-mendix-type']
        //Handle different types of Mendix Objects (widgets, etc)
        if (mendixObjectType) {
            let mendixType = mendixObjectType.substring(0,4)
            if (mendixType == 'mxui') {
                //if (mendixObjectType !== 'mxui.widget.ReactWidgetWrapper') console.log('Mendix object: ' + mendixObjectType)
            }
            else {
                let customWidgetType = mendixObjectType.split('.widget')[0]
                customWidgetType = customWidgetType.split('.')[0]
                addPageToCustomWidget(obj, customWidgetType, mendixObject.page)
                //console.log(`Custom widget on page ${mendixObject.page} with type ${customWidgetType}`)
            }
        }
    })
}

function addPageToCustomWidget(obj, widget, page) {
    //console.log(`Found ${widget} on ${page}`)
    let widgets = obj.widgets
    let selectedWidget = widgets.find((findWidget) => {
        return findWidget.name.toUpperCase() === widget.toUpperCase()
    })
    if (selectedWidget) selectedWidget.seenOnPages.push(page)
}

async function _processXMLPage(page, pageName, allMendixObjects) {
    return new Promise((resolve, reject) => {
        //console.log(`Reading page ${pageName}`)
        var xmlReader = XmlReader.create() //Create new reader for object
        
        //Reads raw XML content.
        xmlReader.on('done', data =>
        {
            let baseObject = data
            allMendixObjects.push({'page': pageName, 'obj': baseObject})
            let currentObj = baseObject.children
    

            currentObj.forEach((baseObj) => {
                recursiveReadChildren(allMendixObjects, baseObj, pageName)
            })     
        })
        xmlReader.parse(page)
        resolve()
    })
}


function recursiveReadChildren(objArray, obj, pageName) {
    if (obj.children != undefined) {
        if (obj.children.length > 0) {
            obj.children.forEach((childObj) => {
                recursiveReadChildren(objArray, childObj, pageName)
            })
        }
    }

    objArray.push({'page': pageName, 'obj': obj})
}

async function _readJsonFile(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, (err, result) => {
            if (err) reject(err)
            let jsonData = JSON.parse(result)
            resolve(jsonData)
        })
    })
}

async function _readXMLFile(path, pageName, allMendixObjects) {
    return new Promise((resolve) => {
        fs.readFile(path, 'utf8', async (err, data) => {
            if (err) reject (err)
            await _processXMLPage(data, pageName, allMendixObjects)
            resolve(data)
        })
    })
}


async function _validateDirectoryFiles(basePath) {
    //Do a check for each checkFilePath
    let invalidDir = false
    for (const path of checkFilePaths) {
        let fullPath = basePath + path
        let pathExists = await _checkFileExist(fullPath)

        if (pathExists == false) {
            invalidDir = true
        }
    }
    return invalidDir
}


//Refactor. This doesn't only check files, but is also used to check folder paths
async function _checkFileExist(path) {
    //Checks async if file exists at path
    //console.log('Checking file at ' + path)
    let fileExists;
    try {
        await fs.promises.access(path, fs.F_OK);
        console.log(`Found ${path}`)
        return true
    } catch (er) {
        console.log(`${path} could not be found`)
        return false
    }
}


exports.MendixScanner = MendixScanner