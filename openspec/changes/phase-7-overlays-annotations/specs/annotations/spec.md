## ADDED Requirements

### Requirement: Annotation tools
The system SHALL provide tools to create freehand, rectangle, arrow, and text annotations, each producing an `Annotation` with type, color, stroke width, geometry, and (for text) content and font size.

#### Scenario: Draw a rectangle annotation
- **WHEN** the user selects the rectangle tool and drags on the preview
- **THEN** a rectangle `Annotation` is created with the drawn bounds, color, and stroke width

#### Scenario: Create a text annotation
- **WHEN** the user selects the text tool and enters text
- **THEN** a text `Annotation` is created with the text content and font size

#### Scenario: Add a new tool without modifying existing ones
- **WHEN** a new annotation tool is added
- **THEN** it integrates without changes to existing tools

### Requirement: Time-bound annotation visibility
Each annotation SHALL be bound to a `timeRange` and SHALL render only while the playhead is within that range.

#### Scenario: Annotation visible within range
- **WHEN** the current time is within an annotation's `timeRange`
- **THEN** the annotation is drawn on the preview

#### Scenario: Annotation hidden outside range
- **WHEN** the current time is outside an annotation's `timeRange`
- **THEN** the annotation is not drawn

### Requirement: Annotation rendering and export burn-in
The system SHALL render annotations on the preview canvas and SHALL burn them into the exported output during their time range via FFmpeg.

#### Scenario: Preview rendering
- **WHEN** an annotation is visible at the current time
- **THEN** it is drawn on the preview canvas matching its geometry and style

#### Scenario: Burned into export
- **WHEN** the project is exported
- **THEN** each annotation appears in the output only during its `timeRange`, matching the preview appearance
