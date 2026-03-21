// filepath: src/pages/DashboardPage.jsx
// Purpose: Dashboard — Linear-style sidebar layout with project grid and stats.

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth.js'
import useProject from '../hooks/useProject.js'

// ── Icons (inline SVG helpers) ──────────────────────────────────────────────
const Icon = {
  grid:    <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="1" width="5.5" height="5.5" rx="1" fill="currentColor" opacity=".8"/><rect x="8.5" y="1" width="5.5" height="5.5" rx="1" fill="currentColor" opacity=".5"/><rect x="1" y="8.5" width="5.5" height="5.5" rx="1" fill="currentColor" opacity=".5"/><rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1" fill="currentColor" opacity=".3"/></svg>,
  layers:  <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 1.5l6 3-6 3-6-3 6-3z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/><path d="M1.5 10l6 3 6-3M1.5 7.5l6 3 6-3" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>,
  settings:<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.2"/><path d="M7.5 1v2M7.5 12v2M1 7.5h2M12 7.5h2M2.9 2.9l1.4 1.4M10.7 10.7l1.4 1.4M2.9 12.1l1.4-1.4M10.7 4.3l1.4-1.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
  plus:    <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 2v9M2 6.5h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  search:  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2"/><path d="M9.5 9.5l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  check:   <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  logout:  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 7h7M9.5 4.5L12 7l-2.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 2H3a1 1 0 00-1 1v8a1 1 0 001 1h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
  trash:   <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 3.5h9M5 3.5V2.5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v1M5.5 6v4M7.5 6v4M3 3.5l.7 7a1 1 0 001 .9h3.6a1 1 0 001-.9l.7-7" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  open:    <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M5.5 2H2a1 1 0 00-1 1v8a1 1 0 001 1h8a1 1 0 001-1V7.5M8 1h4m0 0v4m0-4L5.5 7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
}

