## ADDED Requirements

### Requirement: Full timeline export
The system SHALL render the complete timeline — all visible tracks, overlays, annotations, and the audio mix — to a single output file via FFmpeg.

#### Scenario: Export composited output
- **WHEN** the user exports a project with multiple tracks, overlays, annotations, and audio
- **THEN** the output file contains the composited video with burned-in overlays/annotations and the mixed audio

#### Scenario: Output matches preview composition
- **WHEN** a project is exported
- **THEN** clip timing, z-order, transforms, and annotation time ranges in the output match the preview composition

### Requirement: Format and codec selection
The system SHALL allow choosing the output format/codec from presets, with a sensible default.

#### Scenario: Choose a format
- **WHEN** the user selects an output format/codec preset
- **THEN** the export produces a file in that format/codec

### Requirement: Export progress and cancellation
The system SHALL report export progress and SHALL allow the user to cancel an in-progress export.

#### Scenario: Progress reported
- **WHEN** an export is running
- **THEN** the UI shows progress advancing toward completion

#### Scenario: Cancel an export
- **WHEN** the user cancels an in-progress export
- **THEN** the FFmpeg process is terminated and any partial output file is removed
