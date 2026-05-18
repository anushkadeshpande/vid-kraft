// ============================================================
// Core Types — Data model for the entire application
// ============================================================

/** Unique identifier for any entity */
export type Id = string

/** Time in seconds */
export type Seconds = number

/** A range of time on the timeline */
export interface TimeRange {
  start: Seconds
  end: Seconds
}

/** Supported media types */
export type MediaType = 'video' | 'audio' | 'image'

/** Supported track types */
export type TrackType = 'video' | 'audio' | 'overlay'

/** Viewport / output dimensions */
export interface Viewport {
  width: number
  height: number
}

/** Represents an imported media file */
export interface MediaAsset {
  id: Id
  name: string
  path: string
  type: MediaType
  duration: Seconds // 0 for images
  width?: number
  height?: number
  thumbnailPath?: string
  codec?: string
  sampleRate?: number
  channels?: number
  fileSize: number
}

/** Position and scale of a clip on the canvas */
export interface Transform {
  x: number
  y: number
  width: number
  height: number
  rotation: number
  opacity: number
}

/** A clip placed on a track in the timeline */
export interface Clip {
  id: Id
  assetId: Id
  trackId: Id
  /** Position on timeline (seconds from start) */
  startTime: Seconds
  /** Duration of the clip on timeline */
  duration: Seconds
  /** Trim offset from the source start */
  trimStart: Seconds
  /** Trim offset from the source end */
  trimEnd: Seconds
  /** Visual transform (position, scale, etc.) */
  transform: Transform
  /** Volume level (0-1) for audio/video clips */
  volume: number
}

/** A track in the timeline */
export interface Track {
  id: Id
  type: TrackType
  name: string
  clips: Clip[]
  muted: boolean
  locked: boolean
  visible: boolean
}

/** Annotation type */
export type AnnotationType = 'freehand' | 'rectangle' | 'arrow' | 'text'

/** A point in 2D space */
export interface Point {
  x: number
  y: number
}

/** An annotation drawn on the video */
export interface Annotation {
  id: Id
  type: AnnotationType
  timeRange: TimeRange
  color: string
  strokeWidth: number
  /** Points for freehand/arrow, bounds for rectangle */
  points: Point[]
  /** Text content (for text annotations) */
  text?: string
  fontSize?: number
}

/** The full project state */
export interface Project {
  id: Id
  name: string
  createdAt: string
  updatedAt: string
  viewport: Viewport
  tracks: Track[]
  assets: MediaAsset[]
  annotations: Annotation[]
}

/** Playback state */
export interface PlaybackState {
  isPlaying: boolean
  currentTime: Seconds
  duration: Seconds
}

/** UI selection state */
export interface SelectionState {
  selectedClipIds: Id[]
  selectedTrackId: Id | null
  selectedAnnotationId: Id | null
}
