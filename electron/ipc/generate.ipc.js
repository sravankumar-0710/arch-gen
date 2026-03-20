// filepath: electron/ipc/generate.ipc.js
// Purpose: IPC handlers for layout generation — proxies generation requests to the FastAPI backend.
// In MVP, generation is handled via HTTP from the renderer. This IPC is a future hook
// for offline/local generation if the backend is bundled with the Electron app.

function registerGenerateIpc(ipcMain) {
  // TODO(phase-5): Wire this to a bundled local FastAPI process for fully offline generation
  ipcMain.handle('generate:run', async (event, payload) => {
    // MVP: Generation goes through HTTP in the renderer via generatorService.js
    // This handler is a placeholder — the renderer calls the API directly for now
    return { success: false, message: 'Use HTTP API for generation in MVP' }
  })
}

module.exports = { registerGenerateIpc }
