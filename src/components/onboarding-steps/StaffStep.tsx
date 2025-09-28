import { useState, useEffect } from 'react'
import { User, Plus, Trash2, Edit2, Shield, Building2 } from 'lucide-react'

interface Department {
  id: string
  name: string
  description: string
  is_active: boolean
}

interface StaffMember {
  id: string
  name: string
  role: 'dipendente' | 'collaboratore' | 'responsabile' | 'admin'
  category: string
  email?: string
  phone?: string
  hire_date?: string
  status: 'active' | 'inactive' | 'suspended'
  notes?: string
  department_assignments: string[]
  haccp_certification?: {
    level: 'base' | 'advanced'
    expiry_date: string
    issuing_authority: string
    certificate_number: string
  }
}

interface StaffStepProps {
  data?: StaffMember[]
  departments: Department[]
  onUpdate: (data: StaffMember[]) => void
  onValidChange: (isValid: boolean) => void
}

const STAFF_CATEGORIES = [
  'Cuoco',
  'Aiuto Cuoco',
  'Cameriere',
  'Barista',
  'Responsabile Sala',
  'Responsabile Cucina',
  'Lavapiatti',
  'Addetto Pulizie',
  'Magazziniere',
  'Altro'
]

const StaffStep = ({ data, departments, onUpdate, onValidChange }: StaffStepProps) => {
  const [staff, setStaff] = useState<StaffMember[]>(data || [])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    role: 'dipendente' as const,
    category: 'Altro',
    email: '',
    phone: '',
    hire_date: '',
    status: 'active' as const,
    notes: '',
    department_assignments: [] as string[],
    hasHaccpCert: false,
    haccpCert: {
      level: 'base' as const,
      expiry_date: '',
      issuing_authority: '',
      certificate_number: ''
    }
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    validateForm()
    onUpdate(staff)
  }, [staff, onUpdate])

  const validateForm = () => {
    const isValid = staff.length > 0 && staff.every(member =>
      member.name.trim().length >= 2 &&
      (!member.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member.email))
    )
    onValidChange(isValid)
  }

  const generateId = () => `staff_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const validateMember = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Il nome è obbligatorio'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Il nome deve essere di almeno 2 caratteri'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Inserisci un email valido'
    }

    if (formData.phone && !/^[\d\s\-+()]+$/.test(formData.phone)) {
      newErrors.phone = 'Inserisci un numero di telefono valido'
    }

    if (formData.hasHaccpCert) {
      if (!formData.haccpCert.expiry_date) {
        newErrors.haccp_expiry = 'La data di scadenza è obbligatoria'
      }
      if (!formData.haccpCert.issuing_authority.trim()) {
        newErrors.haccp_authority = "L'ente certificatore è obbligatorio"
      }
      if (!formData.haccpCert.certificate_number.trim()) {
        newErrors.haccp_number = 'Il numero certificato è obbligatorio'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const addStaffMember = () => {
    if (!validateMember()) return

    const newMember: StaffMember = {
      id: generateId(),
      name: formData.name.trim(),
      role: formData.role,
      category: formData.category,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      hire_date: formData.hire_date || undefined,
      status: formData.status,
      notes: formData.notes || undefined,
      department_assignments: formData.department_assignments,
      haccp_certification: formData.hasHaccpCert ? formData.haccpCert : undefined
    }

    setStaff([...staff, newMember])
    resetForm()
  }

  const updateStaffMember = () => {
    if (!validateMember()) return

    setStaff(staff.map(member =>
      member.id === editingId
        ? {
            ...member,
            name: formData.name.trim(),
            role: formData.role,
            category: formData.category,
            email: formData.email || undefined,
            phone: formData.phone || undefined,
            hire_date: formData.hire_date || undefined,
            status: formData.status,
            notes: formData.notes || undefined,
            department_assignments: formData.department_assignments,
            haccp_certification: formData.hasHaccpCert ? formData.haccpCert : undefined
          }
        : member
    ))
    resetForm()
  }

  const deleteStaffMember = (id: string) => {
    setStaff(staff.filter(member => member.id !== id))
  }

  const startEdit = (member: StaffMember) => {
    setEditingId(member.id)
    setFormData({
      name: member.name,
      role: member.role,
      category: member.category,
      email: member.email || '',
      phone: member.phone || '',
      hire_date: member.hire_date || '',
      status: member.status,
      notes: member.notes || '',
      department_assignments: member.department_assignments || [],
      hasHaccpCert: !!member.haccp_certification,
      haccpCert: member.haccp_certification || {
        level: 'base',
        expiry_date: '',
        issuing_authority: '',
        certificate_number: ''
      }
    })
    setErrors({})
  }

  const resetForm = () => {
    setEditingId(null)
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
      hasHaccpCert: false,
      haccpCert: {
        level: 'base',
        expiry_date: '',
        issuing_authority: '',
        certificate_number: ''
      }
    })
    setErrors({})
  }

  const handleDepartmentToggle = (departmentId: string) => {
    const isAssigned = formData.department_assignments.includes(departmentId)
    setFormData({
      ...formData,
      department_assignments: isAssigned
        ? formData.department_assignments.filter(id => id !== departmentId)
        : [...formData.department_assignments, departmentId]
    })
  }

  const prefillSampleData = () => {
    const sampleStaff: StaffMember[] = [
      {
        id: generateId(),
        name: 'Mario Rossi',
        role: 'responsabile',
        category: 'Responsabile Cucina',
        email: 'mario.rossi@alritrovo.it',
        phone: '+39 340 1234567',
        hire_date: '2020-01-15',
        status: 'active',
        department_assignments: departments.filter(d => d.name === 'Cucina').map(d => d.id),
        haccp_certification: {
          level: 'advanced',
          expiry_date: '2025-12-31',
          issuing_authority: 'ASL Bologna',
          certificate_number: 'HACCP-2024-001'
        }
      },
      {
        id: generateId(),
        name: 'Giulia Bianchi',
        role: 'dipendente',
        category: 'Cameriere',
        email: 'giulia.bianchi@alritrovo.it',
        phone: '+39 349 7654321',
        hire_date: '2021-03-10',
        status: 'active',
        department_assignments: departments.filter(d => d.name === 'Sala').map(d => d.id),
        haccp_certification: {
          level: 'base',
          expiry_date: '2025-06-30',
          issuing_authority: 'ASL Bologna',
          certificate_number: 'HACCP-2024-002'
        }
      },
      {
        id: generateId(),
        name: 'Luca Verdi',
        role: 'collaboratore',
        category: 'Barista',
        email: 'luca.verdi@alritrovo.it',
        status: 'active',
        department_assignments: departments.filter(d => d.name === 'Bancone').map(d => d.id)
      }
    ]
    setStaff(sampleStaff)
  }

  const getRoleLabel = (role: string) => {
    const roles = {
      dipendente: 'Dipendente',
      collaboratore: 'Collaboratore',
      responsabile: 'Responsabile',
      admin: 'Amministratore'
    }
    return roles[role as keyof typeof roles] || role
  }

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      active: 'Attivo',
      inactive: 'Inattivo',
      suspended: 'Sospeso'
    }
    return labels[status as keyof typeof labels] || status
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Gestione Personale
        </h2>
        <p className="text-gray-600">
          Aggiungi i membri del team con ruoli, responsabilità e certificazioni HACCP
        </p>
      </div>

      {/* Quick Fill Button */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={prefillSampleData}
          className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          🚀 Carica staff predefinito
        </button>
      </div>

      {/* Add/Edit Form */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-4">
          {editingId ? 'Modifica Dipendente' : 'Aggiungi Nuovo Dipendente'}
        </h3>

        <div className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Completo *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Nome e Cognome"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ruolo *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="dipendente">Dipendente</option>
                <option value="collaboratore">Collaboratore</option>
                <option value="responsabile">Responsabile</option>
                <option value="admin">Amministratore</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {STAFF_CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stato
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Attivo</option>
                <option value="inactive">Inattivo</option>
                <option value="suspended">Sospeso</option>
              </select>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="email@esempio.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefono
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data di Assunzione
            </label>
            <input
              type="date"
              value={formData.hire_date}
              onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Department Assignments */}
          {departments.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building2 className="inline w-4 h-4 mr-1" />
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
                      checked={formData.department_assignments.includes(department.id)}
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
                checked={formData.hasHaccpCert}
                onChange={(e) => setFormData({ ...formData, hasHaccpCert: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="flex items-center text-sm font-medium text-gray-700">
                <Shield className="h-4 w-4 mr-1" />
                Certificazione HACCP
              </label>
            </div>

            {formData.hasHaccpCert && (
              <div className="ml-6 space-y-4 p-4 bg-blue-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Livello *
                    </label>
                    <select
                      value={formData.haccpCert.level}
                      onChange={(e) => setFormData({
                        ...formData,
                        haccpCert: { ...formData.haccpCert, level: e.target.value as 'base' | 'advanced' }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="base">Base</option>
                      <option value="advanced">Avanzato</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data Scadenza *
                    </label>
                    <input
                      type="date"
                      value={formData.haccpCert.expiry_date}
                      onChange={(e) => setFormData({
                        ...formData,
                        haccpCert: { ...formData.haccpCert, expiry_date: e.target.value }
                      })}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.haccp_expiry ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.haccp_expiry && (
                      <p className="mt-1 text-sm text-red-600">{errors.haccp_expiry}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ente Certificatore *
                    </label>
                    <input
                      type="text"
                      value={formData.haccpCert.issuing_authority}
                      onChange={(e) => setFormData({
                        ...formData,
                        haccpCert: { ...formData.haccpCert, issuing_authority: e.target.value }
                      })}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.haccp_authority ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Nome ente certificatore"
                    />
                    {errors.haccp_authority && (
                      <p className="mt-1 text-sm text-red-600">{errors.haccp_authority}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Numero Certificato *
                    </label>
                    <input
                      type="text"
                      value={formData.haccpCert.certificate_number}
                      onChange={(e) => setFormData({
                        ...formData,
                        haccpCert: { ...formData.haccpCert, certificate_number: e.target.value }
                      })}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.haccp_number ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Numero del certificato"
                    />
                    {errors.haccp_number && (
                      <p className="mt-1 text-sm text-red-600">{errors.haccp_number}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Note aggiuntive sul dipendente..."
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-3 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Annulla
              </button>
            )}
            <button
              type="button"
              onClick={editingId ? updateStaffMember : addStaffMember}
              className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              {editingId ? (
                <>
                  <Edit2 className="w-4 h-4" />
                  Aggiorna
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Aggiungi
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Staff List */}
      <div>
        <h3 className="font-medium text-gray-900 mb-3">
          Personale Configurato ({staff.length})
        </h3>

        {staff.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">Nessun dipendente configurato</p>
            <p className="text-sm text-gray-400">
              Aggiungi almeno un membro del team per continuare
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {staff.map((member) => (
              <div
                key={member.id}
                className="border border-gray-200 rounded-lg p-4 bg-white"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-gray-900">{member.name}</h4>
                      {member.haccp_certification && (
                        <Shield className="w-4 h-4 text-green-600" title="Certificazione HACCP" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {getRoleLabel(member.role)} • {member.category}
                    </p>
                    {member.email && (
                      <p className="text-sm text-gray-500 mb-1">{member.email}</p>
                    )}
                    {member.department_assignments.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {member.department_assignments.map(deptId => {
                          const dept = departments.find(d => d.id === deptId)
                          return dept ? (
                            <span key={deptId} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {dept.name}
                            </span>
                          ) : null
                        })}
                      </div>
                    )}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                      {getStatusLabel(member.status)}
                    </span>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => startEdit(member)}
                      className="p-1 text-blue-600 hover:text-blue-800"
                      title="Modifica dipendente"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteStaffMember(member.id)}
                      className="p-1 text-red-600 hover:text-red-800"
                      title="Elimina dipendente"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* HACCP Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">
          ℹ️ Gestione HACCP del Personale
        </h3>
        <p className="text-sm text-blue-700">
          Ogni membro del team può avere responsabilità specifiche nei controlli HACCP.
          Le certificazioni HACCP sono monitorate per garantire conformità normativa.
          I responsabili possono supervisionare e validare i controlli di temperatura.
        </p>
      </div>
    </div>
  )
}

export default StaffStep