import React, { useState } from 'react'
import { X, Wrench, Plus, Calendar } from 'lucide-react'
import type {
  ConservationPoint,
  CreateMaintenanceTaskRequest,
} from '@/types/conservation'

type MaintenanceTaskKind = 'temperature' | 'sanitization' | 'defrosting'

interface MaintenanceTaskModalProps {
  conservationPoint: ConservationPoint
  onClose: () => void
  onCreate: (data: CreateMaintenanceTaskRequest) => void
  isCreating: boolean
}

const maintenanceKinds = [
  { value: 'temperature', label: 'Controllo Temperature', icon: '🌡️' },
  { value: 'sanitization', label: 'Sanificazione', icon: '🧽' },
  { value: 'defrosting', label: 'Sbrinamento', icon: '❄️' },
] as const

const frequencies = [
  { value: 'daily', label: 'Giornaliera', description: 'Ogni giorno' },
  { value: 'weekly', label: 'Settimanale', description: 'Ogni settimana' },
  { value: 'monthly', label: 'Mensile', description: 'Ogni mese' },
  {
    value: 'custom',
    label: 'Personalizzata',
    description: 'Frequenza specifica',
  },
] as const

const commonChecklists = {
  temperature: [
    'Verificare temperatura interna',
    'Controllare termostato',
    'Verificare guarnizioni porte',
    'Controllare allarmi temperatura',
  ],
  sanitization: [
    'Svuotare completamente il vano',
    'Pulire superfici interne con detergente',
    'Disinfettare con prodotto autorizzato',
    'Asciugare completamente',
    'Riposizionare prodotti',
  ],
  defrosting: [
    'Spegnere apparecchiatura',
    'Rimuovere tutti i prodotti',
    'Permettere sbrinamento naturale',
    'Pulire residui di ghiaccio',
    'Asciugare completamente',
    'Riaccendere e verificare temperatura',
  ],
}

export function MaintenanceTaskModal({
  conservationPoint,
  onClose,
  onCreate,
  isCreating,
}: MaintenanceTaskModalProps) {
  const [formData, setFormData] = useState({
    kind: 'temperature' as MaintenanceTaskKind,
    frequency: 'weekly' as const,
    next_due_date: new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 16), // Tomorrow
    estimated_duration: 30,
    checklist: [] as string[],
    assigned_to: '',
  })

  const [newChecklistItem, setNewChecklistItem] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreate({
      conservation_point_id: conservationPoint.id,
      kind: formData.kind,
      frequency: formData.frequency,
      next_due_date: new Date(formData.next_due_date),
      estimated_duration: formData.estimated_duration,
      checklist: formData.checklist.length > 0 ? formData.checklist : undefined,
      assigned_to: formData.assigned_to || undefined,
    })
  }

  const handleKindChange = (kind: typeof formData.kind) => {
    setFormData(prev => ({
      ...prev,
      kind,
      checklist: commonChecklists[kind] || [],
    }))
  }

  const addChecklistItem = () => {
    if (newChecklistItem.trim()) {
      setFormData(prev => ({
        ...prev,
        checklist: [...prev.checklist, newChecklistItem.trim()],
      }))
      setNewChecklistItem('')
    }
  }

  const removeChecklistItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      checklist: prev.checklist.filter((_, i) => i !== index),
    }))
  }

  const loadCommonChecklist = () => {
    setFormData(prev => ({
      ...prev,
      checklist: commonChecklists[prev.kind] || [],
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Wrench className="w-6 h-6 text-blue-600" />
                Nuova Manutenzione
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {conservationPoint.name}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Kind Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tipo di Manutenzione *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {maintenanceKinds.map(kind => (
                  <button
                    key={kind.value}
                    type="button"
                    onClick={() => handleKindChange(kind.value)}
                    className={`p-4 border-2 rounded-lg text-center transition-all ${
                      formData.kind === kind.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-2xl mb-2">{kind.icon}</div>
                    <div className="font-medium text-sm">{kind.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Frequency and Timing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frequenza *
                </label>
                <select
                  value={formData.frequency}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      frequency: e.target.value as any,
                    }))
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {frequencies.map(freq => (
                    <option key={freq.value} value={freq.value}>
                      {freq.label} - {freq.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prossima Scadenza *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.next_due_date}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      next_due_date: e.target.value,
                    }))
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Duration and Assignment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durata Stimata (minuti)
                </label>
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={formData.estimated_duration}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      estimated_duration: parseInt(e.target.value) || 30,
                    }))
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assegna a (Opzionale)
                </label>
                <select
                  value={formData.assigned_to}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      assigned_to: e.target.value,
                    }))
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Assegnazione automatica...</option>
                  <option value="staff1">Mario Rossi</option>
                  <option value="staff2">Giulia Bianchi</option>
                  <option value="staff3">Luca Verdi</option>
                </select>
              </div>
            </div>

            {/* Checklist */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Checklist Attività
                </label>
                <button
                  type="button"
                  onClick={loadCommonChecklist}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Carica checklist standard
                </button>
              </div>

              {/* Add new item */}
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newChecklistItem}
                  onChange={e => setNewChecklistItem(e.target.value)}
                  placeholder="Aggiungi attività alla checklist"
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onKeyPress={e =>
                    e.key === 'Enter' &&
                    (e.preventDefault(), addChecklistItem())
                  }
                />
                <button
                  type="button"
                  onClick={addChecklistItem}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Checklist items */}
              {formData.checklist.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {formData.checklist.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                    >
                      <span className="text-sm text-gray-700">{item}</span>
                      <button
                        type="button"
                        onClick={() => removeChecklistItem(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {formData.checklist.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <div className="text-4xl mb-2">📋</div>
                  <p className="text-sm">Nessuna attività in checklist</p>
                  <p className="text-xs">
                    Aggiungi attività o carica checklist standard
                  </p>
                </div>
              )}
            </div>

            {/* Preview */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Riepilogo Manutenzione
              </h4>
              <div className="text-sm text-blue-800 space-y-1">
                <div>
                  <strong>Tipo:</strong>{' '}
                  {maintenanceKinds.find(k => k.value === formData.kind)?.label}
                </div>
                <div>
                  <strong>Frequenza:</strong>{' '}
                  {frequencies.find(f => f.value === formData.frequency)?.label}
                </div>
                <div>
                  <strong>Durata:</strong> {formData.estimated_duration} minuti
                </div>
                <div>
                  <strong>Prossima scadenza:</strong>{' '}
                  {new Date(formData.next_due_date).toLocaleString('it-IT')}
                </div>
                <div>
                  <strong>Attività checklist:</strong>{' '}
                  {formData.checklist.length}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isCreating && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {isCreating ? 'Creazione...' : 'Crea Manutenzione'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
