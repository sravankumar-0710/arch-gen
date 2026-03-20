// filepath: src/services/generatorService.js
// Purpose: API calls for layout generation — sends polygon + requirements, receives layout options.

import api from './api.js'

export async function generateLayout(land_data, requirements) {
  try {
    const response = await api.post('/generate', {
      land_data,
      requirements
    })
    return response.data
  } catch (error) {
    throw new Error(`Layout generation failed: ${error.response?.data?.detail || error.message}`)
  }
}

export async function validateLayout(layoutData) {
  try {
    const response = await api.post('/generate/validate', layoutData)
    return response.data
  } catch (error) {
    throw new Error(`Layout validation failed: ${error.response?.data?.message || error.message}`)
  }
}

export async function exportFloorPlan(layoutId, format = 'png') {
  try {
    const response = await api.get(`/generate/export/${layoutId}`, {
      params: { format },
      responseType: 'blob',
    })
    return response.data
  } catch (error) {
    throw new Error(`Export failed: ${error.response?.data?.message || error.message}`)
  }
}

