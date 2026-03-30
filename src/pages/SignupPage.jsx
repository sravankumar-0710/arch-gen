// filepath: src/pages/SignupPage.jsx
// Purpose: Signup page — matching split panel layout.

import React from 'react'
import { useNavigate } from 'react-router-dom'
import SignupForm from '../components/auth/SignupForm.jsx'

const STEPS = [
  { n: '1', text: 'Create your account' },
  { n: '2', text: 'Draw your land plot' },
  { n: '3', text: 'Set room requirements' },
  { n: '4', text: 'Generate floor plans' },
]

export default function SignupPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex bg-ink-950 font-sans">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex w-[460px] xl:w-[500px] flex-shrink-0 flex-col justify-between p-10 bg-ink-900 border-r border-ink-700/50 relative overflow-hidden">

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.12) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent-500/60 to-transparent" />

        {/* Logo */}
        <div className="relative animate-fadeUp flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent-600/20 border border-accent-500/30 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="1" y="1" width="7" height="7" rx="1.5" fill="rgba(99,102,241,0.6)"/>
              <rect x="10" y="1" width="7" height="7" rx="1.5" fill="rgba(99,102,241,0.4)"/>
              <rect x="1" y="10" width="7" height="7" rx="1.5" fill="rgba(99,102,241,0.4)"/>
              <rect x="10" y="10" width="7" height="7" rx="1.5" fill="rgba(99,102,241,0.2)"/>
            </svg>
          </div>
          <span className="text-[15px] font-bold text-ink-50 tracking-tight">ArchGen AI</span>
        </div>

        {/* Steps */}
        <div className="relative animate-fadeUp animation-delay-100 space-y-1">
          <p className="text-xs font-semibold text-ink-400 tracking-widest uppercase mb-5">Get started in 4 steps</p>
          {STEPS.map((step, i) => (
            <div key={i} className="flex items-center gap-4 py-3.5 border-b border-ink-700/40 last:border-0">
              <div className="w-6 h-6 rounded-full bg-accent-500/15 border border-accent-500/25 flex items-center justify-center shrink-0">
                <span className="text-[11px] font-bold text-accent-400">{step.n}</span>
              </div>
              <span className="text-sm font-medium text-ink-200">{step.text}</span>
            </div>
          ))}
        </div>

        <div className="relative text-xs text-ink-400 animate-fadeUp animation-delay-200">
          Free to use · No credit card required
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-fadeUp">

          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-7 h-7 rounded-lg bg-accent-600/20 border border-accent-500/30 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                <rect x="1" y="1" width="7" height="7" rx="1.5" fill="rgba(99,102,241,0.6)"/>
              </svg>
            </div>
            <span className="text-[15px] font-bold text-ink-50">ArchGen AI</span>
          </div>

          <div className="mb-7">
            <h2 className="text-2xl font-bold text-ink-50 tracking-tight mb-1">Create your account</h2>
            <p className="text-sm text-ink-300">Start designing floor plans in minutes</p>
          </div>

          <SignupForm onSuccess={() => navigate('/dashboard', { replace: true })} />
        </div>
      </div>

    </div>
  )
}