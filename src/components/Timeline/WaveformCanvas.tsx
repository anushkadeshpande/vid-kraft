import { useEffect, useRef } from 'react'
import { bucketPeaks, slicePeaks } from '../../core/waveform'

interface WaveformCanvasProps {
  /** Full-source normalized peaks (0..1). */
  peaks: number[]
  /** Total source duration the peaks span (seconds). */
  sourceDuration: number
  /** Offset into the source where the clip begins (seconds). */
  trimStart: number
  /** Visible clip length (seconds). */
  duration: number
  /** Render width in CSS pixels. */
  width: number
  /** Render height in CSS pixels. */
  height: number
  color?: string
}

/** Draws an audio clip's waveform, scaled to its current pixel width and trim. */
function WaveformCanvas({
  peaks,
  sourceDuration,
  trimStart,
  duration,
  width,
  height,
  color = 'rgba(255, 255, 255, 0.45)',
}: WaveformCanvasProps) {
  const ref = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const w = Math.max(1, Math.floor(width))
    const h = Math.max(1, Math.floor(height))
    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.floor(w * dpr)
    canvas.height = Math.floor(h * dpr)
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)

    const slice = slicePeaks(peaks, sourceDuration, trimStart, duration)
    const buckets = bucketPeaks(slice, w)
    ctx.fillStyle = color
    const mid = h / 2
    for (let x = 0; x < buckets.length; x++) {
      const amp = Math.min(1, buckets[x]) * mid
      ctx.fillRect(x, mid - amp, 1, Math.max(1, amp * 2))
    }
  }, [peaks, sourceDuration, trimStart, duration, width, height, color])

  return (
    <canvas
      ref={ref}
      className="timeline-clip__waveform"
      style={{ width, height }}
      aria-hidden
    />
  )
}

export default WaveformCanvas
