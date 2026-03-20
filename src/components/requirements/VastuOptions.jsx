// filepath: src/components/requirements/VastuOptions.jsx
// Purpose: Vastu Shastra compliance toggle and preset rule display panel.

import useRequirementsStore from '../../store/requirementsStore.js'
import { VASTU_RULE_DESCRIPTIONS } from '../../utils/vastuRules.js'

export default function VastuOptions() {
  const vastuEnabled  = useRequirementsStore((s) => s.vastuEnabled)
  const setVastuEnabled = useRequirementsStore((s) => s.setVastuEnabled)

  return (
    <div className="space-y-4">

      {/* Toggle header */}
      <div
        className={`flex items-center justify-between px-4 py-4 rounded-xl border transition cursor-pointer select-none ${
          vastuEnabled
            ? 'bg-amber-50 border-amber-200'
            : 'bg-white border-slate-200 hover:border-slate-300'
        }`}
        onClick={() => setVastuEnabled(!vastuEnabled)}
      >
        <div>
          <p className={`text-sm font-semibold ${vastuEnabled ? 'text-amber-900' : 'text-slate-800'}`}>
            Vastu Shastra Compliance
          </p>
          <p className={`text-xs mt-0.5 ${vastuEnabled ? 'text-amber-700' : 'text-slate-400'}`}>
            {vastuEnabled
              ? 'Room placements will be scored against Vastu direction rules'
              : 'Direction scoring is disabled — rooms will be placed by size constraints only'}
          </p>
        </div>

        {/* Toggle switch */}
        <div
          className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ml-4 ${
            vastuEnabled ? 'bg-amber-500' : 'bg-slate-200'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
              vastuEnabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </div>
      </div>

      {/* Rule list — only shown when enabled */}
      {vastuEnabled && (
        <div className="space-y-2">
          <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold px-1">
            Active Rules
          </p>
          <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden">
            {VASTU_RULE_DESCRIPTIONS.map((rule, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3 bg-white">
                {/* Direction badge */}
                <span className="shrink-0 mt-0.5 px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-800 rounded">
                  {rule.direction.split(' ')[0]}
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-800">{rule.room}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{rule.reason}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 px-1 pb-1">
            Individual rooms can override these defaults in advanced mode.
          </p>
        </div>
      )}
    </div>
  )
}