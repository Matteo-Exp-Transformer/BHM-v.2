import React, { useState, useEffect } from 'react'
import { X, User, Shield, Building2 } from 'lucide-react'
import {
  StaffMember,
  StaffInput,
  STAFF_CATEGORIES,
  HaccpCertification,
} from '../hooks/useStaff'

interface AddStaffModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (input: StaffInput) => void
  staffMember?: StaffMember | null
  isLoading?: boolean
  departments?: Array<{ id: string; name: string }>
}

export const AddStaffModal = ({
  isOpen,
  onClose,
  onSubmit,
  staffMember = null,
  isLoading = false,
  departments = [],
}: AddStaffModalProps) => {
  const [formData, setFormData] = useState<StaffInput>({
    name: '',
    role: 'dipendente',
    category: 'Altro',
    email: '',
    phone: '',
    hire_date: '',
    status: 'active',
    notes: '',
    department_assignments: [],
  })

  const [haccpCert, setHaccpCert] = useState<HaccpCertification>({
    level: 'base',
    expiry_date: '',
    issuing_authority: '',
    certificate_number: '',
  })

  const [hasHaccpCert, setHasHaccpCert] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  // Reset form when modal opens/closes or staff member changes
  useEffect(() => {
    if (isOpen) {
      if (staffMember) {
        setFormData({
          name: staffMember.name,
          role: staffMember.role,
          category: staffMember.category,
          email: staffMember.email || '',
          phone: staffMember.phone || '',
          hire_date: staffMember.hire_date || '',
          status: staffMember.status,
          notes: staffMember.notes || '',
          department_assignments: staffMember.department_assignments || [],
        })

        if (staffMember.haccp_certification) {
          setHasHaccpCert(true)
          setHaccpCert(staffMember.haccp_certification)
        } else {
          setHasHaccpCert(false)
          setHaccpCert({
            level: 'base',
            expiry_date: '',
            issuing_authority: '',
            certificate_number: '',
          })
        }
      } else {
        setFormData({
          name: '',
          role: 'dipendente',
          category: 'Altro',
          email: '',
          phone: '',
          hire_date: '',
          status: 'active',
          notes: '',
          department_assignments: [],
        })
        setHasHaccpCert(false)
        setHaccpCert({
          level: 'base',
          expiry_date: '',
          issuing_authority: '',
          certificate_number: '',
        })
      }
      setErrors({})
    }
  }, [isOpen, staffMember])

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Il nome è obbligatorio'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Il nome deve essere di almeno 2 caratteri'
    }

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Inserisci un email valido'
    }

    // Phone validation
    if (formData.phone && !/^[\d\s\-+()]+$/.test(formData.phone)) {
      newErrors.phone = 'Inserisci un numero di telefono valido'
    }

    // HACCP certification validation
    if (hasHaccpCert) {
      if (!haccpCert.expiry_date) {
        newErrors.haccp_expiry = 'La data di scadenza è obbligatoria'
      }
      if (!haccpCert.issuing_authority.trim()) {
        newErrors.haccp_authority = "L'ente certificatore è obbligatorio"
      }
      if (!haccpCert.certificate_number.trim()) {
        newErrors.haccp_number = 'Il numero certificato è obbligatorio'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const submitData: StaffInput = {
      ...formData,
      name: formData.name.trim(),
      email: formData.email?.trim() || undefined,
      phone: formData.phone?.trim() || undefined,
      notes: formData.notes?.trim() || undefined,
      hire_date: formData.hire_date || undefined,
      haccp_certification: hasHaccpCert ? haccpCert : undefined,
    }

    onSubmit(submitData)
  }

  const handleInputChange = (field: keyof StaffInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleHaccpChange = (
    field: keyof HaccpCertification,
    value: string
  ) => {
    setHaccpCert(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    const errorKey = `haccp_${field === 'expiry_date' ? 'expiry' : field === 'issuing_authority' ? 'authority' : 'number'}`
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: '' }))
    }
  }

  const handleDepartmentToggle = (departmentId: string) => {
    const currentAssignments = formData.department_assignments || []
    const isAssigned = currentAssignments.includes(departmentId)

    if (isAssigned) {
      handleInputChange(
        'department_assignments',
        currentAssignments.filter(id => id !== departmentId)
      )
    } else {
      handleInputChange('department_assignments', [
        ...currentAssignments,
        departmentId,
      ])
    }
  }

  if (!isOpen) return null

  const isEditing = !!staffMember

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        <div className="inline-block w-full max-w-2xl p-6 my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-lg max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {isEditing ? 'Modifica Dipendente' : 'Nuovo Dipendente'}
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
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nome Completo *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Nome e Cognome"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Role */}
              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Ruolo *
                </label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={e =>
                    handleInputChange('role', e.target.value as any)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="dipendente">Dipendente</option>
                  <option value="collaboratore">Collaboratore</option>
                  <option value="responsabile">Responsabile</option>
                  <option value="admin">Amministratore</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Categoria *
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={e => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {STAFF_CATEGORIES.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Stato
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={e =>
                    handleInputChange('status', e.target.value as any)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="active">Attivo</option>
                  <option value="inactive">Inattivo</option>
                  <option value="suspended">Sospeso</option>
                </select>
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="email@esempio.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Telefono
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={e => handleInputChange('phone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.phone ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="+39 123 456 7890"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* Hire Date */}
            <div>
              <label
                htmlFor="hire_date"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Data di Assunzione
              </label>
              <input
                type="date"
                id="hire_date"
                value={formData.hire_date}
                onChange={e => handleInputChange('hire_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Department Assignments */}
            {departments.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building2 className="inline h-4 w-4 mr-1" />
                  Assegnazione Reparti
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {departments.map(department => (
                    <label
                      key={department.id}
                      className="flex items-center space-x-2 p-2 border rounded-md hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={
                          formData.department_assignments?.includes(
                            department.id
                          ) || false
                        }
                        onChange={() => handleDepartmentToggle(department.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">
                        {department.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* HACCP Certification */}
            <div className="border-t pt-4">
              <div className="flex items-center space-x-2 mb-3">
                <input
                  type="checkbox"
                  id="has_haccp"
                  checked={hasHaccpCert}
                  onChange={e => setHasHaccpCert(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="has_haccp"
                  className="flex items-center text-sm font-medium text-gray-700"
                >
                  <Shield className="h-4 w-4 mr-1" />
                  Certificazione HACCP
                </label>
              </div>

              {hasHaccpCert && (
                <div className="ml-6 space-y-4 p-4 bg-blue-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Level */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Livello *
                      </label>
                      <select
                        value={haccpCert.level}
                        onChange={e =>
                          handleHaccpChange(
                            'level',
                            e.target.value as 'base' | 'advanced'
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="base">Base</option>
                        <option value="advanced">Avanzato</option>
                      </select>
                    </div>

                    {/* Expiry Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data Scadenza *
                      </label>
                      <input
                        type="date"
                        value={haccpCert.expiry_date}
                        onChange={e =>
                          handleHaccpChange('expiry_date', e.target.value)
                        }
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.haccp_expiry
                            ? 'border-red-300'
                            : 'border-gray-300'
                        }`}
                      />
                      {errors.haccp_expiry && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.haccp_expiry}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Issuing Authority */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ente Certificatore *
                      </label>
                      <input
                        type="text"
                        value={haccpCert.issuing_authority}
                        onChange={e =>
                          handleHaccpChange('issuing_authority', e.target.value)
                        }
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.haccp_authority
                            ? 'border-red-300'
                            : 'border-gray-300'
                        }`}
                        placeholder="Nome ente certificatore"
                      />
                      {errors.haccp_authority && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.haccp_authority}
                        </p>
                      )}
                    </div>

                    {/* Certificate Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Numero Certificato *
                      </label>
                      <input
                        type="text"
                        value={haccpCert.certificate_number}
                        onChange={e =>
                          handleHaccpChange(
                            'certificate_number',
                            e.target.value
                          )
                        }
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.haccp_number
                            ? 'border-red-300'
                            : 'border-gray-300'
                        }`}
                        placeholder="Numero del certificato"
                      />
                      {errors.haccp_number && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.haccp_number}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Note
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={e => handleInputChange('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Note aggiuntive sul dipendente..."
              />
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
                  <span>
                    {isEditing ? 'Salva Modifiche' : 'Crea Dipendente'}
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddStaffModal
