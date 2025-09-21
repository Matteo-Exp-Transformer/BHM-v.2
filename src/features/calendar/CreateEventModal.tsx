import React, { useState } from 'react'
import { X, Calendar, Clock, MapPin, User, Plus } from 'lucide-react'
import type { TypedCalendarEvent } from '@/types/calendar'

interface CreateEventModalProps {
  selectedDate: Date | null
  onClose: () => void
  onCreate: (eventData: Partial<TypedCalendarEvent>) => void
}

const eventTypes = [
  { value: 'maintenance', label: 'Manutenzione', color: '#3B82F6' },
  { value: 'task', label: 'Attività', color: '#10B981' },
  { value: 'training', label: 'Formazione', color: '#F59E0B' },
  { value: 'inventory', label: 'Inventario', color: '#8B5CF6' },
  { value: 'meeting', label: 'Riunione', color: '#EF4444' },
]

const priorities = [
  { value: 'low', label: 'Bassa', color: 'text-green-600' },
  { value: 'medium', label: 'Media', color: 'text-yellow-600' },
  { value: 'high', label: 'Alta', color: 'text-orange-600' },
  { value: 'critical', label: 'Critica', color: 'text-red-600' },
]

const maintenanceTypes = [
  { value: 'temperature', label: 'Controllo Temperatura' },
  { value: 'sanitization', label: 'Sanificazione' },
  { value: 'defrosting', label: 'Sbrinamento' },
  { value: 'repair', label: 'Riparazione' },
]

const frequencies = [
  { value: 'daily', label: 'Giornaliera' },
  { value: 'weekly', label: 'Settimanale' },
  { value: 'monthly', label: 'Mensile' },
  { value: 'quarterly', label: 'Trimestrale' },
  { value: 'yearly', label: 'Annuale' },
  { value: 'custom', label: 'Personalizzata' },
]

