## 1. Import service

- [ ] 1.1 Create `src/services/mediaImport.ts` with a per-`MediaType` handler registry (classify, probe, thumbnail)
- [ ] 1.2 Implement `importFiles(paths)` that probes metadata, generates thumbnails, builds `MediaAsset`s, and skips failures per file
- [ ] 1.3 Add `tests/services/mediaImport.test.ts` covering classification, success, and per-file failure handling

## 2. IPC + main process

- [ ] 2.1 Add an open-file dialog handler and an app-paths/thumbnail-dir resolver in `electron/ipc/fileHandlers.ts`
- [ ] 2.2 Expose the new IPC methods via `electron/preload.ts` and declare them in `electron/electron-env.d.ts`
- [ ] 2.3 Ensure the FFmpeg thumbnail handler covers image/audio fallbacks

## 3. Media Bin UI

- [ ] 3.1 Create `src/components/MediaBin/` panel with asset cards (thumbnail, name, type, duration, resolution)
- [ ] 3.2 Add selection, per-asset removal (wired to `removeAsset`), and grid/list view toggle
- [ ] 3.3 Add an import trigger button that calls the import service

## 4. Integration

- [ ] 4.1 Wire the Media Bin into `src/App.tsx` layout alongside the preview
- [ ] 4.2 Optional `useMediaImport` hook to bridge service and store

## 5. Verification

- [ ] 5.1 Run `npm test` and ensure all tests pass
- [ ] 5.2 Run the app, import mixed media, confirm assets appear with thumbnails
- [ ] 5.3 Update `docs/CHANGELOG.md` (2.1–2.3) and `docs/summary.md`
