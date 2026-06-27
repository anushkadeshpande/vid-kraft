// ============================================================
// FFmpeg Service — Renderer-side client for FFmpeg IPC calls
// ============================================================

export interface ProbeResult {
  duration: number
  width?: number
  height?: number
  codec?: string
  sampleRate?: number
  channels?: number
  fileSize: number
}

/** Probe a media file for metadata */
export async function probeFile(filePath: string): Promise<ProbeResult> {
  return window.ipcRenderer.invoke('ffmpeg:probe', filePath)
}

/** Generate a thumbnail for a video file */
export async function generateThumbnail(
  filePath: string,
  outputDir: string,
  timestamp = '00:00:01'
): Promise<string> {
  return window.ipcRenderer.invoke('ffmpeg:thumbnail', filePath, outputDir, timestamp)
}

/** Export the project (placeholder) */
export async function exportProject(options: unknown): Promise<string> {
  return window.ipcRenderer.invoke('ffmpeg:export', options)
}

/** A trimmed source segment to feed into a concat render. */
export interface ConcatSegment {
  path: string
  /** Seconds from the source start. */
  trimStart: number
  /** Seconds of source to take. */
  duration: number
}

/** Metadata for a file rendered by FFmpeg. */
export interface RenderedAsset {
  path: string
  duration: number
  width?: number
  height?: number
}

/** Concatenate trimmed source segments into a single rendered file. */
export async function concatClips(
  segments: ConcatSegment[],
  outputDir: string
): Promise<RenderedAsset> {
  return window.ipcRenderer.invoke('ffmpeg:concat', segments, outputDir)
}

/** Demux a source file into separate video-only and audio-only files. */
export async function splitStreams(
  inputPath: string,
  outputDir: string
): Promise<{ video: RenderedAsset; audio: RenderedAsset }> {
  return window.ipcRenderer.invoke('ffmpeg:split', inputPath, outputDir)
}

/** Extract normalized audio peaks (0..1) for waveform rendering. */
export async function extractPeaks(
  filePath: string,
  samplesPerSecond = 50
): Promise<number[]> {
  return window.ipcRenderer.invoke('ffmpeg:peaks', filePath, samplesPerSecond)
}
