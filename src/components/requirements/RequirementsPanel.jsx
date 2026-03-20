// filepath: src/components/requirements/RequirementsPanel.jsx
// Purpose: Room configuration UI — composes BasicModeForm, AdvancedModeForm, and VastuOptions.
// Reads mode from store, delegates all form logic to sub-components.

import useRequirementsStore from '../../store/requirementsStore.js'
import useLandStore from '../../store/landStore.js'
import { useLayoutGenerator } from '../../hooks/useLayoutGenerator.js'
import BasicModeForm from './BasicModeForm.jsx'
import AdvancedModeForm from './AdvancedModeForm.jsx'
import VastuOptions from './VastuOptions.jsx'
import { validateRoomFit, validateDirectionConflicts } from '../../utils/validators.js'

export default function RequirementsPanel({ onBack }) {
  const mode  = useRequirementsStore((s) => s.mode)
  const rooms = useRequirementsStore((s) => s.rooms)
  const bedroomCount  = useRequirementsStore((s) => s.bedroomCount)
  const hasKitchen    = useRequirementsStore((s) => s.hasKitchen)
  const hasLivingRoom = useRequirementsStore((s) => s.hasLivingRoom)
  const hasDiningRoom = useRequirementsStore((s) => s.hasDiningRoom)
  const floors        = useRequirementsStore((s) => s.floors)
  const setMode = useRequirementsStore((s) => s.setMode)

  const polygonPoints = useLandStore((s) => s.polygonPoints)
  const dimensions    = useLandStore((s) => s.dimensions)
  const unit          = useLandStore((s) => s.unit)

  const { generate, isGenerating, generationError } = useLayoutGenerator()

  // Run Phase 4 validations — warn but never hard-block
  const warnings = []

  const roomFitWarning = validateRoomFit({
    mode,
    bedroomCount,
    hasKitchen,
    hasLivingRoom,
    hasDiningRoom,
    floors,
    rooms,
    polygonPoints,
    dimensions,
    unit,
  })
  if (roomFitWarning) warnings.push(roomFitWarning)

  if (mode === 'advanced') {
    const directionWarnings = validateDirectionConflicts(rooms)
    warnings.push(...directionWarnings)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">

        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Room Requirements</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure what you need — the engine handles placement.
          </p>
        </div>

        <div className="px-6 py-6 space-y-8">

          {/* Mode toggle */}
          <div>
            <label className="block text-xs text-slate-400 uppercase tracking-wide font-semibold mb-3">
              Configuration Mode
            </label>
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
              {['basic', 'advanced'].map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-5 py-1.5 text-sm font-medium rounded-md transition cursor-pointer ${
                    mode === m
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Mode-specific form */}
          {mode === 'basic' ? (
            <BasicModeForm />
          ) : (
            <AdvancedModeForm validationWarnings={warnings} />
          )}

          {/* Vastu options — shown in both modes */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs text-slate-400 uppercase tracking-wide font-semibold mb-3">
              Vastu Compliance
            </label>
            <VastuOptions />
          </div>

          {/* Warnings (basic mode — advanced mode shows inline) */}
          {mode === 'basic' && warnings.length > 0 && (
            <div className="space-y-2">
              {warnings.map((warn, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800"
                >
                  <span className="mt-0.5 text-amber-500 shrink-0">⚠</span>
                  <span>{warn}</span>
                </div>
              ))}
            </div>
          )}

          {/* Generation error */}
          {generationError && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {generationError}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onBack}
              className="px-5 py-2.5 text-sm text-slate-500 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-slate-300 hover:text-slate-700 transition"
            >
              ← Back
            </button>
            <button
              onClick={generate}
              disabled={isGenerating}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg border-none transition cursor-pointer ${
                isGenerating
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isGenerating ? 'Generating...' : 'Generate Layouts'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}