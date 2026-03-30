// filepath: src/components/land-input/UnitToggle.jsx
// Purpose: Toggle between feet and meters for plot dimensions

import React from 'react'
import useLandStore from '../../store/landStore.js'

const UNIT_OPTIONS = [
  { value: 'ft', label: 'Feet (ft)', description: 'US/India standard' },
  { value: 'm', label: 'Meters (m)', description: 'Metric' },
]

export default function UnitToggle() {
  const { unit, setUnit } = useLandStore()

  return (
    <div className="bg-[#0f0f12] border border-white/[0.06] rounded-xl p-4 flex flex-col gap-3">
      <label className="block text-xs font-semibold text-[#9d9a94] uppercase tracking-[0.05em]">
        Unit System
      </label>

      <div className="flex gap-2">
        {UNIT_OPTIONS.map((option) => {
          const isSelected = unit === option.value
          return (
            <button
              key={option.value}
              onClick={() => setUnit(option.value)}
              className={[
                'flex-1 p-3 rounded-xl border transition-all flex flex-col gap-1 cursor-pointer',
                isSelected
                  ? 'border-[#d4a832] bg-[rgba(212,168,50,0.08)]'
                  : 'border-white/[0.06] bg-[#141418] hover:border-white/[0.12]',
              ].join(' ')}
            >
              <div className={`text-[13px] font-semibold ${isSelected ? 'text-[#d4a832]' : 'text-[#9d9a94]'}`}>
                {option.label}
              </div>
              <div className="text-[11px] text-[#5a5855]">
                {option.description}
              </div>
            </button>
          )
        })}
      </div>

      <p className="text-[11px] text-[#5a5855] mt-1 m-0">
        ℹ All dimensions will be in <strong>{unit === 'ft' ? 'feet' : 'meters'}</strong>
      </p>
    </div>
  )
}