import { describe, it, expect, beforeEach } from 'vitest'
import { useProjectStore } from './projectStore'
import type { Track, Clip, MediaAsset, Annotation } from '../core/types'

describe('ProjectStore', () => {
  beforeEach(() => {
    // Reset the store to default state before each test
    useProjectStore.setState({
      project: {
        id: 'test-project',
        name: 'Untitled Project',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        viewport: { width: 1920, height: 1080 },
        tracks: [],
        assets: [],
        annotations: [],
      },
      playback: { isPlaying: false, currentTime: 0, duration: 0 },
      selection: { selectedClipIds: [], selectedTrackId: null, selectedAnnotationId: null },
    })
  })

  const createTrack = (id = 'track-1', type: Track['type'] = 'video'): Track => ({
    id,
    type,
    name: `Track ${id}`,
    clips: [],
    muted: false,
    locked: false,
    visible: true,
  })

  const createClip = (id = 'clip-1'): Clip => ({
    id,
    assetId: 'asset-1',
    trackId: 'track-1',
    startTime: 0,
    duration: 10,
    trimStart: 0,
    trimEnd: 0,
    transform: { x: 0, y: 0, width: 1920, height: 1080, rotation: 0, opacity: 1 },
    volume: 1,
  })

  const createAsset = (id = 'asset-1'): MediaAsset => ({
    id,
    name: 'test.mp4',
    path: '/path/test.mp4',
    type: 'video',
    duration: 60,
    width: 1920,
    height: 1080,
    fileSize: 50000000,
  })

  describe('Project actions', () => {
    it('should have a default project', () => {
      const { project } = useProjectStore.getState()
      expect(project.name).toBe('Untitled Project')
      expect(project.viewport.width).toBe(1920)
    })

    it('should set a new project', () => {
      const newProject = {
        ...useProjectStore.getState().project,
        name: 'New Project',
      }
      useProjectStore.getState().setProject(newProject)
      expect(useProjectStore.getState().project.name).toBe('New Project')
    })

    it('should update viewport', () => {
      useProjectStore.getState().setViewport({ width: 1280, height: 720 })
      const { project } = useProjectStore.getState()
      expect(project.viewport.width).toBe(1280)
      expect(project.viewport.height).toBe(720)
    })

    it('should update timestamp', () => {
      const before = useProjectStore.getState().project.updatedAt
      useProjectStore.getState().updateProjectTimestamp()
      const after = useProjectStore.getState().project.updatedAt
      expect(after).not.toBe(before)
    })
  })

  describe('Track actions', () => {
    it('should add a track', () => {
      useProjectStore.getState().addTrack(createTrack('track-1'))
      expect(useProjectStore.getState().project.tracks).toHaveLength(1)
    })

    it('should remove a track', () => {
      useProjectStore.getState().addTrack(createTrack('track-1'))
      useProjectStore.getState().addTrack(createTrack('track-2'))
      useProjectStore.getState().removeTrack('track-1')
      const tracks = useProjectStore.getState().project.tracks
      expect(tracks).toHaveLength(1)
      expect(tracks[0].id).toBe('track-2')
    })

    it('should update a track', () => {
      useProjectStore.getState().addTrack(createTrack('track-1'))
      useProjectStore.getState().updateTrack('track-1', { name: 'Renamed', muted: true })
      const track = useProjectStore.getState().project.tracks[0]
      expect(track.name).toBe('Renamed')
      expect(track.muted).toBe(true)
    })
  })

  describe('Clip actions', () => {
    it('should add a clip to a track', () => {
      useProjectStore.getState().addTrack(createTrack('track-1'))
      useProjectStore.getState().addClip('track-1', createClip('clip-1'))
      const clips = useProjectStore.getState().project.tracks[0].clips
      expect(clips).toHaveLength(1)
      expect(clips[0].id).toBe('clip-1')
    })

    it('should remove a clip from a track', () => {
      useProjectStore.getState().addTrack(createTrack('track-1'))
      useProjectStore.getState().addClip('track-1', createClip('clip-1'))
      useProjectStore.getState().addClip('track-1', createClip('clip-2'))
      useProjectStore.getState().removeClip('track-1', 'clip-1')
      const clips = useProjectStore.getState().project.tracks[0].clips
      expect(clips).toHaveLength(1)
      expect(clips[0].id).toBe('clip-2')
    })

    it('should update a clip', () => {
      useProjectStore.getState().addTrack(createTrack('track-1'))
      useProjectStore.getState().addClip('track-1', createClip('clip-1'))
      useProjectStore.getState().updateClip('track-1', 'clip-1', { volume: 0.5, startTime: 5 })
      const clip = useProjectStore.getState().project.tracks[0].clips[0]
      expect(clip.volume).toBe(0.5)
      expect(clip.startTime).toBe(5)
    })
  })

  describe('Asset actions', () => {
    it('should add an asset', () => {
      useProjectStore.getState().addAsset(createAsset('asset-1'))
      expect(useProjectStore.getState().project.assets).toHaveLength(1)
    })

    it('should remove an asset', () => {
      useProjectStore.getState().addAsset(createAsset('asset-1'))
      useProjectStore.getState().addAsset(createAsset('asset-2'))
      useProjectStore.getState().removeAsset('asset-1')
      const assets = useProjectStore.getState().project.assets
      expect(assets).toHaveLength(1)
      expect(assets[0].id).toBe('asset-2')
    })
  })

  describe('Annotation actions', () => {
    const createAnnotation = (id = 'ann-1'): Annotation => ({
      id,
      type: 'freehand',
      timeRange: { start: 0, end: 5 },
      color: '#ff0000',
      strokeWidth: 2,
      points: [{ x: 0, y: 0 }],
    })

    it('should add an annotation', () => {
      useProjectStore.getState().addAnnotation(createAnnotation())
      expect(useProjectStore.getState().project.annotations).toHaveLength(1)
    })

    it('should remove an annotation', () => {
      useProjectStore.getState().addAnnotation(createAnnotation('ann-1'))
      useProjectStore.getState().addAnnotation(createAnnotation('ann-2'))
      useProjectStore.getState().removeAnnotation('ann-1')
      const annotations = useProjectStore.getState().project.annotations
      expect(annotations).toHaveLength(1)
      expect(annotations[0].id).toBe('ann-2')
    })
  })

  describe('Playback actions', () => {
    it('should set playing state', () => {
      useProjectStore.getState().setPlaying(true)
      expect(useProjectStore.getState().playback.isPlaying).toBe(true)
    })

    it('should set current time', () => {
      useProjectStore.getState().setCurrentTime(15.5)
      expect(useProjectStore.getState().playback.currentTime).toBe(15.5)
    })

    it('should set duration', () => {
      useProjectStore.getState().setDuration(120)
      expect(useProjectStore.getState().playback.duration).toBe(120)
    })
  })

  describe('Selection actions', () => {
    it('should set selected clips', () => {
      useProjectStore.getState().setSelectedClips(['clip-1', 'clip-2'])
      expect(useProjectStore.getState().selection.selectedClipIds).toEqual(['clip-1', 'clip-2'])
    })

    it('should set selected track', () => {
      useProjectStore.getState().setSelectedTrack('track-1')
      expect(useProjectStore.getState().selection.selectedTrackId).toBe('track-1')
    })

    it('should set selected annotation', () => {
      useProjectStore.getState().setSelectedAnnotation('ann-1')
      expect(useProjectStore.getState().selection.selectedAnnotationId).toBe('ann-1')
    })

    it('should clear selection', () => {
      useProjectStore.getState().setSelectedClips(['clip-1'])
      useProjectStore.getState().setSelectedTrack('track-1')
      useProjectStore.getState().clearSelection()
      const { selection } = useProjectStore.getState()
      expect(selection.selectedClipIds).toEqual([])
      expect(selection.selectedTrackId).toBeNull()
      expect(selection.selectedAnnotationId).toBeNull()
    })
  })
})
