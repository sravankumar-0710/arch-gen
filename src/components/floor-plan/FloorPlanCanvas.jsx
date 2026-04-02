// filepath: src/components/floor-plan/FloorPlanCanvas.jsx
// Purpose: Interactive 2D floor plan editor — drag rooms, resize with handles, snap-to-grid.
// Uses react-konva. No business logic here — all state via props/callbacks.

import React, { useRef, useState, useCallback, useEffect } from 'react'
import { Stage, Layer, Rect, Line, Text, Group, Circle } from 'react-konva'

// ─── Constants ────────────────────────────────────────────────────────────────

const GRID_SIZE = 10          // snap grid in canvas units (pixels)
const MIN_ROOM_SIZE = 30      // minimum room dimension in canvas units
const HANDLE_RADIUS = 5
const WALL_THICKNESS = 3

const ROOM_COLORS = {
  master_bedroom: { fill: 'rgba(99,102,241,0.18)',  stroke: '#6366f1', label: '#6366f1' },
  bedroom:        { fill: 'rgba(139,92,246,0.18)',  stroke: '#8b5cf6', label: '#8b5cf6' },
  living_room:    { fill: 'rgba(212,168,50,0.18)',  stroke: '#d4a832', label: '#d4a832' },
  kitchen:        { fill: 'rgba(61,184,122,0.18)',  stroke: '#3db87a', label: '#3db87a' },
  bathroom:       { fill: 'rgba(56,189,248,0.18)',  stroke: '#38bdf8', label: '#38bdf8' },
  dining_room:    { fill: 'rgba(251,146,60,0.18)',  stroke: '#fb923c', label: '#fb923c' },
  balcony:        { fill: 'rgba(163,230,53,0.18)',  stroke: '#a3e635', label: '#a3e635' },
  staircase:      { fill: 'rgba(148,163,184,0.18)', stroke: '#94a3b8', label: '#94a3b8' },
  pooja:          { fill: 'rgba(251,191,36,0.18)',  stroke: '#fbbf24', label: '#fbbf24' },
  garage:         { fill: 'rgba(120,113,108,0.18)', stroke: '#78716c', label: '#78716c' },
  store:          { fill: 'rgba(180,83,9,0.18)',    stroke: '#b45309', label: '#b45309' },
}
const DEFAULT_COLOR = { fill: 'rgba(100,100,120,0.12)', stroke: '#6b7280', label: '#9ca3af' }

