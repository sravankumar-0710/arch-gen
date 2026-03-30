// filepath: src/components/land-input/RoadPositionPicker.jsx
// Purpose: Select which side of the polygon faces the road.

import React from 'react'
import useLandStore from '../../store/landStore.js'

// ASSUMPTION: roadSide is one of: 0 | 1 | 2 | 3 (front/right/back/left)
const ROAD_OPTIONS = [
  { value: 0, label: 'Front (↓)', icon: '⬇' },
  { value: 1, label: 'Right (→)', icon: '➡' },
  { value: 2, label: 'Back (↑)', icon: '⬆' },
  { value: 3, label: 'Left (←)', icon: '⬅' },
]

export default function RoadPositionPicker() {
  const { roadSide, setRoadSide, isClosed } = useLandStore()

  // Disabled until polygon is fully closed
  const isDisabled = !isClosed

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        {ROAD_OPTIONS.map((option) => {
          const isSelected = roadSide === option.value
          return (
            <button
              key={option.value}
              onClick={() => setRoadSide(option.value)}
              disabled={isDisabled}
              className={[
                'p-3 rounded-xl border transition-all text-center flex flex-col gap-1.5 items-center',
                isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                isSelected
                  ? 'border-[#d4a832] bg-[rgba(212,168,50,0.08)]'
                  : 'border-white/[0.06] bg-[#141418] hover:border-white/[0.12]',
              ].join(' ')}
              title={option.label}
            >
              <div className="text-lg">{option.icon}</div>
              <div className={[
                'text-[11px]',
                isSelected ? 'font-semibold text-[#d4a832]' : 'font-normal text-[#9d9a94]',
              ].join(' ')}>
                {option.label}
              </div>
            </button>
          )
        })}
      </div>

      {isDisabled && (
        <p className="text-[11px] text-[#5a5855] text-center">
          Close your polygon to select the road side
        </p>
      )}
    </div>
  )
}