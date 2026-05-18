import { describe, it, expect } from 'vitest'
import type {
  Project,
  Track,
  Clip,
  MediaAsset,
  Annotation,
  Viewport,
  TimeRange,
  Transform,
  PlaybackState,
  SelectionState,
  Point,
} from '../../src/core/types'

describe('Core Types', () => {
  describe('TimeRange', () => {
    it('should represent a time range with start and end', () => {
      const range: TimeRange = { start: 0, end: 10 }
      expect(range.start).toBe(0)
      expect(range.end).toBe(10)
    })
  })

  describe('Viewport', () => {
    it('should hold width and height', () => {
      const viewport: Viewport = { width: 1920, height: 1080 }
      expect(viewport.width).toBe(1920)
      expect(viewport.height).toBe(1080)
    })
  })

  describe('Transform', () => {
    it('should hold position, size, rotation, and opacity', () => {
      const transform: Transform = { x: 0, y: 0, width: 640, height: 360, rotation: 0, opacity: 1 }
      expect(transform.x).toBe(0)
      expect(transform.width).toBe(640)
      expect(transform.rotation).toBe(0)
      expect(transform.opacity).toBe(1)
    })
  })

  describe('MediaAsset', () => {
    it('should represent a video asset', () => {
      const asset: MediaAsset = {
        id: 'asset-1',
        name: 'test.mp4',
        path: '/media/test.mp4',
        type: 'video',
        duration: 120,
        width: 1920,
        height: 1080,
        codec: 'h264',
        fileSize: 50000000,
      }
      expect(asset.type).toBe('video')
      expect(asset.duration).toBe(120)
      expect(asset.width).toBe(1920)
    })

    it('should represent an audio asset', () => {
      const asset: MediaAsset = {
        id: 'asset-2',
        name: 'music.mp3',
        path: '/media/music.mp3',
        type: 'audio',
        duration: 240,
        sampleRate: 44100,
        channels: 2,
        fileSize: 8000000,
      }
      expect(asset.type).toBe('audio')
      expect(asset.sampleRate).toBe(44100)
      expect(asset.channels).toBe(2)
    })

    it('should represent an image asset with duration 0', () => {
      const asset: MediaAsset = {
        id: 'asset-3',
        name: 'photo.png',
        path: '/media/photo.png',
        type: 'image',
        duration: 0,
        width: 800,
        height: 600,
        fileSize: 2000000,
      }
      expect(asset.type).toBe('image')
      expect(asset.duration).toBe(0)
    })
  })

  describe('Clip', () => {
    it('should represent a clip on a track', () => {
      const clip: Clip = {
        id: 'clip-1',
        assetId: 'asset-1',
        trackId: 'track-1',
        startTime: 5,
        duration: 10,
        trimStart: 2,
        trimEnd: 3,
        transform: { x: 0, y: 0, width: 1920, height: 1080, rotation: 0, opacity: 1 },
        volume: 0.8,
      }
      expect(clip.startTime).toBe(5)
      expect(clip.duration).toBe(10)
      expect(clip.trimStart).toBe(2)
      expect(clip.volume).toBe(0.8)
    })
  })

  describe('Track', () => {
    it('should represent a video track with clips', () => {
      const track: Track = {
        id: 'track-1',
        type: 'video',
        name: 'Video 1',
        clips: [],
        muted: false,
        locked: false,
        visible: true,
      }
      expect(track.type).toBe('video')
      expect(track.clips).toHaveLength(0)
      expect(track.muted).toBe(false)
    })

    it('should support audio and overlay types', () => {
      const audioTrack: Track = {
        id: 'track-2',
        type: 'audio',
        name: 'Audio 1',
        clips: [],
        muted: false,
        locked: false,
        visible: true,
      }
      const overlayTrack: Track = {
        id: 'track-3',
        type: 'overlay',
        name: 'Overlay 1',
        clips: [],
        muted: false,
        locked: false,
        visible: true,
      }
      expect(audioTrack.type).toBe('audio')
      expect(overlayTrack.type).toBe('overlay')
    })
  })

  describe('Annotation', () => {
    it('should represent a freehand annotation', () => {
      const annotation: Annotation = {
        id: 'ann-1',
        type: 'freehand',
        timeRange: { start: 5, end: 10 },
        color: '#ff0000',
        strokeWidth: 3,
        points: [{ x: 0, y: 0 }, { x: 10, y: 10 }],
      }
      expect(annotation.type).toBe('freehand')
      expect(annotation.points).toHaveLength(2)
    })

    it('should represent a text annotation', () => {
      const annotation: Annotation = {
        id: 'ann-2',
        type: 'text',
        timeRange: { start: 0, end: 5 },
        color: '#ffffff',
        strokeWidth: 0,
        points: [{ x: 100, y: 100 }],
        text: 'Hello World',
        fontSize: 24,
      }
      expect(annotation.text).toBe('Hello World')
      expect(annotation.fontSize).toBe(24)
    })
  })

  describe('Project', () => {
    it('should represent a full project', () => {
      const project: Project = {
        id: 'proj-1',
        name: 'My Video',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        viewport: { width: 1920, height: 1080 },
        tracks: [],
        assets: [],
        annotations: [],
      }
      expect(project.name).toBe('My Video')
      expect(project.viewport.width).toBe(1920)
      expect(project.tracks).toHaveLength(0)
    })
  })

  describe('PlaybackState', () => {
    it('should hold playback info', () => {
      const state: PlaybackState = { isPlaying: true, currentTime: 5.5, duration: 120 }
      expect(state.isPlaying).toBe(true)
      expect(state.currentTime).toBe(5.5)
    })
  })

  describe('SelectionState', () => {
    it('should track selected items', () => {
      const state: SelectionState = {
        selectedClipIds: ['clip-1', 'clip-2'],
        selectedTrackId: 'track-1',
        selectedAnnotationId: null,
      }
      expect(state.selectedClipIds).toHaveLength(2)
      expect(state.selectedTrackId).toBe('track-1')
      expect(state.selectedAnnotationId).toBeNull()
    })
  })
})
