// filepath: src/components/projects/ProjectCard.jsx
// Purpose: Card component for displaying a single project with edit/delete actions

import { useNavigate } from 'react-router-dom'
import LayoutPreview from '../layout-results/LayoutPreview.jsx'

export default function ProjectCard({ project, onEdit, onDelete }) {
  const navigate = useNavigate()

  const handleEdit = () => {
    onEdit(project)
  }

  const handleViewEditor = () => {
    navigate(`/editor/${project.id}`)
  }

  const handleDelete = () => {
    onDelete(project)
  }

  // Format date (created_at timestamp to readable date)
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const hasLandData = project.land_data && Object.keys(project.land_data).length > 0
  const hasLayout = project.layout && Object.keys(project.layout).length > 0

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition border border-slate-200 overflow-hidden flex flex-col h-full">
      {/* Layout Thumbnail (if available) */}
      {hasLayout && (
        <div className="h-48 bg-slate-50 border-b border-slate-200 p-2">
          <LayoutPreview
            layout={project.layout}
            width={260}
            height={180}
            showLabels={false}
          />
        </div>
      )}

      {/* Card Header */}
      <div className="p-6 border-b border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-2">{project.name}</h3>
        {project.description && (
          <p className="text-sm text-slate-600 line-clamp-2">{project.description}</p>
        )}
      </div>

      {/* Card Body */}
      <div className="p-6 bg-slate-50 space-y-3 flex-grow">
        <div className="flex justify-between text-xs text-slate-600">
          <span>Created: {formatDate(project.created_at)}</span>
        </div>
        {project.updated_at && (
          <div className="flex justify-between text-xs text-slate-600">
            <span>Updated: {formatDate(project.updated_at)}</span>
          </div>
        )}

        {/* Status Indicators */}
        <div className="pt-2 space-y-2">
          {hasLandData && (
            <div className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
              [Land Data Saved]
            </div>
          )}
          {hasLayout && (
            <div className="inline-block px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium ml-2">
              [Layout Generated]
            </div>
          )}
          {!hasLandData && !hasLayout && (
            <div className="inline-block px-2 py-1 bg-slate-200 text-slate-700 rounded text-xs font-medium">
              [Not Started]
            </div>
          )}
        </div>

        {/* Score Badge (if layout exists) */}
        {hasLayout && project.layout.score !== undefined && (
          <div className="pt-2">
            <div
              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                project.layout.score >= 80
                  ? 'bg-green-50 text-green-700'
                  : project.layout.score >= 60
                    ? 'bg-yellow-50 text-yellow-700'
                    : 'bg-red-50 text-red-700'
              }`}
            >
              Vastu Score: {project.layout.score.toFixed(1)}%
            </div>
          </div>
        )}
      </div>

      {/* Card Footer - Actions */}
      <div className="px-6 py-4 flex gap-2 bg-white border-t border-slate-200">
        <button
          onClick={handleViewEditor}
          className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded border border-blue-200 hover:bg-blue-100 transition text-sm font-medium"
        >
          {hasLayout ? 'Re-Generate' : 'Edit Layout'}
        </button>
        <button
          onClick={handleEdit}
          className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 rounded border border-slate-200 hover:bg-slate-200 transition text-sm font-medium"
        >
          Project Info
        </button>
        <button
          onClick={handleDelete}
          className="flex-1 px-3 py-2 bg-red-50 text-red-700 rounded border border-red-200 hover:bg-red-100 transition text-sm font-medium"
        >
          Delete
        </button>
      </div>
    </div>
  )
}
