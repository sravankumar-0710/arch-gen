// filepath: src/pages/EditorPage.jsx
// Purpose: Main editor page — phased workflow orchestrator

import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import LandInputPanel from '../components/land-input/LandInputPanel.jsx'
import StepIndicator from '../components/editor/StepIndicator.jsx'
import RequirementsPanel from '../components/requirements/RequirementsPanel.jsx'
import GeneratingState from '../components/layout-generator/GeneratingState.jsx'
import LayoutSelector from '../components/layout-generator/LayoutSelector.jsx'
import useLandStore from '../store/landStore.js'
import { useLayoutGenerator } from '../hooks/useLayoutGenerator.js'
import * as projectService from '../services/projectService.js'

const STEPS = [
  { id: 'land',         label: 'Draw Plot' },
  { id: 'requirements', label: 'Configure' },
  { id: 'generating',   label: 'Generate' },
  { id: 'results',      label: 'Select Layout' },
]

const DEFAULT_REQUIREMENTS = {
  bedrooms:   2,
  bathrooms:  1,
  kitchen:    1,
  livingRoom: 1,
  diningRoom: 0,
  balcony:    1,
}

export default function EditorPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()

  const [phase, setPhase] = useState('land')
  const [isSaving, setIsSaving] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [error, setError] = useState(null)
  const [requirements, setRequirements] = useState(DEFAULT_REQUIREMENTS)

  const { setPolygonPoints, setRoadSide, setNorthAngle, setUnit } = useLandStore()
  const { layouts, isGenerating, generateError, generate } = useLayoutGenerator()

  const stepIndex = STEPS.findIndex((s) => s.id === phase)

  // Load existing project data into stores
  useEffect(() => {
    async function loadProject() {
      if (!projectId) {
        setPageLoading(false)
        return
      }

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

        if (project.requirements) {
          setRequirements((prev) => ({ ...prev, ...project.requirements }))
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setPageLoading(false)
      }
    }

    loadProject()
  }, [projectId, setPolygonPoints, setRoadSide, setNorthAngle, setUnit])

  async function handleSaveLandData(landData) {
    if (!projectId) {
      setError('No project loaded')
      return
    }

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

  async function handleGenerate() {
    setPhase('generating')
    await generate(requirements)
    setPhase('results')
  }

  async function handleSaveLayout(layout) {
    setIsSaving(true)
    try {
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="h-screen bg-[#0a0a0c] flex flex-col overflow-hidden font-[Inter,system-ui,sans-serif]">

      {/* Top bar */}
      <header className="h-14 flex items-center justify-between px-6 border-b border-white/[0.05] bg-[#0f0f12] flex-shrink-0">
        {/* Left: back + project name */}
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

        {/* Centre: step indicator */}
        <StepIndicator steps={STEPS} currentStep={stepIndex} />

        {/* Right: autosave indicator */}
        <div className="flex items-center gap-1.5 text-xs text-[#5a5855] font-mono">
          <span className="w-1.5 h-1.5 bg-[#3db87a] rounded-full" />
          Auto-saved
        </div>
      </header>

      {/* Error banner */}
      {(error || generateError) && (
        <div className="px-6 py-2.5 bg-[rgba(224,82,82,0.08)] border-b border-[rgba(224,82,82,0.15)] text-sm text-[#e05252] flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" stroke="#e05252" strokeWidth="1.2" />
            <path d="M7 4v3.5M7 9.5v.5" stroke="#e05252" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          {error || generateError}
          <button
            onClick={() => setError(null)}
            className="ml-auto text-[#e05252] bg-transparent border-none cursor-pointer hover:text-[#ff7070]"
          >
            ✕
          </button>
        </div>
      )}

      {/* Phase content */}
      {pageLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[#9d9a94]">Loading project...</p>
        </div>
      ) : phase === 'land' ? (
        <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto bg-[#0a0a0c]">
          <div className="w-full max-w-[1200px]">
            <div className="bg-[#141418] rounded-2xl border border-white/[0.06] overflow-hidden">
              <div className="h-px bg-gradient-to-r from-transparent via-[#d4a832] to-transparent opacity-40" />
              <div className="p-8">
                <LandInputPanel onSave={handleSaveLandData} isLoading={isSaving} />
              </div>
            </div>
          </div>
        </div>
      ) : phase === 'requirements' ? (
        <RequirementsPanel
          onBack={() => setPhase('land')}
          onGenerate={handleGenerate}
          isLoading={isGenerating}
          requirements={requirements}
          setRequirements={setRequirements}
        />
      ) : phase === 'generating' ? (
        <GeneratingState />
      ) : phase === 'results' ? (
        <LayoutSelector
          layouts={layouts}
          onSave={handleSaveLayout}
          isSaving={isSaving}
          onBack={() => setPhase('requirements')}
        />
      ) : null}
    </div>
  )
}