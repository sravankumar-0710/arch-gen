// filepath: src/store/landStore.js
// Purpose: Global state for land/plot input — polygon points, dimensions, orientation, road side.

import { create } from 'zustand'

const useLandStore = create((set) => ({
  // Polygon points as array of { x, y } in canvas pixels
  polygonPoints: [],
  // Unit system: 'ft' or 'm'
  unit: 'ft',
  // Which edge index of the polygon is the road-facing side
  roadSide: null,
  // North direction angle in degrees (0 = up, clockwise)
  northAngle: 0,
  // Manual dimension input (used in rectangle mode)
  dimensions: { width: null, height: null },
  // Drawing mode: 'polygon' | 'rectangle'
  drawingMode: 'polygon',
  // Whether the polygon is closed (drawing complete)
  isClosed: false,

  setPolygonPoints: (points) => set({ polygonPoints: points }),
  setUnit: (unit) => set({ unit }),
  setRoadSide: (side) => set({ roadSide: side }),
  setNorthAngle: (angle) => set({ northAngle: angle }),
  setDimensions: (dimensions) => set({ dimensions }),
  setDrawingMode: (mode) => set({ drawingMode: mode }),
  setIsClosed: (isClosed) => set({ isClosed }),

  addPoint: (point) =>
    set((state) => ({ polygonPoints: [...state.polygonPoints, point] })),

  reset: () =>
    set({
      polygonPoints: [],
      unit: 'ft',
      roadSide: null,
      northAngle: 0,
      dimensions: { width: null, height: null },
      drawingMode: 'polygon',
      isClosed: false,
    }),
}))

export default useLandStore
