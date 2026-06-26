## Why

With a timeline and preview in place, users need the fundamental editing operations that make a video editor useful: cutting a clip at the playhead, separating audio from video, merging adjacent clips, trimming clip edges, and deleting clips. Each must be undoable and must plug into the existing operation registry and command system so future operations are added without touching existing code.

## What Changes

- Add a **Cut** operation that splits a clip at the playhead into two adjacent clips on the same track.
- Add a **Split audio/video** operation that separates a clip's audio and video streams into independent clips on separate tracks.
- Add a **Merge** operation that concatenates adjacent clips on a track into a single clip (rendered via FFmpeg).
- Add **Trim/resize** by dragging clip edges to change a clip's in/out points (`trimStart`/`trimEnd` and `duration`).
- Add **Delete** to remove selected clips from the timeline.
- Every operation registers itself with the Phase 1 operation registry and is implemented as a reversible command for undo/redo.

No breaking changes — operations are self-contained modules that consume Phase 1 commands/registry and Phase 3 timeline state.

## Capabilities

### New Capabilities
- `editing-operations`: Cut, split audio/video, merge, trim, and delete clips, each registered with the operation registry and executed as undoable commands.

### Modified Capabilities
<!-- None — registry/command requirements from Phase 1 are reused unchanged. -->

## Impact

- **New code**: per-operation modules under `src/core/operations/` (e.g. `cut.ts`, `splitAV.ts`, `merge.ts`, `trim.ts`, `delete.ts`), each self-registering and exposing a `Command`.
- **Modified code**: timeline clip view (trim handles, context actions), toolbar buttons wired to operations.
- **Store/services**: uses existing clip/track actions; `merge` and `split` invoke the FFmpeg service for rendering/stream separation.
- **Tests**: unit tests per operation (execute + undo, edge cases) under `tests/core/operations/`.
- **Docs**: `docs/CHANGELOG.md` (5.1–5.5), `docs/summary.md`.
