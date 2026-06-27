import './App.css'
import { MediaBin } from './components/MediaBin'
import { Preview } from './components/Preview'
import { Timeline } from './components/Timeline'

function App() {

  return (
    <div className="app">
      <div className="app__top">
        <aside className="app__sidebar">
          <MediaBin />
        </aside>
        <main className="app__main">
          <Preview />
        </main>
      </div>
      <section className="app__timeline">
        <Timeline />
      </section>
    </div>
  )
}

export default App
