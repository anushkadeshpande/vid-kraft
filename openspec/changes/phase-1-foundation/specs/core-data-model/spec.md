## ADDED Requirements

### Requirement: Canonical media and timeline data model
The system SHALL define a single shared set of TypeScript interfaces that describe all editor entities, and every renderer and main-process module SHALL use these types as the canonical data model.

#### Scenario: Media asset shape
- **WHEN** a media file is imported
- **THEN** it is represented as a `MediaAsset` with `id`, `name`, `path`, `type` (`video` | `audio` | `image`), `duration`, `fileSize`, and optional `width`, `height`, `thumbnailPath`, `codec`, `sampleRate`, `channels`

#### Scenario: Clip references an asset and a track
- **WHEN** a clip is placed on the timeline
- **THEN** it is represented as a `Clip` with `id`, `assetId`, `trackId`, `startTime`, `duration`, `trimStart`, `trimEnd`, a `Transform`, and `volume`

#### Scenario: Project aggregates all state
- **WHEN** the application holds an open project
- **THEN** it is represented as a `Project` containing `id`, `name`, `createdAt`, `updatedAt`, `viewport`, `tracks`, `assets`, and `annotations`

### Requirement: Discriminated media and track types
The data model SHALL constrain media kinds and track kinds to fixed unions so invalid combinations are rejected at compile time.

#### Scenario: Media type union
- **WHEN** code assigns a `MediaType`
- **THEN** only `video`, `audio`, or `image` is permitted

#### Scenario: Track type union
- **WHEN** code assigns a `TrackType`
- **THEN** only `video`, `audio`, or `overlay` is permitted

### Requirement: Time and transform value types
The data model SHALL express timeline positions in seconds and visual placement via a `Transform`, so all features measure time and position consistently.

#### Scenario: Time range
- **WHEN** a time-bound entity (e.g. annotation) is created
- **THEN** its extent is a `TimeRange` with `start` and `end` in seconds

#### Scenario: Transform fields
- **WHEN** a clip or overlay is positioned on the canvas
- **THEN** its `Transform` provides `x`, `y`, `width`, `height`, `rotation`, and `opacity`
