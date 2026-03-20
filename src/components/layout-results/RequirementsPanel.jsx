// filepath: src/components/layout-results/RequirementsPanel.jsx
// Purpose: Room configuration UI for layout generation (basic and advanced modes)

import { useState } from 'react'
import useLayoutStore from '../../store/layoutStore.js'
import useLayoutGenerator from '../../hooks/useLayoutGenerator.js'
import Button from '../common/Button.jsx'

export default function RequirementsPanel({ onGenerate, isLoading = false }) {
  const [mode, setMode] = useState('basic')
  const [vastuEnabled, setVastuEnabled] = useState(true)
  const [error, setError] = useState(null)

  // Basic mode fields
  const [bedroomCount, setBedroomCount] = useState(2)
  const [hasKitchen, setHasKitchen] = useState(true)
  const [hasLivingRoom, setHasLivingRoom] = useState(true)
  const [hasDiningRoom, setHasDiningRoom] = useState(false)

  // Advanced mode fields
  const [advancedRooms, setAdvancedRooms] = useState([
    { type: 'master_bedroom', minArea: 140, maxArea: 250 },
    { type: 'bedroom', minArea: 90, maxArea: 160 },
    { type: 'kitchen', minArea: 80, maxArea: 150 },
    { type: 'living_room', minArea: 150, maxArea: 300 }
  ])

  const handleGenerateClick = async () => {
    setError(null)

    const requirements = {
      mode,
      vastuEnabled,
      bedroomCount: mode === 'basic' ? bedroomCount : undefined,
      hasKitchen: mode === 'basic' ? hasKitchen : undefined,
      hasLivingRoom: mode === 'basic' ? hasLivingRoom : undefined,
      hasDiningRoom: mode === 'basic' ? hasDiningRoom : undefined,
      rooms: mode === 'advanced' ? advancedRooms : undefined
    }

    // Validate requirements
    if (mode === 'basic') {
      if (bedroomCount < 1) {
        setError('Bedroom count must be at least 1')
        return
      }
      if (!hasKitchen && !hasLivingRoom) {
        setError('Must select at least kitchen or living room')
        return
      }
    }

    if (mode === 'advanced' && advancedRooms.length === 0) {
      setError('Add at least one room in advanced mode')
      return
    }

    // Call parent handler with requirements
    onGenerate(requirements)
  }

  const addAdvancedRoom = () => {
    setAdvancedRooms([
      ...advancedRooms,
      { type: 'bedroom', minArea: 90, maxArea: 160 }
    ])
  }

  const removeAdvancedRoom = (idx) => {
    setAdvancedRooms(advancedRooms.filter((_, i) => i !== idx))
  }

  const updateAdvancedRoom = (idx, field, value) => {
    const updated = [...advancedRooms]
    updated[idx] = { ...updated[idx], [field]: value }
    setAdvancedRooms(updated)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Room Configuration</h2>
          <p className="text-slate-600">Configure your room requirements for layout generation</p>
        </div>

        {/* Mode Selection */}
        <div className="mb-8 pb-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Configuration Mode</h3>
          <div className="flex gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                value="basic"
                checked={mode === 'basic'}
                onChange={(e) => setMode(e.target.value)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="ml-2 text-slate-700">Basic (Simple)</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                value="advanced"
                checked={mode === 'advanced'}
                onChange={(e) => setMode(e.target.value)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="ml-2 text-slate-700">Advanced (Detailed)</span>
            </label>
          </div>
        </div>

        {/* Vastu Toggle */}
        <div className="mb-8 pb-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Vastu Compliance</h3>
              <p className="text-sm text-slate-600 mt-1">
                {vastuEnabled
                  ? 'Layout will be optimized for Vastu Shastra principles'
                  : 'Layout optimization disabled'}
              </p>
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={vastuEnabled}
                onChange={(e) => setVastuEnabled(e.target.checked)}
                className="w-5 h-5 text-blue-600"
              />
              <span className="ml-2 text-slate-700 font-medium">
                {vastuEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </label>
          </div>
        </div>

        {/* Basic Mode */}
        {mode === 'basic' && (
          <div className="mb-8 space-y-6">
            {/* Bedrooms Slider */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                Number of Bedrooms: {bedroomCount}
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={bedroomCount}
                onChange={(e) => setBedroomCount(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-xs text-slate-600 mt-1">
                <span>1 BR</span>
                <span>5 BR</span>
              </div>
            </div>

            {/* Amenities Toggles */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-3">Amenities</h4>
              <div className="space-y-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasKitchen}
                    onChange={(e) => setHasKitchen(e.target.checked)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-2 text-slate-700">Kitchen</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasLivingRoom}
                    onChange={(e) => setHasLivingRoom(e.target.checked)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-2 text-slate-700">Living Room</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasDiningRoom}
                    onChange={(e) => setHasDiningRoom(e.target.checked)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-2 text-slate-700">Dining Room</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Advanced Mode */}
        {mode === 'advanced' && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Custom Rooms</h3>
              <Button
                variant="secondary"
                size="sm"
                onClick={addAdvancedRoom}
              >
                + Add Room
              </Button>
            </div>

            <div className="space-y-4">
              {advancedRooms.map((room, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                    <select
                      value={room.type}
                      onChange={(e) => updateAdvancedRoom(idx, 'type', e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="master_bedroom">Master Bedroom</option>
                      <option value="bedroom">Bedroom</option>
                      <option value="kitchen">Kitchen</option>
                      <option value="living_room">Living Room</option>
                      <option value="dining_room">Dining Room</option>
                      <option value="bathroom">Bathroom</option>
                      <option value="pooja">Pooja</option>
                      <option value="balcony">Balcony</option>
                    </select>

                    <input
                      type="number"
                      placeholder="Min area"
                      value={room.minArea}
                      onChange={(e) => updateAdvancedRoom(idx, 'minArea', parseInt(e.target.value))}
                      className="px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <input
                      type="number"
                      placeholder="Max area"
                      value={room.maxArea}
                      onChange={(e) => updateAdvancedRoom(idx, 'maxArea', parseInt(e.target.value))}
                      className="px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <button
                      onClick={() => removeAdvancedRoom(idx)}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Generate Button */}
        <Button
          onClick={handleGenerateClick}
          disabled={isLoading}
          size="lg"
          className="w-full"
        >
          {isLoading ? 'Generating...' : 'Generate Layouts'}
        </Button>
      </div>
    </div>
  )
}
