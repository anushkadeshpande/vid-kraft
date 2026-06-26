## ADDED Requirements

### Requirement: Multi-file media import
The system SHALL allow the user to import multiple media files at once through the native file dialog, accepting video, image, and audio files in a single selection.

#### Scenario: Import several files at once
- **WHEN** the user selects multiple video, photo, and audio files in the import dialog
- **THEN** each file is imported and added to the project as a `MediaAsset`

#### Scenario: Skip an invalid file without aborting the batch
- **WHEN** one selected file cannot be classified or probed
- **THEN** that file is skipped and the remaining files in the batch still import successfully

### Requirement: Metadata extraction and classification
On import, the system SHALL classify each file's `MediaType` and probe its metadata via FFmpeg, populating the resulting `MediaAsset`.

#### Scenario: Probe a video file
- **WHEN** a video file is imported
- **THEN** its `MediaAsset` records `type: "video"`, duration, width, height, and codec from the FFmpeg probe

#### Scenario: Classify by media type
- **WHEN** a file is imported
- **THEN** it is assigned `type` of `video`, `audio`, or `image` based on its detected media kind

### Requirement: Thumbnail generation
The system SHALL produce a thumbnail for each imported asset and store it in an OS-managed directory whose path is resolved through the main process.

#### Scenario: Video thumbnail
- **WHEN** a video is imported
- **THEN** a poster-frame thumbnail is generated and `thumbnailPath` is set on the asset

#### Scenario: Image and audio thumbnails
- **WHEN** an image or audio file is imported
- **THEN** the image uses itself as its thumbnail and audio receives a placeholder thumbnail

### Requirement: Open/closed media-type handlers
The import pipeline SHALL be driven by a registry of per-`MediaType` handlers so new media types can be supported without modifying existing import code.

#### Scenario: Add a new media type
- **WHEN** a new media-type handler is registered
- **THEN** the importer can classify, probe, and thumbnail that type without changes to existing handlers

### Requirement: Media Bin panel
The system SHALL present imported assets in a Media Bin panel showing each asset's thumbnail, name, type, duration, and resolution, with selection and per-asset removal, and a grid/list view toggle.

#### Scenario: Display imported assets
- **WHEN** assets exist in the project
- **THEN** the Media Bin renders one card per asset with its thumbnail and metadata

#### Scenario: Remove an asset
- **WHEN** the user removes an asset from the Media Bin
- **THEN** the asset is removed from the project store and disappears from the panel

#### Scenario: Toggle view mode
- **WHEN** the user toggles between grid and list view
- **THEN** the Media Bin re-renders the same assets in the chosen layout
