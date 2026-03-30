// filepath: src/utils/validators.js
// Purpose: Input validation helpers for forms — returns error strings or null.

export function validateEmail(email) {
  if (!email || !email.trim()) return 'Email is required.'
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return 'Please enter a valid email address.'
  return null
}

export function validatePassword(password) {
  if (!password) return 'Password is required.'
  if (password.length < 8) return 'Password must be at least 8 characters.'
  return null
}

export function validateName(name) {
  if (!name || !name.trim()) return 'Name is required.'
  if (name.trim().length < 2) return 'Name must be at least 2 characters.'
  return null
}

export function validateProjectName(name) {
  if (!name || !name.trim()) return 'Project name is required.'
  if (name.trim().length > 100) return 'Project name must be 100 characters or fewer.'
  return null
}

export function validateDimension(value, label) {
  const num = parseFloat(value)
  if (isNaN(num) || num <= 0) return `${label} must be a positive number.`
  if (num > 10000) return `${label} seems unrealistically large. Please check the value.`
  return null
}

// ---------------------------------------------------------------------------
// Phase 4 — Requirements validation
// ---------------------------------------------------------------------------

// Minimum room area estimates used to roughly check if rooms can fit in the plot.
// India NBC 2016, Part 3, Section 4 — minimum habitable area guidance
const MIN_ROOM_AREA_SQFT = {
  bedroom:       100,  // 10ft × 10ft
  masterBedroom: 130,  // 11ft × 12ft approx
  kitchen:        50,  // 7ft × 7ft approx
  living:         90,  // 9ft × 10ft
  dining:         70,  // 8ft × 9ft
  bathroom:       30,  // 5ft × 6ft
  balcony:        20,
  staircase:      25,
  pooja:          20,
  other:          60,
}

// Pixels-to-sqft conversion factor used in LandCanvas (1 grid square = 10ft × 10ft at default scale)
// ASSUMPTION: canvas is drawn at 10ft per grid unit, and polygon points are in canvas pixel coords
// where 1 pixel = 1ft at default scale. Revisit if LandCanvas uses a different scale.
const CANVAS_PX_TO_SQFT = 1

/**
 * Estimates total plot area from polygon points using the Shoelace formula.
 * Returns area in square feet based on canvas coordinate scale.
 * Returns null if fewer than 3 points are provided.
 */
function estimatePlotAreaSqft(polygonPoints, unit) {
  if (!polygonPoints || polygonPoints.length < 3) return null

  // Shoelace formula
  let area = 0
  const n = polygonPoints.length
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    area += polygonPoints[i].x * polygonPoints[j].y
    area -= polygonPoints[j].x * polygonPoints[i].y
  }
  area = Math.abs(area) / 2

  // Convert based on unit: if unit is 'm', convert sqm → sqft
  const sqft = unit === 'm' ? area * 10.7639 : area * CANVAS_PX_TO_SQFT
  return sqft
}

/**
 * Estimates total required room area from basic mode inputs.
 * Returns total in square feet.
 */
function estimateRequiredAreaBasic({ bedroomCount, hasKitchen, hasLivingRoom, hasDiningRoom, hasStaircase, hasBalcony }) {
  let total = bedroomCount * MIN_ROOM_AREA_SQFT.bedroom
  if (hasKitchen)    total += MIN_ROOM_AREA_SQFT.kitchen
  if (hasLivingRoom) total += MIN_ROOM_AREA_SQFT.living
  if (hasDiningRoom) total += MIN_ROOM_AREA_SQFT.dining
  // Add staircase area if multi-floor or explicitly requested
  if (hasStaircase)  total += MIN_ROOM_AREA_SQFT.staircase
  // Add a default balcony area
  if (hasBalcony)    total += MIN_ROOM_AREA_SQFT.balcony
  // Add estimated bathroom area (1 per bedroom + 1 shared)
  total += (bedroomCount + 1) * MIN_ROOM_AREA_SQFT.bathroom
  return total
}

