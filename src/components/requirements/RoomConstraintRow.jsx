// filepath: src/components/requirements/RoomConstraintRow.jsx
// Purpose: Single room constraint entry row used by AdvancedModeForm — type, direction, area, flags.

import useRequirementsStore from '../../store/requirementsStore.js'
import { DIRECTION_OPTIONS, VASTU_PREFERRED_DIRECTIONS } from '../../utils/vastuRules.js'

const ROOM_TYPE_OPTIONS = [
  { value: 'bedroom',   label: 'Bedroom' },
  { value: 'masterBedroom', label: 'Master Bedroom' },
  { value: 'kitchen',   label: 'Kitchen' },
  { value: 'living',    label: 'Living Room' },
  { value: 'dining',    label: 'Dining Room' },
  { value: 'bathroom',  label: 'Bathroom' },
  { value: 'balcony',   label: 'Balcony' },
  { value: 'staircase', label: 'Staircase' },
  { value: 'pooja',     label: 'Pooja Room' },
  { value: 'other',     label: 'Other' },
]

export default function RoomConstraintRow({ room, index, vastuEnabled }) {
  const updateRoom = useRequirementsStore((s) => s.updateRoom)
  const removeRoom = useRequirementsStore((s) => s.removeRoom)

  // ASSUMPTION: updateRoom(id, updates) — takes the room id (not index) and a patch object
  const update = (field, value) => updateRoom(room.id, { [field]: value })

  // Show a vastu hint if vastu is on and user has set 'any' — suggest preferred directions
  const vastuHint =
    vastuEnabled &&
    room.preferredDirection === 'any' &&
    VASTU_PREFERRED_DIRECTIONS[room.type]
      ? `Vastu: prefer ${VASTU_PREFERRED_DIRECTIONS[room.type].join(' / ')}`
      : null

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">

      {/* Row header: room number + remove */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
          Room {index + 1}
        </span>
        <button
          onClick={() => removeRoom(room.id)}
          className="text-xs text-red-500 hover:text-red-700 transition cursor-pointer px-2 py-0.5 rounded hover:bg-red-50"
        >
          Remove
        </button>
      </div>

      {/* Main fields row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

        {/* Room type */}
        <div>
          <label className="block text-xs text-slate-500 mb-1">Room Type</label>
          <select
            value={room.type}
            onChange={(e) => update('type', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
          >
            {ROOM_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Preferred direction */}
        <div>
          <label className="block text-xs text-slate-500 mb-1">Preferred Direction</label>
          <select
            value={room.preferredDirection}
            onChange={(e) => update('preferredDirection', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
          >
            {DIRECTION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {vastuHint && (
            <p className="text-xs text-amber-600 mt-1">{vastuHint}</p>
          )}
        </div>

        {/* Min area override */}
        <div>
          <label className="block text-xs text-slate-500 mb-1">
            Min Area (sq ft) <span className="text-slate-400 font-normal">— optional</span>
          </label>
          <input
            type="number"
            placeholder="Use default"
            min="50"
            max="5000"
            value={room.minAreaSqft ?? ''}
            onChange={(e) => {
              const val = e.target.value === '' ? null : parseInt(e.target.value)
              update('minAreaSqft', val)
            }}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-slate-300"
          />
        </div>
      </div>

      {/* Flag row */}
      <div className="flex flex-wrap gap-4 pt-1">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={room.attachedBathroom}
            onChange={(e) => update('attachedBathroom', e.target.checked)}
            className="w-3.5 h-3.5 accent-blue-600"
          />
          <span className="text-xs text-slate-600">Attached bathroom</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={room.hasBalcony}
            onChange={(e) => update('hasBalcony', e.target.checked)}
            className="w-3.5 h-3.5 accent-blue-600"
          />
          <span className="text-xs text-slate-600">Has balcony</span>
        </label>

        {/* Balcony extension — only show when hasBalcony is true */}
        {room.hasBalcony && (
          <label className="flex items-center gap-2">
            <span className="text-xs text-slate-600">Balcony extension</span>
            <input
              type="number"
              min="0"
              max="20"
              value={room.balconyExtraFt}
              onChange={(e) => update('balconyExtraFt', parseInt(e.target.value) || 0)}
              className="w-16 px-2 py-1 text-xs border border-slate-200 rounded bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <span className="text-xs text-slate-400">ft</span>
          </label>
        )}
      </div>
    </div>
  )
}