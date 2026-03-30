// filepath: src/hooks/useLayoutGenerator.js
// Purpose: Orchestrates layout generation — reads stores, builds payload, calls service.
// Writes results into layoutStore so EditorPage and LayoutSelector can read them.

import { useState, useCallback } from 'react'
import useLandStore from '../store/landStore.js'
import useRequirementsStore from '../store/requirementsStore.js'
import useLayoutStore from '../store/layoutStore.js'
import { generateLayout } from '../services/generatorService.js'

export default function useLayoutGenerator() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)

  // Write results into layoutStore — EditorPage reads layoutStore.layoutOptions
  const setLayoutOptions = useLayoutStore((s) => s.setLayoutOptions)

  const polygonPoints = useLandStore((s) => s.polygonPoints)
  const unit          = useLandStore((s) => s.unit)
  const roadSide      = useLandStore((s) => s.roadSide)
  const northAngle    = useLandStore((s) => s.northAngle)
  const dimensions    = useLandStore((s) => s.dimensions)

  const mode          = useRequirementsStore((s) => s.mode)
  const floors        = useRequirementsStore((s) => s.floors)
  const vastuEnabled  = useRequirementsStore((s) => s.vastuEnabled)
  const bedroomCount  = useRequirementsStore((s) => s.bedroomCount)
  const hasLivingRoom = useRequirementsStore((s) => s.hasLivingRoom)
  const hasDiningRoom = useRequirementsStore((s) => s.hasDiningRoom)
  const hasKitchen    = useRequirementsStore((s) => s.hasKitchen)
  const hasStaircase  = useRequirementsStore((s) => s.hasStaircase)
  const hasBalcony    = useRequirementsStore((s) => s.hasBalcony)
  const rooms         = useRequirementsStore((s) => s.rooms)
  const customPrompt  = useRequirementsStore((s) => s.customPrompt)

  const generate = useCallback(async () => {
    setError(null)
    setIsGenerating(true)

    const payload = {
      land_data: {
        polygonPoints,
        unit,
        roadSide,
        northAngle,
        dimensions,
      },
      requirements: {
        mode,
        floors,
        vastuEnabled,
        bedroomCount,
        hasLivingRoom,
        hasDiningRoom,
        hasKitchen,
        hasStaircase,
        hasBalcony,
        rooms,
        customPrompt,
      },
    }

    try {
      const result = await generateLayout(payload)

      if (!result.success) {
        setError(result.message || 'Generation failed')
        return null
      }

      const generatedLayouts = result.data?.layouts ?? []
      // Write into Zustand so EditorPage's layoutOptions selector picks it up
      setLayoutOptions(generatedLayouts)
      return generatedLayouts
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setIsGenerating(false)
    }
  }, [
    polygonPoints, unit, roadSide, northAngle, dimensions,
    mode, floors, vastuEnabled, bedroomCount,
    hasLivingRoom, hasDiningRoom, hasKitchen, hasStaircase, hasBalcony, rooms, customPrompt,
    setLayoutOptions,
  ])

  const reset = useCallback(() => {
    setLayoutOptions([])
    setError(null)
  }, [setLayoutOptions])

  return { generate, isGenerating, generationError: error, reset }
}