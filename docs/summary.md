# Vid Kraft — Codebase Summary

## Overview

Vid Kraft is a desktop video editor built with **Electron + React + TypeScript**, bundled via **Vite** with the `vite-plugin-electron` plugin. It allows users to load a local video file, play it back on an HTML5 Canvas, and resize the video within the canvas.

---

## Architecture

```
electron/          → Electron main process + preload bridge
src/               → React UI (rendered in Electron's BrowserWindow)
  components/      → VideoPlayer, VideoControls
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

- Three-region layout: a top row with a `MediaBin` sidebar (imported assets) on the left and the `VideoPlayer` preview on the right, plus a `Timeline` panel docked along the bottom.

### `components/MediaBin/` — Media Library (Phase 2)

- `MediaBin.tsx` renders imported `MediaAsset`s as cards with thumbnail, name, type, duration, resolution; supports selection, per-asset removal (via store `removeAsset`), and a grid/list view toggle.
- `AssetCard.tsx` renders a single asset; images show their own thumbnail, audio shows a placeholder icon.
- `format.ts` holds pure helpers (`formatDuration`, `formatFileSize`, `formatResolution`, `toFileUrl`).
- Import is driven by `src/services/mediaImport.ts` (per-`MediaType` handler registry: classify → probe → thumbnail → build `MediaAsset`, skipping invalid files) and the `useMediaImport` hook, which opens the native dialog and adds assets to the store. Thumbnails are written to `userData/thumbnails` (resolved via the `app:getThumbnailDir` IPC handler).
- Asset cards are draggable (HTML5 DnD, MIME `application/x-vidkraft-asset`) so they can be dropped onto timeline tracks.

### `components/Timeline/` — Timeline & Tracks (Phase 3)

- `Timeline.tsx` orchestrates a scrollable timeline: a fixed left gutter of `TrackControls` (mute/lock/visibility/remove) aligned with scrollable lanes, a zoomable `TimeRuler`, and a `Playhead`. It owns the pixels-per-second zoom, asset-drop → clip creation, clip drag (reposition + cross-track move) with snapping, and click/drag scrubbing bound to playback `currentTime`.
- `TrackLane.tsx` accepts asset drops on compatible, unlocked tracks and renders its clips; `ClipView.tsx` positions a clip by `startTime`/`duration`.
- Pure, unit-tested logic lives in `src/core/timeline.ts` (`timeToPixels`, `pixelsToTime`, `snap`, `snapClipStart`, `rulerTickInterval`) and `src/core/tracks.ts` (media↔track compatibility registry, `createTrack`, `createClipFromAsset`). Locked tracks reject drops and clip moves; Shift disables snapping during a drag.

### `components/VideoPlayer.tsx` — Core Component

This is the main feature of the app. It:

1. **File selection** — An `<input type="file" accept="video/*">` lets the user pick a local video. The file is turned into a blob URL via `URL.createObjectURL`.

2. **Canvas rendering** — A hidden `<video>` element is the source; frames are drawn onto a `1280×720` `<canvas>` using `requestAnimationFrame`. The canvas acts as the compositing surface (like a timeline preview).

3. **Auto-fitting** — On `loadedmetadata`, the video is scaled to fit within the canvas bounds while preserving aspect ratio, then centered.

4. **Resize handle** — A draggable handle in the bottom-right corner of the video allows the user to resize the video on the canvas. It:
   - Tracks mouse movement to compute new dimensions.
   - Maintains aspect ratio.
   - Enforces min (160px wide) and max (canvas bounds) constraints.
   - Redraws the current frame in real-time during the drag.
   - Re-centers the video after resize.

5. **Playback loop** — When the video plays, `renderFrame()` continuously draws frames via `requestAnimationFrame`. On pause/end, the loop is cancelled.

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