const ROOM_ABBR = {
  master_bedroom: 'MBR', bedroom: 'BR', living_room: 'LR',
  kitchen: 'KIT', bathroom: 'BTH', dining_room: 'DR',
  balcony: 'BAL', staircase: 'STR', pooja: 'PJA',
  garage: 'GAR', store: 'STR',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function snap(v) {
  return Math.round(v / GRID_SIZE) * GRID_SIZE
}

/**
 * Convert backend polygon [[x,y],...] to canvas {x,y,w,h} rect.
 * The backend returns real-world coords; we scale them to fit the canvas.
 */
function layoutToRects(rooms, canvasW, canvasH, padding = 40) {
  if (!rooms || rooms.length === 0) return []

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  rooms.forEach((r) => {
    r.polygon.forEach(([x, y]) => {
      minX = Math.min(minX, x); minY = Math.min(minY, y)
      maxX = Math.max(maxX, x); maxY = Math.max(maxY, y)
    })
  })

  const dataW = maxX - minX || 1
  const dataH = maxY - minY || 1
  const scaleX = (canvasW - padding * 2) / dataW
  const scaleY = (canvasH - padding * 2) / dataH
  const scale  = Math.min(scaleX, scaleY)

  const tx = (x) => snap(padding + (x - minX) * scale)
  const ty = (y) => snap(padding + (y - minY) * scale)

  return rooms.map((r, i) => {
    const xs = r.polygon.map(([x]) => tx(x))
    const ys = r.polygon.map(([, y]) => ty(y))
    const rx = Math.min(...xs)
    const ry = Math.min(...ys)
    const rw = snap(Math.max(...xs) - rx) || GRID_SIZE * 4
    const rh = snap(Math.max(...ys) - ry) || GRID_SIZE * 4
    return {
      id:    r.id ?? i + 1,
      type:  r.type,
      x:     rx, y: ry,
      w:     Math.max(rw, MIN_ROOM_SIZE),
      h:     Math.max(rh, MIN_ROOM_SIZE),
      area:  r.area,
      direction: r.direction,
    }
  })
}

// ─── Grid ─────────────────────────────────────────────────────────────────────

function GridLayer({ width, height }) {
  const lines = []
  for (let x = 0; x <= width; x += GRID_SIZE) {
    lines.push(
      <Line key={`vg${x}`} points={[x, 0, x, height]}
        stroke="rgba(255,255,255,0.04)" strokeWidth={1} listening={false} />
    )
  }
  for (let y = 0; y <= height; y += GRID_SIZE) {
    lines.push(
      <Line key={`hg${y}`} points={[0, y, width, y]}
        stroke="rgba(255,255,255,0.04)" strokeWidth={1} listening={false} />
    )
  }
  return <>{lines}</>
}

// ─── Single Room ──────────────────────────────────────────────────────────────

function RoomRect({ room, isSelected, onSelect, onDragEnd, onResizeEnd }) {
  const color = ROOM_COLORS[room.type] || DEFAULT_COLOR
  const abbr  = ROOM_ABBR[room.type] || room.type.slice(0, 3).toUpperCase()

  const handleDragEnd = useCallback((e) => {
    onDragEnd(room.id, snap(e.target.x()), snap(e.target.y()))
  }, [room.id, onDragEnd])

  // Resize handles: 4 corners
  const handles = isSelected ? [
    { id: 'tl', cx: 0,     cy: 0     },
    { id: 'tr', cx: room.w, cy: 0     },
    { id: 'bl', cx: 0,     cy: room.h },
    { id: 'br', cx: room.w, cy: room.h },
  ] : []

  return (
    <Group
      x={room.x} y={room.y}
      draggable
      onClick={() => onSelect(room.id)}
      onTap={() => onSelect(room.id)}
      onDragEnd={handleDragEnd}
      onDragMove={(e) => {
        // Snap during drag
        e.target.x(snap(e.target.x()))
        e.target.y(snap(e.target.y()))
      }}
    >
      {/* Room fill */}
      <Rect
        width={room.w} height={room.h}
        fill={color.fill}
        stroke={isSelected ? '#fff' : color.stroke}
        strokeWidth={isSelected ? 2 : WALL_THICKNESS}
        cornerRadius={2}
        shadowEnabled={isSelected}
        shadowColor="rgba(255,255,255,0.15)"
        shadowBlur={12}
        shadowOffsetX={0} shadowOffsetY={0}
      />

      {/* Room type label */}
      <Text
        text={abbr}
        width={room.w} height={room.h / 2}
        y={room.h / 2 - 18}
        align="center" verticalAlign="bottom"
        fontSize={Math.min(14, room.w / 4)}
        fontFamily="'Inter', system-ui, sans-serif"
        fontStyle="700"
        fill={color.label}
      />

      {/* Area label */}
      <Text
        text={`${Math.round(room.area ?? 0)} ft²`}
        width={room.w} height={room.h / 2}
        y={room.h / 2 + 2}
        align="center" verticalAlign="top"
        fontSize={Math.min(10, room.w / 6)}
        fontFamily="'Inter', system-ui, sans-serif"
        fill="rgba(255,255,255,0.35)"
      />

      {/* Resize handles */}
      {handles.map(({ id, cx, cy }) => (
        <ResizeHandle
          key={id}
          cx={cx} cy={cy}
          handleId={id}
          room={room}
          color={color.stroke}
          onResizeEnd={onResizeEnd}
        />
      ))}
    </Group>
  )
}

// ─── Resize Handle ────────────────────────────────────────────────────────────

function ResizeHandle({ cx, cy, handleId, room, color, onResizeEnd }) {
  const startRef = useRef(null)

  return (
    <Circle
      x={cx} y={cy}
      radius={HANDLE_RADIUS}
      fill="#0a0a0c"
      stroke={color}
      strokeWidth={2}
      draggable
      onDragStart={(e) => {
        e.cancelBubble = true
        startRef.current = { x: room.x, y: room.y, w: room.w, h: room.h }
      }}
      onDragMove={(e) => {
        e.cancelBubble = true
      }}
      onDragEnd={(e) => {
        e.cancelBubble = true
        const dx = snap(e.target.x()) - cx
        const dy = snap(e.target.y()) - cy
        const { x, y, w, h } = startRef.current

        let newX = x, newY = y, newW = w, newH = h

        if (handleId === 'tl') {
          newX = snap(x + dx); newY = snap(y + dy)
          newW = Math.max(MIN_ROOM_SIZE, w - dx)
          newH = Math.max(MIN_ROOM_SIZE, h - dy)
        } else if (handleId === 'tr') {
          newY = snap(y + dy)
          newW = Math.max(MIN_ROOM_SIZE, w + dx)
          newH = Math.max(MIN_ROOM_SIZE, h - dy)
        } else if (handleId === 'bl') {
          newX = snap(x + dx)
          newW = Math.max(MIN_ROOM_SIZE, w - dx)
          newH = Math.max(MIN_ROOM_SIZE, h + dy)
        } else if (handleId === 'br') {
          newW = Math.max(MIN_ROOM_SIZE, w + dx)
          newH = Math.max(MIN_ROOM_SIZE, h + dy)
        }

        // Reset handle position (it will rerender at correct spot)
        e.target.x(cx)
        e.target.y(cy)

        onResizeEnd(room.id, newX, newY, newW, newH)
      }}
    />
  )
}

// ─── Main Canvas ──────────────────────────────────────────────────────────────

const CANVAS_W = 800
const CANVAS_H = 600

export default function FloorPlanCanvas({ layout, onChange }) {
  const [rooms, setRooms] = useState([])
  const [selected, setSelected] = useState(null)

  // Initialise rooms from layout on first mount or layout change
  useEffect(() => {
    if (layout?.rooms?.length) {
      setRooms(layoutToRects(layout.rooms, CANVAS_W, CANVAS_H))
    }
  }, [layout])

  // Propagate changes up so parent can save
  useEffect(() => {
    if (onChange && rooms.length > 0) {
      onChange(rooms)
    }
  }, [rooms, onChange])

  const handleDragEnd = useCallback((id, x, y) => {
    setRooms((prev) => prev.map((r) => r.id === id ? { ...r, x, y } : r))
  }, [])

  const handleResizeEnd = useCallback((id, x, y, w, h) => {
    setRooms((prev) => prev.map((r) =>
      r.id === id ? { ...r, x, y, w, h, area: Math.round(w * h / 25) } : r
    ))
  }, [])

  const handleStageClick = useCallback((e) => {
    if (e.target === e.target.getStage()) setSelected(null)
  }, [])

  return (
    <div className="relative">
      <div
        className="border border-white/[0.06] rounded-xl overflow-hidden"
        style={{ background: '#0a0a0c' }}
      >
        <Stage
          width={CANVAS_W}
          height={CANVAS_H}
          onClick={handleStageClick}
          onTap={handleStageClick}
        >
          <Layer>
            <GridLayer width={CANVAS_W} height={CANVAS_H} />
          </Layer>
          <Layer>
            {rooms.map((room) => (
              <RoomRect
                key={room.id}
                room={room}
                isSelected={selected === room.id}
                onSelect={setSelected}
                onDragEnd={handleDragEnd}
                onResizeEnd={handleResizeEnd}
              />
            ))}
          </Layer>
        </Stage>
      </div>

      {/* Toolbar hint */}
      <div className="mt-2 flex items-center gap-4 text-[11px] text-[#5a5855] font-mono">
        <span>Click room to select</span>
        <span>·</span>
        <span>Drag to move</span>
        <span>·</span>
        <span>Drag corners to resize</span>
        <span>·</span>
        <span>Snaps to {GRID_SIZE}px grid</span>
      </div>
    </div>
  )
}