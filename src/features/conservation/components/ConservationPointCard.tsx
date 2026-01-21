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
  ShieldCheck,
} from 'lucide-react'
import {
  PROFILE_LABELS,
  type ConservationProfileId,
} from '@/utils/conservationProfiles'
import {
  getConservationTypeLabel,
  getConservationTypeEmoji,
} from '@/utils/conservationConstants'

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

  // Funzioni rimosse - ora importate da conservationConstants.ts
  // Usare getConservationTypeEmoji(point.type) invece di getTypeIcon()
  // Usare getConservationTypeLabel(point.type) invece di getTypeName()

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
          <div className="text-2xl">{getConservationTypeEmoji(point.type)}</div>
          <div>
            <h3 className={`font-semibold ${typeColors.text}`}>{point.name}</h3>
            <div className="flex items-center space-x-2 text-sm">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">{point.department?.name || 'Reparto non assegnato'}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColors.badge}`}>
                {getConservationTypeLabel(point.type)}
              </span>
            </div>
            {point.profile_id && (
              <div className="mt-1 text-xs text-gray-600 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>
                  Profilo:{' '}
                  {PROFILE_LABELS[point.profile_id as ConservationProfileId] || point.profile_id}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <button
            onClick={() => onEdit(point)}
            className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
            aria-label={`Modifica punto ${point.name}`}
          >
            <Edit className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            onClick={() => onDelete(point.id)}
            className="p-1 text-gray-600 hover:text-red-600 transition-colors"
            aria-label={`Elimina punto ${point.name}`}
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
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
            <div className={`font-semibold ${statusColors.text}`}>
              {getStatusText()}
            </div>
          </div>
        </div>
      </div>

      {/* Last Temperature Reading */}
      {point.last_temperature_reading && (
        <div
          className={`rounded-md ${statusColors.bg} border ${statusColors.border} p-3 mb-3`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Ultima lettura</div>
              <div className={`font-semibold ${statusColors.text}`}>
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
          <div className="text-sm text-gray-600 mb-2">Categorie prodotti:</div>
          <div className="flex flex-wrap gap-2">
            {point.product_categories.map((category, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
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
          {tempRange.optimal !== null && (
            <div className="text-sm">
              <strong>Temperatura ottimale:</strong> {tempRange.optimal}°C
            </div>
          )}
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
