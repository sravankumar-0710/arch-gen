// filepath: src/components/land-input/DimensionInput.jsx
// Purpose: Width × Height input fields for rectangle mode — auto-draws rectangle on canvas

import { useState } from 'react'
import useLandStore from '../../store/landStore.js'

// Canvas dimensions must match LandCanvas constants
const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 600
const CANVAS_PADDING = 60  // Margin so rectangle doesn't hug the canvas edge

// ASSUMPTION: pixels_per_unit matches the scale used in polygon_utils.py (20px = 1 unit)
const PIXELS_PER_UNIT = 20

function buildRectanglePoints(widthUnits, heightUnits) {
  const widthPx = widthUnits * PIXELS_PER_UNIT
  const heightPx = heightUnits * PIXELS_PER_UNIT

  // Center rectangle in canvas
  const startX = Math.round((CANVAS_WIDTH - widthPx) / 2)
  const startY = Math.round((CANVAS_HEIGHT - heightPx) / 2)

  return [
    { x: startX,             y: startY },
    { x: startX + widthPx,   y: startY },
    { x: startX + widthPx,   y: startY + heightPx },
    { x: startX,             y: startY + heightPx },
  ]
}

export default function DimensionInput() {
  const { unit, setPolygonPoints, setIsClosed, setDrawingMode, drawingMode } = useLandStore()

  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [error, setError] = useState(null)

  const isRectMode = drawingMode === 'rectangle'

  const handleApply = () => {
    const w = parseFloat(width)
    const h = parseFloat(height)

    if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
      setError('Please enter valid positive values for width and height.')
      return
    }

    const maxUnits = (CANVAS_WIDTH - CANVAS_PADDING * 2) / PIXELS_PER_UNIT
    if (w > maxUnits || h > maxUnits) {
      setError(`Maximum dimension is ${maxUnits} ${unit} for the current canvas size.`)
      return
    }

    const points = buildRectanglePoints(w, h)
    setPolygonPoints(points)
    setIsClosed(true)
    setDrawingMode('rectangle')
    setError(null)
  }

  const handleClear = () => {
    setPolygonPoints([])
    setIsClosed(false)
    setDrawingMode('polygon')
    setWidth('')
    setHeight('')
    setError(null)
  }

  return (
    <div className="bg-[#0f0f12] border border-white/[0.06] rounded-xl p-4 flex flex-col gap-4">
      <label className="block text-xs font-semibold text-[#9d9a94] uppercase tracking-[0.05em]">
        Rectangle Mode
      </label>

      <div className="flex gap-3 items-end">
        {/* Width */}
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-[11px] text-[#5a5855]">Width ({unit})</label>
          <input
            type="number"
            min="1"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            placeholder={`e.g. 40`}
            className="px-3 py-2 border border-white/[0.06] rounded-lg bg-[#141418] text-[#f0ede8] text-[13px] outline-none placeholder:text-[#5a5855] focus:border-[rgba(212,168,50,0.4)]"
          />
        </div>

        <span className="text-[#5a5855] text-sm pb-2">×</span>

        {/* Height */}
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-[11px] text-[#5a5855]">Height ({unit})</label>
          <input
            type="number"
            min="1"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder={`e.g. 30`}
            className="px-3 py-2 border border-white/[0.06] rounded-lg bg-[#141418] text-[#f0ede8] text-[13px] outline-none placeholder:text-[#5a5855] focus:border-[rgba(212,168,50,0.4)]"
          />
        </div>
      </div>

      {error && (
        <p className="text-[11px] text-[#e05252] m-0">{error}</p>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleApply}
          disabled={!width || !height}
          className={[
            'flex-1 py-2 px-4 text-xs font-semibold rounded-lg border-none transition-all',
            width && height
              ? 'bg-[#d4a832] text-[#0a0a0c] cursor-pointer hover:bg-[#f0c84a]'
              : 'bg-[#8a6a1a] text-[#5a4a15] cursor-not-allowed opacity-50',
          ].join(' ')}
        >
          Draw Rectangle
        </button>

        {isRectMode && (
          <button
            onClick={handleClear}
            className="py-2 px-4 text-xs text-[#e05252] bg-[rgba(224,82,82,0.1)] border border-[rgba(224,82,82,0.2)] rounded-lg cursor-pointer transition-all hover:bg-[rgba(224,82,82,0.2)]"
          >
            Clear
          </button>
        )}
      </div>

      <p className="text-[11px] text-[#5a5855] m-0">
        Draws a centered rectangle on the canvas and locks the polygon automatically.
      </p>
    </div>
  )
}