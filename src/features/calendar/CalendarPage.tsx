import { useState, useMemo } from 'react'
import {
  Activity,
  ClipboardCheck,
  Settings,
} from 'lucide-react'
import Calendar from './Calendar'
import { CollapsibleCard } from '@/components/ui/CollapsibleCard'
import {
  ViewSelector,
  useCalendarView,
  GenericTaskForm,
  ProductExpiryModal,
  NewCalendarFilters,
} from './components'
import { AlertModal } from './components/AlertModal'
import { CalendarConfigModal } from './components/CalendarConfigModal'
import { useCalendarAlerts } from './hooks/useCalendarAlerts'
import { useAggregatedEvents } from './hooks/useAggregatedEvents'
import { useFilteredEvents } from './hooks/useFilteredEvents'
import { useGenericTasks } from './hooks/useGenericTasks'
import { useCalendarStats } from './hooks/useCalendarStats'
import { useCalendarRefresh } from './hooks/useCalendarRefresh'
import { CalendarStatsPanel } from './components/CalendarStatsPanel'
import { CalendarQuickOverview } from './components/CalendarQuickOverview'
import { useStaff } from '@/features/management/hooks/useStaff'
import { useDepartments } from '@/features/management/hooks/useDepartments'
import { useProducts } from '@/features/inventory/hooks/useProducts'
import { useCalendarSettings } from '@/hooks/useCalendarSettings'
import { toast } from 'react-toastify'
import {
  CalendarFilters as NewCalendarFiltersType,
  DEFAULT_CALENDAR_FILTERS,
  doesEventPassFilters,
  calculateEventStatus,
  determineEventType,
  type EventType
} from '@/types/calendar-filters'
import type { Product } from '@/types/inventory'
import { useQueryClient } from '@tanstack/react-query'
// import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'

