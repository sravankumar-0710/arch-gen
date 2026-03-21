// filepath: src/services/generatorService.js
// Purpose: API calls for layout generation — sends polygon + requirements, receives layout options.

import api from './api.js'

// FIXED: accepts a single payload object { land_data, requirements }
// to match how useLayoutGenerator.js calls it: generateLayout(payload)
export async function generateLayout(payload) {
  try {
    const response = await api.post('/generate', payload)
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