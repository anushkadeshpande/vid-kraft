import { describe, it, expect } from 'vitest'
import { createCutCommand, splitClip } from '../../../src/core/operations/cut'
import { makeClip, makeContext, makeTrack } from './fakeContext'

describe('splitClip', () => {
  it('splits into two halves that reproduce the original', () => {
    const clip = makeClip('c1', 't1', { startTime: 2, duration: 10, trimStart: 1, trimEnd: 3 })
    const res = splitClip(clip, 4, 'L', 'R')!
    expect(res.left).toMatchObject({ id: 'L', startTime: 2, duration: 4, trimStart: 1, trimEnd: 9 })
    expect(res.right).toMatchObject({ id: 'R', startTime: 6, duration: 6, trimStart: 5, trimEnd: 3 })
  })

  it('returns null on a boundary offset', () => {
    const clip = makeClip('c1', 't1', { duration: 10 })
    expect(splitClip(clip, 0, 'L', 'R')).toBeNull()
    expect(splitClip(clip, 10, 'L', 'R')).toBeNull()
    expect(splitClip(clip, 12, 'L', 'R')).toBeNull()
  })
})

describe('createCutCommand', () => {
  it('replaces the clip with two clips meeting at the playhead', () => {
    const clip = makeClip('c1', 't1', { startTime: 0, duration: 10 })
    const track = makeTrack('t1', { clips: [clip] })
    const ctx = makeContext([track])

    const cmd = createCutCommand(ctx, 'c1', 4)
    cmd.execute()

    const clips = ctx.tracks[0].clips
    expect(clips).toHaveLength(2)
    expect(clips[0].duration).toBe(4)
    expect(clips[1].startTime).toBe(4)
    expect(clips[1].duration).toBe(6)
  })

  it('undo restores the original single clip', () => {
    const clip = makeClip('c1', 't1', { startTime: 0, duration: 10 })
    const track = makeTrack('t1', { clips: [clip] })
    const ctx = makeContext([track])

    const cmd = createCutCommand(ctx, 'c1', 4)
    cmd.execute()
    cmd.undo()

    expect(ctx.tracks[0].clips).toHaveLength(1)
    expect(ctx.tracks[0].clips[0]).toBe(clip)
  })

  it('is a no-op when the playhead is on the boundary', () => {
    const clip = makeClip('c1', 't1', { startTime: 0, duration: 10 })
    const track = makeTrack('t1', { clips: [clip] })
    const ctx = makeContext([track])

    const cmd = createCutCommand(ctx, 'c1', 0)
    cmd.execute()
    expect(ctx.tracks[0].clips).toHaveLength(1)
  })
})
