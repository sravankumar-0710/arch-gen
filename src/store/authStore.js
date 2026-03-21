// filepath: src/store/authStore.js
// Purpose: Global auth state — user, token, loading, and error states with all actions.

import { create } from 'zustand'

const INITIAL_STATE = {
  user: null,
  token: localStorage.getItem('auth_token') || null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
}

const useAuthStore = create((set) => ({
  ...INITIAL_STATE,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setToken: (token) => {
    // Persist token to localStorage so it survives page refresh
    if (token) {
      localStorage.setItem('auth_token', token)
    } else {
      localStorage.removeItem('auth_token')
    }
    set({ token })
  },

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),

  reset: () => {
    localStorage.removeItem('auth_token')
    set({ ...INITIAL_STATE, token: null })
  },
}))

export default useAuthStore