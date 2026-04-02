// filepath: src/components/land-input/LandCanvas.jsx
// Purpose: Konva.js canvas stage for drawing and displaying the plot polygon.

import React from 'react'
import { Stage, Layer, Line } from 'react-konva'
import useCanvas from '../../hooks/useCanvas.js'
import PolygonDrawer from './PolygonDrawer.jsx'

const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 600
const GRID_SPACING = 50
// Scale: 50px = 10ft (5px per foot). Each grid cell = 10ft × 10ft.

export default function LandCanvas() {
  const {
    stageRef,
    hoverFirstPoint,
    mousePos,
    error,
    polygonPoints,
    isClosed,
    handleCanvasClick,
    handleMouseMove,
    handleUndo,
    handleReset,
  } = useCanvas()

  return (
    <div className="flex flex-col gap-4">

      {/* Canvas stage */}
      <div className="border border-white/[0.06] rounded-xl overflow-hidden bg-[#0a0a0c]">
        <Stage
          ref={stageRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          style={{
            cursor: isClosed ? 'default' : 'crosshair',
            touchAction: 'none',
            display: 'block',
          }}
        >
          <Layer>
            <GridLines width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />
            <PolygonDrawer
              polygonPoints={polygonPoints}
              isClosed={isClosed}
              mousePos={mousePos}
              hoverFirstPoint={hoverFirstPoint}
            />
          </Layer>
        </Stage>
      </div>

      {/* Scale indicator — 50px grid = 10ft per cell at 5px/ft */}
      <div className="flex items-center gap-3 px-1">
        <div className="flex items-center gap-1.5">
          <div className="w-[50px] h-[2px] bg-[#5a5855]" />
          <span className="text-[11px] text-[#5a5855]">= 10 ft per grid cell</span>
        </div>
        <span className="text-[11px] text-[#5a5855]">·</span>
        <span className="text-[11px] text-[#5a5855]">Minimum plot: 30 × 30 ft (3 × 3 cells)</span>
      </div>

      {/* Validation error */}
      {error && (
        <div className="px-4 py-3 bg-[rgba(224,82,82,0.08)] border border-[rgba(224,82,82,0.2)] rounded-lg text-[#e05252] text-[13px]">
          {error}
        </div>
      )}

      {/* Closed polygon — success banner */}
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

      {/* Drawing instructions + controls */}
      {!isClosed && (
        <div className="bg-[#0f0f12] border border-white/[0.06] rounded-xl p-4 flex flex-col gap-3">
          <div className="text-[13px] text-[#9d9a94]">
            <p className="font-semibold mb-2 text-[#f0ede8]">How to draw your plot:</p>
            <ol className="list-decimal list-inside m-0 p-0 pl-2 flex flex-col gap-1">
              <li className="text-xs">Click on the canvas to add corner points (min. 3)</li>
              <li className="text-xs">Click on the first point (turns red) to close the shape</li>
              <li className="text-xs">Use Undo to remove the last point</li>
              <li className="text-xs">Use Reset to start over</li>
            </ol>
          </div>

          <div className="flex gap-2 items-center">
            <button
              onClick={handleUndo}
              disabled={polygonPoints.length === 0}
              className="px-4 py-2 bg-[rgba(212,168,50,0.1)] text-[#d4a832] border border-[rgba(212,168,50,0.2)] rounded-lg text-xs font-medium transition-all hover:bg-[rgba(212,168,50,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ↶ Undo
            </button>
            <button
              onClick={handleReset}
              disabled={polygonPoints.length === 0}
              className="px-4 py-2 bg-[rgba(224,82,82,0.1)] text-[#e05252] border border-[rgba(224,82,82,0.2)] rounded-lg text-xs font-medium transition-all hover:bg-[rgba(224,82,82,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reset
            </button>
            <div className="flex-1" />
            <div className="text-xs text-[#9d9a94]">
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

// Internal grid renderer — not exported, purely presentational
function GridLines({ width, height }) {
  const lines = []

  for (let x = 0; x < width; x += GRID_SPACING) {
    lines.push(
      <Line
        key={`vline-${x}`}
        points={[x, 0, x, height]}
        stroke="rgba(255,255,255,0.05)"
        strokeWidth={1}
      />
    )
  }

  for (let y = 0; y < height; y += GRID_SPACING) {
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