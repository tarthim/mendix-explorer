//A module to scan Mendix folders for structure and extra information
const fs = require('fs')

const checkFilePaths = [
    "\\deployment\\model\\metadata.json"
];


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
        this.mendixRoles = []
        this.mxAdminName
    }

    init = async (cb) => {
        //Init object. Runs callback after init.
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

            //Create initial mapping
            for (let role in allRoles) {
                //Create role object
                let selectedRole = allRoles[role]
                let roleName = selectedRole.Name

                let newRole = new MendixRole(role, roleName)
                newRole.manageRoles.push(selectedRole.ManageableRoles)
                this.mendixRoles.push(newRole)
            }

            //Loop through Mendix roles to add readable names to manageable role ids
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



async function _readJsonFile(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, (err, result) => {
            if (err) reject(err)
            let jsonData = JSON.parse(result)
            resolve(jsonData)
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