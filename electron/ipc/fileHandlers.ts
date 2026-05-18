import { ipcMain, dialog, BrowserWindow } from 'electron'

/** Register all file-system-related IPC handlers */
export function registerFileHandlers() {
  // Open file dialog for importing media
  ipcMain.handle('file:openDialog', async (_event, options?: {
    title?: string
    filters?: { name: string; extensions: string[] }[]
    multiple?: boolean
  }) => {
    const win = BrowserWindow.getFocusedWindow()
    if (!win) return { canceled: true, filePaths: [] }

    const result = await dialog.showOpenDialog(win, {
      title: options?.title || 'Import Media',
      filters: options?.filters || [
        { name: 'Media Files', extensions: ['mp4', 'mkv', 'avi', 'mov', 'webm', 'mp3', 'wav', 'ogg', 'flac', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'] },
        { name: 'Video', extensions: ['mp4', 'mkv', 'avi', 'mov', 'webm'] },
        { name: 'Audio', extensions: ['mp3', 'wav', 'ogg', 'flac'] },
        { name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'] },
      ],
      properties: [
        'openFile',
        ...(options?.multiple !== false ? ['multiSelections' as const] : []),
      ],
    })

    return result
  })

  // Save file dialog for export
  ipcMain.handle('file:saveDialog', async (_event, options?: {
    title?: string
    defaultPath?: string
    filters?: { name: string; extensions: string[] }[]
  }) => {
    const win = BrowserWindow.getFocusedWindow()
    if (!win) return { canceled: true, filePath: '' }

    const result = await dialog.showSaveDialog(win, {
      title: options?.title || 'Export Video',
      defaultPath: options?.defaultPath,
      filters: options?.filters || [
        { name: 'MP4 Video', extensions: ['mp4'] },
        { name: 'WebM Video', extensions: ['webm'] },
        { name: 'AVI Video', extensions: ['avi'] },
      ],
    })

    return result
  })
}
