## Context

Phase 1 established the data model (`MediaAsset`), the FFmpeg service (probe + thumbnail), the Zustand store (`addAsset`/`removeAsset`), and a typed IPC bridge. The renderer cannot read the file system or run FFmpeg directly, so import must flow renderer → IPC → main → FFmpeg → back. The product brief requires importing many videos/photos/audio at once and a friendly library view.

## Goals / Non-Goals

**Goals:**
- Import multiple heterogeneous files in one action.
- Derive accurate metadata and a usable thumbnail per asset.
- Present imported assets in a clear, selectable Media Bin.
- Keep media-type handling open/closed via a handler registry.

**Non-Goals:**
- Placing assets on a timeline (Phase 3).
- Drag-and-drop onto tracks (Phase 3).
- Editing or trimming media (Phase 5).

## Decisions

- **Per-`MediaType` handler registry** instead of branching on extension inline: each handler knows how to classify, probe, and produce a thumbnail for its type. Adding a new media kind means registering a handler, not editing the importer.
- **Thumbnails in an OS temp/userData directory** resolved by a main-process IPC call: the renderer never hardcodes paths, keeping the app portable and offline-safe.
- **Audio gets a placeholder thumbnail**; images use themselves; videos use a probed poster frame — so the Media Bin is visually consistent.
- **Reuse existing store actions** (`addAsset`/`removeAsset`) — no `MediaAsset` schema change, preserving Phase 1's contract (closed for modification).
- **Native file dialog via main process** through an IPC handler, returning selected paths the importer then processes.

## Risks / Trade-offs

- [Large batch import blocking the UI] → process files via async IPC; the Media Bin shows assets as each completes.
- [Unsupported or corrupt files] → classification/probe failures are caught per file and skipped without aborting the whole batch.
- [Thumbnail directory growth] → thumbnails live in an OS-managed temp/userData dir; cleanup can be added later without API change.

## Open Questions

- Whether to deduplicate identical files on import (deferred).
- Grid vs. list as the default Media Bin view (default to grid; toggle provided).
