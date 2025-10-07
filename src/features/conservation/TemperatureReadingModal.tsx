import React, { useState } from 'react'
import { X, Thermometer, Camera, Clock } from 'lucide-react'
import type {
  ConservationPoint,
  CreateTemperatureReadingRequest,
} from '@/types/conservation'

interface TemperatureReadingModalProps {
  conservationPoint: ConservationPoint
  onClose: () => void
  onCreate: (data: CreateTemperatureReadingRequest) => void
  isCreating: boolean
}

// TODO: Method tracking will be added when DB schema is updated
const methods = [
  { value: 'manual', label: 'Manuale', icon: '✍️' },
  { value: 'digital_thermometer', label: 'Termometro Digitale', icon: '🌡️' },
  { value: 'automatic_sensor', label: 'Sensore Automatico', icon: '🤖' },
] as const

export function TemperatureReadingModal({
  conservationPoint,
  onClose,
  onCreate,
  isCreating,
}: TemperatureReadingModalProps) {
  interface TemperatureFormState {
    temperature: number
    recorded_at?: Date
    // TODO: These fields will be added when DB schema is updated
    method: 'manual' | 'digital_thermometer' | 'automatic_sensor'
    notes: string
    photo_evidence: string
  }

  const [formData, setFormData] = useState<TemperatureFormState>({
    temperature: conservationPoint.setpoint_temp,
    method: 'manual',
    notes: '',
    photo_evidence: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreate({
      conservation_point_id: conservationPoint.id,
      temperature: formData.temperature,
      recorded_at: new Date(),
      // TODO: Add these fields when DB schema is updated:
      // method: formData.method,
      // notes: formData.notes || undefined,
      // photo_evidence: formData.photo_evidence || undefined,
    })
  }

  const tempDifference = formData.temperature - conservationPoint.setpoint_temp
  const getTemperatureStatus = () => {
    const tolerance = getToleranceRange(conservationPoint.type)
    if (Math.abs(tempDifference) <= tolerance) return 'compliant'
    if (Math.abs(tempDifference) <= tolerance + 2) return 'warning'
    return 'critical'
  }

  const getToleranceRange = (type: ConservationPoint['type']): number => {
    switch (type) {
      case 'freezer':
        return 3
      case 'fridge':
        return 2
      case 'blast':
        return 1
      case 'ambient':
        return 5
      default:
        return 2
    }
  }

  const status = getTemperatureStatus()
  const statusColors = {
    compliant: 'text-green-600 bg-green-50 border-green-200',
    warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    critical: 'text-red-600 bg-red-50 border-red-200',
  }

  const statusLabels = {
    compliant: 'Conforme',
    warning: 'Attenzione',
    critical: 'Critico',
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Thermometer className="w-6 h-6 text-blue-600" />
                Lettura Temperatura
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
            {/* Point Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Setpoint:</span>
                  <span className="ml-2 font-medium">
                    {conservationPoint.setpoint_temp}°C
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Tolleranza:</span>
                  <span className="ml-2 font-medium">
                    ±{getToleranceRange(conservationPoint.type)}°C
                  </span>
                </div>
              </div>
            </div>

            {/* Temperature Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temperatura Rilevata (°C) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.temperature}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      temperature: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-medium"
                  placeholder="0.0"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  °C
                </div>
              </div>

              {/* Status indicator */}
              <div
                className={`mt-2 p-2 rounded-lg border ${statusColors[status]}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Stato: {statusLabels[status]}
                  </span>
                  <span className="text-sm">
                    {tempDifference > 0 ? '+' : ''}
                    {tempDifference.toFixed(1)}°C
                  </span>
                </div>
              </div>
            </div>

            {/* Method Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Metodo di Misurazione *
              </label>
              <div className="space-y-2">
                {methods.map(method => (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() =>
                      setFormData(prev => ({ ...prev, method: method.value }))
                    }
                    className={`w-full flex items-center gap-3 p-3 border rounded-lg text-left transition-colors ${
                      formData.method === method.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <span className="text-lg">{method.icon}</span>
                    <span className="font-medium">{method.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Note (Opzionale)
              </label>
              <textarea
                value={formData.notes}
                onChange={e =>
                  setFormData(prev => ({ ...prev, notes: e.target.value }))
                }
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Aggiungi eventuali osservazioni..."
              />
            </div>

            {/* Photo Evidence */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Evidenza Fotografica (Opzionale)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Carica foto del termometro
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (!file) {
                      setFormData(prev => ({ ...prev, photo_evidence: '' }))
                      return
                    }

                    const reader = new FileReader()
                    reader.onloadend = () => {
                      setFormData(prev => ({
                        ...prev,
                        photo_evidence:
                          typeof reader.result === 'string'
                            ? reader.result
                            : '',
                      }))
                    }
                    reader.readAsDataURL(file)
                  }}
                  className="hidden"
                  id="photo-input"
                />
                <label
                  htmlFor="photo-input"
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  Scatta/Carica Foto
                </label>
                {formData.photo_evidence && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ {formData.photo_evidence}
                  </p>
                )}
              </div>
            </div>

            {/* Timestamp info */}
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <Clock className="w-4 h-4" />
                <span>Timestamp: {new Date().toLocaleString('it-IT')}</span>
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
              {isCreating ? 'Registrazione...' : 'Registra Lettura'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
