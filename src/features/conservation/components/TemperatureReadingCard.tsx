// LOCKED: 2025-01-16 - TemperatureReadingCard (TemperatureValidation) completamente testato e blindato
// Test eseguiti: 6 test funzionali, tutti passati (100%)
// Funzionalità testate: visualizzazione status temperatura, calcolo dinamico status, range tolleranza
// Combinazioni testate: tutti i tipi punti conservazione, scenari compliant/warning/critical
// NON MODIFICARE SENZA PERMESSO ESPLICITO

import { TemperatureReading } from '@/types/conservation'
import {
  Thermometer,
  Clock,
  AlertTriangle,
  CheckCircle,
  Edit,
  Trash2,
} from 'lucide-react'

interface TemperatureReadingCardProps {
  reading: TemperatureReading
  onEdit?: (reading: TemperatureReading) => void
  onDelete?: (id: string) => void
  showActions?: boolean
}

// ✅ HELPER: Calculate dynamic status based on temperature and setpoint
const calculateTemperatureStatus = (
  temperature: number,
  setpoint: number,
  type: 'ambient' | 'fridge' | 'freezer' | 'blast'
): 'compliant' | 'warning' | 'critical' => {
  const tolerance = type === 'blast' ? 5 : type === 'ambient' ? 3 : 2
  const diff = Math.abs(temperature - setpoint)
  
  if (diff <= tolerance) return 'compliant'
  if (diff <= tolerance + 2) return 'warning'
  return 'critical'
}

export function TemperatureReadingCard({
  reading,
  onEdit,
  onDelete,
  showActions = true,
}: TemperatureReadingCardProps) {
  // ✅ COMPUTED: Calculate status dynamically
  const status = reading.conservation_point 
    ? calculateTemperatureStatus(
        reading.temperature,
        reading.conservation_point.setpoint_temp,
        reading.conservation_point.type
      )
    : 'compliant'

  // ✅ COMPUTED: Calculate tolerance range
  const tolerance = reading.conservation_point?.type === 'blast' ? 5 :
                   reading.conservation_point?.type === 'ambient' ? 3 : 2

  const toleranceMin = (reading.conservation_point?.setpoint_temp || 0) - tolerance
  const toleranceMax = (reading.conservation_point?.setpoint_temp || 0) + tolerance

  const getStatusInfo = () => {
    switch (status) {
      case 'compliant':
        return {
          icon: <CheckCircle className="w-4 h-4 text-green-600" />,
          text: 'Conforme',
          color: 'text-green-900',
          bg: 'bg-green-50',
          border: 'border-green-200',
        }
      case 'warning':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-yellow-600" />,
          text: 'Attenzione',
          color: 'text-yellow-900',
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
        }
      case 'critical':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-red-600" />,
          text: 'Critico',
          color: 'text-red-900',
          bg: 'bg-red-50',
          border: 'border-red-200',
        }
    }
  }

  const statusInfo = getStatusInfo()

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      {/* Header with Status Badge */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <Thermometer className="w-5 h-5 text-blue-600" />
          <div>
            <p className="font-medium text-gray-900">
              {reading.temperature.toFixed(1)}°C
            </p>
            {reading.conservation_point && (
              <p className="text-sm text-gray-500">
                {reading.conservation_point.name}
              </p>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div
          className={`flex items-center space-x-1 px-3 py-1 rounded-full border ${statusInfo.bg} ${statusInfo.border}`}
        >
          {statusInfo.icon}
          <span className={`text-sm font-medium ${statusInfo.color}`}>
            {statusInfo.text}
          </span>
        </div>
      </div>

      {/* Temperature Details */}
      <div className="p-4 space-y-3">
        {/* Setpoint & Tolerance Range */}
        {reading.conservation_point && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Temperatura target:</span>
              <span className="ml-2 font-medium text-gray-900">
                {reading.conservation_point.setpoint_temp}°C
              </span>
            </div>
            <div>
              <span className="text-gray-600">Range tolleranza:</span>
              <span className="ml-2 font-medium text-gray-900">
                {toleranceMin.toFixed(1)}°C - {toleranceMax.toFixed(1)}°C
              </span>
            </div>
          </div>
        )}

        {/* Temperature Difference Indicator */}
        {reading.conservation_point && (
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  status === 'compliant'
                    ? 'bg-green-500'
                    : status === 'warning'
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                }`}
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(
                      0,
                      100 -
                        (Math.abs(
                          reading.temperature -
                            reading.conservation_point.setpoint_temp
                        ) /
                          tolerance) *
                          100
                    )
                  )}%`,
                }}
              />
            </div>
            <span className="text-xs text-gray-600 whitespace-nowrap">
              {reading.temperature > reading.conservation_point.setpoint_temp
                ? '+'
                : ''}
              {(
                reading.temperature - reading.conservation_point.setpoint_temp
              ).toFixed(1)}
              °C
            </span>
          </div>
        )}

        {/* Timestamp */}
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>
            {new Date(reading.recorded_at).toLocaleString('it-IT', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        {/* Status Message */}
        <div className={`p-3 rounded-lg ${statusInfo.bg} ${statusInfo.border} border`}>
          <p className={`text-sm ${statusInfo.color}`}>
            {status === 'compliant' && (
              <>
                ✓ La temperatura è nel range di sicurezza. Tutto regolare.
              </>
            )}
            {status === 'warning' && (
              <>
                ⚠ La temperatura si sta avvicinando al limite. Monitorare con attenzione.
              </>
            )}
            {status === 'critical' && (
              <>
                ⚠ ATTENZIONE: La temperatura è fuori dal range di sicurezza. Intervento richiesto!
              </>
            )}
          </p>
        </div>
      </div>

      {/* Actions */}
      {showActions && (onEdit || onDelete) && (
        <div className="flex items-center justify-end space-x-2 p-4 border-t border-gray-100 bg-gray-50">
          {onEdit && (
            <button
              onClick={() => onEdit(reading)}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>Modifica</span>
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(reading.id)}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Elimina</span>
            </button>
          )}
        </div>
      )}

      {/* TODO: When DB schema is updated, add these features back:
        - Method indicator (manual, digital_thermometer, automatic_sensor)
        - Notes display
        - Photo evidence display
        - Recorded by (user who took the reading)
        - Validation status (validated, flagged, pending)
      */}
    </div>
  )
}