import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { startOfDay, endOfDay } from 'date-fns'
import { Wrench, ChevronRight, ChevronDown, Clock, User, CheckCircle2, AlertCircle, Calendar } from 'lucide-react'
import { CollapsibleCard } from '@/components/ui/CollapsibleCard'
import { useConservationPoints } from '@/features/conservation/hooks/useConservationPoints'
import { useMaintenanceTasks } from '@/features/conservation/hooks/useMaintenanceTasks'
import { useTemperatureReadings, getLatestReadingByPoint } from '@/features/conservation/hooks/useTemperatureReadings'
import type { MaintenanceTask } from '@/types/conservation'
import { STAFF_ROLES, STAFF_CATEGORIES } from '@/utils/haccpRules'

// Tipi per il calcolo dello stato settimanale
type WeeklyStatus = 'green' | 'yellow' | 'red'

interface ConservationPointWithStatus {
  id: string
  name: string
  status: WeeklyStatus
  maintenances: MaintenanceTask[]
}

// Mappa dei nomi delle manutenzioni obbligatorie (max 4 tipologie)
const MANDATORY_MAINTENANCE_TYPES = {
  temperature: 'Rilevamento Temperature',
  sanitization: 'Sanificazione',
  defrosting: 'Sbrinamento',
  expiry_check: 'Controllo Scadenze',
} as const

// Ordine fisso per mostrare sempre le 4 tipologie (prossima per data dentro ogni tipo)
const MAINTENANCE_TYPE_ORDER: (keyof typeof MANDATORY_MAINTENANCE_TYPES)[] = [
  'temperature',
  'sanitization',
  'defrosting',
  'expiry_check',
]

/**
 * Ottiene l'inizio e la fine della settimana ISO corrente (lunedì-domenica) in Europe/Rome
 */
function getCurrentWeekBounds(): { start: Date; end: Date } {
  const now = new Date()
  
  // Ottieni il giorno della settimana (0 = domenica, 1 = lunedì, ..., 6 = sabato)
  const dayOfWeek = now.getDay()
  
  // Calcola i giorni da sottrarre per arrivare al lunedì
  // Se domenica (0), sottrai 6; se lunedì (1), sottrai 0; se martedì (2), sottrai 1, etc.
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  
  // Inizio settimana (lunedì alle 00:00:00)
  const start = new Date(now)
  start.setDate(now.getDate() - daysToMonday)
  start.setHours(0, 0, 0, 0)
  
  // Fine settimana (domenica alle 23:59:59)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  
  return { start, end }
}

/**
 * Calcola lo stato del pallino per un punto di conservazione (allineato alle scadenze giornaliere).
 * Rosso: almeno una manutenzione in ritardo (scadenza prima di oggi).
 * Giallo: almeno una manutenzione da completare oggi (scadenza nella giornata corrente).
 * Verde: nessuna in ritardo e nessuna da completare oggi (tutto allineato alle scadenze giornaliere).
 */
function calculateWeeklyStatus(maintenances: MaintenanceTask[]): WeeklyStatus {
  const now = new Date()
  const todayStart = startOfDay(now)
  const todayEnd = endOfDay(now)

  let hasOverdue = false
  let hasDueToday = false

  for (const task of maintenances) {
    const nextDue = new Date(task.next_due)
    if (nextDue < todayStart) hasOverdue = true
    if (nextDue >= todayStart && nextDue <= todayEnd) hasDueToday = true
  }

  if (hasOverdue) return 'red'
  if (hasDueToday) return 'yellow'
  return 'green'
}

/**
 * Componente pallino di stato
 */
function StatusIndicator({ status }: { status: WeeklyStatus }) {
  const colors = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
  }
  
  const labels = {
    green: 'Tutto regolare',
    yellow: 'Manutenzione in scadenza',
    red: 'Manutenzione in ritardo',
  }
  
  return (
    <div className="flex items-center gap-2">
      <div
        className={`h-3 w-3 rounded-full ${colors[status]}`}
        aria-label={labels[status]}
        title={labels[status]}
      />
    </div>
  )
}

/**
 * Card con elenco punti di conservazione e relative manutenzioni
 */
/** Task "Rilevamento Temperature" considerato soddisfatto se c'è una lettura nel giorno di next_due o dopo (come in pointCheckup) */
function isTemperatureTaskSatisfiedByReading(
  task: MaintenanceTask,
  lastReading: { recorded_at: string } | undefined
): boolean {
  if (task.type !== 'temperature') return false
  if (!lastReading) return false
  const recordedAt = new Date(lastReading.recorded_at)
  const taskDue = new Date(task.next_due)
  return recordedAt >= startOfDay(taskDue)
}