const NAV = [
  { key: 'projects',  label: 'Projects',  icon: Icon.grid },
  { key: 'templates', label: 'Templates', icon: Icon.layers },
  { key: 'settings',  label: 'Settings',  icon: Icon.settings },
]

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { projects = [], isLoading, error, fetchProjects, removeProject, createNewProject } = useProject()

  const [activeNav,       setActiveNav]       = useState('projects')
  const [showCreate,      setShowCreate]      = useState(false)
  const [newName,         setNewName]         = useState('')
  const [creating,        setCreating]        = useState(false)
  const [deletingId,      setDeletingId]      = useState(null)
  const [search,          setSearch]          = useState('')

  useEffect(() => { fetchProjects?.() }, [fetchProjects])

  const filtered = projects.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = async () => {
    if (!newName.trim()) return
    setCreating(true)
    try {
      await createNewProject(newName.trim())
      setNewName(''); setShowCreate(false)
      await fetchProjects?.()
    } finally { setCreating(false) }
  }

  const handleDelete = async (id) => {
    setDeletingId(id)
    try { await removeProject?.(id); await fetchProjects?.() }
    finally { setDeletingId(null) }
  }

  const initial = user?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <div className="h-screen flex bg-ink-950 font-sans text-ink-50 overflow-hidden">

      {/* ════════════════ SIDEBAR ════════════════ */}
      <aside className="w-56 flex-shrink-0 flex flex-col bg-ink-900 border-r border-ink-700/40">

        {/* Logo */}
        <div className="h-[52px] flex items-center gap-2.5 px-4 border-b border-ink-700/40">
          <div className="w-6 h-6 rounded-md bg-accent-600/20 border border-accent-500/30 flex items-center justify-center shrink-0">
            <svg width="13" height="13" viewBox="0 0 18 18" fill="none">
              <rect x="1" y="1" width="7" height="7" rx="1.5" fill="rgba(99,102,241,0.7)"/>
              <rect x="10" y="1" width="7" height="7" rx="1.5" fill="rgba(99,102,241,0.5)"/>
              <rect x="1" y="10" width="7" height="7" rx="1.5" fill="rgba(99,102,241,0.5)"/>
              <rect x="10" y="10" width="7" height="7" rx="1.5" fill="rgba(99,102,241,0.25)"/>
            </svg>
          </div>
          <span className="text-[13px] font-bold text-ink-50 tracking-tight">ArchGen AI</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {NAV.map((item) => {
            const active = activeNav === item.key
            return (
              <button
                key={item.key}
                onClick={() => setActiveNav(item.key)}
                className={[
                  'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all border-none cursor-pointer text-left',
                  active
                    ? 'bg-accent-500/15 text-accent-300 border border-accent-500/20'
                    : 'bg-transparent text-ink-300 hover:bg-ink-800 hover:text-ink-100',
                ].join(' ')}
              >
                <span className={active ? 'text-accent-400' : 'text-ink-400'}>{item.icon}</span>
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* User */}
        <div className="p-2 border-t border-ink-700/40">
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-ink-800 transition-all group cursor-pointer">
            <div className="w-6 h-6 rounded-full bg-accent-600/30 border border-accent-500/30 flex items-center justify-center text-[10px] font-bold text-accent-300 shrink-0">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-ink-100 truncate leading-tight">{user?.email}</p>
              <p className="text-[10px] text-ink-400 leading-tight">Free plan</p>
            </div>
            <button
              onClick={logout}
              title="Sign out"
              className="opacity-0 group-hover:opacity-100 transition-opacity bg-transparent border-none text-ink-400 hover:text-red-400 cursor-pointer p-0.5"
            >
              {Icon.logout}
            </button>
          </div>
        </div>
      </aside>

      {/* ════════════════ MAIN ════════════════ */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <header className="h-[52px] flex items-center justify-between px-5 border-b border-ink-700/40 bg-ink-900/50 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="text-ink-400 text-[13px]">Workspace</span>
            <span className="text-ink-600 text-xs">/</span>
            <span className="text-[13px] font-semibold text-ink-100">Projects</span>
          </div>
          <div className="flex items-center gap-2.5">
            {/* Search */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">{Icon.search}</span>
              <input
                type="text"
                placeholder="Search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-48 h-8 pl-8 pr-3 bg-ink-800 border border-ink-600 rounded-lg text-[13px] text-ink-100 placeholder:text-ink-500 outline-none transition-all focus:border-accent-500 focus:ring-1 focus:ring-accent-500/20"
              />
            </div>
            {/* New project */}
            <button
              onClick={() => setShowCreate(true)}
              className="h-8 px-3.5 flex items-center gap-1.5 bg-accent-600 hover:bg-accent-500 text-white rounded-lg text-[13px] font-semibold border-none cursor-pointer transition-all hover:shadow-glow-sm active:scale-[0.97]"
            >
              {Icon.plus}
              New project
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-5">

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Total',       value: projects.length,                                                                                              color: 'text-ink-50' },
              { label: 'This month',  value: projects.filter(p => new Date(p.created_at) > new Date(Date.now() - 30*86400000)).length,                     color: 'text-accent-400' },
              { label: 'With layouts',value: projects.filter(p => p.layout).length,                                                                       color: 'text-emerald-400' },
              { label: 'In progress', value: projects.filter(p => p.land_data && !p.layout).length,                                                       color: 'text-amber-400' },
            ].map((s) => (
              <div key={s.label} className="bg-ink-800 border border-ink-700/60 rounded-xl p-4">
                <p className={`text-2xl font-bold ${s.color} leading-none mb-1`}>{s.value}</p>
                <p className="text-[12px] text-ink-400 font-medium">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Section header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[13px] font-semibold text-ink-200 uppercase tracking-wider">
              {search ? `Results for "${search}"` : 'All projects'}
            </h2>
            <span className="text-[12px] text-ink-500">{filtered.length} project{filtered.length !== 1 ? 's' : ''}</span>
          </div>

          {/* States */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20 gap-2.5 text-ink-400 text-sm">
              <span className="w-4 h-4 rounded-full border-2 border-ink-600 border-t-accent-500 animate-spin"/>
              Loading projects…
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-14 h-14 rounded-2xl bg-ink-800 border border-ink-700/60 flex items-center justify-center text-ink-500 mb-4 text-2xl">
                {Icon.grid}
              </div>
              <p className="text-[15px] font-semibold text-ink-200 mb-1">
                {search ? 'No projects found' : 'No projects yet'}
              </p>
              <p className="text-sm text-ink-400 mb-5 max-w-xs">
                {search ? 'Try a different search term' : 'Create your first project to generate an AI floor plan'}
              </p>
              {!search && (
                <button
                  onClick={() => setShowCreate(true)}
                  className="h-9 px-5 flex items-center gap-1.5 bg-accent-600 hover:bg-accent-500 text-white rounded-lg text-sm font-semibold border-none cursor-pointer transition-all"
                >
                  {Icon.plus} New project
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
              {filtered.map((project) => (
                <div
                  key={project.id}
                  onClick={() => navigate(`/editor/${project.id}`)}
                  className="bg-ink-800 border border-ink-700/60 rounded-xl overflow-hidden cursor-pointer transition-all hover:border-accent-500/40 hover:bg-ink-700/50 group"
                >
                  {/* Thumbnail */}
                  <div
                    className="h-32 bg-ink-900 flex items-center justify-center relative overflow-hidden"
                    style={{
                      backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.06) 1px, transparent 1px)',
                      backgroundSize: '16px 16px',
                    }}
                  >
                    <svg viewBox="0 0 80 60" fill="none" className="w-3/5 h-3/5 opacity-30 group-hover:opacity-50 transition-opacity">
                      <rect x="2" y="2" width="76" height="56" stroke="#6366f1" strokeWidth="1.2" fill="none"/>
                      <rect x="2" y="2" width="36" height="28" stroke="#6366f1" strokeWidth="0.7" fill="rgba(99,102,241,0.05)"/>
                      <rect x="38" y="2" width="40" height="28" stroke="#6366f1" strokeWidth="0.7" fill="rgba(99,102,241,0.05)"/>
                      <rect x="2" y="30" width="76" height="28" stroke="#6366f1" strokeWidth="0.7" fill="rgba(99,102,241,0.03)"/>
                    </svg>
                    {project.layout && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/25 rounded-md px-2 py-0.5">
                        <span className="text-emerald-400">{Icon.check}</span>
                        <span className="text-[10px] text-emerald-400 font-semibold">Ready</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3.5 border-t border-ink-700/50">
                    <p className="text-[13px] font-semibold text-ink-100 truncate mb-1">{project.name}</p>
                    <p className="text-[11px] text-ink-500 mb-3">
                      {new Date(project.updated_at || project.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/editor/${project.id}`) }}
                        className="flex-1 h-7 flex items-center justify-center gap-1.5 bg-accent-600/15 border border-accent-500/25 text-accent-400 rounded-lg text-[11px] font-semibold cursor-pointer transition-all hover:bg-accent-600/25"
                      >
                        {Icon.open} Open
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(project.id) }}
                        disabled={deletingId === project.id}
                        className="h-7 w-7 flex items-center justify-center bg-transparent border border-ink-600 text-ink-400 rounded-lg cursor-pointer transition-all hover:border-red-500/40 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {deletingId === project.id
                          ? <span className="w-3 h-3 rounded-full border border-ink-500 border-t-ink-300 animate-spin"/>
                          : Icon.trash
                        }
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* ════════════════ CREATE MODAL ════════════════ */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-ink-800 border border-ink-600 rounded-2xl p-6 w-full max-w-[360px] shadow-modal animate-scaleIn">
            <h2 className="text-base font-bold text-ink-50 mb-1">New project</h2>
            <p className="text-sm text-ink-400 mb-5">Give your project a name to get started</p>

            <input
              type="text"
              placeholder="e.g. My 2BHK Home"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              disabled={creating}
              autoFocus
              className="w-full h-10 px-3.5 bg-ink-900 border border-ink-600 rounded-lg text-sm text-ink-50 placeholder:text-ink-500 outline-none transition-all focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 mb-4 disabled:opacity-40"
            />

            <div className="flex gap-2.5">
              <button
                onClick={() => { setShowCreate(false); setNewName('') }}
                disabled={creating}
                className="flex-1 h-9 bg-transparent border border-ink-600 text-ink-300 rounded-lg text-[13px] font-semibold cursor-pointer transition-all hover:border-ink-500 hover:text-ink-100 disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newName.trim() || creating}
                className="flex-1 h-9 bg-accent-600 hover:bg-accent-500 text-white border-none rounded-lg text-[13px] font-semibold cursor-pointer transition-all hover:shadow-glow-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {creating ? 'Creating…' : 'Create project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}