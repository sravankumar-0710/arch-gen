// filepath: electron/preload.js
// Purpose: Preload script — exposes safe IPC channels to the renderer via contextBridge.
// The frontend NEVER calls Node.js APIs directly. All native operations go through this bridge.

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // --- Auth ---
  // No IPC needed for auth — handled by HTTP to FastAPI.
  // Placeholder for future native-auth needs.

  // --- Project ---
  // IPC channel format: 'domain:action'
  saveProjectFile: (data) => ipcRenderer.invoke('project:save-file', data),
  openProjectFile: () => ipcRenderer.invoke('project:open-file'),
  exportPng: (dataUrl, filename) => ipcRenderer.invoke('project:export-png', { dataUrl, filename }),

  // --- Generate ---
  runGenerate: (payload) => ipcRenderer.invoke('generate:run', payload),

  // --- App ---
  getAppVersion: () => ipcRenderer.invoke('app:version'),
})
