import React from 'react'
import { Users, RotateCcw, Bell, CheckCircle, Database, UserX, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAlertBadge } from '@/features/calendar/hooks/useCalendarAlerts'
import { useAggregatedEvents } from '@/features/calendar/hooks/useAggregatedEvents'
import { useFilteredEvents } from '@/features/calendar/hooks/useFilteredEvents'
import { 
  resetManualData, 
  resetOnboardingData, 
  resetAllData, 
  resetTotAndUsers,
  prefillOnboarding,
  completeOnboarding
} from '@/utils/onboardingHelpers'

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
          {/* Precompila */}
          <button
            onClick={prefillOnboarding}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-green-600 bg-white border border-green-200 rounded-md hover:text-green-700 hover:bg-green-50 transition-colors"
            title="Precompila onboarding con dati di test"
          >
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Precompila</span>
            <span className="sm:hidden">Precompila</span>
          </button>

          {/* Completa Onboarding */}
          <button
            onClick={completeOnboarding}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-200 rounded-md hover:text-blue-700 hover:bg-blue-50 transition-colors"
            title="Completa onboarding automaticamente"
          >
            <CheckCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Completa</span>
            <span className="sm:hidden">Completa</span>
          </button>

          {/* Reset Manuale */}
          <button
            onClick={resetManualData}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-yellow-600 bg-white border border-yellow-200 rounded-md hover:text-yellow-700 hover:bg-yellow-50 transition-colors"
            title="Reset Manuale - Solo dati utente manuali"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="hidden sm:inline">Reset Man.</span>
            <span className="sm:hidden">Man.</span>
          </button>

          {/* Reset Onboarding */}
          <button
            onClick={resetOnboardingData}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-orange-600 bg-white border border-orange-200 rounded-md hover:text-orange-700 hover:bg-orange-50 transition-colors"
            title="Reset Onboarding - Solo dati Precompila"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="hidden sm:inline">Reset Onb.</span>
            <span className="sm:hidden">Onb.</span>
          </button>

          {/* Reset All Data */}
          <button
            onClick={resetAllData}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-md hover:text-red-700 hover:bg-red-50 transition-colors"
            title="Reset All Data - Tutti i dati"
          >
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">All Data</span>
            <span className="sm:hidden">All</span>
          </button>

          {/* Reset Tot+Utenti */}
          <button
            onClick={resetTotAndUsers}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-800 bg-white border border-red-300 rounded-md hover:text-red-900 hover:bg-red-50 transition-colors"
            title="Reset Tot+Utenti - Tutto + utenti + token"
          >
            <UserX className="h-4 w-4" />
            <span className="hidden sm:inline">Tot+Utenti</span>
            <span className="sm:hidden">Tot</span>
          </button>
        </>
      )}
    </div>
  )
}

export default HeaderButtons
