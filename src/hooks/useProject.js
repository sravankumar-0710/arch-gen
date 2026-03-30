// filepath: src/hooks/useProject.js
// Purpose: Custom hook for project CRUD actions and state access.

import React, { useEffect } from 'react'
import useProjectStore from '../store/projectStore.js'

export default function useProject() {
  const projects = useProjectStore((state) => state.projects)
  const currentProject = useProjectStore((state) => state.currentProject)
  const isLoading = useProjectStore((state) => state.isLoading)
  const isSaving = useProjectStore((state) => state.isSaving)
  const error = useProjectStore((state) => state.error)
  const lastSavedAt = useProjectStore((state) => state.lastSavedAt)
  const fetchProjects = useProjectStore((state) => state.fetchProjects)
  const openProject = useProjectStore((state) => state.openProject)
  const createNewProject = useProjectStore((state) => state.createNewProject)
  const saveCurrentProject = useProjectStore((state) => state.saveCurrentProject)
  const removeProject = useProjectStore((state) => state.removeProject)

  return {
    projects,
    currentProject,
    isLoading,
    isSaving,
    error,
    lastSavedAt,
    fetchProjects,
    openProject,
    createNewProject,
    saveCurrentProject,
    removeProject,
  }
}
