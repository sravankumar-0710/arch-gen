// filepath: src/store/projectStore.js
// Purpose: Global state for the current project and project list on the dashboard.

import { create } from 'zustand'
import {
  createProject,
  listProjects,
  getProject,
  updateProject,
  deleteProject,
} from '../services/projectService.js'

const useProjectStore = create((set, get) => ({
  // List of project summaries for the dashboard
  projects: [],
  // The currently open project object
  currentProject: null,
  isLoading: false,
  isSaving: false,
  error: null,
  // Last save timestamp for the "Saved / Saving..." indicator
  lastSavedAt: null,

  fetchProjects: async () => {
    set({ isLoading: true, error: null })
    try {
      const data = await listProjects()
      set({ projects: data.data, isLoading: false })
    } catch (err) {
      set({ error: err.message, isLoading: false })
    }
  },

  openProject: async (projectId) => {
    set({ isLoading: true, error: null })
    try {
      const data = await getProject(projectId)
      set({ currentProject: data.data, isLoading: false })
    } catch (err) {
      set({ error: err.message, isLoading: false })
    }
  },

  createNewProject: async (name) => {
    set({ isLoading: true, error: null })
    try {
      const data = await createProject({ name })
      set((state) => ({
        projects: [data.data, ...state.projects],
        currentProject: data.data,
        isLoading: false,
      }))
      return data.data
    } catch (err) {
      set({ error: err.message, isLoading: false })
      throw err
    }
  },

  saveCurrentProject: async (projectData) => {
    const { currentProject } = get()
    if (!currentProject) return
    set({ isSaving: true })
    try {
      const data = await updateProject(currentProject.id, projectData)
      set({ currentProject: data.data, isSaving: false, lastSavedAt: new Date() })
    } catch (err) {
      set({ error: err.message, isSaving: false })
    }
  },

  removeProject: async (projectId) => {
    try {
      await deleteProject(projectId)
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== projectId),
      }))
    } catch (err) {
      set({ error: err.message })
    }
  },

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      projects: [],
      currentProject: null,
      isLoading: false,
      isSaving: false,
      error: null,
      lastSavedAt: null,
    }),
}))

export default useProjectStore
