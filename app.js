//Back-end electron app
const {app, BrowserWindow, contextBridge} = require('electron')

const { dialog } = require('electron')

const path = require('path')

//IPC communication
const { ipcMain } = require('electron')

const {validateMendixFolder} = require('./mendix-scanner.js')

let win;

let currentPathFile = '';

//Create main window
function createMainWindow () {
    win = new BrowserWindow({
        height: 1000,
        width: 900,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true
        }
    })

    win.loadFile(path.join(__dirname, '/views/index.html'))
    win.webContents.openDevTools()
}


//Wait until container is ready
app.whenReady().then(() => {
    createMainWindow()
  })

//Close app on windows close
  app.on('window-all-closed', function () {
    app.quit()
  })


//Open file dialog --> Wait for user to pick a folder --> Process the folder, load Mendix project --> generate mendixProp object for client
async function getSelectedDirectory() {
    //Open file dialog and wait for action
    var selectedDirectoryAction = await dialog.showOpenDialog({ properties: ['openDirectory'] })

    //Check if user did not cancel action
    if (selectedDirectoryAction.canceled != true)
    {
        //User has selected a new working directory.
        selectedPathDir = selectedDirectoryAction.filePaths[0]
        
        //Start checking for Mendix files
        var folderValidation = await validateMendixFolder(selectedPathDir)

        //Folder has a Mendix project
        if (folderValidation) {
            let clientResponse = {}
            clientResponse.type = 'selectedDirectory'
    
            clientResponse.content = selectedPathDir
            //Return action to client
            win.webContents.send('fromMain', clientResponse)
        }

        //Folder does not have a valid Mendix project
        else {
            //Return to client that we could not load the folder
            _clientReturnErrorMessage('This folder does not contain all neccesary Mendix files')
        }
    }
}

//Cient responses

function _clientReturnErrorMessage(msg) {
    let clientResponse = {}
    clientResponse.type = 'showErrorMessage'
    clientResponse.content = msg
    win.webContents.send('fromMain', clientResponse)
}



//IPC binds for preload.js
ipcMain.on("toMain", (event, args) => {
    if (args.type == 'openDirectoryDialog') {
        getSelectedDirectory();
    }
})