// filepath: src/utils/geometry.js
// Purpose: Frontend polygon validation and geometry helpers.
// All polygon inputs from the user must pass through here BEFORE being sent to the backend.

// Minimum polygon area thresholds
const MIN_POLYGON_AREA_SQFT = 400  // 20ft × 20ft minimum plot
const MIN_POLYGON_POINTS = 3

/**
 * Validates a polygon defined by an array of { x, y } canvas points.
 * Returns null if valid, or an error message string if invalid.
 *
 * @param {Array<{x: number, y: number}>} points
 * @returns {string|null}
 */
export function validatePolygon(points) {
  if (!points || points.length < MIN_POLYGON_POINTS) {
    return `A plot requires at least ${MIN_POLYGON_POINTS} points.`
  }

  if (hasSelfIntersection(points)) {
    return 'The plot outline crosses itself. Please draw a simple (non-self-intersecting) polygon.'
  }

  // Area check is approximate on canvas pixels — backend validates in real units
  const area = computePolygonArea(points)
  if (area < 100) {
    return 'The drawn plot is too small. Please draw a larger area.'
  }

  return null
}

/**
 * Computes the area of a polygon using the Shoelace formula.
 * Input is array of { x, y } points. Returns area in square canvas units.
 *
 * @param {Array<{x: number, y: number}>} points
 * @returns {number}
 */
export function computePolygonArea(points) {
  if (points.length < 3) return 0
  let area = 0
  const n = points.length

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    area += points[i].x * points[j].y
    area -= points[j].x * points[i].y
  }

  return Math.abs(area) / 2
}

/**
 * Computes the centroid of a polygon.
 *
 * @param {Array<{x: number, y: number}>} points
 * @returns {{x: number, y: number}}
 */
export function computeCentroid(points) {
  const n = points.length
  if (n === 0) return { x: 0, y: 0 }

  const sumX = points.reduce((acc, p) => acc + p.x, 0)
  const sumY = points.reduce((acc, p) => acc + p.y, 0)
  return { x: sumX / n, y: sumY / n }
}

/**
 * Checks whether two line segments (p1→p2) and (p3→p4) intersect.
 * Uses standard cross-product intersection test.
 *
 * @returns {boolean}
 */
function segmentsIntersect(p1, p2, p3, p4) {
  const d1 = direction(p3, p4, p1)
  const d2 = direction(p3, p4, p2)
  const d3 = direction(p1, p2, p3)
  const d4 = direction(p1, p2, p4)

  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
      ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
    return true
  }

  // Collinear cases
  if (d1 === 0 && onSegment(p3, p4, p1)) return true
  if (d2 === 0 && onSegment(p3, p4, p2)) return true
  if (d3 === 0 && onSegment(p1, p2, p3)) return true
  if (d4 === 0 && onSegment(p1, p2, p4)) return true

  return false
}

function direction(pi, pj, pk) {
  return (pk.x - pi.x) * (pj.y - pi.y) - (pj.x - pi.x) * (pk.y - pi.y)
}

function onSegment(pi, pj, pk) {
  return (
    Math.min(pi.x, pj.x) <= pk.x && pk.x <= Math.max(pi.x, pj.x) &&
    Math.min(pi.y, pj.y) <= pk.y && pk.y <= Math.max(pi.y, pj.y)
  )
}

/**
 * Detects self-intersection in a polygon.
 * Checks every pair of non-adjacent edges.
 *
 * @param {Array<{x: number, y: number}>} points
 * @returns {boolean}
 */
export function hasSelfIntersection(points) {
  const n = points.length
  for (let i = 0; i < n; i++) {
    for (let j = i + 2; j < n; j++) {
      // Skip adjacent edges and the closing edge pair
      if (i === 0 && j === n - 1) continue

      if (segmentsIntersect(points[i], points[(i + 1) % n], points[j], points[(j + 1) % n])) {
        return true
      }
    }
  }
  return false
}

/**
 * Converts canvas pixel coordinates to real-world feet given a pixels-per-foot scale.
 *
 * @param {{x: number, y: number}} point
 * @param {number} scale - pixels per foot
 * @returns {{x: number, y: number}}
 */
export function pixelsToFeet(point, scale) {
  return { x: point.x / scale, y: point.y / scale }
}

/**
 * Converts real-world feet to canvas pixel coordinates.
 *
 * @param {{x: number, y: number}} point
 * @param {number} scale - pixels per foot
 * @returns {{x: number, y: number}}
 */
export function feetToPixels(point, scale) {
  return { x: point.x * scale, y: point.y * scale }
}

/**
 * Returns the bounding box of a set of polygon points.
 *
 * @param {Array<{x: number, y: number}>} points
 * @returns {{ minX: number, minY: number, maxX: number, maxY: number, width: number, height: number }}
 */
export function computeBoundingBox(points) {
  const xs = points.map((p) => p.x)
  const ys = points.map((p) => p.y)
  const minX = Math.min(...xs)
  const minY = Math.min(...ys)
  const maxX = Math.max(...xs)
  const maxY = Math.max(...ys)
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY }
}

/**
 * Computes the distance between two points {x, y}.
 * 
 * @param {{x: number, y: number}} p1
 * @param {{x: number, y: number}} p2
 * @returns {number}
 */
export function distance(p1, p2) {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
}
