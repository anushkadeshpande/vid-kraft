import { describe, it, expect, beforeEach } from 'vitest'
import { Command, CommandHistory } from './commands'

/** A simple test command for incrementing/decrementing a counter */
class IncrementCommand implements Command {
  description = 'Increment counter'
  private target: { value: number }

  constructor(target: { value: number }) {
    this.target = target
  }

  execute(): void {
    this.target.value++
  }

  undo(): void {
    this.target.value--
  }
}

class SetValueCommand implements Command {
  description: string
  private target: { value: number }
  private newValue: number
  private previousValue: number = 0

  constructor(target: { value: number }, newValue: number) {
    this.target = target
    this.newValue = newValue
    this.description = `Set value to ${newValue}`
  }

  execute(): void {
    this.previousValue = this.target.value
    this.target.value = this.newValue
  }

  undo(): void {
    this.target.value = this.previousValue
  }
}

describe('CommandHistory', () => {
  let history: CommandHistory
  let counter: { value: number }

  beforeEach(() => {
    history = new CommandHistory()
    counter = { value: 0 }
  })

  describe('execute', () => {
    it('should execute a command', () => {
      history.execute(new IncrementCommand(counter))
      expect(counter.value).toBe(1)
    })

    it('should execute multiple commands in sequence', () => {
      history.execute(new IncrementCommand(counter))
      history.execute(new IncrementCommand(counter))
      history.execute(new IncrementCommand(counter))
      expect(counter.value).toBe(3)
    })
  })

  describe('undo', () => {
    it('should undo the last command', () => {
      history.execute(new IncrementCommand(counter))
      expect(counter.value).toBe(1)

      history.undo()
      expect(counter.value).toBe(0)
    })

    it('should undo multiple commands in reverse order', () => {
      history.execute(new SetValueCommand(counter, 10))
      history.execute(new SetValueCommand(counter, 20))
      history.execute(new SetValueCommand(counter, 30))
      expect(counter.value).toBe(30)

      history.undo()
      expect(counter.value).toBe(20)

      history.undo()
      expect(counter.value).toBe(10)

      history.undo()
      expect(counter.value).toBe(0)
    })

    it('should do nothing when undo stack is empty', () => {
      history.undo()
      expect(counter.value).toBe(0)
    })
  })

  describe('redo', () => {
    it('should redo an undone command', () => {
      history.execute(new IncrementCommand(counter))
      history.undo()
      expect(counter.value).toBe(0)

      history.redo()
      expect(counter.value).toBe(1)
    })

    it('should redo multiple undone commands', () => {
      history.execute(new IncrementCommand(counter))
      history.execute(new IncrementCommand(counter))
      history.undo()
      history.undo()
      expect(counter.value).toBe(0)

      history.redo()
      expect(counter.value).toBe(1)

      history.redo()
      expect(counter.value).toBe(2)
    })

    it('should do nothing when redo stack is empty', () => {
      history.redo()
      expect(counter.value).toBe(0)
    })

    it('should clear redo stack on new command', () => {
      history.execute(new IncrementCommand(counter))
      history.execute(new IncrementCommand(counter))
      history.undo()
      expect(counter.value).toBe(1)

      // Execute a new command — redo should be cleared
      history.execute(new SetValueCommand(counter, 99))
      expect(counter.value).toBe(99)
      expect(history.canRedo).toBe(false)

      history.redo()
      expect(counter.value).toBe(99) // no change
    })
  })

  describe('canUndo / canRedo', () => {
    it('should report false when empty', () => {
      expect(history.canUndo).toBe(false)
      expect(history.canRedo).toBe(false)
    })

    it('should report canUndo after execute', () => {
      history.execute(new IncrementCommand(counter))
      expect(history.canUndo).toBe(true)
      expect(history.canRedo).toBe(false)
    })

    it('should report canRedo after undo', () => {
      history.execute(new IncrementCommand(counter))
      history.undo()
      expect(history.canUndo).toBe(false)
      expect(history.canRedo).toBe(true)
    })
  })

  describe('descriptions', () => {
    it('should return null when stacks are empty', () => {
      expect(history.undoDescription).toBeNull()
      expect(history.redoDescription).toBeNull()
    })

    it('should return the description of the top command', () => {
      history.execute(new SetValueCommand(counter, 42))
      expect(history.undoDescription).toBe('Set value to 42')
    })

    it('should return redo description after undo', () => {
      history.execute(new SetValueCommand(counter, 42))
      history.undo()
      expect(history.redoDescription).toBe('Set value to 42')
    })
  })

  describe('clear', () => {
    it('should clear all history', () => {
      history.execute(new IncrementCommand(counter))
      history.execute(new IncrementCommand(counter))
      history.undo()

      history.clear()
      expect(history.canUndo).toBe(false)
      expect(history.canRedo).toBe(false)
    })
  })

  describe('max history limit', () => {
    it('should enforce max history size', () => {
      const smallHistory = new CommandHistory(3)
      smallHistory.execute(new SetValueCommand(counter, 1))
      smallHistory.execute(new SetValueCommand(counter, 2))
      smallHistory.execute(new SetValueCommand(counter, 3))
      smallHistory.execute(new SetValueCommand(counter, 4))

      // Only 3 undos should be possible
      smallHistory.undo()
      expect(counter.value).toBe(3)
      smallHistory.undo()
      expect(counter.value).toBe(2)
      smallHistory.undo()
      expect(counter.value).toBe(1)
      smallHistory.undo() // should do nothing — oldest was evicted
      expect(counter.value).toBe(1)
    })
  })
})
