// filepath: src/components/auth/LoginForm.jsx
// Purpose: Login form — email/password inputs, validation, submit handler.

import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import useAuth from '../../hooks/useAuth.js'
import { validateEmail, validatePassword } from '../../utils/validators.js'

export default function LoginForm({ onSuccess }) {
  const { login, isLoading, error, clearError } = useAuth()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const handleSubmit = async () => {
    clearError()
    const errors = {}
    const emailErr = validateEmail(email)
    const passErr  = validatePassword(password)
    if (emailErr) errors.email    = emailErr
    if (passErr)  errors.password = passErr
    if (Object.keys(errors).length) { setFieldErrors(errors); return }
    setFieldErrors({})
    try { await login({ email, password }); onSuccess() } catch {}
  }

  const onKey = (e) => { if (e.key === 'Enter') handleSubmit() }

  return (
    <div className="w-full space-y-5">

      {error && (
        <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="shrink-0">
            <circle cx="7.5" cy="7.5" r="6.5" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M7.5 4.5v3.5m0 2v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="l-email" className="block text-xs font-semibold text-ink-300 tracking-wider uppercase">
          Email address
        </label>
        <input
          id="l-email" type="email" value={email}
          onChange={(e) => setEmail(e.target.value)} onKeyDown={onKey}
          placeholder="you@company.com" disabled={isLoading}
          className="w-full h-10 px-3.5 rounded-lg bg-ink-800 border border-ink-500 text-sm text-ink-50 placeholder:text-ink-400 outline-none transition-all focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 disabled:opacity-40"
        />
        {fieldErrors.email && <p className="text-xs text-red-400 mt-1">{fieldErrors.email}</p>}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="l-pass" className="block text-xs font-semibold text-ink-300 tracking-wider uppercase">
          Password
        </label>
        <input
          id="l-pass" type="password" value={password}
          onChange={(e) => setPassword(e.target.value)} onKeyDown={onKey}
          placeholder="••••••••" disabled={isLoading}
          className="w-full h-10 px-3.5 rounded-lg bg-ink-800 border border-ink-500 text-sm text-ink-50 placeholder:text-ink-400 outline-none transition-all focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 disabled:opacity-40"
        />
        {fieldErrors.password && <p className="text-xs text-red-400 mt-1">{fieldErrors.password}</p>}
      </div>

      <button
        onClick={handleSubmit} disabled={isLoading}
        className="w-full h-10 flex items-center justify-center gap-2 rounded-lg text-sm font-semibold bg-accent-500 text-white border-none cursor-pointer transition-all hover:bg-accent-400 hover:shadow-glow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading
          ? <><span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white/80 animate-spin"/>Signing in…</>
          : 'Continue →'
        }
      </button>

      <p className="text-center text-sm text-ink-300">
        No account?{' '}
        <Link to="/signup" className="text-accent-400 font-semibold hover:text-accent-300 transition-colors no-underline">
          Sign up free
        </Link>
      </p>
    </div>
  )
}