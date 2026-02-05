import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Wrench, ClipboardList, Package, ChevronRight, Calendar, User, Clock, AlertCircle, Check, RotateCcw, AlertTriangle, Filter } from 'lucide-react'
import type { MacroCategory, MacroCategoryItem } from '../hooks/useMacroCategoryEvents'
import { useMacroCategoryEvents } from '../hooks/useMacroCategoryEvents'
import { useGenericTasks } from '../hooks/useGenericTasks'
import { useConservationPoints } from '@/features/conservation/hooks/useConservationPoints'
import { calculateNextDue } from '@/features/conservation/hooks/useMaintenanceTasks'
import type { MaintenanceTask } from '@/types/conservation'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-toastify'
import { 
  CalendarFilters, 
  DEFAULT_CALENDAR_FILTERS,
  determineEventType,
  calculateEventStatus,
  type EventType,
  type EventStatus 
} from '@/types/calendar-filters'

interface MacroCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  category: MacroCategory
  date: Date
  events?: any[] // ✅ NUOVO: Eventi passati dal Calendar
  onDataUpdated?: () => void // Callback per notificare aggiornamento dati
  highlightMaintenanceTaskId?: string
}

const categoryConfig = {
  maintenance: {
    icon: Wrench,
    label: 'Manutenzioni',
    color: 'blue',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    iconBgColor: 'bg-blue-100',
  },
  generic_tasks: {
    icon: ClipboardList,
    label: 'Mansioni/Attività Generiche',
    color: 'green',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-700',
    iconBgColor: 'bg-green-100',
  },
  product_expiry: {
    icon: Package,
    label: 'Scadenze Prodotti',
    color: 'orange',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-700',
    iconBgColor: 'bg-orange-100',
  },
}

