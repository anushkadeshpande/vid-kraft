# Vid Kraft — Implementation Prompt for AI Agent

## Context

You are implementing a lightweight, offline desktop video editor called **Vid Kraft**. The app uses **Electron + React + TypeScript + Vite** with **FFmpeg** for media processing. All processing happens locally — no network calls, no telemetry, no cloud services.

### Current State

The app currently has:
- Electron shell with a BrowserWindow loading a Vite-served React app
- A single `VideoPlayer` component that renders video frames on a 1280×720 canvas
- Basic play/pause/stop controls
- A resize handle for scaling video on the canvas
- File input for loading a single video

### Design Principles

1. **Open/Closed Principle** — Code must be open for extension, closed for modification. Use plugin/registry patterns, interfaces, and composition.
2. **Lightweight** — Minimal dependencies. Prefer native APIs and FFmpeg over heavy libraries.
3. **Offline-only** — Zero network requests. All assets and processing stay on disk.
4. **User-friendly** — Intuitive UI. A newcomer should understand the workflow without a tutorial.
5. **Aesthetic UI** — Clean, modern dark theme. Smooth interactions and transitions.

### Tech Stack

- **Shell:** Electron (main + renderer via context bridge)
- **UI:** React 18 + TypeScript
- **Bundler:** Vite + vite-plugin-electron
- **Media Processing:** FFmpeg (via fluent-ffmpeg or ffmpeg-static, invoked from main process)
- **State Management:** Keep it simple — React context or Zustand if needed
- **Styling:** CSS modules or a lightweight approach (no heavy UI frameworks)

---

## Architecture to Implement

```
src/
  core/                  → Core abstractions and interfaces
    types.ts             → Shared types (Track, Clip, TimeRange, etc.)
    registry.ts          → Plugin/operation registry
    commands.ts          → Command pattern for undo/redo
  services/
    ffmpeg.ts            → FFmpeg wrapper (runs in main process via IPC)
    project.ts           → Project file save/load
    media-import.ts      → File import and metadata extraction
  components/
    App.tsx
    Timeline/            → Timeline panel (tracks, clips, scrubber)
    Preview/             → Canvas-based preview with viewport resize
    MediaBin/            → Imported media library panel
    Controls/            → Playback controls, toolbar
    Properties/          → Selected clip properties panel
    Annotations/         → Annotation overlay tools
  hooks/                 → Custom React hooks
  store/                 → State management (project state, UI state)
electron/
  main.ts               → Window management + IPC handlers
  preload.ts            → Context bridge
  ipc/                   → IPC handler modules (ffmpeg, file system, etc.)
```

---

## Action Items (Ordered by Priority)

### Phase 1: Foundation & Architecture

| # | Task | Description | Dependencies |
|---|------|-------------|--------------|
| 1.1 | Define core types | Create `src/core/types.ts` with interfaces: `Project`, `Track` (video/audio/image), `Clip`, `TimeRange`, `MediaAsset`, `Viewport`, `Annotation`. These are the data model for everything. | None |
| 1.2 | Set up FFmpeg integration | Install `ffmpeg-static` and `fluent-ffmpeg`. Create `electron/ipc/ffmpeg.ts` that exposes FFmpeg operations via IPC. Create `src/services/ffmpeg.ts` as the renderer-side client. | None |
| 1.3 | Set up state management | Create a project store (`src/store/`) using Zustand or React Context. It should hold: project data, timeline state, selected items, playback position. | 1.1 |
| 1.4 | Implement Command pattern | Create `src/core/commands.ts` with `Command` interface (`execute`, `undo`), a `CommandHistory` class, and concrete command types for each operation. This enables undo/redo. | 1.1 |
| 1.5 | Create operation registry | Create `src/core/registry.ts` — a registry where operations (cut, split, merge, etc.) register themselves. New features plug in without modifying existing code. | 1.1 |
| 1.6 | Set up IPC architecture | Refactor `electron/main.ts` to use modular IPC handlers in `electron/ipc/`. Create handlers for: file operations, FFmpeg calls, project save/load. Update preload to expose typed APIs. | 1.2 |

