## 1. Waveforms

- [x] 1.1 Add an FFmpeg peaks/PCM extraction call in the FFmpeg service
- [x] 1.2 Implement pure peak-bucketing (min/max per pixel) with unit tests; cache per asset id
- [x] 1.3 Render waveforms in the timeline audio clip view, scaling with zoom

## 2. Independent audio placement

- [x] 2.1 Allow dropping audio assets onto audio tracks to create audio clips
- [x] 2.2 Ensure audio clips are independent of video clips

## 3. Mixing & volume

- [x] 3.1 Define and implement the mix model (sum unmuted tracks scaled by volume, with limiting) for export
- [x] 3.2 Add per-clip volume control + timeline indicator wired to `Clip.volume`
- [x] 3.3 Exclude muted tracks from the mix
- [x] 3.4 Add unit tests for volume application and mix scaling

## 4. Verification

- [x] 4.1 Run `npm test` and ensure all tests pass
- [ ] 4.2 Run the app, add audio, view waveforms, adjust volume
- [x] 4.3 Update `docs/CHANGELOG.md` (6.1–6.4) and `docs/summary.md`
