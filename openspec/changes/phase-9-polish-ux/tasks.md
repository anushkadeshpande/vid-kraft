## 1. Keyboard shortcuts

- [ ] 1.1 Implement a central shortcut manager/hook mapping combos to actions
- [ ] 1.2 Wire Space, C, Delete, Ctrl+Z, Ctrl+Y, Ctrl+S; ignore while typing in inputs
- [ ] 1.3 Add unit tests for shortcut mapping and input-focus suppression

## 2. Undo/redo UI

- [ ] 2.1 Add undo/redo toolbar buttons wired to `CommandHistory`
- [ ] 2.2 Derive enabled state from `canUndo()/canRedo()`; add tests

## 3. Responsive layout

- [ ] 3.1 Add splitter-based resizable panels (Media Bin, Preview, Timeline, Properties)
- [ ] 3.2 Persist/restore layout in `localStorage` with validation + defaults fallback
- [ ] 3.3 Add unit tests for layout persistence load/save

## 4. Theme polish

- [ ] 4.1 Define theme tokens (CSS custom properties) and apply app-wide
- [ ] 4.2 Add hover states, transitions, and loading skeletons for async areas

## 5. Verification

- [ ] 5.1 Run `npm test` and ensure all tests pass
- [ ] 5.2 Run the app and verify shortcuts, undo/redo, resizable persisted layout, theme
- [ ] 5.3 Update `docs/CHANGELOG.md` (9.1–9.4) and `docs/summary.md`
