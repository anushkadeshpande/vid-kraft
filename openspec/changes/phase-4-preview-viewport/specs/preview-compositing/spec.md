## ADDED Requirements

### Requirement: Composite visible tracks at the playhead
The system SHALL render, on a canvas, the composited frame formed by all visible tracks at the current playhead time.

#### Scenario: Render frame at current time
- **WHEN** the playhead is at a given time
- **THEN** the preview draws the visible clip from each visible track for that time onto the canvas

#### Scenario: Hidden tracks are excluded
- **WHEN** a track's visibility is off
- **THEN** its clips are not drawn in the composited frame

#### Scenario: Gaps render empty
- **WHEN** no clip occupies a track at the current time
- **THEN** that track contributes nothing to the frame

### Requirement: Resolve the visible clip at a time
The system SHALL determine, for a given track and time, which clip is visible and the corresponding source offset.

#### Scenario: Clip within its range
- **WHEN** the time falls within a clip's `startTime` and `startTime + duration`
- **THEN** that clip is selected and its source time equals `trimStart` plus elapsed time into the clip

#### Scenario: No clip at the time
- **WHEN** no clip's range contains the time
- **THEN** the resolver returns nothing for that track

### Requirement: Multi-layer z-order compositing
The system SHALL draw overlapping layers in the correct z-order based on track stacking, with overlay tracks rendered above base video tracks, honoring each clip's `Transform`.

#### Scenario: Stacking order
- **WHEN** multiple tracks have visible clips at the playhead
- **THEN** lower tracks are drawn first and higher/overlay tracks are drawn on top

#### Scenario: Transform applied
- **WHEN** a clip has a `Transform` (position, scale, rotation, opacity)
- **THEN** the clip is drawn at that position and scale with that rotation and opacity
