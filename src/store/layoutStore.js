// filepath: src/store/layoutStore.js
// Purpose: Global state for generated layout options and the currently selected layout.

import { create } from 'zustand'

const useLayoutStore = create((set) => ({
  // Array of layout option objects returned by the generation API
  layoutOptions: [],
  // Index of the currently selected layout option
  selectedIndex: null,
  // The active layout being edited (deep copy of selected option)
  activeLayout: null,
  // Generation state
  isGenerating: false,
  generationError: null,

  setLayoutOptions: (options) =>
    set({ layoutOptions: options, selectedIndex: null, activeLayout: null }),

  selectLayout: (index) =>
    set((state) => ({
      selectedIndex: index,
      // Deep copy so edits don't mutate the option list
      activeLayout: JSON.parse(JSON.stringify(state.layoutOptions[index])),
    })),

  updateActiveLayout: (layout) => set({ activeLayout: layout }),

  setIsGenerating: (val) => set({ isGenerating: val }),
  setGenerationError: (err) => set({ generationError: err }),

  reset: () =>
    set({
      layoutOptions: [],
      selectedIndex: null,
      activeLayout: null,
      isGenerating: false,
      generationError: null,
    }),
}))

export default useLayoutStore
