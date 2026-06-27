// ============================================================
// Store-bound editing context
// ============================================================

import { useProjectStore } from '../../store/projectStore'
import type { EditingContext } from './context'

/** Build an {@link EditingContext} backed by the live zustand store. */
export function storeEditingContext(): EditingContext {
  const store = useProjectStore.getState()
  return {
    getTracks: () => useProjectStore.getState().project.tracks,
    getAssets: () => useProjectStore.getState().project.assets,
    addTrack: store.addTrack,
    removeTrack: store.removeTrack,
    addClip: store.addClip,
    removeClip: store.removeClip,
    updateClip: store.updateClip,
    addAsset: store.addAsset,
    removeAsset: store.removeAsset,
  }
}
