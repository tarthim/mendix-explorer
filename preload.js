//Create context bridge to send var to browser window
const { contextBridge } = require('electron')
const { dialog } = require('electron')
const { ipcRenderer } = require('electron');

//Node preload
window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
      const element = document.getElementById(selector)
      if (element) element.innerText = text
    }
  
    for (const dependency of ['chrome', 'node', 'electron']) {
      replaceText(`${dependency}-version`, process.versions[dependency])
    }
  })


//Expose api to communciate to main to renderer
contextBridge.exposeInMainWorld(
  //API for page functions
  'api', {
      //Allow client to send main thread messages
      send: (channel, data) => {
        ipcRenderer.send(channel, data)
      },

      //Allow main to send messages to client
      receive: (channel, data) => {
        ipcRenderer.on(channel, (event, data))
      }
})
