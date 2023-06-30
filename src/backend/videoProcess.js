const { exec } = require('child_process');
const fs = require('fs');

exports.convertVideo = (inputFile, outputFile) => {
  return new Promise((resolve, reject) => {
    fs.readFile(inputFile, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      console.log("Video file accessed")
      const ffmpegCommand = `ffmpeg -i "${inputFile}" -c:v copy -c:a copy "${outputFile}"`;
      exec(ffmpegCommand, (error, stdout, stderr) => {
        console.log("Executing the command")
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  });
};
