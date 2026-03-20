// filepath: src/store/editorStore.js
// Purpose: Global state for the 2D editor — active tool, undo/redo history, selection.

import { create } from 'zustand'

// ASSUMPTION: activeTool is one of: 'select' | 'move' | 'resize' | 'add-room' | 'delete'
const INITIAL_STATE = {
  activeTool: 'select',
  selectedRoomId: null,
  // Undo/redo stacks hold serialized layout snapshots
  undoStack: [],
  redoStack: [],
  // Version history: named snapshots the user has manually saved
  versionHistory: [],
  // Whether the 3D viewer is visible alongside the 2D plan
  show3DViewer: false,
  // Validation warnings from the last constraint check
  validationWarnings: [],
}

const useEditorStore = create((set, get) => ({
  ...INITIAL_STATE,

  setActiveTool: (tool) => set({ activeTool: tool }),
  setSelectedRoomId: (id) => set({ selectedRoomId: id }),
  setShow3DViewer: (val) => set({ show3DViewer: val }),
  setValidationWarnings: (warnings) => set({ validationWarnings: warnings }),

  // Push current layout snapshot onto undo stack before a change
  pushUndo: (snapshot) =>
    set((state) => ({
      undoStack: [...state.undoStack, snapshot],
      // Clear redo stack on new action
      redoStack: [],
    })),

  undo: () => {
    const { undoStack, redoStack } = get()
    if (undoStack.length === 0) return null
    const prev = undoStack[undoStack.length - 1]
    set({
      undoStack: undoStack.slice(0, -1),
      redoStack: [...redoStack, prev],
    })
    return prev
  },

  redo: () => {
    const { undoStack, redoStack } = get()
    if (redoStack.length === 0) return null
    const next = redoStack[redoStack.length - 1]
    set({
      undoStack: [...undoStack, next],
      redoStack: redoStack.slice(0, -1),
    })
    return next
  },

  saveVersion: (name, snapshot) =>
    set((state) => ({
      versionHistory: [
        ...state.versionHistory,
        { name, snapshot, savedAt: new Date().toISOString() },
      ],
    })),

  reset: () => set(INITIAL_STATE),
}))

export default useEditorStore
