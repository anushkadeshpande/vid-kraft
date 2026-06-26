## Why

With media import in place (Phase 2), users can bring assets into a project but have nowhere to arrange them in time. A timeline with tracks is the heart of any editor: it is where clips are placed, ordered, moved between layers, and scrubbed. Every editing operation (cut, trim, merge, overlays, audio) depends on a working timeline and track model.

## What Changes

- Add a **Timeline** panel: a horizontally scrollable surface with a time ruler, a draggable playhead/scrubber, and stacked track lanes.
- Add a **track system** supporting multiple tracks of type video, audio, and overlay, each with mute/lock/visible state.
- Add **clip placement and dragging**: assets are dragged from the Media Bin onto tracks, clips can be repositioned in time and moved between compatible tracks, with snapping to clip edges and the playhead.
- Add **playhead and scrubbing**: clicking the timeline seeks, dragging the playhead scrubs, and the current time is shown; the playhead position is the shared `currentTime` in playback state.

No breaking changes — builds on the Phase 1 data model (`Track`, `Clip`) and Phase 1 store actions.

## Capabilities

### New Capabilities
- `timeline`: A scrollable time ruler with a draggable playhead and seek/scrub behavior driving playback position.
- `track-system`: Multiple typed track lanes with clip placement, drag-to-move, cross-track moves, and edge/playhead snapping.

### Modified Capabilities
<!-- None — Phase 1 types are reused without changing their requirements. -->

## Impact

- **New code**: `src/components/Timeline/` (ruler, playhead, track lane, clip view), drag-and-drop wiring, snapping helpers in `src/store/utils.ts` or a new `src/core/` helper.
- **Modified code**: `src/App.tsx` (add Timeline to layout), `src/store/projectStore.ts` only via existing track/clip/playback actions.
- **Store**: uses existing track/clip/playback actions; clip placement adds `Clip`s to `Track`s.
- **Tests**: unit tests for snapping/placement helpers and time↔pixel mapping under `tests/`.
- **Docs**: `docs/CHANGELOG.md` (3.1–3.4), `docs/summary.md`.
