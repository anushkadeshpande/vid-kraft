## Context

Phase 1 defined `Track` and `Clip` and store actions to add/update/remove them. Phase 2 fills the Media Bin with `MediaAsset`s. The timeline is the spatial/temporal canvas that maps seconds to pixels and lets users compose clips across layers. It must stay in sync with playback state (`currentTime`) so the preview (Phase 4) can render the right frame.

## Goals / Non-Goals

**Goals:**
- Render a time ruler and multiple track lanes that scroll together.
- Let users drag assets from the Media Bin onto tracks and reposition clips.
- Provide a single playhead that both reflects and drives `currentTime`.
- Support snapping to clip edges and the playhead for precise placement.

**Non-Goals:**
- Compositing/preview rendering (Phase 4).
- Trimming clip edges (Phase 5.4) and cut/split (Phase 5).
- Waveform rendering (Phase 6).

## Decisions

- **Pixels-per-second zoom factor** as the single mapping between time and screen space; all ruler ticks, clip widths, and playhead positions derive from it. This keeps time↔pixel conversion testable in isolation.
- **HTML/DOM track lanes** (not canvas) for clips so drag-and-drop, selection, and hit-testing use native events and are accessible; the preview canvas remains separate.
- **Native HTML5 drag-and-drop** from Media Bin to lanes, carrying the `assetId`; dropping creates a `Clip` at the drop time on the target track.
- **Snapping helper** is a pure function (`snap(timeOrX, candidates, threshold)`) so it can be unit-tested and reused for both placement and trimming later.
- **Track type compatibility**: clips can only move to tracks whose type accepts the asset's media kind (e.g. audio assets to audio tracks, visuals to video/overlay tracks).
- **Playhead seeking** updates the store's `currentTime`; the playhead component is a controlled view of playback state.

## Risks / Trade-offs

- [Performance with many clips/long timelines] → render only visible lanes/clips and derive widths cheaply from the zoom factor.
- [Drag precision vs. snapping fighting the user] → snapping only within a small pixel threshold and disabled while a modifier key is held.
- [Time/pixel rounding drift] → centralize conversion in one helper and round only at render time.

## Open Questions

- Default zoom level and zoom controls (basic default now; refined in Phase 9).
- Whether overlapping clips on the same track are allowed (disallow for now; overlays use separate tracks).
