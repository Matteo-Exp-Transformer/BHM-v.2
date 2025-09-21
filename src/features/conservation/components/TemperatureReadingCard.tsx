import { TemperatureReading } from '@/types/conservation'
import {
  Thermometer,
  Clock,
  User,
  Camera,
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

export function TemperatureReadingCard({
  reading,
  onEdit,
  onDelete,
  showActions = true,
}: TemperatureReadingCardProps) {
  const getStatusInfo = () => {
    switch (reading.status) {
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

  const getMethodInfo = () => {
    switch (reading.method) {
      case 'manual':
        return { icon: '✍️', text: 'Manuale' }
      case 'digital_thermometer':
        return { icon: '🌡️', text: 'Termometro Digitale' }
      case 'automatic_sensor':
        return { icon: '📡', text: 'Sensore Automatico' }
      default:
        return { icon: '❓', text: 'Non specificato' }
    }
  }

  const getValidationInfo = () => {
    switch (reading.validation_status) {
      case 'validated':
        return {
          icon: <CheckCircle className="w-3 h-3 text-green-600" />,
          text: 'Validata',
          color: 'text-green-600',
        }
      case 'flagged':
        return {
          icon: <AlertTriangle className="w-3 h-3 text-red-600" />,
          text: 'Segnalata',
          color: 'text-red-600',
        }
      case 'pending':
        return {
          icon: <Clock className="w-3 h-3 text-yellow-600" />,
          text: 'In attesa',
          color: 'text-yellow-600',
        }
    }
  }

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const statusInfo = getStatusInfo()
  const methodInfo = getMethodInfo()
  const validationInfo = getValidationInfo()

  const isOutOfRange =
    reading.temperature < reading.tolerance_range_min! ||
    reading.temperature > reading.tolerance_range_max!

  return (
    <div
      className={`rounded-lg border-2 p-4 transition-all duration-200 hover:shadow-md ${statusInfo.bg} ${statusInfo.border}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${statusInfo.bg}`}>
            <Thermometer
              className={`w-5 h-5 ${reading.status === 'compliant' ? 'text-green-600' : reading.status === 'warning' ? 'text-yellow-600' : 'text-red-600'}`}
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className={`text-2xl font-bold ${statusInfo.color}`}>
                {reading.temperature}°C
              </span>
              {statusInfo.icon}
            </div>
            <div className="text-sm text-gray-600">
              Target: {reading.target_temperature}°C
            </div>
          </div>
        </div>

        {showActions && onEdit && onDelete && (
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onEdit(reading)}
              className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(reading.id)}
              className="p-1 text-gray-600 hover:text-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Temperature Analysis */}
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <div className="text-xs text-gray-600">Range tolleranza</div>
          <div className="text-sm font-medium">
            {reading.tolerance_range_min}°C - {reading.tolerance_range_max}°C
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-600">Scostamento</div>
          <div
            className={`text-sm font-medium ${isOutOfRange ? 'text-red-600' : 'text-green-600'}`}
          >
            {reading.temperature > reading.target_temperature ? '+' : ''}
            {(reading.temperature - reading.target_temperature).toFixed(1)}°C
          </div>
        </div>
      </div>

      {/* Recording Details */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-600" />
            <span className="text-gray-600">
              {formatDateTime(reading.recorded_at)}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            {validationInfo.icon}
            <span className={`text-xs ${validationInfo.color}`}>
              {validationInfo.text}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{methodInfo.icon}</span>
            <span className="text-gray-600">{methodInfo.text}</span>
          </div>
          {reading.photo_evidence && (
            <div className="flex items-center space-x-1">
              <Camera className="w-4 h-4 text-blue-600" />
              <a
                href={reading.photo_evidence}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Foto
              </a>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 text-sm">
          <User className="w-4 h-4 text-gray-600" />
          <span className="text-gray-600">
            Operatore: {reading.recorded_by}
          </span>
        </div>

        {reading.notes && (
          <div className="mt-2 p-2 bg-white bg-opacity-50 rounded text-sm">
            <strong>Note:</strong> {reading.notes}
          </div>
        )}
      </div>

      {/* Status Alert */}
      {reading.status !== 'compliant' && (
        <div
          className={`mt-3 p-2 rounded border ${statusInfo.bg} ${statusInfo.border}`}
        >
          <div className="flex items-center space-x-2">
            {statusInfo.icon}
            <span className={`text-sm font-medium ${statusInfo.color}`}>
              {reading.status === 'warning'
                ? 'Attenzione: Temperatura fuori dal range ottimale'
                : 'Critico: Intervento richiesto immediatamente'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
