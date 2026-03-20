// filepath: src/services/authService.js
// Purpose: API calls for authentication — register, login, and fetching the current user.

import api from './api.js'

export async function register({ email, password }) {
  try {
    const response = await api.post('/auth/register', { email, password })
    return response.data
  } catch (error) {
    throw new Error(`Registration failed: ${error.response?.data?.message || error.message}`)
  }
}

export async function login({ email, password }) {
  try {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  } catch (error) {
    throw new Error(`Login failed: ${error.response?.data?.message || error.message}`)
  }
}

export async function getMe() {
  try {
    const response = await api.get('/auth/me')
    return response.data
  } catch (error) {
    throw new Error(`Failed to fetch user: ${error.response?.data?.message || error.message}`)
  }
}
