//Test script to check mendix-scanner functions
const {MendixScanner} = require('./mendix-scanner.js')

const testDir = 'C:\\Mendix-Projects\\RWS\\KMS\\rws-kms-main';

async function runTest() {
    let mendixScanner = new MendixScanner(testDir)
    try {
        await mendixScanner.init(() => {
            console.log('Mendix scanner object succesfully initialized')
            console.log(`Mendix version ${mendixScanner.mendixVersion} detected`)
            console.log('Roles: ')
            console.log(mendixScanner.mendixRoles)
        })
    }
    catch (e) {
        //Handle action when object cannot be initialized
        console.log(e)
    }
}


runTest();