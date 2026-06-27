import type { DragEvent, MouseEvent } from 'react'
import type { Clip, Id, MediaAsset, Track } from '../../core/types'
import { pixelsToTime } from '../../core/timeline'
import { ASSET_DND_MIME } from './dnd'
import ClipView from './ClipView'
import type { TrimEdge } from '../../core/operations'

interface TrackLaneProps {
  track: Track
  pxPerSecond: number
  contentWidth: number
  assetsById: Map<Id, MediaAsset>
  selectedClipIds: Id[]
  draggingClipId: Id | null
  dropTargetTrackId: Id | null
  registerLane: (trackId: Id, el: HTMLDivElement | null) => void
  onDropAsset: (trackId: Id, assetId: Id, time: number) => void
  onClipMouseDown: (e: MouseEvent, clip: Clip) => void
  onClipTrimMouseDown: (e: MouseEvent, clip: Clip, edge: TrimEdge) => void
}

/** One track lane: accepts asset drops and renders the clips it holds. */
function TrackLane({
  track,
  pxPerSecond,
  contentWidth,
  assetsById,
  selectedClipIds,
  draggingClipId,
  dropTargetTrackId,
  registerLane,
  onDropAsset,
  onClipMouseDown,
  onClipTrimMouseDown,
}: TrackLaneProps) {
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    if (track.locked) return
    if (e.dataTransfer.types.includes(ASSET_DND_MIME)) {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'copy'
    }
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    if (track.locked) return
    const assetId = e.dataTransfer.getData(ASSET_DND_MIME)
    if (!assetId) return
    e.preventDefault()
    const rect = e.currentTarget.getBoundingClientRect()
    const time = pixelsToTime(e.clientX - rect.left, pxPerSecond)
    onDropAsset(track.id, assetId, Math.max(0, time))
  }

  const className = [
    'timeline-lane',
    `timeline-lane--${track.type}`,
    track.locked ? 'timeline-lane--locked' : '',
    dropTargetTrackId === track.id ? 'timeline-lane--drop' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={className}
      style={{ width: contentWidth }}
      ref={(el) => registerLane(track.id, el)}
      data-track-id={track.id}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {track.clips.map((clip) => (
        <ClipView
          key={clip.id}
          clip={clip}
          asset={assetsById.get(clip.assetId)}
          pxPerSecond={pxPerSecond}
          selected={selectedClipIds.includes(clip.id)}
          dragging={draggingClipId === clip.id}
          locked={track.locked}
          onMouseDown={onClipMouseDown}
          onTrimMouseDown={onClipTrimMouseDown}
        />
      ))}
    </div>
  )
}

export default TrackLane
