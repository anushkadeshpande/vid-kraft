import { useCallback, useEffect, useRef, useState } from 'react'
import { useProjectStore } from '../../store/projectStore'
import type { Id, Viewport } from '../../core/types'
import {
  fitToViewport,
  projectDuration,
  resolveVisibleLayers,
} from '../../core/preview'
import { formatDuration } from '../MediaBin/format'
import VideoControls from '../VideoControls'
import ViewportSelector from './ViewportSelector'
import { createElementForAsset, drawLayer, type DrawableElement } from './assetElements'
import './Preview.css'

function formatTimecode(seconds: number): string {
  const total = Math.max(0, seconds)
  const m = Math.floor(total / 60)
  const s = Math.floor(total % 60)
  const cs = Math.floor((total % 1) * 100)
  return `${m}:${s.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0')}`
}

function Preview() {
  const viewport = useProjectStore((s) => s.project.viewport)
  const assets = useProjectStore((s) => s.project.assets)
  const tracks = useProjectStore((s) => s.project.tracks)
  const isPlaying = useProjectStore((s) => s.playback.isPlaying)
  const currentTime = useProjectStore((s) => s.playback.currentTime)
  const setViewport = useProjectStore((s) => s.setViewport)
  const setPlaying = useProjectStore((s) => s.setPlaying)
  const setCurrentTime = useProjectStore((s) => s.setCurrentTime)
  const setDuration = useProjectStore((s) => s.setDuration)

  const stageRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const elements = useRef<Map<Id, DrawableElement>>(new Map())
  const [available, setAvailable] = useState({ width: 0, height: 0 })

  const duration = projectDuration(tracks)

  /** Composite the frame at `time` onto the canvas (reads live store state). */
  const drawAt = useCallback((time: number) => {
    const canvas = canvasRef.current
    const stage = stageRef.current
    if (!canvas || !stage) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const state = useProjectStore.getState()
    const vp = state.project.viewport
    const fit = fitToViewport(vp, {
      width: stage.clientWidth,
      height: stage.clientHeight,
    })
    if (fit.width <= 0 || fit.height <= 0) return

    const dpr = window.devicePixelRatio || 1
    const backW = Math.max(1, Math.round(fit.width * dpr))
    const backH = Math.max(1, Math.round(fit.height * dpr))
    if (canvas.width !== backW) canvas.width = backW
    if (canvas.height !== backH) canvas.height = backH
    canvas.style.width = `${fit.width}px`
    canvas.style.height = `${fit.height}px`

    // Map drawing coordinates to viewport space (0..vp.width, 0..vp.height).
    const unit = (fit.width / vp.width) * dpr
    ctx.setTransform(unit, 0, 0, unit, 0, 0)
    ctx.clearRect(0, 0, vp.width, vp.height)
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, vp.width, vp.height)

    const playing = state.playback.isPlaying
    const layers = resolveVisibleLayers(state.project.tracks, time)
    for (const layer of layers) {
      const el = elements.current.get(layer.clip.assetId)
      if (!el) continue
      if (el instanceof HTMLVideoElement && !playing) {
        if (Math.abs(el.currentTime - layer.sourceTime) > 0.05) {
          try {
            el.currentTime = layer.sourceTime
          } catch {
            /* seeking before metadata is ready — ignored */
          }
        }
      }
      drawLayer(ctx, el, layer.clip.transform, vp)
    }
  }, [])

  // Keep the drawable-element cache in sync with the project's assets.
  useEffect(() => {
    const cache = elements.current
    const ids = new Set(assets.map((a) => a.id))
    for (const asset of assets) {
      if (!cache.has(asset.id)) {
        const el = createElementForAsset(asset)
        if (el) cache.set(asset.id, el)
      }
    }
    for (const id of [...cache.keys()]) {
      if (!ids.has(id)) cache.delete(id)
    }
    drawAt(useProjectStore.getState().playback.currentTime)
  }, [assets, drawAt])

  // Track the available stage size for fit-to-viewport.
  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const update = () => setAvailable({ width: stage.clientWidth, height: stage.clientHeight })
    update()
    const observer = new ResizeObserver(update)
    observer.observe(stage)
    return () => observer.disconnect()
  }, [])

  // Publish the project duration to playback state.
  useEffect(() => {
    setDuration(duration)
  }, [duration, setDuration])

  // Redraw when paused/scrubbing; seek videos and redraw once seeking settles.
  useEffect(() => {
    if (isPlaying) return
    drawAt(currentTime)
    const layers = resolveVisibleLayers(tracks, currentTime)
    const cleanups: Array<() => void> = []
    for (const layer of layers) {
      const el = elements.current.get(layer.clip.assetId)
      if (el instanceof HTMLVideoElement) {
        const onSeeked = () => drawAt(useProjectStore.getState().playback.currentTime)
        el.addEventListener('seeked', onSeeked, { once: true })
        cleanups.push(() => el.removeEventListener('seeked', onSeeked))
      }
    }
    return () => cleanups.forEach((c) => c())
  }, [currentTime, isPlaying, tracks, viewport, available, drawAt])

  // Playback loop: advance currentTime and draw each animation frame.
  useEffect(() => {
    if (!isPlaying) return
    if (duration <= 0) {
      setPlaying(false)
      return
    }

    // Sync and start the videos that are visible at the current time.
    const startLayers = resolveVisibleLayers(tracks, useProjectStore.getState().playback.currentTime)
    for (const layer of startLayers) {
      const el = elements.current.get(layer.clip.assetId)
      if (el instanceof HTMLVideoElement) {
        try {
          el.currentTime = layer.sourceTime
        } catch {
          /* ignored */
        }
        void el.play().catch(() => undefined)
      }
    }

    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      const state = useProjectStore.getState()
      const dur = projectDuration(state.project.tracks)
      let next = state.playback.currentTime + dt
      if (next >= dur) {
        next = dur
        state.setCurrentTime(next)
        state.setPlaying(false)
        drawAt(next)
        return
      }
      state.setCurrentTime(next)
      drawAt(next)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      for (const el of elements.current.values()) {
        if (el instanceof HTMLVideoElement) el.pause()
      }
    }
  }, [isPlaying, duration, tracks, setPlaying, drawAt])

  const handlePlayPause = () => setPlaying(!isPlaying)
  const handleStop = () => {
    setPlaying(false)
    setCurrentTime(0)
  }
  const handleViewportChange = (next: Viewport) => setViewport(next)

  return (
    <div className="preview">
      <header className="preview__toolbar">
        <span className="preview__time">
          {formatTimecode(currentTime)} / {formatDuration(duration)}
        </span>
        <div className="preview__spacer" />
        <ViewportSelector viewport={viewport} onChange={handleViewportChange} />
      </header>

      <div className="preview__stage" ref={stageRef}>
        <canvas ref={canvasRef} className="preview__canvas" />
      </div>

      <VideoControls
        isPlaying={isPlaying}
        hasVideo={duration > 0}
        onPlayPause={handlePlayPause}
        onStop={handleStop}
      />
    </div>
  )
}

export default Preview
