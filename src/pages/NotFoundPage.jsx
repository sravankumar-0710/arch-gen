// filepath: src/pages/NotFoundPage.jsx
// Purpose: 404 error page for undefined routes.

import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center px-4 font-[Inter,system-ui,sans-serif]">
      <div className="text-center">
        <p className="text-7xl font-serif font-normal text-[#d4a832] mb-4">404</p>
        <h1 className="text-xl font-semibold text-[#f0ede8] mb-2">Page not found</h1>
        <p className="text-sm text-[#5a5855] mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-[#d4a832] text-[#0a0a0c] rounded-lg text-sm font-semibold no-underline transition-all hover:bg-[#f0c84a] hover:shadow-[0_0_24px_rgba(212,168,50,0.35)]"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}