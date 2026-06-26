import { useState, useCallback } from 'react'
import { useProjectStore } from '../store/projectStore'
import { importFiles } from '../services/mediaImport'
import type { MediaAsset } from '../core/types'

/**
 * Bridges the media-import service and the project store.
 * Opens the native file dialog, imports the selected files, and
 * adds the resulting assets to the project.
 */
export function useMediaImport() {
  const addAsset = useProjectStore((s) => s.addAsset)
  const [importing, setImporting] = useState(false)

  const importFromDialog = useCallback(async (): Promise<MediaAsset[]> => {
    setImporting(true)
    try {
      const result = await window.ipcRenderer.invoke('file:openDialog', {
        title: 'Import Media',
        multiple: true,
      })

      if (result?.canceled || !result?.filePaths?.length) return []

      const assets = await importFiles(result.filePaths)
      assets.forEach(addAsset)
      return assets
    } finally {
      setImporting(false)
    }
  }, [addAsset])

  return { importing, importFromDialog }
}
