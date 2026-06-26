## ADDED Requirements

### Requirement: Audio waveform rendering
The system SHALL render a waveform for each audio clip on the timeline derived from the asset's audio peaks.

#### Scenario: Show waveform for an audio clip
- **WHEN** an audio clip is on an audio track
- **THEN** its lane displays a waveform representing the clip's audio amplitude over time

#### Scenario: Waveform scales with zoom
- **WHEN** the timeline zoom changes
- **THEN** the waveform is redrawn to match the clip's new pixel width

### Requirement: Independent custom audio placement
The system SHALL allow audio assets to be placed on audio tracks independent of any video clip.

#### Scenario: Place audio without video
- **WHEN** the user drops an audio asset onto an audio track
- **THEN** an audio clip is created on that track regardless of what is on video tracks

### Requirement: Multi-track audio mixing
The system SHALL support multiple audio tracks playing simultaneously, and SHALL mix all unmuted audio tracks together during export.

#### Scenario: Overlapping audio tracks
- **WHEN** two or more unmuted audio tracks have clips overlapping in time
- **THEN** the export mixes their audio together at the overlapping times

#### Scenario: Muted track excluded from mix
- **WHEN** an audio track is muted
- **THEN** its audio is excluded from the mix

### Requirement: Per-clip volume control
The system SHALL provide per-clip volume adjustment in the range 0–1 with a visual indicator on the timeline, and apply it during mixing.

#### Scenario: Adjust clip volume
- **WHEN** the user changes a clip's volume
- **THEN** the clip's `volume` updates and a visual indicator reflects the level

#### Scenario: Volume affects the mix
- **WHEN** an audio clip has a volume less than 1
- **THEN** its contribution to the mix is scaled by that volume
