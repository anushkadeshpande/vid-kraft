import { describe, it, expect } from 'vitest'
import { createDeleteCommand } from '../../../src/core/operations/delete'
import { makeClip, makeContext, makeTrack } from './fakeContext'

describe('createDeleteCommand', () => {
  it('removes the selected clips', () => {
    const a = makeClip('a', 't1')
    const b = makeClip('b', 't1', { startTime: 10 })
    const track = makeTrack('t1', { clips: [a, b] })
    const ctx = makeContext([track])

    const cmd = createDeleteCommand(ctx, ['a'])
    cmd.execute()
    expect(ctx.tracks[0].clips.map((c) => c.id)).toEqual(['b'])
  })

  it('undo restores deleted clips on their original tracks', () => {
    const a = makeClip('a', 't1')
    const b = makeClip('b', 't2', { startTime: 4 })
    const t1 = makeTrack('t1', { clips: [a] })
    const t2 = makeTrack('t2', { clips: [b] })
    const ctx = makeContext([t1, t2])

    const cmd = createDeleteCommand(ctx, ['a', 'b'])
    cmd.execute()
    expect(ctx.tracks[0].clips).toHaveLength(0)
    expect(ctx.tracks[1].clips).toHaveLength(0)

    cmd.undo()
    expect(ctx.tracks[0].clips[0]).toBe(a)
    expect(ctx.tracks[1].clips[0]).toBe(b)
  })

  it('ignores unknown clip ids', () => {
    const track = makeTrack('t1', { clips: [makeClip('a', 't1')] })
    const ctx = makeContext([track])
    const cmd = createDeleteCommand(ctx, ['nope'])
    cmd.execute()
    expect(ctx.tracks[0].clips).toHaveLength(1)
  })
})
