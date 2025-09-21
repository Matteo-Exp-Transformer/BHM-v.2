import { useState } from 'react'
import { Department } from '../hooks/useDepartments'
import { Building2, Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'

interface DepartmentCardProps {
  department: Department
  onEdit: (department: Department) => void
  onDelete: (id: string) => void
  onToggleStatus: (id: string, isActive: boolean) => void
  isToggling?: boolean
  isDeleting?: boolean
}

export const DepartmentCard = ({
  department,
  onEdit,
  onDelete,
  onToggleStatus,
  isToggling = false,
  isDeleting = false,
}: DepartmentCardProps) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleToggleStatus = () => {
    onToggleStatus(department.id, !department.is_active)
  }

  const handleDelete = () => {
    onDelete(department.id)
    setShowDeleteConfirm(false)
  }

  return (
    <div
      className={`p-4 border rounded-lg transition-all duration-200 ${
        department.is_active
          ? 'border-gray-200 bg-white hover:shadow-md'
          : 'border-gray-300 bg-gray-50 opacity-75'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div
            className={`p-2 rounded-lg ${
              department.is_active
                ? 'bg-blue-100 text-blue-600'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            <Building2 className="h-5 w-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h4
                className={`text-sm font-semibold truncate ${
                  department.is_active ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                {department.name}
              </h4>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  department.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {department.is_active ? 'Attivo' : 'Inattivo'}
              </span>
            </div>

            {department.description && (
              <p
                className={`mt-1 text-sm truncate ${
                  department.is_active ? 'text-gray-600' : 'text-gray-400'
                }`}
              >
                {department.description}
              </p>
            )}

            <div className="mt-2 text-xs text-gray-400">
              Creato:{' '}
              {new Date(department.created_at).toLocaleDateString('it-IT')}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-1 ml-4">
          {/* Toggle Status */}
          <button
            type="button"
            onClick={handleToggleStatus}
            disabled={isToggling}
            className={`p-1.5 rounded-md transition-colors ${
              department.is_active
                ? 'text-green-600 hover:bg-green-50'
                : 'text-gray-400 hover:bg-gray-50'
            } disabled:opacity-50`}
            title={
              department.is_active ? 'Disattiva reparto' : 'Attiva reparto'
            }
          >
            {isToggling ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
            ) : department.is_active ? (
              <ToggleRight className="h-4 w-4" />
            ) : (
              <ToggleLeft className="h-4 w-4" />
            )}
          </button>

          {/* Edit */}
          <button
            type="button"
            onClick={() => onEdit(department)}
            className="p-1.5 rounded-md text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
            title="Modifica reparto"
          >
            <Edit2 className="h-4 w-4" />
          </button>

          {/* Delete */}
          {!showDeleteConfirm ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1.5 rounded-md text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
              title="Elimina reparto"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          ) : (
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 transition-colors"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Eliminando...' : 'Conferma'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DepartmentCard
