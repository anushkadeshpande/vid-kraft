import { describe, it, expect } from 'vitest'
import type { Clip, Track, Transform } from '../../src/core/types'
import {
  resolveClipAtTime,
  orderTracksForDraw,
  resolveVisibleLayers,
  resolveAudibleLayers,
  fitToViewport,
  projectDuration,
  matchViewportPreset,
  VIEWPORT_PRESETS,
} from '../../src/core/preview'

const transform: Transform = { x: 0, y: 0, width: 0, height: 0, rotation: 0, opacity: 1 }

function makeClip(overrides: Partial<Clip> = {}): Clip {
  return {
    id: 'clip-1',
    assetId: 'asset-1',
    trackId: 'track-1',
    startTime: 0,
    duration: 5,
    trimStart: 0,
    trimEnd: 0,
    transform,
    volume: 1,
    ...overrides,
  }
}

function makeTrack(overrides: Partial<Track> = {}): Track {
  return {
    id: 'track-1',
    type: 'video',
    name: 'Video',
    clips: [],
    muted: false,
    locked: false,
    visible: true,
    ...overrides,
  }
}

describe('preview compositing helpers', () => {
  describe('resolveClipAtTime', () => {
    it('selects the clip whose range contains the time', () => {
      const clip = makeClip({ startTime: 2, duration: 4, trimStart: 1 })
      const track = makeTrack({ clips: [clip] })
      const result = resolveClipAtTime(track, 3)
      expect(result?.clip.id).toBe('clip-1')
      // sourceTime = trimStart(1) + elapsed(3 - 2)
      expect(result?.sourceTime).toBe(2)
    })

    it('is start-inclusive', () => {
      const track = makeTrack({ clips: [makeClip({ startTime: 2, duration: 4 })] })
      expect(resolveClipAtTime(track, 2)).not.toBeNull()
    })

    it('is end-exclusive', () => {
      const track = makeTrack({ clips: [makeClip({ startTime: 2, duration: 4 })] })
      expect(resolveClipAtTime(track, 6)).toBeNull()
    })

    it('returns null when no clip occupies the time (gap)', () => {
      const track = makeTrack({ clips: [makeClip({ startTime: 0, duration: 2 })] })
      expect(resolveClipAtTime(track, 5)).toBeNull()
    })
  })

  describe('orderTracksForDraw', () => {
    it('keeps base tracks in order and moves overlays last', () => {
      const a = makeTrack({ id: 'a', type: 'video' })
      const o = makeTrack({ id: 'o', type: 'overlay' })
      const b = makeTrack({ id: 'b', type: 'audio' })
      const order = orderTracksForDraw([a, o, b]).map((t) => t.id)
      expect(order).toEqual(['a', 'b', 'o'])
    })

    it('preserves relative order of multiple overlays (stable)', () => {
      const o1 = makeTrack({ id: 'o1', type: 'overlay' })
      const o2 = makeTrack({ id: 'o2', type: 'overlay' })
      const v = makeTrack({ id: 'v', type: 'video' })
      expect(orderTracksForDraw([o1, o2, v]).map((t) => t.id)).toEqual(['v', 'o1', 'o2'])
    })
  })

  describe('resolveVisibleLayers', () => {
    it('excludes hidden tracks', () => {
      const visible = makeTrack({ id: 'v', clips: [makeClip({ id: 'c1' })] })
      const hidden = makeTrack({ id: 'h', visible: false, clips: [makeClip({ id: 'c2' })] })
      const layers = resolveVisibleLayers([visible, hidden], 1)
      expect(layers.map((l) => l.clip.id)).toEqual(['c1'])
    })

    it('returns layers bottom-to-top with overlays on top', () => {
      const base = makeTrack({ id: 'base', type: 'video', clips: [makeClip({ id: 'cb' })] })
      const over = makeTrack({ id: 'over', type: 'overlay', clips: [makeClip({ id: 'co' })] })
      const layers = resolveVisibleLayers([over, base], 1)
      expect(layers.map((l) => l.clip.id)).toEqual(['cb', 'co'])
    })

    it('contributes nothing for tracks with a gap at the time', () => {
      const t = makeTrack({ clips: [makeClip({ startTime: 0, duration: 2 })] })
      expect(resolveVisibleLayers([t], 5)).toEqual([])
    })
  })

  describe('resolveAudibleLayers', () => {
    it('excludes muted tracks but includes hidden unmuted tracks', () => {
      const audible = makeTrack({ id: 'a', visible: false, clips: [makeClip({ id: 'c1' })] })
      const muted = makeTrack({ id: 'm', muted: true, clips: [makeClip({ id: 'c2' })] })
      const layers = resolveAudibleLayers([audible, muted], 1)
      expect(layers.map((l) => l.clip.id)).toEqual(['c1'])
    })

    it('resolves the source time of the active clip', () => {
      const track = makeTrack({
        type: 'audio',
        clips: [makeClip({ id: 'c', startTime: 2, duration: 4, trimStart: 1 })],
      })
      const layers = resolveAudibleLayers([track], 3)
      expect(layers).toHaveLength(1)
      expect(layers[0].sourceTime).toBe(2)
    })

    it('returns nothing during a gap', () => {
      const t = makeTrack({ type: 'audio', clips: [makeClip({ startTime: 0, duration: 2 })] })
      expect(resolveAudibleLayers([t], 5)).toEqual([])
    })
  })

  describe('fitToViewport', () => {
    it('pillarboxes a 16:9 viewport in a wider area', () => {
      const fit = fitToViewport({ width: 1920, height: 1080 }, { width: 1600, height: 600 })
      // limited by height: scale = 600/1080
      expect(fit.scale).toBeCloseTo(600 / 1080, 6)
      expect(fit.height).toBeCloseTo(600, 6)
      expect(fit.offsetX).toBeGreaterThan(0)
      expect(fit.offsetY).toBeCloseTo(0, 6)
    })

    it('letterboxes a tall viewport in a wide area', () => {
      const fit = fitToViewport({ width: 1080, height: 1920 }, { width: 1000, height: 800 })
      // limited by height: scale = 800/1920
      expect(fit.scale).toBeCloseTo(800 / 1920, 6)
      expect(fit.offsetX).toBeGreaterThan(0)
    })

    it('preserves aspect ratio (no stretching)', () => {
      const fit = fitToViewport({ width: 1000, height: 500 }, { width: 400, height: 400 })
      expect(fit.width / fit.height).toBeCloseTo(2, 6)
    })

    it('returns zeroes for non-positive inputs', () => {
      expect(fitToViewport({ width: 0, height: 0 }, { width: 100, height: 100 }).scale).toBe(0)
      expect(fitToViewport({ width: 100, height: 100 }, { width: 0, height: 0 }).scale).toBe(0)
    })
  })

  describe('projectDuration', () => {
    it('is the latest clip end across all tracks', () => {
      const t1 = makeTrack({ id: 't1', clips: [makeClip({ startTime: 0, duration: 4 })] })
      const t2 = makeTrack({ id: 't2', clips: [makeClip({ startTime: 3, duration: 5 })] })
      expect(projectDuration([t1, t2])).toBe(8)
    })

    it('is 0 with no clips', () => {
      expect(projectDuration([makeTrack()])).toBe(0)
    })
  })

  describe('matchViewportPreset', () => {
    it('matches a known preset by dimensions', () => {
      expect(matchViewportPreset({ width: 1280, height: 720 })?.id).toBe('720p')
    })

    it('returns undefined for custom dimensions', () => {
      expect(matchViewportPreset({ width: 800, height: 600 })).toBeUndefined()
    })

    it('exposes the expected presets', () => {
      expect(VIEWPORT_PRESETS.map((p) => p.id)).toEqual(['1080p', '720p', '9:16', '1:1'])
    })
  })
})
