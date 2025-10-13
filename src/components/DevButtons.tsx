import React, { useEffect } from 'react'
import { Users, RotateCcw, CheckCircle } from 'lucide-react'

interface DevButtonsProps {
  onPrefillOnboarding: () => void
  onResetOnboarding: () => void
  onCompleteOnboarding: () => void | Promise<void>
  isDevMode?: boolean
}

const DevButtons: React.FC<DevButtonsProps> = ({
  onPrefillOnboarding,
  onResetOnboarding,
  onCompleteOnboarding,
  isDevMode = false,
}) => {
  // Always visible for testing and demo (isDevMode reserved for future use)
  useEffect(() => {
    if (isDevMode) {
      console.log('DevButtons loaded in dev mode')
    }
  }, [isDevMode])

  return (
    <div className="flex gap-2 flex-wrap">
      {/* PULSANTE PRECOMPILA */}
      <button
        onClick={onPrefillOnboarding}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-green-600 bg-white border border-green-200 rounded-md hover:text-green-700 hover:bg-green-50 transition-colors"
        title="Precompila onboarding con dati di test"
      >
        <Users className="h-4 w-4" />
        <span className="hidden sm:inline">Precompila</span>
        <span className="sm:hidden">Precompila</span>
      </button>

      {/* PULSANTE COMPLETA ONBOARDING */}
      <button
        onClick={() => {
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
          console.log('🔵 [DevButtons] CLICK su "Completa Onboarding"')
          console.log('📍 Sorgente: DevButtons nell\'OnboardingWizard')
          console.log('⏰ Timestamp:', new Date().toISOString())
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
          onCompleteOnboarding()
        }}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-200 rounded-md hover:text-blue-700 hover:bg-blue-50 transition-colors"
        title="Completa onboarding automaticamente"
      >
        <CheckCircle className="h-4 w-4" />
        <span className="hidden sm:inline">Completa Onboarding</span>
        <span className="sm:hidden">Completa</span>
      </button>

      {/* PULSANTE RESET ONBOARDING */}
      <button
        onClick={onResetOnboarding}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-orange-600 bg-white border border-orange-200 rounded-md hover:text-orange-700 hover:bg-orange-50 transition-colors"
        title="Reset Onboarding - Cancella tutto e ricomincia"
      >
        <RotateCcw className="h-4 w-4" />
        <span className="hidden sm:inline">Reset Onboarding</span>
        <span className="sm:hidden">Reset</span>
      </button>
    </div>
  )
}

export default DevButtons
