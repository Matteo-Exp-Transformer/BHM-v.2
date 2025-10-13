import React from 'react'
import { Users, Bell, UserX, RefreshCw, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAlertBadge } from '@/features/calendar/hooks/useCalendarAlerts'
import { useAggregatedEvents } from '@/features/calendar/hooks/useAggregatedEvents'
import { useFilteredEvents } from '@/features/calendar/hooks/useFilteredEvents'
import {
  resetOperationalData,
  resetTotAndUsers,
  debugAuthState
} from '@/utils/onboardingHelpers'
import { manualSyncWithOtherPorts } from '@/utils/multiHostAuth'

interface HeaderButtonsProps {
  onOpenOnboarding: () => void
  showDevButtons?: boolean
}

const HeaderButtons: React.FC<HeaderButtonsProps> = ({
  onOpenOnboarding,
  showDevButtons = false,
}) => {
  // ✅ Alert badge logic
  const { events } = useAggregatedEvents()
  const { filteredEvents } = useFilteredEvents(events)
  const { count, hasAlerts, hasCritical } = useAlertBadge(filteredEvents)

  return (
    <div className="flex gap-2 flex-wrap">
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

      {/* 🔄 Cancella Dati e Ricomincia - SEMPRE VISIBILE */}
      <button
        onClick={async () => {
          const success = await resetOperationalData()
          if (success) {
            // Dopo il reset, apri automaticamente l'onboarding
            setTimeout(() => onOpenOnboarding(), 500)
          }
        }}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-orange-600 bg-white border border-orange-200 rounded-md hover:text-orange-700 hover:bg-orange-50 transition-colors"
        title="Cancella tutti i dati operativi e ricomincia l'onboarding"
      >
        <Trash2 className="h-4 w-4" />
        <span className="hidden sm:inline">Cancella e Ricomincia</span>
        <span className="sm:hidden">Reset</span>
      </button>

      {/* Pulsante Riapri Onboarding */}
      <button
        onClick={onOpenOnboarding}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-200 rounded-md hover:text-blue-700 hover:bg-blue-50 transition-colors"
        title="Riapri l'onboarding"
      >
        <Users className="h-4 w-4" />
        <span className="hidden sm:inline">Onboarding</span>
        <span className="sm:hidden">Onboarding</span>
      </button>

      {/* PULSANTI DEV - Solo in modalità sviluppo */}
      {showDevButtons && (
        <>
          {/* Debug Auth State */}
          <button
            onClick={() => debugAuthState()}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-purple-600 bg-white border border-purple-200 rounded-md hover:text-purple-700 hover:bg-purple-50 transition-colors"
            title="Debug: Verifica stato autenticazione"
          >
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Debug Auth</span>
            <span className="sm:hidden">Auth</span>
          </button>

          {/* Sincronizza Host (Multi-Port Login) */}
          <button
            onClick={manualSyncWithOtherPorts}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-purple-600 bg-white border border-purple-200 rounded-md hover:text-purple-700 hover:bg-purple-50 transition-colors"
            title="Sincronizza sessione con altre porte (3000, 3002, 5173)"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Sync Host</span>
            <span className="sm:hidden">Sync</span>
          </button>

          {/* Reset Tot+Utenti - PERICOLOSO */}
          <button
            onClick={() => resetTotAndUsers()}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-800 bg-white border border-red-300 rounded-md hover:text-red-900 hover:bg-red-50 transition-colors"
            title="⚠️ PERICOLOSO: Cancella TUTTO incluso users e companies"
          >
            <UserX className="h-4 w-4" />
            <span className="hidden sm:inline">Reset Tot+Users</span>
            <span className="sm:hidden">Tot</span>
          </button>
        </>
      )}
    </div>
  )
}

export default HeaderButtons
