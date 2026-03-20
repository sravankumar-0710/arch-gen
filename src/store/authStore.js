// filepath: src/store/authStore.js
// Purpose: Global auth state — current user, JWT token, login/logout actions.

import { create } from 'zustand'
import { login as loginApi, register as registerApi, getMe } from '../services/authService.js'

const TOKEN_KEY = 'auth_token'

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem(TOKEN_KEY) || null,
  isAuthenticated: !!localStorage.getItem(TOKEN_KEY),
  isLoading: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null })
    try {
      const data = await loginApi(credentials)
      const accessToken = data.data.token.access_token
      localStorage.setItem(TOKEN_KEY, accessToken)
      set({
        user: data.data.user,
        token: accessToken,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (err) {
      set({ error: err.message, isLoading: false })
      throw err
    }
  },

  register: async (credentials) => {
    set({ isLoading: true, error: null })
    try {
      const data = await registerApi(credentials)
      const accessToken = data.data.token.access_token
      localStorage.setItem(TOKEN_KEY, accessToken)
      set({
        user: data.data.user,
        token: accessToken,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (err) {
      set({ error: err.message, isLoading: false })
      throw err
    }
  },

  loadUser: async () => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return
    set({ isLoading: true })
    try {
      const data = await getMe()
      set({ user: data.data, isAuthenticated: true, isLoading: false })
    } catch {
      localStorage.removeItem(TOKEN_KEY)
      set({ user: null, token: null, isAuthenticated: false, isLoading: false })
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    set({ user: null, token: null, isAuthenticated: false, error: null })
  },

  clearError: () => set({ error: null }),

  reset: () => {
    localStorage.removeItem(TOKEN_KEY)
    set({ user: null, token: null, isAuthenticated: false, isLoading: false, error: null })
  },
}))

export default useAuthStore
