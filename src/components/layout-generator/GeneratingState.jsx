// filepath: src/components/layout-generator/GeneratingState.jsx
// Purpose: Animated loading screen shown while layout generation is in progress

import React from 'react'

const GENERATION_STEPS = ['Geometry', 'Rooms', 'Vastu', 'Optimizing']

export default function GeneratingState() {
  return (
    <div
      className="flex-1 flex flex-col items-center justify-center p-8"
      style={{ animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both' }}
    >
      <div className="text-center">
        {/* Animated blueprint icon */}
        <div className="w-24 h-24 mx-auto mb-8">
          <svg viewBox="0 0 96 96" fill="none" className="w-full h-full">
            <rect x="8" y="8" width="80" height="80" stroke="rgba(212,168,50,0.2)" strokeWidth="2" fill="none" />
            <rect
              x="8" y="8" width="40" height="40"
              stroke="#d4a832" strokeWidth="1.5" fill="rgba(212,168,50,0.04)"
              style={{ animation: 'fadeIn 0.5s 0.2s both' }}
            />
            <rect
              x="48" y="8" width="40" height="40"
              stroke="#d4a832" strokeWidth="1.5" fill="rgba(212,168,50,0.04)"
              style={{ animation: 'fadeIn 0.5s 0.5s both' }}
            />
            <rect
              x="8" y="48" width="80" height="40"
              stroke="#d4a832" strokeWidth="1.5" fill="rgba(212,168,50,0.04)"
              style={{ animation: 'fadeIn 0.5s 0.8s both' }}
            />
            <circle
              cx="48" cy="48" r="36"
              stroke="rgba(212,168,50,0.15)" strokeWidth="1" fill="none"
              strokeDasharray="8 4"
              style={{ animation: 'spin 4s linear infinite', transformOrigin: 'center' }}
            />
          </svg>
        </div>

        <h3 className="font-serif text-2xl font-normal text-[#f0ede8] mb-2">
          Generating your layouts
        </h3>
        <p className="text-[#5a5855] text-sm mb-4">Applying rules, constraints, and Vastu logic…</p>

        <div className="flex items-center justify-center gap-1 mt-4">
          {GENERATION_STEPS.map((step, i) => (
            <div
              key={step}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[rgba(212,168,50,0.06)] border border-[rgba(212,168,50,0.1)] text-[#d4a832]"
              style={{ animation: `fadeIn 0.4s ${i * 200}ms both` }}
            >
              <span
                className="w-1.5 h-1.5 bg-[#d4a832] rounded-full"
                style={{ animation: `pulse-gold 1.5s ${i * 300}ms infinite` }}
              />
              {step}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}