import React from 'react'
import {
  Thermometer,
  Clock,
  AlertTriangle,
  CheckCircle,
  Plus,
  Wrench,
  TrendingUp,
  Calendar,
} from 'lucide-react'
import type { ConservationPoint } from '@/types/conservation'

interface ConservationPointCardProps {
  point: ConservationPoint
  onAddTemperature: () => void
  onAddMaintenance: () => void
}

export function ConservationPointCard({
  point,
  onAddTemperature,
  onAddMaintenance,
}: ConservationPointCardProps) {
  const getStatusColor = (status: ConservationPoint['status']) => {
    switch (status) {
      case 'normal':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: ConservationPoint['status']) => {
    switch (status) {
      case 'normal':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      default:
        return <Thermometer className="w-4 h-4 text-gray-500" />
    }
  }

  const getTypeIcon = (type: ConservationPoint['type']) => {
    switch (type) {
      case 'freezer':
        return '❄️'
      case 'fridge':
        return '🧊'
      case 'blast':
        return '💨'
      case 'ambient':
        return '🌡️'
      default:
        return '📦'
    }
  }

  const getTypeLabel = (type: ConservationPoint['type']) => {
    switch (type) {
      case 'freezer':
        return 'Congelatore'
      case 'fridge':
        return 'Frigorifero'
      case 'blast':
        return 'Abbattitore'
      case 'ambient':
        return 'Ambiente'
      default:
        return type
    }
  }

  const latestReading = point.temperature_readings?.[0]
  const pendingMaintenance =
    point.maintenance_tasks?.filter(
      task => task.is_active && new Date(task.next_due_date) <= new Date()
    ) || []

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  return (
    <div
      className={`bg-white rounded-lg border-2 transition-colors hover:shadow-md ${getStatusColor(point.status)}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getTypeIcon(point.type)}</span>
            <h3 className="font-semibold text-gray-900 truncate">
              {point.name}
            </h3>
          </div>
          {getStatusIcon(point.status)}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{getTypeLabel(point.type)}</span>
          <span className="font-medium">{point.setpoint_temp}°C</span>
        </div>

        {point.department && (
          <div className="mt-1 text-xs text-gray-500">
            📍 {point.department.name}
          </div>
        )}
      </div>

      {/* Temperature Reading */}
      <div className="p-4 border-b border-gray-100">
        {latestReading ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Ultima Lettura</span>
              <span
                className={`text-lg font-bold ${
                  latestReading.status === 'compliant'
                    ? 'text-green-600'
                    : latestReading.status === 'warning'
                      ? 'text-yellow-600'
                      : 'text-red-600'
                }`}
              >
                {latestReading.temperature}°C
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>📅 {formatDate(latestReading.recorded_at)}</span>
              <span
                className={`px-2 py-0.5 rounded-full font-medium ${
                  latestReading.status === 'compliant'
                    ? 'bg-green-100 text-green-700'
                    : latestReading.status === 'warning'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                }`}
              >
                {latestReading.status === 'compliant'
                  ? 'Conforme'
                  : latestReading.status === 'warning'
                    ? 'Attenzione'
                    : 'Critico'}
              </span>
            </div>

            {/* Temperature trend indicator */}
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <TrendingUp className="w-3 h-3" />
              <span>
                Metodo:{' '}
                {latestReading.method === 'manual'
                  ? 'Manuale'
                  : latestReading.method === 'digital_thermometer'
                    ? 'Termometro'
                    : 'Sensore'}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center py-2">
            <Thermometer className="w-6 h-6 text-gray-400 mx-auto mb-1" />
            <p className="text-sm text-gray-500">Nessuna lettura</p>
          </div>
        )}
      </div>

      {/* Maintenance Status */}
      {point.maintenance_tasks && point.maintenance_tasks.length > 0 && (
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Manutenzioni</span>
            {pendingMaintenance.length > 0 && (
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                {pendingMaintenance.length} in scadenza
              </span>
            )}
          </div>

          <div className="space-y-1">
            {point.maintenance_tasks.slice(0, 2).map(task => (
              <div
                key={task.id}
                className="flex items-center justify-between text-xs"
              >
                <span className="text-gray-600 capitalize">{task.kind}</span>
                <span
                  className={`font-medium ${
                    new Date(task.next_due_date) <= new Date()
                      ? 'text-red-600'
                      : 'text-gray-500'
                  }`}
                >
                  {formatDate(task.next_due_date)}
                </span>
              </div>
            ))}
            {point.maintenance_tasks.length > 2 && (
              <div className="text-xs text-gray-500 text-center">
                +{point.maintenance_tasks.length - 2} altre
              </div>
            )}
          </div>
        </div>
      )}

      {/* Product Categories */}
      {point.product_categories && point.product_categories.length > 0 && (
        <div className="p-4 border-b border-gray-100">
          <div className="text-sm text-gray-600 mb-1">Categorie Prodotti</div>
          <div className="flex flex-wrap gap-1">
            {point.product_categories.slice(0, 3).map((category, index) => (
              <span
                key={index}
                className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full"
              >
                {category}
              </span>
            ))}
            {point.product_categories.length > 3 && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{point.product_categories.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onAddTemperature}
            className="flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Thermometer className="w-4 h-4" />
            Temp.
          </button>

          <button
            onClick={onAddMaintenance}
            className="flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Wrench className="w-4 h-4" />
            Manuten.
          </button>
        </div>

        {/* Quick action for overdue items */}
        {pendingMaintenance.length > 0 && (
          <button
            onClick={onAddMaintenance}
            className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <Clock className="w-4 h-4" />
            Manutenzione Urgente
          </button>
        )}
      </div>
    </div>
  )
}
