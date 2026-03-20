// filepath: src/main.jsx
// Purpose: React application entry point — mounts the root component

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css'
import useAuthStore from './store/authStore.js'

// Initialize auth on app startup (load user from token)
useAuthStore.getState().loadUser()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
