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



async function getSelectedDirectory() {
    //Open file dialog and wait for action
    var selectedDirectoryAction = await dialog.showOpenDialog({ properties: ['openDirectory'] })

    //Check if user did not cancel action
    if (selectedDirectoryAction.canceled != true)
    {
        //User has selected a new working directory.
        //Start checking for Mendix files
        selectedPathDir = selectedDirectoryAction.filePaths[0];
        processSelectedDirectory(selectedPathDir);

        var returndata = {};
        returndata.type = 'selectedDirectory';

        returndata.content = selectedPathDir;
        //Return action to client
        win.webContents.send('fromMain', returndata);
    }
}


//IPC binds for preload.js
ipcMain.on("toMain", (event, args) => {
    if (args.type == 'openDirectoryDialog') {
        getSelectedDirectory();
    }
})


async function processSelectedDirectory(dir) {
    //Send new directory mendix API
    let response = {}

    //First check if this is a valid mendix folder
    var folderValidation = await validateMendixFolder(dir)
    console.log('Folder validation finished with result ' + folderValidation)

    if (folderValidation) {
        //Folder has all neccesary mendix files        
    }
    else {
        //Return to client that we could not load the folder
        response.type = 'showErrorMessage'
        response.content = 'This folder does not contain all neccesary Mendix files'
        win.webContents.send('fromMain', response)
    }
}