export function ScheduledMaintenanceCard() {
  const navigate = useNavigate()
  const { conservationPoints, isLoading: loadingPoints } = useConservationPoints()
  const { maintenanceTasks, isLoading: loadingTasks } = useMaintenanceTasks()
  const { data: temperatureReadings } = useTemperatureReadings()
  const [expandedPointId, setExpandedPointId] = useState<string | null>(null)
  const [expandedMaintenanceTypes, setExpandedMaintenanceTypes] = useState<Set<string>>(new Set())
  
  // Raggruppa le manutenzioni per punto di conservazione con calcolo stato
  const pointsWithStatus = useMemo<ConservationPointWithStatus[]>(() => {
    if (!conservationPoints || !maintenanceTasks) return []
    
    return conservationPoints.map(point => {
      const lastReading = getLatestReadingByPoint(temperatureReadings ?? [], point.id)
      // Task completati oggi: non contarli come "da fare oggi" per il pallino
      const todayStart = startOfDay(new Date())
      const isCompletedToday = (task: MaintenanceTask) => {
        const lc = task.last_completed
        if (!lc) return false
        const d = lc instanceof Date ? lc : new Date(lc)
        return d >= todayStart
      }
      // Lista per display: tutte le manutenzioni obbligatorie del punto (prossima data per tipo)
      // così si vedono sempre le 4 tipologie con la prossima scadenza, anche dopo completamento
      const pointMaintenancesForDisplay = maintenanceTasks
        .filter(
          task => task.conservation_point_id === point.id &&
                  Object.keys(MANDATORY_MAINTENANCE_TYPES).includes(task.type) &&
                  task.status !== 'completed' &&
                  !isTemperatureTaskSatisfiedByReading(task, lastReading)
        )
        .sort((a, b) => {
          const dateA = new Date(a.next_due).getTime()
          const dateB = new Date(b.next_due).getTime()
          return dateA - dateB
        })
      // Per il pallino: escludi completati oggi così il pallino è verde se tutto fatto oggi
      const pointMaintenancesForStatus = pointMaintenancesForDisplay.filter(t => !isCompletedToday(t))
      
      return {
        id: point.id,
        name: point.name,
        status: calculateWeeklyStatus(pointMaintenancesForStatus),
        maintenances: pointMaintenancesForDisplay,
      }
    })
  }, [conservationPoints, maintenanceTasks, temperatureReadings])
  
  const togglePoint = (pointId: string) => {
    setExpandedPointId(prev => prev === pointId ? null : pointId)
  }
  
  // Formatta la data per visualizzazione
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date)
  }
  
  // Formatta il nome del tipo di manutenzione
  const getMaintenanceName = (type: string): string => {
    return MANDATORY_MAINTENANCE_TYPES[type as keyof typeof MANDATORY_MAINTENANCE_TYPES] || type
  }

  // Formatta i dettagli assegnazione (ruolo + categoria + reparto + dipendente)
  const formatAssignmentDetails = (task: MaintenanceTask): string => {
    const parts: string[] = []

    // Ruolo
    if (task.assigned_to_role) {
      const roleLabel = STAFF_ROLES.find(r => r.value === task.assigned_to_role)?.label || task.assigned_to_role
      parts.push(roleLabel)
    }

    // Reparto (da conservation_point.department)
    if (task.conservation_point?.department?.name) {
      parts.push(task.conservation_point.department.name)
    }

    // Categoria
    if (task.assigned_to_category) {
      const categoryLabel = STAFF_CATEGORIES.find(c => c.value === task.assigned_to_category)?.label || task.assigned_to_category
      parts.push(categoryLabel)
    }

    // Dipendente specifico
    if (task.assigned_user?.name) {
      parts.push(task.assigned_user.name)
    }

    return parts.length > 0 ? parts.join(' • ') : 'Non assegnato'
  }

  // Raggruppa manutenzioni per tipo e ordina per next_due
  const groupMaintenancesByType = (tasks: MaintenanceTask[]): Record<string, MaintenanceTask[]> => {
    const grouped: Record<string, MaintenanceTask[]> = {}
    
    tasks.forEach(task => {
      if (!grouped[task.type]) {
        grouped[task.type] = []
      }
      grouped[task.type].push(task)
    })

    // Ordina ogni gruppo per next_due (già ordinato dal useMemo, ma assicuriamoci)
    Object.keys(grouped).forEach(type => {
      grouped[type].sort((a, b) => {
        const dateA = new Date(a.next_due).getTime()
        const dateB = new Date(b.next_due).getTime()
        return dateA - dateB
      })
    })

    return grouped
  }

  // Rendering manutenzione singola (riutilizzabile)
  const renderMaintenanceTask = (task: MaintenanceTask) => {
    const isCompleted = task.status === 'completed'
    const isOverdue = new Date(task.next_due) < new Date() && !isCompleted

    return (
      <div
        key={task.id}
        className="flex items-start justify-between rounded-lg border border-gray-200 bg-white p-3 text-sm"
      >
        <div className="flex-1 space-y-1">
          {/* Tipo manutenzione */}
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">
              {getMaintenanceName(task.type)}
            </span>
            {isCompleted && (
              <CheckCircle2
                className="h-4 w-4 text-green-600"
                aria-label="Completata"
              />
            )}
            {isOverdue && (
              <AlertCircle
                className="h-4 w-4 text-red-600"
                aria-label="In ritardo"
              />
            )}
          </div>
          
          {/* Prossima scadenza */}
          <div className="flex items-center gap-1.5 text-gray-600">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            <span>
              Scadenza: {formatDate(task.next_due)}
            </span>
            {isOverdue && (
              <span className="ml-1 text-red-600 font-medium">
                (In ritardo)
              </span>
            )}
          </div>
          
          {/* Assegnato a */}
          <div className="flex items-center gap-1.5 text-gray-600">
            <User className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="text-sm">
              Assegnato a: {formatAssignmentDetails(task)}
            </span>
          </div>
          
          {/* Data completamento (se completata) */}
          {isCompleted && task.last_completed && (
            <div className="text-xs text-green-700">
              Completata il: {formatDate(task.last_completed)}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            navigate('/attivita', {
              state: {
                openMacroCategory: 'maintenance',
                date: new Date(task.next_due).toISOString(),
                highlightMaintenanceTaskId: task.id
              }
            })
          }}
          className="ml-3 flex-shrink-0 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Visualizza nel Calendario"
          aria-label="Visualizza nel Calendario"
        >
          <Calendar className="h-4 w-4" />
        </button>
      </div>
    )
  }
  
  const isLoading = loadingPoints || loadingTasks
  const isEmpty = pointsWithStatus.length === 0
  
  return (
    <CollapsibleCard
      title="Manutenzioni Programmate"
      subtitle="Situazione settimanale per punto di conservazione"
      icon={Wrench}
      defaultExpanded={true}
      isLoading={isLoading}
      isEmpty={isEmpty}
      emptyMessage="Nessun punto di conservazione configurato"
      counter={pointsWithStatus.length}
    >
      <div className="divide-y divide-gray-100">
        {pointsWithStatus.map(point => (
          <div key={point.id} className="transition-colors hover:bg-gray-50">
            {/* Riga principale del punto */}
            <div
              className="flex items-center justify-between px-4 py-3 cursor-pointer sm:px-6"
              onClick={() => togglePoint(point.id)}
              role="button"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  togglePoint(point.id)
                }
              }}
              aria-expanded={expandedPointId === point.id}
            >
              <div className="flex items-center gap-3">
                <StatusIndicator status={point.status} />
                <div>
                  <h4 className="font-medium text-gray-900">{point.name}</h4>
                  <p className="text-xs text-gray-500">
                    {new Set(point.maintenances.map(m => m.type)).size} manutenzioni
                  </p>
                </div>
              </div>
              
              <ChevronRight
                className={`h-5 w-5 text-gray-400 transition-transform ${
                  expandedPointId === point.id ? 'rotate-90' : ''
                }`}
                aria-hidden="true"
              />
            </div>
            
            {/* Dettaglio manutenzioni (espandibile) */}
            {expandedPointId === point.id && (
              <div className="border-t border-gray-100 bg-gray-50 px-4 py-3 sm:px-6">
                {point.maintenances.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">
                    Nessuna manutenzione obbligatoria configurata per questo punto
                  </p>
                ) : (
                  <div className="space-y-4">
                    {(() => {
                      const grouped = groupMaintenancesByType(point.maintenances)
                      // Ordine fisso: temperature, sanitization, defrosting, expiry_check (prossima per data in ogni tipo)
                      return MAINTENANCE_TYPE_ORDER.map(type => {
                        const tasks = grouped[type]
                        if (!tasks || tasks.length === 0) return null

                        const firstTask = tasks[0]
                        const nextTasks = tasks.slice(1)
                        const expandKey = `${point.id}-${type}`
                        const isExpanded = expandedMaintenanceTypes.has(expandKey)
                        const typeName = getMaintenanceName(type)

                        return (
                          <div key={type} className="space-y-2">
                            {/* Header tipo con conteggio eventi */}
                            <div className="flex items-center justify-between px-2 py-1">
                              <h4 className="font-medium text-gray-900 text-sm">
                                {typeName} ({tasks.length})
                              </h4>
                            </div>

                            {/* Prima manutenzione (prossima per data per questo tipo) */}
                            {renderMaintenanceTask(firstTask)}

                            {/* Altre manutenzioni dello stesso tipo (espandibile) */}
                            {nextTasks.length > 0 && (
                              <>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation() // Previene l'espansione/chiusura della card punto
                                    setExpandedMaintenanceTypes(prev => {
                                      const next = new Set(prev)
                                      if (next.has(expandKey)) {
                                        next.delete(expandKey)
                                      } else {
                                        next.add(expandKey)
                                      }
                                      return next
                                    })
                                  }}
                                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors px-2"
                                >
                                  <ChevronDown
                                    className={`h-4 w-4 transition-transform ${
                                      isExpanded ? 'rotate-180' : ''
                                    }`}
                                    aria-hidden="true"
                                  />
                                  <span>
                                    {isExpanded 
                                      ? `Nascondi altre ${nextTasks.length} manutenzioni ${typeName}` 
                                      : `Mostra altre ${nextTasks.length} manutenzioni ${typeName}`
                                    }
                                  </span>
                                </button>

                                {isExpanded && (
                                  <div className="space-y-2 pl-4 border-l-2 border-gray-200">
                                    {nextTasks.map(task => renderMaintenanceTask(task))}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        )
                      })
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </CollapsibleCard>
  )
}

export default ScheduledMaintenanceCard

