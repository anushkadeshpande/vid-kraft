## ADDED Requirements

### Requirement: Consistent dark theme
The system SHALL apply a consistent dark theme using shared design tokens for colors, spacing, and transitions across all panels.

#### Scenario: Consistent palette
- **WHEN** any panel renders
- **THEN** it uses the shared theme tokens so colors and spacing are consistent app-wide

#### Scenario: Hover and transitions
- **WHEN** the user hovers interactive elements
- **THEN** they show hover states with smooth transitions

### Requirement: Loading skeletons
The system SHALL show loading skeletons or indicators for asynchronous content such as thumbnails, waveforms, and export.

#### Scenario: Skeleton while loading
- **WHEN** asynchronous content is still loading
- **THEN** a loading skeleton/indicator is shown until the content is ready
