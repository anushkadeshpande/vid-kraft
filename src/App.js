import './App.css';
const { ipcRenderer } = window.require('electron');


function App() {
const pressed = () => {
  console.log("Button pressed")
  ipcRenderer.sendSync('convert-video')
}
  return (
    <div className="App">
      <button onClick={pressed}>Press</button>
    </div>
  );
}

export default App;
