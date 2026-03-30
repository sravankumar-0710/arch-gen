// filepath: src/components/common/Loader.jsx
// Purpose: Full-screen loading spinner — shown while auth state is being resolved.

import React from 'react'

export default function Loader() {
  return (
    <div className="h-screen w-screen bg-[#0a0a0c] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Spinning ring */}
        <div className="w-8 h-8 border-2 border-white/[0.08] border-t-[#d4a832] rounded-full animate-spin" />
        <span className="text-xs text-[#5a5855] tracking-widest uppercase">Loading</span>
      </div>
    </div>
  )
}