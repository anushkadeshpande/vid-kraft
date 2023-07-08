import { useState, useRef, useEffect } from "react";
import "./App.css";
const { ipcRenderer } = window.require("electron");
// const { remote } = window.require('electron');
// const { dialog } = remote;

function App() {
  const pressed = () => {
    console.log("Button pressed");
    ipcRenderer.sendSync("convert-video");
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0]; // Get the selected file

    if (file) {
      const filePath = URL.createObjectURL(file); // Get a temporary URL for the selected file
      console.log("Selected file path:", filePath);
    }
  };

  function openFile() {
    ipcRenderer
      .invoke("open-file-dialog")
      .then((filePath) => {
        console.log("Selected file path:", filePath);
        setVidPath(filePath);
      })
      .catch((error) => {
        console.error("Error while opening file dialog:", error);
      });
  }

  const [vidPath, setVidPath] = useState("");
  // let ctx = null
  useEffect(() => {
    const canvas = document.getElementById("canV");
    let ctx = canvas.getContext("2d");
    var video = document.createElement("video");
    if(vidPath) {
    video.src = vidPath;

    video.play(); // start playing
    update(); //Start rendering
    }
    function update() {
      ctx.drawImage(video, 0, 0, 256, 256);
      requestAnimationFrame(update); // wait for the browser to be ready to present another animation fram.
    }
  }, [vidPath]);
  const canvasRef = useRef();

  return (
    <div className="App">
      {/* <input type='file' onChange={handleFileSelect}/> */}
      {/* <h1>VidKraft</h1> */}
      <canvas id="canV" width="256" height="256" ref={canvasRef}></canvas>
      <button onClick={openFile}>Press</button>
    </div>
  );
}

export default App;

// function openFile() {
//   dialog.showOpenDialog({ properties: ['openFile'] })
//     .then((result) => {
//       if (!result.canceled) {
//         const filePath = result.filePaths[0];
//         console.log('Selected file path:', filePath);
//       }
//     })
//     .catch((error) => {
//       console.error('Error while opening file dialog:', error);
//     });
// }
