const { app, BrowserWindow } = require('electron');
const { ipcMain } = require("electron");
const { dialog } = require('electron');
const fs = require('fs');
const path = require('path');
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
  const publicFolderPath = path.join(__dirname, '/test.mp4');

    const mainWindow = BrowserWindow.getFocusedWindow();
  
    const result = await dialog.showOpenDialog(mainWindow, { properties: ['openFile'] });
  
    if (!result.canceled && result.filePaths.length > 0) {
     fs.copyFile(result.filePaths[0], publicFolderPath, (error) => {
      if (error) {
        console.error('Error copying file:', error);
      } else {
        console.log('File copied successfully!');
      }
    });
    return result.filePaths[0];
  }
    return null;
  });