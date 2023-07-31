import { useState, useRef, useEffect } from "react";
import "./App.css";
import VideoCanvas from "./VideoCanvas";
const { ipcMain,ipcRenderer } = window.require("electron");

function App() {
  return (
    <div className="App">
      <h1>VidKraft</h1>
      <VideoCanvas />
    </div>
  );
}

export default App;
