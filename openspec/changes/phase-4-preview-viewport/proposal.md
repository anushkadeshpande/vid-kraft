## Why

The current preview is a single `VideoPlayer` that renders one video. Once a timeline with multiple tracks exists (Phase 3), the preview must show the composited result at the playhead: all visible tracks layered in the correct order, scaled to a configurable output viewport. Users also need to choose the output dimensions (e.g. 1920×1080, 1280×720, 9:16 mobile) so what they see matches what they export.

## What Changes

- Replace the single `VideoPlayer` with a **Preview** component that composites all visible tracks at the current playhead position onto a canvas.
- Add **viewport configuration**: the user can change the output dimensions/aspect ratio, and the preview canvas adapts while preserving aspect ratio within the available space.
- Add **multi-layer compositing**: overlapping video/image layers render in correct z-order based on track stacking, honoring each clip's `Transform` (position, scale, rotation, opacity).

This refactors the preview but keeps the existing playback controls; the old single-file `VideoPlayer` is superseded by `Preview`.

## Capabilities

### New Capabilities
- `preview-compositing`: Render the composited frame of all visible tracks at the current playhead, in track z-order, honoring per-clip transforms.
- `viewport-config`: Configure output viewport dimensions/aspect ratio; the preview scales to fit while preserving aspect.

### Modified Capabilities
<!-- None at the spec level — Phase 1 `Viewport`/`Transform` types are reused unchanged. -->

## Impact

- **New code**: `src/components/Preview/` (canvas compositor, frame sampler), viewport selector UI.
- **Modified code**: `src/App.tsx` (swap `VideoPlayer` for `Preview`), playback controls reused; `VideoPlayer` deprecated/removed once parity is reached.
- **Store**: uses existing `viewport` and `currentTime`; viewport selector calls an existing/added `setViewport` action.
- **Tests**: unit tests for clip-at-time resolution, z-order ordering, and fit-to-viewport scaling math under `tests/`.
- **Docs**: `docs/CHANGELOG.md` (4.1–4.3), `docs/summary.md`.
