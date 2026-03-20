// filepath: electron/ipc/auth.ipc.js
// Purpose: IPC handlers for authentication-related native operations.
// Auth tokens are stored and managed by the frontend; this file handles any OS-level auth needs.

const { app } = require('electron')

function registerAuthIpc(ipcMain) {
  // Future: Secure credential storage via OS keychain
  // For MVP, auth is handled entirely via HTTP + localStorage in the renderer

  ipcMain.handle('app:version', () => {
    return app.getVersion()
  })
}

module.exports = { registerAuthIpc }
