import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'

// Step Components
import BusinessInfoStep from './onboarding-steps/BusinessInfoStep'
import DepartmentsStep from './onboarding-steps/DepartmentsStep'
import StaffStep from './onboarding-steps/StaffStep'
import ConservationStep from './onboarding-steps/ConservationStep'
import TasksStep from './onboarding-steps/TasksStep'
import InventoryStep from './onboarding-steps/InventoryStep'

// Navigator
import StepNavigator from './StepNavigator'

// Control Components
import DevButtons from './DevButtons'

// Onboarding Helpers
import {
  getPrefillData,
  resetOnboarding,
  completeOnboarding as completeOnboardingHelper,
} from '@/utils/onboardingHelpers'

import type { OnboardingData } from '@/types/onboarding'

const TOTAL_STEPS = 6

const OnboardingWizard = () => {
  const navigate = useNavigate()
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
  const handlePrefillOnboarding = useCallback(() => {
    try {
      const data = getPrefillData()
      setFormData(data as OnboardingData)
      toast.success('Dati precompilati caricati!')
    } catch (error) {
      console.error('Error prefilling onboarding:', error)
      toast.error('Errore durante la precompilazione')
    }
  }, [])

  const handleCompleteOnboarding = useCallback(() => {
    completeOnboardingHelper()
  }, [])

  const handleResetOnboarding = useCallback(() => {
    resetOnboarding()
  }, [])

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

  const handleNext = async () => {
    if (!isValid) {
      toast.error('Completa tutti i campi obbligatori prima di continuare')
      return
    }

    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      // Ultimo step - completa onboarding
      await completeOnboarding()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const completeOnboarding = async () => {
    setIsCompleting(true)
    setIsLoading(true)

    try {
      // Salva tutti i dati su Supabase
      await saveAllDataToSupabase()

      // Marca onboarding come completato
      const { error } = await supabase
        .from('companies')
        .update({
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
        })
        .eq('id', companyId)

      if (error) throw error

      // Pulisci localStorage
      localStorage.removeItem('onboarding-data')

      toast.success('Onboarding completato con successo!')

      // Reindirizza alla dashboard
      navigate('/')
    } catch (error) {
      console.error('Error completing onboarding:', error)
      toast.error("Errore durante il completamento dell'onboarding")
    } finally {
      setIsCompleting(false)
      setIsLoading(false)
    }
  }

  const saveAllDataToSupabase = async () => {
    if (!companyId) throw new Error('Company ID not found')

    // Salva informazioni aziendali
    if (formData.business) {
      const { error } = await supabase
        .from('companies')
        .update({
          ...formData.business,
          updated_at: new Date().toISOString(),
        })
        .eq('id', companyId)

      if (error) throw error
    }

    // Salva reparti
    if (formData.departments?.length) {
      const departments = formData.departments.map(dept => ({
        ...dept,
        company_id: companyId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))

      const { error } = await supabase.from('departments').insert(departments)

      if (error) throw error
    }

    // Salva staff
    if (formData.staff?.length) {
      const staff = formData.staff.map(person => ({
        ...person,
        company_id: companyId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))

      const { error } = await supabase.from('staff').insert(staff)

      if (error) throw error
    }

    // Salva punti conservazione
    if (formData.conservation?.points?.length) {
      const points = formData.conservation.points.map(point => ({
        ...point,
        company_id: companyId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))

      const { error } = await supabase
        .from('conservation_points')
        .insert(points)

      if (error) throw error
    }

    // Salva task
    if (formData.tasks) {
      const maintenanceTasks = formData.tasks.maintenanceTasks.map(task => ({
        ...task,
        company_id: companyId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))

      const generalTasks = formData.tasks.generalTasks.map(task => ({
        ...task,
        company_id: companyId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))

      if (maintenanceTasks.length) {
        const { error } = await supabase
          .from('maintenance_tasks')
          .insert(maintenanceTasks)

        if (error) throw error
      }

      if (generalTasks.length) {
        const { error } = await supabase.from('tasks').insert(generalTasks)

        if (error) throw error
      }
    }

    // Salva inventario
    if (formData.inventory?.products?.length) {
      const products = formData.inventory.products.map(product => ({
        ...product,
        company_id: companyId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))

      const { error } = await supabase.from('products').insert(products)

      if (error) throw error
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
            onUpdate={data => updateFormData('staff', data)}
            onValidChange={handleValidChange}
          />
        )
      case 3:
        return (
          <ConservationStep
            data={formData.conservation}
            departments={formData.departments || []}
            onUpdate={data => updateFormData('conservation', data)}
            onValidChange={handleValidChange}
          />
        )
      case 4:
        return (
          <TasksStep
            data={formData.tasks}
            departments={formData.departments || []}
            conservationPoints={formData.conservation?.points || []}
            onUpdate={data => updateFormData('tasks', data)}
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
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="onboarding-wizard">
      <div className="max-w-4xl mx-auto py-6 px-4 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6 space-y-3 sm:mb-8">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Configurazione Iniziale HACCP
          </h1>
          <p className="text-sm text-gray-600 sm:text-base">
            Configura la tua azienda per iniziare a utilizzare il sistema HACCP
          </p>

          {/* Control Buttons for Development and Testing */}
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
            <DevButtons
              onPrefillOnboarding={handlePrefillOnboarding}
              onResetOnboarding={handleResetOnboarding}
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
