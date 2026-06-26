## Context

Phase 1 defined `Viewport` and `Transform`; Phase 3 produces a timeline of tracks and clips plus a shared `currentTime`. The preview must, for any given time, find which clips are visible on each track, draw them to a canvas in track order, and present that canvas scaled to fit the chosen output viewport. This is the on-screen approximation of the eventual export (Phase 8).

## Goals / Non-Goals

**Goals:**
- Composite all visible tracks at the playhead into one canvas frame.
- Respect z-order (track stacking) and per-clip `Transform`.
- Let users pick output dimensions; preview fits without distorting aspect ratio.

**Non-Goals:**
- Frame-accurate export rendering (Phase 8 via FFmpeg).
- Annotations overlay (Phase 7).
- Audio mixing/playback sync (Phase 6).

## Decisions

- **Canvas 2D compositing** in the renderer for live preview: cheap, offline, and sufficient for an approximate preview; export uses FFmpeg for accuracy.
- **Clip-at-time resolution is a pure function**: given tracks and a time, return the visible clip per track with its source offset (`trimStart` + elapsed). Pure so it is unit-testable and reused by export.
- **Z-order from track order**: tracks lower in the stack draw first; overlay tracks draw last (on top). The Preview iterates tracks in defined order.
- **Fit-to-viewport scaling** computes a uniform scale = min(availW/viewportW, availH/viewportH) so aspect ratio is preserved with let/pillarboxing.
- **Transform application**: each clip is drawn using its `Transform` (x, y, width, height, rotation, opacity) relative to the viewport coordinate space.
- **Video frame sampling**: hidden `<video>` elements seeked to the clip's source time provide frames drawn to the canvas; images draw directly.

## Risks / Trade-offs

- [Seeking many videos per frame is expensive] → sample only clips visible at the current time and cache decoded elements per asset.
- [Preview vs. export mismatch] → share the clip-at-time and transform math; document that preview is an approximation.
- [High-DPI blurriness] → size the canvas backing store to devicePixelRatio.

## Open Questions

- Whether to cap preview frame rate while scrubbing to save CPU (default: throttle).
- Set of preset viewport sizes to offer (1080p, 720p, 1080×1920, square) — finalize in UI.
