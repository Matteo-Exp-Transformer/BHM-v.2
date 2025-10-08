import { useState, useMemo, useCallback } from 'react'
import {
  Calendar as CalendarIcon,
  Activity,
  AlertCircle,
  TrendingUp,
  ClipboardCheck,
} from 'lucide-react'
import Calendar from './Calendar'
import { CollapsibleCard } from '@/components/ui/CollapsibleCard'
import type { CalendarEvent } from '@/types/calendar'
import {
  ViewSelector,
  HorizontalCalendarFilters,
  useCalendarView,
  GenericTaskForm,
} from './components'
import { useCalendarAlerts } from './hooks/useCalendarAlerts'
import { useAggregatedEvents } from './hooks/useAggregatedEvents'
import { useFilteredEvents } from './hooks/useFilteredEvents'
import { useGenericTasks } from './hooks/useGenericTasks'
import { useStaff } from '@/features/management/hooks/useStaff'

export const CalendarPage = () => {
  // ✅ Sostituisci useCalendar con nuovi hooks
  const { events: aggregatedEvents, isLoading, sources } = useAggregatedEvents()
  const { filteredEvents } = useFilteredEvents(aggregatedEvents)
  const { alertCount, criticalCount } = useCalendarAlerts(filteredEvents)
  const [view, setView] = useCalendarView('month')
  const { createTask, isCreating } = useGenericTasks()
  const { staff } = useStaff()

  const [activeFilters, setActiveFilters] = useState({
    eventTypes: [
      'maintenance',
      'general_task',
      'temperature_reading',
      'custom',
    ] as CalendarEvent['type'][],
    priorities: ['critical', 'high', 'medium', 'low'] as CalendarEvent['priority'][],
    statuses: ['pending', 'overdue', 'completed'] as CalendarEvent['status'][],
  })

  const handleFilterChange = useCallback((newFilters: typeof activeFilters) => {
    console.log('🔍 Filtri aggiornati:', newFilters)
    setActiveFilters(newFilters)
  }, [])

  const displayEvents = useMemo(() => {
    const filtered = filteredEvents.filter(event => {
      const typeMatch = activeFilters.eventTypes.length === 0 || activeFilters.eventTypes.includes(event.type)
      const priorityMatch = activeFilters.priorities.length === 0 || activeFilters.priorities.includes(event.priority)
      const statusMatch = activeFilters.statuses.length === 0 || activeFilters.statuses.includes(event.status)

      return typeMatch && priorityMatch && statusMatch
    })

    console.log(`📊 Eventi totali: ${filteredEvents.length}, Eventi filtrati: ${filtered.length}`, {
      filtri: activeFilters,
      sample: filtered.slice(0, 3).map(e => ({ title: e.title, type: e.type, priority: e.priority, status: e.status }))
    })

    return filtered
  }, [filteredEvents, activeFilters])

  // ✅ Calcola statistiche
  const todayEvents = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return displayEvents.filter(
      event => event.start >= today && event.start < tomorrow
    )
  }, [displayEvents])

  const upcomingEvents = useMemo(() => {
    const now = new Date()
    const futureDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    return displayEvents.filter(
      event =>
        event.start >= now &&
        event.start <= futureDate &&
        event.status === 'pending'
    )
  }, [displayEvents])

  const overdueEvents = useMemo(() => {
    return displayEvents.filter(event => event.status === 'overdue')
  }, [displayEvents])

  // ✅ Event handlers
  const onEventClick = (event: any) => {
    console.log('Event clicked:', event)
  }

  const onEventUpdate = (event: any) => {
    console.log('Event updated:', event)
  }

  const onEventDelete = (eventId: string) => {
    console.log('Event deleted:', eventId)
  }

  const onDateSelect = (start: Date, end: Date) => {
    console.log('Date selected:', start, end)
  }

  const createEvent = (eventData: any) => {
    console.log('Create event:', eventData)
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
      note: taskData.note,
      custom_days: taskData.giorniCustom,
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
                <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                  <span className="text-sm font-medium text-red-700">
                    {criticalCount > 0 ? '🔴' : '⚠️'} {alertCount} Alert
                  </span>
                </div>
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
                    <div className="flex items-center text-sm text-yellow-600">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      <span>
                        {upcomingEvents.length} eventi prossimi (7 giorni)
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-blue-600">
                      <Activity className="h-4 w-4 mr-2" />
                      <span>{todayEvents.length} eventi oggi</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleCard>
        </div>

        {/* Filtri Orizzontali */}
        <div className="mb-6">
          <HorizontalCalendarFilters
            onFilterChange={handleFilterChange}
            initialFilters={activeFilters}
          />
        </div>

        {/* Calendario */}
        <div className="mb-6">
            <Calendar
              events={displayEvents}
              onEventClick={onEventClick}
              onEventCreate={handleCreateEvent}
              onEventUpdate={onEventUpdate}
              onEventDelete={onEventDelete}
              onDateSelect={onDateSelect}
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
              }}
              currentView={view}
              loading={isLoading}
              error={null}
              useMacroCategories={true}
            />
        </div>

        {/* Quick Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  Nessun evento programmato per oggi
                </p>
              ) : (
                <div className="space-y-3">
                  {todayEvents.slice(0, 3).map(event => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {event.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {event.start.toLocaleTimeString('it-IT', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          event.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : event.status === 'overdue'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {event.status === 'completed'
                          ? '✅'
                          : event.status === 'overdue'
                            ? '⚠️'
                            : '⏳'}
                      </span>
                    </div>
                  ))}
                  {todayEvents.length > 3 && (
                    <p className="text-xs text-gray-500 text-center">
                      +{todayEvents.length - 3} altri eventi
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

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

          {/* Upcoming Events */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-blue-600" />
                Prossimi Eventi
              </h3>
            </div>
            <div className="p-4">
              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nessun evento nei prossimi 7 giorni
                </p>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.slice(0, 3).map(event => (
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
                  {upcomingEvents.length > 3 && (
                    <p className="text-xs text-blue-500 text-center">
                      +{upcomingEvents.length - 3} altri eventi programmati
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CalendarPage
