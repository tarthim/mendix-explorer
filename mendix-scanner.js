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
        this.mendixRoles = []
    }

    init = async (cb) => {
        //Init object. Runs callback after init.
        await this.checkValidMendixDirectory()

        //If Mendix folder is found, load metadata etc
        if (this.hasMendixFolder) {
            //Load JSON object into MendixScanner
            await this.loadMendixMetadataJson()

            //Read runtime version
            this.mendixVersion = this.mendixMetadataJson.RuntimeVersion

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
                console.log(newRole)
            }

            //Todo: Go through mendixRoles object (this.mendixRoles) and assign names to manageRoles (find them in mendixRoles :-))
           
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
        let metadataJson = await _loadMendixMetaDataJson(this.metadataPath)
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


_loadMendixMetaDataJson = async (metadataPath) => {
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