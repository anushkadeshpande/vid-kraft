## Context

Export is the authoritative render: it must reproduce what the preview shows (Phase 4 compositing), the audio mix (Phase 6), and overlays/annotations (Phase 7), but with frame accuracy using FFmpeg. Project persistence captures the entire editor state so users can resume later. FFmpeg runs in the main process; the renderer drives export and receives progress/cancel over IPC.

## Goals / Non-Goals

**Goals:**
- Build a deterministic FFmpeg job from the project (inputs, filtergraph, audio mix, overlay/annotation burn-in).
- Report progress and allow cancellation.
- Save/load the full project to/from JSON with media re-resolution.

**Non-Goals:**
- Cloud/remote export or upload (offline only).
- Background render queue of multiple jobs (single job at a time for now).

## Decisions

- **Filtergraph builder is a pure function** from project state to FFmpeg arguments/filter string: maps tracks/clips to inputs, applies trims, `overlay` for visual layers, annotation PNG overlays, and `amix`/`volume` for audio. Pure so the argument construction is unit-testable without running FFmpeg.
- **Progress via FFmpeg time/`progress` parsing** emitted as IPC events the renderer subscribes to; the export job exposes a cancel that kills the FFmpeg process.
- **Format/codec selection** offered as presets (e.g. MP4/H.264+AAC) with sensible defaults; the builder maps the choice to output options.
- **Project file is JSON** containing the serialized `Project` (tracks, clips, annotations, viewport) plus media references by absolute path; on load, missing media is flagged rather than silently dropped.
- **Load replaces store state** atomically; save serializes current store state. Round-trip must be lossless for the data model.

## Risks / Trade-offs

- [Export of complex filtergraphs is slow/fragile] → build incrementally, validate the graph for simple cases first, keep the builder pure and tested.
- [Cancellation leaving partial files] → delete partial output on cancel/error.
- [Moved/renamed media on load] → detect missing paths and surface a re-link prompt instead of failing the whole load.
- [Preview/export mismatch] → reuse the same clip-at-time, transform, and annotation-visibility logic in the builder.

## Open Questions

- Default container/codec and quality preset values.
- Whether to embed media inside the project file (no — reference by path to keep files small and offline).
