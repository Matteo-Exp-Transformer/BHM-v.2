import {
  Thermometer,
  AlertTriangle,
  CheckCircle,
  Activity,
  Target,
  Wrench,
} from 'lucide-react'
import type { ConservationStats as StatsType } from '@/types/conservation'

interface ConservationStatsProps {
  stats: StatsType
}

export function ConservationStats({ stats }: ConservationStatsProps) {
  const getComplianceBadge = (rate: number) => {
    if (rate >= 95) return 'bg-green-100 text-green-800'
    if (rate >= 85) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const statCards: Array<{
    title: string
    value: string | number
    icon: React.ComponentType<{ className?: string }>
    color: string
    description: string
  }> = [
    {
      title: 'Punti Totali',
      value: stats.total_points,
      icon: Thermometer,
      color: 'bg-blue-50 text-blue-600',
      description: 'Punti di conservazione attivi',
    },
    {
      title: 'Conformità Temperature',
      value: `${Math.round(stats.temperature_compliance_rate)}%`,
      icon: Target,
      color: getComplianceBadge(stats.temperature_compliance_rate),
      description: 'Letture temperature conformi',
    },
    {
      title: 'Conformità Manutenzioni',
      value: `${Math.round(stats.maintenance_compliance_rate)}%`,
      icon: Wrench,
      color: getComplianceBadge(stats.maintenance_compliance_rate),
      description: 'Manutenzioni completate in tempo',
    },
    {
      title: 'Avvisi Attivi',
      value: stats.alerts_count,
      icon: AlertTriangle,
      color:
        stats.alerts_count > 0
          ? 'bg-red-100 text-red-800'
          : 'bg-green-100 text-green-800',
      description: 'Richiede attenzione immediata',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div
            key={index}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              {stat.title.includes('Conformità') && (
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium ${stat.color}`}
                >
                  {stat.value}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-600">
                  {stat.title}
                </h3>
                {!stat.title.includes('Conformità') && (
                  <span className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">{stat.description}</p>
            </div>

            {/* Progress bar for compliance rates */}
            {stat.title.includes('Conformità') && (
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      parseFloat(String(stat.value)) >= 95
                        ? 'bg-green-500'
                        : parseFloat(String(stat.value)) >= 85
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    }`}
                    style={{
                      width: `${Math.min(parseFloat(String(stat.value)), 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )
      })}

      {/* Detailed breakdown */}
      {Object.keys(stats.by_type ?? {}).length > 0 && (
        <div className="md:col-span-2 lg:col-span-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-gray-600" />
              Distribuzione per Tipo
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(stats.by_type ?? {}).map(([type, count]) => {
                const typeLabels: Record<string, string> = {
                  fridge: 'Frigoriferi',
                  freezer: 'Congelatori',
                  blast: 'Abbattitori',
                  ambient: 'Ambiente',
                }

                const typeIcons: Record<string, string> = {
                  fridge: '🧊',
                  freezer: '❄️',
                  blast: '💨',
                  ambient: '🌡️',
                }

                return (
                  <div
                    key={type}
                    className="text-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="text-2xl mb-1">
                      {typeIcons[type] || '📦'}
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {count}
                    </div>
                    <div className="text-xs text-gray-600">
                      {typeLabels[type] || type}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Status breakdown */}
      {Object.keys(stats.by_status ?? {}).length > 0 && (
        <div className="md:col-span-2 lg:col-span-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-gray-600" />
              Stato Operativo
            </h3>

            <div className="grid grid-cols-3 gap-4">
              {Object.entries(stats.by_status ?? {}).map(([status, count]) => {
                const statusConfig = {
                  normal: {
                    label: 'Normale',
                    icon: CheckCircle,
                    color: 'text-green-600',
                    bg: 'bg-green-50',
                    border: 'border-green-200',
                  },
                  warning: {
                    label: 'Attenzione',
                    icon: AlertTriangle,
                    color: 'text-yellow-600',
                    bg: 'bg-yellow-50',
                    border: 'border-yellow-200',
                  },
                  critical: {
                    label: 'Critico',
                    icon: AlertTriangle,
                    color: 'text-red-600',
                    bg: 'bg-red-50',
                    border: 'border-red-200',
                  },
                }

                const config = statusConfig[status as keyof typeof statusConfig]
                if (!config) return null

                const Icon = config.icon

                return (
                  <div
                    key={status}
                    className={`p-4 rounded-lg border-2 ${config.bg} ${config.border}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={`w-5 h-5 ${config.color}`} />
                      <span className={`text-2xl font-bold ${config.color}`}>
                        {count}
                      </span>
                    </div>
                    <div className={`text-sm font-medium ${config.color}`}>
                      {config.label}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
