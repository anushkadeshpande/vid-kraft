# Vid Kraft — Codebase Summary

## Overview

Vid Kraft is a desktop video editor built with **Electron + React + TypeScript**, bundled via **Vite** with the `vite-plugin-electron` plugin. It allows users to load a local video file, play it back on an HTML5 Canvas, and resize the video within the canvas.

---

## Architecture

```
electron/          → Electron main process + preload bridge
src/               → React UI (rendered in Electron's BrowserWindow)
  components/      → MediaBin, Timeline, Preview, VideoControls
public/            → Static assets (icons)
dist-electron/     → Compiled Electron JS (main.js, preload.js)
```

**Build tooling:**  
- `vite.config.ts` configures Vite with `@vitejs/plugin-react` and `vite-plugin-electron/simple`, which handles building both the main process (`electron/main.ts`) and preload script (`electron/preload.ts`) alongside the renderer.

---

## Electron Layer (`electron/`)

### `main.ts` — Main Process

- Creates a `BrowserWindow` with a preload script.
- In dev mode, loads the Vite dev server URL (`http://localhost:5173`).
- In production, loads the built `dist/index.html`.
- Sends a timestamp message to the renderer on `did-finish-load`.
- Handles macOS window lifecycle (stays alive until explicitly quit).

### `preload.ts` — Context Bridge

- Exposes `ipcRenderer` to the renderer process via `contextBridge.exposeInMainWorld`.
- Patches prototype methods so they work across the context boundary.
- Implements an animated loading spinner that displays while the app initializes, removed via a `postMessage('removeLoading')` from the renderer.

---

## React Renderer (`src/`)

### `main.tsx` — Entry Point

- Mounts `<App />` into the DOM with React StrictMode.
- Sends `postMessage({ payload: 'removeLoading' })` to dismiss the preload loading screen.
- Listens for `main-process-message` IPC events and logs them.

### `App.tsx` — Root Component

- Three-region layout: a top row with a `MediaBin` sidebar (imported assets) on the left and the `Preview` compositor on the right, plus a `Timeline` panel docked along the bottom.

### `components/MediaBin/` — Media Library (Phase 2)

- `MediaBin.tsx` renders imported `MediaAsset`s as cards with thumbnail, name, type, duration, resolution; supports selection, per-asset removal (via store `removeAsset`), and a grid/list view toggle.
- `AssetCard.tsx` renders a single asset; images show their own thumbnail, audio shows a placeholder icon.
- `format.ts` holds pure helpers (`formatDuration`, `formatFileSize`, `formatResolution`, `toFileUrl`).
- Import is driven by `src/services/mediaImport.ts` (per-`MediaType` handler registry: classify → probe → thumbnail → build `MediaAsset`, skipping invalid files) and the `useMediaImport` hook, which opens the native dialog and adds assets to the store. Thumbnails are written to `userData/thumbnails` (resolved via the `app:getThumbnailDir` IPC handler).
- Asset cards are draggable (HTML5 DnD, MIME `application/x-vidkraft-asset`) so they can be dropped onto timeline tracks.

### `components/Timeline/` — Timeline & Tracks (Phase 3)

- `Timeline.tsx` orchestrates a scrollable timeline: a fixed left gutter of `TrackControls` (mute/lock/visibility/remove) aligned with scrollable lanes, a zoomable `TimeRuler`, and a `Playhead`. It owns the pixels-per-second zoom, asset-drop → clip creation, clip drag (reposition + cross-track move) with snapping, and click/drag scrubbing bound to playback `currentTime`.
- `TrackLane.tsx` accepts asset drops on compatible, unlocked tracks and renders its clips; `ClipView.tsx` positions a clip by `startTime`/`duration` and exposes left/right edge handles for trimming.
- Pure, unit-tested logic lives in `src/core/timeline.ts` (`timeToPixels`, `pixelsToTime`, `snap`, `snapClipStart`, `rulerTickInterval`) and `src/core/tracks.ts` (media↔track compatibility registry, `createTrack`, `createClipFromAsset`). Locked tracks reject drops and clip moves; Shift disables snapping during a drag. The toolbar also hosts the Phase 5 editing operations (Cut/Split A/V/Merge/Delete/Undo/Redo).

### `components/Preview/` — Preview & Viewport (Phase 4)

`Preview.tsx` is the live compositor that replaced the old single-file `VideoPlayer`. It:

