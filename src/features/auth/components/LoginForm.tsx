/**
 * 🔐 LoginForm - Componente Form Login
 * 
 * Nuovo componente form per login con validazione Zod,
 * CSRF protection, rate limiting feedback e accessibility AA
 * 
 * @date 2025-10-20
 * @author Agente 3 - Experience Designer
 */

import React, { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { 
  loginFormSchema, 
  type LoginFormData,
  validateForm,
  getFieldError,
  hasFieldError
} from '../schemas/authSchemas'
import { authClient, getErrorMessage, isAuthError } from '../api/authClient'
import { useCsrfToken } from '@/hooks/useCsrfToken'
import { useLoginRateLimit } from '@/hooks/useRateLimit'

interface LoginFormProps {
  onSuccess?: () => void
  onError?: (error: string) => void
  className?: string
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onError,
  className = ''
}) => {
  const navigate = useNavigate()
  
  // Hook per CSRF token e rate limiting
  const { token: csrfToken, error: csrfError, isLoading: csrfLoading } = useCsrfToken()
  const { 
    canMakeRequest, 
    secondsUntilReset, 
    isRateLimited, 
    recordRequest 
  } = useLoginRateLimit()
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
    csrf_token: ''
  } as LoginFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

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

  const handleInputChange = useCallback((field: keyof LoginFormData, value: string | boolean) => {
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
    const validation = validateForm(loginFormSchema, formData)
    if (!validation.success) {
      setErrors(validation.errors || {})
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      // Registra la richiesta per rate limiting
      recordRequest()
      
      const csrfResponse = await authClient.getCsrfToken()
      const csrfToken = csrfResponse.success ? csrfResponse.data?.csrf_token || '' : ''
      
      const response = await authClient.login({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
        csrf_token: csrfToken
      })
      
      if (response.success) {
        toast.success('Login effettuato con successo!')
        onSuccess?.()
        navigate('/dashboard')
      } else {
        const errorMessage = response.error?.message || 'Errore durante il login'
        
        // Handle rate limiting
        if (response.error?.code === 'RATE_LIMITED') {
          toast.error(`Troppi tentativi. Riprova tra ${secondsUntilReset} secondi`)
        }
        
        setErrors({ general: errorMessage })
        onError?.(errorMessage)
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error('Login error:', error)
      const errorMessage = isAuthError(error) 
        ? getErrorMessage(error.code)
        : 'Errore di connessione. Riprova'
      
      setErrors({ general: errorMessage })
      onError?.(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, navigate, onSuccess, onError, canMakeRequest, csrfToken, secondsUntilReset, recordRequest])

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
        data-testid="rate-limit-banner-login"
      >
        <div className="flex items-center">
          <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-orange-800">
              Troppi tentativi di accesso
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
  // RENDER
  // =============================================

  return (
    <form 
      onSubmit={handleSubmit}
      className={`space-y-6 ${className}`}
      noValidate
      aria-label="Form di accesso"
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
          htmlFor="login-email"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Email *
        </label>
        <input
          id="login-email"
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
          aria-describedby={hasFieldError(errors, 'email') ? 'login-email-error' : undefined}
          data-testid="login-email-input"
        />
        {hasFieldError(errors, 'email') && (
          <p 
            id="login-email-error"
            className="mt-2 text-sm text-red-600"
            role="alert"
          >
            {getFieldError(errors, 'email')}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label 
          htmlFor="login-password"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Password *
        </label>
        <div className="relative">
          <input
            id="login-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all pr-12 ${
              hasFieldError(errors, 'password') 
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-200'
            }`}
            placeholder="••••••••"
            aria-invalid={hasFieldError(errors, 'password')}
            aria-describedby={hasFieldError(errors, 'password') ? 'login-password-error' : undefined}
            data-testid="login-password-input"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            aria-label={showPassword ? 'Nascondi password' : 'Mostra password'}
            aria-pressed={showPassword}
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        {hasFieldError(errors, 'password') && (
          <p 
            id="login-password-error"
            className="mt-2 text-sm text-red-600"
            role="alert"
          >
            {getFieldError(errors, 'password')}
          </p>
        )}
      </div>

      {/* Remember Me Checkbox */}
      <div className="flex items-center">
        <input
          id="login-remember"
          name="rememberMe"
          type="checkbox"
          checked={formData.rememberMe}
          onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          disabled={true} // Remember me OFF per v1
        />
        <label 
          htmlFor="login-remember"
          className="ml-2 text-sm text-gray-600"
        >
          Ricordami (disponibile in versione futura)
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || !canMakeRequest || !csrfToken || csrfLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        data-testid="login-button"
        aria-describedby={!canMakeRequest ? 'rate-limit-warning' : undefined}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" data-testid="loading-spinner-button">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Accesso in corso...
          </span>
        ) : csrfLoading ? (
          'Caricamento...'
        ) : (
          'Accedi'
        )}
      </button>
    </form>
  )
}

export default LoginForm
