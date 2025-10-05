import React from 'react'
import { Users, RotateCcw, Bell } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAlertBadge } from '@/features/calendar/hooks/useCalendarAlerts'
import { useAggregatedEvents } from '@/features/calendar/hooks/useAggregatedEvents'
import { useFilteredEvents } from '@/features/calendar/hooks/useFilteredEvents'

interface HeaderButtonsProps {
  onResetApp: () => void
  onOpenOnboarding: () => void
  showResetApp?: boolean
}

const HeaderButtons: React.FC<HeaderButtonsProps> = ({
  onResetApp,
  onOpenOnboarding,
  showResetApp = false,
}) => {
  // ✅ Alert badge logic
  const { events } = useAggregatedEvents()
  const { filteredEvents } = useFilteredEvents(events)
  const { count, hasAlerts, hasCritical } = useAlertBadge(filteredEvents)

  return (
    <div className="flex gap-2">
      {/* ✅ Alert Badge */}
      <Link
        to="/attivita"
        className="relative flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:text-gray-700 hover:bg-gray-50 transition-colors"
        title="Vai al calendario attività"
      >
        <Bell className="h-4 w-4" />
        <span className="hidden sm:inline">Attività</span>
        {hasAlerts && (
          <span
            className={`absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white ${
              hasCritical ? 'bg-red-600' : 'bg-orange-500'
            }`}
          >
            {count > 9 ? '9+' : count}
          </span>
        )}
      </Link>

      {/* Pulsante Reset App - Solo in modalità sviluppo */}
      {showResetApp && (
        <button
          onClick={onResetApp}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-md hover:text-red-700 hover:bg-red-50 transition-colors"
          title="Reset completo dell'app (solo sviluppo)"
        >
          <RotateCcw className="h-4 w-4" />
          <span className="hidden sm:inline">Reset App</span>
          <span className="sm:hidden">Reset</span>
        </button>
      )}

      {/* Pulsante Riapri Onboarding - Sempre visibile */}
      <button
        onClick={onOpenOnboarding}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-200 rounded-md hover:text-blue-700 hover:bg-blue-50 transition-colors"
        title="Riapri l'onboarding"
      >
        <Users className="h-4 w-4" />
        <span className="hidden sm:inline">Riapri Onboarding</span>
        <span className="sm:hidden">Onboarding</span>
      </button>
    </div>
  )
}

export default HeaderButtons
