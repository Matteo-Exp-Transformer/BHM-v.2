import React, { useState, useEffect } from 'react'
import { X, Building2 } from 'lucide-react'
import { Department, DepartmentInput } from '../hooks/useDepartments'

interface AddDepartmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (input: DepartmentInput) => void
  department?: Department | null
  isLoading?: boolean
}

export const AddDepartmentModal = ({
  isOpen,
  onClose,
  onSubmit,
  department = null,
  isLoading = false,
}: AddDepartmentModalProps) => {
  const [formData, setFormData] = useState<DepartmentInput>({
    name: '',
    // description: '',
    is_active: true,
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  // Reset form when modal opens/closes or department changes
  useEffect(() => {
    if (isOpen) {
      if (department) {
        setFormData({
          name: department.name,
          // description: department.description || '',
          is_active: department.is_active,
        })
      } else {
        setFormData({
          name: '',
          // description: '',
          is_active: true,
        })
      }
      setErrors({})
    }
  }, [isOpen, department])

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Il nome del reparto è obbligatorio'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Il nome deve essere di almeno 2 caratteri'
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Il nome non può superare i 50 caratteri'
    }

    // if (formData.description && formData.description.length > 200) {
    //   newErrors.description = 'La descrizione non può superare i 200 caratteri'
    // }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const submitData: DepartmentInput = {
      name: formData.name.trim(),
      // description: formData.description?.trim() || undefined,
      is_active: formData.is_active,
    }

    onSubmit(submitData)
  }

  const handleInputChange = (
    field: keyof DepartmentInput,
    value: string | boolean
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (!isOpen) return null

  const isEditing = !!department

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        <div className="inline-block w-full max-w-md p-6 my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {isEditing ? 'Modifica Reparto' : 'Nuovo Reparto'}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nome Reparto *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={e => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="es. Cucina, Sala, Bancone..."
                maxLength={50}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Description - Removed */}
            {/* <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Descrizione
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={e => handleInputChange('description', e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Descrizione opzionale del reparto..."
                maxLength={200}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.description}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.description?.length || 0}/200 caratteri
              </p>
            </div> */}

            {/* Active Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={e => handleInputChange('is_active', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="is_active"
                className="ml-2 block text-sm text-gray-700"
              >
                Reparto attivo
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    <span>{isEditing ? 'Salvando...' : 'Creando...'}</span>
                  </div>
                ) : (
                  <span>{isEditing ? 'Salva Modifiche' : 'Crea Reparto'}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddDepartmentModal
