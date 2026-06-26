## ADDED Requirements

### Requirement: Main-process FFmpeg operations
The system SHALL run all FFmpeg work in the Electron main process using a bundled FFmpeg binary, never in the renderer, and SHALL expose probe, thumbnail, and export operations.

#### Scenario: Probe media metadata
- **WHEN** the service is asked to probe a media file path
- **THEN** it returns duration, dimensions (when applicable), codec, and audio properties derived from FFmpeg

#### Scenario: Generate a thumbnail
- **WHEN** the service is asked to generate a thumbnail for a media file
- **THEN** it writes an image to an OS-managed directory and returns its path

#### Scenario: Run an export job
- **WHEN** the service is asked to export with input(s) and output options
- **THEN** it invokes FFmpeg and resolves when the output file has been written, or rejects with an error

### Requirement: Typed renderer client
The system SHALL provide a renderer-side FFmpeg client whose methods mirror the main-process operations and are invoked over IPC, so UI code never accesses Node or FFmpeg directly.

#### Scenario: Renderer calls probe through the client
- **WHEN** renderer code calls the client's probe method with a file path
- **THEN** the call is forwarded over IPC to the main process and the typed metadata result is returned

#### Scenario: Errors are surfaced to the caller
- **WHEN** an FFmpeg operation fails in the main process
- **THEN** the renderer client rejects with an error message rather than crashing the app
