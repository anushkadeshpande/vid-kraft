import { useState } from 'react'
import { useProjectStore } from '../../store/projectStore'
import { useMediaImport } from '../../hooks/useMediaImport'
import AssetCard from './AssetCard'
import './MediaBin.css'

type ViewMode = 'grid' | 'list'

function MediaBin() {
  const assets = useProjectStore((s) => s.project.assets)
  const removeAsset = useProjectStore((s) => s.removeAsset)
  const { importing, importFromDialog } = useMediaImport()

  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const handleRemove = (id: string) => {
    removeAsset(id)
    if (selectedId === id) setSelectedId(null)
  }

  return (
    <section className="media-bin">
      <header className="media-bin__header">
        <h2 className="media-bin__title">Media</h2>
        <div className="media-bin__actions">
          <div className="media-bin__view-toggle" role="group" aria-label="View mode">
            <button
              className={viewMode === 'grid' ? 'is-active' : ''}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              ▦
            </button>
            <button
              className={viewMode === 'list' ? 'is-active' : ''}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              ☰
            </button>
          </div>
          <button
            className="media-bin__import"
            onClick={() => void importFromDialog()}
            disabled={importing}
          >
            {importing ? 'Importing…' : '+ Import'}
          </button>
        </div>
      </header>

      {assets.length === 0 ? (
        <div className="media-bin__empty">
          <p>No media yet</p>
          <button onClick={() => void importFromDialog()} disabled={importing}>
            Import videos, photos or audio
          </button>
        </div>
      ) : (
        <div className={`media-bin__assets media-bin__assets--${viewMode}`}>
          {assets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              selected={selectedId === asset.id}
              onSelect={setSelectedId}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default MediaBin
