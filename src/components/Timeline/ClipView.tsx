import { useRef, type MouseEvent } from 'react'
import type { Clip, MediaAsset } from '../../core/types'
import { timeToPixels } from '../../core/timeline'
import type { TrimEdge } from '../../core/operations'
import { clampVolume } from '../../core/audioMix'
import { useWaveform } from './useWaveform'
import WaveformCanvas from './WaveformCanvas'

const CLIP_HEIGHT = 44

interface ClipViewProps {
  clip: Clip
  asset?: MediaAsset
  pxPerSecond: number
  selected: boolean
  dragging: boolean
  locked: boolean
  onMouseDown: (e: MouseEvent, clip: Clip) => void
  onTrimMouseDown: (e: MouseEvent, clip: Clip, edge: TrimEdge) => void
  onVolumeChange: (clip: Clip, volume: number) => void
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
  onVolumeChange,
}: ClipViewProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const left = timeToPixels(clip.startTime, pxPerSecond)
  const width = Math.max(2, timeToPixels(clip.duration, pxPerSecond))
  const hasAudio = asset?.type === 'audio' || asset?.type === 'video'
  const peaks = useWaveform(asset)

  const className = [
    'timeline-clip',
    `timeline-clip--${asset?.type ?? 'unknown'}`,
    selected ? 'timeline-clip--selected' : '',
    dragging ? 'timeline-clip--dragging' : '',
    locked ? 'timeline-clip--locked' : '',
  ]
    .filter(Boolean)
    .join(' ')

  // Drag the volume line vertically to set the clip's gain (top = 1, bottom = 0).
  const handleVolumeMouseDown = (e: MouseEvent) => {
    e.stopPropagation()
    if (locked) return
    const rect = rootRef.current?.getBoundingClientRect()
    if (!rect) return
    const apply = (clientY: number) => {
      const v = clampVolume(1 - (clientY - rect.top) / rect.height)
      onVolumeChange(clip, v)
    }
    apply(e.clientY)
    const onMove = (ev: globalThis.MouseEvent) => apply(ev.clientY)
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <div
      ref={rootRef}
      className={className}
      style={{ left, width }}
      onMouseDown={(e) => onMouseDown(e, clip)}
      title={asset?.name ?? 'Clip'}
    >
      {hasAudio && peaks && peaks.length > 0 && (
        <WaveformCanvas
          peaks={peaks}
          sourceDuration={asset?.duration ?? 0}
          trimStart={clip.trimStart}
          duration={clip.duration}
          width={width}
          height={CLIP_HEIGHT}
        />
      )}

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

      {hasAudio && (
        <span
          className="timeline-clip__volume"
          style={{ top: `${(1 - clampVolume(clip.volume)) * 100}%` }}
          onMouseDown={handleVolumeMouseDown}
          title={`Volume ${Math.round(clampVolume(clip.volume) * 100)}%`}
          role="slider"
          aria-label="Clip volume"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(clampVolume(clip.volume) * 100)}
        />
      )}

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
