## 1. Timeline foundation

- [x] 1.1 Create `src/components/Timeline/` with a scrollable container, time ruler, and pixels-per-second zoom factor
- [x] 1.2 Implement pure time↔pixel conversion helpers and add unit tests
- [x] 1.3 Implement a snapping helper (`snap(value, candidates, threshold)`) with unit tests

## 2. Playhead & scrubbing

- [x] 2.1 Add a draggable playhead bound to playback `currentTime`
- [x] 2.2 Click-to-seek on the ruler/lanes updates `currentTime`
- [x] 2.3 Show a current-time indicator

## 3. Track system

- [x] 3.1 Render track lanes for video/audio/overlay with mute/lock/visible controls
- [x] 3.2 Enforce locked-track immutability and track-type/media compatibility
- [x] 3.3 Add/remove tracks via existing store actions

## 4. Clip placement & dragging

- [x] 4.1 Drag assets from Media Bin onto compatible tracks to create clips (HTML5 DnD carrying assetId)
- [x] 4.2 Reposition clips in time and move between compatible tracks
- [x] 4.3 Apply snapping to clip edges and the playhead during drag

## 5. Integration & verification

- [x] 5.1 Wire Timeline into `src/App.tsx` layout
- [x] 5.2 Run `npm test` and ensure all tests pass
- [ ] 5.3 Run the app, place and move clips, confirm scrubbing works
- [x] 5.4 Update `docs/CHANGELOG.md` (3.1–3.4) and `docs/summary.md`
