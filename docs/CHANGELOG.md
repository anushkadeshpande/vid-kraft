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

---

## In Progress

_Nothing currently in progress._

---

## Pending

### Phase 3: Timeline & Tracks
- [ ] 3.1 — Timeline component (ruler, playhead, scroll)
- [ ] 3.2 — Track system (video, audio, overlay)
- [ ] 3.3 — Clip placement & drag-and-drop
- [ ] 3.4 — Playhead & scrubbing

### Phase 4: Preview & Viewport
- [ ] 4.1 — Refactor Preview panel (multi-track compositing)
- [ ] 4.2 — Viewport resize (output dimensions)
- [ ] 4.3 — Multi-layer compositing on canvas

### Phase 5: Core Editing Operations
- [ ] 5.1 — Cut operation (split at playhead)
- [ ] 5.2 — Split audio/video streams
- [ ] 5.3 — Merge adjacent clips
- [ ] 5.4 — Trim/resize clip edges
- [ ] 5.5 — Delete clips

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
