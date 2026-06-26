import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  classifyFile,
  getExtension,
  getFileName,
  importFile,
  importFiles,
  registerMediaTypeHandler,
  getMediaTypeHandler,
  listMediaTypeHandlers,
  type ImportDeps,
  type MediaTypeHandler,
} from '../../src/services/mediaImport'
import type { ProbeResult } from '../../src/services/ffmpeg'

const videoProbe: ProbeResult = {
  duration: 120,
  width: 1920,
  height: 1080,
  codec: 'h264',
  fileSize: 50_000_000,
}

const audioProbe: ProbeResult = {
  duration: 200,
  codec: 'mp3',
  sampleRate: 44100,
  channels: 2,
  fileSize: 5_000_000,
}

const imageProbe: ProbeResult = {
  duration: 0,
  width: 800,
  height: 600,
  codec: 'png',
  fileSize: 120_000,
}

function makeDeps(overrides: Partial<ImportDeps> = {}): ImportDeps {
  return {
    probe: vi.fn().mockResolvedValue(videoProbe),
    generateThumbnail: vi.fn().mockResolvedValue('/thumbs/thumb_1.png'),
    getThumbnailDir: vi.fn().mockResolvedValue('/thumbs'),
    ...overrides,
  }
}

describe('mediaImport — path helpers', () => {
  it('getExtension returns lowercased extension without dot', () => {
    expect(getExtension('/a/b/Movie.MP4')).toBe('mp4')
    expect(getExtension('C:\\videos\\clip.MoV')).toBe('mov')
    expect(getExtension('noext')).toBe('')
  })

  it('getFileName returns the last path segment for posix and windows paths', () => {
    expect(getFileName('/a/b/movie.mp4')).toBe('movie.mp4')
    expect(getFileName('C:\\media\\song.mp3')).toBe('song.mp3')
    expect(getFileName('plain.png')).toBe('plain.png')
  })
})

describe('mediaImport — classification', () => {
  it('classifies video, audio, and image files by extension', () => {
    expect(classifyFile('clip.mp4')).toBe('video')
    expect(classifyFile('clip.mov')).toBe('video')
    expect(classifyFile('song.mp3')).toBe('audio')
    expect(classifyFile('track.wav')).toBe('audio')
    expect(classifyFile('photo.png')).toBe('image')
    expect(classifyFile('photo.jpeg')).toBe('image')
  })

  it('returns undefined for unknown extensions', () => {
    expect(classifyFile('archive.zip')).toBeUndefined()
    expect(classifyFile('document.pdf')).toBeUndefined()
  })
})

