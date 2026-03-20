// filepath: src/components/requirements/RequirementsPanel.jsx
// Purpose: Room configuration UI — reads and writes to requirementsStore, calls generate via hook

import useRequirementsStore from '../../store/requirementsStore.js'
import { useLayoutGenerator } from '../../hooks/useLayoutGenerator.js'

const ROOM_TYPE_OPTIONS = [
  { value: 'master_bedroom', label: 'Master Bedroom' },
  { value: 'bedroom',        label: 'Bedroom' },
  { value: 'kitchen',        label: 'Kitchen' },
  { value: 'living_room',    label: 'Living Room' },
  { value: 'dining_room',    label: 'Dining Room' },
  { value: 'bathroom',       label: 'Bathroom' },
  { value: 'pooja',          label: 'Pooja' },
  { value: 'balcony',        label: 'Balcony' },
]

export default function RequirementsPanel({ onBack }) {
  // All requirements state lives in the store — not local useState
  const mode = useRequirementsStore((s) => s.mode)
  const vastuEnabled = useRequirementsStore((s) => s.vastuEnabled)
  const bedroomCount = useRequirementsStore((s) => s.bedroomCount)
  const hasKitchen = useRequirementsStore((s) => s.hasKitchen)
  const hasLivingRoom = useRequirementsStore((s) => s.hasLivingRoom)
  const hasDiningRoom = useRequirementsStore((s) => s.hasDiningRoom)
  const rooms = useRequirementsStore((s) => s.rooms)
  const setMode = useRequirementsStore((s) => s.setMode)
  const setVastuEnabled = useRequirementsStore((s) => s.setVastuEnabled)
  const setBedroomCount = useRequirementsStore((s) => s.setBedroomCount)
  const setHasKitchen = useRequirementsStore((s) => s.setHasKitchen)
  const setHasLivingRoom = useRequirementsStore((s) => s.setHasLivingRoom)
  const setHasDiningRoom = useRequirementsStore((s) => s.setHasDiningRoom)
  const addRoom = useRequirementsStore((s) => s.addRoom)
  const removeRoom = useRequirementsStore((s) => s.removeRoom)
  const updateRoom = useRequirementsStore((s) => s.updateRoom)

  // Generate logic lives in the hook — not in this component
  const { generate, isGenerating, generationError } = useLayoutGenerator()

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Room Configuration</h2>
          <p className="text-slate-600">Configure your room requirements for layout generation</p>
        </div>

        {/* Mode selection */}
        <div className="mb-8 pb-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Configuration Mode</h3>
          <div className="flex gap-4">
            {['basic', 'advanced'].map((m) => (
              <label key={m} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value={m}
                  checked={mode === m}
                  onChange={() => setMode(m)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="ml-2 text-slate-700 capitalize">{m}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Vastu toggle */}
        <div className="mb-8 pb-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Vastu Compliance</h3>
              <p className="text-sm text-slate-600 mt-1">
                {vastuEnabled
                  ? 'Layout will be optimized for Vastu Shastra principles'
                  : 'Layout optimization disabled'}
              </p>
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={vastuEnabled}
                onChange={(e) => setVastuEnabled(e.target.checked)}
                className="w-5 h-5 text-blue-600"
              />
              <span className="ml-2 text-slate-700 font-medium">
                {vastuEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </label>
          </div>
        </div>

        {/* Basic mode */}
        {mode === 'basic' && (
          <div className="mb-8 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                Number of Bedrooms: {bedroomCount}
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={bedroomCount}
                onChange={(e) => setBedroomCount(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-xs text-slate-600 mt-1">
                <span>1 BR</span>
                <span>5 BR</span>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-3">Amenities</h4>
              <div className="space-y-2">
                {[
                  { label: 'Kitchen',     value: hasKitchen,    setter: setHasKitchen },
                  { label: 'Living Room', value: hasLivingRoom, setter: setHasLivingRoom },
                  { label: 'Dining Room', value: hasDiningRoom, setter: setHasDiningRoom },
                ].map(({ label, value, setter }) => (
                  <label key={label} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setter(e.target.checked)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="ml-2 text-slate-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Advanced mode */}
        {mode === 'advanced' && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Custom Rooms</h3>
              <button
                onClick={() => addRoom({ type: 'bedroom', minArea: 90, maxArea: 160 })}
                className="px-3 py-1.5 text-sm bg-slate-100 text-slate-700 border border-slate-300 rounded hover:bg-slate-200 transition cursor-pointer"
              >
                + Add Room
              </button>
            </div>

            <div className="space-y-4">
              {rooms.map((room, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <select
                      value={room.type}
                      onChange={(e) => updateRoom(idx, 'type', e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {ROOM_TYPE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>

                    <input
                      type="number"
                      placeholder="Min area"
                      value={room.minArea}
                      onChange={(e) => updateRoom(idx, 'minArea', parseInt(e.target.value))}
                      className="px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <input
                      type="number"
                      placeholder="Max area"
                      value={room.maxArea}
                      onChange={(e) => updateRoom(idx, 'maxArea', parseInt(e.target.value))}
                      className="px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <button
                      onClick={() => removeRoom(idx)}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generation error */}
        {generationError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {generationError}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="px-5 py-2.5 text-sm text-slate-500 bg-transparent border border-slate-200 rounded-lg cursor-pointer hover:text-slate-700 hover:border-slate-300 transition"
          >
            ← Back
          </button>
          <button
            onClick={generate}
            disabled={isGenerating}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg border-none transition cursor-pointer ${
              isGenerating
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isGenerating ? 'Generating...' : 'Generate Layouts'}
          </button>
        </div>
      </div>
    </div>
  )
}