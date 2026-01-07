import {
  Calendar as CalendarIcon,
  Activity,
  AlertCircle,
} from 'lucide-react'
import type { CalendarEvent } from '@/types/calendar'

interface CalendarQuickOverviewProps {
  overdueEvents: CalendarEvent[]
  todayEvents: CalendarEvent[]
  tomorrowEvents: CalendarEvent[]
}

/**
 * Componente Quick Overview - 3 card per eventi in ritardo, oggi e domani
 * Mostra fino a 3 eventi per categoria con indicatore priorità
 */
export function CalendarQuickOverview({
  overdueEvents,
  todayEvents,
  tomorrowEvents,
}: CalendarQuickOverviewProps) {
  return (
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
  )
}




