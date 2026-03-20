// filepath: src/hooks/useLayoutGenerator.js
// Purpose: Custom hook that orchestrates layout generation — validates inputs, calls the API,
// and updates the layout store with results.

import useLayoutStore from '../store/layoutStore.js'
import useLandStore from '../store/landStore.js'
import useRequirementsStore from '../store/requirementsStore.js'
import { generateLayout } from '../services/generatorService.js'
import { validatePolygon } from '../utils/geometry.js'

// Named export — consistent with how hooks are imported across the codebase
export function useLayoutGenerator() {
  const setLayoutOptions = useLayoutStore((state) => state.setLayoutOptions)
  const setIsGenerating = useLayoutStore((state) => state.setIsGenerating)
  const setGenerationError = useLayoutStore((state) => state.setGenerationError)
  const isGenerating = useLayoutStore((state) => state.isGenerating)
  const generationError = useLayoutStore((state) => state.generationError)

  const polygonPoints = useLandStore((state) => state.polygonPoints)
  const unit = useLandStore((state) => state.unit)
  const roadSide = useLandStore((state) => state.roadSide)
  const northAngle = useLandStore((state) => state.northAngle)

  const mode = useRequirementsStore((state) => state.mode)
  const floors = useRequirementsStore((state) => state.floors)
  const vastuEnabled = useRequirementsStore((state) => state.vastuEnabled)
  const bedroomCount = useRequirementsStore((state) => state.bedroomCount)
  const rooms = useRequirementsStore((state) => state.rooms)

  const generate = async () => {
    // Validate polygon client-side before hitting the backend
    const validationError = validatePolygon(polygonPoints)
    if (validationError) {
      setGenerationError(validationError)
      return
    }

    setIsGenerating(true)
    setGenerationError(null)

    const payload = {
      land: {
        polygonPoints,
        unit,
        roadSide,
        northAngle,
      },
      requirements: {
        mode,
        floors,
        vastuEnabled,
        // Only include the relevant fields per mode
        bedroomCount: mode === 'basic' ? bedroomCount : undefined,
        rooms: mode === 'advanced' ? rooms : undefined,
      },
    }

    try {
      const data = await generateLayout(payload)
      setLayoutOptions(data.data.layouts)
    } catch (err) {
      setGenerationError(err.message)
    } finally {
      setIsGenerating(false)
    }
  }

  return { generate, isGenerating, generationError }
}