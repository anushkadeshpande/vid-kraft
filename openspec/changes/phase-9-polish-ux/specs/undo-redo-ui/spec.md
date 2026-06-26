## ADDED Requirements

### Requirement: Undo/redo toolbar controls
The system SHALL provide undo and redo toolbar buttons wired to the command history, whose enabled state reflects whether undo/redo is available.

#### Scenario: Buttons reflect availability
- **WHEN** there are no commands to undo or redo
- **THEN** the corresponding button is disabled

#### Scenario: Click to undo
- **WHEN** the user clicks the undo button while undo is available
- **THEN** the most recent command is undone and the buttons update their enabled state
