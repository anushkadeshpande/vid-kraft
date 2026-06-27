import { describe, it, expect, beforeEach } from 'vitest'
import type { MediaAsset } from '../../src/core/types'
import {
  DEFAULT_IMAGE_DURATION,
  compatibleTrackTypes,
  isAssetCompatibleWithTrack,
  setMediaTrackCompatibility,
  createTrack,
  clipDurationForAsset,
  createClipFromAsset,
} from '../../src/core/tracks'

function makeAsset(overrides: Partial<MediaAsset> = {}): MediaAsset {
  return {
    id: 'asset-1',
    name: 'clip.mp4',
    path: '/media/clip.mp4',
    type: 'video',
    duration: 12,
    width: 1920,
    height: 1080,
    fileSize: 1000,
    ...overrides,
  }
}

describe('track helpers', () => {
  // Restore default compatibility after tests that mutate the registry.
  beforeEach(() => {
    setMediaTrackCompatibility('video', ['video'])
    setMediaTrackCompatibility('image', ['video', 'overlay'])
    setMediaTrackCompatibility('audio', ['audio'])
  })

  describe('compatibility', () => {
    it('maps each media type to its accepting track types', () => {
      expect(compatibleTrackTypes('video')).toEqual(['video'])
      expect(compatibleTrackTypes('image')).toEqual(['video', 'overlay'])
      expect(compatibleTrackTypes('audio')).toEqual(['audio'])
    })

    it('reports asset/track compatibility', () => {
      expect(isAssetCompatibleWithTrack('video', 'video')).toBe(true)
      expect(isAssetCompatibleWithTrack('audio', 'video')).toBe(false)
      expect(isAssetCompatibleWithTrack('image', 'overlay')).toBe(true)
    })

    it('returns a copy so callers cannot mutate the registry', () => {
      const list = compatibleTrackTypes('video')
      list.push('overlay')
      expect(compatibleTrackTypes('video')).toEqual(['video'])
    })

    it('can be extended for new pairings', () => {
      setMediaTrackCompatibility('audio', ['audio', 'overlay'])
      expect(isAssetCompatibleWithTrack('audio', 'overlay')).toBe(true)
    })
  })

  describe('createTrack', () => {
    it('creates an unlocked, visible, empty track with a default name', () => {
      const track = createTrack('audio')
      expect(track.type).toBe('audio')
      expect(track.name).toBe('Audio')
      expect(track.clips).toEqual([])
      expect(track.muted).toBe(false)
      expect(track.locked).toBe(false)
      expect(track.visible).toBe(true)
      expect(track.id).toMatch(/[0-9a-f-]{36}/)
    })

    it('accepts a custom name', () => {
      expect(createTrack('video', 'Main').name).toBe('Main')
    })
  })

  describe('clipDurationForAsset', () => {
    it('uses the asset duration for video/audio', () => {
      expect(clipDurationForAsset(makeAsset({ duration: 9 }))).toBe(9)
    })

    it('uses the default duration for images', () => {
      expect(clipDurationForAsset(makeAsset({ type: 'image', duration: 0 }))).toBe(
        DEFAULT_IMAGE_DURATION
      )
    })

    it('falls back to the default when duration is non-positive', () => {
      expect(clipDurationForAsset(makeAsset({ duration: 0 }))).toBe(DEFAULT_IMAGE_DURATION)
    })
  })

  describe('createClipFromAsset', () => {
    it('places a clip referencing the asset at the start time', () => {
      const asset = makeAsset()
      const clip = createClipFromAsset(asset, 'track-1', 3)
      expect(clip.assetId).toBe('asset-1')
      expect(clip.trackId).toBe('track-1')
      expect(clip.startTime).toBe(3)
      expect(clip.duration).toBe(12)
      expect(clip.trimStart).toBe(0)
      expect(clip.trimEnd).toBe(0)
      expect(clip.volume).toBe(1)
      expect(clip.transform).toMatchObject({ width: 1920, height: 1080, opacity: 1 })
    })

    it('clamps negative start times to 0', () => {
      const clip = createClipFromAsset(makeAsset(), 'track-1', -5)
      expect(clip.startTime).toBe(0)
    })
  })
})
