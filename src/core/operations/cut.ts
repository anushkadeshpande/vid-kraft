// ============================================================
// Cut — split a clip at the playhead into two adjacent clips
// ============================================================

import type { Command } from '../commands'
import { operationRegistry } from '../registry'
import type { Clip, Id, Seconds } from '../types'
import { v4 as uuidv4 } from '../../store/utils'
import { findClip, type EditingContext } from './context'

/**
 * Build the two halves of a clip split `offset` seconds from its start.
 * Together they reproduce the original (shared source, adjusted trims).
 * Returns `null` when the offset is on a boundary (no split).
 */
export function splitClip(
  clip: Clip,
  offset: Seconds,
  leftId: Id,
  rightId: Id
): { left: Clip; right: Clip } | null {
  if (offset <= 0 || offset >= clip.duration) return null
  const remaining = clip.duration - offset
  const left: Clip = {
    ...clip,
    id: leftId,
    duration: offset,
    trimEnd: clip.trimEnd + remaining,
  }
  const right: Clip = {
    ...clip,
    id: rightId,
    startTime: clip.startTime + offset,
    duration: remaining,
    trimStart: clip.trimStart + offset,
  }
  return { left, right }
}

/**
 * Create an undoable command that cuts `clipId` at `playheadTime`.
 * A cut on a clip boundary (or outside the clip) is a no-op.
 */
export function createCutCommand(
  ctx: EditingContext,
  clipId: Id,
  playheadTime: Seconds
): Command {
  const found = findClip(ctx.getTracks(), clipId)
  const original = found?.clip ?? null
  const trackId = found?.track.id ?? null
  const offset = original ? playheadTime - original.startTime : 0
  const halves = original
    ? splitClip(original, offset, uuidv4(), uuidv4())
    : null

  return {
    description: 'Cut clip',
    execute() {
      if (!original || !trackId || !halves) return
      ctx.removeClip(trackId, original.id)
      ctx.addClip(trackId, halves.left)
      ctx.addClip(trackId, halves.right)
    },
    undo() {
      if (!original || !trackId || !halves) return
      ctx.removeClip(trackId, halves.left.id)
      ctx.removeClip(trackId, halves.right.id)
      ctx.addClip(trackId, original)
    },
  }
}

operationRegistry.register({
  id: 'cut',
  name: 'Cut',
  category: 'edit',
  shortcut: 'S',
  description: 'Split the selected clip at the playhead',
  createCommand: (ctx: EditingContext, clipId: Id, playheadTime: Seconds) =>
    createCutCommand(ctx, clipId, playheadTime),
})
