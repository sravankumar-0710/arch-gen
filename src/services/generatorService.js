// filepath: src/services/generatorService.js
// Purpose: API calls for layout generation — sends polygon + requirements, receives layout options.

import api from './api.js'

export async function generateLayout(payload) {
  try {
    const response = await api.post('/generate', payload)
    return response.data
  } catch (error) {
    const detail = error.response?.data?.detail
    const message = error.response?.data?.message

    // Pydantic 422 errors return detail as an array of field-level errors
    const readable = Array.isArray(detail)
      ? detail.map((d) => `${d.loc?.slice(-1)[0]}: ${d.msg}`).join(', ')
      : (detail || message || error.message)

    throw new Error(`Layout generation failed: ${readable}`)
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