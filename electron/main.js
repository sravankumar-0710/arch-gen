// filepath: electron/main.js
// Purpose: Electron main process — creates the BrowserWindow and wires IPC handlers

const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

const isDev = process.env.NODE_ENV === 'development'

// Import IPC handler registrars
const { registerAuthIpc } = require('./ipc/auth.ipc')
const { registerProjectIpc } = require('./ipc/project.ipc')
const { registerGenerateIpc } = require('./ipc/generate.ipc')

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'hiddenInset',
    show: false,
  })

  // Load Vite dev server in development, built index.html in production
  if (isDev) {
    mainWindow.loadURL('http://localhost:5182')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // Show window once it's ready to prevent white flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })
}

app.whenReady().then(() => {
  createWindow()

  // Register all IPC handlers
  registerAuthIpc(ipcMain)
  registerProjectIpc(ipcMain)
  registerGenerateIpc(ipcMain)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
