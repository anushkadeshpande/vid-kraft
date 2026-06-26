## ADDED Requirements

### Requirement: Keyboard shortcuts
The system SHALL provide keyboard shortcuts for common actions: Space (play/pause), C (cut), Delete (remove selected), Ctrl+Z (undo), Ctrl+Y (redo), and Ctrl+S (save).

#### Scenario: Play/pause with Space
- **WHEN** the user presses Space while not typing in a text field
- **THEN** playback toggles between playing and paused

#### Scenario: Undo and redo
- **WHEN** the user presses Ctrl+Z or Ctrl+Y
- **THEN** the last command is undone or redone respectively

#### Scenario: Shortcuts ignored while typing
- **WHEN** focus is in a text input and the user presses a shortcut key
- **THEN** the shortcut does not trigger and the keystroke goes to the input
