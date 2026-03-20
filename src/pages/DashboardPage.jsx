// filepath: src/pages/DashboardPage.jsx
// Purpose: Dashboard page — project grid with architectural dark UI

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

  const filteredProjects = projects.filter(p =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateProject = async (e) => {
    e.preventDefault()
    if (!newProjectName.trim()) return

    setCreatingProject(true)
    try {
      const project = await createNewProject(newProjectName.trim())
      setNewProjectName('')
      setShowCreate(false)
      await fetchProjects?.()
    } finally {
      setCreatingProject(false)
    }
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
    <div style={{
      backgroundColor: '#0a0a0c',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Inter, system-ui, sans-serif',
      color: '#f0ede8'
    }}>
      {/* Header */}
      <header style={{
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: '24px',
        paddingRight: '24px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        backgroundColor: '#0f0f12',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '28px', height: '28px' }}>
              <svg viewBox="0 0 36 36" fill="none" style={{ width: '100%', height: '100%' }}>
                <rect x="4" y="4" width="28" height="28" stroke="#d4a832" strokeWidth="1.5" fill="none"/>
                <rect x="4" y="4" width="14" height="14" stroke="#d4a832" strokeWidth="1" fill="rgba(212,168,50,0.08)"/>
                <rect x="18" y="4" width="14" height="28" stroke="#d4a832" strokeWidth="1" fill="rgba(212,168,50,0.04)"/>
                <rect x="4" y="18" width="14" height="14" stroke="#d4a832" strokeWidth="1" fill="rgba(212,168,50,0.04)"/>
              </svg>
            </div>
            <span style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: '16px',
              fontWeight: '400',
              color: '#f0ede8'
            }}>
              ArchGen<span style={{ color: '#d4a832', fontStyle: 'italic' }}> AI</span>
            </span>
          </div>
        </div>

        {/* User menu */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          fontSize: '13px',
          color: '#9d9a94'
        }}>
          <span>{user?.email}</span>
          <button
            onClick={() => logout()}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#5a5855',
              cursor: 'pointer',
              fontSize: '13px',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.color = '#d4a832'}
            onMouseLeave={(e) => e.target.style.color = '#5a5855'}
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Main content */}
      <main style={{
        flex: 1,
        overflow: 'auto',
        padding: '32px 24px'
      }}>
        {/* Page header */}
        <div style={{
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h1 style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: '32px',
              fontWeight: '400',
              margin: '0 0 8px 0',
              color: '#f0ede8'
            }}>Projects</h1>
            <p style={{
              fontSize: '14px',
              color: '#5a5855',
              margin: 0
            }}>Manage your architectural floor plans</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            style={{
              backgroundColor: '#d4a832',
              color: '#0a0a0c',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f0c84a'
              e.target.style.boxShadow = '0 0 24px rgba(212,168,50,0.35)'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#d4a832'
              e.target.style.boxShadow = 'none'
            }}
          >
            + New Project
          </button>
        </div>

        {/* Search */}
        <div style={{ marginBottom: '24px' }}>
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              maxWidth: '300px',
              backgroundColor: '#141418',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '8px',
              padding: '10px 16px',
              fontSize: '14px',
              color: '#f0ede8',
              boxSizing: 'border-box',
              outline: 'none',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#d4a832'
              e.target.style.boxShadow = '0 0 0 3px rgba(212,168,50,0.1)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255,255,255,0.06)'
              e.target.style.boxShadow = 'none'
            }}
          />
        </div>

        {/* Projects grid */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: '#5a5855' }}>
            Loading projects...
          </div>
        ) : error ? (
          <div style={{
            backgroundColor: 'rgba(224,82,82,0.08)',
            border: '1px solid rgba(224,82,82,0.2)',
            borderRadius: '8px',
            padding: '16px',
            color: '#e05252',
            marginBottom: '24px'
          }}>
            {error}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '48px 24px',
            color: '#5a5855'
          }}>
            <p style={{ fontSize: '16px', marginBottom: '8px' }}>No projects yet</p>
            <p style={{ fontSize: '14px' }}>Create a new project to get started</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '16px'
          }}>
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(`/editor/${project.id}`)}
                style={{
                  backgroundColor: '#141418',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#d4a832'
                  e.currentTarget.style.boxShadow = '0 0 24px rgba(212,168,50,0.15)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {/* Preview area */}
                <div style={{
                  aspectRatio: '4 / 3',
                  backgroundColor: '#0f0f12',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                  padding: '16px'
                }}>
                  <svg viewBox="0 0 100 80" fill="none" style={{ width: '100%', height: '100%', opacity: 0.6 }}>
                    <rect x="4" y="4" width="92" height="72" stroke="#d4a832" strokeWidth="1.5" fill="none"/>
                    <rect x="4" y="4" width="45" height="35" stroke="#d4a832" strokeWidth="0.8" fill="rgba(212,168,50,0.04)"/>
                    <rect x="49" y="4" width="47" height="35" stroke="#d4a832" strokeWidth="0.8" fill="rgba(212,168,50,0.04)"/>
                    <rect x="4" y="39" width="92" height="37" stroke="#d4a832" strokeWidth="0.8" fill="rgba(212,168,50,0.03)"/>
                  </svg>
                </div>

                {/* Project info */}
                <div style={{
                  padding: '16px',
                  borderTop: '1px solid rgba(255,255,255,0.04)'
                }}>
                  <h3 style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#f0ede8',
                    margin: '0 0 6px 0',
                    wordBreak: 'break-word'
                  }}>
                    {project.name}
                  </h3>
                  <p style={{
                    fontSize: '12px',
                    color: '#5a5855',
                    margin: 0
                  }}>
                    {new Date(project.updated_at || project.created_at).toLocaleDateString()}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteProject(project.id)
                    }}
                    disabled={deletingId === project.id}
                    style={{
                      marginTop: '10px',
                      width: '100%',
                      backgroundColor: 'transparent',
                      border: '1px solid rgba(224,82,82,0.2)',
                      color: '#e05252',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      opacity: deletingId === project.id ? 0.5 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (deletingId !== project.id) {
                        e.target.style.backgroundColor = 'rgba(224,82,82,0.08)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent'
                    }}
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
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#141418',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.06)',
            padding: '32px',
            width: '100%',
            maxWidth: '400px',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 25px 50px rgba(0,0,0,0.5)'
          }}>
            <h2 style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: '20px',
              fontWeight: '400',
              margin: '0 0 16px 0',
              color: '#f0ede8'
            }}>Create New Project</h2>

            <form onSubmit={handleCreateProject}>
              <input
                type="text"
                placeholder="Project name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                disabled={creatingProject}
                style={{
                  width: '100%',
                  backgroundColor: '#0f0f12',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontSize: '14px',
                  color: '#f0ede8',
                  boxSizing: 'border-box',
                  marginBottom: '16px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  opacity: creatingProject ? 0.5 : 1
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#d4a832'
                  e.target.style.boxShadow = '0 0 0 3px rgba(212,168,50,0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.07)'
                  e.target.style.boxShadow = 'none'
                }}
              />

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  disabled={creatingProject}
                  style={{
                    flex: 1,
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(255,255,255,0.07)',
                    color: '#5a5855',
                    borderRadius: '8px',
                    padding: '10px 16px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    opacity: creatingProject ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#9d9a94'}
                  onMouseLeave={(e) => e.target.style.color = '#5a5855'}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newProjectName.trim() || creatingProject}
                  style={{
                    flex: 1,
                    backgroundColor: '#d4a832',
                    border: 'none',
                    color: '#0a0a0c',
                    borderRadius: '8px',
                    padding: '10px 16px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: creatingProject ? 'wait' : 'pointer',
                    transition: 'all 0.2s ease',
                    opacity: !newProjectName.trim() || creatingProject ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (newProjectName.trim() && !creatingProject) {
                      e.target.style.backgroundColor = '#f0c84a'
                      e.target.style.boxShadow = '0 0 24px rgba(212,168,50,0.35)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#d4a832'
                    e.target.style.boxShadow = 'none'
                  }}
                >
                  {creatingProject ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
