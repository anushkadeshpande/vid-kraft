import './App.css'
import VideoPlayer from './components/VideoPlayer'
import { MediaBin } from './components/MediaBin'

function App() {

  return (
    <div className="app">
      <aside className="app__sidebar">
        <MediaBin />
      </aside>
      <main className="app__main">
        <VideoPlayer />
      </main>
    </div>
  )
}

export default App
