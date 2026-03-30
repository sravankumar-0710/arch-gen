// filepath: src/components/layout-results/LayoutPreview.jsx
// Purpose: Render a floor plan layout using react-konva (rooms, walls, doors, windows)

import React, { useMemo } from 'react'
import { Stage, Layer, Line, Rect, Text, Circle } from 'react-konva'

// Color map for room types — used for fill on the canvas
const ROOM_COLORS = {
  master_bedroom: '#d98ef5',
  bedroom:        '#b8d9ff',
  kitchen:        '#ffd997',
  living_room:    '#a8e6d8',
  dining_room:    '#f4a8d8',
  bathroom:       '#a8d0f0',
  pooja:          '#ffc0c0',
  balcony:        '#90ee90',
  garage:         '#d3d3d3',
  store:          '#d0a080',
  entrance:       '#e0e0e0',
}

const DEFAULT_ROOM_COLOR = '#e0e0e0'

/**
 * Computes a scale + offset to fit all room geometry within the view with padding.
 */
function computeTransform(rooms, viewWidth, viewHeight) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

  rooms.forEach((room) => {
    const coords = room.polygon
    if (Array.isArray(coords) && Array.isArray(coords[0])) {
      coords.forEach(([x, y]) => {
        minX = Math.min(minX, x)
        minY = Math.min(minY, y)
        maxX = Math.max(maxX, x)
        maxY = Math.max(maxY, y)
      })
    }
  })

  const boundWidth = maxX - minX || 100
  const boundHeight = maxY - minY || 100
  const scale = Math.min((viewWidth * 0.8) / boundWidth, (viewHeight * 0.8) / boundHeight)
  const offsetX = (viewWidth - boundWidth * scale) / 2 - minX * scale
  const offsetY = (viewHeight - boundHeight * scale) / 2 - minY * scale

  return { scale, offsetX, offsetY }
}

export default function LayoutPreview({
  layout,
  width = 600,
  height = 400,
  showLabels = true,
  showDimensions = false,
}) {
  const { scale, offsetX, offsetY } = useMemo(
    () => computeTransform(layout?.rooms || [], width, height),
    [layout, width, height]
  )

  if (!layout || !layout.rooms?.length) {
    return (
      <div
        className="flex items-center justify-center bg-[#0f0f12] border border-white/[0.06] rounded-lg text-[#5a5855] text-sm"
        style={{ width, height }}
      >
        No layout data
      </div>
    )
  }

  const tx = (x) => x * scale + offsetX
  const ty = (y) => y * scale + offsetY

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <Stage width={width} height={height}>
        <Layer>
          {/* Rooms */}
          {layout.rooms.map((room, idx) => {
            const fill = ROOM_COLORS[room.type] || DEFAULT_ROOM_COLOR
            const points = (room.polygon || []).flatMap(([x, y]) => [tx(x), ty(y)])

            return (
              <Line
                key={`room-${idx}`}
                points={points}
                closed={true}
                fill={fill}
                stroke="#333"
                strokeWidth={2}
                opacity={0.7}
              />
            )
          })}

          {/* Room labels */}
          {showLabels && layout.rooms.map((room, idx) => {
            if (!room.centroid) return null
            const [cx, cy] = room.centroid
            return (
              <Text
                key={`label-${idx}`}
                x={tx(cx) - 40}
                y={ty(cy) - 15}
                text={room.type.replace(/_/g, ' ')}
                fontSize={12}
                fontFamily="Arial"
                fill="#333"
                align="center"
                width={80}
              />
            )
          })}

          {/* Area labels */}
          {showDimensions && layout.rooms.map((room, idx) => {
            if (!room.centroid || !room.area) return null
            const [cx, cy] = room.centroid
            return (
              <Text
                key={`area-${idx}`}
                x={tx(cx) - 40}
                y={ty(cy) + 5}
                text={`${Math.round(room.area)} sqft`}
                fontSize={10}
                fontFamily="Arial"
                fill="#666"
                align="center"
                width={80}
              />
            )
          })}

          {/* Walls */}
          {layout.walls?.map((wall, idx) => {
            const [x1, y1] = wall.start
            const [x2, y2] = wall.end
            return (
              <Line
                key={`wall-${idx}`}
                points={[tx(x1), ty(y1), tx(x2), ty(y2)]}
                stroke={wall.type === 'load_bearing' ? '#333' : '#999'}
                strokeWidth={wall.type === 'load_bearing' ? 4 : 2}
              />
            )
          })}

          {/* Doors */}
          {layout.doors?.map((door, idx) => {
            const [x, y] = door.position
            return (
              <Rect
                key={`door-${idx}`}
                x={tx(x) - 7.5}
                y={ty(y) - 7.5}
                width={15}
                height={15}
                fill="#8b4513"
                stroke="#333"
                strokeWidth={1}
              />
            )
          })}

          {/* Windows */}
          {layout.windows?.map((win, idx) => {
            const [x, y] = win.position
            return (
              <Rect
                key={`win-${idx}`}
                x={tx(x) - 5}
                y={ty(y) - 5}
                width={10}
                height={10}
                fill="#87ceeb"
                stroke="#333"
                strokeWidth={1}
              />
            )
          })}
        </Layer>
      </Stage>
    </div>
  )
}