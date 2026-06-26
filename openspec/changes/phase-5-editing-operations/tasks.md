## 1. Operation scaffolding

- [ ] 1.1 Create `src/core/operations/` with a shared pattern: self-register on load and expose a `Command` factory
- [ ] 1.2 Add a barrel/import that ensures all operation modules register at startup

## 2. Structural operations

- [ ] 2.1 Implement Cut (`cut.ts`): split clip at playhead into two; no-op on boundary; with undo
- [ ] 2.2 Implement Trim (`trim.ts`): adjust `trimStart`/`trimEnd`/`duration`/`startTime`, clamped to source bounds; with undo
- [ ] 2.3 Implement Delete (`delete.ts`): remove selected clips; with undo
- [ ] 2.4 Add unit tests for each (execute + undo + edge cases) under `tests/core/operations/`

## 3. Rendered operations

- [ ] 3.1 Implement Merge (`merge.ts`): FFmpeg concat of adjacent clips into one rendered clip; reject non-adjacent; with undo
- [ ] 3.2 Implement Split A/V (`splitAV.ts`): FFmpeg demux into separate audio/video clips on separate tracks; with undo
- [ ] 3.3 Add unit tests mocking the FFmpeg service

## 4. UI wiring

- [ ] 4.1 Add trim handles and clip context actions in the timeline clip view
- [ ] 4.2 Add toolbar buttons (cut, split, merge, delete) invoking registered operations

## 5. Verification

- [ ] 5.1 Run `npm test` and ensure all tests pass
- [ ] 5.2 Run the app and exercise each operation plus undo/redo
- [ ] 5.3 Update `docs/CHANGELOG.md` (5.1–5.5) and `docs/summary.md`
