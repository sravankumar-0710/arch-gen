// filepath: src/utils/vastuRules.js
// Purpose: Vastu Shastra direction mappings and preferred room placement rules.
// Used by the requirements form to display defaults and validate user choices.

// Preferred directions per room type per Vastu Shastra (traditional Indian guidelines)
// ASSUMPTION: Direction is relative to North being "up" on the plot
export const VASTU_PREFERRED_DIRECTIONS = {
  kitchen: ['SE', 'NW'],         // Fire (Agni) corner = South-East; NW as secondary
  masterBedroom: ['SW'],          // Earth (Prithvi) corner = South-West for main bedroom
  bedroom: ['S', 'SW', 'W'],     // Secondary bedrooms south or west
  bathroom: ['NW', 'W', 'S'],    // Away from kitchen and prayer room
  toilet: ['NW', 'W'],
  livingRoom: ['N', 'NE', 'E'],  // Open, light-facing directions
  diningRoom: ['W', 'E'],
  pooja: ['NE'],                  // Eshanya corner = North-East for prayer room
  staircase: ['S', 'SW', 'W'],   // Heavy mass to south or west
  entrance: ['N', 'NE', 'E'],    // Main door facing North, North-East, or East
  balcony: ['N', 'NE', 'E'],
}

// Vastu rule descriptions shown to the user in the requirements panel
export const VASTU_RULE_DESCRIPTIONS = [
  { room: 'Kitchen', direction: 'South-East', reason: 'Fire element (Agni) is strongest in the SE corner.' },
  { room: 'Master Bedroom', direction: 'South-West', reason: 'Earth element provides stability for the head of the family.' },
  { room: 'Entrance', direction: 'North / North-East / East', reason: 'Positive energy flows from these directions.' },
  { room: 'Prayer Room', direction: 'North-East', reason: 'Eshanya corner is considered most auspicious.' },
  { room: 'Staircase', direction: 'South / South-West', reason: 'Heavy mass should be in the south or west.' },
]

// Human-readable labels for direction codes
export const DIRECTION_LABELS = {
  N: 'North',
  NE: 'North-East',
  E: 'East',
  SE: 'South-East',
  S: 'South',
  SW: 'South-West',
  W: 'West',
  NW: 'North-West',
  any: 'Any Direction',
}

// All valid direction options for UI dropdowns
export const DIRECTION_OPTIONS = [
  { value: 'any', label: 'Any Direction' },
  { value: 'N', label: 'North' },
  { value: 'NE', label: 'North-East' },
  { value: 'E', label: 'East' },
  { value: 'SE', label: 'South-East' },
  { value: 'S', label: 'South' },
  { value: 'SW', label: 'South-West' },
  { value: 'W', label: 'West' },
  { value: 'NW', label: 'North-West' },
]
