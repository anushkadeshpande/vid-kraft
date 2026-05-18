import { create } from 'zustand'
import {
  Project,
  PlaybackState,
  SelectionState,
  Track,
  Clip,
  MediaAsset,
  Annotation,
  Viewport,
  Id,
  Seconds,
} from '../core/types'
import { v4 as uuidv4 } from './utils'

/** Generate a default empty project */
function createDefaultProject(): Project {
  return {
    id: uuidv4(),
    name: 'Untitled Project',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    viewport: { width: 1920, height: 1080 },
    tracks: [],
    assets: [],
    annotations: [],
  }
}

export interface ProjectStore {
  // Project data
  project: Project

  // Playback
  playback: PlaybackState

  // Selection
  selection: SelectionState

  // Project actions
  setProject: (project: Project) => void
  setViewport: (viewport: Viewport) => void
  updateProjectTimestamp: () => void

  // Track actions
  addTrack: (track: Track) => void
  removeTrack: (trackId: Id) => void
  updateTrack: (trackId: Id, updates: Partial<Track>) => void

  // Clip actions
  addClip: (trackId: Id, clip: Clip) => void
  removeClip: (trackId: Id, clipId: Id) => void
  updateClip: (trackId: Id, clipId: Id, updates: Partial<Clip>) => void

  // Asset actions
  addAsset: (asset: MediaAsset) => void
  removeAsset: (assetId: Id) => void

  // Annotation actions
  addAnnotation: (annotation: Annotation) => void
  removeAnnotation: (annotationId: Id) => void

  // Playback actions
  setPlaying: (isPlaying: boolean) => void
  setCurrentTime: (time: Seconds) => void
  setDuration: (duration: Seconds) => void

  // Selection actions
  setSelectedClips: (clipIds: Id[]) => void
  setSelectedTrack: (trackId: Id | null) => void
  setSelectedAnnotation: (annotationId: Id | null) => void
  clearSelection: () => void
}

export const useProjectStore = create<ProjectStore>((set) => ({
  project: createDefaultProject(),

  playback: {
    isPlaying: false,
    currentTime: 0,
    duration: 0,
  },

  selection: {
    selectedClipIds: [],
    selectedTrackId: null,
    selectedAnnotationId: null,
  },

  // Project actions
  setProject: (project) => set({ project }),

  setViewport: (viewport) =>
    set((state) => ({
      project: { ...state.project, viewport, updatedAt: new Date().toISOString() },
    })),

  updateProjectTimestamp: () =>
    set((state) => ({
      project: { ...state.project, updatedAt: new Date().toISOString() },
    })),

  // Track actions
  addTrack: (track) =>
    set((state) => ({
      project: {
        ...state.project,
        tracks: [...state.project.tracks, track],
        updatedAt: new Date().toISOString(),
      },
    })),

  removeTrack: (trackId) =>
    set((state) => ({
      project: {
        ...state.project,
        tracks: state.project.tracks.filter((t) => t.id !== trackId),
        updatedAt: new Date().toISOString(),
      },
    })),

  updateTrack: (trackId, updates) =>
    set((state) => ({
      project: {
        ...state.project,
        tracks: state.project.tracks.map((t) =>
          t.id === trackId ? { ...t, ...updates } : t
        ),
        updatedAt: new Date().toISOString(),
      },
    })),

  // Clip actions
  addClip: (trackId, clip) =>
    set((state) => ({
      project: {
        ...state.project,
        tracks: state.project.tracks.map((t) =>
          t.id === trackId ? { ...t, clips: [...t.clips, clip] } : t
        ),
        updatedAt: new Date().toISOString(),
      },
    })),

  removeClip: (trackId, clipId) =>
    set((state) => ({
      project: {
        ...state.project,
        tracks: state.project.tracks.map((t) =>
          t.id === trackId
            ? { ...t, clips: t.clips.filter((c) => c.id !== clipId) }
            : t
        ),
        updatedAt: new Date().toISOString(),
      },
    })),

  updateClip: (trackId, clipId, updates) =>
    set((state) => ({
      project: {
        ...state.project,
        tracks: state.project.tracks.map((t) =>
          t.id === trackId
            ? {
                ...t,
                clips: t.clips.map((c) =>
                  c.id === clipId ? { ...c, ...updates } : c
                ),
              }
            : t
        ),
        updatedAt: new Date().toISOString(),
      },
    })),

  // Asset actions
  addAsset: (asset) =>
    set((state) => ({
      project: {
        ...state.project,
        assets: [...state.project.assets, asset],
        updatedAt: new Date().toISOString(),
      },
    })),

  removeAsset: (assetId) =>
    set((state) => ({
      project: {
        ...state.project,
        assets: state.project.assets.filter((a) => a.id !== assetId),
        updatedAt: new Date().toISOString(),
      },
    })),

  // Annotation actions
  addAnnotation: (annotation) =>
    set((state) => ({
      project: {
        ...state.project,
        annotations: [...state.project.annotations, annotation],
        updatedAt: new Date().toISOString(),
      },
    })),

  removeAnnotation: (annotationId) =>
    set((state) => ({
      project: {
        ...state.project,
        annotations: state.project.annotations.filter((a) => a.id !== annotationId),
        updatedAt: new Date().toISOString(),
      },
    })),

  // Playback actions
  setPlaying: (isPlaying) =>
    set((state) => ({ playback: { ...state.playback, isPlaying } })),

  setCurrentTime: (currentTime) =>
    set((state) => ({ playback: { ...state.playback, currentTime } })),

  setDuration: (duration) =>
    set((state) => ({ playback: { ...state.playback, duration } })),

  // Selection actions
  setSelectedClips: (clipIds) =>
    set((state) => ({ selection: { ...state.selection, selectedClipIds: clipIds } })),

  setSelectedTrack: (trackId) =>
    set((state) => ({ selection: { ...state.selection, selectedTrackId: trackId } })),

  setSelectedAnnotation: (annotationId) =>
    set((state) => ({ selection: { ...state.selection, selectedAnnotationId: annotationId } })),

  clearSelection: () =>
    set({
      selection: { selectedClipIds: [], selectedTrackId: null, selectedAnnotationId: null },
    }),
}))
