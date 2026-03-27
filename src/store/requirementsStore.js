// filepath: src/store/requirementsStore.js
// Purpose: Global state for room and design requirements — mode, rooms, Vastu, floors, custom AI prompt.

import { create } from 'zustand'

// Default room shape — all fields required, use null for unset constraints
const DEFAULT_ROOM = {
  id: null,
  type: 'bedroom',
  preferredDirection: 'any',
  minAreaSqft: null,
  attachedBathroom: false,
  hasBalcony: false,
  balconyExtraFt: 0,
}

const useRequirementsStore = create((set) => ({
  // 'basic' | 'advanced' | 'prompt'
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

  // AI Prompt mode — free-text description sent to Gemini alongside form data
  customPrompt: '',

  setMode: (mode) => set({ mode }),
  setFloors: (floors) => set({ floors }),
  setVastuEnabled: (enabled) => set({ vastuEnabled: enabled }),
  setBedroomCount: (count) => set({ bedroomCount: count }),
  setHasLivingRoom: (val) => set({ hasLivingRoom: val }),
  setHasDiningRoom: (val) => set({ hasDiningRoom: val }),
  setHasKitchen: (val) => set({ hasKitchen: val }),
  setCustomPrompt: (prompt) => set({ customPrompt: prompt }),

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
      customPrompt: '',
    }),
}))

export default useRequirementsStore