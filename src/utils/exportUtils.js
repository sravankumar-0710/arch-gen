// filepath: src/utils/exportUtils.js
// Purpose: Floor plan PNG export logic — uses Konva stage or canvas element to produce a data URL.

/**
 * Exports a Konva stage as a PNG data URL.
 *
 * @param {import('konva/lib/Stage').Stage} stage - Konva Stage instance
 * @param {object} options
 * @param {number} [options.pixelRatio=2] - Export resolution multiplier
 * @returns {string} PNG data URL
 */
export function exportStageAsPng(stage, options = {}) {
  const { pixelRatio = 2 } = options
  return stage.toDataURL({ pixelRatio, mimeType: 'image/png' })
}

/**
 * Triggers a browser download of a PNG data URL.
 * Used as fallback in browser (non-Electron) environments.
 *
 * @param {string} dataUrl
 * @param {string} filename
 */
export function downloadPng(dataUrl, filename = 'floor-plan.png') {
  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Saves a PNG via Electron's native file dialog (desktop app).
 * Falls back to browser download if Electron API is not available.
 *
 * @param {string} dataUrl
 * @param {string} filename
 */
export async function savePng(dataUrl, filename = 'floor-plan.png') {
  if (window.electronAPI?.exportPng) {
    const result = await window.electronAPI.exportPng(dataUrl, filename)
    return result
  }
  // Fallback: browser download
  downloadPng(dataUrl, filename)
  return { success: true }
}
