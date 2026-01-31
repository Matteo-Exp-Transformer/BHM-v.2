import { ConservationPoint, TemperatureReading } from '@/types/conservation'
import { TemperaturePointStatus } from '@/features/conservation/hooks/useTemperatureReadings'
import { CheckCircle, AlertTriangle, RefreshCw, Circle, Thermometer } from 'lucide-react'

interface TemperaturePointStatusCardProps {
  point: ConservationPoint
  latestReading?: TemperatureReading
  status: TemperaturePointStatus
  onAddReading: () => void
  onCorrectiveAction?: () => void
  /** Evidenzia la card (es. dopo click sul badge Attenzione) */
  highlighted?: boolean
  /** Chiamato al click sulla card quando era evidenziata */
  onHighlightDismiss?: () => void
}

const STATUS_CONFIG = {
  conforme: {
    label: 'Conforme',
    borderColor: 'border-green-500',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    icon: CheckCircle,
    iconColor: 'text-green-500',
  },
  critico: {
    label: 'Critico',
    borderColor: 'border-red-500',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    icon: AlertTriangle,
    iconColor: 'text-red-500',
  },
  richiesta_lettura: {
    label: 'Richiesta lettura',
    borderColor: 'border-orange-500',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    icon: RefreshCw,
    iconColor: 'text-orange-500',
  },
  nessuna_lettura: {
    label: 'Nessuna lettura',
    borderColor: 'border-gray-400',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    icon: Circle,
    iconColor: 'text-gray-400',
  },
} as const

export function TemperaturePointStatusCard({
  point,
  latestReading,
  status,
  onAddReading,
  onCorrectiveAction,
  highlighted = false,
  onHighlightDismiss,
}: TemperaturePointStatusCardProps) {
  const config = STATUS_CONFIG[status]
  const Icon = config.icon

  const isClickable = status === 'nessuna_lettura' || status === 'richiesta_lettura'
  const canClick = isClickable || (highlighted && onHighlightDismiss)

  const handleCardClick = () => {
    if (highlighted && onHighlightDismiss) {
      onHighlightDismiss()
    }
    if (isClickable) {
      onAddReading()
    }
  }

  return (
    <div
      className={`
        relative rounded-lg border-2 p-4 transition-all min-h-[246px] flex flex-col
        ${config.borderColor} ${config.bgColor}
        ${canClick ? 'cursor-pointer hover:shadow-md' : 'cursor-default'}
        ${highlighted ? 'ring-4 ring-amber-400 ring-offset-2 animate-pulse shadow-lg' : ''}
      `}
      onClick={handleCardClick}
    >
      {/* Point Name & Department */}
      <div className="mb-2 flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{point.name}</h3>
          {point.department?.name && (
            <p className="text-xs text-gray-500 mt-0.5">{point.department.name}</p>
          )}
        </div>
        <Thermometer className="h-5 w-5 text-gray-400 shrink-0" />
      </div>

      {/* Temperature Display */}
      <div className="mb-3">
        {latestReading ? (
          <p className="text-3xl font-bold text-gray-900">
            {latestReading.temperature.toFixed(1)}°C
          </p>
        ) : (
          <p className="text-2xl font-medium text-gray-400">--</p>
        )}
        <p className="text-sm text-gray-500">
          Setpoint: {point.setpoint_temp.toFixed(1)}°C
        </p>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`h-4 w-4 ${config.iconColor}`} />
        <span className={`text-sm font-medium ${config.textColor}`}>
          {config.label}
        </span>
      </div>

      {/* Action Buttons - area a altezza fissa per uniformare le card */}
      <div className="flex gap-2 min-h-[40px] flex-shrink-0">
        {status === 'critico' && onCorrectiveAction && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onHighlightDismiss?.()
              onCorrectiveAction()
            }}
            className="flex-1 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
          >
            Correggi
          </button>
        )}

        {status === 'richiesta_lettura' && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onHighlightDismiss?.()
              onAddReading()
            }}
            className="flex-1 rounded-md bg-orange-600 px-3 py-2 text-sm font-medium text-white hover:bg-orange-700 transition-colors"
          >
            Registra Lettura
          </button>
        )}

        {status === 'nessuna_lettura' && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onHighlightDismiss?.()
              onAddReading()
            }}
            className="flex-1 rounded-md bg-gray-600 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
          >
            Prima Lettura
          </button>
        )}
      </div>

      {/* Last Reading Time (if available) */}
      {latestReading && (
        <div className="mt-2 text-xs text-gray-500">
          Ultima lettura: {new Date(latestReading.recorded_at).toLocaleString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })}
          {latestReading.recorded_by_user && (() => {
            const u = latestReading.recorded_by_user!
            const name = u.name || `${u.first_name || ''} ${u.last_name || ''}`.trim()
            return name ? <> da {name}</> : null
          })()}
        </div>
      )}
    </div>
  )
}
