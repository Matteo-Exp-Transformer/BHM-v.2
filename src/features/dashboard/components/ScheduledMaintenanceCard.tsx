import { useState, useMemo } from 'react'
import { Wrench, ChevronRight, Clock, User, CheckCircle2, AlertCircle } from 'lucide-react'
import { CollapsibleCard } from '@/components/ui/CollapsibleCard'
import { useConservationPoints } from '@/features/conservation/hooks/useConservationPoints'
import { useMaintenanceTasks } from '@/features/conservation/hooks/useMaintenanceTasks'
import type { MaintenanceTask } from '@/types/conservation'

// Tipi per il calcolo dello stato settimanale
type WeeklyStatus = 'green' | 'yellow' | 'red'

interface ConservationPointWithStatus {
  id: string
  name: string
  status: WeeklyStatus
  maintenances: MaintenanceTask[]
}

// Mappa dei nomi delle manutenzioni obbligatorie
const MANDATORY_MAINTENANCE_TYPES = {
  temperature: 'Rilevamento Temperature',
  sanitization: 'Sanificazione',
  defrosting: 'Sbrinamento',
  expiry_check: 'Controllo Scadenze', // Fallback per controllo scadenze
} as const

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
 * Calcola lo stato settimanale per un punto di conservazione
 * Verde: tutte le manutenzioni previste per questa settimana sono completate
 * Giallo: almeno una manutenzione in scadenza questa settimana ma non in ritardo
 * Rosso: almeno una manutenzione in ritardo (scadenza questa settimana o precedente, non completata)
 */
function calculateWeeklyStatus(maintenances: MaintenanceTask[]): WeeklyStatus {
  const { start: weekStart, end: weekEnd } = getCurrentWeekBounds()
  const now = new Date()
  
  let hasOverdue = false
  let hasDueSoon = false
  
  for (const task of maintenances) {
    const nextDue = new Date(task.next_due)
    
    // Verifica se la scadenza è questa settimana o precedente
    const isDueThisWeekOrEarlier = nextDue <= weekEnd
    const isOverdue = nextDue < now && task.status !== 'completed'
    const isDueSoon = nextDue >= now && nextDue <= weekEnd && task.status !== 'completed'
    
    if (isOverdue && isDueThisWeekOrEarlier) {
      hasOverdue = true
      break // Rosso ha priorità massima
    }
    
    if (isDueSoon) {
      hasDueSoon = true
    }
  }
  
  if (hasOverdue) return 'red'
  if (hasDueSoon) return 'yellow'
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
export function ScheduledMaintenanceCard() {
  const { conservationPoints, isLoading: loadingPoints } = useConservationPoints()
  const { maintenanceTasks, isLoading: loadingTasks } = useMaintenanceTasks()
  const [expandedPointId, setExpandedPointId] = useState<string | null>(null)
  
  // Raggruppa le manutenzioni per punto di conservazione con calcolo stato
  const pointsWithStatus = useMemo<ConservationPointWithStatus[]>(() => {
    if (!conservationPoints || !maintenanceTasks) return []
    
    return conservationPoints.map(point => {
      // Filtra solo le manutenzioni obbligatorie per questo punto
      const pointMaintenances = maintenanceTasks.filter(
        task => task.conservation_point_id === point.id &&
                Object.keys(MANDATORY_MAINTENANCE_TYPES).includes(task.type)
      )
      
      return {
        id: point.id,
        name: point.name,
        status: calculateWeeklyStatus(pointMaintenances),
        maintenances: pointMaintenances,
      }
    })
  }, [conservationPoints, maintenanceTasks])
  
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
                    {point.maintenances.length} manutenzioni
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
                  <div className="space-y-3">
                    {point.maintenances.map(task => {
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
                              <span>
                                Assegnato a: {task.assigned_to || 'Non assegnato'}
                              </span>
                            </div>
                            
                            {/* Data completamento (se completata) */}
                            {isCompleted && task.last_completed && (
                              <div className="text-xs text-green-700">
                                Completata il: {formatDate(task.last_completed)}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
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

