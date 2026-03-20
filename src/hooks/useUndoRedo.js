// filepath: src/hooks/useUndoRedo.js
// Purpose: Custom hook for undo/redo operations — connects keyboard shortcuts to editorStore.

import { useEffect } from 'react'
import useEditorStore from '../store/editorStore.js'
import useLayoutStore from '../store/layoutStore.js'

export default function useUndoRedo() {
  const pushUndo = useEditorStore((state) => state.pushUndo)
  const undo = useEditorStore((state) => state.undo)
  const redo = useEditorStore((state) => state.redo)
  const undoStack = useEditorStore((state) => state.undoStack)
  const redoStack = useEditorStore((state) => state.redoStack)
  const updateActiveLayout = useLayoutStore((state) => state.updateActiveLayout)
  const activeLayout = useLayoutStore((state) => state.activeLayout)

  // Snapshot the current layout before making a change
  const recordSnapshot = () => {
    if (activeLayout) {
      pushUndo(JSON.parse(JSON.stringify(activeLayout)))
    }
  }

  const handleUndo = () => {
    const snapshot = undo()
    if (snapshot) updateActiveLayout(snapshot)
  }

  const handleRedo = () => {
    const snapshot = redo()
    if (snapshot) updateActiveLayout(snapshot)
  }

  // Register Ctrl+Z / Ctrl+Y keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault()
          handleUndo()
        }
        if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault()
          handleRedo()
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeLayout, undoStack, redoStack])

  return {
    recordSnapshot,
    handleUndo,
    handleRedo,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
  }
}