export function CreateEventModal({
  selectedDate,
  onClose,
  onCreate,
}: CreateEventModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    source: 'maintenance' as const,
    start: selectedDate ? selectedDate.toISOString().slice(0, 16) : '',
    end: '',
    allDay: false,
    priority: 'medium' as const,
    location: '',
    assignedTo: [] as string[],
    // Maintenance specific
    maintenanceType: 'temperature' as const,
    frequency: 'weekly' as const,
    estimatedDuration: 30,
    checklist: [] as string[],
    conservationPointId: '',
    // Task specific
    taskType: 'haccp_check' as const,
    departmentId: '',
    // Meeting specific
    meetingType: 'team' as const,
    attendees: [] as string[],
    isVirtual: false,
    meetingLink: '',
    // Training specific
    trainingType: 'haccp' as const,
    instructor: '',
    maxParticipants: 10,
    certificationRequired: false,
  })

  const [checklistItem, setChecklistItem] = useState('')
  const [assigneeEmail, setAssigneeEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const baseEvent = {
      title: formData.title,
      start: new Date(formData.start),
      end: formData.end ? new Date(formData.end) : undefined,
      allDay: formData.allDay,
      source: formData.source,
      sourceId: 'temp-' + Date.now(),
      extendedProps: {
        description: formData.description,
        priority: formData.priority,
        status: 'scheduled' as const,
        assignedTo: formData.assignedTo,
        location: formData.location,
        category: getCategory(),
        color: eventTypes.find(t => t.value === formData.source)?.color,
      },
    }

    const specificProps = getSourceSpecificProps()
    const eventData = {
      ...baseEvent,
      extendedProps: {
        ...baseEvent.extendedProps,
        ...specificProps,
      },
    }

    onCreate(eventData)
    onClose()
  }

  const getCategory = () => {
    switch (formData.source) {
      case 'maintenance':
        return formData.maintenanceType
      case 'task':
        return formData.taskType
      case 'training':
        return formData.trainingType
      case 'meeting':
        return formData.meetingType
      default:
        return 'general'
    }
  }

  const getSourceSpecificProps = () => {
    switch (formData.source) {
      case 'maintenance':
        return {
          maintenanceType: formData.maintenanceType,
          frequency: formData.frequency,
          estimatedDuration: formData.estimatedDuration,
          checklist: formData.checklist,
          conservationPointId: formData.conservationPointId || undefined,
        }
      case 'task':
        return {
          taskType: formData.taskType,
          departmentId: formData.departmentId || undefined,
          estimatedDuration: formData.estimatedDuration,
        }
      case 'training':
        return {
          trainingType: formData.trainingType,
          instructor: formData.instructor,
          maxParticipants: formData.maxParticipants,
          certificationRequired: formData.certificationRequired,
        }
      case 'meeting':
        return {
          meetingType: formData.meetingType,
          attendees: formData.attendees,
          isVirtual: formData.isVirtual,
          meetingLink: formData.meetingLink || undefined,
        }
      default:
        return {}
    }
  }

  const addChecklistItem = () => {
    if (checklistItem.trim()) {
      setFormData(prev => ({
        ...prev,
        checklist: [...prev.checklist, checklistItem.trim()],
      }))
      setChecklistItem('')
    }
  }

  const removeChecklistItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      checklist: prev.checklist.filter((_, i) => i !== index),
    }))
  }

  const addAssignee = () => {
    if (assigneeEmail.trim() && !formData.assignedTo.includes(assigneeEmail)) {
      setFormData(prev => ({
        ...prev,
        assignedTo: [...prev.assignedTo, assigneeEmail.trim()],
      }))
      setAssigneeEmail('')
    }
  }

  const removeAssignee = (email: string) => {
    setFormData(prev => ({
      ...prev,
      assignedTo: prev.assignedTo.filter(a => a !== email),
    }))
  }

  const renderSourceSpecificFields = () => {
    switch (formData.source) {
      case 'maintenance':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo Manutenzione
                </label>
                <select
                  value={formData.maintenanceType}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      maintenanceType: e.target.value as any,
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {maintenanceTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequenza
                </label>
                <select
                  value={formData.frequency}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      frequency: e.target.value as any,
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {frequencies.map(freq => (
                    <option key={freq.value} value={freq.value}>
                      {freq.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Durata Stimata (minuti)
              </label>
              <input
                type="number"
                value={formData.estimatedDuration}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    estimatedDuration: parseInt(e.target.value) || 30,
                  }))
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="5"
                step="5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Checklist
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={checklistItem}
                  onChange={e => setChecklistItem(e.target.value)}
                  placeholder="Aggiungi elemento checklist"
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
              {formData.checklist.length > 0 && (
                <ul className="space-y-1">
                  {formData.checklist.map((item, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between bg-gray-50 p-2 rounded"
                    >
                      <span className="text-sm">{item}</span>
                      <button
                        type="button"
                        onClick={() => removeChecklistItem(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )

      case 'training':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo Formazione
                </label>
                <select
                  value={formData.trainingType}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      trainingType: e.target.value as any,
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="haccp">HACCP</option>
                  <option value="safety">Sicurezza</option>
                  <option value="hygiene">Igiene</option>
                  <option value="equipment">Attrezzature</option>
                  <option value="procedures">Procedure</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Partecipanti
                </label>
                <input
                  type="number"
                  value={formData.maxParticipants}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      maxParticipants: parseInt(e.target.value) || 10,
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Istruttore
              </label>
              <input
                type="text"
                value={formData.instructor}
                onChange={e =>
                  setFormData(prev => ({ ...prev, instructor: e.target.value }))
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nome istruttore"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="certification-required"
                checked={formData.certificationRequired}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    certificationRequired: e.target.checked,
                  }))
                }
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="certification-required"
                className="ml-2 text-sm text-gray-700"
              >
                Certificazione richiesta
              </label>
            </div>
          </div>
        )

      case 'meeting':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo Riunione
              </label>
              <select
                value={formData.meetingType}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    meetingType: e.target.value as any,
                  }))
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="team">Team</option>
                <option value="training">Formazione</option>
                <option value="audit">Audit</option>
                <option value="review">Revisione</option>
                <option value="emergency">Emergenza</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is-virtual"
                checked={formData.isVirtual}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    isVirtual: e.target.checked,
                  }))
                }
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="is-virtual"
                className="ml-2 text-sm text-gray-700"
              >
                Riunione virtuale
              </label>
            </div>

            {formData.isVirtual && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link Riunione
                </label>
                <input
                  type="url"
                  value={formData.meetingLink}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      meetingLink: e.target.value,
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://..."
                />
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Nuovo Evento
            </h2>
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
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titolo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Inserisci il titolo dell'evento"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo Evento *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {eventTypes.map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() =>
                        setFormData(prev => ({
                          ...prev,
                          source: type.value as any,
                        }))
                      }
                      className={`p-3 border-2 rounded-lg text-sm font-medium transition-colors ${
                        formData.source === type.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: type.color }}
                        />
                        {type.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrizione
                </label>
                <textarea
                  value={formData.description}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Aggiungi una descrizione dell'evento"
                />
              </div>
            </div>

            {/* Date and Time */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data e Ora Inizio *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.start}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, start: e.target.value }))
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data e Ora Fine
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.end}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, end: e.target.value }))
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="all-day"
                  checked={formData.allDay}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, allDay: e.target.checked }))
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="all-day" className="ml-2 text-sm text-gray-700">
                  Evento per tutto il giorno
                </label>
              </div>
            </div>

            {/* Priority and Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priorità
                </label>
                <select
                  value={formData.priority}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      priority: e.target.value as any,
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {priorities.map(priority => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Posizione
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, location: e.target.value }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Dove si svolge l'evento"
                />
              </div>
            </div>

            {/* Assigned Users */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assegna a
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="email"
                  value={assigneeEmail}
                  onChange={e => setAssigneeEmail(e.target.value)}
                  placeholder="Email utente"
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onKeyPress={e =>
                    e.key === 'Enter' && (e.preventDefault(), addAssignee())
                  }
                />
                <button
                  type="button"
                  onClick={addAssignee}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {formData.assignedTo.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.assignedTo.map(email => (
                    <div
                      key={email}
                      className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                    >
                      <User className="w-3 h-3" />
                      {email}
                      <button
                        type="button"
                        onClick={() => removeAssignee(email)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Source-specific fields */}
            {renderSourceSpecificFields()}
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
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Crea Evento
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
