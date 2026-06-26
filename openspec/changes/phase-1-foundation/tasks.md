## 1. Core data model

- [x] 1.1 Define shared types in `src/core/types.ts` (`Project`, `Track`, `Clip`, `MediaAsset`, `Annotation`, `Viewport`, `TimeRange`, `Transform`, `PlaybackState`, `SelectionState`, plus `MediaType`/`TrackType` unions)
- [x] 1.2 Add unit tests covering type guards/shape expectations in `tests/core/types.test.ts`

## 2. FFmpeg service

- [x] 2.1 Install `fluent-ffmpeg` and `@ffmpeg-installer/ffmpeg`
- [x] 2.2 Implement main-process handlers in `electron/ipc/ffmpeg.ts` (probe, thumbnail, export)
- [x] 2.3 Implement renderer client in `src/services/ffmpeg.ts`
- [x] 2.4 Add `tests/services/ffmpeg.test.ts` mocking IPC

## 3. Project state

- [x] 3.1 Implement Zustand store in `src/store/projectStore.ts` with asset/track/clip/annotation/playback/selection actions
- [x] 3.2 Add store helpers in `src/store/utils.ts`
- [x] 3.3 Add `tests/store/projectStore.test.ts` and `tests/store/utils.test.ts`

## 4. Editing commands

- [x] 4.1 Implement `Command` interface and `CommandHistory` (undo/redo stacks) in `src/core/commands.ts`
- [x] 4.2 Add `tests/core/commands.test.ts` covering execute/undo/redo and redo-stack clearing

## 5. Operation registry

- [x] 5.1 Implement self-registering registry in `src/core/registry.ts` (register, get, list, duplicate-id handling)
- [x] 5.2 Add `tests/core/registry.test.ts`

## 6. IPC bridge

- [x] 6.1 Create modular IPC under `electron/ipc/` with `index.ts` registering all handlers
- [x] 6.2 Refactor `electron/main.ts` to register handlers via the index
- [x] 6.3 Expose typed `window.api` in `electron/preload.ts` and declare it in `electron/electron-env.d.ts`

## 7. Verification

- [x] 7.1 Run `npm test` and ensure all tests pass
- [x] 7.2 Update `docs/CHANGELOG.md` (1.1–1.6) and `docs/summary.md`
