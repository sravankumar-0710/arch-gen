// filepath: src/components/layout-results/LayoutPreview.jsx
// Purpose: Render floor plan using Konva.js (rooms, walls, doors, windows)

import { useEffect, useRef } from 'react'
import Konva from 'konva'

export default function LayoutPreview({
  layout,
  width = 600,
  height = 400,
  showLabels = true,
  showDimensions = false,
  interactive = false,
  onRoomClick = null
}) {
  const containerRef = useRef(null)
  const stageRef = useRef(null)
  const layerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current || !layout) return

    // Create stage and layer
    const stage = new Konva.Stage({
      container: containerRef.current,
      width: width,
      height: height,
      draggable: false
    })

    const layer = new Konva.Layer()
    stage.add(layer)

    stageRef.current = stage
    layerRef.current = layer

    // Draw layout
    drawLayout(layer, layout, width, height)

    // Store for cleanup
    const currentStage = stage
    const currentLayer = layer

    return () => {
      currentStage.destroy()
    }
  }, [layout, width, height])

  const drawLayout = (layer, layout, viewWidth, viewHeight) => {
    if (!layout.rooms || layout.rooms.length === 0) return

    // Calculate bounds of all rooms
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity

    layout.rooms.forEach((room) => {
      const coords = room.polygon || room.centroid
      if (Array.isArray(coords[0])) {
        coords.forEach(([x, y]) => {
          minX = Math.min(minX, x)
          minY = Math.min(minY, y)
          maxX = Math.max(maxX, x)
          maxY = Math.max(maxY, y)
        })
      }
    })

    // Calculate scale to fit in view
    const boundWidth = maxX - minX || 100
    const boundHeight = maxY - minY || 100
    const scaleX = (viewWidth * 0.8) / boundWidth
    const scaleY = (viewHeight * 0.8) / boundHeight
    const scale = Math.min(scaleX, scaleY)
    const offsetX = (viewWidth - boundWidth * scale) / 2 - minX * scale
    const offsetY = (viewHeight - boundHeight * scale) / 2 - minY * scale

    // Color scheme for room types
    const roomColors = {
      master_bedroom: '#d98ef5',
      bedroom: '#b8d9ff',
      kitchen: '#ffd997',
      living_room: '#a8e6d8',
      dining_room: '#f4a8d8',
      bathroom: '#a8csf0',
      pooja: '#ffc0c0',
      balcony: '#90ee90',
      garage: '#d3d3d3',
      store: '#d0a080',
      entrance: '#e0e0e0'
    }

    // Draw rooms
    layout.rooms.forEach((room, idx) => {
      const color = roomColors[room.type] || '#e0e0e0'

      if (room.polygon && Array.isArray(room.polygon[0])) {
        // Draw polygon room
        const points = room.polygon.flatMap(([x, y]) => [
          x * scale + offsetX,
          y * scale + offsetY
        ])

        const polygon = new Konva.Polygon({
          points: points,
          fill: color,
          stroke: '#333',
          strokeWidth: 2,
          opacity: 0.7,
          id: `room-${idx}`
        })

        polygon.on('click', () => {
          if (onRoomClick) onRoomClick(room)
        })

        layer.add(polygon)
      }

      // Draw room label and area
      if (showLabels && room.centroid) {
        const [cx, cy] = room.centroid
        const labelX = cx * scale + offsetX
        const labelY = cy * scale + offsetY

        // Room type label
        const typeText = new Konva.Text({
          x: labelX - 40,
          y: labelY - 15,
          text: room.type.replace(/_/g, ' '),
          fontSize: 12,
          fontFamily: 'Arial',
          fill: '#333',
          align: 'center',
          width: 80
        })

        layer.add(typeText)

        // Area label (if showing dimensions)
        if (showDimensions && room.area) {
          const areaText = new Konva.Text({
            x: labelX - 40,
            y: labelY + 5,
            text: `${Math.round(room.area)} sqft`,
            fontSize: 10,
            fontFamily: 'Arial',
            fill: '#666',
            align: 'center',
            width: 80
          })

          layer.add(areaText)
        }
      }
    })

    // Draw walls
    if (layout.walls) {
      layout.walls.forEach((wall) => {
        const [x1, y1] = wall.start
        const [x2, y2] = wall.end

        const strokeColor = wall.type === 'load_bearing' ? '#333' : '#999'
        const strokeWidth = wall.type === 'load_bearing' ? 4 : 2

        const line = new Konva.Line({
          points: [x1 * scale + offsetX, y1 * scale + offsetY, x2 * scale + offsetX, y2 * scale + offsetY],
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          tension: 0
        })

        layer.add(line)
      })
    }

    // Draw doors
    if (layout.doors) {
      layout.doors.forEach((door) => {
        const [x, y] = door.position
        const doorSize = 15

        const doorRect = new Konva.Rect({
          x: x * scale + offsetX - doorSize / 2,
          y: y * scale + offsetY - doorSize / 2,
          width: doorSize,
          height: doorSize,
          fill: '#8b4513',
          stroke: '#333',
          strokeWidth: 1
        })

        layer.add(doorRect)
      })
    }

    // Draw windows
    if (layout.windows) {
      layout.windows.forEach((window) => {
        const [x, y] = window.position
        const windowSize = 10

        const windowRect = new Konva.Rect({
          x: x * scale + offsetX - windowSize / 2,
          y: y * scale + offsetY - windowSize / 2,
          width: windowSize,
          height: windowSize,
          fill: '#87ceeb',
          stroke: '#333',
          strokeWidth: 1
        })

        layer.add(windowRect)
      })
    }

    layer.draw()
  }

  return (
    <div
      ref={containerRef}
      className="bg-white border border-slate-200 rounded-lg overflow-hidden"
      style={{ cursor: interactive ? 'pointer' : 'default' }}
    />
  )
}
