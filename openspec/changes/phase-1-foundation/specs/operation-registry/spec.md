## ADDED Requirements

### Requirement: Self-registering operation registry
The system SHALL provide a registry where editing operations register themselves by a unique id, so new operations become available without modifying existing code.

#### Scenario: Register an operation
- **WHEN** an operation module registers an operation with a unique id
- **THEN** the operation can be looked up and invoked by that id

#### Scenario: Reject duplicate ids
- **WHEN** an operation is registered with an id that already exists
- **THEN** the registry rejects or signals the conflict rather than silently overwriting

### Requirement: Operation discovery
The registry SHALL allow callers to retrieve a single operation by id and to enumerate all registered operations.

#### Scenario: Look up a missing operation
- **WHEN** a caller requests an operation id that is not registered
- **THEN** the registry returns nothing/undefined rather than throwing

#### Scenario: List operations
- **WHEN** a caller enumerates the registry
- **THEN** all currently registered operations are returned
