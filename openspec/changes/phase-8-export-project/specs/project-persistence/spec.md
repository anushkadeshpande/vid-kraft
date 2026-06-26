## ADDED Requirements

### Requirement: Save project to JSON
The system SHALL save the full project state (tracks, clips, annotations, viewport, and media references) to a JSON file.

#### Scenario: Save current project
- **WHEN** the user saves the project
- **THEN** a JSON file is written containing the serialized project and media references by path

### Requirement: Load and restore project
The system SHALL load a project JSON file and restore the editor state, re-resolving media references.

#### Scenario: Load a saved project
- **WHEN** the user opens a saved project file
- **THEN** the store state is replaced with the project's tracks, clips, annotations, and viewport

#### Scenario: Round-trip is lossless
- **WHEN** a project is saved and then loaded
- **THEN** the restored project data equals the saved project data for all model fields

#### Scenario: Missing media is flagged
- **WHEN** a referenced media file no longer exists at its saved path on load
- **THEN** the asset is flagged as missing rather than silently dropped
