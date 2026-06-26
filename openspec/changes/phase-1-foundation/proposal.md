## Why

Vid Kraft started as a single-file `VideoPlayer` with ad-hoc state and no shared data model, FFmpeg layer, or extensibility seams. Before any real editing features can be built, the app needs a foundation that is open for extension and closed for modification: a typed data model, an FFmpeg service reachable from the renderer, centralized state, an undo/redo command system, a self-registering operation registry, and a modular, typed IPC bridge.

This change documents that foundation. It is already implemented (Phase 1) and is captured here as the baseline specification all later phases build on.

## What Changes

- Add a shared **core data model** (`Project`, `Track`, `Clip`, `MediaAsset`, `Annotation`, `Viewport`, `TimeRange`, `Transform`, `PlaybackState`, `SelectionState`) that every feature reads and writes.
- Add an **FFmpeg service** that runs in the Electron main process (probe metadata, generate thumbnails, run export jobs) and a typed renderer-side client invoked over IPC.
- Add centralized **project state** management (Zustand store) with actions for tracks, clips, assets, annotations, playback, and selection.
- Add an **editing command** system (Command pattern + history stack) that enables undo/redo for every mutating operation.
- Add an **operation registry** so new editing operations (cut, split, merge, …) self-register and become available without modifying existing code.
- Add a modular, end-to-end typed **IPC bridge**: handlers grouped by concern in `electron/ipc/`, registered from `main.ts`, and exposed to the renderer through a typed `window.api` in the preload context bridge.

No breaking changes — the existing `VideoPlayer` keeps working; later phases refactor it.

## Capabilities

### New Capabilities
- `core-data-model`: Canonical TypeScript interfaces describing projects, tracks, clips, media assets, annotations, viewport, and selection/playback state.
- `ffmpeg-service`: Main-process FFmpeg operations (probe, thumbnail, export) exposed to the renderer through a typed client.
- `project-state`: Centralized, observable project/UI state with mutation actions.
- `editing-commands`: Command pattern with an undo/redo history stack.
- `operation-registry`: Plugin registry for self-registering editing operations.
- `ipc-bridge`: Modular, typed IPC handlers and a preload-exposed renderer API.

### Modified Capabilities
<!-- None — this is the first specification of the system. -->

## Impact

- **New code**: `src/core/types.ts`, `src/core/commands.ts`, `src/core/registry.ts`, `src/store/projectStore.ts`, `src/store/utils.ts`, `src/services/ffmpeg.ts`, `electron/ipc/index.ts`, `electron/ipc/ffmpeg.ts`, `electron/ipc/fileHandlers.ts`.
- **Modified code**: `electron/main.ts` (register IPC handlers), `electron/preload.ts` + `electron/electron-env.d.ts` (typed `window.api`).
- **Dependencies**: `fluent-ffmpeg`, `@ffmpeg-installer/ffmpeg`, `zustand`.
- **Tests**: unit tests under `tests/core/`, `tests/store/`, `tests/services/`.
- **Docs**: `docs/CHANGELOG.md` (1.1–1.6), `docs/summary.md`.
