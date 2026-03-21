// filepath: src/pages/DashboardPage.jsx
// Purpose: Dashboard page — project grid with create, delete, and search.

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth.js'
import useProject from '../hooks/useProject.js'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { projects = [], isLoading, error, fetchProjects, removeProject, createNewProject } = useProject()

  const [showCreate, setShowCreate] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [creatingProject, setCreatingProject] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchProjects?.()
  }, [fetchProjects])

  const filteredProjects = projects.filter((p) =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return
    setCreatingProject(true)
    try {
      await createNewProject(newProjectName.trim())
      setNewProjectName('')
      setShowCreate(false)
      await fetchProjects?.()
    } finally {
      setCreatingProject(false)
    }
  }

  const handleCreateKeyDown = (e) => {
    if (e.key === 'Enter') handleCreateProject()
  }

  const handleDeleteProject = async (id) => {
    setDeletingId(id)
    try {
      await removeProject?.(id)
      await fetchProjects?.()
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="h-screen bg-[#0a0a0c] flex flex-col font-[Inter,system-ui,sans-serif] text-[#f0ede8]">

      {/* Header */}
      <header className="h-14 flex items-center justify-between px-6 border-b border-white/[0.05] bg-[#0f0f12] flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7">
            <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
              <rect x="4" y="4" width="28" height="28" stroke="#d4a832" strokeWidth="1.5" fill="none" />
              <rect x="4" y="4" width="14" height="14" stroke="#d4a832" strokeWidth="1" fill="rgba(212,168,50,0.08)" />
              <rect x="18" y="4" width="14" height="28" stroke="#d4a832" strokeWidth="1" fill="rgba(212,168,50,0.04)" />
              <rect x="4" y="18" width="14" height="14" stroke="#d4a832" strokeWidth="1" fill="rgba(212,168,50,0.04)" />
            </svg>
          </div>
          <span className="font-serif text-base font-normal text-[#f0ede8]">
            ArchGen<span className="text-[#d4a832] italic"> AI</span>
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm text-[#9d9a94]">
          <span>{user?.email}</span>
          <button
            onClick={logout}
            className="bg-transparent border-none text-[#5a5855] cursor-pointer text-sm transition-colors hover:text-[#d4a832]"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 overflow-auto p-8">

        {/* Page header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-normal text-[#f0ede8] mb-2">Projects</h1>
            <p className="text-sm text-[#5a5855]">Manage your architectural floor plans</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-[#d4a832] text-[#0a0a0c] border-none rounded-lg px-5 py-2.5 text-sm font-semibold cursor-pointer transition-all hover:bg-[#f0c84a] hover:shadow-[0_0_24px_rgba(212,168,50,0.35)]"
          >
            + New Project
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-xs bg-[#141418] border border-white/[0.06] rounded-lg px-4 py-2.5 text-sm text-[#f0ede8] placeholder:text-[#5a5855] outline-none transition-all focus:border-[#d4a832] focus:shadow-[0_0_0_3px_rgba(212,168,50,0.1)]"
          />
        </div>

        {/* Loading / error / empty / grid */}
        {isLoading ? (
          <div className="text-center py-12 text-[#5a5855]">Loading projects...</div>
        ) : error ? (
          <div className="bg-[rgba(224,82,82,0.08)] border border-[rgba(224,82,82,0.2)] rounded-lg p-4 text-[#e05252] mb-6">
            {error}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12 text-[#5a5855]">
            <p className="text-base mb-2">No projects yet</p>
            <p className="text-sm">Create a new project to get started</p>
          </div>
        ) : (
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(`/editor/${project.id}`)}
                className="bg-[#141418] border border-white/[0.06] rounded-xl overflow-hidden cursor-pointer transition-all hover:border-[#d4a832] hover:shadow-[0_0_24px_rgba(212,168,50,0.15)]"
              >
                {/* Thumbnail */}
                <div
                  className="bg-[#0f0f12] flex items-center justify-center p-4"
                  style={{
                    aspectRatio: '4/3',
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                  }}
                >
                  <svg viewBox="0 0 100 80" fill="none" className="w-full h-full opacity-60">
                    <rect x="4" y="4" width="92" height="72" stroke="#d4a832" strokeWidth="1.5" fill="none" />
                    <rect x="4" y="4" width="45" height="35" stroke="#d4a832" strokeWidth="0.8" fill="rgba(212,168,50,0.04)" />
                    <rect x="49" y="4" width="47" height="35" stroke="#d4a832" strokeWidth="0.8" fill="rgba(212,168,50,0.04)" />
                    <rect x="4" y="39" width="92" height="37" stroke="#d4a832" strokeWidth="0.8" fill="rgba(212,168,50,0.03)" />
                  </svg>
                </div>

                {/* Info */}
                <div className="p-4 border-t border-white/[0.04]">
                  <h3 className="text-sm font-medium text-[#f0ede8] mb-1.5 break-words">{project.name}</h3>
                  <p className="text-xs text-[#5a5855] mb-3">
                    {new Date(project.updated_at || project.created_at).toLocaleDateString()}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteProject(project.id)
                    }}
                    disabled={deletingId === project.id}
                    className="w-full bg-transparent border border-[rgba(224,82,82,0.2)] text-[#e05252] rounded-md px-3 py-1.5 text-xs cursor-pointer transition-all hover:bg-[rgba(224,82,82,0.08)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingId === project.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create project modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#141418] rounded-xl border border-white/[0.06] p-8 w-full max-w-sm shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_25px_50px_rgba(0,0,0,0.5)]">
            <h2 className="font-serif text-xl font-normal text-[#f0ede8] mb-4">Create New Project</h2>

            <input
              type="text"
              placeholder="Project name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={handleCreateKeyDown}
              disabled={creatingProject}
              className="w-full bg-[#0f0f12] border border-white/[0.07] rounded-lg px-4 py-3 text-sm text-[#f0ede8] placeholder:text-[#3a3835] outline-none transition-all focus:border-[#d4a832] focus:shadow-[0_0_0_3px_rgba(212,168,50,0.1)] mb-4 disabled:opacity-50"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowCreate(false)}
                disabled={creatingProject}
                className="flex-1 bg-transparent border border-white/[0.07] text-[#5a5855] rounded-lg px-4 py-2.5 text-sm font-semibold cursor-pointer transition-colors hover:text-[#9d9a94] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!newProjectName.trim() || creatingProject}
                className="flex-1 bg-[#d4a832] border-none text-[#0a0a0c] rounded-lg px-4 py-2.5 text-sm font-semibold cursor-pointer transition-all hover:bg-[#f0c84a] hover:shadow-[0_0_24px_rgba(212,168,50,0.35)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingProject ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}