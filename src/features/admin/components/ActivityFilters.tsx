import { useState, useEffect } from 'react'
import type { ActivityFilters, ActivityType } from '@/types/activity'
import { Filter, X, Calendar } from 'lucide-react'

interface ActivityFiltersProps {
  filters: ActivityFilters
  onFiltersChange: (filters: ActivityFilters) => void
}

export function ActivityFilters({
  filters,
  onFiltersChange,
}: ActivityFiltersProps) {
  const [localFilters, setLocalFilters] = useState<ActivityFilters>(filters)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const handleApplyFilters = () => {
    onFiltersChange(localFilters)
    setIsExpanded(false)
  }

  const handleResetFilters = () => {
    const emptyFilters: ActivityFilters = {}
    setLocalFilters(emptyFilters)
    onFiltersChange(emptyFilters)
  }

  const activityTypes: { value: ActivityType; label: string }[] = [
    { value: 'session_start', label: 'Sessione Iniziata' },
    { value: 'session_end', label: 'Sessione Terminata' },
    { value: 'task_completed', label: 'Task Completato' },
    { value: 'product_added', label: 'Prodotto Aggiunto' },
    { value: 'product_updated', label: 'Prodotto Modificato' },
    { value: 'product_deleted', label: 'Prodotto Eliminato' },
    { value: 'shopping_list_created', label: 'Lista Spesa Creata' },
    { value: 'shopping_list_completed', label: 'Lista Spesa Completata' },
    { value: 'staff_added', label: 'Staff Aggiunto' },
    { value: 'department_created', label: 'Reparto Creato' },
    {
      value: 'conservation_point_created',
      label: 'Punto Conservazione Creato',
    },
    { value: 'temperature_reading_added', label: 'Temperatura Registrata' },
    { value: 'note_created', label: 'Nota Creata' },
    { value: 'non_conformity_reported', label: 'Non Conformità Segnalata' },
    { value: 'export_data', label: 'Dati Esportati' },
  ]

  const hasActiveFilters =
    filters.activity_type ||
    filters.start_date ||
    filters.end_date ||
    filters.user_id

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Filtri</h3>
            {hasActiveFilters && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Attivi
              </span>
            )}
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {isExpanded ? 'Nascondi' : 'Mostra'}
          </button>
        </div>

        {isExpanded && (
          <div className="mt-4 space-y-4">
            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Data Inizio
                </label>
                <input
                  type="date"
                  value={localFilters.start_date || ''}
                  onChange={e =>
                    setLocalFilters({
                      ...localFilters,
                      start_date: e.target.value || undefined,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Data Fine
                </label>
                <input
                  type="date"
                  value={localFilters.end_date || ''}
                  onChange={e =>
                    setLocalFilters({
                      ...localFilters,
                      end_date: e.target.value || undefined,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Activity Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo Attività
              </label>
              <select
                value={localFilters.activity_type || ''}
                onChange={e =>
                  setLocalFilters({
                    ...localFilters,
                    activity_type: e.target.value
                      ? (e.target.value as ActivityType)
                      : undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">Tutti i tipi</option>
                {activityTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Date Filters */}
            <div className="border-t pt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Filtri Rapidi
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    const today = new Date().toISOString().split('T')[0]
                    setLocalFilters({
                      ...localFilters,
                      start_date: today,
                      end_date: today,
                    })
                  }}
                  className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  Oggi
                </button>
                <button
                  onClick={() => {
                    const today = new Date()
                    const weekAgo = new Date(today)
                    weekAgo.setDate(today.getDate() - 7)
                    setLocalFilters({
                      ...localFilters,
                      start_date: weekAgo.toISOString().split('T')[0],
                      end_date: today.toISOString().split('T')[0],
                    })
                  }}
                  className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  Ultimi 7 giorni
                </button>
                <button
                  onClick={() => {
                    const today = new Date()
                    const monthAgo = new Date(today)
                    monthAgo.setMonth(today.getMonth() - 1)
                    setLocalFilters({
                      ...localFilters,
                      start_date: monthAgo.toISOString().split('T')[0],
                      end_date: today.toISOString().split('T')[0],
                    })
                  }}
                  className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  Ultimo mese
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <button
                onClick={handleResetFilters}
                disabled={!hasActiveFilters}
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Reset
              </button>
              <button
                onClick={handleApplyFilters}
                className="px-6 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Applica Filtri
              </button>
            </div>
          </div>
        )}

        {/* Active Filters Summary */}
        {!isExpanded && hasActiveFilters && (
          <div className="mt-3 flex flex-wrap gap-2">
            {filters.activity_type && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                Tipo:{' '}
                {activityTypes.find(t => t.value === filters.activity_type)
                  ?.label || filters.activity_type}
              </span>
            )}
            {filters.start_date && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                Da: {new Date(filters.start_date).toLocaleDateString('it-IT')}
              </span>
            )}
            {filters.end_date && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                A: {new Date(filters.end_date).toLocaleDateString('it-IT')}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}


