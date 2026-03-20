// filepath: src/components/layout-generator/LayoutSelector.jsx
// Purpose: Grid of generated layout options for the user to pick from

import { useState } from 'react'

// Static SVG room previews for each of the 3 layout slots
const LAYOUT_PREVIEW_SHAPES = [
  <>
    <rect x="4" y="4" width="45" height="35" stroke="#d4a832" strokeWidth="0.8" fill="rgba(212,168,50,0.04)" />
    <rect x="49" y="4" width="47" height="35" stroke="#d4a832" strokeWidth="0.8" fill="rgba(212,168,50,0.04)" />
    <rect x="4" y="39" width="92" height="37" stroke="#d4a832" strokeWidth="0.8" fill="rgba(212,168,50,0.03)" />
    <line x1="49" y1="39" x2="49" y2="76" stroke="#d4a832" strokeWidth="0.8" />
  </>,
  <>
    <rect x="4" y="4" width="30" height="72" stroke="#d4a832" strokeWidth="0.8" fill="rgba(212,168,50,0.04)" />
    <rect x="34" y="4" width="62" height="35" stroke="#d4a832" strokeWidth="0.8" fill="rgba(212,168,50,0.04)" />
    <rect x="34" y="39" width="30" height="37" stroke="#d4a832" strokeWidth="0.8" fill="rgba(212,168,50,0.03)" />
    <rect x="64" y="39" width="32" height="37" stroke="#d4a832" strokeWidth="0.8" fill="rgba(212,168,50,0.03)" />
  </>,
  <>
    <rect x="4" y="4" width="92" height="20" stroke="#d4a832" strokeWidth="0.8" fill="rgba(212,168,50,0.04)" />
    <rect x="4" y="24" width="45" height="52" stroke="#d4a832" strokeWidth="0.8" fill="rgba(212,168,50,0.04)" />
    <rect x="49" y="24" width="47" height="25" stroke="#d4a832" strokeWidth="0.8" fill="rgba(212,168,50,0.03)" />
    <rect x="49" y="49" width="47" height="27" stroke="#d4a832" strokeWidth="0.8" fill="rgba(212,168,50,0.03)" />
  </>,
]

export default function LayoutSelector({ layouts = [], onSave, isSaving, onBack }) {
  const [selected, setSelected] = useState(0)

  return (
    <div
      className="flex-1 flex flex-col p-8 overflow-y-auto"
      style={{ animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-2xl font-normal text-[#f0ede8] mb-1">Choose a layout</h2>
          <p className="text-[#5a5855] text-sm m-0">
            {layouts.length} layout{layouts.length !== 1 ? 's' : ''} generated. Select one to continue.
          </p>
        </div>
        <button
          onClick={onBack}
          className="text-sm text-[#5a5855] bg-transparent border-none cursor-pointer transition-colors hover:text-[#9d9a94]"
        >
          ← Regenerate
        </button>
      </div>

      {/* Layout cards */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 mb-8">
        {(layouts.length === 0 ? [0, 1, 2] : layouts).map((layout, i) => {
          const isSelected = selected === i
          return (
            <div
              key={i}
              onClick={() => setSelected(i)}
              className={[
                'bg-[#141418] rounded-xl border overflow-hidden cursor-pointer transition-all',
                isSelected
                  ? 'border-[#d4a832] shadow-[0_0_24px_rgba(212,168,50,0.15)]'
                  : 'border-white/[0.06] hover:border-[rgba(212,168,50,0.2)]',
              ].join(' ')}
              style={{ animation: `fadeUp 0.5s ${i * 80}ms cubic-bezier(0.16,1,0.3,1) both` }}
            >
              {/* Preview area */}
              <div
                className="relative p-4 bg-[#0f0f12]"
                style={{
                  aspectRatio: '4/3',
                  backgroundImage:
                    'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
                  backgroundSize: '12px 12px',
                }}
              >
                <svg className="w-full h-full opacity-70" viewBox="0 0 100 80" fill="none">
                  <rect x="4" y="4" width="92" height="72" stroke="#d4a832" strokeWidth="1.5" fill="none" />
                  {LAYOUT_PREVIEW_SHAPES[i % LAYOUT_PREVIEW_SHAPES.length]}
                </svg>

                {isSelected && (
                  <div className="absolute top-3 right-3 w-5 h-5 bg-[#d4a832] rounded-full flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M1.5 5l2.5 2.5 5-5" stroke="#0a0a0c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Card footer */}
              <div className="px-4 py-3 border-t border-white/[0.04]">
                <p className="text-sm font-medium text-[#9d9a94] mb-1 m-0">Layout {i + 1}</p>
                <p className="text-xs text-[#5a5855] font-mono m-0">
                  Score: {typeof layout === 'object' ? layout.score : 90 - i * 8}%
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <button
          onClick={() => onSave?.(layouts[selected])}
          disabled={isSaving}
          className={[
            'flex items-center gap-2 px-7 py-3 text-sm font-semibold rounded-xl border-none transition-all font-[inherit]',
            isSaving
              ? 'bg-[#8a6a1a] text-[#5a4a15] cursor-not-allowed opacity-50'
              : 'bg-[#d4a832] text-[#0a0a0c] cursor-pointer hover:bg-[#f0c84a] hover:shadow-[0_0_24px_rgba(212,168,50,0.35)]',
          ].join(' ')}
        >
          {isSaving ? 'Saving…' : 'Save & continue to editor →'}
        </button>
      </div>
    </div>
  )
}