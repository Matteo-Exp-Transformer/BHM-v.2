import { useState, useMemo, useEffect } from 'react'
import {
  Calendar as CalendarIcon,
  Activity,
  AlertCircle,
  TrendingUp,
  ClipboardCheck,
  Settings,
  Check,
  RefreshCw,
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
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'

export const CalendarPage = () => {
  const { companyId, user } = useAuth()
  const queryClient = useQueryClient()
  const { settings: calendarSettings, isLoading: settingsLoading, isConfigured } = useCalendarSettings()
  // console.log('⚙️ Calendar settings:', { 
  //   settings: calendarSettings, 
  //   settingsLoading, 
  //   isConfigured: isConfigured(),
  //   fiscalYearEnd: calendarSettings?.fiscal_year_end
  // })
  const { events: aggregatedEvents, isLoading, sources } = useAggregatedEvents(
    calendarSettings?.fiscal_year_end ? new Date(calendarSettings.fiscal_year_end) : undefined
  )
  // console.log('📊 useAggregatedEvents result:', { 
  //   eventsCount: aggregatedEvents?.length || 0, 
  //   isLoading, 
  //   sources,
  //   sampleEvents: aggregatedEvents?.slice(0, 2)
  // })
  
  const { filteredEvents } = useFilteredEvents(aggregatedEvents)
  // console.log('🔍 useFilteredEvents result:', { 
  //   filteredCount: filteredEvents?.length || 0,
  //   originalCount: aggregatedEvents?.length || 0,
  //   sampleFiltered: filteredEvents?.slice(0, 2)
  // })
  
  // ✅ BYPASS: Usa aggregatedEvents se useFilteredEvents restituisce 0 eventi
  const eventsForFiltering = filteredEvents.length > 0 ? filteredEvents : aggregatedEvents
  // console.log('🔧 Events for filtering:', {
  //   source: filteredEvents.length > 0 ? 'filteredEvents' : 'aggregatedEvents',
  //   count: eventsForFiltering.length,
  //   filteredEventsCount: filteredEvents.length,
  //   aggregatedEventsCount: aggregatedEvents.length
  // })
  const [view, setView] = useCalendarView('month')
  const { createTask, isCreating, completeTask, isCompleting } = useGenericTasks()
  const [isCompletingMaintenance, setIsCompletingMaintenance] = useState(false)
  const { staff } = useStaff()
  const { departments } = useDepartments()
  const { products } = useProducts()
  // console.log('👥 Staff data:', { 
  //   staffCount: staff?.length || 0, 
  //   sampleStaff: staff?.slice(0, 2)
  // })
  // console.log('🏢 Departments data:', { 
  //   departmentsCount: departments?.length || 0, 
  //   sampleDepartments: departments?.slice(0, 2)
  // })
  const [showAlertModal, setShowAlertModal] = useState(false)
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(null)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showProductExpiryModal, setShowProductExpiryModal] = useState(false)

  // ✅ Nuovi filtri calendario
  const [calendarFilters, setCalendarFilters] = useState<NewCalendarFiltersType>(DEFAULT_CALENDAR_FILTERS)

  const handleFilterChange = (newFilters: NewCalendarFiltersType) => {
    setCalendarFilters(newFilters)
  }

  // ✅ Funzione refresh manuale
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0) // ← Forza re-render
  
  const handleManualRefresh = async () => {
    setIsRefreshing(true)
    console.log('🔄 Refresh manuale calendario...', new Date().toLocaleTimeString())
    
    try {
      // Invalida tutte le query principali del calendario
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['maintenance-tasks'], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['generic-tasks'], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['task-completions'], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['calendar-events'], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['macro-category-events'], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['staff'], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['products'], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['conservation-points'], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['maintenance-completions'], refetchType: 'all' }),
      ])
      
      // ✅ Forza re-render del componente
      setRefreshKey(prev => prev + 1)
      
      toast.success('✅ Calendario aggiornato!', { autoClose: 2000 })
    } catch (error) {
      console.error('Errore refresh:', error)
      toast.error('Errore durante l\'aggiornamento')
    } finally {
      setIsRefreshing(false)
    }
  }

  // ✅ Listener per refresh trigger da componenti figli (modal)
  useEffect(() => {
    const handleCalendarRefresh = () => {
      console.log('📢 Ricevuto evento calendar-refresh, forzo re-render...')
      setRefreshKey(prev => prev + 1)
    }

    window.addEventListener('calendar-refresh', handleCalendarRefresh)
    
    return () => {
      window.removeEventListener('calendar-refresh', handleCalendarRefresh)
    }
  }, [])

  // ✅ Auto-refresh calendario ogni 3 minuti
  useEffect(() => {
    const REFRESH_INTERVAL = 3 * 60 * 1000 // 3 minuti in millisecondi
    
    const intervalId = setInterval(() => {
      console.log('🔄 Auto-refresh calendario...', new Date().toLocaleTimeString())
      handleManualRefresh()
    }, REFRESH_INTERVAL)

    // Cleanup quando il componente viene smontato
    return () => {
      clearInterval(intervalId)
    }
  }, [queryClient])

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

  // ✅ Debug risultato finale
  // console.log('🎯 Final displayEvents count:', displayEvents.length)
  // console.log('🎯 Events breakdown:', {
  //   aggregatedEvents: aggregatedEvents.length,
  //   filteredEvents: filteredEvents.length,
  //   eventsForFiltering: eventsForFiltering.length,
  //   displayEvents: displayEvents.length,
  //   calendarFilters: JSON.stringify(calendarFilters, null, 2)
  // })

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
        if (!event || !event.start || !event.status) return false
        const eventDate = new Date(event.start)
        return eventDate >= today &&
               eventDate < tomorrow &&
               event.status !== 'completed'
      }
    )
  }, [displayEvents, refreshKey]) // ← Aggiunto refreshKey

  const tomorrowEvents = useMemo(() => {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    const dayAfterTomorrow = new Date(tomorrow)
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1)

    return displayEvents.filter(
      event => {
        if (!event || !event.start) return false
        const eventDate = new Date(event.start)
        return eventDate >= tomorrow && eventDate < dayAfterTomorrow
      }
    )
  }, [displayEvents, refreshKey]) // ← Aggiunto refreshKey

  const overdueEvents = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const oneWeekAgo = new Date(now)
    oneWeekAgo.setDate(now.getDate() - 7)

    return displayEvents.filter(event => {
      if (!event || !event.start) return false
      if (event.status === 'completed') return false

      const eventDate = new Date(event.start)
      eventDate.setHours(0, 0, 0, 0)

      return eventDate >= oneWeekAgo && eventDate < now
    })
  }, [displayEvents, refreshKey]) // ← Aggiunto refreshKey

  const shouldShowOverdueSection = useMemo(() => {
    if (overdueEvents.length === 0) return false
    if (!selectedCalendarDate) return true

    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const selectedDate = new Date(selectedCalendarDate)
    selectedDate.setHours(0, 0, 0, 0)

    return selectedDate <= now
  }, [overdueEvents.length, selectedCalendarDate, refreshKey]) // ← Aggiunto refreshKey

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

  // ✅ Calcola count eventi SOLO del mese corrente per la legenda
  const currentMonthSources = useMemo(() => {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    const currentMonthEvents = displayEvents.filter(event => {
      if (!event || !event.start) return false
      const eventDate = new Date(event.start)
      return eventDate >= monthStart && eventDate <= monthEnd
    })

    return {
      maintenance: currentMonthEvents.filter(e => e && e.source === 'maintenance' && e.status !== 'completed').length,
      temperatureChecks: 0, // Già incluso in maintenance
      haccpExpiry: currentMonthEvents.filter(e => e && e.source === 'custom' && e.metadata?.staff_id).length,
      productExpiry: currentMonthEvents.filter(e => e && e.source === 'custom' && e.metadata?.product_id).length,
      haccpDeadlines: 0, // Unificato in haccpExpiry per coerenza con legenda
      genericTasks: currentMonthEvents.filter(e => e && e.source === 'general_task' && e.status !== 'completed').length,
    }
  }, [displayEvents])

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
        <div className="mb-6">
          <CollapsibleCard
            title="Statistiche"
            icon={TrendingUp}
            counter={displayEvents.length}
            className="mb-4"
            defaultExpanded={true}
            actions={
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className={`
                  flex items-center gap-2 px-4 py-2 text-sm font-semibold
                  bg-gradient-to-r from-indigo-500 to-purple-600 text-white
                  rounded-lg border-2 border-indigo-300
                  hover:from-indigo-600 hover:to-purple-700
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-200
                  shadow-md hover:shadow-lg
                  ${isRefreshing ? 'animate-pulse' : ''}
                `}
                title="Aggiorna calendario e statistiche"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Aggiornamento...' : 'Aggiorna'}</span>
              </button>
            }
          >
            <div className="p-4">
              {/* Overview Stats - Design Moderno */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="group relative bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 border-2 border-indigo-200 hover:border-indigo-300 transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                  <div className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {displayEvents.length}
                  </div>
                  <div className="text-sm font-semibold text-gray-600 mt-1">📊 Eventi Totali</div>
                </div>
                <div className="group relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border-2 border-green-200 hover:border-green-300 transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                  <div className="text-3xl font-extrabold text-green-600">
                    {displayEvents.filter(e => e && e.status === 'completed').length}
                  </div>
                  <div className="text-sm font-semibold text-gray-600 mt-1">✅ Completati</div>
                </div>
                <div className="group relative bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-5 border-2 border-yellow-200 hover:border-yellow-300 transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                  <div className="text-3xl font-extrabold text-yellow-600">
                    {displayEvents.filter(e => e && e.status === 'pending').length}
                  </div>
                  <div className="text-sm font-semibold text-gray-600 mt-1">⏳ In Attesa</div>
                </div>
                <div className="group relative bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-5 border-2 border-red-200 hover:border-red-300 transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                  <div className="text-3xl font-extrabold text-red-600">
                    {overdueEvents.length}
                  </div>
                  <div className="text-sm font-semibold text-gray-600 mt-1">⚠️ In Ritardo</div>
                </div>
              </div>

              {/* Completion Rate - Design Moderno */}
              <div className="mb-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-5 border-2 border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <span className="text-lg">📈</span>
                    Tasso di Completamento
                  </span>
                  <span className="text-lg font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {displayEvents.length > 0
                      ? (
                          (displayEvents.filter(e => e && e.status === 'completed')
                            .length /
                            displayEvents.length) *
                          100
                        ).toFixed(1)
                      : '0.0'}
                    %
                  </span>
                </div>
                <div className="relative w-full bg-gray-300 rounded-full h-4 shadow-inner overflow-hidden">
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-green-400 via-green-500 to-emerald-500 h-4 rounded-full transition-all duration-500 ease-out shadow-lg"
                    style={{
                      width: `${displayEvents.length > 0 ? Math.min((displayEvents.filter(e => e && e.status === 'completed').length / displayEvents.length) * 100, 100) : 0}%`,
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Statistiche Temporali - Design Moderno */}
              <div className="mb-6 pb-6 border-b-2 border-gray-200">
                <h4 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-xl">📊</span>
                  Statistiche Temporali
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="group bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 text-center border-2 border-blue-200 hover:border-blue-300 transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                    <div className="text-2xl font-extrabold text-blue-600 mb-1">
                      {displayEvents.filter(e => {
                        if (!e || !e.start) return false
                        const eventDate = new Date(e.start)
                        const today = new Date()
                        today.setHours(0, 0, 0, 0)
                        eventDate.setHours(0, 0, 0, 0)
                        return eventDate.getTime() === today.getTime()
                      }).length}
                    </div>
                    <div className="text-xs text-blue-700 font-bold">📅 Oggi</div>
                  </div>

                  <div className="group bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 text-center border-2 border-green-200 hover:border-green-300 transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                    <div className="text-2xl font-extrabold text-green-600 mb-1">
                      {displayEvents.filter(e => {
                        if (!e || !e.start) return false
                        const eventDate = new Date(e.start)
                        const now = new Date()
                        const weekStart = new Date(now)
                        weekStart.setDate(now.getDate() - now.getDay() + 1)
                        weekStart.setHours(0, 0, 0, 0)
                        const weekEnd = new Date(weekStart)
                        weekEnd.setDate(weekStart.getDate() + 6)
                        weekEnd.setHours(23, 59, 59, 999)
                        return eventDate >= weekStart && eventDate <= weekEnd
                      }).length}
                    </div>
                    <div className="text-xs text-green-700 font-bold">🗓️ Questa Settimana</div>
                  </div>

                  <div className="group bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-xl p-4 text-center border-2 border-purple-200 hover:border-purple-300 transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                    <div className="text-2xl font-extrabold text-purple-600 mb-1">
                      {displayEvents.filter(e => {
                        if (!e || !e.start) return false
                        const eventDate = new Date(e.start)
                        const now = new Date()
                        return eventDate.getMonth() === now.getMonth() &&
                               eventDate.getFullYear() === now.getFullYear()
                      }).length}
                    </div>
                    <div className="text-xs text-purple-700 font-bold">📆 Questo Mese</div>
                  </div>

                  <div className="group bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 text-center border-2 border-orange-200 hover:border-orange-300 transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                    <div className="text-2xl font-extrabold text-orange-600 mb-1">
                      {displayEvents.filter(e => {
                        if (!e || !e.start) return false
                        const eventDate = new Date(e.start)
                        const now = new Date()
                        return eventDate.getFullYear() === now.getFullYear()
                      }).length}
                    </div>
                    <div className="text-xs text-orange-700 font-bold">🎯 Quest'Anno</div>
                  </div>
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
                        {(sources?.maintenance || 0) + (sources?.temperatureChecks || 0)}
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
                        {(sources?.haccpExpiry || 0) + (sources?.haccpDeadlines || 0)}
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
                {overdueEvents.filter(e => e && e.id && e.title).map(event => (
                  <div
                    key={event.id}
                    className="bg-white border border-red-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm">
                            {event.type === 'maintenance' && '🔧'}
                            {event.type === 'general_task' && '📋'}
                            {event.type === 'temperature_reading' && '🌡️'}
                            {event.type === 'custom' && '📌'}
                            {!event.type && '📅'}
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

                        {/* Pulsante Completa */}
                        {event.source && (event.source === 'general_task' || event.source === 'maintenance') && (
                          <div className="mt-3 pt-3 border-t border-red-300">
                            <button
                              onClick={async (e) => {
                                e.preventDefault()
                                e.stopPropagation()

                                if (event.source === 'maintenance') {
                                  if (!companyId || !user) {
                                    toast.error('Utente non autenticato')
                                    return
                                  }

                                  setIsCompletingMaintenance(true)
                                  try {
                                    const maintenanceId = event.metadata?.maintenance_id || event.id
                                    if (!maintenanceId) {
                                      toast.error('ID manutenzione non trovato')
                                      return
                                    }

                                    const { error } = await supabase
                                      .from('maintenance_tasks')
                                      .update({
                                        status: 'completed',
                                        updated_at: new Date().toISOString()
                                      })
                                      .eq('id', maintenanceId)
                                      .eq('company_id', companyId)

                                    if (error) throw error

                                    await queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
                                    await queryClient.invalidateQueries({ queryKey: ['maintenance-tasks'] })
                                    toast.success('Manutenzione completata!')
                                  } catch (error) {
                                    console.error('Error completing maintenance:', error)
                                    toast.error('Errore nel completamento della manutenzione')
                                  } finally {
                                    setIsCompletingMaintenance(false)
                                  }
                                } else {
                                  const today = new Date()
                                  today.setHours(0, 0, 0, 0)

                                  const taskDate = new Date(event.start)
                                  taskDate.setHours(0, 0, 0, 0)

                                  if (taskDate > today) {
                                    const taskDateStr = taskDate.toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })
                                    toast.warning(`⚠️ Non puoi completare eventi futuri!\nQuesta mansione è del ${taskDateStr}.`, {
                                      autoClose: 5000
                                    })
                                    return
                                  }

                                  const taskId = event.metadata?.task_id || event.id
                                  if (!taskId) {
                                    toast.error('ID mansione non trovato')
                                    return
                                  }
                                  
                                  completeTask(
                                    { taskId: taskId },
                                    {
                                      onSuccess: async () => {
                                        await queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
                                        await queryClient.invalidateQueries({ queryKey: ['generic-tasks'] })
                                        await queryClient.invalidateQueries({ queryKey: ['task-completions', companyId] })
                                        toast.success('Mansione completata!')
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
                              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                            >
                              <Check className="w-4 h-4" />
                              {(isCompleting || isCompletingMaintenance) ? 'Completando...' : event.source === 'maintenance' ? 'Completa Manutenzione' : 'Completa Mansione'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleCard>
          )}
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
            eventSources={currentMonthSources}
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
                  {overdueEvents.filter(e => e && e.id && e.title && e.start).slice(0, 3).map(event => (
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
                        ⚠️ {event.priority || 'medium'}
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
                  {todayEvents.filter(e => e && e.id && e.title && e.start).slice(0, 3).map(event => (
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
                  {tomorrowEvents.filter(e => e && e.id && e.title && e.start).slice(0, 3).map(event => (
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
