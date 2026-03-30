// filepath: src/components/layout-generator/LayoutSelector.jsx
// Purpose: Grid of generated layout options — renders real room polygons from backend data

import React, { useState } from 'react'

// Color map for room types
const ROOM_COLORS = {
  master_bedroom: { fill: 'rgba(99,102,241,0.15)',  stroke: '#6366f1' },
  bedroom:        { fill: 'rgba(139,92,246,0.15)',  stroke: '#8b5cf6' },
  living_room:    { fill: 'rgba(212,168,50,0.15)',  stroke: '#d4a832' },
  kitchen:        { fill: 'rgba(61,184,122,0.15)',  stroke: '#3db87a' },
  bathroom:       { fill: 'rgba(56,189,248,0.15)',  stroke: '#38bdf8' },
  dining_room:    { fill: 'rgba(251,146,60,0.15)',  stroke: '#fb923c' },
  balcony:        { fill: 'rgba(163,230,53,0.15)',  stroke: '#a3e635' },
  staircase:      { fill: 'rgba(148,163,184,0.15)', stroke: '#94a3b8' },
}
const DEFAULT_COLOR = { fill: 'rgba(100,100,120,0.1)', stroke: '#5a5a72' }

// Room label abbreviations for small previews
const ROOM_ABBR = {
  master_bedroom: 'MBR',
  bedroom:        'BR',
  living_room:    'LR',
  kitchen:        'KIT',
  bathroom:       'BTH',
  dining_room:    'DR',
  balcony:        'BAL',
  staircase:      'STR',
}

/**
 * Converts real-world polygon coordinates to SVG viewBox coordinates.
 * Finds bounding box of all rooms, then scales to fit within the SVG canvas.
 */
function normalizePolygons(rooms, svgW = 100, svgH = 80, padding = 4) {
  if (!rooms || rooms.length === 0) return { rooms: [], scale: 1, offsetX: 0, offsetY: 0 }

  // Find bounding box across all room polygons
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  rooms.forEach((room) => {
    room.polygon.forEach(([x, y]) => {
      if (x < minX) minX = x
      if (y < minY) minY = y
      if (x > maxX) maxX = x
      if (y > maxY) maxY = y
    })
  })

  const dataW = maxX - minX
  const dataH = maxY - minY
  const scaleX = (svgW - padding * 2) / dataW
  const scaleY = (svgH - padding * 2) / dataH
  const scale = Math.min(scaleX, scaleY)

  // Center the scaled content
  const scaledW = dataW * scale
  const scaledH = dataH * scale
  const offsetX = padding + (svgW - padding * 2 - scaledW) / 2
  const offsetY = padding + (svgH - padding * 2 - scaledH) / 2

  return {
    rooms: rooms.map((room) => ({
      ...room,
      svgPoints: room.polygon.map(([x, y]) => [
        (x - minX) * scale + offsetX,
        (y - minY) * scale + offsetY,
      ]),
      svgCentroid: [
        (room.centroid[0] - minX) * scale + offsetX,
        (room.centroid[1] - minY) * scale + offsetY,
      ],
    })),
  }
}

