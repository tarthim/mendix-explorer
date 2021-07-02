//A module to scan Mendix folders for structure and extra information

const fs = require('fs')

const checkFilePaths = [
    "\\deployment\\model\\metadata.json"
];


//Checks if a directory contains a valid Mendix build (including deployment\model)
exports.validateMendixFolder = async (dir) => {
    console.log(`Validating directory ${dir}`)

    //Basic vars
    var baseDir = dir

    var invalidDir = await _validateDirectoryFiles(baseDir)

    if (invalidDir == false) {
        console.log('All file checks succesful')
        return true
    }
    else {
        console.log('Could not find all neccesary files')
        return false
    }
}



exports.readMendixVersion = async (dir) => {
    console.log(`Checking Mendix version for ${dir}`)
    let mendixMetadataPath = dir + '\\deployment\\model\\metadata.json'
    var jsonData = await _readJsonFile(mendixMetadataPath)
    return jsonData.RuntimeVersion
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