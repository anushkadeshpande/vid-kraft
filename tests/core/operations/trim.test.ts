import { describe, it, expect } from 'vitest'
import {
  computeTrim,
  createTrimCommand,
  MIN_CLIP_DURATION,
} from '../../../src/core/operations/trim'
import { makeAsset, makeClip, makeContext, makeTrack } from './fakeContext'

describe('computeTrim', () => {
  it('trims the start edge inward', () => {
    const clip = makeClip('c', 't', { startTime: 5, duration: 10, trimStart: 2, trimEnd: 0 })
    const r = computeTrim(clip, 30, 'start', 3)
    expect(r).toMatchObject({ startTime: 8, duration: 7, trimStart: 5 })
  })

  it('clamps the start edge so it cannot expose before the source', () => {
    const clip = makeClip('c', 't', { startTime: 5, duration: 10, trimStart: 1 })
    const r = computeTrim(clip, 30, 'start', -5)
    // can only move left by trimStart (1)
    expect(r.trimStart).toBe(0)
    expect(r.duration).toBe(11)
  })

  it('trims the end edge inward and adjusts trimEnd', () => {
    const clip = makeClip('c', 't', { duration: 10, trimEnd: 4 })
    const r = computeTrim(clip, 30, 'end', -3)
    expect(r).toMatchObject({ duration: 7, trimEnd: 7 })
  })

  it('clamps the end edge to the source length', () => {
    const clip = makeClip('c', 't', { duration: 10, trimEnd: 2 })
    const r = computeTrim(clip, 30, 'end', 5)
    // can only extend by trimEnd (2)
    expect(r.duration).toBe(12)
    expect(r.trimEnd).toBe(0)
  })

  it('leaves the end unbounded for images (no source duration)', () => {
    const clip = makeClip('c', 't', { duration: 5, trimEnd: 0 })
    const r = computeTrim(clip, 0, 'end', 10)
    expect(r.duration).toBe(15)
    expect(r.trimEnd).toBe(0)
  })

  it('never shrinks below the minimum duration', () => {
    const clip = makeClip('c', 't', { duration: 5, trimEnd: 0 })
    const r = computeTrim(clip, 0, 'end', -100)
    expect(r.duration).toBeCloseTo(MIN_CLIP_DURATION, 5)
  })
})

describe('createTrimCommand', () => {
  it('applies and undoes a trim', () => {
    const clip = makeClip('c', 't', { startTime: 0, duration: 10, trimStart: 0 })
    const track = makeTrack('t', { clips: [clip] })
    const ctx = makeContext([track], [makeAsset('asset-1', { duration: 30 })])

    const cmd = createTrimCommand(ctx, 'c', 'start', 3)
    cmd.execute()
    expect(ctx.tracks[0].clips[0]).toMatchObject({ startTime: 3, duration: 7, trimStart: 3 })

    cmd.undo()
    expect(ctx.tracks[0].clips[0]).toMatchObject({ startTime: 0, duration: 10, trimStart: 0 })
  })
})
