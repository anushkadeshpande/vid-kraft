## Context

Phase 1 defined `Annotation` (type, timeRange, color, strokeWidth, points, text, fontSize) and `Transform`. Phase 4 composites tracks with z-order and per-clip transforms. Overlays are simply clips on overlay tracks drawn above base video; annotations are a separate vector layer bound to time. Both must render identically in preview and in the exported file.

## Goals / Non-Goals

**Goals:**
- Place image/video overlays with position, scale, and opacity.
- Provide freehand, rectangle, arrow, and text annotation tools.
- Make annotations time-bound and render them in preview.
- Specify how overlays and annotations are burned into export.

**Non-Goals:**
- Keyframed animation of overlays/annotations (static transform per clip/annotation for now).
- Rich text styling beyond size/color.

## Decisions

- **Overlays are clips on overlay tracks** — no new model. The Phase 4 compositor already draws overlay tracks on top; this phase adds the UI to position/scale/opacity via `Transform`.
- **Annotations are a vector layer** stored in `project.annotations`, each with a `timeRange`; a pure `isVisibleAt(annotation, time)` predicate decides rendering. Pure and unit-testable.
- **Annotation geometry uses normalized or viewport coordinates** consistent with the compositor so preview and export align; `points` hold path/bounds, `text`/`fontSize` for text.
- **Export burn-in via FFmpeg filters**: overlays use `overlay`; annotations are rasterized to a transparent PNG per time segment and composited, or expressed via drawbox/drawtext where feasible. The renderer produces the annotation raster to guarantee visual parity with preview.
- **Tools are modular** under `src/components/Annotations/`, each tool handling its own input → `Annotation` creation, so new tools are added without modifying existing ones (Open/Closed).

## Risks / Trade-offs

- [Preview vs. export visual drift] → render annotations to images from the same drawing code used in preview, then overlay in FFmpeg.
- [Complex annotation shapes hard to express as FFmpeg filters] → rasterize to PNG overlays instead of native filters when needed.
- [Time-range boundaries flicker] → use inclusive start / exclusive end consistently in `isVisibleAt`.

## Open Questions

- Coordinate space (normalized 0–1 vs. viewport pixels) — pick one and apply everywhere.
- Whether annotations attach to a clip or to absolute timeline time (default: absolute timeline time).
