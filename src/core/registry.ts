// ============================================================
// Operation Registry — Plugin system for editing operations
// ============================================================
// New operations register themselves here without modifying
// existing code (Open/Closed Principle).

import { Command } from './commands'

/** Definition of an operation that can be registered */
export interface OperationDefinition {
  /** Unique identifier for the operation */
  id: string
  /** Display name */
  name: string
  /** Category for grouping in UI */
  category: 'edit' | 'audio' | 'video' | 'annotation' | 'export'
  /** Optional keyboard shortcut */
  shortcut?: string
  /** Description shown in UI */
  description?: string
  /** Factory that creates a Command for execution */
  createCommand: (...args: any[]) => Command
}

class OperationRegistryImpl {
  private operations = new Map<string, OperationDefinition>()

  /** Register a new operation */
  register(operation: OperationDefinition): void {
    if (this.operations.has(operation.id)) {
      console.warn(`Operation "${operation.id}" is already registered. Overwriting.`)
    }
    this.operations.set(operation.id, operation)
  }

  /** Unregister an operation */
  unregister(operationId: string): void {
    this.operations.delete(operationId)
  }

  /** Get an operation by ID */
  get(operationId: string): OperationDefinition | undefined {
    return this.operations.get(operationId)
  }

  /** Get all registered operations */
  getAll(): OperationDefinition[] {
    return Array.from(this.operations.values())
  }

  /** Get operations by category */
  getByCategory(category: OperationDefinition['category']): OperationDefinition[] {
    return this.getAll().filter((op) => op.category === category)
  }

  /** Check if an operation is registered */
  has(operationId: string): boolean {
    return this.operations.has(operationId)
  }
}

/** Singleton operation registry */
export const operationRegistry = new OperationRegistryImpl()
