// filepath: src/components/editor/StepIndicator.jsx
// Purpose: Visual step progress bar shown in the EditorPage header

export default function StepIndicator({ steps, currentStep }) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((step, i) => {
        const isActive = i === currentStep
        const isDone = i < currentStep
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex items-center gap-2.5 px-4 py-2 transition-all duration-300">
              <div
                className={[
                  'w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold border flex-shrink-0 transition-all duration-300',
                  isDone
                    ? 'border-[#d4a832] bg-[#d4a832] text-[#0a0a0c]'
                    : isActive
                    ? 'border-[#d4a832] bg-transparent text-[#d4a832] shadow-[0_0_12px_rgba(212,168,50,0.3)]'
                    : 'border-white/10 bg-transparent text-[#5a5855]',
                ].join(' ')}
              >
                {isDone ? (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M1.5 5l2.5 2.5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={[
                  'text-xs font-medium transition-colors duration-300',
                  isActive ? 'text-[#f0ede8]' : isDone ? 'text-[#9d9a94]' : 'text-[#5a5855]',
                ].join(' ')}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={[
                  'h-px w-6 flex-shrink-0 transition-all duration-500',
                  i < currentStep ? 'bg-[#d4a832]' : 'bg-white/[0.07]',
                ].join(' ')}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}