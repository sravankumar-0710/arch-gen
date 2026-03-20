// filepath: src/components/land-input/LandCanvas.jsx
// Purpose: Konva.js canvas for drawing and displaying the plot polygon

import { useRef, useState } from 'react'
import { Stage, Layer, Line, Circle, Text } from 'react-konva'
import useLandStore from '../../store/landStore.js'
import { validatePolygon } from '../../utils/geometry.js'

const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 600
const POINT_RADIUS = 6
const SNAP_DISTANCE = 15

export default function LandCanvas() {
  const stageRef = useRef(null)
  const {
    polygonPoints,
    addPoint,
    setPolygonPoints,
    setIsClosed,
    isClosed,
  } = useLandStore()

  const [hoverPoint, setHoverPoint] = useState(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [error, setError] = useState(null)

  const handleCanvasClick = (e) => {
    if (isClosed) return

    const stage = stageRef.current
    if (!stage) return

    const pos = stage.getPointerPosition()
    if (!pos) return

    // Check if clicking on first point to close polygon
    if (
      polygonPoints.length >= 3 &&
      Math.hypot(pos.x - polygonPoints[0].x, pos.y - polygonPoints[0].y) < SNAP_DISTANCE
    ) {
      closePolygon()
      return
    }

    // Skip duplicate points
    for (let i = 0; i < polygonPoints.length; i++) {
      const dist = Math.hypot(pos.x - polygonPoints[i].x, pos.y - polygonPoints[i].y)
      if (dist < SNAP_DISTANCE) return
    }

    addPoint({ x: Math.round(pos.x), y: Math.round(pos.y) })
    setError(null)
  }

  const closePolygon = () => {
    const validationError = validatePolygon(polygonPoints)
    if (validationError) {
      setError(validationError)
      return
    }
    setIsClosed(true)
    setError(null)
  }

  const handleMouseMove = (e) => {
    if (isClosed) return

    const stage = stageRef.current
    if (!stage) return

    const pos = stage.getPointerPosition()
    if (!pos) return

    setMousePos(pos)

    if (polygonPoints.length >= 3) {
      const dist = Math.hypot(pos.x - polygonPoints[0].x, pos.y - polygonPoints[0].y)
      setHoverPoint(dist < SNAP_DISTANCE ? 0 : null)
    }
  }

  const handleUndo = () => {
    if (polygonPoints.length === 0 || isClosed) return
    setPolygonPoints(polygonPoints.slice(0, -1))
    setError(null)
  }

  const handleReset = () => {
    setPolygonPoints([])
    setIsClosed(false)
    setError(null)
    setHoverPoint(null)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Canvas */}
      <div className="border border-white/[0.06] rounded-xl overflow-hidden bg-[#0a0a0c]">
        <Stage
          ref={stageRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          style={{ cursor: isClosed ? 'default' : 'crosshair', touchAction: 'none', display: 'block' }}
        >
          <Layer>
            <GridLines width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />

            {/* Closed polygon: filled shape */}
            {isClosed && polygonPoints.length > 0 && (
              <Line
                points={polygonPoints.flatMap((p) => [p.x, p.y])}
                stroke="#d4a832"
                strokeWidth={2}
                closed={true}
                fill="rgba(212,168,50,0.08)"
                lineCap="round"
                lineJoin="round"
              />
            )}

            {/* Open polygon: lines while drawing */}
            {!isClosed && polygonPoints.length > 0 && (
              <>
                <Line
                  points={polygonPoints.flatMap((p) => [p.x, p.y])}
                  stroke="#d4a832"
                  strokeWidth={2}
                  closed={false}
                  lineCap="round"
                  lineJoin="round"
                />

                {/* Dashed closing preview line */}
                {polygonPoints.length >= 3 && !hoverPoint && (
                  <Line
                    points={[
                      polygonPoints[polygonPoints.length - 1].x,
                      polygonPoints[polygonPoints.length - 1].y,
                      polygonPoints[0].x,
                      polygonPoints[0].y,
                    ]}
                    stroke="#d4a832"
                    strokeWidth={2}
                    dash={[5, 5]}
                    lineCap="round"
                  />
                )}
              </>
            )}

            {/* Preview line to mouse cursor */}
            {!isClosed && polygonPoints.length > 0 && !hoverPoint && (
              <Line
                points={[
                  polygonPoints[polygonPoints.length - 1].x,
                  polygonPoints[polygonPoints.length - 1].y,
                  mousePos.x,
                  mousePos.y,
                ]}
                stroke="rgba(212,168,50,0.5)"
                strokeWidth={1}
                dash={[3, 3]}
              />
            )}

            {/* Points */}
            {polygonPoints.map((point, idx) => (
              <Circle
                key={`point-${idx}`}
                x={point.x}
                y={point.y}
                radius={POINT_RADIUS}
                fill={!isClosed && idx === 0 && hoverPoint === 0 ? '#e05252' : '#d4a832'}
                stroke="#f0ede8"
                strokeWidth={2}
              />
            ))}

            {/* Point labels — hidden when closed to keep the view clean */}
            {!isClosed && polygonPoints.map((point, idx) => (
              <Text
                key={`label-${idx}`}
                x={point.x + 10}
                y={point.y - 20}
                text={`${idx + 1}`}
                fill="#d4a832"
                fontSize={12}
                fontStyle="bold"
              />
            ))}
          </Layer>
        </Stage>
      </div>

      {/* Error message */}
      {error && (
        <div className="px-4 py-3 bg-[rgba(224,82,82,0.08)] border border-[rgba(224,82,82,0.2)] rounded-lg text-[#e05252] text-[13px]">
          {error}
        </div>
      )}

      {/* Closed polygon success banner */}
      {isClosed && (
        <div className="px-4 py-3 bg-[rgba(61,184,122,0.08)] border border-[rgba(61,184,122,0.2)] rounded-lg text-[#3db87a] text-[13px] flex items-center gap-2">
          <span>✓</span>
          <span>Plot outline locked. Set road side and north direction to continue.</span>
          <button
            onClick={handleReset}
            className="ml-auto text-[11px] text-[#5a5855] hover:text-[#9d9a94] transition-colors cursor-pointer bg-transparent border-none"
          >
            Redraw
          </button>
        </div>
      )}

      {/* Instructions and controls — only shown while drawing */}
      {!isClosed && (
        <div className="bg-[#0f0f12] border border-white/[0.06] rounded-xl p-4 flex flex-col gap-3">
          <div className="text-[13px] text-[#9d9a94]">
            <p className="font-semibold mb-2 text-[#f0ede8]">How to draw your plot:</p>
            <ol className="list-decimal list-inside m-0 p-0 pl-2 flex flex-col gap-1">
              <li className="text-xs">Click on the canvas to add points (min. 3 points)</li>
              <li className="text-xs">Click on the first point to close the polygon</li>
              <li className="text-xs">Use Undo to remove the last point</li>
              <li className="text-xs">Use Reset to start over</li>
            </ol>
          </div>

          <div className="flex gap-2 items-center">
            <button
              onClick={handleUndo}
              disabled={polygonPoints.length === 0}
              className="px-4 py-2 bg-[rgba(212,168,50,0.1)] text-[#d4a832] border border-[rgba(212,168,50,0.2)] rounded-lg text-xs font-medium transition-all hover:bg-[rgba(212,168,50,0.2)] disabled:opacity-50 disabled:cursor-not-allowed disabled:text-[#5a5855]"
            >
              ↶ Undo
            </button>
            <button
              onClick={handleReset}
              disabled={polygonPoints.length === 0}
              className="px-4 py-2 bg-[rgba(224,82,82,0.1)] text-[#e05252] border border-[rgba(224,82,82,0.2)] rounded-lg text-xs font-medium transition-all hover:bg-[rgba(224,82,82,0.2)] disabled:opacity-50 disabled:cursor-not-allowed disabled:text-[#5a5855]"
            >
              Reset
            </button>
            <div className="flex-1" />
            <div className="text-xs text-[#9d9a94] py-1">
              Points: <span className="font-bold text-[#f0ede8]">{polygonPoints.length}</span>
              {polygonPoints.length >= 3 && (
                <span className="ml-3 text-[#3db87a]">✓ Ready to close</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function GridLines({ width, height }) {
  const lines = []
  const spacing = 50

  for (let x = 0; x < width; x += spacing) {
    lines.push(
      <Line
        key={`vline-${x}`}
        points={[x, 0, x, height]}
        stroke="rgba(255,255,255,0.05)"
        strokeWidth={1}
      />
    )
  }

  for (let y = 0; y < height; y += spacing) {
    lines.push(
      <Line
        key={`hline-${y}`}
        points={[0, y, width, y]}
        stroke="rgba(255,255,255,0.05)"
        strokeWidth={1}
      />
    )
  }

  return <>{lines}</>
}