function FloorPlanPreview({ rooms }) {
  const { rooms: normalizedRooms } = normalizePolygons(rooms)

  return (
    <svg
      className="w-full h-full"
      viewBox="0 0 100 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {normalizedRooms.map((room) => {
        const color = ROOM_COLORS[room.type] || DEFAULT_COLOR
        const points = room.svgPoints.map(([x, y]) => `${x},${y}`).join(' ')
        const abbr = ROOM_ABBR[room.type] || room.type.slice(0, 3).toUpperCase()
        const [cx, cy] = room.svgCentroid

        return (
          <g key={room.id}>
            <polygon
              points={points}
              fill={color.fill}
              stroke={color.stroke}
              strokeWidth="0.6"
            />
            <text
              x={cx}
              y={cy}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="4.5"
              fontFamily="Inter, system-ui, sans-serif"
              fontWeight="600"
              fill={color.stroke}
              opacity="0.9"
            >
              {abbr}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default function LayoutSelector({ layouts = [], onSave, isSaving, onBack }) {
  const [selected, setSelected] = useState(0)

  return (
    <div
      className="flex-1 flex flex-col p-8 overflow-y-auto"
      style={{ animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-2xl font-normal text-[#f0ede8] mb-1">Choose a layout</h2>
          <p className="text-[#5a5855] text-sm m-0">
            {layouts.length} layout{layouts.length !== 1 ? 's' : ''} generated. Select one to continue.
          </p>
        </div>
        <button
          onClick={onBack}
          className="text-sm text-[#5a5855] bg-transparent border-none cursor-pointer transition-colors hover:text-[#9d9a94]"
        >
          ← Regenerate
        </button>
      </div>

      {/* Layout cards */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4 mb-8">
        {layouts.map((layout, i) => {
          const isSelected = selected === i
          return (
            <div
              key={layout.id ?? i}
              onClick={() => setSelected(i)}
              className={[
                'bg-[#141418] rounded-xl border overflow-hidden cursor-pointer transition-all',
                isSelected
                  ? 'border-[#d4a832] shadow-[0_0_24px_rgba(212,168,50,0.15)]'
                  : 'border-white/[0.06] hover:border-[rgba(212,168,50,0.2)]',
              ].join(' ')}
              style={{ animation: `fadeUp 0.5s ${i * 80}ms cubic-bezier(0.16,1,0.3,1) both` }}
            >
              {/* Floor plan preview */}
              <div
                className="relative bg-[#0f0f12]"
                style={{
                  aspectRatio: '4/3',
                  backgroundImage:
                    'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
                  backgroundSize: '10px 10px',
                  padding: '8px',
                }}
              >
                <FloorPlanPreview rooms={layout.rooms} />

                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-[#d4a832] rounded-full flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M1.5 5l2.5 2.5 5-5" stroke="#0a0a0c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Card footer */}
              <div className="px-4 py-3 border-t border-white/[0.04]">
                <p className="text-sm font-medium text-[#c4c4d4] mb-1 m-0">
                  {layout.name || `Layout ${i + 1}`}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-[#5a5855] font-mono m-0">
                    {layout.rooms?.length} rooms · Score: {Math.round(layout.score ?? 0)}
                  </p>
                  {layout.warning && (
                    <span className="text-[10px] text-amber-500 font-mono">⚠ warning</span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Room legend */}
      <div className="flex flex-wrap gap-3 mb-6">
        {Object.entries(ROOM_ABBR).map(([type, abbr]) => {
          const color = ROOM_COLORS[type] || DEFAULT_COLOR
          const inUse = layouts.some((l) => l.rooms?.some((r) => r.type === type))
          if (!inUse) return null
          return (
            <div key={type} className="flex items-center gap-1.5 text-xs text-[#5a5855]">
              <span
                className="w-3 h-3 rounded-sm border"
                style={{ background: color.fill, borderColor: color.stroke }}
              />
              {abbr} — {type.replace(/_/g, ' ')}
            </div>
          )
        })}
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <button
          onClick={() => onSave?.(layouts[selected])}
          disabled={isSaving}
          className={[
            'flex items-center gap-2 px-7 py-3 text-sm font-semibold rounded-xl border-none transition-all font-[inherit]',
            isSaving
              ? 'bg-[#8a6a1a] text-[#5a4a15] cursor-not-allowed opacity-50'
              : 'bg-[#d4a832] text-[#0a0a0c] cursor-pointer hover:bg-[#f0c84a] hover:shadow-[0_0_24px_rgba(212,168,50,0.35)]',
          ].join(' ')}
        >
          {isSaving ? 'Saving…' : 'Save & continue to editor →'}
        </button>
      </div>
    </div>
  )
}