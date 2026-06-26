## ADDED Requirements

### Requirement: Configurable output viewport
The system SHALL allow the user to set the output viewport dimensions/aspect ratio, and SHALL store the chosen dimensions on the project.

#### Scenario: Change viewport dimensions
- **WHEN** the user selects a new output size (e.g. 1280×720 or 1080×1920)
- **THEN** the project `viewport` updates to those dimensions

#### Scenario: Preset aspect ratios
- **WHEN** the user picks a preset (e.g. 16:9, 9:16, 1:1)
- **THEN** the viewport dimensions are set to match that aspect ratio

### Requirement: Preview fits viewport preserving aspect
The preview canvas SHALL scale the configured viewport to fit the available area while preserving aspect ratio.

#### Scenario: Fit without distortion
- **WHEN** the viewport aspect ratio differs from the available area
- **THEN** the preview is scaled uniformly to fit with letterbox/pillarbox bars and no stretching

#### Scenario: Adapt on viewport change
- **WHEN** the viewport dimensions change
- **THEN** the preview canvas re-fits to the new dimensions immediately
