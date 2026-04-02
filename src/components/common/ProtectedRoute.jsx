// filepath: src/components/common/ProtectedRoute.jsx
// Purpose: Redirects unauthenticated users to /login. Shows loader while auth state is resolving.

import React from 'react'
import { Navigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth.js'
import Loader from './Loader.jsx'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()

  // Wait for loadUser() to finish before deciding — prevents redirect on valid token refresh
  if (isLoading) return <Loader />

  return isAuthenticated ? children : <Navigate to="/login" replace />
}