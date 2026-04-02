// filepath: src/pages/EditorPage.jsx
// Purpose: Main editor page — phased workflow orchestrator

import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import LandInputPanel from '../components/land-input/LandInputPanel.jsx'
import StepIndicator from '../components/editor/StepIndicator.jsx'
import RequirementsPanel from '../components/requirements/RequirementsPanel.jsx'
import GeneratingState from '../components/layout-generator/GeneratingState.jsx'
import LayoutSelector from '../components/layout-generator/LayoutSelector.jsx'
import useLandStore from '../store/landStore.js'
import useLayoutStore from '../store/layoutStore.js'
import useLayoutGenerator from '../hooks/useLayoutGenerator.js'
import * as projectService from '../services/projectService.js'
import FloorPlanCanvas from '../components/floor-plan/FloorPlanCanvas.jsx'

const STEPS = [
  { id: 'land',         label: 'Draw Plot' },
  { id: 'requirements', label: 'Configure' },
  { id: 'generating',   label: 'Generate' },
  { id: 'results',      label: 'Select Layout' },
  { id: 'editor',       label: 'Edit' },
]

export default function EditorPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()

  const [phase, setPhase] = useState('land')
  const [isSaving, setIsSaving] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [error, setError] = useState(null)
  // Layout being edited in step 5
  const [editingLayout, setEditingLayout] = useState(null)
  const [editedRooms, setEditedRooms] = useState(null)

  const { setPolygonPoints, setRoadSide, setNorthAngle, setUnit } = useLandStore()

  // Read layouts directly from the store — not from the hook return value
  const layoutOptions = useLayoutStore((s) => s.layoutOptions)

  // Hook only used for triggering generation and reading generating state
  const { generate, isGenerating, generationError } = useLayoutGenerator()

  const stepIndex = STEPS.findIndex((s) => s.id === phase)

  useEffect(() => {
    async function loadProject() {
      if (!projectId) { setPageLoading(false); return }
      try {
        const data = await projectService.getProject(projectId)
        const project = data.data || data
        if (project.land_data) {
          const { polygonPoints, roadSide, northAngle, unit } = project.land_data
          setPolygonPoints(polygonPoints || [])
          setRoadSide(roadSide ?? null)
          setNorthAngle(northAngle ?? 0)
          setUnit(unit || 'ft')
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setPageLoading(false)
      }
    }
    loadProject()
  }, [projectId, setPolygonPoints, setRoadSide, setNorthAngle, setUnit])

  // Watch isGenerating: when it flips false while on 'generating' phase, advance
  useEffect(() => {
    if (!isGenerating && phase === 'generating') {
      if (generationError) {
        setPhase('requirements')
      } else {
        setPhase('results')
      }
    }
  }, [isGenerating, generationError, phase])

  async function handleSaveLandData(landData) {
    if (!projectId) { setError('No project loaded'); return }
    setIsSaving(true)
    setError(null)
    try {
      await projectService.updateProject(projectId, { land_data: landData })
      setPhase('requirements')
    } catch (err) {
      setError(err.message || 'Failed to save plot layout')
    } finally {
      setIsSaving(false)
    }
  }

  // FIXED: generate() reads from store — no args. Set phase first, then call.
  function handleGenerate() {
    setPhase('generating')
    generate()
  }

  function handleSaveLayout(layout) {
    // Go to editor step with the selected layout — don't save to DB yet
    setEditingLayout(layout)
    setEditedRooms(null)
    setPhase('editor')
  }

  async function handleFinalSave() {
    setIsSaving(true)
    try {
      const layoutToSave = editedRooms
        ? { ...editingLayout, rooms: editedRooms }
        : editingLayout
      await projectService.updateProject(projectId, { layout: layoutToSave })
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex flex-col font-[Inter,system-ui,sans-serif]">

      <header className="sticky top-0 z-20 h-14 flex items-center justify-between px-6 border-b border-white/[0.05] bg-[#0f0f12] flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-sm text-[#5a5855] bg-transparent border-none cursor-pointer transition-colors hover:text-[#9d9a94] font-[inherit]"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Dashboard
          </button>
          <div className="w-px h-4 bg-white/[0.08]" />
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 opacity-60">
              <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
                <rect x="4" y="4" width="28" height="28" stroke="#d4a832" strokeWidth="1.5" fill="none" />
                <rect x="4" y="4" width="14" height="14" stroke="#d4a832" strokeWidth="1" fill="rgba(212,168,50,0.06)" />
              </svg>
            </div>
            <span className="font-serif text-[15px] font-normal text-[#9d9a94]">
              {projectId ? `Project #${projectId}` : 'New project'}
            </span>
          </div>
        </div>

        <StepIndicator steps={STEPS} currentStep={stepIndex} />

        <div className="flex items-center gap-1.5 text-xs text-[#5a5855] font-mono">
          <span className="w-1.5 h-1.5 bg-[#3db87a] rounded-full" />
          Auto-saved
        </div>
      </header>

      {(error || generationError) && (
        <div className="px-6 py-2.5 bg-[rgba(224,82,82,0.08)] border-b border-[rgba(224,82,82,0.15)] text-sm text-[#e05252] flex items-center gap-2 flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" stroke="#e05252" strokeWidth="1.2" />
            <path d="M7 4v3.5M7 9.5v.5" stroke="#e05252" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          {error || generationError}
          <button onClick={() => setError(null)} className="ml-auto text-[#e05252] bg-transparent border-none cursor-pointer hover:text-[#ff7070]">✕</button>
        </div>
      )}

      <main className="flex-1 overflow-y-auto">
        {pageLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-[#9d9a94]">Loading project...</p>
          </div>
        ) : phase === 'land' ? (
          <div className="p-6">
            <div className="w-full max-w-[1100px] mx-auto">
              <div className="bg-[#141418] rounded-2xl border border-white/[0.06] overflow-hidden">
                <div className="h-px bg-gradient-to-r from-transparent via-[#d4a832] to-transparent opacity-40" />
                <div className="p-6">
                  <LandInputPanel onSave={handleSaveLandData} isLoading={isSaving} />
                </div>
              </div>
            </div>
          </div>
        ) : phase === 'requirements' ? (
          <RequirementsPanel
            onBack={() => setPhase('land')}
            onGenerate={handleGenerate}
          />
        ) : phase === 'generating' ? (
          <GeneratingState />
        ) : phase === 'results' ? (
          <LayoutSelector
            layouts={layoutOptions}
            onSave={handleSaveLayout}
            isSaving={isSaving}
            onBack={() => setPhase('requirements')}
          />
        ) : phase === 'editor' ? (
          <div className="p-6 flex flex-col gap-6 max-w-[1000px] mx-auto w-full">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-normal text-[#f0ede8] mb-1">
                  Edit floor plan
                </h2>
                <p className="text-[#5a5855] text-sm m-0">
                  Drag rooms to reposition · Drag corners to resize · Snaps to grid
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPhase('results')}
                  className="px-4 py-2 text-sm text-[#9d9a94] bg-transparent border border-white/[0.08] rounded-lg cursor-pointer hover:border-white/20 transition-colors font-[inherit]"
                >
                  ← Back to layouts
                </button>
                <button
                  onClick={handleFinalSave}
                  disabled={isSaving}
                  className="px-6 py-2 text-sm font-semibold bg-[#d4a832] text-[#0a0a0c] rounded-lg border-none cursor-pointer hover:bg-[#f0c84a] transition-colors disabled:opacity-50 font-[inherit]"
                >
                  {isSaving ? 'Saving…' : 'Save & finish →'}
                </button>
              </div>
            </div>
            <FloorPlanCanvas
              layout={editingLayout}
              onChange={setEditedRooms}
            />
          </div>
        ) : null}
      </main>
    </div>
  )
}