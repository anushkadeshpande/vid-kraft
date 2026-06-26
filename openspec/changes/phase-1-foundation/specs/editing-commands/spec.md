## ADDED Requirements

### Requirement: Reversible command interface
The system SHALL model every mutating editing operation as a command that can apply and reverse its effect, so any edit can be undone.

#### Scenario: Execute a command
- **WHEN** a command's execute method is invoked
- **THEN** the command applies its change to the project state

#### Scenario: Undo a command
- **WHEN** a command's undo method is invoked after execute
- **THEN** the project state returns to what it was before the command executed

### Requirement: Undo/redo history stack
The system SHALL maintain a command history that supports undo and redo across executed commands.

#### Scenario: Execute pushes onto the undo stack
- **WHEN** a command is executed through the history
- **THEN** it becomes the next item that undo will reverse

#### Scenario: Undo then redo
- **WHEN** the user undoes a command and then redoes it
- **THEN** the command's effect is removed and then re-applied, leaving state identical to before the undo

#### Scenario: New command clears the redo stack
- **WHEN** a new command is executed after one or more undos
- **THEN** the redo stack is cleared so redo no longer replays the abandoned branch
