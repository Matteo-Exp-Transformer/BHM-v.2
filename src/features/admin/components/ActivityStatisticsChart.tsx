import { useActivityStatistics } from '@/hooks/useActivityTracking'
import type { ActivityFilters, ActivityStatistics } from '@/types/activity'
import {
  BarChart3,
  TrendingUp,
  Activity,
  Users,
  Loader2,
  Calendar,
} from 'lucide-react'

interface ActivityStatisticsChartProps {
  filters?: ActivityFilters
}

export function ActivityStatisticsChart({
  filters,
}: ActivityStatisticsChartProps) {
  const {
    data: statistics = [],
    isLoading,
    error,
  } = useActivityStatistics(filters?.start_date, filters?.end_date)

  const getActivityLabel = (activityType: string) => {
    const labels: Record<string, string> = {
      session_start: 'Login',
      session_end: 'Logout',
      task_completed: 'Task Completati',
      product_added: 'Prodotti Aggiunti',
      product_updated: 'Prodotti Modificati',
      product_deleted: 'Prodotti Eliminati',
      product_transferred: 'Trasferimenti',
      shopping_list_created: 'Liste Create',
      shopping_list_completed: 'Liste Completate',
      staff_added: 'Staff Aggiunti',
      temperature_reading_added: 'Temperature',
      note_created: 'Note Create',
      non_conformity_reported: 'Non Conformità',
    }
    return labels[activityType] || activityType
  }

  const getActivityColor = (activityType: string) => {
    const colors: Record<string, string> = {
      session_start: 'bg-green-500',
      session_end: 'bg-gray-500',
      task_completed: 'bg-blue-500',
      product_added: 'bg-purple-500',
      product_updated: 'bg-indigo-500',
      product_deleted: 'bg-red-500',
      product_transferred: 'bg-pink-500',
      shopping_list_created: 'bg-orange-500',
      shopping_list_completed: 'bg-amber-500',
      staff_added: 'bg-cyan-500',
      temperature_reading_added: 'bg-teal-500',
      note_created: 'bg-gray-400',
      non_conformity_reported: 'bg-red-600',
    }
    return colors[activityType] || 'bg-gray-400'
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          <p className="text-gray-600">Caricamento statistiche...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">
            Errore nel caricamento delle statistiche
          </p>
          <p className="text-red-600 text-sm mt-1">
            {error instanceof Error ? error.message : 'Errore sconosciuto'}
          </p>
        </div>
      </div>
    )
  }

  if (statistics.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-8">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nessuna statistica disponibile
          </h3>
          <p className="text-gray-600">
            Non ci sono dati statistici nel periodo selezionato.
          </p>
        </div>
      </div>
    )
  }

  // Calculate totals
  const totalActivities = statistics.reduce(
    (sum, stat) => sum + stat.activity_count,
    0
  )
  const totalUniqueUsers = new Set(
    statistics.flatMap(stat => stat.unique_users)
  ).size

  const maxCount = Math.max(...statistics.map(stat => stat.activity_count))

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Attività Totali</p>
              <p className="text-3xl font-bold text-gray-900">
                {totalActivities}
              </p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tipi di Attività</p>
              <p className="text-3xl font-bold text-gray-900">
                {statistics.length}
              </p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Utenti Attivi</p>
              <p className="text-3xl font-bold text-gray-900">
                {totalUniqueUsers || statistics[0]?.unique_users || 0}
              </p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Period Info */}
      {(filters?.start_date || filters?.end_date) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-blue-800">
            <Calendar className="h-4 w-4" />
            <span>
              Periodo:{' '}
              {filters.start_date
                ? new Date(filters.start_date).toLocaleDateString('it-IT')
                : 'Inizio'}{' '}
              -{' '}
              {filters.end_date
                ? new Date(filters.end_date).toLocaleDateString('it-IT')
                : 'Oggi'}
            </span>
          </div>
        </div>
      )}

      {/* Statistics Chart */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Distribuzione Attività
          </h3>
          <TrendingUp className="h-5 w-5 text-gray-400" />
        </div>

        <div className="space-y-4">
          {statistics
            .sort((a, b) => b.activity_count - a.activity_count)
            .map((stat: ActivityStatistics) => {
              const percentage = (stat.activity_count / maxCount) * 100

              return (
                <div key={stat.activity_type} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${getActivityColor(
                          stat.activity_type
                        )}`}
                      ></div>
                      <span className="font-medium text-gray-900">
                        {getActivityLabel(stat.activity_type)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-600">
                        {stat.activity_count}{' '}
                        {stat.activity_count === 1
                          ? 'attività'
                          : 'attività'}
                      </span>
                      <span className="text-gray-400 text-xs w-12 text-right">
                        {Math.round((stat.activity_count / totalActivities) * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getActivityColor(
                        stat.activity_type
                      )}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>

                  {/* Additional Info */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 pl-5">
                    <span>
                      {stat.unique_users}{' '}
                      {stat.unique_users === 1 ? 'utente' : 'utenti'}
                    </span>
                    <span>•</span>
                    <span>
                      Ultima:{' '}
                      {new Date(stat.last_activity).toLocaleDateString(
                        'it-IT',
                        {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        }
                      )}
                    </span>
                  </div>
                </div>
              )
            })}
        </div>
      </div>

      {/* Top Activity */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-100 mb-1">Attività Più Frequente</p>
            <p className="text-2xl font-bold">
              {getActivityLabel(
                statistics.sort(
                  (a, b) => b.activity_count - a.activity_count
                )[0].activity_type
              )}
            </p>
            <p className="text-purple-100 mt-1">
              {statistics[0].activity_count} volte
            </p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-full p-4">
            <TrendingUp className="h-8 w-8" />
          </div>
        </div>
      </div>
    </div>
  )
}

