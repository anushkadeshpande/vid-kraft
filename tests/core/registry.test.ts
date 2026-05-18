import { describe, it, expect, beforeEach } from 'vitest'
import { operationRegistry, OperationDefinition } from '../../src/core/registry'
import { Command } from '../../src/core/commands'

class MockCommand implements Command {
  description = 'mock'
  executed = false
  undone = false

  execute(): void {
    this.executed = true
  }
  undo(): void {
    this.undone = true
  }
}

describe('OperationRegistry', () => {
  beforeEach(() => {
    // Clear registry between tests
    operationRegistry.getAll().forEach((op) => operationRegistry.unregister(op.id))
  })

  const createOp = (id: string, category: OperationDefinition['category'] = 'edit'): OperationDefinition => ({
    id,
    name: `Operation ${id}`,
    category,
    description: `Description for ${id}`,
    createCommand: () => new MockCommand(),
  })

  describe('register', () => {
    it('should register an operation', () => {
      const op = createOp('cut')
      operationRegistry.register(op)
      expect(operationRegistry.has('cut')).toBe(true)
    })

    it('should overwrite if same id is registered again', () => {
      const op1 = createOp('cut')
      const op2 = { ...createOp('cut'), name: 'Updated Cut' }
      operationRegistry.register(op1)
      operationRegistry.register(op2)
      expect(operationRegistry.get('cut')?.name).toBe('Updated Cut')
    })
  })

  describe('unregister', () => {
    it('should remove a registered operation', () => {
      operationRegistry.register(createOp('split'))
      operationRegistry.unregister('split')
      expect(operationRegistry.has('split')).toBe(false)
    })

    it('should do nothing if operation does not exist', () => {
      operationRegistry.unregister('nonexistent')
      expect(operationRegistry.has('nonexistent')).toBe(false)
    })
  })

  describe('get', () => {
    it('should return the operation by id', () => {
      const op = createOp('merge')
      operationRegistry.register(op)
      expect(operationRegistry.get('merge')).toEqual(op)
    })

    it('should return undefined for unknown id', () => {
      expect(operationRegistry.get('unknown')).toBeUndefined()
    })
  })

  describe('getAll', () => {
    it('should return all registered operations', () => {
      operationRegistry.register(createOp('a'))
      operationRegistry.register(createOp('b'))
      operationRegistry.register(createOp('c'))
      expect(operationRegistry.getAll()).toHaveLength(3)
    })

    it('should return empty array when nothing is registered', () => {
      expect(operationRegistry.getAll()).toHaveLength(0)
    })
  })

  describe('getByCategory', () => {
    it('should filter operations by category', () => {
      operationRegistry.register(createOp('cut', 'edit'))
      operationRegistry.register(createOp('volume', 'audio'))
      operationRegistry.register(createOp('split', 'edit'))
      operationRegistry.register(createOp('draw', 'annotation'))

      expect(operationRegistry.getByCategory('edit')).toHaveLength(2)
      expect(operationRegistry.getByCategory('audio')).toHaveLength(1)
      expect(operationRegistry.getByCategory('annotation')).toHaveLength(1)
      expect(operationRegistry.getByCategory('video')).toHaveLength(0)
    })
  })

  describe('has', () => {
    it('should return true for registered operations', () => {
      operationRegistry.register(createOp('test'))
      expect(operationRegistry.has('test')).toBe(true)
    })

    it('should return false for unregistered operations', () => {
      expect(operationRegistry.has('nonexistent')).toBe(false)
    })
  })

  describe('createCommand', () => {
    it('should create a command from the operation factory', () => {
      operationRegistry.register(createOp('cut'))
      const op = operationRegistry.get('cut')!
      const cmd = op.createCommand()
      expect(cmd).toBeInstanceOf(MockCommand)
      cmd.execute()
      expect((cmd as MockCommand).executed).toBe(true)
    })
  })
})
