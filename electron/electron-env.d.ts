/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * The built directory structure
     *
     * ```tree
     * ├─┬─┬ dist
     * │ │ └── index.html
     * │ │
     * │ ├─┬ dist-electron
     * │ │ ├── main.js
     * │ │ └── preload.js
     * │
     * ```
     */
    DIST: string
    /** /dist/ or /public/ */
    VITE_PUBLIC: string
  }
}

// Used in Renderer process, expose in `preload.ts`
interface Window {
  ipcRenderer: import('electron').IpcRenderer
  api: {
    ffmpeg: {
      probe: (filePath: string) => Promise<{
        duration: number
        width?: number
        height?: number
        codec?: string
        sampleRate?: number
        channels?: number
        fileSize: number
      }>
      thumbnail: (filePath: string, outputDir: string, timestamp?: string) => Promise<string>
      export: (options: unknown) => Promise<string>
    }
    file: {
      openDialog: (options?: {
        title?: string
        filters?: { name: string; extensions: string[] }[]
        multiple?: boolean
      }) => Promise<{ canceled: boolean; filePaths: string[] }>
      saveDialog: (options?: {
        title?: string
        defaultPath?: string
        filters?: { name: string; extensions: string[] }[]
      }) => Promise<{ canceled: boolean; filePath: string }>
    }
    app: {
      getThumbnailDir: () => Promise<string>
    }
  }
}
