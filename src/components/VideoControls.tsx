interface VideoControlsProps {
  isPlaying: boolean
  hasVideo: boolean
  onPlayPause: () => void
  onStop: () => void
}

const VideoControls = ({ isPlaying, hasVideo, onPlayPause, onStop }: VideoControlsProps) => {
  return (
    <div style={{ 
      display: 'flex', 
      gap: '10px', 
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      backgroundColor: '#1a1a1a',
      borderRadius: '8px',
      marginTop: '20px',
      minWidth: '300px'
    }}>
      <button 
        onClick={onPlayPause}
        disabled={!hasVideo}
        style={{
          padding: '10px 20px',
          fontSize: '14px',
          cursor: hasVideo ? 'pointer' : 'not-allowed',
          backgroundColor: hasVideo ? '#4CAF50' : '#555',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          opacity: hasVideo ? 1 : 0.5
        }}
      >
        {isPlaying ? '⏸ Pause' : '▶ Play'}
      </button>
      <button 
        onClick={onStop}
        disabled={!hasVideo}
        style={{
          padding: '10px 20px',
          fontSize: '14px',
          cursor: hasVideo ? 'pointer' : 'not-allowed',
          backgroundColor: hasVideo ? '#f44336' : '#555',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          opacity: hasVideo ? 1 : 0.5
        }}
      >
        ⏹ Stop
      </button>
    </div>
  )
}

export default VideoControls
