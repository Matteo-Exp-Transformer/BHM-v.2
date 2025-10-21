/**
 * 🔐 RecoveryRequestForm - Componente Form Richiesta Recovery
 * 
 * Nuovo componente form per richiedere reset password con
 * validazione Zod, rate limiting feedback e accessibility AA
 * 
 * @date 2025-10-20
 * @author Agente 3 - Experience Designer
 */

import React, { useState, useCallback, useEffect } from 'react'
import { toast } from 'react-toastify'
import { 
  recoveryRequestSchema, 
  type RecoveryRequestData,
  validateForm,
  getFieldError,
  hasFieldError
} from '../schemas/authSchemas'
import { authClient, getErrorMessage, isAuthError } from '../api/authClient'
import { useCsrfToken } from '@/hooks/useCsrfToken'
import { useRecoveryRateLimit } from '@/hooks/useRateLimit'

interface RecoveryRequestFormProps {
  onSuccess?: () => void
  onError?: (error: string) => void
  className?: string
}

export const RecoveryRequestForm: React.FC<RecoveryRequestFormProps> = ({
  onSuccess,
  onError,
  className = ''
}) => {
  // Hook per CSRF token e rate limiting
  const { token: csrfToken, error: csrfError, isLoading: csrfLoading } = useCsrfToken()
  const { 
    canMakeRequest, 
    secondsUntilReset, 
    isRateLimited, 
    recordRequest 
  } = useRecoveryRateLimit()
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    csrf_token: ''
  } as RecoveryRequestData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // =============================================
  // EFFECTS
  // =============================================

  // Aggiorna CSRF token nel form data quando disponibile
  useEffect(() => {
    if (csrfToken) {
      setFormData(prev => ({ ...prev, csrf_token: csrfToken }))
    }
  }, [csrfToken])

  // Gestisce errori CSRF
  useEffect(() => {
    if (csrfError) {
      toast.error('Errore durante il caricamento del token di sicurezza')
      onError?.(csrfError)
    }
  }, [csrfError, onError])

  // =============================================
  // FORM HANDLERS
  // =============================================

  const handleInputChange = useCallback((field: keyof RecoveryRequestData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear field error on change
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }, [errors])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Verifica rate limiting
    if (!canMakeRequest) {
      toast.error(`Troppi tentativi. Riprova tra ${secondsUntilReset} secondi`)
      return
    }

    // Verifica CSRF token
    if (!csrfToken) {
      toast.error('Token di sicurezza non disponibile. Ricarica la pagina')
      return
    }
    
    // Validate form
    const validation = validateForm(recoveryRequestSchema, formData)
    if (!validation.success) {
      setErrors(validation.errors || {})
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      // Registra la richiesta per rate limiting
      recordRequest()
      
      const response = await authClient.requestRecovery(formData)
      
      if (response.success) {
        setIsSuccess(true)
        toast.success('Email inviata! Controlla la tua casella di posta.')
        onSuccess?.()
      } else {
        const errorMessage = response.error?.message || 'Errore durante l\'invio dell\'email'
        
        // Handle rate limiting
        if (response.error?.code === 'RATE_LIMITED') {
          toast.error(`Troppi tentativi. Riprova tra ${secondsUntilReset} secondi`)
        }
        
        setErrors({ general: errorMessage })
        onError?.(errorMessage)
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error('Recovery request error:', error)
      const errorMessage = isAuthError(error) 
        ? getErrorMessage(error.code)
        : 'Errore di connessione. Riprova'
      
      setErrors({ general: errorMessage })
      onError?.(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, onSuccess, onError, canMakeRequest, csrfToken, secondsUntilReset, recordRequest])

  // =============================================
  // SUCCESS STATE
  // =============================================

  if (isSuccess) {
    return (
      <div className={`text-center ${className}`}>
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Email Inviata! ✉️
        </h2>

        <p className="text-gray-600 mb-6">
          Abbiamo inviato le istruzioni per resettare la password a{' '}
          <strong className="text-blue-600">{formData.email}</strong>
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-blue-800">
            📧 <strong>Controlla la tua email</strong>
          </p>
          <p className="text-xs text-blue-600 mt-2">
            Il link per resettare la password è valido per 15 minuti. Se non vedi l'email, controlla la cartella spam.
          </p>
        </div>

        <button
          onClick={() => {
            setIsSuccess(false)
            setFormData({ email: '' })
            setErrors({})
          }}
          className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Invia Nuova Email
        </button>
      </div>
    )
  }

  // =============================================
  // RATE LIMITING UI
  // =============================================

  const renderRateLimitWarning = () => {
    if (!isRateLimited) return null

    return (
      <div 
        className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4"
        role="alert"
        aria-live="polite"
        data-testid="rate-limit-banner-recovery"
      >
        <div className="flex items-center">
          <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-orange-800">
              Troppi tentativi di invio
            </p>
            <p className="text-xs text-orange-600 mt-1">
              Riprova tra <span data-testid="rate-limit-countdown">{secondsUntilReset}</span> secondi
            </p>
          </div>
        </div>
      </div>
    )
  }

  // =============================================
  // RENDER FORM
  // =============================================

  return (
    <form 
      onSubmit={handleSubmit}
      className={`space-y-6 ${className}`}
      noValidate
      aria-label="Form richiesta reset password"
    >
      {/* Rate Limiting Warning */}
      {renderRateLimitWarning()}

      {/* General Error */}
      {errors.general && (
        <div 
          className="bg-red-50 border border-red-200 rounded-lg p-4"
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium text-red-800">
              {errors.general}
            </p>
          </div>
        </div>
      )}

      {/* Email Field */}
      <div>
        <label 
          htmlFor="recovery-email"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Email *
        </label>
        <input
          id="recovery-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
            hasFieldError(errors, 'email') 
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-200'
          }`}
          placeholder="mario@esempio.com"
          aria-invalid={hasFieldError(errors, 'email')}
          aria-describedby={hasFieldError(errors, 'email') ? 'recovery-email-error' : undefined}
          data-testid="recovery-email-input"
        />
        {hasFieldError(errors, 'email') && (
          <p 
            id="recovery-email-error"
            className="mt-2 text-sm text-red-600"
            role="alert"
          >
            {getFieldError(errors, 'email')}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || !canMakeRequest || !csrfToken || csrfLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        data-testid="recovery-button"
        aria-describedby={!canMakeRequest ? 'rate-limit-warning' : undefined}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" data-testid="loading-spinner-button">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Invio in corso...
          </span>
        ) : csrfLoading ? (
          'Caricamento...'
        ) : (
          'Invia Email di Reset'
        )}
      </button>
    </form>
  )
}

export default RecoveryRequestForm
