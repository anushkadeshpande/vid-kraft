## 1. Preview component

- [ ] 1.1 Create `src/components/Preview/` with a canvas sized to devicePixelRatio
- [ ] 1.2 Implement pure `resolveClipAtTime(track, time)` helper with unit tests
- [ ] 1.3 Implement per-frame compositing of visible tracks at `currentTime`

## 2. Compositing & z-order

- [ ] 2.1 Draw tracks in stacking order with overlay tracks on top
- [ ] 2.2 Apply each clip's `Transform` (position, scale, rotation, opacity)
- [ ] 2.3 Sample video frames via hidden `<video>` elements; draw images directly; add z-order unit tests

## 3. Viewport configuration

- [ ] 3.1 Add a viewport selector (presets: 1080p, 720p, 9:16, 1:1) calling `setViewport`
- [ ] 3.2 Implement fit-to-viewport scaling math with unit tests (preserve aspect)

## 4. Integration & verification

- [ ] 4.1 Swap `VideoPlayer` for `Preview` in `src/App.tsx`, reuse playback controls
- [ ] 4.2 Run `npm test` and ensure all tests pass
- [ ] 4.3 Run the app, verify multi-track preview and viewport switching
- [ ] 4.4 Update `docs/CHANGELOG.md` (4.1–4.3) and `docs/summary.md`
