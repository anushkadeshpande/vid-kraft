## Context

Phase 1 gave clips a `volume` field and the data model includes audio tracks; Phase 2 imports audio assets; Phase 3 renders audio lanes. This phase makes audio first-class: visible (waveforms), placeable independently, mixable across tracks, and adjustable per clip. The mixing contract here is what Phase 8 export consumes.

## Goals / Non-Goals

**Goals:**
- Render waveforms for audio clips efficiently.
- Allow audio clips on audio tracks independent of video.
- Define how overlapping audio tracks mix.
- Provide per-clip volume with a visual indicator.

**Non-Goals:**
- Audio effects/EQ/filters beyond volume.
- Real-time multi-track audio playback engine fidelity (best-effort preview; export is authoritative).

## Decisions

- **Precompute waveform peaks** once per asset via FFmpeg (extract PCM and downsample to min/max peaks per pixel bucket), cache them keyed by asset id; the timeline draws cached peaks scaled to zoom. Pure peak-bucketing is unit-testable.
- **Audio clips reuse the `Clip` model** on audio-type tracks; no new entity. Independent placement is just dropping an audio asset onto an audio track.
- **Mixing model**: during export, sample each unmuted audio track at each time and sum samples scaled by each clip's `volume`, with clipping protection (normalize/limit). This is specified now and rendered by FFmpeg in Phase 8 (e.g. `amix`/`volume` filters).
- **Per-clip volume** maps `Clip.volume` (0–1) to a gain; the timeline shows a volume line/handle on the clip.
- **Preview audio** plays the topmost/active audio best-effort; export performs the true multi-track mix.

## Risks / Trade-offs

- [Waveform extraction cost for long files] → compute asynchronously, cache to disk/temp, and show a loading state per clip.
- [Summing audio causes clipping] → apply normalization/limiting in the mix specification and FFmpeg filter chain.
- [Preview vs. export audio mismatch] → document preview as approximate; export mix is authoritative.

## Open Questions

- Peak resolution (samples per bucket) vs. memory — pick a default and allow recompute at higher zoom.
- Whether to support audio fades now (defer; volume only for this phase).
