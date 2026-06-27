import { useState } from 'react'
import type { DragEvent } from 'react'
import type { MediaAsset } from '../../core/types'
import { ASSET_DND_MIME } from '../Timeline'
import { formatDuration, formatFileSize, formatResolution, toFileUrl } from './format'

interface AssetCardProps {
  asset: MediaAsset
  selected: boolean
  onSelect: (id: string) => void
  onRemove: (id: string) => void
}

const TYPE_ICON: Record<MediaAsset['type'], string> = {
  video: '🎬',
  audio: '🎵',
  image: '🖼️',
}

function AssetCard({ asset, selected, onSelect, onRemove }: AssetCardProps) {
  const [thumbFailed, setThumbFailed] = useState(false)
  const hasThumb = !!asset.thumbnailPath && !thumbFailed

  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData(ASSET_DND_MIME, asset.id)
    e.dataTransfer.effectAllowed = 'copy'
  }

  return (
    <div
      className={`asset-card${selected ? ' asset-card--selected' : ''}`}
      onClick={() => onSelect(asset.id)}
      draggable
      onDragStart={handleDragStart}
      role="button"
      tabIndex={0}
      title={asset.name}
    >
      <div className="asset-card__thumb">
        {hasThumb ? (
          <img
            src={toFileUrl(asset.thumbnailPath!)}
            alt={asset.name}
            onError={() => setThumbFailed(true)}
            draggable={false}
          />
        ) : (
          <span className="asset-card__placeholder" aria-hidden>
            {TYPE_ICON[asset.type]}
          </span>
        )}
        <span className="asset-card__badge">{asset.type}</span>
        <button
          className="asset-card__remove"
          title="Remove"
          onClick={(e) => {
            e.stopPropagation()
            onRemove(asset.id)
          }}
        >
          ×
        </button>
      </div>

      <div className="asset-card__meta">
        <div className="asset-card__name">{asset.name}</div>
        <div className="asset-card__details">
          {asset.type !== 'image' && <span>{formatDuration(asset.duration)}</span>}
          {asset.type !== 'audio' && <span>{formatResolution(asset)}</span>}
          <span>{formatFileSize(asset.fileSize)}</span>
        </div>
      </div>
    </div>
  )
}

export default AssetCard
