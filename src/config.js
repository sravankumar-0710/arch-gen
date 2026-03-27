// filepath: src/config.js
// Purpose: Centralizes all environment variable reads for the frontend.
// All env vars come from import.meta.env — never hardcoded anywhere else.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

if (!API_BASE_URL) {
  throw new Error('VITE_API_BASE_URL is not set. Check your .env file.')
}

export const CONFIG = {
  API_BASE_URL,
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0-mvp',
}