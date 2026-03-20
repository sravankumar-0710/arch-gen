// filepath: src/pages/LoginPage.jsx
// Purpose: User login page — architectural dark theme

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import useAuth from '../hooks/useAuth.js'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoading, error } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      await login({ email, password })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      // Error is already set in store
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0c',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      position: 'relative',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Background grid */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.05,
        backgroundImage: 'linear-gradient(rgba(212,168,50,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(212,168,50,0.2) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
        pointerEvents: 'none'
      }} />

      {/* Content */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '420px',
        zIndex: 1
      }}>
        {/* Logo & Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '48px',
          animation: 'fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both'
        }}>
          {/* Logo */}
          <div style={{
            width: '48px',
            height: '48px',
            margin: '0 auto 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg viewBox="0 0 36 36" fill="none" style={{ width: '100%', height: '100%' }}>
              <rect x="4" y="4" width="28" height="28" stroke="#d4a832" strokeWidth="1.5" fill="none"/>
              <rect x="4" y="4" width="14" height="14" stroke="#d4a832" strokeWidth="1" fill="rgba(212,168,50,0.06)"/>
              <rect x="18" y="4" width="14" height="28" stroke="#d4a832" strokeWidth="1" fill="rgba(212,168,50,0.04)"/>
              <rect x="4" y="18" width="14" height="14" stroke="#d4a832" strokeWidth="1" fill="rgba(212,168,50,0.04)"/>
            </svg>
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: '32px',
            fontWeight: '400',
            color: '#f0ede8',
            margin: '0 0 8px 0',
            letterSpacing: '0'
          }}>
            ArchGen<span style={{ color: '#d4a832', fontStyle: 'italic' }}> AI</span>
          </h1>

          {/* Subtitle */}
          <p style={{
            color: '#5a5855',
            fontSize: '14px',
            margin: '0',
            fontWeight: '400'
          }}>Generate architectural floor plans with AI</p>
        </div>

        {/* Form Card */}
        <div style={{
          backgroundColor: '#141418',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.06)',
          overflow: 'hidden',
          animation: 'fadeUp 0.6s 0.1s cubic-bezier(0.16,1,0.3,1) both',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 25px 50px rgba(0,0,0,0.5)'
        }}>
          {/* Gradient line */}
          <div style={{
            height: '1px',
            backgroundImage: 'linear-gradient(to right, transparent, #d4a832, transparent)',
            opacity: 0.4
          }} />

          {/* Form content */}
          <form onSubmit={handleSubmit} style={{ padding: '32px' }}>
            {/* Error Message */}
            {error && (
              <div style={{
                marginBottom: '24px',
                padding: '16px',
                borderRadius: '12px',
                backgroundColor: 'rgba(224,82,82,0.08)',
                border: '1px solid rgba(224,82,82,0.2)',
                fontSize: '14px',
                color: '#e05252',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: '2px' }}>
                  <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M7 4v3.5M7 9.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="email" style={{
                display: 'block',
                fontSize: '10px',
                fontWeight: '500',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: '#5a5855',
                marginBottom: '8px'
              }}>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={isLoading}
                style={{
                  width: '100%',
                  backgroundColor: '#0f0f12',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontSize: '14px',
                  color: '#f0ede8',
                  boxSizing: 'border-box',
                  outline: 'none',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s ease',
                  opacity: isLoading ? 0.5 : 1,
                  cursor: isLoading ? 'not-allowed' : 'text'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#d4a832'
                  e.target.style.boxShadow = '0 0 0 3px rgba(212,168,50,0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.07)'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: '24px' }}>
              <label htmlFor="password" style={{
                display: 'block',
                fontSize: '10px',
                fontWeight: '500',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: '#5a5855',
                marginBottom: '8px'
              }}>
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                style={{
                  width: '100%',
                  backgroundColor: '#0f0f12',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontSize: '14px',
                  color: '#f0ede8',
                  boxSizing: 'border-box',
                  outline: 'none',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s ease',
                  opacity: isLoading ? 0.5 : 1,
                  cursor: isLoading ? 'not-allowed' : 'text'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#d4a832'
                  e.target.style.boxShadow = '0 0 0 3px rgba(212,168,50,0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.07)'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 24px',
                backgroundColor: isLoading ? '#8a6a1a' : '#d4a832',
                color: isLoading ? '#5a4a15' : '#0a0a0c',
                fontSize: '14px',
                fontWeight: '600',
                border: 'none',
                borderRadius: '12px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.target.style.backgroundColor = '#f0c84a'
                  e.target.style.boxShadow = '0 0 24px rgba(212,168,50,0.35)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.target.style.backgroundColor = '#d4a832'
                  e.target.style.boxShadow = 'none'
                }
              }}
              onMouseDown={(e) => {
                if (!isLoading) {
                  e.target.style.transform = 'scale(0.98)'
                }
              }}
              onMouseUp={(e) => {
                if (!isLoading) {
                  e.target.style.transform = 'scale(1)'
                }
              }}
            >
              {isLoading ? (
                <>
                  <span style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid #5a4a15',
                    borderRight: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite'
                  }} />
                  Signing in…
                </>
              ) : 'Sign In →'}
            </button>
          </form>

          {/* Signup Link */}
          <div style={{
            padding: '0 32px 32px',
            borderTop: '1px solid rgba(255,255,255,0.04)',
            textAlign: 'center',
            fontSize: '14px',
            color: '#5a5855'
          }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{
              fontWeight: '500',
              color: '#d4a832',
              textDecoration: 'none',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.color = '#f0c84a'}
            onMouseLeave={(e) => e.target.style.color = '#d4a832'}
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
