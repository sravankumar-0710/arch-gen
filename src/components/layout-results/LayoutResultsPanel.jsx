// filepath: src/components/layout-results/LayoutResultsPanel.jsx
// Purpose: Display generated layout variants with scores and selection

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LayoutPreview from './LayoutPreview.jsx'
import Button from '../common/Button.jsx'

// Score helpers live outside the component — derived display logic, not business logic
function getScoreColor(score) {
  if (score >= 80) return 'text-green-700'
  if (score >= 60) return 'text-yellow-700'
  return 'text-red-700'
}

function getScoreBgColor(score) {
  if (score >= 80) return 'bg-green-50'
  if (score >= 60) return 'bg-yellow-50'
  return 'bg-red-50'
}

export default function LayoutResultsPanel({ layouts, onSave, isSaving = false, onBack }) {
  const [selectedId, setSelectedId] = useState(layouts[0]?.id || null)

  const selectedLayout = layouts.find((l) => l.id === selectedId)

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Generated Layouts</h2>
        <p className="text-slate-600">
          {layouts.length} variants generated. Select one to review and save.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Layout grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {layouts.map((layout) => (
              <div
                key={layout.id}
                onClick={() => setSelectedId(layout.id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                  selectedId === layout.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {/* Thumbnail */}
                <div className="mb-3 bg-slate-50 rounded h-36 overflow-hidden">
                  <LayoutPreview
                    layout={layout}
                    width={250}
                    height={150}
                    showLabels={false}
                  />
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 text-sm mb-2">{layout.name}</h3>
                  <div
                    className={`inline-block px-3 py-1 rounded-full text-sm font-bold mb-2 ${getScoreBgColor(layout.score)} ${getScoreColor(layout.score)}`}
                  >
                    Score: {layout.score.toFixed(1)}/100
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    {layout.rooms?.length || 0} rooms
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Details panel */}
        {selectedLayout && (
          <div className="bg-white rounded-lg shadow-lg p-6 h-fit">
            <h3 className="text-xl font-bold text-slate-900 mb-4">{selectedLayout.name}</h3>

            {/* Score */}
            <div className={`p-4 rounded-lg mb-4 ${getScoreBgColor(selectedLayout.score)}`}>
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-1">Vastu Compliance Score</p>
                <p className={`text-3xl font-bold ${getScoreColor(selectedLayout.score)}`}>
                  {selectedLayout.score.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Rooms list */}
            <div className="mb-6">
              <h4 className="font-semibold text-slate-900 mb-3">Rooms</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedLayout.rooms?.map((room, idx) => (
                  <div key={idx} className="p-2 bg-slate-50 rounded text-sm border border-slate-200">
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-900">
                        {room.type.replace(/_/g, ' ')}
                      </span>
                      <span className="text-slate-600">{Math.round(room.area)} sqft</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Direction: <span className="font-medium">{room.direction}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Score breakdown */}
            {selectedLayout.scoreBreakdown && (
              <div className="mb-6">
                <h4 className="font-semibold text-slate-900 mb-2 text-sm">Score Details</h4>
                <div className="text-xs text-slate-600 space-y-1">
                  {selectedLayout.scoreBreakdown.rooms?.map((room, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{room.room_type.replace(/_/g, ' ')} ({room.direction})</span>
                      <span className="font-medium">{room.score.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={() => onSave(selectedLayout)} disabled={isSaving} size="lg" className="w-full">
              {isSaving ? 'Saving...' : 'Save This Layout'}
            </Button>

            {/* Use prop callback — never call window.history.back() inside a component */}
            <Button variant="secondary" onClick={onBack} size="sm" className="w-full mt-2">
              Back
            </Button>
          </div>
        )}
      </div>

      {/* Full preview */}
      {selectedLayout && (
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Full Layout Preview</h3>
          <div className="bg-slate-50 rounded-lg p-4">
            <LayoutPreview
              layout={selectedLayout}
              width={800}
              height={600}
              showLabels={true}
              showDimensions={true}
            />
          </div>
        </div>
      )}
    </div>
  )
}