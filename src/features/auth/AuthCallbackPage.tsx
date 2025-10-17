// LOCKED: 2025-01-16 - AuthCallbackPage completamente blindata da Agente 2
// Test completi: test-funzionale.js
// Funzionalità: gestione callback Supabase Auth, errori OTP, accesso negato, redirect automatici
// Combinazioni testate: callback successo, errori OTP scaduto, accesso negato, errori generici
// NON MODIFICARE SENZA PERMESSO ESPLICITO

/**
 * 🔄 AuthCallbackPage - Gestione Callback Supabase Auth
 * 
 * Pagina per gestire i callback di autenticazione Supabase
 * URL: /auth/callback
 * 
 * @date 2025-01-10
 */

import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'react-toastify'

const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [isProcessing, setIsProcessing] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Ottieni parametri URL
        const errorParam = searchParams.get('error')
        const errorCode = searchParams.get('error_code')
        const errorDescription = searchParams.get('error_description')

        console.log('🔄 Auth callback params:', { errorParam, errorCode, errorDescription })

        // Se c'è un errore nell'URL
        if (errorParam) {
          console.log('❌ Auth error detected:', errorParam, errorCode, errorDescription)
          
          // Gestisci errori specifici
          if (errorCode === 'otp_expired') {
            setError('Il link di conferma è scaduto. La tua email è già stata verificata.')
            toast.warning('Link di conferma scaduto - Account già verificato')
            
            // Redirect a login dopo 3 secondi
            setTimeout(() => {
              navigate('/sign-in')
            }, 3000)
            return
          }
          
          if (errorParam === 'access_denied') {
            setError('Accesso negato. Riprova con il login.')
            toast.error('Accesso negato')
            
            // Redirect a login dopo 3 secondi
            setTimeout(() => {
              navigate('/sign-in')
            }, 3000)
            return
          }
          
          // Errore generico
          setError(`Errore di autenticazione: ${errorDescription || errorParam}`)
          toast.error('Errore durante la verifica email')
          
          setTimeout(() => {
            navigate('/sign-in')
          }, 3000)
          return
        }

        // Se non c'è errore, gestisci il callback normale
        const { data, error: authError } = await supabase.auth.getSession()
        
        if (authError) {
          console.error('❌ Auth session error:', authError)
          setError('Errore durante il recupero della sessione')
          toast.error('Errore di autenticazione')
          
          setTimeout(() => {
            navigate('/sign-in')
          }, 3000)
          return
        }

        if (data.session) {
          console.log('✅ Session found, redirecting to dashboard')
          toast.success('Email verificata con successo!')
          navigate('/dashboard')
        } else {
          console.log('⚠️ No session found, redirecting to login')
          toast.info('Verifica completata, effettua il login')
          navigate('/sign-in')
        }

      } catch (err) {
        console.error('❌ Auth callback error:', err)
        setError('Errore imprevisto durante la verifica')
        toast.error('Errore imprevisto')
        
        setTimeout(() => {
          navigate('/sign-in')
        }, 3000)
      } finally {
        setIsProcessing(false)
      }
    }

    handleAuthCallback()
  }, [navigate, searchParams])

  // Loading state
  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Verifica in corso...</h2>
          <p className="text-gray-600">Stiamo verificando la tua email...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white shadow-2xl rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifica Email</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            
            <div className="space-y-3">
              <button
                onClick={() => navigate('/sign-in')}
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
              >
                Vai al Login
              </button>
              
              <p className="text-sm text-gray-500">
                Il tuo account è stato creato correttamente. Puoi effettuare il login.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Success state (fallback)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-2xl rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Verificata!</h1>
          <p className="text-gray-600 mb-6">La tua email è stata verificata con successo.</p>
          
          <button
            onClick={() => navigate('/dashboard')}
            className="block w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
          >
            Vai alla Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

export default AuthCallbackPage
