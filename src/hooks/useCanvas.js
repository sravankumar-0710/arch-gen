// filepath: src/hooks/useCanvas.js
// Purpose: Canvas interaction logic for polygon drawing — click, mousemove, undo, reset, close.
// Extracted from LandCanvas so the component body stays purely presentational.

import React, { useState, useRef } from 'react'
import useLandStore from '../store/landStore.js'
import { validatePolygon } from '../utils/geometry.js'
import { isNearPoint } from '../utils/canvasHelpers.js'

const SNAP_THRESHOLD = 15

export default function useCanvas() {
  const stageRef = useRef(null)
  const [hoverFirstPoint, setHoverFirstPoint] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [error, setError] = useState(null)

  const {
    polygonPoints,
    addPoint,
    setPolygonPoints,
    setIsClosed,
    isClosed,
  } = useLandStore()

  const closePolygon = () => {
    const validationError = validatePolygon(polygonPoints)
    if (validationError) {
      setError(validationError)
      return
    }
    setIsClosed(true)
    setError(null)
  }

  const handleCanvasClick = () => {
    if (isClosed) return

    const stage = stageRef.current
    if (!stage) return

    const pos = stage.getPointerPosition()
    if (!pos) return

    // Click near first point → close polygon
    if (
      polygonPoints.length >= 3 &&
      isNearPoint(pos, polygonPoints[0], SNAP_THRESHOLD)
    ) {
      closePolygon()
      return
    }

    // Skip if clicking too close to an existing point
    const tooClose = polygonPoints.some((pt) =>
      isNearPoint(pos, pt, SNAP_THRESHOLD)
    )
    if (tooClose) return

    addPoint({ x: Math.round(pos.x), y: Math.round(pos.y) })
    setError(null)
  }

  const handleMouseMove = () => {
    if (isClosed) return

    const stage = stageRef.current
    if (!stage) return

    const pos = stage.getPointerPosition()
    if (!pos) return

    setMousePos(pos)

    if (polygonPoints.length >= 3) {
      setHoverFirstPoint(isNearPoint(pos, polygonPoints[0], SNAP_THRESHOLD))
    } else {
      setHoverFirstPoint(false)
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
    setHoverFirstPoint(false)
  }

  return {
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
  }
}