### Phase 2: Media Import & Management

| # | Task | Description | Dependencies |
|---|------|-------------|--------------|
| 2.1 | Multi-file import | Allow importing multiple videos, photos, and audio files at once via file dialog or drag-and-drop. Extract metadata (duration, resolution, codec) using FFmpeg probe. | 1.2, 1.6 |
| 2.2 | Media Bin UI | Create `src/components/MediaBin/` — a panel showing all imported assets as thumbnails with metadata. Support grid/list view toggle. | 2.1, 1.3 |
| 2.3 | Thumbnail generation | Generate thumbnails for video/image assets using FFmpeg. Store in a temp directory. Display in MediaBin. | 2.1 |

### Phase 3: Timeline & Tracks

| # | Task | Description | Dependencies |
|---|------|-------------|--------------|
| 3.1 | Timeline component | Create `src/components/Timeline/` with a horizontal scrollable timeline. Show time ruler, playhead/scrubber, and track lanes. | 1.3 |
| 3.2 | Track system | Implement multiple track support: video tracks, audio tracks, image/overlay tracks. Clips can be dragged from MediaBin onto tracks. | 3.1, 1.1 |
| 3.3 | Clip placement & dragging | Allow clips to be placed on the timeline via drag-and-drop, moved between tracks, and repositioned in time. Snap to edges. | 3.2 |
| 3.4 | Playhead & scrubbing | Implement a draggable playhead. Clicking on the timeline seeks to that position. Show current time indicator. | 3.1 |

### Phase 4: Preview & Viewport

| # | Task | Description | Dependencies |
|---|------|-------------|--------------|
| 4.1 | Refactor Preview panel | Replace current VideoPlayer with a proper `Preview` component that composites all visible tracks at the current playhead position. | 3.1, 1.3 |
| 4.2 | Viewport resize | Allow the user to change the output viewport dimensions (e.g., 1920×1080, 1280×720, 9:16 for mobile). Canvas adapts accordingly. | 4.1 |
| 4.3 | Multi-layer compositing | Render overlapping video/image layers on canvas in correct z-order based on track stacking. | 4.1, 3.2 |

### Phase 5: Core Editing Operations

| # | Task | Description | Dependencies |
|---|------|-------------|--------------|
| 5.1 | Cut operation | Split a clip at the playhead position into two separate clips on the same track. | 3.2, 1.4 |
| 5.2 | Split audio/video | Separate the audio and video streams of a clip into independent clips on separate tracks. | 5.1, 1.2 |
| 5.3 | Merge clips | Concatenate adjacent clips on a track into a single clip (rendered via FFmpeg). | 3.2, 1.2 |
| 5.4 | Trim/resize clips | Drag clip edges on the timeline to trim start/end points. | 3.3 |
| 5.5 | Delete clips | Remove selected clips from timeline. | 3.2, 1.4 |

### Phase 6: Audio

| # | Task | Description | Dependencies |
|---|------|-------------|--------------|
| 6.1 | Audio track support | Render audio waveforms on audio tracks in the timeline. | 3.2, 1.2 |
| 6.2 | Add custom audio | Import audio files and place on audio tracks independent of video. | 2.1, 6.1 |
| 6.3 | Audio overlap/mixing | Support multiple audio tracks playing simultaneously. Mix during export. | 6.1 |
| 6.4 | Audio volume control | Per-clip volume adjustment. Visual indicator on timeline. | 6.1 |

### Phase 7: Overlays & Annotations

| # | Task | Description | Dependencies |
|---|------|-------------|--------------|
| 7.1 | Image/video overlay | Place images or videos on overlay tracks that render on top of the main video. Support position, scale, opacity. | 4.3 |
| 7.2 | Annotation tools | Create `src/components/Annotations/` with tools: freehand draw, rectangle, arrow, text. Annotations are time-bound (appear during a time range). | 4.1, 1.1 |
| 7.3 | Annotation rendering | Render annotations on the preview canvas. Burn into output during export via FFmpeg filters. | 7.2 |

