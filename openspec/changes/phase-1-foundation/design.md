## Context

Vid Kraft is an offline Electron + React + TypeScript + Vite desktop video editor that uses FFmpeg for media processing. The starting point was a single `VideoPlayer` canvas component with local component state. To grow into a multi-track editor without rewrites, the codebase needs stable abstractions and clear process boundaries (renderer vs. main) before feature work begins. A core design constraint from the product brief is the Open/Closed Principle: new features must plug in with minimal edits to existing files.

## Goals / Non-Goals

**Goals:**
- Establish one canonical data model shared across renderer and main.
- Make FFmpeg callable from the renderer without exposing Node APIs to the web context.
- Provide a single source of truth for project and UI state.
- Enable undo/redo from day one via a command abstraction.
- Allow editing operations to register themselves (plugin pattern).
- Keep IPC modular and fully typed end-to-end.

**Non-Goals:**
- No UI panels beyond what already exists (Timeline, MediaBin, etc. are later phases).
- No actual editing operations yet — only the registry and command infrastructure.
- No project file persistence format (Phase 8).

## Decisions

- **Zustand for state** over React Context/Redux: minimal boilerplate, selector-based subscriptions, easy to test outside React. Store exposes granular actions so commands mutate state through a narrow surface.
- **Command pattern with a history stack** (`execute`/`undo`, `CommandHistory` with undo/redo stacks) instead of event sourcing: simplest model that supports reversible edits and composes with the registry.
- **Operation registry** keyed by operation id: operations import the registry and call `register(...)` at module load, so adding an operation never edits a switch statement. Closed for modification, open for extension.
- **FFmpeg in the main process** via `fluent-ffmpeg` + `@ffmpeg-installer/ffmpeg`: native binaries cannot run in the sandboxed renderer; the renderer calls a thin typed client that invokes IPC.
- **Modular IPC**: handlers grouped by concern (`ffmpeg`, `fileHandlers`) and registered through an `index.ts`. Preload exposes a single typed `window.api`; channel names and payload types are shared so calls are type-checked end to end.
- **`contextIsolation` + preload bridge**: the renderer never touches `ipcRenderer`/Node directly, satisfying the offline/secure requirement.

## Risks / Trade-offs

- [FFmpeg binary path differs in dev vs. packaged app] → resolve the binary path via `@ffmpeg-installer/ffmpeg` and unpack it from asar at build time.
- [Command history growing unbounded] → history is in-memory and per-session; acceptable now, can add a cap later without API change.
- [Store becoming a god object] → mitigated by grouping actions by domain and keeping commands as the only mutators for editing operations.
- [Type drift between main and renderer IPC] → shared type declarations (`electron-env.d.ts`) and a single `window.api` surface keep both sides aligned.

## Open Questions

- Whether to persist command history across save/load (deferred to Phase 8).
- Final export job progress/streaming contract (refined in Phase 8).
