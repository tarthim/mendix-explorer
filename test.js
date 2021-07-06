//Test script to check mendix-scanner functions
const {MendixScanner} = require('./mendix-scanner.js')

const testDir = 'C:\\Mendix\\RWS\\KMS\\rws-kms-main';

async function runTest() {
    let mendixScanner = new MendixScanner(testDir)
    try {
        await mendixScanner.init(() => {
            console.log('Mendix scanner object succesfully initialized')
            //console.log(`Mendix version ${mendixScanner.mendixVersion} detected for project ${mendixScanner.projectName}`)
            //console.log(`Global admin user is called ${mendixScanner.mxAdminName}`)
            //console.log('Roles: ')
            //console.log(mendixScanner.mendixRoles)
            //console.log(mendixScanner)
        })
    }
    catch (e) {
        //Handle action when object cannot be initialized
        console.log(e)
    }
}


runTest();