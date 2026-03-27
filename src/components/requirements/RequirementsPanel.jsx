// filepath: src/components/requirements/RequirementsPanel.jsx
// Purpose: Room configuration UI — composes BasicModeForm, AdvancedModeForm, CustomPromptForm,
// and VastuOptions. Three tabs: Basic | Advanced | AI Prompt.

import useRequirementsStore from '../../store/requirementsStore.js'
import useLandStore from '../../store/landStore.js'
import useLayoutGenerator from '../../hooks/useLayoutGenerator.js'
import BasicModeForm from './BasicModeForm.jsx'
import AdvancedModeForm from './AdvancedModeForm.jsx'
import CustomPromptForm from './CustomPromptForm.jsx'
import VastuOptions from './VastuOptions.jsx'
import { validateRoomFit, validateDirectionConflicts } from '../../utils/validators.js'

const TABS = [
  { id: 'basic',    label: 'Basic' },
  { id: 'advanced', label: 'Advanced' },
  { id: 'prompt',   label: '✦ AI Prompt' },
]

export default function RequirementsPanel({ onBack, onGenerate }) {
  const mode          = useRequirementsStore((s) => s.mode)
  const rooms         = useRequirementsStore((s) => s.rooms)
  const bedroomCount  = useRequirementsStore((s) => s.bedroomCount)
  const hasKitchen    = useRequirementsStore((s) => s.hasKitchen)
  const hasLivingRoom = useRequirementsStore((s) => s.hasLivingRoom)
  const hasDiningRoom = useRequirementsStore((s) => s.hasDiningRoom)
  const floors        = useRequirementsStore((s) => s.floors)
  const customPrompt  = useRequirementsStore((s) => s.customPrompt)
  const setMode       = useRequirementsStore((s) => s.setMode)

  const polygonPoints = useLandStore((s) => s.polygonPoints)
  const dimensions    = useLandStore((s) => s.dimensions)
  const unit          = useLandStore((s) => s.unit)

  const { generate, isGenerating, generationError } = useLayoutGenerator()

  // Run Phase 4 validations — warn but never hard-block
  const warnings = []

  const roomFitWarning = validateRoomFit({
    mode, bedroomCount, hasKitchen, hasLivingRoom,
    hasDiningRoom, floors, rooms, polygonPoints, dimensions, unit,
  })
  if (roomFitWarning) warnings.push(roomFitWarning)

  if (mode === 'advanced') {
    const directionWarnings = validateDirectionConflicts(rooms)
    warnings.push(...directionWarnings)
  }

  const errorMessage = generationError
    ? (typeof generationError === 'string' ? generationError : JSON.stringify(generationError))
    : null

  // Whether user has written a custom prompt
  const hasCustomPrompt = customPrompt.trim().length > 0

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-ink-800 border border-ink-600 rounded-xl overflow-hidden">

        {/* Header */}
        <div className="px-6 py-5 border-b border-ink-600">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-ink-50">Room Requirements</h2>
              <p className="text-sm text-ink-200 mt-0.5">
                Configure rooms, then optionally add AI instructions.
              </p>
            </div>
            {/* AI Prompt active indicator */}
            {hasCustomPrompt && mode !== 'prompt' && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-accent-500/15 border border-accent-500/30 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-400 shrink-0" />
                <span className="text-xs text-accent-400 font-medium">AI prompt active</span>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-6 space-y-7">

          {/* Tab bar */}
          <div>
            <div className="inline-flex rounded-lg border border-ink-500 p-0.5 bg-ink-900 gap-0.5">
              {TABS.map((tab) => {
                const isActive = mode === tab.id
                // Show dot on AI Prompt tab if prompt has content but tab is not active
                const showDot = tab.id === 'prompt' && hasCustomPrompt && !isActive
                return (
                  <button
                    key={tab.id}
                    onClick={() => setMode(tab.id)}
                    className={`relative px-5 py-1.5 text-sm font-medium rounded-md transition cursor-pointer ${
                      isActive
                        ? 'bg-ink-700 text-ink-50 shadow-sm'
                        : 'text-ink-300 hover:text-ink-100'
                    }`}
                  >
                    {tab.label}
                    {showDot && (
                      <span className="absolute top-1 right-1.5 w-1.5 h-1.5 rounded-full bg-accent-400" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Tab content */}
          {mode === 'basic' && <BasicModeForm />}
          {mode === 'advanced' && <AdvancedModeForm validationWarnings={warnings} />}
          {mode === 'prompt' && <CustomPromptForm />}

          {/* Vastu options — always visible regardless of tab */}
          {mode !== 'prompt' && (
            <div className="pt-2 border-t border-ink-600">
              <label className="block text-xs text-ink-300 uppercase tracking-wide font-semibold mb-3">
                Vastu Compliance
              </label>
              <VastuOptions />
            </div>
          )}

          {/* Warnings (basic mode only — advanced shows inline) */}
          {mode === 'basic' && warnings.length > 0 && (
            <div className="space-y-2">
              {warnings.map((warn, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm text-amber-300"
                >
                  <span className="mt-0.5 shrink-0">⚠</span>
                  <span>{warn}</span>
                </div>
              ))}
            </div>
          )}

          {/* Generation error */}
          {errorMessage && (
            <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
              {errorMessage}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onBack}
              className="px-5 py-2.5 text-sm text-ink-200 bg-ink-700 border border-ink-500 rounded-lg cursor-pointer hover:border-ink-400 hover:text-ink-50 transition"
            >
              ← Back
            </button>
            <button
              onClick={onGenerate}
              disabled={isGenerating}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg border-none transition cursor-pointer ${
                isGenerating
                  ? 'bg-ink-600 text-ink-300 cursor-not-allowed'
                  : 'bg-accent-500 text-white hover:bg-accent-600'
              }`}
            >
              {isGenerating
                ? 'Generating…'
                : hasCustomPrompt
                ? '✦ Generate with AI Prompt'
                : 'Generate Layouts'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}