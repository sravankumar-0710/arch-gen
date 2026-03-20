// filepath: src/services/projectService.js
// Purpose: API calls for project CRUD — create, list, load, update, delete.

import api from './api.js'

export async function createProject({ name }) {
  try {
    const response = await api.post('/projects', { name })
    return response.data
  } catch (error) {
    throw new Error(`Failed to create project: ${error.response?.data?.message || error.message}`)
  }
}

export async function listProjects() {
  try {
    const response = await api.get('/projects')
    return response.data
  } catch (error) {
    throw new Error(`Failed to load projects: ${error.response?.data?.message || error.message}`)
  }
}

export async function getProject(projectId) {
  try {
    const response = await api.get(`/projects/${projectId}`)
    return response.data
  } catch (error) {
    throw new Error(`Failed to load project: ${error.response?.data?.message || error.message}`)
  }
}

export async function updateProject(projectId, data) {
  try {
    const response = await api.put(`/projects/${projectId}`, data)
    return response.data
  } catch (error) {
    throw new Error(`Failed to save project: ${error.response?.data?.message || error.message}`)
  }
}

export async function deleteProject(projectId) {
  try {
    const response = await api.delete(`/projects/${projectId}`)
    return response.data
  } catch (error) {
    throw new Error(`Failed to delete project: ${error.response?.data?.message || error.message}`)
  }
}

export async function saveProject(projectId, data) {
  // Alias for updateProject with clearer naming
  return updateProject(projectId, data)
}
