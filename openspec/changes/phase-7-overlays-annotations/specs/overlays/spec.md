## ADDED Requirements

### Requirement: Image/video overlays
The system SHALL allow images or videos to be placed on overlay tracks that render above the base video, with adjustable position, scale, and opacity.

#### Scenario: Place an overlay
- **WHEN** the user places an image or video on an overlay track
- **THEN** it renders above base video tracks in the preview at the current time

#### Scenario: Adjust overlay transform
- **WHEN** the user changes an overlay clip's position, scale, or opacity
- **THEN** the overlay's `Transform` updates and the preview reflects the new placement

#### Scenario: Overlay z-order
- **WHEN** multiple overlays exist on stacked overlay tracks
- **THEN** higher overlay tracks render above lower ones
