// ============================================================
// Operations barrel — importing this registers every operation
// ============================================================
// Each module self-registers with the operation registry on load.
// Import this once at startup so all operations are discoverable
// without a central dispatcher (Open/Closed Principle).

import './cut'
import './trim'
import './delete'
import './merge'
import './splitAV'

export type { EditingContext } from './context'
export { findClip } from './context'
export { storeEditingContext } from './storeContext'
export { createCutCommand, splitClip } from './cut'
export { createTrimCommand, computeTrim, MIN_CLIP_DURATION } from './trim'
export type { TrimEdge, TrimResult } from './trim'
export { createDeleteCommand } from './delete'
export {
  createMergeCommand,
  runMerge,
  planMerge,
  segmentsForPlan,
} from './merge'
export type { MergePlan } from './merge'
export { createSplitCommand, runSplitAV } from './splitAV'
