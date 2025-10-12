import React from 'react'
import {
  Building2,
  Users,
  Shield,
  Thermometer,
  CheckSquare,
  Package,
  Calendar,
} from 'lucide-react'

interface StepNavigatorProps {
  currentStep: number
  totalSteps: number
  onStepClick: (step: number) => void
}

const stepInfo = [
  {
    id: 0,
    title: 'Informazioni Aziendali',
    description: 'Dati base della tua azienda',
    icon: Building2,
  },
  {
    id: 1,
    title: 'Reparti',
    description: 'Organizzazione aziendale',
    icon: Users,
  },
  {
    id: 2,
    title: 'Personale',
    description: 'Staff e responsabilità',
    icon: Shield,
  },
  {
    id: 3,
    title: 'Conservazione',
    description: 'Punti di controllo temperatura',
    icon: Thermometer,
  },
  {
    id: 4,
    title: 'Attività',
    description: 'Task e manutenzioni',
    icon: CheckSquare,
  },
  {
    id: 5,
    title: 'Inventario',
    description: 'Prodotti e categorie',
    icon: Package,
  },
  {
    id: 6,
    title: 'Calendario',
    description: 'Configurazione anno lavorativo',
    icon: Calendar,
  },
]

const StepNavigator = ({
  currentStep,
  totalSteps,
  onStepClick,
}: StepNavigatorProps) => {
  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStep) return 'completed'
    if (stepIndex === currentStep) return 'current'
    return 'upcoming'
  }

  const getStepStyles = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          container: 'border-green-200 bg-green-50',
          icon: 'bg-green-600 text-white',
          text: 'text-green-900',
          description: 'text-green-600',
        }
      case 'current':
        return {
          container:
            'border-blue-200 bg-blue-50 ring-2 ring-blue-500 ring-opacity-50',
          icon: 'bg-blue-600 text-white',
          text: 'text-blue-900',
          description: 'text-blue-600',
        }
      default:
        return {
          container: 'border-gray-200 bg-gray-50',
          icon: 'bg-gray-300 text-gray-600',
          text: 'text-gray-500',
          description: 'text-gray-400',
        }
    }
  }

  return (
    <div className="mb-8">
      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {stepInfo.map(step => {
            const status = getStepStatus(step.id)
            const styles = getStepStyles(status)
            const IconComponent = step.icon

            return (
              <button
                key={step.id}
                onClick={() => onStepClick(step.id)}
                disabled={step.id > currentStep}
                className={`
                  p-4 rounded-lg border-2 transition-all duration-200 text-left
                  ${styles.container}
                  ${step.id <= currentStep ? 'hover:shadow-md cursor-pointer' : 'cursor-not-allowed'}
                `}
              >
                <div className="flex items-center mb-2">
                  <div
                    className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${styles.icon}
                  `}
                  >
                    {status === 'completed' ? (
                      <span>✓</span>
                    ) : (
                      <IconComponent className="w-4 h-4" />
                    )}
                  </div>
                  <span className={`ml-2 text-xs font-medium ${styles.text}`}>
                    {step.id + 1}
                  </span>
                </div>
                <h3 className={`text-sm font-semibold mb-1 ${styles.text}`}>
                  {step.title}
                </h3>
                <p className={`text-xs ${styles.description}`}>
                  {step.description}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-500">
            Passo {currentStep + 1} di {totalSteps}
          </span>
          <span className="text-sm text-gray-400">
            {Math.round(((currentStep + 1) / totalSteps) * 100)}% completato
          </span>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div
              className={`
              w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
              bg-blue-600 text-white
            `}
            >
              {React.createElement(stepInfo[currentStep].icon, {
                className: 'w-5 h-5',
              })}
            </div>
            <div className="ml-3">
              <h3 className="text-base font-semibold text-gray-900">
                {stepInfo[currentStep].title}
              </h3>
              <p className="text-sm text-gray-500">
                {stepInfo[currentStep].description}
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Progress Dots */}
        <div className="flex justify-center mt-4 space-x-2">
          {Array.from({ length: totalSteps }).map((_, index) => {
            const status = getStepStatus(index)
            return (
              <button
                key={index}
                onClick={() => onStepClick(index)}
                disabled={index > currentStep}
                className={`
                  w-3 h-3 rounded-full transition-all duration-200
                  ${
                    status === 'completed'
                      ? 'bg-green-500'
                      : status === 'current'
                        ? 'bg-blue-500'
                        : 'bg-gray-300'
                  }
                  ${index <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed'}
                `}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default StepNavigator
