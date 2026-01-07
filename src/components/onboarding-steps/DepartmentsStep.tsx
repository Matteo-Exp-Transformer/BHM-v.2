import { useState, useEffect } from 'react'
import { Building2, Plus, Trash2, Edit2 } from 'lucide-react'

import type { DepartmentSummary } from '@/types/onboarding'

interface DepartmentsStepProps {
  data?: DepartmentSummary[]
  onUpdate: (data: DepartmentSummary[]) => void
  onValidChange: (isValid: boolean) => void
}

const DepartmentsStep = ({
  data,
  onUpdate,
  onValidChange,
}: DepartmentsStepProps) => {
  const departments = data || []
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const hasValidDepartments =
      departments.length > 0 &&
      departments.every(
        dept =>
          dept.name.trim().length >= 2 &&
          !departments.find(
            other =>
              other.id !== dept.id &&
              other.name.toLowerCase() === dept.name.toLowerCase()
          )
      )

    onValidChange(hasValidDepartments)
  }, [departments, onValidChange])

  const generateId = () =>
    `dept_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const addDepartment = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Il nome del reparto è obbligatorio'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Il nome deve essere di almeno 2 caratteri'
    } else if (
      departments.find(
        d => d.name.toLowerCase() === formData.name.toLowerCase()
      )
    ) {
      newErrors.name = 'Un reparto con questo nome esiste già'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      const newDepartment: DepartmentSummary = {
        id: generateId(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        is_active: formData.is_active,
      }

      onUpdate([...departments, newDepartment])
      setFormData({ name: '', description: '', is_active: true })
    }
  }

  const updateDepartment = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Il nome del reparto è obbligatorio'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Il nome deve essere di almeno 2 caratteri'
    } else if (
      departments.find(
        d =>
          d.id !== editingId &&
          d.name.toLowerCase() === formData.name.toLowerCase()
      )
    ) {
      newErrors.name = 'Un reparto con questo nome esiste già'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      onUpdate(
        departments.map(dept =>
          dept.id === editingId
            ? {
                ...dept,
                name: formData.name.trim(),
                description: formData.description.trim(),
                is_active: formData.is_active,
              }
            : dept
        )
      )
      setEditingId(null)
      setFormData({ name: '', description: '', is_active: true })
    }
  }

  const deleteDepartment = (id: string) => {
    onUpdate(departments.filter(dept => dept.id !== id))
  }

  const startEdit = (department: DepartmentSummary) => {
    setEditingId(department.id)
    setFormData({
      name: department.name,
      description: department.description ?? '',
      is_active: department.is_active ?? true,
    })
    setErrors({})
  }

  const cancelEdit = () => {
    setEditingId(null)
    setFormData({ name: '', description: '', is_active: true })
    setErrors({})
  }

  const prefillSampleData = () => {
    const sampleDepartments: DepartmentSummary[] = [
      {
        id: generateId(),
        name: 'Cucina',
        description: 'Area di preparazione dei cibi',
        is_active: true,
      },
      {
        id: generateId(),
        name: 'Bancone',
        description: 'Area servizio al bancone',
        is_active: true,
      },
      {
        id: generateId(),
        name: 'Sala',
        description: 'Area servizio ai tavoli',
        is_active: true,
      },
      {
        id: generateId(),
        name: 'Magazzino',
        description: 'Deposito merci e prodotti',
        is_active: true,
      },
      {
        id: generateId(),
        name: 'Lavaggio',
        description: 'Area lavaggio stoviglie',
        is_active: true,
      },
      {
        id: generateId(),
        name: 'Deoor / Esterno',
        description: 'Area deoor e servizi esterni',
        is_active: true,
      },
      {
        id: generateId(),
        name: 'Plonge / Lavaggio Piatti',
        description: 'Area lavaggio stoviglie e piatti',
        is_active: true,
      },
    ]
    onUpdate(sampleDepartments)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Configurazione Reparti
        </h2>
        <p className="text-gray-600">
          Definisci i reparti della tua azienda per organizzare staff,
          attrezzature e controlli
        </p>
      </div>

      {/* Quick Fill Button */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={prefillSampleData}
          className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          🚀 Carica reparti predefiniti
        </button>
      </div>

      {/* Add/Edit Form - Mostra solo se non ci sono dati o se stiamo editando */}
      {(departments.length === 0 || editingId) && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-3">
          {editingId ? 'Modifica Reparto' : 'Aggiungi Nuovo Reparto'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome Reparto *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="es. Cucina, Sala, Bancone..."
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrizione
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={e =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descrizione del reparto..."
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={e =>
                setFormData({ ...formData, is_active: e.target.checked })
              }
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Reparto attivo</span>
          </label>

          <div className="flex gap-2">
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="px-3 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Annulla
              </button>
            )}
            <button
              type="button"
              onClick={editingId ? updateDepartment : addDepartment}
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
      )}

      {/* Pulsante Aggiungi quando ci sono già dati */}
      {departments.length > 0 && !editingId && (
        <div className="mb-4">
          <button
            onClick={() => setEditingId('new')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Aggiungi Nuovo Reparto
          </button>
        </div>
      )}

      {/* Departments List */}
      <div>
        <h3 className="font-medium text-gray-900 mb-3">
          Reparti Configurati ({departments.length})
        </h3>

        {departments.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">Nessun reparto configurato</p>
            <p className="text-sm text-gray-400">
              Aggiungi almeno un reparto per continuare
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {departments.map(department => (
              <div
                key={department.id}
                className={`border rounded-lg p-4 ${
                  department.is_active
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {department.name}
                    </h4>
                    {department.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {department.description}
                      </p>
                    )}
                    <div className="flex items-center mt-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          department.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {department.is_active ? 'Attivo' : 'Inattivo'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => startEdit(department)}
                      className="p-1 text-blue-600 hover:text-blue-800"
                      title="Modifica reparto"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteDepartment(department.id)}
                      className="p-1 text-red-600 hover:text-red-800"
                      title="Elimina reparto"
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
          ℹ️ Organizzazione HACCP
        </h3>
        <p className="text-sm text-blue-700">
          I reparti sono utilizzati per organizzare il personale, assegnare
          responsabilità e configurare punti di controllo specifici. Ogni
          reparto può avere le proprie procedure HACCP e controlli di
          temperatura.
        </p>
      </div>
    </div>
  )
}

export default DepartmentsStep
