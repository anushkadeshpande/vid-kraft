## 1. Import service

- [x] 1.1 Create `src/services/mediaImport.ts` with a per-`MediaType` handler registry (classify, probe, thumbnail)
- [x] 1.2 Implement `importFiles(paths)` that probes metadata, generates thumbnails, builds `MediaAsset`s, and skips failures per file
- [x] 1.3 Add `tests/services/mediaImport.test.ts` covering classification, success, and per-file failure handling

## 2. IPC + main process

- [x] 2.1 Add an open-file dialog handler and an app-paths/thumbnail-dir resolver in `electron/ipc/fileHandlers.ts`
- [x] 2.2 Expose the new IPC methods via `electron/preload.ts` and declare them in `electron/electron-env.d.ts`
- [x] 2.3 Ensure the FFmpeg thumbnail handler covers image/audio fallbacks (handled in the per-`MediaType` handler registry)

## 3. Media Bin UI

- [x] 3.1 Create `src/components/MediaBin/` panel with asset cards (thumbnail, name, type, duration, resolution)
- [x] 3.2 Add selection, per-asset removal (wired to `removeAsset`), and grid/list view toggle
- [x] 3.3 Add an import trigger button that calls the import service

## 4. Integration

- [x] 4.1 Wire the Media Bin into `src/App.tsx` layout alongside the preview
- [x] 4.2 Optional `useMediaImport` hook to bridge service and store

## 5. Verification

- [x] 5.1 Run `npm test` and ensure all tests pass
- [ ] 5.2 Run the app, import mixed media, confirm assets appear with thumbnails
- [x] 5.3 Update `docs/CHANGELOG.md` (2.1–2.3) and `docs/summary.md`
