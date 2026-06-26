## ADDED Requirements

### Requirement: Time ruler and horizontal scrolling
The system SHALL render a horizontal, scrollable timeline with a time ruler whose ticks reflect the current zoom (pixels per second).

#### Scenario: Ruler reflects zoom
- **WHEN** the timeline is displayed at a given pixels-per-second zoom
- **THEN** ruler ticks and labels are spaced to represent equal time intervals at that zoom

#### Scenario: Horizontal scroll
- **WHEN** the timeline content is wider than the viewport
- **THEN** the ruler and all track lanes scroll together horizontally

### Requirement: Time and pixel mapping
The system SHALL convert between timeline time (seconds) and horizontal pixels through a single zoom factor used consistently for the ruler, clips, and playhead.

#### Scenario: Time to pixel
- **WHEN** a time in seconds is converted to a pixel offset at a zoom factor
- **THEN** the offset equals seconds multiplied by pixels-per-second

#### Scenario: Pixel to time
- **WHEN** a horizontal pixel offset is converted back to time
- **THEN** the result equals the original time within rounding tolerance

### Requirement: Draggable playhead and scrubbing
The system SHALL show a playhead that the user can drag to scrub, and clicking on the timeline SHALL seek to that position; the playhead reflects and drives the shared playback `currentTime`.

#### Scenario: Click to seek
- **WHEN** the user clicks a position on the timeline
- **THEN** the playhead moves there and `currentTime` updates to the corresponding time

#### Scenario: Drag to scrub
- **WHEN** the user drags the playhead
- **THEN** `currentTime` updates continuously to track the playhead position

#### Scenario: Current time indicator
- **WHEN** the playhead is at a position
- **THEN** the timeline displays the current time value
