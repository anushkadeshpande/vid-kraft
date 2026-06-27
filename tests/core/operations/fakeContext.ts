import type { EditingContext } from '../../../src/core/operations/context'
import type { Clip, Id, MediaAsset, Track, Transform } from '../../../src/core/types'

export interface FakeContext extends EditingContext {
  tracks: Track[]
  assets: MediaAsset[]
}

/** An in-memory {@link EditingContext} for testing operations. */
export function makeContext(tracks: Track[] = [], assets: MediaAsset[] = []): FakeContext {
  const ctx: FakeContext = {
    tracks,
    assets,
    getTracks: () => ctx.tracks,
    getAssets: () => ctx.assets,
    addTrack: (t) => {
      ctx.tracks.push(t)
    },
    removeTrack: (id) => {
      ctx.tracks = ctx.tracks.filter((t) => t.id !== id)
    },
    addClip: (trackId, clip) => {
      ctx.tracks.find((t) => t.id === trackId)?.clips.push(clip)
    },
    removeClip: (trackId, clipId) => {
      const t = ctx.tracks.find((tr) => tr.id === trackId)
      if (t) t.clips = t.clips.filter((c) => c.id !== clipId)
    },
    updateClip: (trackId, clipId, updates) => {
      const c = ctx.tracks.find((t) => t.id === trackId)?.clips.find((c) => c.id === clipId)
      if (c) Object.assign(c, updates)
    },
    addAsset: (a) => {
      ctx.assets.push(a)
    },
    removeAsset: (id) => {
      ctx.assets = ctx.assets.filter((a) => a.id !== id)
    },
  }
  return ctx
}

const defaultTransform: Transform = {
  x: 0,
  y: 0,
  width: 1920,
  height: 1080,
  rotation: 0,
  opacity: 1,
}

export function makeTrack(id: Id, partial: Partial<Track> = {}): Track {
  return {
    id,
    type: 'video',
    name: 'Track',
    clips: [],
    muted: false,
    locked: false,
    visible: true,
    ...partial,
  }
}

export function makeClip(id: Id, trackId: Id, partial: Partial<Clip> = {}): Clip {
  return {
    id,
    assetId: 'asset-1',
    trackId,
    startTime: 0,
    duration: 10,
    trimStart: 0,
    trimEnd: 0,
    transform: { ...defaultTransform },
    volume: 1,
    ...partial,
  }
}

export function makeAsset(id: Id, partial: Partial<MediaAsset> = {}): MediaAsset {
  return {
    id,
    name: 'asset.mp4',
    path: `/media/${id}.mp4`,
    type: 'video',
    duration: 30,
    width: 1920,
    height: 1080,
    fileSize: 1000,
    ...partial,
  }
}
