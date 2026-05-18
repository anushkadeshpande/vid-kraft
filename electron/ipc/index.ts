import { registerFfmpegHandlers } from './ffmpeg'
import { registerFileHandlers } from './fileHandlers'

/** Register all IPC handlers */
export function registerAllHandlers() {
  registerFfmpegHandlers()
  registerFileHandlers()
}
