## Why

Phase 1 delivered the data model, FFmpeg integration, state store, and IPC plumbing, but the app still only loads a single video through an ad-hoc `<input type="file">` in `VideoPlayer`. To start building a real editor, users need to bring multiple media files (videos, photos, audio) into a project and see them in one place. This is the entry point for every downstream editing feature (timeline, cut, merge, overlays, export).

## What Changes

- Add a **multi-file media import** flow that opens the native file dialog, accepts videos, photos, and audio, and imports several files at once.
- For each imported file, probe metadata via FFmpeg, generate a thumbnail (poster frame for video, the image itself for photos, a generic placeholder for audio), classify its `MediaType`, and create a `MediaAsset` added to the project store.
- Add a **Media Bin** UI panel that lists imported assets with thumbnail, name, type, duration, and resolution, with selection and per-asset removal.
- Persist generated thumbnails in an OS-managed directory and add an IPC handler so the renderer never hardcodes paths.
- Keep the design open/closed: import logic lives in a reusable `mediaImport` service driven by a registry of per-`MediaType` handlers, so new media types are added without modifying existing import code.

No breaking changes — existing single-file playback in `VideoPlayer` remains until later phases refactor it.

## Capabilities

### New Capabilities
- `media-import`: Importing multiple media files at once, deriving metadata and thumbnails, classifying media type, and exposing imported assets through a browsable Media Bin.

### Modified Capabilities
<!-- None — no existing specs define behavior being changed. -->

## Impact

- **New code**: `src/services/mediaImport.ts` (+ media-type handler registry), `src/components/MediaBin/` (panel + asset card), import trigger, optional `useMediaImport` hook.
- **Modified code**: `src/App.tsx` (layout), `electron/ipc/fileHandlers.ts` (add app-paths/open-dialog handler), `electron/preload.ts` + `electron/electron-env.d.ts` (expose new IPC).
- **Store**: uses existing `addAsset` / `removeAsset` actions; no schema change to `MediaAsset`.
- **Dependencies**: none new; reuses `fluent-ffmpeg`, `@ffmpeg-installer/ffmpeg`, `zustand`.
- **Tests**: new unit tests for the media-import service and media-type classification under `tests/services/`.
- **Docs**: update `docs/CHANGELOG.md` (2.1–2.3) and `docs/summary.md`.
