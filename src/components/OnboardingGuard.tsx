/**
 * 🛡️ OnboardingGuard - Redirect automatico a Onboarding
 * 
 * Controlla se l'utente autenticato ha una company associata.
 * Se NO → redirect automatico a /onboarding
 * Se SÌ → continua normalmente
 * 
 * @date 2025-01-10
 */

import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Loader2 } from 'lucide-react'

interface OnboardingGuardProps {
  children: React.ReactNode
}

const OnboardingGuard: React.FC<OnboardingGuardProps> = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isLoading, user, companies, isSignedIn } = useAuth()

  // Dipendenze solo primitive (evita "Cannot convert object to primitive value" in dev)
  const pathname = location.pathname
  const userId = user?.id ?? null
  const companiesCount = companies?.length ?? 0

  useEffect(() => {
    // Skip se ancora in loading
    if (isLoading) return

    // Skip se non autenticato (verrà gestito da ProtectedRoute)
    if (!isSignedIn || !user) return

    // Skip se siamo già in onboarding
    if (pathname === '/onboarding') return

    // Se utente autenticato ma SENZA company → redirect a onboarding
    if (companiesCount === 0) {
      console.log('🔄 Utente senza company - redirect a onboarding')
      
      // Check se ha già completato l'onboarding in passato
      const onboardingCompleted = localStorage.getItem('onboarding-completed')
      
      if (onboardingCompleted === 'true') {
        // Utente aveva completato onboarding ma non ha più company
        // Probabilmente è un admin - non forzare onboarding
        console.warn('⚠️ Onboarding già completato ma nessuna company trovata')
        return
      }
      
      navigate('/onboarding', { replace: true })
    }
  }, [isLoading, isSignedIn, userId, companiesCount, pathname, navigate])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600">Caricamento...</p>
      </div>
    )
  }

  // Se utente senza company e NON in onboarding → mostra loader 
  // (il redirect avverrà nell'useEffect)
  if (isSignedIn && companies.length === 0 && location.pathname !== '/onboarding') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600">Reindirizzamento a configurazione iniziale...</p>
      </div>
    )
  }

  return <>{children}</>
}

export default OnboardingGuard

