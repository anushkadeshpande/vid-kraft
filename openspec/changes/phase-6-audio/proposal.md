## Why

Video editing is incomplete without audio control. Users need to see audio as waveforms on the timeline, add custom audio tracks (music, voiceover) independent of video, play multiple audio tracks together, and adjust per-clip volume. This builds on the timeline (Phase 3) and the editing operations (Phase 5) and prepares the audio mix for export (Phase 8).

## What Changes

- Add **audio waveform rendering** on audio tracks so users can see audio content and align edits.
- Add **custom audio import and placement**: audio assets (from Phase 2) can be placed on audio tracks independent of any video.
- Add **audio overlap/mixing**: multiple audio tracks can play simultaneously and are mixed together during export.
- Add **per-clip volume control** with a visual indicator on the timeline.

No breaking changes — reuses Phase 1 `Clip.volume`, Phase 2 audio assets, and Phase 3 audio tracks.

## Capabilities

### New Capabilities
- `audio-editing`: Waveform display, independent audio clip placement, multi-track audio mixing, and per-clip volume control.

### Modified Capabilities
<!-- None — `Clip.volume` and audio track support already exist from Phase 1/3. -->

## Impact

- **New code**: waveform generator (FFmpeg/PCM peaks) + renderer (`src/services/` + timeline audio clip view), volume control UI, mixing logic for export.
- **Modified code**: timeline audio lane rendering, clip view (volume handle/indicator), preview/playback audio routing.
- **Services**: FFmpeg service gains a waveform/peaks extraction call; export mix logic (consumed by Phase 8) combines audio tracks.
- **Tests**: unit tests for peak extraction/normalization and volume application under `tests/`.
- **Docs**: `docs/CHANGELOG.md` (6.1–6.4), `docs/summary.md`.
