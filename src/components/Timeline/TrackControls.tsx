import type { Track } from '../../core/types'

interface TrackControlsProps {
  track: Track
  onToggleMute: (trackId: string) => void
  onToggleLock: (trackId: string) => void
  onToggleVisible: (trackId: string) => void
  onRemove: (trackId: string) => void
}

const TYPE_ICON: Record<Track['type'], string> = {
  video: '🎬',
  audio: '🎵',
  overlay: '✦',
}

/** Left-gutter controls for a track: mute / lock / visibility / remove. */
function TrackControls({
  track,
  onToggleMute,
  onToggleLock,
  onToggleVisible,
  onRemove,
}: TrackControlsProps) {
  return (
    <div className="track-controls">
      <div className="track-controls__name" title={track.name}>
        <span className="track-controls__type" aria-hidden>
          {TYPE_ICON[track.type]}
        </span>
        {track.name}
      </div>
      <div className="track-controls__buttons">
        <button
          className={track.muted ? 'is-active' : ''}
          onClick={() => onToggleMute(track.id)}
          title={track.muted ? 'Unmute' : 'Mute'}
        >
          {track.muted ? '🔇' : '🔊'}
        </button>
        <button
          className={track.locked ? 'is-active' : ''}
          onClick={() => onToggleLock(track.id)}
          title={track.locked ? 'Unlock' : 'Lock'}
        >
          {track.locked ? '🔒' : '🔓'}
        </button>
        <button
          className={!track.visible ? 'is-active' : ''}
          onClick={() => onToggleVisible(track.id)}
          title={track.visible ? 'Hide' : 'Show'}
        >
          {track.visible ? '👁' : '🚫'}
        </button>
        <button
          className="track-controls__remove"
          onClick={() => onRemove(track.id)}
          title="Remove track"
        >
          ×
        </button>
      </div>
    </div>
  )
}

export default TrackControls
