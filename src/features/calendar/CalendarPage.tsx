import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Calendar as CalendarIcon,
  Activity,
  AlertCircle,
  TrendingUp,
  ClipboardCheck,
  Settings,
} from 'lucide-react'
import Calendar from './Calendar'
import { CollapsibleCard } from '@/components/ui/CollapsibleCard'
import type { CalendarEvent } from '@/types/calendar'
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
  type EventStatus,
  type EventType
} from '@/types/calendar-filters'
import type { Product } from '@/types/inventory'

export const CalendarPage = () => {
  const navigate = useNavigate()
  const { settings: calendarSettings, isLoading: settingsLoading, isConfigured } = useCalendarSettings()
  console.log('⚙️ Calendar settings:', { 
    settings: calendarSettings, 
    settingsLoading, 
    isConfigured: isConfigured(),
    fiscalYearEnd: calendarSettings?.fiscal_year_end
  })
  const { events: aggregatedEvents, isLoading, sources } = useAggregatedEvents(
    calendarSettings?.fiscal_year_end ? new Date(calendarSettings.fiscal_year_end) : undefined
  )
  console.log('📊 useAggregatedEvents result:', { 
    eventsCount: aggregatedEvents?.length || 0, 
    isLoading, 
    sources,
    sampleEvents: aggregatedEvents?.slice(0, 2)
  })
  
  const { filteredEvents } = useFilteredEvents(aggregatedEvents)
  console.log('🔍 useFilteredEvents result:', { 
    filteredCount: filteredEvents?.length || 0,
    originalCount: aggregatedEvents?.length || 0,
    sampleFiltered: filteredEvents?.slice(0, 2)
  })
  
  // ✅ BYPASS: Usa aggregatedEvents se useFilteredEvents restituisce 0 eventi
  const eventsForFiltering = filteredEvents.length > 0 ? filteredEvents : aggregatedEvents
  console.log('🔧 Events for filtering:', {
    source: filteredEvents.length > 0 ? 'filteredEvents' : 'aggregatedEvents',
    count: eventsForFiltering.length,
    filteredEventsCount: filteredEvents.length,
    aggregatedEventsCount: aggregatedEvents.length
  })
  const [view, setView] = useCalendarView('month')
  const { createTask, isCreating } = useGenericTasks()
  const { staff } = useStaff()
  const { departments } = useDepartments()
  const { products } = useProducts()
  console.log('👥 Staff data:', { 
    staffCount: staff?.length || 0, 
    sampleStaff: staff?.slice(0, 2)
  })
  console.log('🏢 Departments data:', { 
    departmentsCount: departments?.length || 0, 
    sampleDepartments: departments?.slice(0, 2)
  })
  const [showAlertModal, setShowAlertModal] = useState(false)
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(null)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showProductExpiryModal, setShowProductExpiryModal] = useState(false)

  // ✅ Nuovi filtri calendario
  const [calendarFilters, setCalendarFilters] = useState<NewCalendarFiltersType>(DEFAULT_CALENDAR_FILTERS)

  const handleFilterChange = useCallback((newFilters: NewCalendarFiltersType) => {
    console.log('🔧 Filtri aggiornati:', JSON.stringify(newFilters, null, 2))
    console.log('🔧 Filtri precedenti:', JSON.stringify(calendarFilters, null, 2))
    setCalendarFilters(newFilters)
  }, [calendarFilters])

  const displayEvents = useMemo(() => {
    if (eventsForFiltering.length === 0) {
      console.log('⚠️ No events to filter - check useAggregatedEvents')
      return []
    }
    
    console.log('🔍 Applying new filters to events:', {
      totalEvents: eventsForFiltering.length,
      filters: JSON.stringify(calendarFilters, null, 2),
      sampleEvents: eventsForFiltering.slice(0, 2).map(e => ({
        title: e.title,
        source: e.source,
        type: e.type
      }))
    })
    
    return eventsForFiltering.filter(event => {
      // ✅ NUOVA LOGICA FILTRI CUMULATIVI:
      // - Nessun filtro = Mostra TUTTO
      // - Filtri attivi = Mostra SOLO eventi che corrispondono a TUTTI i filtri
      
      // Calcola stato evento dinamicamente
      const eventStatus = calculateEventStatus(
        event.start,
        event.status === 'completed'
      )
      
      // Determina tipo evento
      const eventType = determineEventType(event.source || '', event.metadata)
      
      // Verifica filtri usando utility function
      const passesFilters = doesEventPassFilters(
        {
          department_id: event.department_id,
          status: eventStatus,
          type: eventType as EventType
        },
        calendarFilters
      )

      // Debug per primi 5 eventi
      if (eventsForFiltering.indexOf(event) < 5) {
        console.log(`🔍 Evento ${eventsForFiltering.indexOf(event)}:`, {
          title: event.title,
          source: event.source,
          department_id: event.department_id,
          status: event.status,
          calculatedStatus: eventStatus,
          calculatedType: eventType,
          filters: JSON.stringify(calendarFilters, null, 2),
          passesFilters,
          eventTypeMatch: calendarFilters.types.length === 0 || calendarFilters.types.includes(eventType),
          statusMatch: calendarFilters.statuses.length === 0 || calendarFilters.statuses.includes(eventStatus),
          departmentMatch: calendarFilters.departments.length === 0 || (event.department_id && calendarFilters.departments.includes(event.department_id))
        })
      }

      return passesFilters
    })
  }, [eventsForFiltering, calendarFilters])

  // ✅ Debug risultato finale
  console.log('🎯 Final displayEvents count:', displayEvents.length)
  console.log('🎯 Events breakdown:', {
    aggregatedEvents: aggregatedEvents.length,
    filteredEvents: filteredEvents.length,
    eventsForFiltering: eventsForFiltering.length,
    displayEvents: displayEvents.length,
    calendarFilters: JSON.stringify(calendarFilters, null, 2)
  })

  // ✅ Calcola alert dopo displayEvents
  const { alertCount, criticalCount, alerts } = useCalendarAlerts(displayEvents)

  // ✅ Calcola statistiche
  const todayEvents = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return displayEvents.filter(
      event => {
        const eventDate = new Date(event.start)
        return eventDate >= today &&
               eventDate < tomorrow &&
               event.status !== 'completed'
      }
    )
  }, [displayEvents])

  const tomorrowEvents = useMemo(() => {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    const dayAfterTomorrow = new Date(tomorrow)
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1)

    return displayEvents.filter(
      event => {
        const eventDate = new Date(event.start)
        return eventDate >= tomorrow && eventDate < dayAfterTomorrow
      }
    )
  }, [displayEvents])

  const overdueEvents = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const oneWeekAgo = new Date(now)
    oneWeekAgo.setDate(now.getDate() - 7)

    return displayEvents.filter(event => {
      if (event.status === 'completed') return false

      const eventDate = new Date(event.start)
      eventDate.setHours(0, 0, 0, 0)

      return eventDate >= oneWeekAgo && eventDate < now
    })
  }, [displayEvents])

  const shouldShowOverdueSection = useMemo(() => {
    if (overdueEvents.length === 0) return false
    if (!selectedCalendarDate) return true

    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const selectedDate = new Date(selectedCalendarDate)
    selectedDate.setHours(0, 0, 0, 0)

    return selectedDate <= now
  }, [overdueEvents.length, selectedCalendarDate])

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
    }
  }

  const handleProductExpiryComplete = () => {
    // Dopo completamento, reload eventi
    window.location.reload()
  }

  const onEventUpdate = (event: any) => {
    // Event updated - can add logic here if needed
  }

  const onEventDelete = (eventId: string) => {
    // Event deleted - can add logic here if needed
  }

  const onDateSelect = (start: Date, end: Date) => {
    // Date selected - can add logic here if needed
  }

  const createEvent = (eventData: any) => {
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
      assigned_to_role: taskData.assegnatoARuolo,
      assigned_to_category: taskData.assegnatoACategoria,
      assigned_to_staff_id: taskData.assegnatoADipendenteSpecifico,
      department_id: taskData.departmentId, // Reparto assegnato (opzionale)
      note: taskData.note,
      custom_days: taskData.giorniCustom,
      start_date: taskData.dataInizio, // Data di inizio opzionale
      end_date: taskData.dataFine, // Data di fine opzionale
    })
  }

  const staffOptions = useMemo(
    () =>
      (staff ?? []).map(member => ({
        id: member.id,
        label: member.name,
        role: member.role,
        categories: [member.category] || [],
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
      if (event.department_id) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Attività e Mansioni
                </h1>
                <p className="text-sm text-gray-600">
                  Calendario unificato per mansioni, manutenzioni e controlli
                </p>
              </div>
            </div>

            {/* ✅ Alert Badge e ViewSelector */}
            <div className="flex items-center gap-4">
              {alertCount > 0 && (
                <button
                  onClick={() => setShowAlertModal(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                >
                  <span className="text-sm font-medium text-red-700">
                    {criticalCount > 0 ? '🔴' : '⚠️'} {alertCount} Alert
                  </span>
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
        <div className="mb-6">
          <CollapsibleCard
            title="Statistiche"
            icon={TrendingUp}
            counter={displayEvents.length}
            className="mb-4"
            defaultExpanded={true}
          >
            <div className="p-4">
              {/* Overview Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {displayEvents.length}
                  </div>
                  <div className="text-sm text-gray-500">Eventi Totali</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {displayEvents.filter(e => e.status === 'completed').length}
                  </div>
                  <div className="text-sm text-gray-500">Completati</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {displayEvents.filter(e => e.status === 'pending').length}
                  </div>
                  <div className="text-sm text-gray-500">In Attesa</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {overdueEvents.length}
                  </div>
                  <div className="text-sm text-gray-500">In Ritardo</div>
                </div>
              </div>

              {/* Completion Rate */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Tasso di Completamento
                  </span>
                  <span className="text-sm text-gray-600">
                    {displayEvents.length > 0
                      ? (
                          (displayEvents.filter(e => e.status === 'completed')
                            .length /
                            displayEvents.length) *
                          100
                        ).toFixed(1)
                      : '0.0'}
                    %
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${displayEvents.length > 0 ? Math.min((displayEvents.filter(e => e.status === 'completed').length / displayEvents.length) * 100, 100) : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* Event Types Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Per Tipologia
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">🔧 Manutenzioni</span>
                      <span className="font-medium">
                        {sources?.maintenance || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">👥 Scadenze HACCP</span>
                      <span className="font-medium">
                        {sources?.haccpExpiry || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        📦 Scadenze Prodotti
                      </span>
                      <span className="font-medium">
                        {sources?.productExpiry || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">⏰ Alert HACCP</span>
                      <span className="font-medium">
                        {sources?.haccpDeadlines || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">🌡️ Controlli Temp</span>
                      <span className="font-medium">
                        {sources?.temperatureChecks || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">📋 Attività Generiche</span>
                      <span className="font-medium">
                        {sources?.genericTasks || 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Urgenti
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      <span>{overdueEvents.length} eventi in ritardo</span>
                    </div>
                    <div className="flex items-center text-sm text-blue-600">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      <span>{todayEvents.length} eventi oggi</span>
                    </div>
                    <div className="flex items-center text-sm text-green-600">
                      <Activity className="h-4 w-4 mr-2" />
                      <span>{tomorrowEvents.length} eventi domani</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleCard>

          {/* Attività in Ritardo */}
          {shouldShowOverdueSection && (
            <CollapsibleCard
              title="Attività in Ritardo"
              icon={AlertCircle}
              defaultOpen={true}
              className="bg-red-50 border-red-200"
            >
              <div className="space-y-3">
                {overdueEvents.map(event => (
                  <div
                    key={event.id}
                    className="bg-white border border-red-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {
                      // TODO: Aprire modal dettagli evento
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm">
                            {event.type === 'maintenance' && '🔧'}
                            {event.type === 'general_task' && '📋'}
                            {event.type === 'temperature_reading' && '🌡️'}
                            {event.type === 'custom' && '📌'}
                          </span>
                          <h4 className="text-sm font-semibold text-gray-900">
                            {event.title}
                          </h4>
                        </div>
                        {event.description && (
                          <p className="text-xs text-gray-600 mb-2">
                            {event.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" />
                            {new Date(event.start).toLocaleDateString('it-IT', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            event.priority === 'critical' ? 'bg-red-100 text-red-800' :
                            event.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            event.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {event.priority === 'critical' ? '🔴 Critico' :
                             event.priority === 'high' ? '🟠 Alto' :
                             event.priority === 'medium' ? '🟡 Medio' :
                             '🔵 Basso'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleCard>
          )}
        </div>

        {/* Nuovi Filtri Calendario */}
        <div className="mb-6">
          <NewCalendarFilters
            filters={calendarFilters}
            onFiltersChange={handleFilterChange}
            availableDepartments={availableDepartments}
          />
        </div>

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
            events={displayEvents}
            onEventClick={onEventClick}
            onEventCreate={handleCreateEvent}
            onEventUpdate={onEventUpdate}
            onEventDelete={onEventDelete}
            onDateSelect={onDateSelect}
            onDateClick={setSelectedCalendarDate}
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
              validRange: calendarSettings?.is_configured ? {
                start: calendarSettings.fiscal_year_start,
                end: calendarSettings.fiscal_year_end,
              } : undefined,
            }}
            currentView={view}
            loading={isLoading || settingsLoading}
            error={null}
            useMacroCategories={true}
            calendarSettings={calendarSettings}
          />
        </div>

        {/* Quick Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Overdue Events */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
                Eventi in Ritardo
              </h3>
            </div>
            <div className="p-4">
              {overdueEvents.length === 0 ? (
                <p className="text-sm text-green-600 text-center py-4">
                  ✅ Nessun evento in ritardo
                </p>
              ) : (
                <div className="space-y-3">
                  {overdueEvents.slice(0, 3).map(event => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-2 bg-red-50 rounded-md border border-red-200"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {event.title}
                        </p>
                        <p className="text-xs text-red-600">
                          Scaduto il{' '}
                          {event.start.toLocaleDateString('it-IT', {
                            day: '2-digit',
                            month: '2-digit',
                          })}
                        </p>
                      </div>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        ⚠️ {event.priority}
                      </span>
                    </div>
                  ))}
                  {overdueEvents.length > 3 && (
                    <p className="text-xs text-red-500 text-center">
                      +{overdueEvents.length - 3} altri eventi in ritardo
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Today's Events */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2 text-blue-600" />
                Eventi di Oggi
              </h3>
            </div>
            <div className="p-4">
              {todayEvents.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nessun evento oggi
                </p>
              ) : (
                <div className="space-y-3">
                  {todayEvents.slice(0, 3).map(event => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-2 bg-blue-50 rounded-md"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {event.title}
                        </p>
                        <p className="text-xs text-blue-600">
                          {event.start.toLocaleDateString('it-IT', {
                            weekday: 'short',
                            day: '2-digit',
                            month: '2-digit',
                          })}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          event.priority === 'critical'
                            ? 'bg-red-100 text-red-800'
                            : event.priority === 'high'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {event.priority === 'critical'
                          ? '🔴'
                          : event.priority === 'high'
                            ? '🟠'
                            : '🔵'}
                      </span>
                    </div>
                  ))}
                  {todayEvents.length > 3 && (
                    <p className="text-xs text-blue-500 text-center">
                      +{todayEvents.length - 3} altri eventi oggi
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Tomorrow's Events */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-green-600" />
                Eventi di Domani
              </h3>
            </div>
            <div className="p-4">
              {tomorrowEvents.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nessun evento domani
                </p>
              ) : (
                <div className="space-y-3">
                  {tomorrowEvents.slice(0, 3).map(event => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-2 bg-green-50 rounded-md"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {event.title}
                        </p>
                        <p className="text-xs text-green-600">
                          {event.start.toLocaleDateString('it-IT', {
                            weekday: 'short',
                            day: '2-digit',
                            month: '2-digit',
                          })}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          event.priority === 'critical'
                            ? 'bg-red-100 text-red-800'
                            : event.priority === 'high'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {event.priority === 'critical'
                          ? '🔴'
                          : event.priority === 'high'
                            ? '🟠'
                            : '🟢'}
                      </span>
                    </div>
                  ))}
                  {tomorrowEvents.length > 3 && (
                    <p className="text-xs text-green-500 text-center">
                      +{tomorrowEvents.length - 3} altri eventi domani
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
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

export default CalendarPage
