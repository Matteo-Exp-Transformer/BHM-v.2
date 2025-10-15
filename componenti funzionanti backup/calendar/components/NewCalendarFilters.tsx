// ============================================================================
// NEW CALENDAR FILTERS - Filtri Calendario Ricostruiti da Zero
// ============================================================================
// Sistema filtri completo con:
// - Filtro Per Reparto (multi-select)
// - Filtro Per Stato (chips)
// - Filtro Per Tipo (chips)

import { useState, useMemo } from 'react'
import { Filter, X, Building2, Calendar, ListChecks, ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import {
  CalendarFilters,
  EventStatus,
  EventType,
  EVENT_STATUS_LABELS,
  EVENT_TYPE_LABELS,
  EVENT_TYPE_ICONS,
  EVENT_STATUS_COLORS,
  DEFAULT_CALENDAR_FILTERS,
  areAllFiltersEmpty
} from '@/types/calendar-filters'

interface Department {
  id: string
  name: string
  event_count: number // Numero eventi associati
}

interface NewCalendarFiltersProps {
  filters: CalendarFilters
  onFiltersChange: (filters: CalendarFilters) => void
  availableDepartments: Department[] // Solo reparti con eventi
  className?: string
}

export const NewCalendarFilters = ({
  filters,
  onFiltersChange,
  availableDepartments,
  className = ''
}: NewCalendarFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  // Conteggio filtri attivi
  const activeFiltersCount = useMemo(() => {
    return (
      filters.departments.length +
      filters.statuses.length +
      filters.types.length
    )
  }, [filters])

  // Toggle filtri
  const toggleDepartment = (deptId: string) => {
    const newDepartments = filters.departments.includes(deptId)
      ? filters.departments.filter(id => id !== deptId)
      : [...filters.departments, deptId]
    
    onFiltersChange({ ...filters, departments: newDepartments })
  }

  const toggleStatus = (status: EventStatus) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter(s => s !== status)
      : [...filters.statuses, status]
    
    onFiltersChange({ ...filters, statuses: newStatuses })
  }

  const toggleType = (type: EventType) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter(t => t !== type)
      : [...filters.types, type]
    
    onFiltersChange({ ...filters, types: newTypes })
  }

  // Reset filtri
  const resetFilters = () => {
    onFiltersChange(DEFAULT_CALENDAR_FILTERS)
  }

  // Check se tutti filtri attivi
  const allFiltersActive = areAllFiltersEmpty(filters)

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="font-semibold text-gray-900">Filtri Calendario</h3>
          {activeFiltersCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                resetFilters()
              }}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X className="h-4 w-4 mr-1" />
              Reset
            </Button>
          )}
          <div className="p-1 rounded-md hover:bg-gray-100 transition-colors">
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </div>
        </div>
      </div>

      {/* Filtri Content */}
      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* 1. FILTRO PER REPARTO */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="h-4 w-4 text-gray-500" />
              <h4 className="font-medium text-sm text-gray-700">Per Reparto</h4>
              {filters.departments.length > 0 && (
                <span className="text-xs text-gray-500">
                  ({filters.departments.length} selezionati)
                </span>
              )}
            </div>

            {availableDepartments.length === 0 ? (
              <p className="text-sm text-gray-500 italic">
                Nessun reparto con eventi disponibili
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {availableDepartments.map(dept => (
                  <button
                    key={dept.id}
                    onClick={() => toggleDepartment(dept.id)}
                    className={`
                      px-3 py-2 rounded-lg text-sm font-medium transition-all
                      border-2 text-left
                      ${filters.departments.includes(dept.id)
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className="font-semibold">{dept.name}</div>
                    <div className="text-xs text-gray-500">
                      {dept.event_count} eventi
                    </div>
                  </button>
                ))}
              </div>
            )}

            <p className="mt-2 text-xs text-gray-500">
              💡 Eventi senza reparto saranno nascosti quando selezioni un filtro
            </p>
          </div>

          {/* 2. FILTRO PER STATO */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ListChecks className="h-4 w-4 text-gray-500" />
              <h4 className="font-medium text-sm text-gray-700">Per Stato</h4>
              {filters.statuses.length > 0 && (
                <span className="text-xs text-gray-500">
                  ({filters.statuses.length} selezionati)
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {(Object.keys(EVENT_STATUS_LABELS) as EventStatus[]).map(status => {
                const isActive = filters.statuses.includes(status)
                const colors = EVENT_STATUS_COLORS[status]
                
                return (
                  <button
                    key={status}
                    onClick={() => toggleStatus(status)}
                    className={`
                      px-4 py-2 rounded-lg text-sm font-medium transition-all
                      border-2
                      ${isActive
                        ? `${colors.bg} ${colors.text} border-${colors.border.replace('border-', '')}`
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    {EVENT_STATUS_LABELS[status]}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 3. FILTRO PER TIPO */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-gray-500" />
              <h4 className="font-medium text-sm text-gray-700">Per Tipo</h4>
              {filters.types.length > 0 && (
                <span className="text-xs text-gray-500">
                  ({filters.types.length} selezionati)
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {(Object.keys(EVENT_TYPE_LABELS) as EventType[]).map(type => {
                const isActive = filters.types.includes(type)
                const icon = EVENT_TYPE_ICONS[type]
                const label = EVENT_TYPE_LABELS[type]
                
                return (
                  <button
                    key={type}
                    onClick={() => toggleType(type)}
                    className={`
                      px-4 py-2 rounded-lg text-sm font-medium transition-all
                      border-2 flex items-center gap-2
                      ${isActive
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <span>{icon}</span>
                    <span>{label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Come funzionano i filtri:</strong>
            </p>
            <ul className="mt-2 text-xs text-blue-700 space-y-1">
              <li>• <strong>Nessun filtro</strong> = Mostra tutti gli eventi</li>
              <li>• <strong>Filtri attivi</strong> = Mostra solo eventi corrispondenti</li>
              <li>• <strong>Filtri cumulativi</strong> = Gli eventi devono corrispondere a TUTTI i filtri selezionati</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default NewCalendarFilters

