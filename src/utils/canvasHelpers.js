// filepath: src/utils/canvasHelpers.js
// Purpose: Helper functions for Konva.js canvas interactions — grid snapping, coordinate transforms.

// Default grid cell size in canvas pixels
export const GRID_SIZE = 20
// Default scale: pixels per foot
export const DEFAULT_SCALE_PX_PER_FT = 10

/**
 * Snaps a canvas coordinate to the nearest grid point.
 *
 * @param {number} value - raw pixel coordinate
 * @param {number} gridSize - grid cell size in pixels
 * @returns {number}
 */
export function snapToGrid(value, gridSize = GRID_SIZE) {
  return Math.round(value / gridSize) * gridSize
}

/**
 * Snaps an { x, y } point to the nearest grid intersection.
 *
 * @param {{x: number, y: number}} point
 * @param {number} gridSize
 * @returns {{x: number, y: number}}
 */
export function snapPointToGrid(point, gridSize = GRID_SIZE) {
  return {
    x: snapToGrid(point.x, gridSize),
    y: snapToGrid(point.y, gridSize),
  }
}

/**
 * Converts a flat [x1, y1, x2, y2, ...] Konva points array to
 * an array of { x, y } objects.
 *
 * @param {number[]} flatPoints
 * @returns {Array<{x: number, y: number}>}
 */
export function flatToPoints(flatPoints) {
  const points = []
  for (let i = 0; i < flatPoints.length; i += 2) {
    points.push({ x: flatPoints[i], y: flatPoints[i + 1] })
  }
  return points
}

/**
 * Converts an array of { x, y } objects to a flat [x1, y1, x2, y2, ...] Konva array.
 *
 * @param {Array<{x: number, y: number}>} points
 * @returns {number[]}
 */
export function pointsToFlat(points) {
  return points.flatMap((p) => [p.x, p.y])
}

/**
 * Returns the Euclidean distance between two points.
 *
 * @param {{x: number, y: number}} a
 * @param {{x: number, y: number}} b
 * @returns {number}
 */
export function distance(a, b) {
  return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2))
}

/**
 * Checks if a point is within a threshold distance of a target point.
 * Used to detect "click near first point to close polygon".
 *
 * @param {{x: number, y: number}} point
 * @param {{x: number, y: number}} target
 * @param {number} threshold - in canvas pixels
 * @returns {boolean}
 */
export function isNearPoint(point, target, threshold = 12) {
  return distance(point, target) <= threshold
}
