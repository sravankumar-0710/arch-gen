// filepath: src/services/projectService.js
// Purpose: API calls for project management (CRUD)

import api from './api.js'

/**
 * List all projects for current user
 */
export async function listProjects() {
  try {
    const response = await api.get('/projects')
    return response.data
  } catch (error) {
    throw new Error(`Failed to list projects: ${error.response?.data?.message || error.message}`)
  }
}

/**
 * Get single project by ID
 */
export async function getProject(projectId) {
  try {
    const response = await api.get(`/projects/${projectId}`)
    return response.data
  } catch (error) {
    throw new Error(`Failed to fetch project: ${error.response?.data?.message || error.message}`)
  }
}

/**
 * Create a new project
 */
export async function createProject(projectData) {
  try {
    const response = await api.post('/projects', projectData)
    return response.data
  } catch (error) {
    throw new Error(`Failed to create project: ${error.response?.data?.message || error.message}`)
  }
}

/**
 * Update an existing project
 */
export async function updateProject(projectId, projectData) {
  try {
    const response = await api.put(`/projects/${projectId}`, projectData)
    return response.data
  } catch (error) {
    throw new Error(`Failed to update project: ${error.response?.data?.message || error.message}`)
  }
}

/**
 * Delete a project
 */
export async function deleteProject(projectId) {
  try {
    const response = await api.delete(`/projects/${projectId}`)
    return response.data
  } catch (error) {
    throw new Error(`Failed to delete project: ${error.response?.data?.message || error.message}`)
  }
}
