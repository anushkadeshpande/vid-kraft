// ============================================================
// Media Import Service
// ------------------------------------------------------------
// Imports multiple media files at once: classifies each file's
// MediaType, probes metadata via FFmpeg, generates a thumbnail,
// and builds a MediaAsset.
//
// The pipeline is driven by a registry of per-MediaType handlers
// so new media types can be supported WITHOUT modifying existing
// import code (Open/Closed Principle).
// ============================================================

import { MediaAsset, MediaType } from '../core/types'
import { ProbeResult, probeFile, generateThumbnail } from './ffmpeg'
import { v4 as uuidv4 } from '../store/utils'

/** Dependencies an import run needs — injectable for testing. */
export interface ImportDeps {
  /** Probe a media file for metadata. */
  probe: (filePath: string) => Promise<ProbeResult>
  /** Generate a poster-frame thumbnail for a file. */
  generateThumbnail: (filePath: string, outputDir: string, timestamp?: string) => Promise<string>
  /** Resolve the OS-managed directory where thumbnails are stored. */
  getThumbnailDir: () => Promise<string>
}

/** A handler that knows how to classify and thumbnail one MediaType. */
export interface MediaTypeHandler {
  type: MediaType
  /** Lowercased file extensions (without the dot) this handler owns. */
  extensions: string[]
  /**
   * Produce a thumbnail path for the file, or `undefined` when the type
   * has no renderable thumbnail (e.g. audio uses a UI placeholder).
   */
  createThumbnail: (
    filePath: string,
    thumbnailDir: string,
    probe: ProbeResult,
    deps: Pick<ImportDeps, 'generateThumbnail'>,
  ) => Promise<string | undefined>
}

// ------------------------------------------------------------
// Handler registry
// ------------------------------------------------------------

const handlerRegistry = new Map<MediaType, MediaTypeHandler>()

/** Register (or replace) a media-type handler. */
export function registerMediaTypeHandler(handler: MediaTypeHandler): void {
  handlerRegistry.set(handler.type, handler)
}

/** Get a registered handler by media type. */
export function getMediaTypeHandler(type: MediaType): MediaTypeHandler | undefined {
  return handlerRegistry.get(type)
}

/** List all registered handlers. */
export function listMediaTypeHandlers(): MediaTypeHandler[] {
  return [...handlerRegistry.values()]
}

// ------------------------------------------------------------
// Path / classification helpers (pure)
// ------------------------------------------------------------

/** Lowercased extension without the dot, or '' if none. */
export function getExtension(filePath: string): string {
  const match = /\.([^.\\/]+)$/.exec(filePath)
  return match ? match[1].toLowerCase() : ''
}

/** File name (last path segment) from a full path. */
export function getFileName(filePath: string): string {
  const segments = filePath.split(/[\\/]/)
  return segments[segments.length - 1] || filePath
}

/** Classify a file's MediaType by consulting registered handlers, or `undefined`. */
export function classifyFile(filePath: string): MediaType | undefined {
  const ext = getExtension(filePath)
  for (const handler of handlerRegistry.values()) {
    if (handler.extensions.includes(ext)) return handler.type
  }
  return undefined
}

// ------------------------------------------------------------
// Default handlers
// ------------------------------------------------------------

registerMediaTypeHandler({
  type: 'video',
  extensions: ['mp4', 'mkv', 'avi', 'mov', 'webm', 'm4v'],
  async createThumbnail(filePath, thumbnailDir, _probe, deps) {
    return deps.generateThumbnail(filePath, thumbnailDir)
  },
})

registerMediaTypeHandler({
  type: 'image',
  extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'],
  async createThumbnail(filePath) {
    // An image is its own thumbnail.
    return filePath
  },
})

registerMediaTypeHandler({
  type: 'audio',
  extensions: ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'],
  async createThumbnail() {
    // Audio has no visual frame — the UI renders a placeholder.
    return undefined
  },
})

// ------------------------------------------------------------
// Import
// ------------------------------------------------------------

const defaultDeps: ImportDeps = {
  probe: probeFile,
  generateThumbnail,
  getThumbnailDir: () => window.ipcRenderer.invoke('app:getThumbnailDir'),
}

/**
 * Import a single file into a MediaAsset.
 * Returns `null` when the file cannot be classified or probed.
 */
export async function importFile(
  filePath: string,
  thumbnailDir: string,
  deps: ImportDeps = defaultDeps,
): Promise<MediaAsset | null> {
  const type = classifyFile(filePath)
  if (!type) return null

  const handler = getMediaTypeHandler(type)
  if (!handler) return null

  let probe: ProbeResult
  try {
    probe = await deps.probe(filePath)
  } catch {
    // Corrupt / unsupported file — skip without aborting the batch.
    return null
  }

  let thumbnailPath: string | undefined
  try {
    thumbnailPath = await handler.createThumbnail(filePath, thumbnailDir, probe, {
      generateThumbnail: deps.generateThumbnail,
    })
  } catch {
    thumbnailPath = undefined
  }

  return {
    id: uuidv4(),
    name: getFileName(filePath),
    path: filePath,
    type,
    duration: type === 'image' ? 0 : probe.duration,
    width: probe.width,
    height: probe.height,
    thumbnailPath,
    codec: probe.codec,
    sampleRate: probe.sampleRate,
    channels: probe.channels,
    fileSize: probe.fileSize,
  }
}

/**
 * Import multiple files at once. Files that fail classification or probing
 * are skipped; the remaining files still import successfully.
 */
export async function importFiles(
  filePaths: string[],
  deps: ImportDeps = defaultDeps,
): Promise<MediaAsset[]> {
  const thumbnailDir = await deps.getThumbnailDir()
  const assets: MediaAsset[] = []
  for (const filePath of filePaths) {
    const asset = await importFile(filePath, thumbnailDir, deps)
    if (asset) assets.push(asset)
  }
  return assets
}
