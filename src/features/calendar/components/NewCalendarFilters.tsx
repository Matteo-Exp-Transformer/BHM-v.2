// ============================================================================
// NEW CALENDAR FILTERS - Filtri Calendario Ricostruiti da Zero
// ============================================================================
// Sistema filtri completo con:
// - Filtro Per Reparto (multi-select)
// - Filtro Per Tipo (chips)
// - CalendarHeaderFilters: versione compatta per l'header del calendario (solo chips tipo + Reparti)

import { useState, useMemo, useEffect } from 'react'
import { Filter, X, Building2, Calendar, ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import {
  CalendarFilters,
  EventType,
  EVENT_TYPE_LABELS,
  EVENT_TYPE_ICONS,
  DEFAULT_CALENDAR_FILTERS
  // areAllFiltersEmpty
} from '@/types/calendar-filters'

interface Department {
  id: string
  name: string
  event_count: number // Numero eventi associati
}

// ============================================================================
// CALENDAR HEADER FILTERS - Chips compatti per l'header del calendario
// ============================================================================
export interface CalendarHeaderFiltersProps {
  filters: CalendarFilters
  onFiltersChange: (filters: CalendarFilters) => void
  availableDepartments?: Department[]
  isAdmin?: boolean
  className?: string
}

export const CalendarHeaderFilters = ({
  filters,
  onFiltersChange,
  availableDepartments = [],
  isAdmin = false,
  className = ''
}: CalendarHeaderFiltersProps) => {
  const [repartiOpen, setRepartiOpen] = useState(false)

  const toggleType = (type: EventType) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter(t => t !== type)
      : [...filters.types, type]
    onFiltersChange({ ...filters, types: newTypes })
  }

  const toggleDepartment = (deptId: string) => {
    const newDepartments = filters.departments.includes(deptId)
      ? filters.departments.filter(id => id !== deptId)
      : [...filters.departments, deptId]
    onFiltersChange({ ...filters, departments: newDepartments })
  }

  const resetFilters = () => {
    onFiltersChange(DEFAULT_CALENDAR_FILTERS)
  }

  const hasActiveFilters = filters.types.length > 0 || (isAdmin && filters.departments.length > 0)

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {/* Chips per tipo evento */}
      {(Object.keys(EVENT_TYPE_LABELS) as EventType[]).map(type => {
        const isActive = filters.types.includes(type)
        const icon = EVENT_TYPE_ICONS[type]
        const label = EVENT_TYPE_LABELS[type]
        return (
          <button
            key={type}
            type="button"
            onClick={() => toggleType(type)}
            className={`
              px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
              border flex items-center gap-1.5 hover:shadow-md
              ${isActive
                ? 'bg-indigo-50 border-indigo-400 text-indigo-800'
                : 'bg-white border-gray-300 text-gray-700 hover:border-indigo-300'
              }
            `}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </button>
        )
      })}

      {/* Reparti (solo admin) - popover compatto */}
      {isAdmin && availableDepartments.length > 0 && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setRepartiOpen(!repartiOpen)}
            className={`
              px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border flex items-center gap-1.5
              ${filters.departments.length > 0
                ? 'bg-blue-50 border-blue-400 text-blue-800'
                : 'bg-white border-gray-300 text-gray-700 hover:border-blue-300'
              }
            `}
          >
            <Building2 className="h-3.5 w-3.5" />
            Reparti
            {filters.departments.length > 0 && (
              <span className="bg-blue-200 text-blue-800 rounded-full px-1.5 text-[10px]">
                {filters.departments.length}
              </span>
            )}
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          {repartiOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                aria-hidden
                onClick={() => setRepartiOpen(false)}
              />
              <div className="absolute left-0 top-full mt-1 z-20 w-56 max-h-64 overflow-auto bg-white rounded-lg border-2 border-gray-200 shadow-lg p-2">
                {availableDepartments.map(dept => (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => toggleDepartment(dept.id)}
                    className={`
                      w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex justify-between items-center
                      ${filters.departments.includes(dept.id)
                        ? 'bg-blue-50 border border-blue-300 text-blue-800'
                        : 'hover:bg-gray-50 text-gray-700'
                      }
                    `}
                  >
                    <span>{dept.name}</span>
                    <span className="text-xs text-gray-500">{dept.event_count}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {hasActiveFilters && (
        <button
          type="button"
          onClick={resetFilters}
          className="px-2 py-1 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200"
        >
          <X className="h-3.5 w-3.5 inline mr-0.5" />
          Reset
        </button>
      )}
    </div>
  )
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
  const { hasRole } = useAuth()
  const isAdmin = hasRole('admin')

  // Se non admin, azzera filtro reparti (visibile e applicabile solo ad admin)
  useEffect(() => {
    if (!isAdmin && filters.departments.length > 0) {
      onFiltersChange({ ...filters, departments: [] })
    }
  }, [isAdmin, filters.departments.length])

  // Conteggio filtri attivi (esclude reparti se non admin)
  const activeFiltersCount = useMemo(() => {
    const deptCount = isAdmin ? filters.departments.length : 0
    return deptCount + filters.types.length
  }, [filters, isAdmin])

  // Toggle filtri
  const toggleDepartment = (deptId: string) => {
    const newDepartments = filters.departments.includes(deptId)
      ? filters.departments.filter(id => id !== deptId)
      : [...filters.departments, deptId]
    
    onFiltersChange({ ...filters, departments: newDepartments })
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
  // const _allFiltersActive = areAllFiltersEmpty(filters)

  return (
    <div className={`bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-200 shadow-sm ${className}`}>
      {/* Header Moderno */}
      <div 
        className="flex items-center justify-between p-5 border-b-2 border-gray-200 cursor-pointer hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-all duration-200 rounded-t-2xl"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-md">
            <Filter className="h-5 w-5 text-white" />
          </div>
          <h3 className="font-extrabold text-gray-900 text-lg">Filtri Calendario</h3>
          {activeFiltersCount > 0 && (
            <span className="px-3 py-1 text-xs font-bold bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-full border-2 border-indigo-300 shadow-sm">
              {activeFiltersCount} {activeFiltersCount === 1 ? 'filtro' : 'filtri'}
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
              className="text-red-600 hover:text-red-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 font-bold border-2 border-transparent hover:border-red-300 rounded-xl transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            >
              <X className="h-4 w-4 mr-1" />
              Reset
            </Button>
          )}
          <div className="p-2 rounded-xl hover:bg-gradient-to-br hover:from-gray-100 hover:to-gray-200 transition-all duration-200">
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-600" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-600" />
            )}
          </div>
        </div>
      </div>

      {/* Filtri Content - Design Moderno */}
      {isExpanded && (
        <div className="p-6 space-y-6">
          {/* 1. FILTRO PER REPARTO - Solo Admin */}
          {isAdmin && (
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="p-1.5 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                  <Building2 className="h-4 w-4 text-indigo-600" />
                </div>
                <h4 className="font-bold text-sm text-gray-800">🏢 Per Reparto</h4>
                {filters.departments.length > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-blue-100 to-indigo-100 text-indigo-700 rounded-full border border-indigo-300">
                    {filters.departments.length} selezionati
                  </span>
                )}
              </div>

              {availableDepartments.length === 0 ? (
                <p className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded-xl border border-gray-200">
                  Nessun reparto con eventi disponibili
                </p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableDepartments.map(dept => (
                    <button
                      key={dept.id}
                      onClick={() => toggleDepartment(dept.id)}
                      className={`
                        group px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200
                        border-2 text-left hover:-translate-y-1 hover:shadow-lg
                        ${filters.departments.includes(dept.id)
                          ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-indigo-400 text-indigo-800 shadow-md'
                          : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300 text-gray-700 hover:border-indigo-300'
                        }
                      `}
                    >
                      <div className="font-bold mb-1">{dept.name}</div>
                      <div className="text-xs text-gray-600 font-medium">
                        📊 {dept.event_count} eventi
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3">
                <p className="text-xs text-blue-800 font-medium">
                  💡 Eventi senza reparto saranno nascosti quando selezioni un filtro
                </p>
              </div>
            </div>
          )}

          {/* 2. FILTRO PER TIPO */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-1.5 bg-gradient-to-br from-purple-100 to-fuchsia-100 rounded-lg">
                <Calendar className="h-4 w-4 text-purple-600" />
              </div>
              <h4 className="font-bold text-sm text-gray-800">📋 Per Tipo</h4>
              {filters.types.length > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-purple-100 to-fuchsia-100 text-purple-700 rounded-full border border-purple-300">
                  {filters.types.length} selezionati
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              {(Object.keys(EVENT_TYPE_LABELS) as EventType[]).map(type => {
                const isActive = filters.types.includes(type)
                const icon = EVENT_TYPE_ICONS[type]
                const label = EVENT_TYPE_LABELS[type]
                
                return (
                  <button
                    key={type}
                    onClick={() => toggleType(type)}
                    className={`
                      px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200
                      border-2 flex items-center gap-2.5 hover:-translate-y-1 hover:shadow-lg
                      ${isActive
                        ? 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-400 text-indigo-800 shadow-md'
                        : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300 text-gray-700 hover:border-indigo-300'
                      }
                    `}
                  >
                    <span className="text-base">{icon}</span>
                    <span>{label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Info Box - Design Moderno */}
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl p-5 shadow-sm">
            <p className="text-sm font-extrabold text-indigo-900 mb-3 flex items-center gap-2">
              <span className="text-lg">ℹ️</span>
              Come funzionano i filtri:
            </p>
            <ul className="text-xs text-indigo-800 space-y-2 font-medium">
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span><strong className="font-extrabold">Nessun filtro</strong> = Mostra tutti gli eventi</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span><strong className="font-extrabold">Filtri attivi</strong> = Mostra solo eventi corrispondenti</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span><strong className="font-extrabold">Filtri cumulativi</strong> = Gli eventi devono corrispondere a TUTTI i filtri selezionati</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default NewCalendarFilters

