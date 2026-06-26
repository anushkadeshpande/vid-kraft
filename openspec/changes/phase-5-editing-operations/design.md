## Context

Phase 1 provides the `Command` interface, `CommandHistory`, and the operation registry. Phase 3 provides tracks, clips, and the playhead. Editing operations are the first real consumers of these abstractions and are the key test of the Open/Closed Principle: each operation is a module that self-registers and produces a reversible command, with no edits to a central dispatcher.

## Goals / Non-Goals

**Goals:**
- Implement cut, split A/V, merge, trim, delete as independent, self-registering modules.
- Make every operation undoable via the command history.
- Keep purely-structural edits (cut, trim, delete) in-memory; use FFmpeg only where media must be rendered (merge, stream split).

**Non-Goals:**
- Audio mixing and volume (Phase 6).
- Overlays and annotations (Phase 7).
- Final export (Phase 8).

## Decisions

- **One module per operation** under `src/core/operations/`, each calling `register(...)` at load and exporting a factory that builds a `Command`. Adding an operation never edits existing operations (Open/Closed).
- **Structural edits are non-destructive**: cut, trim, and delete only change `Clip` fields (`startTime`, `duration`, `trimStart`, `trimEnd`) or the track's clip list — the source media is untouched, so undo is exact and cheap.
- **Cut at playhead** creates two clips sharing the source: the left keeps `[trimStart, trimStart+offset]`, the right starts at `trimStart+offset`; together they reproduce the original.
- **Merge uses FFmpeg concat** to produce a new rendered asset, then replaces the adjacent clips with one clip referencing it; undo restores the original clips and removes the rendered asset reference. Merge requires compatible/adjacent clips.
- **Split A/V uses FFmpeg** to demux streams into separate audio and video assets placed on an audio track and a video track; undo recombines into the original clip.
- **Trim adjusts edges** within source bounds; dragging the left edge changes `trimStart` and `startTime`, the right edge changes `trimEnd`/`duration`, clamped so the clip stays within the source media length.

## Risks / Trade-offs

- [Merge/split require disk I/O and time] → run in main process via the FFmpeg service with async feedback; keep structural edits instant.
- [Undo of rendered operations] → store enough state in the command to fully reverse (original clips + created asset id) so undo is deterministic.
- [Trimming past source bounds] → clamp trims to `[0, sourceDuration]` and reject zero/negative durations.

## Open Questions

- Whether merge should re-encode or stream-copy when codecs match (prefer stream-copy when safe).
- Behavior of cut when the playhead is exactly on a clip boundary (no-op).
