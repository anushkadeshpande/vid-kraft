import './App.css';
const { ipcRenderer } = window.require('electron');
// const { remote } = window.require('electron');
// const { dialog } = remote;

function App() {
const pressed = () => {
  console.log("Button pressed")
  ipcRenderer.sendSync('convert-video')
}
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
const handleFileSelect = (event) => {
    const file = event.target.files[0]; // Get the selected file
  
    if (file) {
      const filePath = URL.createObjectURL(file); // Get a temporary URL for the selected file
      console.log('Selected file path:', filePath);
    }
  
}

function openFile() {
  ipcRenderer.invoke('open-file-dialog')
    .then((filePath) => {
      console.log('Selected file path:', filePath);
    })
    .catch((error) => {
      console.error('Error while opening file dialog:', error);
    });
}
  return (
    <div className="App">
      {/* <input type='file' onChange={handleFileSelect}/> */}
      <button onClick={openFile}>Press</button>
    </div>
  );
}

export default App;
