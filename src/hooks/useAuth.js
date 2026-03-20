// filepath: src/hooks/useAuth.js
// Purpose: Custom hook providing auth state and actions to components.
// Wraps useAuthStore so components don't import the store directly.

import useAuthStore from '../store/authStore.js'

export default function useAuth() {
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isLoading = useAuthStore((state) => state.isLoading)
  const error = useAuthStore((state) => state.error)
  const login = useAuthStore((state) => state.login)
  const register = useAuthStore((state) => state.register)
  const logout = useAuthStore((state) => state.logout)
  const loadUser = useAuthStore((state) => state.loadUser)
  const clearError = useAuthStore((state) => state.clearError)

  return { user, token, isAuthenticated, isLoading, error, login, register, logout, loadUser, clearError }
}
