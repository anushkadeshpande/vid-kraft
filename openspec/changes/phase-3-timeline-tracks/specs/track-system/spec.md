## ADDED Requirements

### Requirement: Multiple typed tracks
The system SHALL support multiple track lanes of type video, audio, and overlay, each with mute, lock, and visibility state.

#### Scenario: Add tracks of each type
- **WHEN** the user adds video, audio, and overlay tracks
- **THEN** each appears as its own lane in the timeline with independent mute/lock/visible state

#### Scenario: Locked track rejects edits
- **WHEN** a track is locked
- **THEN** clips on that track cannot be moved or modified until it is unlocked

### Requirement: Clip placement from the Media Bin
The system SHALL allow dragging an asset from the Media Bin onto a compatible track to create a clip at the drop position.

#### Scenario: Drop an asset onto a track
- **WHEN** the user drags an asset onto a compatible track at a time position
- **THEN** a `Clip` referencing that asset is created on the track with `startTime` at the drop time

#### Scenario: Reject incompatible track
- **WHEN** the user drags an audio asset onto a video track (or vice versa for visuals)
- **THEN** the drop is rejected and no clip is created

### Requirement: Move and reposition clips
The system SHALL allow clips to be repositioned in time and moved between compatible tracks, with snapping to clip edges and the playhead.

#### Scenario: Reposition a clip in time
- **WHEN** the user drags a clip horizontally
- **THEN** the clip's `startTime` updates to the new position

#### Scenario: Move a clip to another track
- **WHEN** the user drags a clip onto another compatible track
- **THEN** the clip's `trackId` changes to the target track and it is removed from the source track

#### Scenario: Snap to edges
- **WHEN** a dragged clip edge comes within the snap threshold of another clip's edge or the playhead
- **THEN** the clip aligns exactly to that edge
