// filepath: src/components/projects/DeleteConfirmDialog.jsx
// Purpose: Confirmation dialog before deleting a project

import { useState } from 'react'
import useProject from '../../hooks/useProject.js'
import Button from '../common/Button.jsx'

export default function DeleteConfirmDialog({ project, onSuccess, onCancel }) {
  const [error, setError] = useState(null)
  const { removeProject } = useProject()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setError(null)
    setIsDeleting(true)

    try {
      await removeProject(project.id)
      onSuccess()
    } catch (err) {
      setError(err.message || 'Failed to delete project')
      setIsDeleting(false)
    }
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isDeleting) {
      onCancel()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        {/* Warning Icon & Title */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-red-600">!</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Delete Project?</h2>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Confirmation Message */}
        <div className="mb-6 text-center">
          <p className="text-slate-600 mb-2">
            Are you sure you want to delete <strong>"{project.name}"</strong>?
          </p>
          <p className="text-sm text-slate-500">This action cannot be undone.</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Cancel
          </button>
          <Button
            onClick={handleDelete}
            variant="danger"
            disabled={isDeleting}
            isLoading={isDeleting}
            className="flex-1"
          >
            Delete Project
          </Button>
        </div>
      </div>
    </div>
  )
}
