// filepath: vite.config.js
// Purpose: Root Vite config — sets src/ as root so index.html, main.jsx
// and postcss.config.js are all resolved from src/ correctly.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  root: 'src',
  plugins: [react()],
  server: {
    port: 5182,
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
})