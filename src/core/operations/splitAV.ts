// ============================================================
// Split A/V — separate a clip's video and audio onto two tracks
// ============================================================

import type { Command } from '../commands'
import { operationRegistry } from '../registry'
import type { Clip, Id, MediaAsset, Track } from '../types'
import { v4 as uuidv4 } from '../../store/utils'
import { createTrack } from '../tracks'
import type { RenderedAsset } from '../../services/ffmpeg'
import { findClip, type EditingContext } from './context'

interface SplitParams {
  sourceTrackId: Id
  originalClip: Clip
  /** Newly created tracks to add on execute / remove on undo (may be empty). */
  createdTracks: Track[]
  videoTrackId: Id
  audioTrackId: Id
  videoAsset: MediaAsset
  audioAsset: MediaAsset
  videoClip: Clip
  audioClip: Clip
}

/** Create the undoable command that swaps a clip for its split A/V clips. */
export function createSplitCommand(ctx: EditingContext, params: SplitParams): Command {
  const {
    sourceTrackId,
    originalClip,
    createdTracks,
    videoTrackId,
    audioTrackId,
    videoAsset,
    audioAsset,
    videoClip,
    audioClip,
  } = params

  return {
    description: 'Split audio/video',
    execute() {
      for (const t of createdTracks) ctx.addTrack(t)
      ctx.addAsset(videoAsset)
      ctx.addAsset(audioAsset)
      ctx.removeClip(sourceTrackId, originalClip.id)
      ctx.addClip(videoTrackId, videoClip)
      ctx.addClip(audioTrackId, audioClip)
    },
    undo() {
      ctx.removeClip(videoTrackId, videoClip.id)
      ctx.removeClip(audioTrackId, audioClip.id)
      ctx.addClip(sourceTrackId, originalClip)
      ctx.removeAsset(videoAsset.id)
      ctx.removeAsset(audioAsset.id)
      for (const t of createdTracks) ctx.removeTrack(t.id)
    },
  }
}

/**
 * Render (via the injected `split`) and build the split command for `clipId`.
 * Reuses an existing video/audio track when present, otherwise creates one.
 * Returns `null` when the clip cannot be found. Does not execute the command.
 */
export async function runSplitAV(
  ctx: EditingContext,
  clipId: Id,
  split: (inputPath: string) => Promise<{ video: RenderedAsset; audio: RenderedAsset }>
): Promise<Command | null> {
  const tracks = ctx.getTracks()
  const found = findClip(tracks, clipId)
  if (!found) return null
  const { track: sourceTrack, clip: original } = found

  const asset = ctx.getAssets().find((a) => a.id === original.assetId)
  if (!asset) return null

  const rendered = await split(asset.path)

  const createdTracks: Track[] = []
  let videoTrack = tracks.find((t) => t.type === 'video')
  if (!videoTrack) {
    videoTrack = createTrack('video')
    createdTracks.push(videoTrack)
  }
  let audioTrack = tracks.find((t) => t.type === 'audio')
  if (!audioTrack) {
    audioTrack = createTrack('audio')
    createdTracks.push(audioTrack)
  }

  const videoAsset: MediaAsset = {
    id: uuidv4(),
    name: `${asset.name} (video)`,
    path: rendered.video.path,
    type: 'video',
    duration: rendered.video.duration,
    width: rendered.video.width,
    height: rendered.video.height,
    fileSize: 0,
  }
  const audioAsset: MediaAsset = {
    id: uuidv4(),
    name: `${asset.name} (audio)`,
    path: rendered.audio.path,
    type: 'audio',
    duration: rendered.audio.duration,
    fileSize: 0,
  }

  const videoClip: Clip = {
    id: uuidv4(),
    assetId: videoAsset.id,
    trackId: videoTrack.id,
    startTime: original.startTime,
    duration: original.duration,
    trimStart: 0,
    trimEnd: 0,
    transform: { ...original.transform },
    volume: 1,
  }
  const audioClip: Clip = {
    id: uuidv4(),
    assetId: audioAsset.id,
    trackId: audioTrack.id,
    startTime: original.startTime,
    duration: original.duration,
    trimStart: 0,
    trimEnd: 0,
    transform: { ...original.transform },
    volume: original.volume,
  }

  return createSplitCommand(ctx, {
    sourceTrackId: sourceTrack.id,
    originalClip: original,
    createdTracks,
    videoTrackId: videoTrack.id,
    audioTrackId: audioTrack.id,
    videoAsset,
    audioAsset,
    videoClip,
    audioClip,
  })
}

operationRegistry.register({
  id: 'split-av',
  name: 'Split A/V',
  category: 'edit',
  description: 'Separate a clip into video-only and audio-only clips',
  createCommand: (ctx: EditingContext, params: SplitParams) =>
    createSplitCommand(ctx, params),
})
