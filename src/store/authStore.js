// filepath: src/store/authStore.js
// Purpose: Global auth state — current user, JWT token, and simple state setters.
// Async orchestration (calling authService) lives in useAuth.js, not here.

import { create } from 'zustand'

const TOKEN_KEY = 'auth_token'

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem(TOKEN_KEY) || null,
  isAuthenticated: !!localStorage.getItem(TOKEN_KEY),
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),
  setToken: (token) => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }
    set({ token, isAuthenticated: !!token })
  },
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  reset: () => {
    localStorage.removeItem(TOKEN_KEY)
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    })
  },
}))

export default useAuthStore