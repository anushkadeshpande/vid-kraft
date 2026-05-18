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

---

## In Progress

_Nothing currently in progress._

---

## Pending

### Phase 1: Foundation & Architecture
- [ ] 1.1 — Define core types (`src/core/types.ts`)
- [ ] 1.2 — Set up FFmpeg integration (install + IPC wrapper)
- [ ] 1.3 — Set up state management (Zustand store)
- [ ] 1.4 — Implement Command pattern for undo/redo
- [ ] 1.5 — Create operation registry
- [ ] 1.6 — Set up modular IPC architecture

### Phase 2: Media Import & Management
- [ ] 2.1 — Multi-file import (videos, photos, audio)
- [ ] 2.2 — Media Bin UI panel
- [ ] 2.3 — Thumbnail generation

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