const statusConfig = {
  pending: { label: 'In Attesa', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
  completed: { label: 'Completato', color: 'bg-green-100 text-green-800', icon: '✅' },
  overdue: { label: 'In Ritardo', color: 'bg-red-100 text-red-800', icon: '⚠️' },
}

const priorityConfig = {
  low: { label: 'Bassa', color: 'bg-gray-100 text-gray-800', icon: '🔵' },
  medium: { label: 'Media', color: 'bg-blue-100 text-blue-800', icon: '🟡' },
  high: { label: 'Alta', color: 'bg-orange-100 text-orange-800', icon: '🟠' },
  critical: { label: 'Critica', color: 'bg-red-100 text-red-800', icon: '🔴' },
}

/** Detect if payload is already MacroCategoryItem (has dueDate), not CalendarEvent (has start). */
function isMacroCategoryItem(obj: any): obj is MacroCategoryItem {
  return obj != null && typeof obj === 'object' && 'dueDate' in obj && obj.metadata != null
}

/** Normalize dueDate to Date (handles string from FullCalendar serialization); invalid → start of today. */
function normalizeDueDate(d: Date | string | null | undefined): Date {
  if (d == null) return new Date(new Date().setHours(0, 0, 0, 0))
  const date = typeof d === 'string' ? new Date(d) : d
  return Number.isNaN(date.getTime()) ? new Date(new Date().setHours(0, 0, 0, 0)) : date
}

/** Format dueDate for display; invalid/missing → "—". */
function formatDueDate(
  d: Date | string | null | undefined,
  format: 'full' | 'short' | 'medium' = 'full'
): string {
  if (d == null) return '—'
  const date = typeof d === 'string' ? new Date(d) : d
  if (Number.isNaN(date.getTime())) return '—'
  if (format === 'short') {
    return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })
  }
  if (format === 'medium') {
    return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })
  }
  return date.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const MacroCategoryModal: React.FC<MacroCategoryModalProps> = ({
  isOpen,
  onClose,
  category,
  date,
  events: passedEvents,
  onDataUpdated,
  highlightMaintenanceTaskId,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [selectedItems, setSelectedItems] = useState<string[]>([]) // Array di ID per toggle indipendente
  const [filters, setFilters] = useState<CalendarFilters>(DEFAULT_CALENDAR_FILTERS)
  const [showFilters, setShowFilters] = useState(false)
  const [highlightDismissed, setHighlightDismissed] = useState(false) // ✅ Disattiva pulse dopo click
  const { completeTask, uncompleteTask, isCompleting, isUncompleting } = useGenericTasks()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { companyId, user, userRole } = useAuth()
  const [isCompletingMaintenance, setIsCompletingMaintenance] = useState(false)
  const [maintenanceCompletedIds, setMaintenanceCompletedIds] = useState<Set<string>>(() => new Set())
  const { conservationPoints = [] } = useConservationPoints()

  useEffect(() => {
    if (!isOpen) setMaintenanceCompletedIds(new Set())
  }, [isOpen])

  const conservationPointNameById = React.useMemo(() => {
    const map = new Map<string, string>()
    conservationPoints.forEach((p) => map.set(p.id, p.name))
    return map
  }, [conservationPoints])

  const conservationPointDepartmentById = React.useMemo(() => {
    const map = new Map<string, string>()
    conservationPoints.forEach((p) => {
      const name = (p as { department?: { id: string; name: string } }).department?.name
      if (name) map.set(p.id, name)
    })
    return map
  }, [conservationPoints])

  /** Titolo per manutenzioni: include nome punto di conservazione se assegnato. */
  const getMaintenanceDisplayTitle = (item: MacroCategoryItem): string => {
    // ✅ Supporta sia camelCase (conservationPointId) che snake_case (conservation_point_id)
    const pointId = (item.metadata?.conservationPointId || item.metadata?.conservation_point_id) as string | undefined
    const pointName = pointId ? conservationPointNameById.get(pointId) : undefined
    return pointName ? `${item.title} – ${pointName}` : item.title
  }

  // ✅ Forza il refetch dei dati quando viene chiamato onDataUpdated
  const [refreshKey, setRefreshKey] = useState(0)
  
  // ✅ Funzione per convertire eventi CalendarEvent in MacroCategoryItem
  const convertEventToItem = (event: any): MacroCategoryItem => {
    const eventType = determineEventType(event.source, event.metadata)
    const eventStatus = calculateEventStatus(new Date(event.start), event.status === 'completed')
    
    return {
      id: event.id,
      title: event.title,
      description: event.extendedProps?.description || '',
      status: event.status === 'completed' ? 'completed' : 
              eventStatus === 'overdue' ? 'overdue' : 'pending',
      priority: event.extendedProps?.priority || 'medium',
      assignedTo: event.extendedProps?.assignedTo || '',
      dueDate: new Date(event.start),
      completedAt: event.status === 'completed' ? new Date() : null,
      completedBy: event.status === 'completed' ? 'User' : null,
      department: event.extendedProps?.department || '',
      type: eventType,
      metadata: {
        category: category,
        sourceId: event.id,
        ...event.metadata,
        maintenance_type: event.metadata?.type ?? event.metadata?.maintenance_type,
        type: event.metadata?.type ?? event.metadata?.maintenance_type,
        conservationPointId: event.metadata?.conservation_point_id ?? event.conservation_point_id,
        conservation_point_id: event.metadata?.conservation_point_id ?? event.conservation_point_id,
        maintenance_id: event.metadata?.maintenance_id ?? event.metadata?.task_id ?? event.sourceId,
        task_id: event.metadata?.task_id ?? event.sourceId,
      }
    } as MacroCategoryItem & { 
      completedAt?: Date | null
      completedBy?: string | null
      department?: string
      type: EventType
    }
  }

  const { getCategoryForDate } = useMacroCategoryEvents(undefined, undefined, refreshKey)
  const categoryEvent = passedEvents
    ? {
        items: passedEvents.length > 0 && isMacroCategoryItem(passedEvents[0])
          ? passedEvents.map((item) => ({
              ...item,
              dueDate: normalizeDueDate(item.dueDate),
            }))
          : passedEvents.map((event) => convertEventToItem(event)),
      }
    : getCategoryForDate(date, category)
  const baseItems = categoryEvent?.items || []
  const rawItems = category === 'maintenance' && maintenanceCompletedIds.size > 0
    ? baseItems.map((item) => {
        const mid = item.metadata?.maintenance_id ?? item.id
        if (!maintenanceCompletedIds.has(mid)) return item
        return { ...item, status: 'completed' as const }
      })
    : baseItems

  // ✅ Applica filtri agli items
  const items = rawItems.filter(item => {
    // Filtro per stato
    if (filters.statuses.length > 0) {
      const itemStatus = item.status === 'completed' ? 'completed' :
                        item.status === 'overdue' ? 'overdue' : 'to_complete'
      if (!filters.statuses.includes(itemStatus as EventStatus)) {
        return false
      }
    }

    // Filtro per tipo
    if (filters.types.length > 0) {
      if (!filters.types.includes((item as any).type as EventType)) {
        return false
      }
    }

    // Filtro per reparto
    if (filters.departments.length > 0) {
      if (!(item as any).department || !filters.departments.includes((item as any).department)) {
        return false
      }
    }

    return true
  })
  
  // Helper per verificare se un item è selezionato
  const isItemSelected = (itemId: string) => selectedItems.includes(itemId)

  /** Restituisce l'ID reale del task per generic_tasks (metadata usa task_id; l'item.id può essere occurrence id tipo generic-task-uuid-date). */
  const getGenericTaskId = (item: MacroCategoryItem): string => {
    const raw = item.metadata?.task_id ?? item.metadata?.taskId ?? item.id
    if (typeof raw !== 'string') return String(raw)
    if (raw.startsWith('generic-task-')) {
      const withoutPrefix = raw.replace(/^generic-task-/, '')
      const withoutDate = withoutPrefix.replace(/-\d{4}-\d{2}-\d{2}$/, '')
      return withoutDate || raw
    }
    return raw
  }

  const shouldHighlight = (item: MacroCategoryItem): boolean => {
    return (
      !highlightDismissed && // ✅ Non evidenziare se l'utente ha già cliccato
      category === 'maintenance' &&
      !!highlightMaintenanceTaskId &&
      item.metadata?.maintenance_id === highlightMaintenanceTaskId
    )
  }

  // ✅ Auto-scroll alla manutenzione evidenziata (solo all'apertura, non dopo completamento)
  const scrolledRef = useRef(false)

  useEffect(() => {
    // Reset del flag quando cambia l'ID da evidenziare o il modal si chiude
    if (!isOpen || !highlightMaintenanceTaskId) {
      scrolledRef.current = false
      return
    }
  }, [highlightMaintenanceTaskId, isOpen])

  useEffect(() => {
    // Scroll automatico SOLO se:
    // 1. Modal è aperto
    // 2. C'è un ID da evidenziare
    // 3. Non abbiamo già scrollato per questo ID
    if (!isOpen || !highlightMaintenanceTaskId || scrolledRef.current) return

    const timer = setTimeout(() => {
      const element = document.getElementById(`maintenance-item-${highlightMaintenanceTaskId}`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        scrolledRef.current = true
        console.log('🎯 Auto-scroll alla manutenzione:', highlightMaintenanceTaskId)
      }
    }, 300) // Attesa per rendering completo

    return () => clearTimeout(timer)
  }, [isOpen, highlightMaintenanceTaskId, items.length]) // items.length per aspettare che siano caricati

  // ✅ Funzione per forzare il refresh dei dati
  const forceDataRefresh = () => {
    setRefreshKey(prev => prev + 1)
    console.log('🔄 Forcing macro data refresh in modal')
  }


  const handleCompleteMaintenance = async (maintenanceId: string) => {
    if (!companyId || !user) {
      toast.error('Utente non autenticato')
      return
    }

    setIsCompletingMaintenance(true)
    try {
      const completedAt = new Date()
      const now = completedAt.toISOString()
      const { data: userData } = await supabase.auth.getUser()
      const completedByName = userData.user?.user_metadata?.first_name && userData.user?.user_metadata?.last_name
        ? `${userData.user.user_metadata.first_name} ${userData.user.user_metadata.last_name}`
        : userData.user?.email || null

      // 1. Recupera il task per calcolare la prossima scadenza
      const { data: task, error: taskError } = await supabase
        .from('maintenance_tasks')
        .select('*')
        .eq('id', maintenanceId)
        .single()

      if (taskError || !task) throw taskError || new Error('Task non trovato')

      // 2. Calcola next_due in base alla frequenza (come useMaintenanceTasks)
      const nextDue = (task.frequency && task.frequency !== 'as_needed' && task.frequency !== 'custom')
        ? calculateNextDue(task.frequency as MaintenanceTask['frequency'], completedAt)
        : now

      // 3. Inserisce in maintenance_completions
      const { error: insertError } = await supabase
        .from('maintenance_completions')
        .insert({
          maintenance_task_id: maintenanceId,
          company_id: companyId,
          completed_by: user.id,
          completed_at: now,
          completed_by_name: completedByName,
          next_due: nextDue,
        })

      if (insertError) throw insertError

      // 4. Aggiorna maintenance_tasks con prossima scadenza e last_completed
      if (task.frequency && task.frequency !== 'as_needed' && task.frequency !== 'custom') {
        const { error: updateError } = await supabase
          .from('maintenance_tasks')
          .update({
            next_due: nextDue,
            last_completed: now,
            completed_at: now,
            completed_by: user.id,
          })
          .eq('id', maintenanceId)
        if (updateError) throw updateError
      } else {
        const { error: updateError } = await supabase
          .from('maintenance_tasks')
          .update({
            last_completed: now,
            completed_at: now,
            completed_by: user.id,
          })
          .eq('id', maintenanceId)
        if (updateError) throw updateError
      }

      setMaintenanceCompletedIds((prev) => new Set(prev).add(maintenanceId))
      setSelectedItems([])

      await queryClient.invalidateQueries({ queryKey: ['maintenance-tasks'], refetchType: 'all' })
      await queryClient.invalidateQueries({ queryKey: ['maintenance-tasks-critical'], refetchType: 'all' })
      await queryClient.refetchQueries({ queryKey: ['maintenance-tasks'] })
      await queryClient.refetchQueries({ queryKey: ['maintenance-tasks-critical'] })
      await queryClient.invalidateQueries({ queryKey: ['calendar-events'], refetchType: 'all' })
      await queryClient.invalidateQueries({ queryKey: ['macro-category-events'], refetchType: 'all' })
      await queryClient.invalidateQueries({ queryKey: ['maintenance-completions'], refetchType: 'all' })

      toast.success('✅ Manutenzione completata - Calendario aggiornato')
      window.dispatchEvent(new Event('calendar-refresh'))
      forceDataRefresh()
      onDataUpdated?.()
    } catch (error) {
      console.error('Error completing maintenance:', error)
      toast.error('Errore nel completamento della manutenzione')
    } finally {
      setIsCompletingMaintenance(false)
    }
  }
  const config = categoryConfig[category]
  const Icon = config.icon

  if (!isOpen) return null

  const handleItemClick = (item: MacroCategoryItem) => {
    // ✅ Disattiva l'evidenziazione pulse quando l'utente clicca sulla card
    if (shouldHighlight(item)) {
      setHighlightDismissed(true)
    }

    // Toggle indipendente: se è già aperto lo chiude, altrimenti lo apre
    setSelectedItems(prev =>
      prev.includes(item.id)
        ? prev.filter(id => id !== item.id) // Rimuovi se già presente
        : [...prev, item.id] // Aggiungi se non presente
    )
  }

  // Separa gli items in attivi e completati
  const activeItems = items.filter(i => i.status !== 'completed')
  const completedItems = items.filter(i => i.status === 'completed')

  // Calcola le date per determinare "in ritardo"
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const selectedDate = new Date(date)
  selectedDate.setHours(0, 0, 0, 0)
  
  // Data 1 settimana fa (7 giorni prima di oggi)
  const oneWeekAgo = new Date(now)
  oneWeekAgo.setDate(now.getDate() - 7)
  
  // Ieri (1 giorno prima di oggi)
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)

  // Attività in ritardo: non completate, da 1 settimana fa fino a ieri (escluso oggi)
  const overdueItems = items.filter(i => {
    if (i.status === 'completed') return false
    const itemDate = new Date(i.dueDate)
    itemDate.setHours(0, 0, 0, 0)
    // In ritardo se: data >= 1 settimana fa E data <= ieri (quindi < oggi)
    return itemDate >= oneWeekAgo && itemDate < now
  })
  
  const shouldShowOverdue = overdueItems.length > 0

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      <div className="absolute right-0 top-0 bottom-0 w-full max-w-3xl bg-white shadow-2xl overflow-hidden flex flex-col">
        <div className={`${config.bgColor} border-b ${config.borderColor} p-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`p-3 ${config.iconBgColor} rounded-lg`}>
                <Icon className={`h-6 w-6 ${config.textColor}`} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{config.label}</h2>
                <p className="text-sm text-gray-600">
                  {date.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
              >
                <Filter className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Filtri
                </span>
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className={`px-4 py-2 ${config.iconBgColor} rounded-lg`}>
              <span className="text-sm font-medium text-gray-700">
                Attive: <span className={`font-bold ${config.textColor}`}>{activeItems.length}</span>
              </span>
            </div>
            {shouldShowOverdue && (
              <div className="px-4 py-2 bg-red-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">
                  In Ritardo: <span className="font-bold text-red-700">
                    {overdueItems.length}
                  </span>
                </span>
              </div>
            )}
            <div className="px-4 py-2 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">
                Completate: <span className="font-bold text-green-700">
                  {completedItems.length}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* ✅ Filtri */}
        {showFilters && (
          <div className="bg-gray-50 border-b border-gray-200 p-4">
            <div className="space-y-4">
              {/* Filtri per Stato */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stato
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['to_complete', 'completed', 'overdue'] as EventStatus[]).map(status => (
                    <button
                      key={status}
                      onClick={() => {
                        const newStatuses = filters.statuses.includes(status)
                          ? filters.statuses.filter(s => s !== status)
                          : [...filters.statuses, status]
                        setFilters({ ...filters, statuses: newStatuses })
                      }}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        filters.statuses.includes(status)
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {status === 'to_complete' ? 'Da completare' :
                       status === 'completed' ? 'Completato' :
                       status === 'overdue' ? 'In ritardo' : status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filtri per Tipo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['generic_task', 'maintenance', 'product_expiry'] as EventType[]).map(type => (
                    <button
                      key={type}
                      onClick={() => {
                        const newTypes = filters.types.includes(type)
                          ? filters.types.filter(t => t !== type)
                          : [...filters.types, type]
                        setFilters({ ...filters, types: newTypes })
                      }}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        filters.types.includes(type)
                          ? 'bg-green-100 text-green-800 border border-green-300'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {type === 'generic_task' ? 'Mansioni' :
                       type === 'maintenance' ? 'Manutenzioni' :
                       type === 'product_expiry' ? 'Scadenze' : type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset Filtri */}
              <div className="flex justify-end">
                <button
                  onClick={() => setFilters(DEFAULT_CALENDAR_FILTERS)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Reset filtri
                </button>
              </div>
            </div>
          </div>
        )}

        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <Icon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nessuna attività per questa data</p>
            </div>
          ) : (
            <>
              {/* Sezione Attività Attive */}
              {activeItems.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center px-4">
                    <Clock className="h-5 w-5 mr-2" />
                    {category === 'maintenance' ? 'Manutenzioni Attive' : 'Mansioni/Attività Attive'}
                  </h3>
                  <div className="space-y-4">
                    {activeItems.map((item) => (
                <div
                  key={item.id}
                  id={category === 'maintenance' ? `maintenance-item-${item.metadata?.maintenance_id}` : undefined}
                  className={`bg-white border rounded-lg shadow-sm overflow-hidden transition-all duration-300 ${
                    shouldHighlight(item)
                      ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-2 animate-pulse'
                      : 'border-gray-200'
                  }`}
                >
                  <div
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {category === 'maintenance' ? getMaintenanceDisplayTitle(item) : item.title}
                          </h3>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig[item.status].color}`}>
                            {statusConfig[item.status].icon} {statusConfig[item.status].label}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityConfig[item.priority].color}`}>
                            {priorityConfig[item.priority].icon} {priorityConfig[item.priority].label}
                          </span>
                        </div>

                        {item.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {item.description}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          {item.frequency && (
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span className="font-medium">Frequenza:</span>
                              <span className="capitalize">{item.frequency}</span>
                            </div>
                          )}

                          {(item.assignedTo || item.assignedToRole || item.assignedToCategory) && (
                            <div className="flex items-center space-x-1">
                              <User className="h-4 w-4" />
                              <span className="font-medium">Assegnato a:</span>
                              <span>
                                {item.assignedToStaffId ? 'Dipendente specifico' :
                                 item.assignedToRole ? item.assignedToRole :
                                 item.assignedToCategory ? item.assignedToCategory :
                                 item.assignedTo || 'Non assegnato'}
                              </span>
                            </div>
                          )}

                          {/* ✅ Supporta sia camelCase che snake_case per conservationPointId */}
                          {category === 'maintenance' && (() => {
                            const pointId = (item.metadata?.conservationPointId || item.metadata?.conservation_point_id) as string | undefined
                            const deptName = pointId ? conservationPointDepartmentById.get(pointId) : undefined
                            return deptName ? (
                              <div className="flex items-center space-x-1">
                                <span className="font-medium">Reparto:</span>
                                <span>{deptName}</span>
                              </div>
                            ) : null
                          })()}

                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span className="font-medium">Scadenza:</span>
                            <span>{formatDueDate(item.dueDate, 'full')}</span>
                          </div>
                        </div>
                      </div>

                      <ChevronRight
                        className={`h-5 w-5 text-gray-400 transition-transform flex-shrink-0 ml-4 ${
                          isItemSelected(item.id) ? 'rotate-90' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {isItemSelected(item.id) && (
                    <div className="border-t border-gray-200 bg-gray-50 p-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Dettagli Completi
                      </h4>

                      <div className="space-y-3 text-sm">
                        {item.metadata.notes && (
                          <div>
                            <span className="font-medium text-gray-700">Note:</span>
                            <p className="text-gray-600 mt-1 whitespace-pre-wrap">
                              {item.metadata.notes}
                            </p>
                          </div>
                        )}

                        {item.metadata.estimatedDuration && (
                          <div>
                            <span className="font-medium text-gray-700">Durata Stimata:</span>
                            <p className="text-gray-600 mt-1">
                              {item.metadata.estimatedDuration} minuti
                            </p>
                          </div>
                        )}

                        {/* ✅ Supporta sia camelCase che snake_case per conservationPointId */}
                        {category === 'maintenance' && (() => {
                          const pointId = (item.metadata?.conservationPointId || item.metadata?.conservation_point_id) as string | undefined
                          const pointName = pointId ? conservationPointNameById.get(pointId) : undefined
                          return pointId ? (
                            <div>
                              <span className="font-medium text-gray-700">Punto di Conservazione:</span>
                              <p className="text-gray-600 mt-1">
                                {pointName || `ID: ${pointId}`}
                              </p>
                            </div>
                          ) : null
                        })()}

                        {category === 'maintenance' && item.metadata.instructions && Array.isArray(item.metadata.instructions) && (
                          <div>
                            <span className="font-medium text-gray-700">Istruzioni:</span>
                            <ul className="list-disc list-inside text-gray-600 mt-1 space-y-1">
                              {item.metadata.instructions.map((instruction, idx) => (
                                <li key={idx}>{instruction}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {category === 'product_expiry' && (
                          <>
                            {item.metadata.quantity && (
                              <div>
                                <span className="font-medium text-gray-700">Quantità:</span>
                                <p className="text-gray-600 mt-1">
                                  {item.metadata.quantity} {item.metadata.unit || ''}
                                </p>
                              </div>
                            )}

                            {item.metadata.supplierName && (
                              <div>
                                <span className="font-medium text-gray-700">Fornitore:</span>
                                <p className="text-gray-600 mt-1">
                                  {item.metadata.supplierName}
                                </p>
                              </div>
                            )}

                            {item.metadata.barcode && (
                              <div>
                                <span className="font-medium text-gray-700">Barcode:</span>
                                <p className="text-gray-600 mt-1 font-mono">
                                  {item.metadata.barcode}
                                </p>
                              </div>
                            )}

                            {item.metadata.sku && (
                              <div>
                                <span className="font-medium text-gray-700">SKU:</span>
                                <p className="text-gray-600 mt-1 font-mono">
                                  {item.metadata.sku}
                                </p>
                              </div>
                            )}
                          </>
                        )}

                        <div className="pt-3 border-t border-gray-200">
                          <span className="font-medium text-gray-700">ID Attività:</span>
                          <p className="text-gray-600 mt-1 font-mono text-xs">
                            {item.id}
                          </p>
                        </div>

                        {/* Pulsante Completa per mansioni e manutenzioni */}
                        {(category === 'generic_tasks' || category === 'maintenance') && (
                          <div className="pt-4 border-t-2 border-green-400 mt-4 bg-green-50 p-4 rounded-lg">
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()

                                if (category === 'maintenance') {
                                  // Rilevamento temperatura: apri modal temperatura con punto già assegnato
                                  const maintenanceType = item.metadata?.maintenance_type ?? item.metadata?.type
                                  const pointId = item.metadata?.conservationPointId ?? item.metadata?.conservation_point_id ?? (item as any).conservation_point_id
                                  console.debug('[MacroCategoryModal] Completa Manutenzione (maintenance):', {
                                    maintenance_type: maintenanceType,
                                    pointId,
                                    itemId: item.id,
                                    metadata: item.metadata,
                                  })
                                  if (maintenanceType === 'temperature') {
                                    if (pointId) {
                                      console.debug('[MacroCategoryModal] Apertura modal temperatura, navigazione a /conservazione con pointId:', pointId)
                                      onClose()
                                      navigate('/conservazione', { state: { openTemperatureForPointId: pointId } })
                                      return
                                    }
                                    console.warn('[MacroCategoryModal] Rilevamento temperatura ma pointId mancante, metadata:', item.metadata)
                                  }
                                  handleCompleteMaintenance(item.metadata?.maintenance_id ?? item.metadata?.task_id ?? item.id)
                                } else {
                                  // Permetti completamento solo per eventi passati e presenti, NON futuri
                                  const today = new Date()
                                  today.setHours(0, 0, 0, 0)

                                  const taskDate = new Date(item.dueDate)
                                  taskDate.setHours(0, 0, 0, 0)

                                  // Debug: mostra le date per verificare il confronto
                                  console.log('🔍 Debug completamento mansione:', {
                                    taskTitle: item.title,
                                    today: today.toISOString(),
                                    taskDate: taskDate.toISOString(),
                                    isFuture: taskDate > today,
                                    comparison: `${taskDate.getTime()} > ${today.getTime()} = ${taskDate.getTime() > today.getTime()}`
                                  })

                                  // Blocca SOLO se la mansione è nel futuro
                                  if (taskDate > today) {
                                    const taskDateStr = formatDueDate(taskDate, 'medium')
                                    toast.warning(`⚠️ Non puoi completare eventi futuri!\nQuesta mansione è del ${taskDateStr}.`, {
                                      autoClose: 5000
                                    })
                                    return
                                  }

                                  const taskId = getGenericTaskId(item)
                                  completeTask(
                                    { taskId },
                                    {
                                      onSuccess: async () => {
                                        await queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
                                        await queryClient.invalidateQueries({ queryKey: ['generic-tasks'] })
                                        await queryClient.invalidateQueries({ queryKey: ['task-completions', companyId] })
                                        await queryClient.invalidateQueries({ queryKey: ['macro-category-events'] })

                                        toast.success('✅ Mansione completata!')
                                        setSelectedItems([]) // Chiudi tutti gli item aperti
                                        
                                        // ✅ Forza il refresh dei dati nel modal
                                        forceDataRefresh()
                                        
                                        // ✅ Notifica al componente padre di aggiornare i dati
                                        onDataUpdated?.()
                                        
                                        // NON chiudere il modal automaticamente per permettere all'utente di vedere il risultato
                                        // onClose()
                                      },
                                      onError: (error) => {
                                        console.error('Error completing task:', error)
                                        toast.error('Errore nel completamento')
                                      }
                                    }
                                  )
                                }
                              }}
                              disabled={isCompleting || isCompletingMaintenance}
                              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Check className="w-5 h-5" />
                              {(isCompleting || isCompletingMaintenance) ? 'Completando...' : category === 'maintenance' ? 'Completa Manutenzione' : 'Completa Mansione'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sezione Attività in Ritardo */}
              {overdueItems.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center px-4">
                    <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                    {category === 'maintenance' ? 'Manutenzioni in Ritardo' : 'Mansioni/Attività in Ritardo'}
                    <span className="ml-2 text-sm text-red-600">
                      (da 1 settimana fa fino a ieri)
                    </span>
                  </h3>
                  <div className="space-y-4">
                    {overdueItems.map((item) => (
                      <div
                        key={item.id}
                        id={category === 'maintenance' ? `maintenance-item-${item.metadata?.maintenance_id}` : undefined}
                        className={`bg-red-50 rounded-lg shadow-md overflow-hidden transition-all duration-300 ${
                          shouldHighlight(item)
                            ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-2 animate-pulse border-2'
                            : 'border-2 border-red-300'
                        }`}
                      >
                        <div
                          className="p-4 hover:bg-red-100 cursor-pointer transition-colors"
                          onClick={() => handleItemClick(item)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                  ⚠️ {category === 'maintenance' ? getMaintenanceDisplayTitle(item) : item.title}
                                </h3>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-200 text-red-800">
                                  IN RITARDO
                                </span>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityConfig[item.priority].color}`}>
                                  {priorityConfig[item.priority].icon} {priorityConfig[item.priority].label}
                                </span>
                              </div>

                              {item.description && (
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                  {item.description}
                                </p>
                              )}

                              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                {item.frequency && (
                                  <div className="flex items-center space-x-1">
                                    <Clock className="h-4 w-4" />
                                    <span className="font-medium">Frequenza:</span>
                                    <span className="capitalize">{item.frequency}</span>
                                  </div>
                                )}

                                {(item.assignedTo || item.assignedToRole || item.assignedToCategory) && (
                                  <div className="flex items-center space-x-1">
                                    <User className="h-4 w-4" />
                                    <span className="font-medium">Assegnato a:</span>
                                    <span>
                                      {item.assignedToStaffId ? 'Dipendente specifico' :
                                       item.assignedToRole ? item.assignedToRole :
                                       item.assignedToCategory ? item.assignedToCategory :
                                       item.assignedTo || 'Non assegnato'}
                                    </span>
                                  </div>
                                )}

                                {/* ✅ Supporta sia camelCase che snake_case per conservationPointId */}
                                {category === 'maintenance' && (() => {
                                  const pointId = (item.metadata?.conservationPointId || item.metadata?.conservation_point_id) as string | undefined
                                  const deptName = pointId ? conservationPointDepartmentById.get(pointId) : undefined
                                  return deptName ? (
                                    <div className="flex items-center space-x-1">
                                      <span className="font-medium">Reparto:</span>
                                      <span>{deptName}</span>
                                    </div>
                                  ) : null
                                })()}

                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-4 w-4" />
                                  <span className="font-medium">Scadenza:</span>
                                  <span className="text-red-700 font-semibold">
                                    {formatDueDate(item.dueDate, 'short')}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${isItemSelected(item.id) ? 'rotate-90' : ''}`} />
                          </div>
                        </div>

                        {isItemSelected(item.id) && (
                          <div className="border-t-2 border-red-300 bg-red-50 p-4">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                              <AlertCircle className="h-4 w-4 mr-2" />
                              Dettagli
                            </h4>
                            <div className="space-y-3 text-sm">
                              <div>
                                <span className="font-medium text-gray-700">Descrizione completa:</span>
                                <p className="text-gray-600 mt-1 whitespace-pre-wrap">
                                  {item.description || 'Nessuna descrizione'}
                                </p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">ID Attività:</span>
                                <p className="text-gray-600 mt-1 font-mono text-xs">
                                  {item.id}
                                </p>
                              </div>
                            </div>

                            {/* Pulsante Completa per mansioni in ritardo */}
                            {(category === 'generic_tasks' || category === 'maintenance') && (
                              <div className="pt-4 border-t-2 border-red-400 mt-4 bg-red-100 p-4 rounded-lg">
                                <p className="text-xs text-red-800 mb-3 text-center font-medium">
                                  ⚠️ Questa attività è in ritardo. Completala al più presto!
                                </p>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()

                                    if (category === 'maintenance') {
                                      const maintenanceType = item.metadata?.maintenance_type ?? item.metadata?.type
                                      const pointId = item.metadata?.conservationPointId ?? item.metadata?.conservation_point_id ?? (item as any).conservation_point_id
                                      console.debug('[MacroCategoryModal] Completa Manutenzione in ritardo:', { maintenance_type: maintenanceType, pointId, metadata: item.metadata })
                                      if (maintenanceType === 'temperature' && pointId) {
                                        console.debug('[MacroCategoryModal] Apertura modal temperatura (overdue), pointId:', pointId)
                                        onClose()
                                        navigate('/conservazione', { state: { openTemperatureForPointId: pointId } })
                                        return
                                      }
                                      handleCompleteMaintenance(item.metadata?.maintenance_id ?? item.metadata?.task_id ?? item.id)
                                    } else {
                                      // Permetti completamento solo per eventi passati e presenti, NON futuri
                                      const today = new Date()
                                      today.setHours(0, 0, 0, 0)

                                      const taskDate = new Date(item.dueDate)
                                      taskDate.setHours(0, 0, 0, 0)

                                      // Blocca SOLO se la mansione è nel futuro
                                      if (taskDate > today) {
                                        const taskDateStr = formatDueDate(taskDate, 'medium')
                                        toast.warning(`⚠️ Non puoi completare eventi futuri!\nQuesta mansione è del ${taskDateStr}.`, {
                                          autoClose: 5000
                                        })
                                        return
                                      }

                                      const taskId = getGenericTaskId(item)
                                      completeTask(
                                        { taskId },
                                        {
                                          onSuccess: async () => {
                                            await queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
                                            await queryClient.invalidateQueries({ queryKey: ['generic-tasks'] })
                                            await queryClient.invalidateQueries({ queryKey: ['task-completions', companyId] })
                                            await queryClient.invalidateQueries({ queryKey: ['macro-category-events'] })

                                            toast.success('✅ Mansione completata!')
                                            setSelectedItems([]) // Chiudi tutti gli item aperti
                                            
                                            // ✅ Forza il refresh dei dati nel modal
                                            forceDataRefresh()
                                            
                                            // ✅ Notifica al componente padre di aggiornare i dati
                                            onDataUpdated?.()
                                            
                                            // NON chiudere il modal automaticamente per permettere all'utente di vedere il risultato
                                            // onClose()
                                          },
                                          onError: (error) => {
                                            console.error('Error completing task:', error)
                                            toast.error('Errore nel completamento')
                                          }
                                        }
                                      )
                                    }
                                  }}
                                  disabled={isCompleting || isCompletingMaintenance}
                                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Check className="w-5 h-5" />
                                  {(isCompleting || isCompletingMaintenance) ? 'Completando...' : category === 'maintenance' ? 'Completa Manutenzione' : 'Completa Mansione in Ritardo'}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sezione Attività Completate */}
              {completedItems.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center px-4">
                    <Check className="h-5 w-5 mr-2 text-green-600" />
                    {category === 'maintenance' ? 'Manutenzioni Completate' : 'Mansioni/Attività Completate'}
                  </h3>
                  <div className="space-y-4">
                    {completedItems.map((item) => (
                      <div
                        key={item.id}
                        id={category === 'maintenance' ? `maintenance-item-${item.metadata?.maintenance_id}` : undefined}
                        className={`bg-green-50 rounded-lg shadow-sm overflow-hidden opacity-75 transition-all duration-300 ${
                          shouldHighlight(item)
                            ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-2 animate-pulse border'
                            : 'border border-green-200'
                        }`}
                      >
                        <div
                          className="p-4 hover:bg-green-100 cursor-pointer transition-colors"
                          onClick={() => handleItemClick(item)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                ✅ {category === 'maintenance' ? getMaintenanceDisplayTitle(item) : item.title}
                              </h3>
                              {/* ✅ Supporta sia camelCase che snake_case per conservationPointId */}
                              {category === 'maintenance' && (() => {
                                const pointId = (item.metadata?.conservationPointId || item.metadata?.conservation_point_id) as string | undefined
                                const deptName = pointId ? conservationPointDepartmentById.get(pointId) : undefined
                                return deptName ? (
                                  <p className="text-sm text-gray-600">
                                    Reparto: {deptName}
                                  </p>
                                ) : null
                              })()}
                            </div>
                          </div>
                        </div>

                        {isItemSelected(item.id) && (
                          <div className="border-t border-green-200 bg-green-50 p-4">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                              <AlertCircle className="h-4 w-4 mr-2" />
                              Dettagli
                            </h4>
                            <div className="space-y-3 text-sm">
                              {/* Informazioni di completamento */}
                              {item.metadata.completedAt && (
                                <div className="bg-green-100 p-3 rounded-lg border border-green-300">
                                  <h5 className="font-semibold text-green-900 mb-2 flex items-center">
                                    <Check className="h-4 w-4 mr-2" />
                                    Log Completamento
                                  </h5>
                                  <div className="space-y-1 text-xs text-green-800">
                                    <div className="flex items-center">
                                      <Clock className="h-3 w-3 mr-1" />
                                      <span className="font-medium">Completata il:</span>
                                      <span className="ml-1">
                                        {new Date(item.metadata.completedAt).toLocaleString('it-IT', {
                                          day: '2-digit',
                                          month: 'long',
                                          year: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </span>
                                    </div>
                                    {(item.metadata.completedBy || item.metadata.completedByName) && (
                                      <div className="flex items-center">
                                        <User className="h-3 w-3 mr-1" />
                                        <span className="font-medium">Completata da:</span>
                                        <span className="ml-1">
                                          {item.metadata.completedByName || 
                                           (item.metadata.completedBy ? `ID: ${item.metadata.completedBy.substring(0, 8)}...` : 'Sconosciuto')}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Note completamento */}
                              {item.metadata.completionNotes && (
                                <div>
                                  <span className="font-medium text-gray-700">Note completamento:</span>
                                  <p className="text-gray-600 mt-1 whitespace-pre-wrap bg-gray-50 p-2 rounded">
                                    {item.metadata.completionNotes}
                                  </p>
                                </div>
                              )}

                              {/* Note task */}
                              {item.metadata.notes && (
                                <div>
                                  <span className="font-medium text-gray-700">Descrizione task:</span>
                                  <p className="text-gray-600 mt-1 whitespace-pre-wrap">
                                    {item.metadata.notes}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Pulsante "Ancora da Completare" - solo per chi ha completato o admin */}
                            {category === 'generic_tasks' && (() => {
                              const isCompleter = item.metadata.completedBy === user?.id
                              const isAdmin = userRole === 'admin'
                              const canUncomplete = isCompleter || isAdmin

                              if (!canUncomplete) return null

                              return (
                                <div className="pt-4 border-t-2 border-yellow-400 mt-4 bg-yellow-50 p-4 rounded-lg">
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()

                                      const taskId = getGenericTaskId(item)
                                      const dueDate = item.dueDate ? new Date(item.dueDate) : undefined
                                      const completionId = item.metadata?.completionId
                                      console.log('[MacroCategoryModal] Uncomplete payload:', {
                                        taskId,
                                        completionId,
                                        periodDate: dueDate?.toISOString?.(),
                                        itemId: item.id,
                                        metadataKeys: item.metadata ? Object.keys(item.metadata) : [],
                                      })
                                      uncompleteTask(
                                        {
                                          taskId,
                                          completionId,
                                          periodDate: dueDate,
                                        },
                                        {
                                          onSuccess: async () => {
                                            await queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
                                            await queryClient.invalidateQueries({ queryKey: ['generic-tasks'] })
                                            await queryClient.invalidateQueries({ queryKey: ['task-completions', companyId] })
                                            await queryClient.invalidateQueries({ queryKey: ['macro-category-events'] })
                                            setSelectedItems([])
                                            forceDataRefresh()
                                            onDataUpdated?.()
                                            // Non chiudere il modal: così la lista si aggiorna e l'utente vede la mansione tornare in "Da completare"
                                          },
                                          onError: (error) => {
                                            console.error('Error uncompleting task:', error)
                                          }
                                        }
                                      )
                                    }}
                                    disabled={isUncompleting}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <RotateCcw className="w-5 h-5" />
                                    {isUncompleting ? 'Ripristinando...' : 'Ancora da Completare'}
                                  </button>
                                  <p className="text-xs text-gray-600 mt-2 text-center">
                                    Annulla il completamento: la mansione tornerà in elenco come da completare.
                                  </p>
                                </div>
                              )
                            })()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default MacroCategoryModal