1. **Composites visible tracks at the playhead** — for the current `currentTime`, it resolves the visible clip on each visible track and draws them onto a `<canvas>` in z-order (base tracks first, overlay tracks on top), honoring each clip's `Transform` (position, scale, rotation, opacity).

2. **Configurable viewport** — `ViewportSelector.tsx` offers presets (1080p, 720p, 9:16, 1:1) that call `setViewport`; the canvas is fit to the available area preserving aspect ratio (letterbox/pillarbox), and the backing store is sized to `devicePixelRatio`.

3. **Playback** — a `requestAnimationFrame` loop advances `currentTime` and plays the visible `<video>` elements; while paused/scrubbing it seeks them to the clip's source time. Reuses the existing `VideoControls` (Play/Pause/Stop) wired to playback state.

4. **Asset elements** — `assetElements.ts` caches a hidden `<video>`/`<img>` per visual asset and exposes the pure `drawLayer` transform-application helper.

The spec-critical math is pure and unit-tested in `src/core/preview.ts`: `resolveClipAtTime`, `orderTracksForDraw`, `resolveVisibleLayers`, `fitToViewport`, `projectDuration`, and the `VIEWPORT_PRESETS`.

Local media reaches the renderer through a privileged `media://` protocol registered in `electron/protocol.ts` (`registerMediaScheme` before app-ready, `registerMediaProtocol` after). It streams files from disk with HTTP range support so video seeking works; `toFileUrl` in `MediaBin/format.ts` emits `media://local/<encoded-path>` URLs (file:// is blocked from the dev http origin).

### `core/operations/` — Editing Operations (Phase 5)

Each editing operation is a self-registering module under `src/core/operations/` that produces a reversible `Command` (Phase 1 `CommandHistory`), so new operations are added without editing existing code (Open/Closed). Operations are written against the small `EditingContext` interface (`context.ts`) rather than the store directly, which keeps them pure and unit-tested; `storeContext.ts` binds an `EditingContext` to the live zustand store, and importing the `index.ts` barrel registers every operation.

- **Cut** (`cut.ts`) — `splitClip` divides a clip at the playhead into two adjacent halves that share the source with adjusted `trimStart`/`trimEnd`; boundary cuts are no-ops.
- **Trim** (`trim.ts`) — pure `computeTrim` moves a clip's start or end edge, clamped to `[0, sourceDuration]` and a `MIN_CLIP_DURATION`; still images leave the end edge unbounded.
- **Delete** (`delete.ts`) — removes selected clips; undo restores them on their original tracks.
- **Merge** (`merge.ts`) — `planMerge` validates same-track adjacency; `runMerge` renders the trimmed segments via the FFmpeg `ffmpeg:concat` IPC into one clip and swaps the originals for it. Non-adjacent selections are rejected.
- **Split A/V** (`splitAV.ts`) — `runSplitAV` demuxes a clip via `ffmpeg:split` into video-only and audio-only assets on separate tracks (creating a missing audio/video track), recombining on undo.

The structural ops (cut/trim/delete) are instant and in-memory; the rendered ops (merge/split) do their async FFmpeg work first and then build a synchronous, undoable command referencing the rendered output. Rendered files are written to `userData/media` (resolved via the `app:getMediaDir` IPC handler). The timeline toolbar wires Cut/Split A/V/Merge/Delete/Undo/Redo buttons, clip edges expose drag handles for trimming, and keyboard shortcuts (`S` cut, `Del`/`Backspace` delete, `Ctrl/Cmd+Z` undo, `Ctrl/Cmd+Shift+Z`/`Ctrl+Y` redo) run through the same command history.

### `components/VideoControls.tsx` — Playback Buttons

A presentational component with two buttons:

- **Play/Pause** — Toggles between ▶ Play and ⏸ Pause.
- **Stop** — Resets the video to the beginning and pauses.

Both are disabled when no video is loaded.

---

## How It All Fits Together

1. Electron launches and creates a BrowserWindow loading the Vite-served React app.
2. The user picks a video file from disk.
3. The video is loaded into a hidden `<video>` element.
4. Frames are drawn onto a canvas at 1280×720, centered and aspect-ratio-fitted.
5. The user can play/pause/stop and resize the video on the canvas via a drag handle.

---

## Scripts

| Command | Action |
|---------|--------|
| `npm run dev` | Starts Vite dev server + Electron in dev mode |
| `npm run build` | TypeScript check → Vite build → electron-builder package |
| `npm run preview` | Preview the Vite production build |
| `npm run lint` | ESLint on `src/` |
