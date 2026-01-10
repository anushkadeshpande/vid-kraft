import { useRef, useEffect, useState } from 'react'

const VideoPlayer = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [videoSrc, setVideoSrc] = useState<string>('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  const [videoSize, setVideoSize] = useState({ width: 640, height: 360, x: 0, y: 0 })
  const animationFrameRef = useRef<number>()
  const isResizingRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const video = videoRef.current
    
    if (!canvas || !video || !videoSrc) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Adjust canvas size when video metadata loads
    const handleLoadedMetadata = () => {
      const containerWidth = window.innerWidth * 0.9
      const containerHeight = window.innerHeight * 0.9
      
      // Set canvas to fixed size (90% of screen)
      canvas.width = containerWidth
      canvas.height = containerHeight
      setCanvasSize({ width: containerWidth, height: containerHeight })
      
      // Initialize video size to fit in canvas
      const aspectRatio = video.videoWidth / video.videoHeight
      let videoWidth = video.videoWidth
      let videoHeight = video.videoHeight
      
      if (videoWidth > containerWidth || videoHeight > containerHeight) {
        if (videoWidth / containerWidth > videoHeight / containerHeight) {
          videoWidth = containerWidth
          videoHeight = videoWidth / aspectRatio
        } else {
          videoHeight = containerHeight
          videoWidth = videoHeight * aspectRatio
        }
      }
      
      // Center the video
      const x = (containerWidth - videoWidth) / 2
      const y = (containerHeight - videoHeight) / 2
      
      setVideoSize({ width: videoWidth, height: videoHeight, x, y })
    }

    const renderFrame = () => {
      if (!video.paused && !video.ended) {
        // Clear canvas with black background
        ctx.fillStyle = '#000'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        // Draw video at specific position and size
        ctx.drawImage(video, videoSize.x, videoSize.y, videoSize.width, videoSize.height)
        animationFrameRef.current = requestAnimationFrame(renderFrame)
      }
    }

    const handlePlay = () => {
      setIsPlaying(true)
      renderFrame()
    }

    const handlePause = () => {
      setIsPlaying(false)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handlePause)
    
    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handlePause)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [videoSrc, videoSize])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file)
      setVideoSrc(url)
    }
  }

  const togglePlayPause = () => {
    const video = videoRef.current
    if (!video) return
    
    if (video.paused) {
      video.play()
    } else {
      video.pause()
    }
  }

  const handleResize = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    isResizingRef.current = true
    
    const startX = e.clientX
    // const startY = e.clientY
    const startWidth = videoSize.width
    const startHeight = videoSize.height
    const aspectRatio = startWidth / startHeight

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isResizingRef.current) return
      
      const deltaX = moveEvent.clientX - startX
      
      // Calculate new dimensions maintaining aspect ratio
      let newWidth = startWidth + deltaX
      let newHeight = newWidth / aspectRatio
      
      // Enforce minimum size
      if (newWidth < 160) {
        newWidth = 160
        newHeight = newWidth / aspectRatio
      }
      
      // Enforce maximum size (canvas bounds)
      if (newWidth > canvasSize.width) {
        newWidth = canvasSize.width
        newHeight = newWidth / aspectRatio
      }
      
      if (newHeight > canvasSize.height) {
        newHeight = canvasSize.height
        newWidth = newHeight * aspectRatio
      }
      
      // Center the video
      const x = (canvasSize.width - newWidth) / 2
      const y = (canvasSize.height - newHeight) / 2
      
      setVideoSize({ width: newWidth, height: newHeight, x, y })
      
      // Redraw current frame
      const canvas = canvasRef.current
      const video = videoRef.current
      const ctx = canvas?.getContext('2d')
      
      if (ctx && video && canvas) {
        ctx.fillStyle = '#000'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(video, x, y, newWidth, newHeight)
      }
    }

    const handleMouseUp = () => {
      isResizingRef.current = false
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div style={{ 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      height: '100vh',
      boxSizing: 'border-box'
    }}>
      
      <div style={{ marginBottom: '20px' }}>
        <input 
          type="file" 
          accept="video/*" 
          onChange={handleFileSelect}
        />
      </div>

      <div 
        ref={containerRef}
        style={{ 
          position: 'relative',
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '20px',
          backgroundColor: '#000',
          padding: '10px',
          width: 'fit-content'
        }}
      >
        <canvas 
          ref={canvasRef} 
          width={canvasSize.width}
          height={canvasSize.height}
          style={{ 
            display: 'block',
            border: '1px solid #333'
          }}
        />
        {videoSrc && (
          <div
            onMouseDown={handleResize}
            style={{
              position: 'absolute',
              left: `${videoSize.x + videoSize.width - 15}px`,
              top: `${videoSize.y + videoSize.height - 15}px`,
              width: '20px',
              height: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              cursor: 'nwse-resize',
              borderRadius: '0 0 3px 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              userSelect: 'none',
              border: '1px solid rgba(255, 255, 255, 0.9)'
            }}
          >
            ⋰
          </div>
        )}
        <video 
          ref={videoRef} 
          src={videoSrc}
          style={{ display: 'none' }}
        />
      </div>

      {videoSrc && (
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          justifyContent: 'center' 
        }}>
          <button onClick={togglePlayPause}>
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button onClick={() => {
            if (videoRef.current) {
              videoRef.current.currentTime = 0
              videoRef.current.pause()
            }
          }}>
            Stop
          </button>
        </div>
      )}
    </div>
  )
}

export default VideoPlayer