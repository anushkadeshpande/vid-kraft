import React, { useRef, useEffect } from 'react';

const VideoCanvas = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    let animationFrameId;

    const drawFrame = () => {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      animationFrameId = requestAnimationFrame(drawFrame);
    };

    const handlePlay = () => {
      drawFrame();
    };

    const handlePause = () => {
      cancelAnimationFrame(animationFrameId);
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  return (
    <div>
      <video
        ref={videoRef}
        className="video-js vjs-default-skin"
        controls
        width="640"
        height="360"
      >
        <source src="D:\Projects\video-editor\src\test.mp4" type="video/mp4" />
        {/* Include other video formats here */}
      </video>
      <canvas ref={canvasRef} width="640" height="360" />
    </div>
  );
};

export default VideoCanvas;
