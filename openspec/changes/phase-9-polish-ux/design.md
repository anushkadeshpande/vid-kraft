## Context

By Phase 9 the editor has all core panels and operations, the command history, and the registry. This phase layers UX on top: input bindings, control affordances, layout management, and visual consistency. It should not change behavior, only how users access and perceive it.

## Goals / Non-Goals

**Goals:**
- Provide discoverable, conflict-free keyboard shortcuts.
- Surface undo/redo as toolbar controls reflecting history state.
- Make panels resizable and persist the arrangement.
- Deliver a cohesive, polished dark theme.

**Non-Goals:**
- New editing capabilities (all defined in prior phases).
- Full theming system with multiple themes (single dark theme now).

## Decisions

- **Central shortcut registry/manager** mapping key combos to actions, registered in one place and consulted by a global key handler; this keeps bindings declarative and testable and avoids scattered `keydown` handlers. Shortcuts respect focus (ignored while typing in inputs).
- **Undo/redo buttons derive enabled state** from `CommandHistory.canUndo()/canRedo()` so the UI always reflects the stack; clicking calls the history.
- **Splitter-based resizable layout** with sizes persisted to `localStorage` under a versioned key; on load, sizes are restored or fall back to defaults if missing/invalid.
- **Theme via CSS custom properties (design tokens)** for colors, spacing, and transitions, applied app-wide so components stay consistent and future tweaks are one place.
- **Loading skeletons** for async areas (thumbnails, waveforms, export) to convey progress.

## Risks / Trade-offs

- [Shortcut conflicts with OS/browser] → choose standard combos, scope to app focus, and prevent default only for handled keys.
- [Corrupt/old persisted layout] → validate parsed `localStorage` and fall back to defaults on error; version the key.
- [Theme regressions across panels] → centralize tokens so changes are global and consistent.

## Open Questions

- Whether to expose a shortcuts cheat-sheet/help overlay (nice-to-have).
- Exact default panel sizes and minimums.
