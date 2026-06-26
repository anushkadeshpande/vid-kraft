## Why

All the editing work is meaningless until users can render their timeline to a shareable video file and save/reload their project. This phase delivers the export pipeline (compose every track, overlay, annotation, and the audio mix into one output via FFmpeg), project save/load (persist the full editor state to JSON and restore it), and an export progress UI with cancel support.

## What Changes

- Add an **export pipeline** that renders the full timeline — all tracks, overlays, annotations, and the audio mix — to a single output file via FFmpeg, with format/codec selection.
- Add **project save/load**: serialize project state (tracks, clips, media references, annotations, viewport) to a JSON file and restore it, re-resolving media references.
- Add an **export progress UI** showing progress and supporting cancel.

No breaking changes — consumes the audio mix model (Phase 6), overlays/annotations burn-in (Phase 7), and compositing semantics (Phase 4).

## Capabilities

### New Capabilities
- `export-pipeline`: Render the complete timeline to a single output file via FFmpeg with format/codec options, progress reporting, and cancellation.
- `project-persistence`: Save the full project state to JSON and load/restore it, re-resolving media references.

### Modified Capabilities
<!-- None — consumes prior phases' semantics without changing their requirements. -->

## Impact

- **New code**: `src/services/project.ts` (save/load), export orchestration in `src/services/` + FFmpeg filtergraph builder in `electron/ipc/ffmpeg.ts`, export progress UI component.
- **Modified code**: FFmpeg IPC handler gains progress events and cancellation; preload exposes save/load/export-with-progress; menu/toolbar wiring.
- **Store**: load replaces project state; save reads current state.
- **Tests**: unit tests for project serialize/deserialize round-trip and filtergraph/argument construction under `tests/`.
- **Docs**: `docs/CHANGELOG.md` (8.1–8.3), `docs/summary.md`.
