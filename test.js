//Test script to check mendix-scanner functions
const {
    validateMendixFolder,
    readMendixVersion
    } = require('./mendix-scanner.js')

const testDir = 'C:\\Mendix\\RWS\\KMS\\rws-kms-main';

async function runTest() {
    let validFolder = await validateMendixFolder(testDir);
    if (validFolder) {
        let mendixVersion = await readMendixVersion(testDir);
        console.log(`Folder is running on Mendix version ${mendixVersion}`)
    }
    
}


runTest();