// ============================================================
// Command Pattern — Enables undo/redo for all operations
// ============================================================

/** Interface that all commands must implement */
export interface Command {
  /** Human-readable description of the command */
  readonly description: string
  /** Execute the command */
  execute(): void
  /** Reverse the command */
  undo(): void
}

/** Manages command history for undo/redo */
export class CommandHistory {
  private undoStack: Command[] = []
  private redoStack: Command[] = []
  private maxHistory: number

  constructor(maxHistory = 100) {
    this.maxHistory = maxHistory
  }

  /** Execute a command and push it onto the undo stack */
  execute(command: Command): void {
    command.execute()
    this.undoStack.push(command)

    // Clear redo stack on new action
    this.redoStack = []

    // Enforce max history
    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift()
    }
  }

  /** Undo the last command */
  undo(): void {
    const command = this.undoStack.pop()
    if (command) {
      command.undo()
      this.redoStack.push(command)
    }
  }

  /** Redo the last undone command */
  redo(): void {
    const command = this.redoStack.pop()
    if (command) {
      command.execute()
      this.undoStack.push(command)
    }
  }

  /** Check if undo is available */
  get canUndo(): boolean {
    return this.undoStack.length > 0
  }

  /** Check if redo is available */
  get canRedo(): boolean {
    return this.redoStack.length > 0
  }

  /** Get description of the next undo action */
  get undoDescription(): string | null {
    const last = this.undoStack[this.undoStack.length - 1]
    return last?.description ?? null
  }

  /** Get description of the next redo action */
  get redoDescription(): string | null {
    const last = this.redoStack[this.redoStack.length - 1]
    return last?.description ?? null
  }

  /** Clear all history */
  clear(): void {
    this.undoStack = []
    this.redoStack = []
  }
}

/** Singleton command history instance */
export const commandHistory = new CommandHistory()
