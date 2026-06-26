## ADDED Requirements

### Requirement: Modular IPC handlers
The system SHALL organize IPC handlers into modules grouped by concern and register them from the main entry point, so new handlers are added without editing unrelated code.

#### Scenario: Register handlers at startup
- **WHEN** the main process starts
- **THEN** all IPC handler modules (FFmpeg, file operations) are registered exactly once

#### Scenario: Add a new handler group
- **WHEN** a new handler module is introduced
- **THEN** it is registered through the central index without modifying existing handler modules

### Requirement: Secure typed renderer API
The renderer SHALL access main-process functionality only through a typed API exposed by the preload context bridge, with Node integration disabled and context isolation enabled.

#### Scenario: Renderer uses window.api
- **WHEN** renderer code needs a main-process capability
- **THEN** it calls a method on the exposed `window.api` whose signature is shared/typed end to end

#### Scenario: Node APIs are not exposed
- **WHEN** the renderer attempts to access `require`, `ipcRenderer`, or Node globals directly
- **THEN** they are unavailable because only the curated `window.api` surface is bridged
