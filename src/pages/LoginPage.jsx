// filepath: src/pages/LoginPage.jsx
// Purpose: Login page — Linear-style split panel layout.

import { useNavigate } from 'react-router-dom'
import LoginForm from '../components/auth/LoginForm.jsx'

const FEATURES = [
  { label: 'AI layout generation',      desc: 'Multiple floor plans in seconds' },
  { label: 'Custom polygon plots',       desc: 'Draw any land shape on a canvas' },
  { label: 'Vastu & building codes',     desc: 'India NBC 2016 rules built in' },
  { label: '2D plans + 3D preview',      desc: 'Export PNG, view in 3D instantly' },
]

export default function LoginPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex bg-ink-950 font-sans">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex w-[460px] xl:w-[500px] flex-shrink-0 flex-col justify-between p-10 bg-ink-900 border-r border-ink-700/50 relative overflow-hidden">

        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.12) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Top accent line */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent-500/60 to-transparent" />

        {/* Logo */}
        <div className="relative animate-fadeUp">
          <div className="flex items-center gap-3">
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
        </div>

        {/* Hero */}
        <div className="relative space-y-8 animate-fadeUp animation-delay-100">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-500/10 border border-accent-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-pulse" />
              <span className="text-xs text-accent-400 font-medium">AI-powered floor plans</span>
            </div>
            <h1 className="text-4xl font-bold text-ink-50 leading-tight tracking-tight">
              Design smarter.<br/>
              <span className="text-accent-400">Build faster.</span>
            </h1>
            <p className="text-[15px] text-ink-200 leading-relaxed max-w-sm">
              Generate architectural floor plans tailored to your plot, requirements, and compliance rules.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-3">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-accent-500/15 border border-accent-500/25 flex items-center justify-center shrink-0 mt-0.5">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5L8 2.5" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink-100">{f.label}</p>
                  <p className="text-xs text-ink-300 mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative text-xs text-ink-400 animate-fadeUp animation-delay-200">
          Built for homeowners, architects & students in India
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
                <rect x="10" y="1" width="7" height="7" rx="1.5" fill="rgba(99,102,241,0.4)"/>
                <rect x="1" y="10" width="7" height="7" rx="1.5" fill="rgba(99,102,241,0.4)"/>
                <rect x="10" y="10" width="7" height="7" rx="1.5" fill="rgba(99,102,241,0.2)"/>
              </svg>
            </div>
            <span className="text-[15px] font-bold text-ink-50">ArchGen AI</span>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h2 className="text-2xl font-bold text-ink-50 tracking-tight mb-1">Welcome back</h2>
            <p className="text-sm text-ink-300">Sign in to continue to your workspace</p>
          </div>

          <LoginForm onSuccess={() => navigate('/dashboard', { replace: true })} />
        </div>
      </div>

    </div>
  )
}