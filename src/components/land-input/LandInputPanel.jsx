// filepath: src/components/land-input/LandInputPanel.jsx
// Purpose: Complete land input interface — canvas, dimension input, road side, north angle, save.

import { useState } from 'react'
import useLandStore from '../../store/landStore.js'
import LandCanvas from './LandCanvas.jsx'
import DimensionInput from './DimensionInput.jsx'
import RoadPositionPicker from './RoadPositionPicker.jsx'
import NorthAnglePicker from './NorthAnglePicker.jsx'
import UnitToggle from './UnitToggle.jsx'
import { validatePolygon } from '../../utils/geometry.js'

const ROAD_LABELS = ['Front (↓)', 'Right (→)', 'Back (↑)', 'Left (←)']

export default function LandInputPanel({ onSave, isLoading }) {
  const { polygonPoints, roadSide, northAngle, unit, isClosed, drawingMode } = useLandStore()
  const [error, setError] = useState(null)

  const handleSave = () => {
    const validationError = validatePolygon(polygonPoints)
    if (validationError) {
      setError(validationError)
      return
    }

    if (roadSide === null) {
      setError('Please select which side of the plot faces the road.')
      return
    }

    setError(null)
    onSave({ polygonPoints, roadSide, northAngle, unit })
  }

  const isReady = isClosed && roadSide !== null && !isLoading

  return (
    <div className="flex flex-col gap-6">

      {/* Title */}
      <div>
        <h2 className="font-serif text-2xl font-normal text-[#f0ede8] mb-2">Define Your Plot</h2>
        <p className="text-[#5a5855] text-sm">
          Draw the outline of your land, then specify its orientation relative to the road.
        </p>
      </div>

      {/* Validation error */}
      {error && (
        <div className="px-4 py-3 bg-[rgba(224,82,82,0.08)] border border-[rgba(224,82,82,0.2)] rounded-lg text-[#e05252] text-[13px]">
          {error}
        </div>
      )}

      {/* Canvas + right-side controls */}
      <div className="grid grid-cols-[2fr_1fr] gap-6">

        {/* Left: canvas */}
        <LandCanvas />

        {/* Right: controls */}
        <div className="flex flex-col gap-4">
          <UnitToggle />

          {/* Rectangle mode input */}
          <DimensionInput />

          <div>
            <label className="block text-xs font-semibold text-[#9d9a94] mb-2 uppercase tracking-[0.05em]">
              Road Side
            </label>
            <RoadPositionPicker />
          </div>

          {roadSide !== null && (
            <div className="px-3 py-2 bg-[rgba(61,184,122,0.08)] border border-[rgba(61,184,122,0.2)] rounded-md text-xs text-[#3db87a]">
              ✓ {ROAD_LABELS[roadSide]} selected
            </div>
          )}
        </div>
      </div>

      {/* North angle */}
      <div>
        <label className="block text-xs font-semibold text-[#9d9a94] mb-2 uppercase tracking-[0.05em]">
          North Direction
        </label>
        <NorthAnglePicker />
      </div>

      {/* Summary + save */}
      <div className="bg-[#0f0f12] border border-white/[0.06] rounded-xl p-4 flex flex-col gap-4">
        <div className="flex flex-col gap-2 text-[13px]">
          <div className="flex justify-between">
            <span className="text-[#5a5855]">Polygon Points:</span>
            <span className={polygonPoints.length >= 3 ? 'text-[#3db87a] font-semibold' : 'text-[#9d9a94]'}>
              {polygonPoints.length} {isClosed && '✓'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#5a5855]">Drawing Mode:</span>
            <span className="text-[#9d9a94] font-mono capitalize">{drawingMode}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#5a5855]">Road Side:</span>
            <span className={roadSide !== null ? 'text-[#3db87a] font-semibold' : 'text-[#9d9a94]'}>
              {roadSide !== null ? `${ROAD_LABELS[roadSide]} ✓` : 'Not set'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#5a5855]">North Angle:</span>
            <span className="text-[#9d9a94] font-mono">{northAngle}°</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#5a5855]">Unit System:</span>
            <span className="text-[#9d9a94] font-mono">{unit}</span>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!isReady}
          className={[
            'w-full flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl border-none transition-all',
            isReady
              ? 'bg-[#d4a832] text-[#0a0a0c] cursor-pointer hover:bg-[#f0c84a] hover:shadow-[0_0_24px_rgba(212,168,50,0.35)]'
              : 'bg-[#8a6a1a] text-[#5a4a15] cursor-not-allowed',
          ].join(' ')}
        >
          {isLoading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-[#5a4a15] border-r-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            '✓ Save Plot Layout →'
          )}
        </button>

        {(!isClosed || roadSide === null) && (
          <p className="text-xs text-[#5a5855] text-center">
            {!isClosed ? 'Close your polygon to continue' : 'Select a road side to continue'}
          </p>
        )}
      </div>
    </div>
  )
}