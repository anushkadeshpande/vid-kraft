import { VIEWPORT_PRESETS, matchViewportPreset } from '../../core/preview'
import type { Viewport } from '../../core/types'

interface ViewportSelectorProps {
  viewport: Viewport
  onChange: (viewport: Viewport) => void
}

/** Dropdown of output viewport presets. */
function ViewportSelector({ viewport, onChange }: ViewportSelectorProps) {
  const current = matchViewportPreset(viewport)?.id ?? 'custom'

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const preset = VIEWPORT_PRESETS.find((p) => p.id === e.target.value)
    if (preset) onChange({ width: preset.width, height: preset.height })
  }

  return (
    <label className="preview-viewport">
      <span className="preview-viewport__label">Output</span>
      <select value={current} onChange={handleChange} aria-label="Output viewport">
        {current === 'custom' && (
          <option value="custom" disabled>
            {viewport.width}×{viewport.height}
          </option>
        )}
        {VIEWPORT_PRESETS.map((p) => (
          <option key={p.id} value={p.id}>
            {p.label} ({p.width}×{p.height})
          </option>
        ))}
      </select>
    </label>
  )
}

export default ViewportSelector
