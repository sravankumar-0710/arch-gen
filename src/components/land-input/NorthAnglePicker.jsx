// filepath: src/components/land-input/NorthAnglePicker.jsx
// Purpose: Set the north direction angle (0-360 degrees, clockwise from up)

import { useState } from 'react'
import useLandStore from '../../store/landStore.js'

export default function NorthAnglePicker() {
  const { northAngle, setNorthAngle, isClosed } = useLandStore()
  const [inputValue, setInputValue] = useState(northAngle.toString())

  // Disabled until polygon is fully closed
  const isDisabled = !isClosed

  const handleSliderChange = (e) => {
    const value = parseInt(e.target.value)
    setNorthAngle(value)
    setInputValue(value.toString())
  }

  const handleInputChange = (e) => {
    setInputValue(e.target.value)
  }

  const handleInputBlur = () => {
    let value = parseInt(inputValue)
    if (isNaN(value)) {
      value = 0
    } else {
      // Normalize to 0-359
      value = ((value % 360) + 360) % 360
    }
    setNorthAngle(value)
    setInputValue(value.toString())
  }

  const cardinalDirections = [
    { label: 'N', style: { top: '4px', left: '50%', transform: 'translateX(-50%)' } },
    { label: 'E', style: { right: '6px', top: '50%', transform: 'translateY(-50%)' } },
    { label: 'S', style: { bottom: '4px', left: '50%', transform: 'translateX(-50%)' } },
    { label: 'W', style: { left: '6px', top: '50%', transform: 'translateY(-50%)' } },
  ]

  return (
    <div className="bg-[#0f0f12] border border-white/[0.06] rounded-xl p-4 flex flex-col gap-4">

      {/* Visual compass */}
      <div className="flex justify-center">
        <div className="relative w-[120px] h-[120px] rounded-full border-2 border-white/10 bg-[rgba(15,15,18,0.8)] flex items-center justify-center">
          {/* North needle */}
          <div
            className="absolute w-[2px] h-[40px] bg-[#e05252] origin-bottom transition-transform duration-100 ease-out"
            style={{
              transform: `rotate(${northAngle}deg)`,
              bottom: '50%',
            }}
          />

          {/* Cardinal labels */}
          {cardinalDirections.map((dir) => (
            <div
              key={dir.label}
              className="absolute text-[11px] font-bold text-[#9d9a94]"
              style={dir.style}
            >
              {dir.label}
            </div>
          ))}

          {/* Center dot */}
          <div className="w-1.5 h-1.5 bg-[#d4a832] rounded-full z-10" />
        </div>
      </div>

      {/* Slider */}
      <input
        type="range"
        min="0"
        max="359"
        value={northAngle}
        onChange={handleSliderChange}
        disabled={isDisabled}
        className={`w-full h-1.5 rounded-[3px] bg-white/[0.08] outline-none accent-[#d4a832] ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      />

      {/* Numeric input */}
      <div className="flex gap-2 items-center">
        <input
          type="number"
          min="0"
          max="359"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          disabled={isDisabled}
          className={`flex-1 px-3 py-2 border border-white/[0.06] rounded-lg bg-[#141418] text-[#f0ede8] text-[13px] outline-none ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
        <span className="px-3 py-2 bg-[#141418] rounded-lg text-[13px] text-[#9d9a94] border border-white/[0.06]">
          °
        </span>
      </div>

      {/* Quick preset buttons */}
      <div className="grid grid-cols-4 gap-2">
        {[0, 90, 180, 270].map((angle) => (
          <button
            key={angle}
            onClick={() => {
              setNorthAngle(angle)
              setInputValue(angle.toString())
            }}
            disabled={isDisabled}
            className={[
              'py-2 px-3 rounded-lg text-xs transition-all',
              isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
              northAngle === angle
                ? 'border-2 border-[#d4a832] bg-[rgba(212,168,50,0.08)] text-[#d4a832] font-semibold'
                : 'border border-white/[0.06] bg-[#141418] text-[#9d9a94] hover:border-white/[0.12]',
            ].join(' ')}
          >
            {angle}°
          </button>
        ))}
      </div>

      {isDisabled && (
        <p className="text-[11px] text-[#5a5855] m-0 text-center">
          Close your polygon first to set the north angle
        </p>
      )}
    </div>
  )
}