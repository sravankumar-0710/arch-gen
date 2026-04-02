// filepath: src/components/auth/SignupForm.jsx
// Purpose: Signup form — email/password/confirm inputs, validation, submit handler.

import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import useAuth from '../../hooks/useAuth.js'
import { validateEmail, validatePassword } from '../../utils/validators.js'

// Field must be defined OUTSIDE SignupForm — defining it inside causes remount
// on every keystroke (React recreates the function → unmounts input → focus lost)
function Field({ id, label, type, value, onChange, onKeyDown, placeholder, disabled, error }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-semibold text-ink-300 tracking-wider uppercase">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full h-10 px-3.5 rounded-lg bg-ink-800 border border-ink-500 text-sm text-ink-50 placeholder:text-ink-400 outline-none transition-all focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 disabled:opacity-40"
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

export default function SignupForm({ onSuccess }) {
  const { register, isLoading, error, clearError } = useAuth()
  const [email,           setEmail]           = useState('')
  const [password,        setPassword]        = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors,     setFieldErrors]     = useState({})

  const handleSubmit = async () => {
    clearError()
    const errors = {}
    const emailErr = validateEmail(email)
    const passErr  = validatePassword(password)
    if (emailErr) errors.email = emailErr
    if (passErr)  errors.password = passErr
    if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match.'
    if (Object.keys(errors).length) { setFieldErrors(errors); return }
    setFieldErrors({})
    try { await register({ email, password }); onSuccess() } catch {}
  }

  const onKey = (e) => { if (e.key === 'Enter') handleSubmit() }

  return (
    <div className="w-full space-y-4">

      {error && (
        <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="shrink-0">
            <circle cx="7.5" cy="7.5" r="6.5" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M7.5 4.5v3.5m0 2v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          {error}
        </div>
      )}

      <Field
        id="s-email" label="Email address" type="email"
        value={email} onChange={(e) => setEmail(e.target.value)}
        onKeyDown={onKey} placeholder="you@company.com"
        disabled={isLoading} error={fieldErrors.email}
      />
      <Field
        id="s-pass" label="Password" type="password"
        value={password} onChange={(e) => setPassword(e.target.value)}
        onKeyDown={onKey} placeholder="Min. 8 characters"
        disabled={isLoading} error={fieldErrors.password}
      />
      <Field
        id="s-confirm" label="Confirm password" type="password"
        value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
        onKeyDown={onKey} placeholder="••••••••"
        disabled={isLoading} error={fieldErrors.confirmPassword}
      />

      <button
        onClick={handleSubmit} disabled={isLoading}
        className="w-full h-10 flex items-center justify-center gap-2 rounded-lg text-sm font-semibold bg-accent-600 text-white border-none cursor-pointer transition-all hover:bg-accent-500 hover:shadow-glow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
      >
        {isLoading
          ? <><span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white/80 animate-spin"/>Creating account…</>
          : 'Create account →'
        }
      </button>

      <p className="text-center text-sm text-ink-300 pt-1">
        Already have an account?{' '}
        <Link to="/login" className="text-accent-400 font-semibold hover:text-accent-300 transition-colors no-underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}