### Phase 8: Export & Project Management

| # | Task | Description | Dependencies |
|---|------|-------------|--------------|
| 8.1 | Export pipeline | Build an FFmpeg export pipeline that renders the full timeline (all tracks, overlays, annotations, audio mix) to a single output file. Support format/codec selection. | All Phase 5-7 |
| 8.2 | Project save/load | Save project state (tracks, clips, media references, annotations) to a JSON file. Load and restore. | 1.3 |
| 8.3 | Export progress UI | Show a progress bar during export with cancel support. | 8.1 |

### Phase 9: Polish & UX

| # | Task | Description | Dependencies |
|---|------|-------------|--------------|
| 9.1 | Keyboard shortcuts | Add shortcuts: Space (play/pause), C (cut), Delete (remove), Ctrl+Z/Y (undo/redo), Ctrl+S (save). | All |
| 9.2 | Undo/Redo UI | Add undo/redo buttons in toolbar wired to CommandHistory. | 1.4 |
| 9.3 | Responsive layout | Make panels resizable (splitters). Remember layout in localStorage. | All |
| 9.4 | Dark theme polish | Consistent color palette, smooth animations, hover states, loading skeletons. | All |

---

## Rules for Implementation

1. **One phase at a time.** Complete all tasks in a phase before moving to the next.
2. **Update CHANGELOG.md** after completing each task with a short description of what was done.
3. **Commit and push** after each completed task (or logical group of tasks).
4. **Do not modify existing interfaces** — extend them. If a type needs new fields, use intersection types or add optional properties.
5. **Each operation** (cut, merge, split, etc.) should be a self-contained module that registers itself with the operation registry.
6. **IPC calls** must be typed end-to-end (shared type definitions between main and renderer).
7. **No network calls** — validate that no dependency phones home.
8. **Test each feature** by running the app before marking complete.
9. **Unit tests are mandatory for every module.** Every new file in `src/core/`, `src/store/`, and `src/services/` must have a corresponding `.test.ts` file.
10. **Tests must pass before pushing.** Run `npm test` and ensure zero failures before committing.
11. **Aim for maximum coverage.** Test all public functions, edge cases, error paths, and state transitions. Target >90% coverage on core/store/services.
12. **Test naming convention:** Place test files in `tests/` mirroring the `src/` structure (e.g., `src/core/commands.ts` → `tests/core/commands.test.ts`).
13. **Mock external dependencies** (IPC, FFmpeg, file system) — never make real system calls in tests.

---

## Testing Setup

- **Framework:** Vitest (Vite-native, fast, compatible with Jest API)
- **Environment:** jsdom (for React components)
- **Config:** `vitest.config.ts` at project root
- **Commands:**
  - `npm test` — Run all tests once
  - `npm run test:watch` — Run tests in watch mode during development
  - `npm run test:coverage` — Run with coverage report
- **Coverage scope:** `src/core/**`, `src/store/**`, `src/services/**`
- **Patterns:**
  - Use `describe`/`it` blocks with clear descriptions
  - Use `beforeEach` to reset state (especially Zustand stores)
  - Mock `window.ipcRenderer` for service tests
  - Use concrete test commands (implementing `Command` interface) for command system tests

---

## How to Use This Document

1. Read this prompt and the CHANGELOG.md to understand current state.
2. Identify the next incomplete phase/task from CHANGELOG.md.
3. Implement the task following the architecture above.
4. Write unit tests for the new code (adjacent `.test.ts` files).
5. Run `npm test` and ensure all tests pass.
6. Test by running `npm run dev` to verify the app works.
7. Update CHANGELOG.md with what was done.
8. Commit with a descriptive message and push.
9. Move to the next task.
