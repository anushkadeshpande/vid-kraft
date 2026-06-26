## 1. Export pipeline

- [ ] 1.1 Implement a pure filtergraph/arguments builder from project state (inputs, trims, overlay, annotation overlays, amix/volume)
- [ ] 1.2 Add unit tests for the builder across single-track, multi-track, overlay, and audio-mix cases
- [ ] 1.3 Implement the FFmpeg export handler in `electron/ipc/ffmpeg.ts` consuming the built args
- [ ] 1.4 Add format/codec presets with a default

## 2. Progress & cancellation

- [ ] 2.1 Parse FFmpeg progress and emit IPC progress events
- [ ] 2.2 Implement cancel that terminates the FFmpeg process and removes partial output
- [ ] 2.3 Build the export progress UI (progress bar + cancel)

## 3. Project persistence

- [ ] 3.1 Implement `src/services/project.ts` save (serialize store state to JSON)
- [ ] 3.2 Implement load (parse JSON, replace store state, re-resolve media, flag missing)
- [ ] 3.3 Add round-trip and missing-media unit tests

## 4. Verification

- [ ] 4.1 Run `npm test` and ensure all tests pass
- [ ] 4.2 Run the app, export a multi-track project, save and reload it
- [ ] 4.3 Update `docs/CHANGELOG.md` (8.1–8.3) and `docs/summary.md`
