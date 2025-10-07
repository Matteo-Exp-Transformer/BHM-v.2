import { useState } from 'react'
import {
  ConservationPoint,
  CONSERVATION_COLORS,
  CONSERVATION_TYPE_COLORS,
  TEMPERATURE_RANGES,
} from '@/types/conservation'
import {
  Thermometer,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Edit,
  Trash2,
  MapPin,
} from 'lucide-react'

interface ConservationPointCardProps {
  point: ConservationPoint
  onEdit: (point: ConservationPoint) => void
  onDelete: (id: string) => void
}

export function ConservationPointCard({
  point,
  onEdit,
  onDelete,
}: ConservationPointCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const typeColors = CONSERVATION_TYPE_COLORS[point.type] || CONSERVATION_TYPE_COLORS.ambient
  const statusColors = CONSERVATION_COLORS[point.status] || CONSERVATION_COLORS.normal
  const tempRange = TEMPERATURE_RANGES[point.type] || TEMPERATURE_RANGES.ambient

  const getTypeIcon = () => {
    switch (point.type) {
      case 'ambient':
        return '🌡️'
      case 'fridge':
        return '❄️'
      case 'freezer':
        return '🧊'
      case 'blast':
        return '⚡'
      default:
        return '📦'
    }
  }

  const getTypeName = () => {
    switch (point.type) {
      case 'ambient':
        return 'Ambiente'
      case 'fridge':
        return 'Frigorifero'
      case 'freezer':
        return 'Freezer'
      case 'blast':
        return 'Abbattitore'
      default:
        return 'Non definito'
    }
  }

  const getStatusIcon = () => {
    switch (point.status) {
      case 'normal':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-600" />
    }
  }

  const getStatusText = () => {
    switch (point.status) {
      case 'normal':
        return 'Regolare'
      case 'warning':
        return 'Attenzione'
      case 'critical':
        return 'Critico'
    }
  }

  return (
    <div
      className={`rounded-lg border-2 ${typeColors.border} ${typeColors.bg} p-4 transition-all duration-200 hover:shadow-md`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{getTypeIcon()}</div>
          <div>
            <h3 className={`font-semibold ${typeColors.text}`}>{point.name}</h3>
            <div className="flex items-center space-x-2 text-sm">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">{point.department?.name || 'Reparto non assegnato'}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColors.badge}`}>
                {getTypeName()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <button
            onClick={() => onEdit(point)}
            className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(point.id)}
            className="p-1 text-gray-600 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Temperature Info */}
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div className="flex items-center space-x-2">
          <Thermometer className={`w-4 h-4 ${typeColors.text}`} />
          <div>
            <div className="text-sm text-gray-600">Temperatura target</div>
            <div className={`font-semibold ${typeColors.text}`}>
              {point.setpoint_temp}°C
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div
            className={`w-3 h-3 rounded-full ${point.status === 'normal' ? 'bg-green-400' : point.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'}`}
          />
          <div>
            <div className="text-sm text-gray-600">Stato</div>
            <div className={`font-semibold ${colors.text}`}>
              {getStatusText()}
            </div>
          </div>
        </div>
      </div>

      {/* Last Temperature Reading */}
      {point.last_temperature_reading && (
        <div
          className={`rounded-md ${colors.bg} border ${colors.border} p-3 mb-3`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Ultima lettura</div>
              <div className={`font-semibold ${colors.text}`}>
                {point.last_temperature_reading.temperature}°C
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {new Date(
                point.last_temperature_reading.recorded_at
              ).toLocaleDateString('it-IT', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Due */}
      {point.maintenance_due && (
        <div className="flex items-center space-x-2 text-sm">
          <Calendar className="w-4 h-4 text-gray-600" />
          <span className="text-gray-600">
            Prossima manutenzione:{' '}
            {new Date(point.maintenance_due).toLocaleDateString('it-IT')}
          </span>
        </div>
      )}

      {/* Product Categories */}
      {point.product_categories && point.product_categories.length > 0 && (
        <div className="mt-3">
          <div className="text-sm text-gray-600 mb-1">Categorie prodotti:</div>
          <div className="flex flex-wrap gap-1">
            {point.product_categories.map((category, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-white bg-opacity-50 rounded text-xs font-medium"
              >
                {category}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Temperature Range Info */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="mt-3 text-sm text-blue-600 hover:text-blue-800 transition-colors"
      >
        {showDetails ? 'Nascondi dettagli' : 'Mostra dettagli'}
      </button>

      {showDetails && (
        <div className="mt-3 p-3 bg-white bg-opacity-50 rounded border space-y-2">
          <div className="text-sm">
            <strong>Range di temperatura:</strong> {tempRange.min}°C -{' '}
            {tempRange.max}°C
          </div>
          <div className="text-sm">
            <strong>Temperatura ottimale:</strong> {tempRange.optimal}°C
          </div>
          {point.is_blast_chiller && (
            <div className="text-sm text-blue-600">
              <strong>⚡ Abbattitore attivo</strong>
            </div>
          )}
          <div className="text-xs text-gray-500">
            Creato il{' '}
            {new Date(point.created_at).toLocaleDateString('it-IT', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      )}
    </div>
  )
}