describe('mediaImport — importFile', () => {
  it('builds a video MediaAsset with probed metadata and a generated thumbnail', async () => {
    const deps = makeDeps({ probe: vi.fn().mockResolvedValue(videoProbe) })
    const asset = await importFile('/media/clip.mp4', '/thumbs', deps)

    expect(asset).not.toBeNull()
    expect(asset).toMatchObject({
      name: 'clip.mp4',
      path: '/media/clip.mp4',
      type: 'video',
      duration: 120,
      width: 1920,
      height: 1080,
      codec: 'h264',
      thumbnailPath: '/thumbs/thumb_1.png',
      fileSize: 50_000_000,
    })
    expect(asset!.id).toBeTruthy()
    expect(deps.generateThumbnail).toHaveBeenCalledWith('/media/clip.mp4', '/thumbs')
  })

  it('uses the image itself as its thumbnail and forces duration to 0', async () => {
    const deps = makeDeps({ probe: vi.fn().mockResolvedValue(imageProbe) })
    const asset = await importFile('/media/photo.png', '/thumbs', deps)

    expect(asset).toMatchObject({
      type: 'image',
      duration: 0,
      thumbnailPath: '/media/photo.png',
    })
    expect(deps.generateThumbnail).not.toHaveBeenCalled()
  })

  it('gives audio no thumbnail (placeholder handled by UI)', async () => {
    const deps = makeDeps({ probe: vi.fn().mockResolvedValue(audioProbe) })
    const asset = await importFile('/media/song.mp3', '/thumbs', deps)

    expect(asset).toMatchObject({
      type: 'audio',
      duration: 200,
      sampleRate: 44100,
      channels: 2,
      thumbnailPath: undefined,
    })
  })

  it('returns null for an unclassifiable file', async () => {
    const deps = makeDeps()
    const asset = await importFile('/media/archive.zip', '/thumbs', deps)
    expect(asset).toBeNull()
    expect(deps.probe).not.toHaveBeenCalled()
  })

  it('returns null when probing fails', async () => {
    const deps = makeDeps({ probe: vi.fn().mockRejectedValue(new Error('corrupt')) })
    const asset = await importFile('/media/clip.mp4', '/thumbs', deps)
    expect(asset).toBeNull()
  })

  it('still builds the asset when thumbnail generation fails', async () => {
    const deps = makeDeps({
      probe: vi.fn().mockResolvedValue(videoProbe),
      generateThumbnail: vi.fn().mockRejectedValue(new Error('ffmpeg failed')),
    })
    const asset = await importFile('/media/clip.mp4', '/thumbs', deps)
    expect(asset).not.toBeNull()
    expect(asset!.thumbnailPath).toBeUndefined()
  })
})

describe('mediaImport — importFiles (batch)', () => {
  it('imports multiple heterogeneous files at once', async () => {
    const probe = vi.fn((p: string) => {
      if (p.endsWith('.mp4')) return Promise.resolve(videoProbe)
      if (p.endsWith('.mp3')) return Promise.resolve(audioProbe)
      return Promise.resolve(imageProbe)
    })
    const deps = makeDeps({ probe })

    const assets = await importFiles(
      ['/m/clip.mp4', '/m/song.mp3', '/m/photo.png'],
      deps,
    )

    expect(assets).toHaveLength(3)
    expect(assets.map((a) => a.type)).toEqual(['video', 'audio', 'image'])
    expect(deps.getThumbnailDir).toHaveBeenCalledTimes(1)
  })

  it('skips invalid files but imports the rest of the batch', async () => {
    const probe = vi.fn((p: string) => {
      if (p.endsWith('broken.mp4')) return Promise.reject(new Error('corrupt'))
      return Promise.resolve(videoProbe)
    })
    const deps = makeDeps({ probe })

    const assets = await importFiles(
      ['/m/good1.mp4', '/m/unknown.zip', '/m/broken.mp4', '/m/good2.mp4'],
      deps,
    )

    expect(assets).toHaveLength(2)
    expect(assets.map((a) => a.name)).toEqual(['good1.mp4', 'good2.mp4'])
  })
})

describe('mediaImport — open/closed handler registry', () => {
  it('supports a new media type without changing existing import code', async () => {
    // Register a brand-new type by extending the discriminated union for the test.
    const handler = {
      type: 'image',
      extensions: ['heic'],
      createThumbnail: vi.fn().mockResolvedValue('/thumbs/heic.png'),
    } as unknown as MediaTypeHandler
    // Use a distinct type id via casting to avoid clobbering the image handler.
    const customType = 'sticker' as unknown as MediaTypeHandler['type']
    registerMediaTypeHandler({ ...handler, type: customType })

    expect(getMediaTypeHandler(customType)).toBeDefined()
    expect(listMediaTypeHandlers().some((h) => h.type === customType)).toBe(true)
    expect(classifyFile('art.heic')).toBe(customType)

    const deps = makeDeps({ probe: vi.fn().mockResolvedValue(imageProbe) })
    const asset = await importFile('/m/art.heic', '/thumbs', deps)
    expect(asset).toMatchObject({ type: customType, thumbnailPath: '/thumbs/heic.png' })
  })
})