/**
 * Estimates total required room area from advanced mode room list.
 */
function estimateRequiredAreaAdvanced(rooms) {
  return rooms.reduce((sum, room) => {
    const override = room.minAreaSqft
    const defaultArea = MIN_ROOM_AREA_SQFT[room.type] ?? MIN_ROOM_AREA_SQFT.other
    return sum + (override ?? defaultArea)
  }, 0)
}

/**
 * Validates whether the configured rooms can reasonably fit in the plot area.
 * Returns a warning string if rooms likely won't fit, or null if OK.
 *
 * @param {object} params - Combined land + requirements state fields
 * @returns {string|null}
 */
export function validateRoomFit({
  mode,
  bedroomCount,
  hasKitchen,
  hasLivingRoom,
  hasDiningRoom,
  hasStaircase,
  hasBalcony,
  floors,
  rooms,
  polygonPoints,
  dimensions,
  unit,
}) {
  // Derive plot area — prefer polygon points; fall back to dimensions
  let plotAreaSqft = estimatePlotAreaSqft(polygonPoints, unit)

  if (!plotAreaSqft && dimensions?.width && dimensions?.height) {
    const w = parseFloat(dimensions.width)
    const h = parseFloat(dimensions.height)
    if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) {
      const raw = w * h
      plotAreaSqft = unit === 'm' ? raw * 10.7639 : raw
    }
  }

  if (!plotAreaSqft) return null // Can't validate without plot data — skip

  const requiredArea =
    mode === 'basic'
      ? estimateRequiredAreaBasic({ bedroomCount, hasKitchen, hasLivingRoom, hasDiningRoom, hasStaircase: floors > 1 || hasStaircase, hasBalcony })
      : estimateRequiredAreaAdvanced(rooms)

  // Total buildable area = plot area × floors, applying a 70% coverage factor
  // (30% reserved for walls, circulation, setbacks)
  const buildableArea = plotAreaSqft * floors * 0.7

  if (requiredArea > buildableArea) {
    const shortage = Math.round(requiredArea - buildableArea)
    return `Estimated room requirements (~${Math.round(requiredArea)} sq ft) may exceed the buildable area (~${Math.round(buildableArea)} sq ft). Consider reducing rooms or adding a floor.`
  }

  // Soft warning: rooms take up more than 90% of buildable area
  if (requiredArea > buildableArea * 0.9) {
    return `Room requirements are close to the plot limit. The layout may be tight — consider a slightly larger plot or fewer rooms.`
  }

  return null
}

/**
 * Checks for conflicting direction constraints in the advanced room list.
 * Two rooms requesting the same direction is usually fine; same type + same direction is flagged.
 * Returns array of warning strings (empty if no conflicts).
 *
 * @param {Array} rooms - Array of room objects from requirementsStore
 * @returns {string[]}
 */
export function validateDirectionConflicts(rooms) {
  const warnings = []

  // Check: same room type appears multiple times with conflicting preferred directions
  const byType = {}
  for (const room of rooms) {
    if (room.preferredDirection === 'any') continue
    if (!byType[room.type]) {
      byType[room.type] = []
    }
    byType[room.type].push(room.preferredDirection)
  }

  for (const [type, directions] of Object.entries(byType)) {
    const unique = [...new Set(directions)]
    if (unique.length > 1) {
      warnings.push(
        `Multiple ${type} rooms have conflicting direction preferences (${unique.join(', ')}). Only one placement can be satisfied.`
      )
    }
  }

  // Check: more than one room requesting the same specific direction
  const directionCounts = {}
  for (const room of rooms) {
    if (room.preferredDirection === 'any') continue
    directionCounts[room.preferredDirection] = (directionCounts[room.preferredDirection] || 0) + 1
  }

  for (const [dir, count] of Object.entries(directionCounts)) {
    if (count > 1) {
      warnings.push(
        `${count} rooms are all requesting the ${dir} direction. The engine will place the highest-priority room there and approximate for the rest.`
      )
    }
  }

  return warnings
}