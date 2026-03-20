// filepath: src/components/requirements/AdvancedModeForm.jsx
// Purpose: Advanced room configuration form — per-room constraint rows with type, direction, area, and flags.

import useRequirementsStore from '../../store/requirementsStore.js'
import RoomConstraintRow from './RoomConstraintRow.jsx'

// Default starter config when a new room is added
const ROOM_PRESETS = [
  { label: '+ Bedroom',      type: 'bedroom' },
  { label: '+ Kitchen',      type: 'kitchen' },
  { label: '+ Bathroom',     type: 'bathroom' },
  { label: '+ Living Room',  type: 'living' },
]

export default function AdvancedModeForm({ validationWarnings = [] }) {
  const rooms        = useRequirementsStore((s) => s.rooms)
  const floors       = useRequirementsStore((s) => s.floors)
  const vastuEnabled = useRequirementsStore((s) => s.vastuEnabled)
  const addRoom      = useRequirementsStore((s) => s.addRoom)
  const setFloors    = useRequirementsStore((s) => s.setFloors)

  const FLOOR_OPTIONS = [1, 2, 3]

  return (
    <div className="space-y-8">

      {/* Floors row */}
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

      {/* Room list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-800">Custom Rooms</h4>
            <p className="text-xs text-slate-400 mt-0.5">{rooms.length} room{rooms.length !== 1 ? 's' : ''} configured</p>
          </div>
        </div>

        {/* Empty state */}
        {rooms.length === 0 && (
          <div className="text-center py-10 text-slate-400 border border-dashed border-slate-200 rounded-lg bg-slate-50">
            <p className="text-sm">No rooms added yet.</p>
            <p className="text-xs mt-1">Use the quick-add buttons below to get started.</p>
          </div>
        )}

        <div className="space-y-3">
          {rooms.map((room, idx) => (
            <RoomConstraintRow
              key={room.id}
              room={room}
              index={idx}
              vastuEnabled={vastuEnabled}
            />
          ))}
        </div>
      </div>

      {/* Quick-add presets */}
      <div>
        <label className="block text-xs text-slate-400 uppercase tracking-wide font-semibold mb-2">
          Quick add
        </label>
        <div className="flex flex-wrap gap-2">
          {ROOM_PRESETS.map(({ label, type }) => (
            <button
              key={type}
              onClick={() => addRoom({ type })}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:border-blue-300 hover:text-blue-600 transition cursor-pointer"
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => addRoom({ type: 'other' })}
            className="px-3 py-1.5 text-xs font-medium text-slate-400 bg-white border border-dashed border-slate-200 rounded-lg hover:border-blue-300 hover:text-blue-500 transition cursor-pointer"
          >
            + Other
          </button>
        </div>
      </div>

      {/* Validation warnings */}
      {validationWarnings.length > 0 && (
        <div className="space-y-2">
          {validationWarnings.map((warn, i) => (
            <div
              key={i}
              className="flex items-start gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800"
            >
              {/* TODO(phase-4): replace with a shared Warning icon component */}
              <span className="mt-0.5 text-amber-500 shrink-0">⚠</span>
              <span>{warn}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}