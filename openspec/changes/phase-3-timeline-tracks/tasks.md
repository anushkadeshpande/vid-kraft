## 1. Timeline foundation

- [ ] 1.1 Create `src/components/Timeline/` with a scrollable container, time ruler, and pixels-per-second zoom factor
- [ ] 1.2 Implement pure time↔pixel conversion helpers and add unit tests
- [ ] 1.3 Implement a snapping helper (`snap(value, candidates, threshold)`) with unit tests

## 2. Playhead & scrubbing

- [ ] 2.1 Add a draggable playhead bound to playback `currentTime`
- [ ] 2.2 Click-to-seek on the ruler/lanes updates `currentTime`
- [ ] 2.3 Show a current-time indicator

## 3. Track system

- [ ] 3.1 Render track lanes for video/audio/overlay with mute/lock/visible controls
- [ ] 3.2 Enforce locked-track immutability and track-type/media compatibility
- [ ] 3.3 Add/remove tracks via existing store actions

## 4. Clip placement & dragging

- [ ] 4.1 Drag assets from Media Bin onto compatible tracks to create clips (HTML5 DnD carrying assetId)
- [ ] 4.2 Reposition clips in time and move between compatible tracks
- [ ] 4.3 Apply snapping to clip edges and the playhead during drag

## 5. Integration & verification

- [ ] 5.1 Wire Timeline into `src/App.tsx` layout
- [ ] 5.2 Run `npm test` and ensure all tests pass
- [ ] 5.3 Run the app, place and move clips, confirm scrubbing works
- [ ] 5.4 Update `docs/CHANGELOG.md` (3.1–3.4) and `docs/summary.md`
