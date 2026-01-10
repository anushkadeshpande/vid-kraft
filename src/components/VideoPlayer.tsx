import { useRef, useEffect, useState } from 'react'

const VideoPlayer = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoSrc, setVideoSrc] = useState<string>('')

  useEffect(() => {
    const canvas = canvasRef.current
    const video = videoRef.current
    
    if (!canvas || !video || !videoSrc) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const renderFrame = () => {
      if (video.paused || video.ended) return
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      requestAnimationFrame(renderFrame)
    }

    video.addEventListener('play', renderFrame)
    
    return () => {
      video.removeEventListener('play', renderFrame)
    }
  }, [videoSrc])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file)
      setVideoSrc(url)
    }
  }

  return (
    <div>

            <h1>Video Editor</h1>
      
      <div className="controls">
        <input 
          type="file" 
          accept="video/*" 
          onChange={handleFileSelect}
        />
      </div>

      <div className="video-container">
        <canvas 
          ref={canvasRef} 
          width={1280} 
          height={720}
          className="video-canvas"
        />
        <video 
          ref={videoRef} 
          src={videoSrc}
          controls
          style={{ display: 'none' }}
        />
      </div>

      {videoSrc && (
        <div className="playback-controls">
          <button onClick={() => videoRef.current?.play()}>Play</button>
          <button onClick={() => videoRef.current?.pause()}>Pause</button>
        </div>
      )}

    </div>
  )
}

export default VideoPlayer