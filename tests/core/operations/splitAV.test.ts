import { describe, it, expect, vi } from 'vitest'
import { runSplitAV } from '../../../src/core/operations/splitAV'
import type { RenderedAsset } from '../../../src/services/ffmpeg'
import { makeAsset, makeClip, makeContext, makeTrack } from './fakeContext'

const split = (): Promise<{ video: RenderedAsset; audio: RenderedAsset }> =>
  Promise.resolve({
    video: { path: '/v.mp4', duration: 10, width: 1920, height: 1080 },
    audio: { path: '/a.m4a', duration: 10 },
  })

describe('runSplitAV', () => {
  it('produces a video-only and an audio-only clip on separate tracks', async () => {
    const clip = makeClip('c', 'tv', { startTime: 2, duration: 10, volume: 0.5 })
    const videoTrack = makeTrack('tv', { type: 'video', clips: [clip] })
    const audioTrack = makeTrack('ta', { type: 'audio', clips: [] })
    const ctx = makeContext([videoTrack, audioTrack], [makeAsset('asset-1')])

    const cmd = await runSplitAV(ctx, 'c', vi.fn().mockImplementation(split))
    cmd!.execute()

    const v = ctx.tracks.find((t) => t.id === 'tv')!
    const a = ctx.tracks.find((t) => t.id === 'ta')!
    expect(v.clips).toHaveLength(1)
    expect(v.clips[0].assetId).not.toBe('asset-1')
    expect(a.clips).toHaveLength(1)
    expect(a.clips[0].volume).toBe(0.5)
    expect(ctx.assets.map((x) => x.type)).toEqual(expect.arrayContaining(['video', 'audio']))
  })

  it('creates an audio track when none exists and removes it on undo', async () => {
    const clip = makeClip('c', 'tv', { startTime: 0, duration: 10 })
    const videoTrack = makeTrack('tv', { type: 'video', clips: [clip] })
    const ctx = makeContext([videoTrack], [makeAsset('asset-1')])

    const cmd = await runSplitAV(ctx, 'c', vi.fn().mockImplementation(split))
    cmd!.execute()
    expect(ctx.tracks.some((t) => t.type === 'audio')).toBe(true)

    cmd!.undo()
    expect(ctx.tracks).toHaveLength(1)
    expect(ctx.tracks[0].clips[0]).toBe(clip)
    expect(ctx.assets.map((x) => x.id)).toEqual(['asset-1'])
  })

  it('returns null for an unknown clip', async () => {
    const ctx = makeContext([], [])
    expect(await runSplitAV(ctx, 'nope', vi.fn().mockImplementation(split))).toBeNull()
  })
})
