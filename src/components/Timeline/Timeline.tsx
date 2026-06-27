import { useEffect, useMemo, useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import { useProjectStore } from '../../store/projectStore'
import type { Clip, Id, TrackType } from '../../core/types'
import { pixelsToTime, snap, snapClipStart, timeToPixels } from '../../core/timeline'
import { createClipFromAsset, createTrack, isAssetCompatibleWithTrack } from '../../core/tracks'
import { commandHistory } from '../../core/commands'
import {
  storeEditingContext,
  createCutCommand,
  createDeleteCommand,
  createTrimCommand,
  computeTrim,
  runMerge,
  runSplitAV,
  type TrimEdge,
} from '../../core/operations'
import { concatClips, splitStreams } from '../../services/ffmpeg'
import TimeRuler from './TimeRuler'
import TrackLane from './TrackLane'
import TrackControls from './TrackControls'
import Playhead from './Playhead'
import './Timeline.css'

const DEFAULT_PX_PER_SECOND = 50
const MIN_PX_PER_SECOND = 10
const MAX_PX_PER_SECOND = 200
const MIN_CONTENT_SECONDS = 30
const CONTENT_PADDING_SECONDS = 10
const SNAP_THRESHOLD_PX = 8

interface ClipDrag {
  clipId: Id
  sourceTrackId: Id
  duration: number
  /** Pixels between the clip's left edge and the grab point. */
  grabOffsetPx: number
  /** Snap candidate times (other clip edges, playhead, origin). */
  candidates: number[]
}

function formatTime(seconds: number): string {
  const total = Math.max(0, seconds)
  const m = Math.floor(total / 60)
  const s = Math.floor(total % 60)
  const cs = Math.floor((total % 1) * 100)
  return `${m}:${s.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0')}`
}

function Timeline() {
  const tracks = useProjectStore((s) => s.project.tracks)
  const assets = useProjectStore((s) => s.project.assets)
  const currentTime = useProjectStore((s) => s.playback.currentTime)
  const selectedClipIds = useProjectStore((s) => s.selection.selectedClipIds)
  const viewport = useProjectStore((s) => s.project.viewport)

  const addTrack = useProjectStore((s) => s.addTrack)
  const removeTrack = useProjectStore((s) => s.removeTrack)
  const updateTrack = useProjectStore((s) => s.updateTrack)
  const addClip = useProjectStore((s) => s.addClip)
  const removeClip = useProjectStore((s) => s.removeClip)
  const updateClip = useProjectStore((s) => s.updateClip)
  const setCurrentTime = useProjectStore((s) => s.setCurrentTime)
  const setSelectedClips = useProjectStore((s) => s.setSelectedClips)

  const [pxPerSecond, setPxPerSecond] = useState(DEFAULT_PX_PER_SECOND)
  const [draggingClipId, setDraggingClipId] = useState<Id | null>(null)
  const [dropTargetTrackId, setDropTargetTrackId] = useState<Id | null>(null)
  // Bumped after each command so undo/redo button state re-renders.
  const [, setHistoryTick] = useState(0)
  const bumpHistory = () => setHistoryTick((t) => t + 1)

  const ctx = useMemo(() => storeEditingContext(), [])

  const contentRef = useRef<HTMLDivElement | null>(null)
  const laneEls = useRef<Map<Id, HTMLDivElement>>(new Map())
  const clipDrag = useRef<ClipDrag | null>(null)

  const assetsById = useMemo(() => {
    const map = new Map<Id, (typeof assets)[number]>()
    for (const a of assets) map.set(a.id, a)
    return map
  }, [assets])

  const contentSeconds = useMemo(() => {
    let maxEnd = 0
    for (const t of tracks) {
      for (const c of t.clips) maxEnd = Math.max(maxEnd, c.startTime + c.duration)
    }
    return Math.max(MIN_CONTENT_SECONDS, maxEnd + CONTENT_PADDING_SECONDS)
  }, [tracks])

  const contentWidth = timeToPixels(contentSeconds, pxPerSecond)

  const registerLane = (trackId: Id, el: HTMLDivElement | null) => {
    if (el) laneEls.current.set(trackId, el)
    else laneEls.current.delete(trackId)
  }

  const timeFromClientX = (clientX: number): number => {
    const rect = contentRef.current?.getBoundingClientRect()
    if (!rect) return 0
    return Math.max(0, pixelsToTime(clientX - rect.left, pxPerSecond))
  }

  // ----- Tracks -----
  const handleAddTrack = (type: TrackType) => addTrack(createTrack(type))
  const handleToggleMute = (id: Id) =>
    updateTrack(id, { muted: !tracks.find((t) => t.id === id)?.muted })
  const handleToggleLock = (id: Id) =>
    updateTrack(id, { locked: !tracks.find((t) => t.id === id)?.locked })
  const handleToggleVisible = (id: Id) =>
    updateTrack(id, { visible: !tracks.find((t) => t.id === id)?.visible })

  // ----- Asset drop -> create clip -----
  const handleDropAsset = (trackId: Id, assetId: Id, time: number) => {
    const track = tracks.find((t) => t.id === trackId)
    const asset = assetsById.get(assetId)
    if (!track || !asset || track.locked) return
    if (!isAssetCompatibleWithTrack(asset.type, track.type)) return
    const candidates = collectCandidates(null)
    const threshold = SNAP_THRESHOLD_PX / pxPerSecond
    const start = snap(time, candidates, threshold)
    const clip = createClipFromAsset(asset, trackId, start, viewport)
    addClip(trackId, clip)
    setSelectedClips([clip.id])
  }

  // ----- Snap candidates (edges of all clips except `excludeId`, plus playhead/origin) -----
  const collectCandidates = (excludeId: Id | null): number[] => {
    const values: number[] = [0, currentTime]
    for (const t of tracks) {
      for (const c of t.clips) {
        if (c.id === excludeId) continue
        values.push(c.startTime, c.startTime + c.duration)
      }
    }
    return values
  }

  // ----- Scrubbing / seeking -----
  const startScrub = (e: MouseEvent) => {
    if (e.button !== 0) return
    setCurrentTime(timeFromClientX(e.clientX))
    const onMove = (ev: globalThis.MouseEvent) => setCurrentTime(timeFromClientX(ev.clientX))
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  // ----- Clip drag (reposition + cross-track move) -----
  const handleClipMouseDown = (e: MouseEvent, clip: Clip) => {
    e.stopPropagation()
    const track = tracks.find((t) => t.id === clip.trackId)
    if (!track || track.locked) return

    const rect = contentRef.current?.getBoundingClientRect()
    if (!rect) return
    const clipLeftPx = timeToPixels(clip.startTime, pxPerSecond)
    const grabOffsetPx = e.clientX - rect.left - clipLeftPx

    clipDrag.current = {
      clipId: clip.id,
      sourceTrackId: clip.trackId,
      duration: clip.duration,
      grabOffsetPx,
      candidates: collectCandidates(clip.id),
    }
    setDraggingClipId(clip.id)
    setSelectedClips([clip.id])

    const onMove = (ev: globalThis.MouseEvent) => {
      const drag = clipDrag.current
      const cRect = contentRef.current?.getBoundingClientRect()
      if (!drag || !cRect) return

      const rawStart = Math.max(
        0,
        pixelsToTime(ev.clientX - cRect.left - drag.grabOffsetPx, pxPerSecond)
      )
      const start = ev.shiftKey
        ? rawStart
        : snapClipStart(rawStart, drag.duration, drag.candidates, SNAP_THRESHOLD_PX / pxPerSecond)

      updateClip(drag.sourceTrackId, drag.clipId, { startTime: Math.max(0, start) })
      setDropTargetTrackId(laneAtClientY(ev.clientY))
    }

    const onUp = (ev: globalThis.MouseEvent) => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      const drag = clipDrag.current
      clipDrag.current = null
      setDraggingClipId(null)
      setDropTargetTrackId(null)
      if (!drag) return

      const targetId = laneAtClientY(ev.clientY)
      if (targetId && targetId !== drag.sourceTrackId) {
        moveClipToTrack(drag.clipId, drag.sourceTrackId, targetId)
      }
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const laneAtClientY = (clientY: number): Id | null => {
    for (const [trackId, el] of laneEls.current) {
      const r = el.getBoundingClientRect()
      if (clientY >= r.top && clientY <= r.bottom) return trackId
    }
    return null
  }

  const moveClipToTrack = (clipId: Id, sourceTrackId: Id, targetTrackId: Id) => {
    const source = tracks.find((t) => t.id === sourceTrackId)
    const target = tracks.find((t) => t.id === targetTrackId)
    const clip = source?.clips.find((c) => c.id === clipId)
    if (!source || !target || !clip || target.locked) return
    const asset = assetsById.get(clip.assetId)
    if (asset && !isAssetCompatibleWithTrack(asset.type, target.type)) return
    removeClip(sourceTrackId, clipId)
    addClip(targetTrackId, { ...clip, trackId: targetTrackId })
  }

  const zoomBy = (factor: number) =>
    setPxPerSecond((p) => Math.min(MAX_PX_PER_SECOND, Math.max(MIN_PX_PER_SECOND, p * factor)))

  // ----- Editing operations (undoable via command history) -----
  const handleCut = () => {
    const id = selectedClipIds[0]
    if (!id) return
    commandHistory.execute(createCutCommand(ctx, id, currentTime))
    bumpHistory()
  }

  const handleDelete = () => {
    if (selectedClipIds.length === 0) return
    commandHistory.execute(createDeleteCommand(ctx, selectedClipIds))
    setSelectedClips([])
    bumpHistory()
  }

  const handleMerge = async () => {
    if (selectedClipIds.length < 2) return
    const outputDir = (await window.ipcRenderer.invoke('app:getMediaDir')) as string
    const cmd = await runMerge(ctx, selectedClipIds, (segments) =>
      concatClips(segments, outputDir)
    )
    if (cmd) {
      commandHistory.execute(cmd)
      setSelectedClips([])
      bumpHistory()
    }
  }

  const handleSplitAV = async () => {
    const id = selectedClipIds[0]
    if (!id) return
    const outputDir = (await window.ipcRenderer.invoke('app:getMediaDir')) as string
    const cmd = await runSplitAV(ctx, id, (input) => splitStreams(input, outputDir))
    if (cmd) {
      commandHistory.execute(cmd)
      bumpHistory()
    }
  }

  const handleUndo = () => {
    commandHistory.undo()
    bumpHistory()
  }
  const handleRedo = () => {
    commandHistory.redo()
    bumpHistory()
  }

  // ----- Trim by dragging a clip edge -----
  const handleClipTrimMouseDown = (e: MouseEvent, clip: Clip, edge: TrimEdge) => {
    e.stopPropagation()
    const track = tracks.find((t) => t.id === clip.trackId)
    if (!track || track.locked) return

    const startX = e.clientX
    const sourceDuration = assetsById.get(clip.assetId)?.duration ?? 0
    const original = {
      startTime: clip.startTime,
      duration: clip.duration,
      trimStart: clip.trimStart,
      trimEnd: clip.trimEnd,
    }
    setDraggingClipId(clip.id)
    setSelectedClips([clip.id])

    const onMove = (ev: globalThis.MouseEvent) => {
      const delta = pixelsToTime(ev.clientX - startX, pxPerSecond)
      const next = computeTrim({ ...clip, ...original }, sourceDuration, edge, delta)
      updateClip(clip.trackId, clip.id, next)
    }

    const onUp = (ev: globalThis.MouseEvent) => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      setDraggingClipId(null)
      const delta = pixelsToTime(ev.clientX - startX, pxPerSecond)
      // Revert the live preview, then re-apply through the undoable command.
      updateClip(clip.trackId, clip.id, original)
      if (Math.abs(delta) > 1e-4) {
        commandHistory.execute(createTrimCommand(ctx, clip.id, edge, delta))
        bumpHistory()
      }
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  // ----- Per-clip volume (audio/video) -----
  const handleClipVolumeChange = (clip: Clip, volume: number) => {
    updateClip(clip.trackId, clip.id, { volume })
  }

  // ----- Keyboard shortcuts -----
  useEffect(() => {
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) handleRedo()
        else handleUndo()
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault()
        handleRedo()
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedClipIds.length > 0) {
          e.preventDefault()
          handleDelete()
        }
      } else if (e.key.toLowerCase() === 's' && !e.ctrlKey && !e.metaKey) {
        if (selectedClipIds.length > 0) {
          e.preventDefault()
          handleCut()
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClipIds, currentTime])

  const selectionCount = selectedClipIds.length

  return (
    <section className="timeline">
      <header className="timeline__toolbar">
        <span className="timeline__time">{formatTime(currentTime)}</span>
        <div className="timeline__edit" role="group" aria-label="Edit">
          <button onClick={handleCut} disabled={selectionCount !== 1} title="Cut at playhead (S)">
            Cut
          </button>
          <button onClick={handleSplitAV} disabled={selectionCount !== 1} title="Split audio/video">
            Split A/V
          </button>
          <button onClick={handleMerge} disabled={selectionCount < 2} title="Merge adjacent clips">
            Merge
          </button>
          <button onClick={handleDelete} disabled={selectionCount === 0} title="Delete (Del)">
            Delete
          </button>
          <button onClick={handleUndo} disabled={!commandHistory.canUndo} title="Undo (Ctrl+Z)">
            Undo
          </button>
          <button onClick={handleRedo} disabled={!commandHistory.canRedo} title="Redo (Ctrl+Y)">
            Redo
          </button>
        </div>
        <div className="timeline__spacer" />
        <div className="timeline__add">
          <button onClick={() => handleAddTrack('video')}>+ Video</button>
          <button onClick={() => handleAddTrack('audio')}>+ Audio</button>
          <button onClick={() => handleAddTrack('overlay')}>+ Overlay</button>
        </div>
        <div className="timeline__zoom" role="group" aria-label="Zoom">
          <button onClick={() => zoomBy(1 / 1.5)} title="Zoom out">
            −
          </button>
          <button onClick={() => zoomBy(1.5)} title="Zoom in">
            +
          </button>
        </div>
      </header>

      <div className="timeline__main">
        <div className="timeline__gutter">
          <div className="timeline__gutter-ruler" />
          {tracks.map((track) => (
            <TrackControls
              key={track.id}
              track={track}
              onToggleMute={handleToggleMute}
              onToggleLock={handleToggleLock}
              onToggleVisible={handleToggleVisible}
              onRemove={removeTrack}
            />
          ))}
        </div>

        <div className="timeline__scroll">
          <div className="timeline__content" ref={contentRef} style={{ width: contentWidth }}>
            <div className="timeline__ruler-row" onMouseDown={startScrub}>
              <TimeRuler pxPerSecond={pxPerSecond} contentWidth={contentWidth} />
            </div>

            <div className="timeline__lanes" onMouseDown={startScrub}>
              {tracks.length === 0 ? (
                <div className="timeline__empty">Add a track, then drag media here</div>
              ) : (
                tracks.map((track) => (
                  <TrackLane
                    key={track.id}
                    track={track}
                    pxPerSecond={pxPerSecond}
                    contentWidth={contentWidth}
                    assetsById={assetsById}
                    selectedClipIds={selectedClipIds}
                    draggingClipId={draggingClipId}
                    dropTargetTrackId={dropTargetTrackId}
                    registerLane={registerLane}
                    onDropAsset={handleDropAsset}
                    onClipMouseDown={handleClipMouseDown}
                    onClipTrimMouseDown={handleClipTrimMouseDown}
                    onClipVolumeChange={handleClipVolumeChange}
                  />
                ))
              )}
            </div>

            <Playhead
              currentTime={currentTime}
              pxPerSecond={pxPerSecond}
              onGrab={startScrub}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Timeline
