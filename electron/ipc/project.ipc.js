// filepath: electron/ipc/project.ipc.js
// Purpose: IPC handlers for project file operations — save dialog, open dialog, PNG export.

const { dialog, app } = require('electron')
const fs = require('fs')
const path = require('path')

function registerProjectIpc(ipcMain) {
  // Save project JSON to disk via native save dialog
  ipcMain.handle('project:save-file', async (event, data) => {
    const { filePath, canceled } = await dialog.showSaveDialog({
      title: 'Save ArchGen Project',
      defaultPath: path.join(app.getPath('documents'), 'my-project.archgen'),
      filters: [{ name: 'ArchGen Project', extensions: ['archgen'] }],
    })

    if (canceled || !filePath) return { success: false, message: 'Save cancelled' }

    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
      return { success: true, filePath }
    } catch (err) {
      return { success: false, message: err.message }
    }
  })

  // Open project JSON from disk via native open dialog
  ipcMain.handle('project:open-file', async () => {
    const { filePaths, canceled } = await dialog.showOpenDialog({
      title: 'Open ArchGen Project',
      filters: [{ name: 'ArchGen Project', extensions: ['archgen'] }],
      properties: ['openFile'],
    })

    if (canceled || filePaths.length === 0) return { success: false, message: 'Open cancelled' }

    try {
      const content = fs.readFileSync(filePaths[0], 'utf-8')
      return { success: true, data: JSON.parse(content) }
    } catch (err) {
      return { success: false, message: err.message }
    }
  })

  // Export floor plan as PNG via native save dialog
  ipcMain.handle('project:export-png', async (event, { dataUrl, filename }) => {
    const { filePath, canceled } = await dialog.showSaveDialog({
      title: 'Export Floor Plan as PNG',
      defaultPath: path.join(app.getPath('documents'), filename || 'floor-plan.png'),
      filters: [{ name: 'PNG Image', extensions: ['png'] }],
    })

    if (canceled || !filePath) return { success: false, message: 'Export cancelled' }

    try {
      // Strip data URL prefix to get raw base64
      const base64 = dataUrl.replace(/^data:image\/png;base64,/, '')
      fs.writeFileSync(filePath, Buffer.from(base64, 'base64'))
      return { success: true, filePath }
    } catch (err) {
      return { success: false, message: err.message }
    }
  })
}

module.exports = { registerProjectIpc }
