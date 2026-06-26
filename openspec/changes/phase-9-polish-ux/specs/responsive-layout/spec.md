## ADDED Requirements

### Requirement: Resizable panels
The system SHALL allow the user to resize the main panels (e.g. Media Bin, Preview, Timeline, Properties) via splitters.

#### Scenario: Resize a panel
- **WHEN** the user drags a splitter between two panels
- **THEN** the panels resize accordingly

### Requirement: Persisted layout
The system SHALL persist the panel layout to `localStorage` and restore it on next launch, falling back to defaults when persisted data is missing or invalid.

#### Scenario: Layout restored on reload
- **WHEN** the user resizes panels and relaunches the app
- **THEN** the previous panel sizes are restored

#### Scenario: Fallback on invalid data
- **WHEN** the persisted layout data is missing or cannot be parsed
- **THEN** the app uses the default layout
