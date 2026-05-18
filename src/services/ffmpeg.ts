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
