import './App.css'
import VideoPlayer from './components/VideoPlayer'
import { MediaBin } from './components/MediaBin'
import { Timeline } from './components/Timeline'

function App() {

  return (
    <div className="app">
      <div className="app__top">
        <aside className="app__sidebar">
          <MediaBin />
        </aside>
        <main className="app__main">
          <VideoPlayer />
        </main>
      </div>
      <section className="app__timeline">
        <Timeline />
      </section>
    </div>
  )
}

export default App
