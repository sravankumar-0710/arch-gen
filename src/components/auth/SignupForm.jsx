// filepath: src/components/auth/SignupForm.jsx
// Purpose: Signup form — email/password/confirm inputs, uses validators.js, same dark theme as LoginForm.

import { useState } from 'react'
import { Link } from 'react-router-dom'
import useAuth from '../../hooks/useAuth.js'
import { validateEmail, validatePassword } from '../../utils/validators.js'

export default function SignupForm({ onSuccess }) {
  const { register, isLoading, error, clearError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()

    const errors = {}
    const emailErr = validateEmail(email)
    const passErr = validatePassword(password)
    if (emailErr) errors.email = emailErr
    if (passErr) errors.password = passErr
    // Confirm password uses same rule — must match and meet minimum
    if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match.'
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setFieldErrors({})
    try {
      await register({ email, password })
      onSuccess()
    } catch {
      // error already set in store via useAuth
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-8">
      {/* API error */}
      {error && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-[rgba(224,82,82,0.08)] border border-[rgba(224,82,82,0.2)] text-[#e05252] text-sm flex items-start gap-3">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0 mt-0.5">
            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
            <path d="M7 4v3.5M7 9.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Email */}
      <div className="mb-5">
        <label htmlFor="email" className="block text-[10px] font-medium tracking-[0.15em] uppercase text-[#5a5855] mb-2">
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
          className="w-full bg-[#0f0f12] border border-white/[0.07] rounded-xl px-4 py-3 text-sm text-[#f0ede8] placeholder:text-[#3a3835] outline-none transition-all focus:border-[#d4a832] focus:shadow-[0_0_0_3px_rgba(212,168,50,0.1)] disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {fieldErrors.email && (
          <p className="mt-1.5 text-xs text-[#e05252]">{fieldErrors.email}</p>
        )}
      </div>

      {/* Password */}
      <div className="mb-5">
        <label htmlFor="password" className="block text-[10px] font-medium tracking-[0.15em] uppercase text-[#5a5855] mb-2">
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
          className="w-full bg-[#0f0f12] border border-white/[0.07] rounded-xl px-4 py-3 text-sm text-[#f0ede8] placeholder:text-[#3a3835] outline-none transition-all focus:border-[#d4a832] focus:shadow-[0_0_0_3px_rgba(212,168,50,0.1)] disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {fieldErrors.password && (
          <p className="mt-1.5 text-xs text-[#e05252]">{fieldErrors.password}</p>
        )}
      </div>

      {/* Confirm password */}
      <div className="mb-6">
        <label htmlFor="confirmPassword" className="block text-[10px] font-medium tracking-[0.15em] uppercase text-[#5a5855] mb-2">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          disabled={isLoading}
          className="w-full bg-[#0f0f12] border border-white/[0.07] rounded-xl px-4 py-3 text-sm text-[#f0ede8] placeholder:text-[#3a3835] outline-none transition-all focus:border-[#d4a832] focus:shadow-[0_0_0_3px_rgba(212,168,50,0.1)] disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {fieldErrors.confirmPassword && (
          <p className="mt-1.5 text-xs text-[#e05252]">{fieldErrors.confirmPassword}</p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl border-none transition-all bg-[#d4a832] text-[#0a0a0c] cursor-pointer hover:bg-[#f0c84a] hover:shadow-[0_0_24px_rgba(212,168,50,0.35)] active:scale-[0.98] disabled:bg-[#8a6a1a] disabled:text-[#5a4a15] disabled:cursor-not-allowed disabled:shadow-none"
      >
        {isLoading ? (
          <>
            <span className="w-4 h-4 border-2 border-[#5a4a15] border-r-transparent rounded-full animate-spin" />
            Creating account…
          </>
        ) : (
          'Create Account →'
        )}
      </button>

      {/* Login link */}
      <div className="mt-6 pt-6 border-t border-white/[0.04] text-center text-sm text-[#5a5855]">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-medium text-[#d4a832] no-underline transition-colors hover:text-[#f0c84a]"
        >
          Sign in
        </Link>
      </div>
    </form>
  )
}