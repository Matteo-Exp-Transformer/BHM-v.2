import {
  Calendar as CalendarIcon,
  Activity,
  AlertCircle,
  TrendingUp,
} from 'lucide-react'
import Calendar from './Calendar'
import { useCalendar } from './hooks/useCalendar'
import { CollapsibleCard } from '@/components/ui/CollapsibleCard'

export const CalendarPage = () => {
  const {
    events,
    isLoading,
    error,
    onEventClick,
    onEventUpdate,
    onEventDelete,
    onDateSelect,
    createEvent,
    stats,
    todayEvents,
    upcomingEvents,
    overdueEvents,
    viewConfig,
  } = useCalendar()

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-6">
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
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Stats Panel */}
        <div className="mb-6">
          <CollapsibleCard
            title="Statistiche"
            icon={TrendingUp}
            counter={stats.total}
            className="mb-4"
            defaultExpanded={true}
          >
            <div className="p-4">
              {/* Overview Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.total}
                  </div>
                  <div className="text-sm text-gray-500">Eventi Totali</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.completed}
                  </div>
                  <div className="text-sm text-gray-500">Completati</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {stats.pending}
                  </div>
                  <div className="text-sm text-gray-500">In Attesa</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {stats.overdue}
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
                    {stats.completionRate.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(stats.completionRate, 100)}%`,
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
                    {Object.entries(stats.byType).map(([type, events]) => (
                      <div
                        key={type}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-gray-600">
                          {type === 'maintenance' && '🔧 Manutenzioni'}
                          {type === 'general_task' && '📋 Mansioni'}
                          {type === 'temperature_reading' && '🌡️ Temperature'}
                          {type === 'custom' && '📌 Personalizzati'}
                        </span>
                        <span className="font-medium">{events.length}</span>
                      </div>
                    ))}
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

        {/* Main Calendar */}
        <div className="mb-6">
          <Calendar
            events={events}
            onEventClick={onEventClick}
            onEventCreate={handleCreateEvent}
            onEventUpdate={onEventUpdate}
            onEventDelete={onEventDelete}
            onDateSelect={onDateSelect}
            config={viewConfig}
            loading={isLoading}
            error={typeof error === 'string' ? error : error?.message || null}
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
