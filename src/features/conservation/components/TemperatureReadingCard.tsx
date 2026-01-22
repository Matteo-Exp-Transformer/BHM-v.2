import { TemperatureReading } from '@/types/conservation'
import {
  Thermometer,
  Clock,
  AlertTriangle,
  CheckCircle,
  Edit,
  Trash2,
  User,
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
  const toleranceMin = setpoint - tolerance
  const toleranceMax = setpoint + tolerance
  
  // Conforme: temperatura esattamente uguale al target
  if (temperature === setpoint) return 'compliant'
  
  // Attenzione: temperatura diversa dal target MA nel range di tolleranza
  if (temperature >= toleranceMin && temperature <= toleranceMax) return 'warning'
  
  // Critico: temperatura fuori dal range di tolleranza
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
          {reading.conservation_point && (
            <p className="text-base font-medium text-gray-900">
              {reading.conservation_point.name}
            </p>
          )}
          {/* Timestamp allineato verticalmente */}
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
        </div>

        {/* Temperature towards center with target and range */}
        <div className="flex-1 flex flex-col justify-center items-center px-8">
          {/* Riga alta: Temperatura Rilevata */}
          {reading.conservation_point && (() => {
            const temp = reading.temperature
            const target = reading.conservation_point.setpoint_temp
            const isEqual = temp === target
            const isInRange = temp >= toleranceMin && temp <= toleranceMax
            
            let tempColor = 'text-red-700'
            if (isEqual) {
              tempColor = 'text-green-700'
            } else if (isInRange) {
              tempColor = 'text-yellow-600'
            }
            
            return (
              <p className="text-base">
                <span className="text-gray-900 font-medium">Temperatura Rilevata: </span>
                <span className={`font-bold ${tempColor}`}>
                  {reading.temperature.toFixed(1)}°C
                </span>
              </p>
            )
          })()}
          {/* Riga sotto: Temperatura target e Range tolleranza */}
          {reading.conservation_point && (
            <div className="flex items-center gap-4 mt-1">
              <p className="text-sm">
                <span className="text-gray-900 font-medium">Temperatura target: </span>
                <span className="font-bold text-green-700">
                  {reading.conservation_point.setpoint_temp}°C
                </span>
              </p>
              <p className="text-sm">
                <span className="text-gray-900 font-medium">Range tolleranza: </span>
                <span className="font-bold text-yellow-600">
                  {toleranceMin.toFixed(1)}°C - {toleranceMax.toFixed(1)}°C
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Status Badge - pushed to right with ml-auto */}
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
        {/* User who recorded */}
        {reading.recorded_by_user && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <User className="w-4 h-4" />
            <span>
              Rilevato da:{' '}
              {reading.recorded_by_user.name ||
                (reading.recorded_by_user.first_name &&
                  reading.recorded_by_user.last_name
                  ? `${reading.recorded_by_user.first_name} ${reading.recorded_by_user.last_name}`
                  : 'Utente sconosciuto')}
            </span>
          </div>
        )}

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
              aria-label={`Modifica lettura temperatura ${reading.temperature}°C`}
            >
              <Edit className="w-4 h-4" aria-hidden="true" />
              <span>Modifica</span>
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(reading.id)}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50 transition-colors"
              aria-label={`Elimina lettura temperatura ${reading.temperature}°C`}
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
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

// Default export for compatibility
export default TemperatureReadingCard