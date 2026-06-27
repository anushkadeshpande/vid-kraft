// ============================================================
// Delete — remove selected clips from the timeline (undoable)
// ============================================================

import type { Command } from '../commands'
import { operationRegistry } from '../registry'
import type { Clip, Id } from '../types'
import { findClip, type EditingContext } from './context'

interface RemovedClip {
  trackId: Id
  clip: Clip
}

/** Create an undoable command that deletes the given clips from their tracks. */
export function createDeleteCommand(ctx: EditingContext, clipIds: Id[]): Command {
  const removed: RemovedClip[] = []
  const tracks = ctx.getTracks()
  for (const id of clipIds) {
    const found = findClip(tracks, id)
    if (found) removed.push({ trackId: found.track.id, clip: found.clip })
  }

  return {
    description: removed.length > 1 ? `Delete ${removed.length} clips` : 'Delete clip',
    execute() {
      for (const { trackId, clip } of removed) ctx.removeClip(trackId, clip.id)
    },
    undo() {
      for (const { trackId, clip } of removed) ctx.addClip(trackId, clip)
    },
  }
}

operationRegistry.register({
  id: 'delete',
  name: 'Delete',
  category: 'edit',
  shortcut: 'Delete',
  description: 'Remove the selected clip(s)',
  createCommand: (ctx: EditingContext, clipIds: Id[]) => createDeleteCommand(ctx, clipIds),
})
