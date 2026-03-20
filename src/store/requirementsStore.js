// filepath: src/store/requirementsStore.js
// Purpose: Global state for room and design requirements — mode, rooms, Vastu, floors.

import { create } from 'zustand'

// Default room shape — all fields required, use null for unset constraints
const DEFAULT_ROOM = {
  id: null,
  type: 'bedroom',          // 'bedroom' | 'kitchen' | 'bathroom' | 'living' | 'dining' | 'balcony' | 'staircase' | 'other'
  preferredDirection: 'any', // 'N' | 'S' | 'E' | 'W' | 'NE' | 'NW' | 'SE' | 'SW' | 'any'
  minAreaSqft: null,        // Override minimum area; null = use rule defaults
  attachedBathroom: false,
  hasBalcony: false,
  balconyExtraFt: 0,
}

const useRequirementsStore = create((set) => ({
  // 'basic' | 'advanced'
  mode: 'basic',
  floors: 1,
  vastuEnabled: true,

  // Basic mode shorthand
  bedroomCount: 2,
  hasLivingRoom: true,
  hasDiningRoom: true,
  hasKitchen: true,

  // Advanced mode room list
  rooms: [],

  setMode: (mode) => set({ mode }),
  setFloors: (floors) => set({ floors }),
  setVastuEnabled: (enabled) => set({ vastuEnabled: enabled }),
  setBedroomCount: (count) => set({ bedroomCount: count }),
  setHasLivingRoom: (val) => set({ hasLivingRoom: val }),
  setHasDiningRoom: (val) => set({ hasDiningRoom: val }),
  setHasKitchen: (val) => set({ hasKitchen: val }),

  addRoom: (room) =>
    set((state) => ({
      rooms: [...state.rooms, { ...DEFAULT_ROOM, ...room, id: crypto.randomUUID() }],
    })),

  updateRoom: (id, updates) =>
    set((state) => ({
      rooms: state.rooms.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    })),

  removeRoom: (id) =>
    set((state) => ({ rooms: state.rooms.filter((r) => r.id !== id) })),

  reset: () =>
    set({
      mode: 'basic',
      floors: 1,
      vastuEnabled: true,
      bedroomCount: 2,
      hasLivingRoom: true,
      hasDiningRoom: true,
      hasKitchen: true,
      rooms: [],
    }),
}))

export default useRequirementsStore
