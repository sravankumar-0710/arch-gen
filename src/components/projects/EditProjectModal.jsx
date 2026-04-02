// filepath: src/components/projects/EditProjectModal.jsx
// Purpose: Modal dialog to edit project name and description

import React, { useState, useEffect } from 'react'
import useProject from '../../hooks/useProject.js'
import Button from '../common/Button.jsx'

export default function EditProjectModal({ project, onSuccess, onCancel }) {
  const [name, setName] = useState(project.name || '')
  const [description, setDescription] = useState(project.description || '')
  const [error, setError] = useState(null)
  const { saveCurrentProject, isSaving } = useProject()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Project name is required')
      return
    }

    try {
      // Call saveCurrentProject with updated data
      // Note: first need to ensure currentProject is set
      await saveCurrentProject({
        name,
        description,
      })
      onSuccess()
    } catch (err) {
      setError(err.message || 'Failed to update project')
    }
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Edit Project</h2>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Project Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSaving}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Project Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSaving}
              placeholder="Add notes about this project..."
              rows="3"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none disabled:bg-slate-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Cancel
            </button>
            <Button
              type="submit"
              disabled={isSaving || !name.trim()}
              isLoading={isSaving}
              className="flex-1"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
