import {
  Calendar as CalendarIcon,
  Activity,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { CollapsibleCard } from '@/components/ui/CollapsibleCard'
import type { CalendarEvent } from '@/types/calendar'
import type { CalendarViewType } from './ViewSelector'

interface EventSources {
  maintenance?: number
  temperatureChecks?: number
  haccpExpiry?: number
  productExpiry?: number
  haccpDeadlines?: number
  genericTasks?: number
}

const VIEW_LABELS: Record<CalendarViewType, string> = {
  year: 'Statistiche annuali',
  month: 'Statistiche mensili',
  week: 'Statistiche settimanali',
  day: 'Statistiche giornaliere',
}

interface CalendarStatsPanelProps {
  viewBasedEvents: CalendarEvent[]
  /** Vista calendario corrente: usata per il sottotitolo (annuali / mensili / settimanali / giornaliere) */
  calendarView?: CalendarViewType
  eventsInWaiting: CalendarEvent[]
  overdueEvents: CalendarEvent[]
  todayEvents: CalendarEvent[]
  tomorrowEvents: CalendarEvent[]
  viewBasedSources: EventSources
  isRefreshing: boolean
  onRefresh: () => void
  expanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
}

/**
 * Pannello statistiche calendario
 * Mostra overview, completion rate, statistiche temporali e breakdown per tipologia
 */
export function CalendarStatsPanel({
  viewBasedEvents,
  calendarView = 'month',
  eventsInWaiting,
  overdueEvents,
  todayEvents,
  tomorrowEvents,
  viewBasedSources,
  isRefreshing,
  onRefresh,
  expanded,
  onExpandedChange,
}: CalendarStatsPanelProps) {
  const viewSubtitle = VIEW_LABELS[calendarView]
  return (
    <CollapsibleCard
      title="Statistiche"
      subtitle={viewSubtitle}
      icon={Activity}
      defaultOpen={true}
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      actions={
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRefresh()
          }}
          disabled={isRefreshing}
          className={`p-2 rounded-lg transition-all duration-200 ${
            isRefreshing
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
          }`}
          title="Aggiorna calendario"
        >
          <RefreshCw
            className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`}
          />
        </button>
      }
    >
      <div className="p-4">
        {/* Overview Stats - Design Moderno */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="group relative bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 border-2 border-indigo-200 hover:border-indigo-300 transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
            <div className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {viewBasedEvents.filter(e => e && e.status !== 'completed').length}
            </div>
            <div className="text-sm font-semibold text-gray-600 mt-1">Attività / Mansioni</div>
          </div>
          <div className="group relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border-2 border-green-200 hover:border-green-300 transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
            <div className="text-3xl font-extrabold text-green-600">
              {viewBasedEvents.filter(e => e && e.status === 'completed').length}
            </div>
            <div className="text-sm font-semibold text-gray-600 mt-1">Completate</div>
          </div>
          <div className="group relative bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-5 border-2 border-yellow-200 hover:border-yellow-300 transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
            <div className="text-3xl font-extrabold text-yellow-600">
              {viewBasedEvents.filter(e => e && e.status !== 'completed').length}
            </div>
            <div className="text-sm font-semibold text-gray-600 mt-1">In Attesa</div>
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
              {viewBasedEvents.length > 0
                ? (
                    (viewBasedEvents.filter(e => e && e.status === 'completed')
                      .length /
                      viewBasedEvents.length) *
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
                width: `${viewBasedEvents.length > 0 ? Math.min((viewBasedEvents.filter(e => e && e.status === 'completed').length / viewBasedEvents.length) * 100, 100) : 0}%`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent rounded-full"></div>
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
                  {(viewBasedSources?.maintenance || 0) + (viewBasedSources?.temperatureChecks || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  📦 Scadenze Prodotti
                </span>
                <span className="font-medium">
                  {viewBasedSources?.productExpiry || 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">⏰ Alert HACCP</span>
                <span className="font-medium">
                  {(viewBasedSources?.haccpExpiry || 0) + (viewBasedSources?.haccpDeadlines || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">📋 Attività Generiche</span>
                <span className="font-medium">
                  {viewBasedSources?.genericTasks || 0}
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
  )
}




