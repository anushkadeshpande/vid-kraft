import { describe, it, expect, vi } from 'vitest'
import { planMerge, segmentsForPlan, runMerge } from '../../../src/core/operations/merge'
import type { RenderedAsset } from '../../../src/services/ffmpeg'
import { makeAsset, makeClip, makeContext, makeTrack } from './fakeContext'

describe('planMerge', () => {
  it('orders adjacent clips on the same track', () => {
    const a = makeClip('a', 't1', { startTime: 0, duration: 5 })
    const b = makeClip('b', 't1', { startTime: 5, duration: 5 })
    const track = makeTrack('t1', { clips: [b, a] })
    const plan = planMerge([track], ['b', 'a'])
    expect(plan?.clips.map((c) => c.id)).toEqual(['a', 'b'])
  })

  it('rejects non-adjacent clips', () => {
    const a = makeClip('a', 't1', { startTime: 0, duration: 5 })
    const b = makeClip('b', 't1', { startTime: 8, duration: 5 })
    const track = makeTrack('t1', { clips: [a, b] })
    expect(planMerge([track], ['a', 'b'])).toBeNull()
  })

  it('rejects clips on different tracks', () => {
    const a = makeClip('a', 't1', { startTime: 0, duration: 5 })
    const b = makeClip('b', 't2', { startTime: 5, duration: 5 })
    const t1 = makeTrack('t1', { clips: [a] })
    const t2 = makeTrack('t2', { clips: [b] })
    expect(planMerge([t1, t2], ['a', 'b'])).toBeNull()
  })

  it('rejects fewer than two clips', () => {
    const a = makeClip('a', 't1')
    expect(planMerge([makeTrack('t1', { clips: [a] })], ['a'])).toBeNull()
  })
})

describe('segmentsForPlan', () => {
  it('resolves source paths and trims', () => {
    const a = makeClip('a', 't1', { startTime: 0, duration: 5, trimStart: 1, assetId: 'asset-1' })
    const b = makeClip('b', 't1', { startTime: 5, duration: 5, trimStart: 2, assetId: 'asset-1' })
    const plan = { trackId: 't1', clips: [a, b] }
    const segs = segmentsForPlan(plan, [makeAsset('asset-1', { path: '/x.mp4' })])
    expect(segs).toEqual([
      { path: '/x.mp4', trimStart: 1, duration: 5 },
      { path: '/x.mp4', trimStart: 2, duration: 5 },
    ])
  })
})

describe('runMerge', () => {
  const rendered: RenderedAsset = { path: '/merged.mp4', duration: 10, width: 1920, height: 1080 }

  it('renders and swaps adjacent clips for a single merged clip', async () => {
    const a = makeClip('a', 't1', { startTime: 0, duration: 5 })
    const b = makeClip('b', 't1', { startTime: 5, duration: 5 })
    const track = makeTrack('t1', { clips: [a, b] })
    const ctx = makeContext([track], [makeAsset('asset-1')])
    const concat = vi.fn().mockResolvedValue(rendered)

    const cmd = await runMerge(ctx, ['a', 'b'], concat)
    expect(concat).toHaveBeenCalledOnce()
    cmd!.execute()

    expect(ctx.tracks[0].clips).toHaveLength(1)
    expect(ctx.tracks[0].clips[0]).toMatchObject({ startTime: 0, duration: 10 })
    expect(ctx.assets.some((a) => a.path === '/merged.mp4')).toBe(true)
  })

  it('undo restores the original clips and removes the rendered asset', async () => {
    const a = makeClip('a', 't1', { startTime: 0, duration: 5 })
    const b = makeClip('b', 't1', { startTime: 5, duration: 5 })
    const track = makeTrack('t1', { clips: [a, b] })
    const ctx = makeContext([track], [makeAsset('asset-1')])
    const cmd = await runMerge(ctx, ['a', 'b'], vi.fn().mockResolvedValue(rendered))

    cmd!.execute()
    cmd!.undo()

    expect(ctx.tracks[0].clips.map((c) => c.id)).toEqual(['a', 'b'])
    expect(ctx.assets.some((a) => a.path === '/merged.mp4')).toBe(false)
  })

  it('returns null for non-adjacent clips without rendering', async () => {
    const a = makeClip('a', 't1', { startTime: 0, duration: 5 })
    const b = makeClip('b', 't1', { startTime: 9, duration: 5 })
    const track = makeTrack('t1', { clips: [a, b] })
    const ctx = makeContext([track], [makeAsset('asset-1')])
    const concat = vi.fn()
    expect(await runMerge(ctx, ['a', 'b'], concat)).toBeNull()
    expect(concat).not.toHaveBeenCalled()
  })
})
