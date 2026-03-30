// filepath: src/components/requirements/BasicModeForm.jsx
// Purpose: Simple room configuration form — bedrooms, floors, and common amenity toggles.

import React from 'react'
import useRequirementsStore from '../../store/requirementsStore.js'

const FLOOR_OPTIONS = [1, 2, 3]

export default function BasicModeForm() {
  const bedroomCount  = useRequirementsStore((s) => s.bedroomCount)
  const floors        = useRequirementsStore((s) => s.floors)
  const hasKitchen    = useRequirementsStore((s) => s.hasKitchen)
  const hasLivingRoom = useRequirementsStore((s) => s.hasLivingRoom)
  const hasDiningRoom = useRequirementsStore((s) => s.hasDiningRoom)

  const setBedroomCount  = useRequirementsStore((s) => s.setBedroomCount)
  const setFloors        = useRequirementsStore((s) => s.setFloors)
  const setHasKitchen    = useRequirementsStore((s) => s.setHasKitchen)
  const setHasLivingRoom = useRequirementsStore((s) => s.setHasLivingRoom)
  const setHasDiningRoom = useRequirementsStore((s) => s.setHasDiningRoom)

  const AMENITIES = [
    { label: 'Kitchen',     value: hasKitchen,    setter: setHasKitchen,    required: true },
    { label: 'Living Room', value: hasLivingRoom, setter: setHasLivingRoom, required: false },
    { label: 'Dining Room', value: hasDiningRoom, setter: setHasDiningRoom, required: false },
  ]

  return (
    <div className="space-y-8">

      {/* Bedrooms */}
      <div>
        <div className="flex items-baseline justify-between mb-3">
          <label className="text-sm font-semibold text-slate-800">Bedrooms</label>
          <span className="text-2xl font-bold text-blue-600">{bedroomCount} BHK</span>
        </div>
        <input
          type="range"
          min="1"
          max="5"
          value={bedroomCount}
          onChange={(e) => setBedroomCount(parseInt(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg accent-blue-600 cursor-pointer"
        />
        <div className="flex justify-between text-xs text-slate-400 mt-1.5 px-0.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <span key={n} className={n === bedroomCount ? 'text-blue-600 font-semibold' : ''}>
              {n}BR
            </span>
          ))}
        </div>
      </div>

      {/* Floors */}
      <div>
        <label className="block text-sm font-semibold text-slate-800 mb-3">Number of Floors</label>
        <div className="flex gap-3">
          {FLOOR_OPTIONS.map((n) => (
            <button
              key={n}
              onClick={() => setFloors(n)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border transition cursor-pointer ${
                floors === n
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              {n} {n === 1 ? 'Floor' : 'Floors'}
            </button>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div>
        <label className="block text-sm font-semibold text-slate-800 mb-3">Amenities</label>
        <div className="space-y-2">
          {AMENITIES.map(({ label, value, setter, required }) => (
            <label
              key={label}
              className={`flex items-center justify-between px-4 py-3 rounded-lg border transition cursor-pointer ${
                value
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              } ${required ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={value}
                  disabled={required}
                  onChange={(e) => !required && setter(e.target.checked)}
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="text-sm text-slate-700">{label}</span>
                {required && (
                  <span className="text-xs text-slate-400 italic">required</span>
                )}
              </div>
              <span className={`text-xs font-medium ${value ? 'text-blue-600' : 'text-slate-400'}`}>
                {value ? 'Included' : 'Excluded'}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Summary pill */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-600">
        Generating a{' '}
        <span className="font-semibold text-slate-900">{bedroomCount}BHK</span>,{' '}
        <span className="font-semibold text-slate-900">{floors}-floor</span> layout with{' '}
        {[hasKitchen && 'kitchen', hasLivingRoom && 'living room', hasDiningRoom && 'dining room']
          .filter(Boolean)
          .join(', ')}.
      </div>
    </div>
  )
}