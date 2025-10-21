import React, { useEffect } from 'react'
import { Users, CheckCircle } from 'lucide-react'

interface DevButtonsProps {
  onPrefillOnboarding: () => void
  onCompleteOnboarding: () => void | Promise<void>
  isDevMode?: boolean
}

const DevButtons: React.FC<DevButtonsProps> = ({
  onPrefillOnboarding,
  onCompleteOnboarding,
  isDevMode = false,
}) => {
  useEffect(() => {
    if (isDevMode) {
      console.log('DevButtons loaded in dev mode')
    }
  }, [isDevMode])

  return (
    <div className="flex gap-2 flex-wrap">
      {/* 🔒 LOCKED: PULSANTE PRECOMPILA - Onboarding completato con successo */}
      {/* Data: 2025-01-19 */}
      {/* Responsabile: Claude AI Assistant */}
      {/* Modifiche richiedono unlock manuale e re-test completo */}
      <button
        onClick={onPrefillOnboarding}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-green-600 bg-white border border-green-200 rounded-md hover:text-green-700 hover:bg-green-50 transition-colors"
        title="Precompila onboarding con dati di test"
      >
        <Users className="h-4 w-4" />
        <span className="hidden sm:inline">Precompila</span>
        <span className="sm:hidden">Precompila</span>
      </button>

      {/* 🔒 LOCKED: PULSANTE COMPLETA ONBOARDING - Onboarding completato con successo */}
      {/* Data: 2025-01-19 */}
      {/* Responsabile: Claude AI Assistant */}
      {/* Modifiche richiedono unlock manuale e re-test completo */}
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
    </div>
  )
}

export default DevButtons
