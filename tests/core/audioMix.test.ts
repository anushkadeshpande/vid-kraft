import { describe, it, expect } from 'vitest'
import {
  applyVolume,
  buildAudioMixPlan,
  clampVolume,
  mixSamples,
} from '../../src/core/audioMix'
import type { Clip, MediaAsset, Track } from '../../src/core/types'

function asset(id: string, partial: Partial<MediaAsset> = {}): MediaAsset {
  return {
    id,
    name: id,
    path: `/media/${id}.wav`,
    type: 'audio',
    duration: 10,
    fileSize: 1,
    ...partial,
  }
}

function clip(id: string, trackId: string, partial: Partial<Clip> = {}): Clip {
  return {
    id,
    assetId: id,
    trackId,
    startTime: 0,
    duration: 5,
    trimStart: 0,
    trimEnd: 0,
    transform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, opacity: 1 },
    volume: 1,
    ...partial,
  }
}

function track(id: string, partial: Partial<Track> = {}): Track {
  return {
    id,
    type: 'audio',
    name: id,
    clips: [],
    muted: false,
    locked: false,
    visible: true,
    ...partial,
  }
}

describe('clampVolume', () => {
  it('clamps to the 0..1 range', () => {
    expect(clampVolume(-0.5)).toBe(0)
    expect(clampVolume(1.5)).toBe(1)
    expect(clampVolume(0.3)).toBe(0.3)
  })

  it('treats NaN as silence', () => {
    expect(clampVolume(NaN)).toBe(0)
  })
})

describe('applyVolume', () => {
  it('scales a sample by clamped gain', () => {
    expect(applyVolume(1, 0.5)).toBe(0.5)
    expect(applyVolume(1, 2)).toBe(1)
    expect(applyVolume(0.8, 0)).toBe(0)
  })
})

describe('mixSamples', () => {
  it('sums overlapping samples', () => {
    expect(mixSamples([0.2, 0.3])).toBeCloseTo(0.5)
  })

  it('hard-limits the sum to [-1, 1]', () => {
    expect(mixSamples([0.8, 0.8])).toBe(1)
    expect(mixSamples([-0.7, -0.7])).toBe(-1)
  })
})

describe('buildAudioMixPlan', () => {
  it('includes clips from unmuted audio tracks with their volume', () => {
    const tracks = [
      track('t1', { clips: [clip('a', 't1', { volume: 0.5, startTime: 2, trimStart: 1 })] }),
    ]
    const plan = buildAudioMixPlan(tracks, [asset('a')])
    expect(plan).toEqual([
      {
        clipId: 'a',
        assetId: 'a',
        path: '/media/a.wav',
        timelineStart: 2,
        sourceIn: 1,
        duration: 5,
        volume: 0.5,
      },
    ])
  })

  it('excludes muted audio tracks', () => {
    const tracks = [track('t1', { muted: true, clips: [clip('a', 't1')] })]
    expect(buildAudioMixPlan(tracks, [asset('a')])).toEqual([])
  })

  it('excludes non-audio tracks', () => {
    const tracks = [track('v1', { type: 'video', clips: [clip('a', 'v1')] })]
    expect(buildAudioMixPlan(tracks, [asset('a')])).toEqual([])
  })

  it('skips clips whose asset is missing', () => {
    const tracks = [track('t1', { clips: [clip('missing', 't1')] })]
    expect(buildAudioMixPlan(tracks, [])).toEqual([])
  })

  it('clamps out-of-range clip volume', () => {
    const tracks = [track('t1', { clips: [clip('a', 't1', { volume: 2 })] })]
    const plan = buildAudioMixPlan(tracks, [asset('a')])
    expect(plan[0].volume).toBe(1)
  })
})
