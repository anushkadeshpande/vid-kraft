# Changelog

All notable changes to Vid Kraft will be documented in this file.

Format: `[Phase.Task] - Description (Date)`

---

## Completed

### Initial Setup (Pre-existing)
- [0.0] - Project scaffolded with Electron + React + TypeScript + Vite (Pre-existing)
- [0.1] - Basic VideoPlayer component with canvas rendering (Pre-existing)
- [0.2] - Play/Pause/Stop controls (Pre-existing)
- [0.3] - Single file import and video resize handle on canvas (Pre-existing)

### Phase 1: Foundation & Architecture
- [1.1] - Defined core types in `src/core/types.ts`: Project, Track, Clip, MediaAsset, Annotation, Viewport, TimeRange, Transform, PlaybackState, SelectionState (2026-05-18)
- [1.2] - Set up FFmpeg integration: installed `fluent-ffmpeg` + `@ffmpeg-installer/ffmpeg`, created `electron/ipc/ffmpeg.ts` (probe, thumbnail, export handlers) and `src/services/ffmpeg.ts` (renderer client) (2026-05-18)
- [1.3] - Set up Zustand state management in `src/store/projectStore.ts` with actions for tracks, clips, assets, annotations, playback, and selection (2026-05-18)
- [1.4] - Implemented Command pattern in `src/core/commands.ts` with `Command` interface, `CommandHistory` class (undo/redo stack), singleton instance (2026-05-18)
- [1.5] - Created operation registry in `src/core/registry.ts` — plugin system for self-registering operations (2026-05-18)
- [1.6] - Set up modular IPC architecture: `electron/ipc/` with ffmpeg + file handlers, updated main.ts to register handlers, updated preload with typed `window.api`, added type declarations (2026-05-18)

### Phase 2: Media Import & Management
- [2.1] - Multi-file import via `src/services/mediaImport.ts`: native file dialog, per-`MediaType` handler registry (classify/probe/thumbnail), `importFiles` skips invalid files per item; added `useMediaImport` hook and `app:getThumbnailDir` IPC handler (2026-06-27)
- [2.2] - Media Bin UI in `src/components/MediaBin/`: asset cards with thumbnail/name/type/duration/resolution, selection, per-asset removal, grid/list toggle; wired into `App.tsx` two-pane layout (2026-06-27)
- [2.3] - Thumbnail generation: video poster frame via FFmpeg, image self-thumbnail, audio placeholder; stored in OS `userData/thumbnails` (2026-06-27)

### Phase 3: Timeline & Tracks
- [3.1] - Timeline panel in `src/components/Timeline/`: scrollable time ruler with zoom (pixels-per-second), "nice" tick intervals, fixed track-header gutter; pure time↔pixel + `snap`/`snapClipStart` helpers in `src/core/timeline.ts` (2026-06-28)
- [3.2] - Track system: video/audio/overlay lanes with mute/lock/visibility controls and add/remove; media↔track compatibility registry and clip/track factories in `src/core/tracks.ts`; locked tracks reject edits (2026-06-28)
- [3.3] - Clip placement & drag-and-drop: drag assets from the Media Bin onto compatible lanes (HTML5 DnD) to create clips; reposition clips in time and move between compatible tracks via mouse drag with edge/playhead snapping (Shift disables snapping) (2026-06-28)
- [3.4] - Playhead & scrubbing: draggable playhead bound to playback `currentTime`, click-to-seek and drag-to-scrub on the ruler/lanes, current-time indicator in the toolbar (2026-06-28)

### Phase 4: Preview & Viewport
- [4.1] - `Preview` component in `src/components/Preview/` replaces the single-file `VideoPlayer`: composites the visible clip of every visible track at the playhead onto a canvas; pure `resolveClipAtTime`/`resolveVisibleLayers`/`projectDuration` helpers in `src/core/preview.ts`; rAF playback loop advances `currentTime` and reuses `VideoControls` (2026-06-28)
- [4.2] - Multi-layer z-order compositing: base tracks drawn first, overlay tracks on top (`orderTracksForDraw`), honoring each clip's `Transform` (position/scale/rotation/opacity); video frames sampled from cached hidden `<video>` elements, images drawn directly (`assetElements.ts`) (2026-06-28)
- [4.3] - Viewport configuration: `ViewportSelector` presets (1080p, 720p, 9:16, 1:1) call `setViewport`; preview fits the viewport to the available area preserving aspect ratio (`fitToViewport`) with a devicePixelRatio-scaled backing store (2026-06-28)
- [4.4] - Local media playback fix: registered a privileged `media://` protocol in the Electron main process (`electron/protocol.ts`) that streams local files with HTTP range support, so preview video frames and Media Bin thumbnails render from the dev http origin (2026-06-28)

### Phase 5: Core Editing Operations
- [5.1] - Cut at playhead (`src/core/operations/cut.ts`): `splitClip` divides a clip into two adjacent halves sharing the source (adjusted `trimStart`/`trimEnd`); boundary cuts are no-ops; undoable command (2026-06-28)
- [5.2] - Split audio/video (`src/core/operations/splitAV.ts`): `runSplitAV` demuxes a clip via the FFmpeg `ffmpeg:split` IPC into video-only and audio-only assets placed on separate tracks (creating an audio/video track when missing); undo recombines and removes created tracks/assets (2026-06-28)
- [5.3] - Merge adjacent clips (`src/core/operations/merge.ts`): `planMerge` validates same-track adjacency, `runMerge` concatenates trimmed segments via the FFmpeg `ffmpeg:concat` IPC into one rendered clip; non-adjacent selections are rejected; undoable (2026-06-28)
- [5.4] - Trim/resize clip edges (`src/core/operations/trim.ts`): pure `computeTrim` adjusts `startTime`/`duration`/`trimStart`/`trimEnd` clamped to source bounds and a minimum duration; drag clip edge handles in the timeline; undoable (2026-06-28)
- [5.5] - Delete clips (`src/core/operations/delete.ts`): removes selected clips, undo restores them on their original tracks; operations self-register with the registry and run through `CommandHistory`; toolbar buttons + keyboard shortcuts (S, Del, Ctrl+Z/Y) wired in the timeline (2026-06-28)

---

## In Progress

_Nothing currently in progress._

---

## Pending

### Phase 6: Audio
- [ ] 6.1 — Audio track with waveform rendering
- [ ] 6.2 — Add custom audio to timeline
- [ ] 6.3 — Audio overlap/mixing
- [ ] 6.4 — Per-clip volume control

### Phase 7: Overlays & Annotations
- [ ] 7.1 — Image/video overlay on tracks
- [ ] 7.2 — Annotation tools (draw, rect, arrow, text)
- [ ] 7.3 — Annotation rendering & export burn-in

### Phase 8: Export & Project Management
- [ ] 8.1 — FFmpeg export pipeline (full render)
- [ ] 8.2 — Project save/load (JSON)
- [ ] 8.3 — Export progress UI

### Phase 9: Polish & UX
- [ ] 9.1 — Keyboard shortcuts
- [ ] 9.2 — Undo/Redo UI
- [ ] 9.3 — Responsive resizable layout
- [ ] 9.4 — Dark theme polish