export const CalendarPage = () => {
  const { companyId } = useAuth()
  const queryClient = useQueryClient()
  const { settings: calendarSettings, isLoading: settingsLoading, isConfigured } = useCalendarSettings()
  const { events: aggregatedEvents, isLoading } = useAggregatedEvents(
    calendarSettings?.fiscal_year_end ? new Date(calendarSettings.fiscal_year_end) : undefined
  )
  
  const { filteredEvents } = useFilteredEvents(aggregatedEvents)
  
  // ✅ BYPASS: Usa aggregatedEvents se useFilteredEvents restituisce 0 eventi
  const eventsForFiltering = filteredEvents.length > 0 ? filteredEvents : aggregatedEvents
  const [view, setView] = useCalendarView('month')
  const { createTask, isCreating } = useGenericTasks()
  const { staff } = useStaff()
  const { departments } = useDepartments()
  const { products } = useProducts()
  const [showAlertModal, setShowAlertModal] = useState(false)
  const [_selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(null)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showProductExpiryModal, setShowProductExpiryModal] = useState(false)
  const [selectedMacroCategory, setSelectedMacroCategory] = useState<{
    category: string
    date: Date
    events?: any[]
  } | null>(null)

  // ✅ Nuovi filtri calendario
  const [calendarFilters, setCalendarFilters] = useState<NewCalendarFiltersType>(DEFAULT_CALENDAR_FILTERS)

  const handleFilterChange = (newFilters: NewCalendarFiltersType) => {
    setCalendarFilters(newFilters)
  }

  // ✅ Hook per gestione refresh calendario
  const { isRefreshing, refreshKey, handleManualRefresh, triggerRefresh } = useCalendarRefresh()

  const displayEvents = useMemo(() => {
    if (eventsForFiltering.length === 0) {
      return []
    }

    return eventsForFiltering.filter(event => {
      // ✅ Sicurezza: Salta eventi malformati
      if (!event || !event.start || !event.status) {
        console.warn('⚠️ Evento malformato saltato:', event)
        return false
      }

      const eventStatus = calculateEventStatus(
        event.start,
        event.status === 'completed'
      )


      const eventType = determineEventType(event.source || '', event.metadata || {})

      return doesEventPassFilters(
        {
          department_id: event.department_id,
          status: eventStatus,
          type: eventType as EventType
        },
        calendarFilters
      )
    })
  }, [eventsForFiltering, calendarFilters, refreshKey]) // ← Aggiunto refreshKey

  // ✅ Calcola eventi in base alla view del calendario
  const viewBasedEvents = useMemo(() => {
    if (displayEvents.length === 0) return []
    
    const now = new Date()
    
    switch (view) {
      case 'year':
        return displayEvents.filter(event => {
          const eventYear = new Date(event.start).getFullYear()
          return eventYear === now.getFullYear()
        })
      case 'month':
        return displayEvents.filter(event => {
          const eventDate = new Date(event.start)
          return eventDate.getMonth() === now.getMonth() && 
                 eventDate.getFullYear() === now.getFullYear()
        })
      case 'week': {
        // Logica settimana corrente
        const weekStart = new Date(now)
        weekStart.setDate(now.getDate() - now.getDay() + 1) // Lunedì
        weekStart.setHours(0, 0, 0, 0)
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6) // Domenica
        weekEnd.setHours(23, 59, 59, 999)

        return displayEvents.filter(event => {
          const eventDate = new Date(event.start)
          return eventDate >= weekStart && eventDate <= weekEnd
        })
      }
      case 'day': {
        // Logica giorno corrente
        const dayStart = new Date(now)
        dayStart.setHours(0, 0, 0, 0)
        const dayEnd = new Date(now)
        dayEnd.setHours(23, 59, 59, 999)

        return displayEvents.filter(event => {
          const eventDate = new Date(event.start)
          return eventDate >= dayStart && eventDate <= dayEnd
        })
      }
      default:
        return displayEvents
    }
  }, [displayEvents, view])


  // ✅ Calcola alert dopo viewBasedEvents
  const { alertCount, criticalCount, alerts } = useCalendarAlerts(viewBasedEvents)

  // ✅ Hook per calcolo statistiche calendario
  const { todayEvents, tomorrowEvents, overdueEvents, eventsInWaiting } = useCalendarStats(
    viewBasedEvents,
    view,
    refreshKey
  )

  // const _shouldShowOverdueSection = useMemo(() => {
  //   if (overdueEvents.length === 0) return false
  //   if (!selectedCalendarDate) return true

  //   const now = new Date()
  //   now.setHours(0, 0, 0, 0)
  //   const selectedDate = new Date(selectedCalendarDate)
  //   selectedDate.setHours(0, 0, 0, 0)

  //   return selectedDate <= now
  // }, [overdueEvents.length, selectedCalendarDate, refreshKey]) // ← Aggiunto refreshKey

  // ✅ Event handlers
  const onEventClick = (event: any) => {
    // Gestione click su evento scadenza prodotto
    if (event.extendedProps?.metadata?.product_id) {
      const productId = event.extendedProps.metadata.product_id
      const product = products?.find((p: Product) => p.id === productId)
      
      if (product) {
        setSelectedProduct(product)
        setShowProductExpiryModal(true)
      } else {
        toast.error('Impossibile caricare i dettagli del prodotto')
      }
      return // ✅ IMPORTANTE: Esce qui per non interferire con altri handler
    }

    // ✅ NUOVO: Gestione eventi per MacroCategoryModal
    console.log('🔍 onEventClick called with event:', event)
    
    // Determina la tipologia dell'evento cliccato
    const eventType = determineEventType(event.source, event.metadata)
    console.log('🔍 Event type determined:', eventType)
    
    // Filtra eventi del giorno per questa tipologia
    const clickedDate = new Date(event.start)
    console.log('🔍 Clicked date:', clickedDate)
    
    const dayEvents = viewBasedEvents.filter(e => {
      const eventDate = new Date(e.start)
      const eEventType = determineEventType(e.source || '', e.metadata || {})
      return eventDate.toDateString() === clickedDate.toDateString() &&
             eEventType === eventType
    })
    console.log('🔍 Day events found:', dayEvents.length)

    // Mappa EventType a MacroCategory
    const categoryMap: Record<EventType, string> = {
      'generic_task': 'generic_tasks',
      'maintenance': 'maintenance', 
      'product_expiry': 'product_expiry'
    }

    const macroCategory = eventType ? categoryMap[eventType] : undefined
    console.log('🔍 Macro category:', macroCategory)
    console.log('🔍 Day events length:', dayEvents.length)
    console.log('🔍 Day events:', dayEvents)
    
    if (macroCategory && dayEvents.length > 0) {
      console.log('🔍 Opening MacroCategoryModal with:', { macroCategory, clickedDate, dayEvents })
      // ✅ Passa eventi filtrati e data al Calendar per aprire MacroCategoryModal
      // Il Calendar.tsx gestirà l'apertura del modal
      setSelectedMacroCategory({ 
        category: macroCategory as any,
        date: clickedDate,
        events: dayEvents // ✅ Eventi già processati dal Calendar
      })
    } else {
      console.log('🔍 Not opening modal:', { 
        macroCategory, 
        dayEventsLength: dayEvents.length,
        hasMacroCategory: !!macroCategory,
        eventType,
        categoryMap
      })
    }
  }

  const handleProductExpiryComplete = () => {
    // Dopo completamento, invalida query e refresh
    queryClient.invalidateQueries({ queryKey: ['products'] })
    queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
    triggerRefresh()
    toast.success('Prodotto aggiornato')
  }

  const onEventUpdate = (event: any) => {
    // Event updated - refresh calendar data
    console.log('Event updated:', event)
    triggerRefresh()
    
    // Invalidate relevant queries to refresh data
    queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
    queryClient.invalidateQueries({ queryKey: ['maintenance-tasks'] })
    queryClient.invalidateQueries({ queryKey: ['generic-tasks'] })
    queryClient.invalidateQueries({ queryKey: ['task-completions', companyId] })
    
    // Show success message
    toast.success('Evento aggiornato con successo')
  }

  const onEventDelete = (_eventId: string) => {
    // Event deleted - can add logic here if needed
  }

  const onDateSelect = (_start: Date, _end: Date) => {
    // Date selected - can add logic here if needed
  }

  const createEvent = (_eventData: any) => {
    // Create event - can add logic here if needed
  }

  const handleCreateEvent = (eventData: any) => {
    createEvent({
      title: eventData.title || 'Nuovo Evento',
      start: eventData.start,
      end: eventData.end,
      allDay: eventData.allDay || false,
      type: eventData.type || 'custom',
      priority: eventData.priority || 'medium',
      assigned_to: eventData.assigned_to || [],
      department_id: eventData.department_id,
      conservation_point_id: eventData.conservation_point_id,
      description: eventData.description,
      metadata: eventData.metadata || {},
    })
  }

  const handleCreateGenericTask = (taskData: any) => {
    createTask({
      name: taskData.name,
      frequency: taskData.frequenza,
      assigned_to_role: taskData.assegnatoARuolo === 'all' ? undefined : taskData.assegnatoARuolo,
      assigned_to_category: taskData.assegnatoACategoria,
      assigned_to_staff_id: taskData.assegnatoADipendenteSpecifico,
      department_id: taskData.departmentId, // Reparto assegnato (obbligatorio)
      note: taskData.note,
      custom_days: taskData.giorniCustom,
      
      // Gestione Orario Attività
      time_management: taskData.timeManagement ? {
        time_range: taskData.timeManagement.timeRange ? {
          start_time: taskData.timeManagement.timeRange.startTime,
          end_time: taskData.timeManagement.timeRange.endTime,
          is_overnight: taskData.timeManagement.timeRange.isOvernight
        } : undefined,
        completion_type: taskData.timeManagement.completionType,
        completion_start_time: taskData.timeManagement.completionStartTime,
        completion_end_time: taskData.timeManagement.completionEndTime
      } : undefined
    })
  }

  const staffOptions = useMemo(
    () =>
      (staff ?? []).map(member => ({
        id: member.id,
        label: member.name,
        role: member.role,
        categories: member.category ? [member.category] : [],
      })),
    [staff]
  )

  const departmentOptions = useMemo(
    () =>
      (departments ?? [])
        .filter(dept => dept.is_active)
        .map(dept => ({
          id: dept.id,
          name: dept.name,
        })),
    [departments]
  )

  // ✅ Calcola reparti disponibili con count eventi (per filtri)
  const availableDepartments = useMemo(() => {
    const deptMap = new Map<string, { id: string; name: string; event_count: number }>()

    filteredEvents.forEach(event => {
      if (event && event.department_id) {
        const dept = departments?.find(d => d.id === event.department_id)
        if (dept) {
          const existing = deptMap.get(dept.id)
          if (existing) {
            existing.event_count++
          } else {
            deptMap.set(dept.id, {
              id: dept.id,
              name: dept.name,
              event_count: 1
            })
          }
        }
      }
    })

    return Array.from(deptMap.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [filteredEvents, departments])

  // ✅ Calcola count eventi basati sulla view corrente per la legenda (SOLO da completare)
  const viewBasedSources = useMemo(() => {
    // ✅ Usa la stessa logica degli eventi in attesa per coerenza
    const eventsInWaiting = viewBasedEvents.filter(e => e && e.status !== 'completed')
    
    return {
      maintenance: eventsInWaiting.filter(e => e.source === 'maintenance').length,
      temperatureChecks: 0, // Già incluso in maintenance
      haccpExpiry: eventsInWaiting.filter(e => e.source === 'custom' && e.metadata?.staff_id).length,
      productExpiry: eventsInWaiting.filter(e => e.source === 'custom' && e.metadata?.product_id).length,
      haccpDeadlines: 0, // Unificato in haccpExpiry per coerenza con legenda
      genericTasks: eventsInWaiting.filter(e => e.source === 'general_task').length,
    }
  }, [viewBasedEvents])


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
      {/* Header Moderno */}
      <div className="bg-gradient-to-r from-white via-white to-indigo-50/50 border-b border-gray-200 shadow-sm">
        <div className="px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                <Activity className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Attività e Mansioni
                </h1>
                <p className="text-sm text-gray-600 font-medium mt-1">
                  📅 Calendario unificato per mansioni, manutenzioni e controlli
                </p>
              </div>
            </div>

            {/* ✅ Alert Badge e ViewSelector Moderni */}
            <div className="flex items-center gap-4">
              {alertCount > 0 && (
                <button
                  onClick={() => setShowAlertModal(true)}
                  className="group relative flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-xl hover:from-red-100 hover:to-orange-100 hover:border-red-400 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
                >
                  <span className="text-lg group-hover:scale-110 transition-transform duration-200">
                    {criticalCount > 0 ? '🔴' : '⚠️'}
                  </span>
                  <span className="text-sm font-bold text-red-700 group-hover:text-red-800">
                    {alertCount} Alert
                  </span>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md">
                    !
                  </div>
                </button>
              )}

              <ViewSelector currentView={view} onChange={setView} />
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Assegna nuova attività/mansione */}
        <div className="mb-6">
          <CollapsibleCard
            title="Assegna nuova attività / mansione"
            icon={ClipboardCheck}
            defaultExpanded={false}
            className="mb-4"
          >
            <div className="p-4">
              <GenericTaskForm
                staffOptions={staffOptions}
                departmentOptions={departmentOptions}
                onSubmit={handleCreateGenericTask}
                onCancel={() => {}}
                isLoading={isCreating}
              />
            </div>
          </CollapsibleCard>
        </div>

        {/* Stats Panel */}
        <CalendarStatsPanel
          viewBasedEvents={viewBasedEvents}
          eventsInWaiting={eventsInWaiting}
          overdueEvents={overdueEvents}
          todayEvents={todayEvents}
          tomorrowEvents={tomorrowEvents}
          viewBasedSources={viewBasedSources}
          isRefreshing={isRefreshing}
          onRefresh={handleManualRefresh}
        />

        {/* Calendario */}
        <div className="mb-6 relative">
          {!isConfigured() && (
            <>
              {/* Overlay opaco */}
              <div className="absolute inset-0 bg-gray-100 bg-opacity-90 rounded-lg z-10 flex items-center justify-center">
                <div className="text-center p-8 bg-white rounded-lg shadow-xl border-2 border-blue-500 max-w-md">
                  <div className="mb-4">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <Settings className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Calendario Non Configurato
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Configura il tuo anno lavorativo, giorni di apertura e orari per iniziare a utilizzare il calendario.
                  </p>
                  <button
                    onClick={() => setShowConfigModal(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                  >
                    <Settings className="h-5 w-5" />
                    Configura Calendario
                  </button>
                </div>
              </div>
            </>
          )}
                 <Calendar
                   events={viewBasedEvents}
            onEventClick={onEventClick}
            onEventCreate={handleCreateEvent}
            onEventUpdate={onEventUpdate}
            onEventDelete={onEventDelete}
            onDateSelect={onDateSelect}
            onDateClick={setSelectedCalendarDate}
            selectedMacroCategory={selectedMacroCategory}
            onMacroCategoryClose={() => setSelectedMacroCategory(null)}
            onMacroCategorySelect={(category, date, events) => {
              console.log('🔍 CalendarPage.tsx: onMacroCategorySelect called:', { category, date, events })
              setSelectedMacroCategory({ category, date, events })
            }}
                   config={{
                     defaultView:
                       view === 'year'
                         ? 'multiMonthYear'
                         : view === 'month'
                           ? 'dayGridMonth'
                           : view === 'week'
                             ? 'timeGridWeek'
                             : 'timeGridDay',
                     headerToolbar: {
                       left: 'prev,next today',
                       center: 'title',
                       right: '',
                     },
                     // ✅ DRAG AND DROP - DISABILITATO PER ANALISI CODICE
                     // validRange: calendarSettings?.is_configured ? {
                     //   start: calendarSettings.fiscal_year_start,
                     //   end: calendarSettings.fiscal_year_end,
                     // } : undefined,
                     // ✅ DRAG AND DROP - DISABILITATO PER ANALISI CODICE
                     // selectConstraint: undefined,
                     // eventConstraint: undefined,
                   }}
            currentView={view}
            loading={isLoading || settingsLoading}
            error={null}
            useMacroCategories={true}
            calendarSettings={calendarSettings}
                   eventSources={viewBasedSources}
            calendarFilters={calendarFilters}
            filters={
              <NewCalendarFilters
                filters={calendarFilters}
                onFiltersChange={handleFilterChange}
                availableDepartments={availableDepartments}
              />
            }
          />
        </div>

        {/* Quick Overview Cards */}
        <CalendarQuickOverview
          overdueEvents={overdueEvents}
          todayEvents={todayEvents}
          tomorrowEvents={tomorrowEvents}
        />
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        alerts={alerts}
      />

      {/* Calendar Config Modal */}
      {showConfigModal && (
        <CalendarConfigModal
          isOpen={showConfigModal}
          onClose={() => setShowConfigModal(false)}
        />
      )}

      {/* Product Expiry Modal */}
      {selectedProduct && (
        <ProductExpiryModal
          product={selectedProduct}
          isOpen={showProductExpiryModal}
          onClose={() => {
            setShowProductExpiryModal(false)
            setSelectedProduct(null)
          }}
          onComplete={handleProductExpiryComplete}
        />
      )}
    </div>
  )
}

// ============================================================================
// 🚫 DRAG AND DROP - DISABILITATO PER ANALISI CODICE
// ============================================================================
// Questa sezione contiene le configurazioni drag and drop commentate
// per non interferire con l'analisi del codice principale.
// 
// Per riabilitare il drag and drop:
// 1. Decommentare le configurazioni nel Calendar component:
//    - validRange: calendarSettings?.is_configured ? { ... } : undefined
//    - selectConstraint: undefined
//    - eventConstraint: undefined
// 2. Decommentare le configurazioni nel Calendar.tsx:
//    - eventDrop, eventResize, editable, dragScroll, etc.
// ============================================================================

export default CalendarPage
