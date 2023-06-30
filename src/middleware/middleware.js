const { app, BrowserWindow } = require('electron');
const { ipcMain } = require("electron");
const { dialog } = require('electron');

const { convertVideo } = require('../backend/videoProcess')

const inputFile = 'D:\\Projects\\video-editor\\TestVideos\\cycles.mkv';
const outputFile = 'D:\\Projects\\video-editor\\TestVideos\\cycles.mp4';




  ipcMain.on("convert-video", async (event) => {
    convertVideo(inputFile, outputFile)
    .then(() => {
      console.log('Video conversion completed');
      // Handle any further actions or UI updates
    })
    .catch((error) => {
      console.error('Video conversion error:', error);
      // Handle the error appropriately
    });

});

ipcMain.handle('open-file-dialog', async () => {
    const mainWindow = BrowserWindow.getFocusedWindow();
  
    const result = await dialog.showOpenDialog(mainWindow, { properties: ['openFile'] });
  
    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0];
    }
  
    return null;
  });