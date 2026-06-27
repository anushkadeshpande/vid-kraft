import type { MouseEvent } from 'react'
import type { Clip, MediaAsset } from '../../core/types'
import { timeToPixels } from '../../core/timeline'
import type { TrimEdge } from '../../core/operations'

interface ClipViewProps {
  clip: Clip
  asset?: MediaAsset
  pxPerSecond: number
  selected: boolean
  dragging: boolean
  locked: boolean
  onMouseDown: (e: MouseEvent, clip: Clip) => void
  onTrimMouseDown: (e: MouseEvent, clip: Clip, edge: TrimEdge) => void
}

const TYPE_ICON: Record<MediaAsset['type'], string> = {
  video: '🎬',
  audio: '🎵',
  image: '🖼️',
}

/** A single clip rendered on a track lane, positioned by its start/duration. */
function ClipView({
  clip,
  asset,
  pxPerSecond,
  selected,
  dragging,
  locked,
  onMouseDown,
  onTrimMouseDown,
}: ClipViewProps) {
  const left = timeToPixels(clip.startTime, pxPerSecond)
  const width = Math.max(2, timeToPixels(clip.duration, pxPerSecond))

  const className = [
    'timeline-clip',
    selected ? 'timeline-clip--selected' : '',
    dragging ? 'timeline-clip--dragging' : '',
    locked ? 'timeline-clip--locked' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={className}
      style={{ left, width }}
      onMouseDown={(e) => onMouseDown(e, clip)}
      title={asset?.name ?? 'Clip'}
    >
      {!locked && (
        <span
          className="timeline-clip__handle timeline-clip__handle--start"
          onMouseDown={(e) => onTrimMouseDown(e, clip, 'start')}
          aria-label="Trim start"
        />
      )}
      <span className="timeline-clip__icon" aria-hidden>
        {asset ? TYPE_ICON[asset.type] : '▦'}
      </span>
      <span className="timeline-clip__label">{asset?.name ?? 'Clip'}</span>
      {!locked && (
        <span
          className="timeline-clip__handle timeline-clip__handle--end"
          onMouseDown={(e) => onTrimMouseDown(e, clip, 'end')}
          aria-label="Trim end"
        />
      )}
    </div>
  )
}

export default ClipView
