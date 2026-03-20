// filepath: src/pages/LoginPage.jsx
// Purpose: Login page shell — layout and branding only. Form logic lives in LoginForm.jsx.

import { useNavigate } from 'react-router-dom'
import LoginForm from '../components/auth/LoginForm.jsx'

export default function LoginPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center px-4 relative font-[Inter,system-ui,sans-serif]">

      {/* Blueprint grid background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(rgba(212,168,50,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(212,168,50,0.3) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />

      <div className="relative w-full max-w-[420px] z-10">

        {/* Logo + heading */}
        <div
          className="text-center mb-12"
          style={{ animation: 'fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both' }}
        >
          <div className="w-12 h-12 mx-auto mb-6">
            <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
              <rect x="4" y="4" width="28" height="28" stroke="#d4a832" strokeWidth="1.5" fill="none" />
              <rect x="4" y="4" width="14" height="14" stroke="#d4a832" strokeWidth="1" fill="rgba(212,168,50,0.06)" />
              <rect x="18" y="4" width="14" height="28" stroke="#d4a832" strokeWidth="1" fill="rgba(212,168,50,0.04)" />
              <rect x="4" y="18" width="14" height="14" stroke="#d4a832" strokeWidth="1" fill="rgba(212,168,50,0.04)" />
            </svg>
          </div>
          <h1 className="font-serif text-[32px] font-normal text-[#f0ede8] mb-2 tracking-normal">
            ArchGen<span className="text-[#d4a832] italic"> AI</span>
          </h1>
          <p className="text-[#5a5855] text-sm">Generate architectural floor plans with AI</p>
        </div>

        {/* Card */}
        <div
          className="bg-[#141418] rounded-2xl border border-white/[0.06] overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_25px_50px_rgba(0,0,0,0.5)]"
          style={{ animation: 'fadeUp 0.6s 0.1s cubic-bezier(0.16,1,0.3,1) both' }}
        >
          <div className="h-px bg-gradient-to-r from-transparent via-[#d4a832] to-transparent opacity-40" />
          <LoginForm onSuccess={() => navigate('/dashboard', { replace: true })} />
        </div>

      </div>
    </div>
  )
}