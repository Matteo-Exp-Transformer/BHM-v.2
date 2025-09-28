import React from 'react'
import { Users, RotateCcw } from 'lucide-react'

interface HeaderButtonsProps {
  onResetApp: () => void
  onOpenOnboarding: () => void
  showResetApp?: boolean
}

const HeaderButtons: React.FC<HeaderButtonsProps> = ({
  onResetApp,
  onOpenOnboarding,
  showResetApp = false
}) => {
  return (
    <div className="flex gap-2">
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