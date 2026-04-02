// filepath: src/components/land-input/PolygonDrawer.jsx
// Purpose: Polygon drawing tool — renders drawing lines, preview cursor line, and point handles.
// Receives all state and handlers from LandCanvas via props (no direct store access).

import React from 'react'
import { Line, Circle, Text } from 'react-konva'

const POINT_RADIUS = 6

export default function PolygonDrawer({
  polygonPoints,
  isClosed,
  mousePos,
  hoverFirstPoint,
}) {
  if (polygonPoints.length === 0) return null

  const flatPoints = polygonPoints.flatMap((p) => [p.x, p.y])
  const lastPoint = polygonPoints[polygonPoints.length - 1]

  return (
    <>
      {/* Closed polygon — filled shape */}
      {isClosed && (
        <Line
          points={flatPoints}
          stroke="#d4a832"
          strokeWidth={2}
          closed={true}
          fill="rgba(212,168,50,0.08)"
          lineCap="round"
          lineJoin="round"
        />
      )}

      {/* Open polygon — lines while drawing */}
      {!isClosed && (
        <>
          <Line
            points={flatPoints}
            stroke="#d4a832"
            strokeWidth={2}
            closed={false}
            lineCap="round"
            lineJoin="round"
          />

          {/* Dashed closing preview line (shown when >= 3 points and not hovering first point) */}
          {polygonPoints.length >= 3 && !hoverFirstPoint && (
            <Line
              points={[
                lastPoint.x,
                lastPoint.y,
                polygonPoints[0].x,
                polygonPoints[0].y,
              ]}
              stroke="#d4a832"
              strokeWidth={2}
              dash={[5, 5]}
              lineCap="round"
            />
          )}

          {/* Live preview line from last point to mouse cursor */}
          {!hoverFirstPoint && (
            <Line
              points={[lastPoint.x, lastPoint.y, mousePos.x, mousePos.y]}
              stroke="rgba(212,168,50,0.5)"
              strokeWidth={1}
              dash={[3, 3]}
            />
          )}
        </>
      )}

      {/* Point handles */}
      {polygonPoints.map((point, idx) => (
        <Circle
          key={`point-${idx}`}
          x={point.x}
          y={point.y}
          radius={POINT_RADIUS}
          fill={!isClosed && idx === 0 && hoverFirstPoint ? '#e05252' : '#d4a832'}
          stroke="#f0ede8"
          strokeWidth={2}
        />
      ))}

      {/* Point index labels — hidden when closed */}
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
    </>
  )
}