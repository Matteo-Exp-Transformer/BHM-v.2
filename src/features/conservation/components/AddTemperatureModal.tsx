import React, { useState, useEffect } from 'react'
import {
  TemperatureReading,
  ConservationPoint,
  getTemperatureStatus,
} from '@/types/conservation'
import {
  X,
  Thermometer,
  Camera,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface AddTemperatureModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (
    data: Omit<TemperatureReading, 'id' | 'company_id' | 'created_at'>
  ) => void
  conservationPoint: ConservationPoint
  isLoading?: boolean
}

const RECORDING_METHODS = [
  { value: 'manual', label: 'Manuale', icon: '✍️' },
  { value: 'digital_thermometer', label: 'Termometro Digitale', icon: '🌡️' },
  { value: 'automatic_sensor', label: 'Sensore Automatico', icon: '📡' },
]

export function AddTemperatureModal({
  isOpen,
  onClose,
  onSave,
  conservationPoint,
  isLoading,
}: AddTemperatureModalProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    temperatureInput: String(conservationPoint.setpoint_temp),
    method: 'digital_thermometer' as const,
    notes: '',
    photo_evidence: '',
  })

  const [predictedStatus, setPredictedStatus] = useState<
    'compliant' | 'warning' | 'critical'
  >('compliant')

  // Calculate tolerance ranges based on conservation point type
  const getToleranceRange = () => {
    switch (conservationPoint.type) {
      case 'fridge':
        return {
          min: conservationPoint.setpoint_temp - 2,
          max: conservationPoint.setpoint_temp + 2,
        }
      case 'freezer':
        return {
          min: conservationPoint.setpoint_temp - 2,
          max: conservationPoint.setpoint_temp + 2,
        }
      case 'blast':
        return {
          min: conservationPoint.setpoint_temp - 5,
          max: conservationPoint.setpoint_temp + 5,
        }
      case 'ambient':
        return {
          min: conservationPoint.setpoint_temp - 3,
          max: conservationPoint.setpoint_temp + 3,
        }
      default:
        return {
          min: conservationPoint.setpoint_temp - 2,
          max: conservationPoint.setpoint_temp + 2,
        }
    }
  }

  const toleranceRange = getToleranceRange()

  useEffect(() => {
    let tolerance = 2
    switch (conservationPoint.type) {
      case 'blast':
        tolerance = 5
        break
      case 'ambient':
        tolerance = 3
        break
    }
    const num = parseFloat(formData.temperatureInput)
    const temperature = Number.isFinite(num) ? num : 0
    const status = getTemperatureStatus(
      temperature,
      conservationPoint.setpoint_temp,
      tolerance
    )
    setPredictedStatus(status === 'normal' ? 'compliant' : status)
  }, [
    formData.temperatureInput,
    conservationPoint.setpoint_temp,
    conservationPoint.type,
  ])

  useEffect(() => {
    if (isOpen) {
      setFormData({
        temperatureInput: String(conservationPoint.setpoint_temp),
        method: '' as any,
        notes: '',
        photo_evidence: '',
      })
    }
  }, [isOpen, conservationPoint.setpoint_temp])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const num = parseFloat(formData.temperatureInput)
    if (!Number.isFinite(num)) {
      return
    }
    console.log('💾 Saving temperature reading with user:', user?.id)
    onSave({
      conservation_point_id: conservationPoint.id,
      temperature: num,
      recorded_at: new Date(),
      method: formData.method,
      notes: formData.notes || null,
      photo_evidence: formData.photo_evidence || null,
      recorded_by: user?.id || null,
    })
  }

  const getStatusInfo = () => {
    switch (predictedStatus) {
      case 'compliant':
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
          text: 'Conforme',
          color: 'text-green-900',
          bg: 'bg-green-50',
          border: 'border-green-200',
        }
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
          text: 'Attenzione',
          color: 'text-yellow-900',
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
        }
      case 'critical':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
          text: 'Critico',
          color: 'text-red-900',
          bg: 'bg-red-50',
          border: 'border-red-200',
        }
      default:
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
          text: 'Conforme',
          color: 'text-green-900',
          bg: 'bg-green-50',
          border: 'border-green-200',
        }
    }
  }

  if (!isOpen) return null

  const statusInfo = getStatusInfo() || {
    icon: <CheckCircle className="w-5 h-5 text-green-600" />,
    text: 'Conforme',
    color: 'text-green-900',
    bg: 'bg-green-50',
    border: 'border-green-200',
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">Registra Temperatura</h2>
            <p className="text-sm text-gray-600">{conservationPoint.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Target Temperature Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Thermometer className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">
                Informazioni Punto
              </span>
            </div>
            <div className="text-sm text-blue-800 space-y-1">
              <div>
                Temperatura target:{' '}
                <strong>{conservationPoint.setpoint_temp}°C</strong>
              </div>
              <div>
                Range tolleranza:{' '}
                <strong>
                  {toleranceRange.min}°C - {toleranceRange.max}°C
                </strong>
              </div>
              <div>
                Tipo:{' '}
                <strong>
                  {conservationPoint.type === 'fridge'
                    ? 'Frigorifero'
                    : conservationPoint.type === 'freezer'
                      ? 'Freezer'
                      : conservationPoint.type === 'blast'
                        ? 'Abbattitore'
                        : 'Ambiente'}
                </strong>
              </div>
            </div>
          </div>

          {/* Temperature Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Temperatura rilevata (°C) *
            </label>
            <input
              type="number"
              required
              step="0.1"
              inputMode="decimal"
              value={formData.temperatureInput}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  temperatureInput: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="es. 4.2 o -18"
            />
          </div>

          {/* Status Preview */}
          <div
            className={`rounded-lg border p-4 ${statusInfo.bg} ${statusInfo.border}`}
          >
            <div className="flex items-center space-x-2">
              {statusInfo.icon}
              <span className={`font-medium ${statusInfo.color}`}>
                Stato: {statusInfo.text}
              </span>
            </div>
            {predictedStatus !== 'compliant' && (
              <div className={`text-sm mt-1 ${statusInfo.color}`}>
                {predictedStatus === 'warning'
                  ? 'Temperatura fuori dal range ottimale'
                  : 'Temperatura in range critico - Azione richiesta'}
              </div>
            )}
          </div>

          {/* Recording Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Metodo di rilevazione *
            </label>
            <div className="space-y-2">
              {RECORDING_METHODS.map(method => (
                <label
                  key={method.value}
                  className="flex items-center space-x-3 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="method"
                    value={method.value}
                    checked={formData.method === method.value}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        method: e.target.value as any,
                      }))
                    }
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-lg">{method.icon}</span>
                  <span className="text-sm">{method.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note aggiuntive
            </label>
            <textarea
              value={formData.notes}
              onChange={e =>
                setFormData(prev => ({ ...prev, notes: e.target.value }))
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Osservazioni, condizioni particolari..."
            />
          </div>

          {/* Photo Evidence */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Camera className="w-4 h-4 inline mr-1" />
              Foto evidenza (URL)
            </label>
            <input
              type="url"
              value={formData.photo_evidence}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  photo_evidence: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Opzionale: URL della foto del termometro o del punto di
              misurazione
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Registrando...' : 'Registra'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
