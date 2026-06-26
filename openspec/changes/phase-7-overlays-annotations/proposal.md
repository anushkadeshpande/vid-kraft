## Why

To create engaging videos, users need to layer content on top of the main video and call out details. Overlays (images/videos placed above the base video with position, scale, and opacity) and annotations (freehand, rectangle, arrow, text bound to a time range) deliver this. They build on multi-layer compositing (Phase 4) and the `Annotation` data model (Phase 1), and must be burned into the output during export (Phase 8).

## What Changes

- Add **image/video overlays**: place images or videos on overlay tracks that render above the main video, with adjustable position, scale, and opacity (via `Transform`).
- Add **annotation tools**: freehand draw, rectangle, arrow, and text. Annotations are time-bound — they appear only during their `timeRange`.
- Add **annotation rendering**: annotations draw on the preview canvas during their time range and are burned into the exported output via FFmpeg filters.

No breaking changes — overlays reuse overlay tracks (Phase 3) and compositing (Phase 4); annotations use the Phase 1 `Annotation` model.

## Capabilities

### New Capabilities
- `overlays`: Place image/video overlays on overlay tracks above the base video with position, scale, and opacity.
- `annotations`: Time-bound freehand/rectangle/arrow/text annotations drawn on the preview and burned into export.

### Modified Capabilities
<!-- None — reuses Phase 1 `Annotation`/`Transform` and Phase 4 compositing. -->

## Impact

- **New code**: `src/components/Annotations/` (tools + overlay editor), annotation store actions wiring, overlay placement UI.
- **Modified code**: Preview compositor (draw overlays in z-order + annotations during time range), export pipeline filters (Phase 8 consumes).
- **Store**: uses existing `annotations` collection and overlay tracks; add/update/remove annotation actions if not already present.
- **Tests**: unit tests for time-range visibility, annotation serialization, and transform math under `tests/`.
- **Docs**: `docs/CHANGELOG.md` (7.1–7.3), `docs/summary.md`.
