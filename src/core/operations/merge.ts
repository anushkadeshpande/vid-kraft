// ============================================================
// Merge — concatenate adjacent clips into one rendered clip
// ============================================================

import type { Command } from '../commands'
import { operationRegistry } from '../registry'
import type { Clip, Id, MediaAsset, Track } from '../types'
import { v4 as uuidv4 } from '../../store/utils'
import type { ConcatSegment, RenderedAsset } from '../../services/ffmpeg'
import type { EditingContext } from './context'

/** Tolerance (seconds) for treating two clip edges as adjacent. */
const ADJACENCY_EPS = 0.01

export interface MergePlan {
  trackId: Id
  /** Clips in timeline order, validated as adjacent. */
  clips: Clip[]
}

/**
 * Validate that the given clips live on one track and are adjacent in time.
 * Returns an ordered plan, or `null` when they cannot be merged.
 */
export function planMerge(tracks: Track[], clipIds: Id[]): MergePlan | null {
  if (clipIds.length < 2) return null

  let track: Track | undefined
  const clips: Clip[] = []
  for (const id of clipIds) {
    const owner = tracks.find((t) => t.clips.some((c) => c.id === id))
    if (!owner) return null
    if (!track) track = owner
    else if (owner.id !== track.id) return null
    clips.push(owner.clips.find((c) => c.id === id)!)
  }
  if (!track) return null

  clips.sort((a, b) => a.startTime - b.startTime)
  for (let i = 1; i < clips.length; i++) {
    const prevEnd = clips[i - 1].startTime + clips[i - 1].duration
    if (Math.abs(clips[i].startTime - prevEnd) > ADJACENCY_EPS) return null
  }
  return { trackId: track.id, clips }
}

/** Build the trimmed source segments for a plan, resolving asset paths. */
export function segmentsForPlan(plan: MergePlan, assets: MediaAsset[]): ConcatSegment[] {
  return plan.clips.map((clip) => {
    const asset = assets.find((a) => a.id === clip.assetId)
    return {
      path: asset?.path ?? '',
      trimStart: clip.trimStart,
      duration: clip.duration,
    }
  })
}

interface MergeParams {
  trackId: Id
  removedClips: Clip[]
  mergedAsset: MediaAsset
  mergedClip: Clip
}

/** Create the undoable command that swaps adjacent clips for the merged clip. */
export function createMergeCommand(ctx: EditingContext, params: MergeParams): Command {
  const { trackId, removedClips, mergedAsset, mergedClip } = params
  return {
    description: 'Merge clips',
    execute() {
      ctx.addAsset(mergedAsset)
      for (const c of removedClips) ctx.removeClip(trackId, c.id)
      ctx.addClip(trackId, mergedClip)
    },
    undo() {
      ctx.removeClip(trackId, mergedClip.id)
      ctx.removeAsset(mergedAsset.id)
      for (const c of removedClips) ctx.addClip(trackId, c)
    },
  }
}

/**
 * Plan, render (via the injected `concat`), and build the merge command.
 * Returns `null` if the clips are not mergeable. Does not execute the command.
 */
export async function runMerge(
  ctx: EditingContext,
  clipIds: Id[],
  concat: (segments: ConcatSegment[]) => Promise<RenderedAsset>
): Promise<Command | null> {
  const plan = planMerge(ctx.getTracks(), clipIds)
  if (!plan) return null

  const segments = segmentsForPlan(plan, ctx.getAssets())
  const rendered = await concat(segments)

  const mergedAsset: MediaAsset = {
    id: uuidv4(),
    name: 'Merged clip',
    path: rendered.path,
    type: 'video',
    duration: rendered.duration,
    width: rendered.width,
    height: rendered.height,
    fileSize: 0,
  }
  const first = plan.clips[0]
  const totalDuration = plan.clips.reduce((sum, c) => sum + c.duration, 0)
  const mergedClip: Clip = {
    id: uuidv4(),
    assetId: mergedAsset.id,
    trackId: plan.trackId,
    startTime: first.startTime,
    duration: totalDuration,
    trimStart: 0,
    trimEnd: 0,
    transform: { ...first.transform },
    volume: first.volume,
  }

  return createMergeCommand(ctx, {
    trackId: plan.trackId,
    removedClips: plan.clips,
    mergedAsset,
    mergedClip,
  })
}

operationRegistry.register({
  id: 'merge',
  name: 'Merge',
  category: 'edit',
  description: 'Concatenate adjacent clips into one',
  createCommand: (ctx: EditingContext, params: MergeParams) =>
    createMergeCommand(ctx, params),
})
