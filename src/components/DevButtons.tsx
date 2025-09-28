import React from 'react'
import { Users, RotateCcw, CheckCircle } from 'lucide-react'

interface DevButtonsProps {
  onPrefillOnboarding: () => void
  onResetOnboarding: () => void
  onCompleteOnboarding: () => void
  isDevMode?: boolean
}

const DevButtons: React.FC<DevButtonsProps> = ({
  onPrefillOnboarding,
  onResetOnboarding,
  onCompleteOnboarding,
  isDevMode = false,
}) => {
  // Always visible for testing and demo (isDevMode reserved for future use)
  if (isDevMode) {
    console.log('DevButtons loaded in dev mode')
  }
  return (
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={onPrefillOnboarding}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-green-600 bg-white border border-green-200 rounded-md hover:text-green-700 hover:bg-green-50 transition-colors"
        title="Precompila onboarding con dati di test"
      >
        <Users className="h-4 w-4" />
        <span className="hidden sm:inline">Precompila</span>
        <span className="sm:hidden">Precompila</span>
      </button>

      <button
        onClick={onCompleteOnboarding}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-200 rounded-md hover:text-blue-700 hover:bg-blue-50 transition-colors"
        title="Completa onboarding automaticamente"
      >
        <CheckCircle className="h-4 w-4" />
        <span className="hidden sm:inline">Completa Onboarding</span>
        <span className="sm:hidden">Completa</span>
      </button>

      <button
        onClick={onResetOnboarding}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-md hover:text-red-700 hover:bg-red-50 transition-colors"
        title="Reset completo onboarding e app"
      >
        <RotateCcw className="h-4 w-4" />
        <span className="hidden sm:inline">Reset Onboarding</span>
        <span className="sm:hidden">Reset</span>
      </button>
    </div>
  )
}

export default DevButtons
