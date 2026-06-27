// ============================================================
// Trim — adjust a clip's start or end edge within source bounds
// ============================================================

import type { Command } from '../commands'
import { operationRegistry } from '../registry'
import type { Clip, Id, Seconds } from '../types'
import { findClip, type EditingContext } from './context'

/** Smallest allowed on-timeline clip duration after a trim. */
export const MIN_CLIP_DURATION = 0.1

export type TrimEdge = 'start' | 'end'

/** The subset of clip fields a trim changes. */
export interface TrimResult {
  startTime: Seconds
  duration: Seconds
  trimStart: Seconds
  trimEnd: Seconds
}

function clamp(value: number, lower: number, upper: number): number {
  return Math.min(upper, Math.max(lower, value))
}

/**
 * Compute the trimmed clip fields when an edge is dragged by `delta` seconds
 * (positive moves the edge to the right). Result is clamped so the clip stays
 * within `[0, sourceDuration]` and keeps a positive duration. A non-positive
 * `sourceDuration` (e.g. a still image) leaves the end edge unbounded.
 */
export function computeTrim(
  clip: Clip,
  sourceDuration: Seconds,
  edge: TrimEdge,
  delta: Seconds
): TrimResult {
  const base: TrimResult = {
    startTime: clip.startTime,
    duration: clip.duration,
    trimStart: clip.trimStart,
    trimEnd: clip.trimEnd,
  }

  if (edge === 'start') {
    const lower = Math.max(-clip.trimStart, -clip.startTime)
    const upper = clip.duration - MIN_CLIP_DURATION
    const d = clamp(delta, lower, upper)
    return {
      ...base,
      startTime: clip.startTime + d,
      duration: clip.duration - d,
      trimStart: clip.trimStart + d,
    }
  }

  // edge === 'end'
  const bounded = sourceDuration > 0
  const lower = MIN_CLIP_DURATION - clip.duration
  const upper = bounded ? clip.trimEnd : Number.POSITIVE_INFINITY
  const d = clamp(delta, lower, upper)
  return {
    ...base,
    duration: clip.duration + d,
    trimEnd: bounded ? clip.trimEnd - d : 0,
  }
}

/** Create an undoable command that trims `clipId`'s `edge` by `delta` seconds. */
export function createTrimCommand(
  ctx: EditingContext,
  clipId: Id,
  edge: TrimEdge,
  delta: Seconds
): Command {
  const found = findClip(ctx.getTracks(), clipId)
  const trackId = found?.track.id ?? null
  const asset = found
    ? ctx.getAssets().find((a) => a.id === found.clip.assetId)
    : undefined
  // Snapshot the original fields so undo is exact regardless of store mutability.
  const before: TrimResult | null = found
    ? {
        startTime: found.clip.startTime,
        duration: found.clip.duration,
        trimStart: found.clip.trimStart,
        trimEnd: found.clip.trimEnd,
      }
    : null
  const next =
    found && trackId
      ? computeTrim(found.clip, asset?.duration ?? 0, edge, delta)
      : null
  const clipIdRef = found?.clip.id ?? null

  return {
    description: `Trim clip ${edge}`,
    execute() {
      if (!clipIdRef || !trackId || !next) return
      ctx.updateClip(trackId, clipIdRef, next)
    },
    undo() {
      if (!clipIdRef || !trackId || !before) return
      ctx.updateClip(trackId, clipIdRef, before)
    },
  }
}

operationRegistry.register({
  id: 'trim',
  name: 'Trim',
  category: 'edit',
  description: 'Adjust a clip edge within its source bounds',
  createCommand: (ctx: EditingContext, clipId: Id, edge: TrimEdge, delta: Seconds) =>
    createTrimCommand(ctx, clipId, edge, delta),
})
