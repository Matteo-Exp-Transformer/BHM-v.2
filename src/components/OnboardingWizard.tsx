import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

// Step Components
import BusinessInfoStep from './onboarding-steps/BusinessInfoStep'
import DepartmentsStep from './onboarding-steps/DepartmentsStep'
import StaffStep from './onboarding-steps/StaffStep'
import ConservationStep from './onboarding-steps/ConservationStep'
import TasksStep from './onboarding-steps/TasksStep'
import InventoryStep from './onboarding-steps/InventoryStep'
import CalendarConfigStep from './onboarding-steps/CalendarConfigStep'

// Navigator
import StepNavigator from './StepNavigator'

// Control Components
import DevButtons from './DevButtons'

// Onboarding Helpers
import {
  getPrefillData,
  completeOnboarding as completeOnboardingHelper,
} from '@/utils/onboardingHelpers'

import type { OnboardingData } from '@/types/onboarding'

const TOTAL_STEPS = 7

const OnboardingWizard = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { companyId } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<OnboardingData>({})
  const [isValid, setIsValid] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)

  // Carica dati salvati in localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('onboarding-data')
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        setFormData(parsed)
      } catch (error) {
        console.error('Error parsing saved onboarding data:', error)
      }
    }
  }, [])

  // Gestori per i pulsanti di controllo
  const handlePrefillOnboarding = useCallback(async () => {
    try {
      // ⚠️ NUOVO: prefillOnboarding è ora async (usa email utente corrente)
      await import('@/utils/onboardingHelpers').then(async (module) => {
        await module.prefillOnboarding()
      })
      
      // Ricarica i dati da localStorage
      const savedData = localStorage.getItem('onboarding-data')
      if (savedData) {
        const parsed = JSON.parse(savedData)
        setFormData(parsed)
        toast.success('Dati precompilati caricati con la tua email!')
      }
    } catch (error) {
      console.error('Error prefilling onboarding:', error)
      toast.error('Errore durante la precompilazione')
    }
  }, [])

  const handleCompleteOnboarding = useCallback(async () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🟢 [OnboardingWizard] handleCompleteOnboarding CHIAMATO')
    console.log('📍 Sorgente: Callback da DevButtons')
    console.log('📊 CompanyId ricevuto:', companyId || 'NULL')
    console.log('📦 FormData presente:', !!formData)
    console.log('📦 FormData keys:', Object.keys(formData))
    console.log('⏰ Timestamp:', new Date().toISOString())
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    try {
      const resultCompanyId = await completeOnboardingHelper(companyId, formData)
      console.log('✅ Onboarding completato (DevButtons), companyId:', resultCompanyId)
      console.log('🔄 Invalidazione cache React Query...')

      // Invalida TUTTE le query per ricaricare i dati
      await queryClient.invalidateQueries()

      console.log('✅ Cache invalidata')
      console.log('🚀 Navigazione a /dashboard...')

      // Naviga a dashboard con React Router (NO RELOAD!)
      navigate('/dashboard', { replace: true })

      console.log('✅ Navigazione completata!')
    } catch (error) {
      console.error('❌ Errore handleCompleteOnboarding:', error)
      toast.error("Errore durante il completamento dell'onboarding")
    }
  }, [companyId, formData, queryClient, navigate])

  const handleSkipOnboarding = useCallback(() => {
    const confirmed = window.confirm(
      '⚠️ ATTENZIONE!\n\n' +
        'Sei sicuro di voler saltare la configurazione iniziale?\n\n' +
        'Potrai sempre completarla successivamente dalle impostazioni.\n\n' +
        'Vuoi continuare?'
    )

    if (!confirmed) {
      return
    }

    try {
      // Marca onboarding come completato nel localStorage
      localStorage.setItem('onboarding-completed', 'true')
      localStorage.setItem('onboarding-completed-at', new Date().toISOString())

      // Pulisci localStorage onboarding data
      localStorage.removeItem('onboarding-data')

      toast.success('Configurazione saltata. Puoi completarla successivamente dalle impostazioni.', {
        position: 'top-right',
        autoClose: 3000,
      })

      // Reindirizza alla dashboard
      navigate('/dashboard')
    } catch (error) {
      console.error('Error skipping onboarding:', error)
      toast.error('Errore durante il salto della configurazione')
    }
  }, [navigate])

  // Salva automaticamente in localStorage con debounce
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    if (Object.keys(formData).length > 0) {
      saveTimeoutRef.current = setTimeout(() => {
        localStorage.setItem('onboarding-data', JSON.stringify(formData))
      }, 500)
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [formData])

  const updateFormData = useCallback(
    <Key extends keyof OnboardingData>(
      stepKey: Key,
      data: OnboardingData[Key]
    ) => {
      setFormData(prev => ({
        ...prev,
        [stepKey]: data,
      }))
    },
    []
  )

  const handleValidChange = useCallback((valid: boolean) => {
    setIsValid(valid)
  }, [])

  const updateFormDataTasks = useCallback(
    (data: OnboardingData['tasks']) => {
      updateFormData('tasks', data)
    },
    [updateFormData]
  )

  const updateFormDataConservation = useCallback(
    (data: OnboardingData['conservation']) => {
      updateFormData('conservation', data)
    },
    [updateFormData]
  )

  const updateFormDataStaff = useCallback(
    (data: OnboardingData['staff']) => {
      updateFormData('staff', data)
    },
    [updateFormData]
  )

  const handleNext = async () => {
    if (!isValid) {
      toast.error('Completa tutti i campi obbligatori prima di continuare')
      return
    }

    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      // Ultimo step - completa onboarding
      await completeOnboardingFromWizard()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const completeOnboardingFromWizard = async () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🟣 [OnboardingWizard] completeOnboardingFromWizard CHIAMATO')
    console.log('📍 Sorgente: Pulsante "Avanti" ultimo step wizard')
    console.log('📊 CompanyId attuale:', companyId || 'NULL')
    console.log('📦 FormData presente:', !!formData)
    console.log('⏰ Timestamp:', new Date().toISOString())
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    setIsCompleting(true)
    setIsLoading(true)

    try {
      let finalCompanyId = companyId

      // Se companyId è NULL, crea la company durante onboarding
      if (!finalCompanyId) {
        console.log('🔧 Company ID NULL - creando company durante onboarding')
        // La company verrà creata in completeOnboardingHelper
        finalCompanyId = null // Passerà null e verrà creata
      }

      console.log('🚀 Chiamando completeOnboardingHelper con finalCompanyId:', finalCompanyId)

      // Usa la funzione helper unificata passando i dati correnti
      // Ora ritorna il companyId invece di fare reload
      const resultCompanyId = await completeOnboardingHelper(finalCompanyId, formData)

      console.log('✅ Onboarding completato, companyId ricevuto:', resultCompanyId)
      console.log('🔄 Invalidazione cache React Query...')

      // Invalida TUTTE le query per ricaricare i dati
      await queryClient.invalidateQueries()

      console.log('✅ Cache invalidata')
      console.log('🚀 Navigazione a /dashboard...')

      // Naviga a dashboard con React Router (NO RELOAD!)
      navigate('/dashboard', { replace: true })

      console.log('✅ Navigazione completata - dovresti vedere i dati ora!')

    } catch (error) {
      console.error('❌ Error completing onboarding:', error)
      console.error('❌ Error type:', typeof error)
      console.error('❌ Error message:', error instanceof Error ? error.message : 'No message')
      console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack')
      console.error('❌ Full error object:', JSON.stringify(error, null, 2))
      
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto durante il completamento dell\'onboarding'
      toast.error(`Errore: ${errorMessage}`)
      setIsCompleting(false)
      setIsLoading(false)
    }
  }


  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <BusinessInfoStep
            data={formData.business}
            onUpdate={data => updateFormData('business', data)}
            onValidChange={handleValidChange}
          />
        )
      case 1:
        return (
          <DepartmentsStep
            data={formData.departments}
            onUpdate={data => updateFormData('departments', data)}
            onValidChange={handleValidChange}
          />
        )
      case 2:
        return (
          <StaffStep
            data={formData.staff}
            departments={formData.departments || []}
            onUpdate={updateFormDataStaff}
            onValidChange={handleValidChange}
          />
        )
      case 3:
        return (
          <ConservationStep
            data={formData.conservation}
            departments={formData.departments || []}
            onUpdate={updateFormDataConservation}
            onValidChange={handleValidChange}
          />
        )
      case 4:
        return (
          <TasksStep
            data={formData.tasks}
            departments={formData.departments || []}
            conservationPoints={formData.conservation?.points || []}
            staff={formData.staff || []}
            onUpdate={updateFormDataTasks}
            onValidChange={handleValidChange}
          />
        )
      case 5:
        return (
          <InventoryStep
            data={formData.inventory}
            departments={formData.departments || []}
            conservationPoints={formData.conservation?.points || []}
            onUpdate={data => updateFormData('inventory', data)}
            onValidChange={handleValidChange}
          />
        )
      case 6:
        return (
          <CalendarConfigStep
            data={formData.calendar}
            onUpdate={data => updateFormData('calendar', data)}
            onValidChange={handleValidChange}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="onboarding-wizard">
      <div className="max-w-4xl mx-auto py-6 px-4 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6 space-y-3 sm:mb-8">
          <div className="flex justify-between items-start">
            <div className="flex-1"></div>
            <div className="flex-1 text-center">
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Configurazione Iniziale HACCP
              </h1>
              <p className="text-sm text-gray-600 sm:text-base">
                Configura la tua azienda per iniziare a utilizzare il sistema HACCP
              </p>
            </div>
            <div className="flex-1 flex justify-end">
              <button
                type="button"
                onClick={handleSkipOnboarding}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-800 transition-colors"
                title="Salta configurazione"
              >
                <X size={16} />
                <span className="hidden sm:inline">Salta</span>
              </button>
            </div>
          </div>

          {/* Control Buttons for Development and Testing */}
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
            <DevButtons
              onPrefillOnboarding={handlePrefillOnboarding}
              onCompleteOnboarding={handleCompleteOnboarding}
              isDevMode={import.meta.env.DEV}
            />
          </div>
        </div>

        {/* Step Navigator */}
        <StepNavigator
          currentStep={currentStep}
          totalSteps={TOTAL_STEPS}
          onStepClick={setCurrentStep}
        />

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          {renderCurrentStep()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="px-6 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Indietro
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={!isValid || isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isCompleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Completando...
              </>
            ) : currentStep === TOTAL_STEPS - 1 ? (
              'Completa Configurazione'
            ) : (
              'Avanti'
            )}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentStep + 1) / TOTAL_STEPS) * 100}%`,
              }}
            />
          </div>
          <p className="text-center text-sm text-gray-500 mt-2">
            Step {currentStep + 1} di {TOTAL_STEPS}
          </p>
        </div>
      </div>
    </div>
  )
}

export default OnboardingWizard
