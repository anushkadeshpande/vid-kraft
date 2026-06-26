## 1. Overlays

- [ ] 1.1 Add overlay placement on overlay tracks (image/video clips)
- [ ] 1.2 Add position/scale/opacity controls writing to clip `Transform`
- [ ] 1.3 Ensure the Preview compositor draws overlays in correct z-order (reuse Phase 4)

## 2. Annotation tools

- [ ] 2.1 Create `src/components/Annotations/` with modular tools: freehand, rectangle, arrow, text
- [ ] 2.2 Wire tools to add/update/remove annotation store actions
- [ ] 2.3 Implement a pure `isVisibleAt(annotation, time)` predicate with unit tests

## 3. Rendering & export

- [ ] 3.1 Draw visible annotations on the preview canvas
- [ ] 3.2 Rasterize annotations per time segment and burn into export via FFmpeg overlay filters
- [ ] 3.3 Add unit tests for time-range visibility and geometry/transform math

## 4. Verification

- [ ] 4.1 Run `npm test` and ensure all tests pass
- [ ] 4.2 Run the app, add overlays/annotations, verify preview and exported burn-in
- [ ] 4.3 Update `docs/CHANGELOG.md` (7.1–7.3) and `docs/summary.md`
