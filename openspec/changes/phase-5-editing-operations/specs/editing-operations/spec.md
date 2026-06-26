## ADDED Requirements

### Requirement: Operations register and are undoable
Each editing operation SHALL register itself with the operation registry and SHALL be executed as a reversible command through the command history.

#### Scenario: Operation is discoverable
- **WHEN** an operation module is loaded
- **THEN** the operation is available from the registry by its id

#### Scenario: Operation is undoable
- **WHEN** an operation is executed and then undone
- **THEN** the project state returns to exactly what it was before the operation

### Requirement: Cut clip at the playhead
The system SHALL split a clip at the playhead position into two adjacent clips on the same track that together reproduce the original.

#### Scenario: Cut in the middle of a clip
- **WHEN** the playhead is within a selected clip and the user cuts
- **THEN** the clip becomes two clips meeting at the playhead, sharing the source with adjusted trim points

#### Scenario: Cut on a boundary is a no-op
- **WHEN** the playhead is exactly on a clip's start or end
- **THEN** no split occurs

### Requirement: Split audio and video streams
The system SHALL separate a clip's audio and video streams into independent clips on separate tracks.

#### Scenario: Split a video-with-audio clip
- **WHEN** the user splits a clip containing both streams
- **THEN** a video-only clip and an audio-only clip are produced on a video track and an audio track respectively

#### Scenario: Undo recombines
- **WHEN** the split is undone
- **THEN** the original combined clip is restored

### Requirement: Merge adjacent clips
The system SHALL concatenate adjacent clips on a track into a single clip rendered via FFmpeg.

#### Scenario: Merge two adjacent clips
- **WHEN** the user merges adjacent clips on the same track
- **THEN** they are replaced by a single clip referencing the rendered concatenation

#### Scenario: Reject non-adjacent merge
- **WHEN** the selected clips are not adjacent on the same track
- **THEN** the merge is rejected

### Requirement: Trim clip edges
The system SHALL allow trimming a clip's start or end by dragging its edges, clamped to the source media bounds.

#### Scenario: Trim the start edge
- **WHEN** the user drags a clip's left edge inward
- **THEN** the clip's `trimStart` and `startTime` adjust and its `duration` shrinks accordingly

#### Scenario: Clamp to source bounds
- **WHEN** a trim would extend past the source media length or create a non-positive duration
- **THEN** the trim is clamped so the clip stays valid

### Requirement: Delete clips
The system SHALL remove selected clips from the timeline, undoably.

#### Scenario: Delete selected clips
- **WHEN** the user deletes the selected clip(s)
- **THEN** the clips are removed from their tracks

#### Scenario: Undo restores deleted clips
- **WHEN** the delete is undone
- **THEN** the removed clips reappear on their original tracks at their original positions
