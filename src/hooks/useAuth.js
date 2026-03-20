// filepath: src/hooks/useAuth.js
// Purpose: Custom hook providing auth state and actions to components.
// Owns all async auth logic — components never call authService directly.

import useAuthStore from '../store/authStore.js'
import { login as loginApi, register as registerApi, getMe } from '../services/authService.js'

export default function useAuth() {
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isLoading = useAuthStore((state) => state.isLoading)
  const error = useAuthStore((state) => state.error)
  const setUser = useAuthStore((state) => state.setUser)
  const setToken = useAuthStore((state) => state.setToken)
  const setLoading = useAuthStore((state) => state.setLoading)
  const setError = useAuthStore((state) => state.setError)
  const clearError = useAuthStore((state) => state.clearError)
  const reset = useAuthStore((state) => state.reset)

  const login = async (credentials) => {
    setLoading(true)
    setError(null)
    try {
      const data = await loginApi(credentials)
      setToken(data.data.token.access_token)
      setUser(data.data.user)
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const register = async (credentials) => {
    setLoading(true)
    setError(null)
    try {
      const data = await registerApi(credentials)
      setToken(data.data.token.access_token)
      setUser(data.data.user)
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const loadUser = async () => {
    if (!token) return
    setLoading(true)
    try {
      const data = await getMe()
      setUser(data.data)
    } catch {
      // Token is invalid or expired — clear everything
      reset()
    } finally {
      setLoading(false)
    }
  }

  const logout = () => reset()

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    loadUser,
    clearError,
  }
}