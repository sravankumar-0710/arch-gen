// filepath: src/components/requirements/CustomPromptForm.jsx
// Purpose: Free-text AI prompt input — lets users describe layout preferences in plain English.
// The prompt is sent to Gemini alongside the structured form data for richer generation.

import useRequirementsStore from '../../store/requirementsStore.js'

// Example prompts shown as clickable chips to guide users
const EXAMPLE_PROMPTS = [
  'Master bedroom at the back away from road noise, large windows facing garden',
  'Open-plan kitchen and dining area together, living room near entrance',
  'All bedrooms clustered together with a shared bathroom between them',
  'Kitchen near back door for easy access, pooja room in northeast corner',
  'Maximize natural light in living room, keep bathrooms internal without windows',
]

export default function CustomPromptForm() {
  const customPrompt    = useRequirementsStore((s) => s.customPrompt)
  const setCustomPrompt = useRequirementsStore((s) => s.setCustomPrompt)

  const charCount = customPrompt.length
  const charLimit = 500
  const isNearLimit = charCount > charLimit * 0.8

  function handleExampleClick(example) {
    // Append example to existing prompt with a separator if there's already text
    if (customPrompt.trim()) {
      setCustomPrompt(customPrompt.trim() + '. ' + example)
    } else {
      setCustomPrompt(example)
    }
  }

  return (
    <div className="space-y-5">

      {/* Explanation banner */}
      <div className="flex gap-3 px-4 py-3 bg-accent-500/10 border border-accent-500/20 rounded-lg">
        <span className="text-accent-400 text-base shrink-0 mt-0.5">✦</span>
        <div>
          <p className="text-sm font-medium text-ink-50">
            Describe your layout in plain English
          </p>
          <p className="text-xs text-ink-200 mt-0.5">
            Gemini will use this alongside your room configuration to generate layouts
            that match your preferences. Be as specific as you like.
          </p>
        </div>
      </div>

      {/* Main textarea */}
      <div>
        <label className="block text-xs text-ink-200 uppercase tracking-wide font-semibold mb-2">
          Your Layout Instructions
        </label>
        <div className="relative">
          <textarea
            value={customPrompt}
            onChange={(e) => {
              if (e.target.value.length <= charLimit) {
                setCustomPrompt(e.target.value)
              }
            }}
            placeholder="e.g. I want the master bedroom at the back of the house away from street noise. The kitchen should be near the dining area. Keep all bedrooms together on one side..."
            rows={5}
            className="w-full px-4 py-3 bg-ink-800 border border-ink-500 rounded-lg text-sm text-ink-50 placeholder-ink-300 resize-none focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500/30 transition"
          />
          {/* Character counter */}
          <span
            className={`absolute bottom-3 right-3 text-xs ${
              isNearLimit ? 'text-amber-400' : 'text-ink-300'
            }`}
          >
            {charCount}/{charLimit}
          </span>
        </div>
      </div>

      {/* Example prompts */}
      <div>
        <label className="block text-xs text-ink-300 uppercase tracking-wide font-semibold mb-2.5">
          Examples — click to use
        </label>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_PROMPTS.map((example, i) => (
            <button
              key={i}
              onClick={() => handleExampleClick(example)}
              className="px-3 py-1.5 text-xs text-ink-100 bg-ink-700 border border-ink-500 rounded-full hover:border-accent-500 hover:text-accent-400 hover:bg-accent-500/10 transition cursor-pointer text-left"
            >
              {example.length > 55 ? example.slice(0, 55) + '…' : example}
            </button>
          ))}
        </div>
      </div>

      {/* Clear button — only show when there's content */}
      {customPrompt.trim() && (
        <div className="flex justify-end">
          <button
            onClick={() => setCustomPrompt('')}
            className="text-xs text-ink-300 hover:text-red-400 transition cursor-pointer"
          >
            ✕ Clear prompt
          </button>
        </div>
      )}

      {/* Info note */}
      <div className="text-xs text-ink-300 leading-relaxed">
        <span className="text-ink-200 font-medium">Note:</span> This prompt works best
        when combined with the Basic or Advanced room configuration above. Room counts,
        sizes, and Vastu settings from those tabs are always included automatically.
      </div>

    </div>
  )
}