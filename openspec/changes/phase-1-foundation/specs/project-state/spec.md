## ADDED Requirements

### Requirement: Centralized project store
The system SHALL hold project and UI state in a single centralized, observable store, and components SHALL read and mutate state only through that store.

#### Scenario: Subscribe to state
- **WHEN** a component selects a slice of state from the store
- **THEN** it re-renders only when that slice changes

#### Scenario: Reset between tests
- **WHEN** a test resets the store to its initial state
- **THEN** subsequent assertions start from a known, empty project

### Requirement: Domain mutation actions
The store SHALL expose actions to manage assets, tracks, clips, annotations, playback position, and selection.

#### Scenario: Add and remove assets
- **WHEN** `addAsset` is called with a `MediaAsset`
- **THEN** the asset appears in `project.assets`, and `removeAsset` with its id removes it

#### Scenario: Manage tracks and clips
- **WHEN** track and clip actions are invoked
- **THEN** the corresponding `Track` and `Clip` entries are created, updated, or removed in the project

#### Scenario: Update playback and selection
- **WHEN** playback position or selection actions are invoked
- **THEN** `PlaybackState` and `SelectionState` update accordingly without mutating unrelated state
