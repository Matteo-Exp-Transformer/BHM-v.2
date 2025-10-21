/**
 * 🔐 RecoveryConfirmForm - Componente Form Conferma Recovery
 * 
 * Nuovo componente form per confermare reset password con
 * validazione Zod, CSRF protection e accessibility AA
 * 
 * @date 2025-10-20
 * @author Agente 3 - Experience Designer
 */

import React, { useState, useCallback, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { 
  recoveryConfirmSchema, 
  type RecoveryConfirmData,
  validateForm,
  getFieldError,
  hasFieldError
} from '../schemas/authSchemas'
import { authClient, getErrorMessage, isAuthError } from '../api/authClient'
import { useCsrfToken } from '@/hooks/useCsrfToken'

interface RecoveryConfirmFormProps {
  onSuccess?: () => void
  onError?: (error: string) => void
  className?: string
}

export const RecoveryConfirmForm: React.FC<RecoveryConfirmFormProps> = ({
  onSuccess,
  onError,
  className = ''
}) => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  // Hook per CSRF token
  const { token: csrfToken, error: csrfError, isLoading: csrfLoading } = useCsrfToken()
  
  // Form state
  const [formData, setFormData] = useState({
    token: '',
    password: '',
    confirmPassword: '',
    csrf_token: ''
  } as RecoveryConfirmData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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
  // INITIALIZE TOKEN FROM URL
  // =============================================

  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      setFormData(prev => ({ ...prev, token }))
    } else {
      setErrors({ general: 'Token di reset mancante. Verifica il link ricevuto via email.' })
    }
  }, [searchParams])

  // =============================================
  // FORM HANDLERS
  // =============================================

  const handleInputChange = useCallback((field: keyof RecoveryConfirmData, value: string) => {
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
    
    // Verifica CSRF token
    if (!csrfToken) {
      toast.error('Token di sicurezza non disponibile. Ricarica la pagina')
      return
    }
    
    // Validate form
    const validation = validateForm(recoveryConfirmSchema, formData)
    if (!validation.success) {
      setErrors(validation.errors || {})
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      const response = await authClient.confirmRecovery(formData)
      
      if (response.success) {
        toast.success('Password resettata con successo!')
        onSuccess?.()
        navigate('/dashboard')
      } else {
        const errorMessage = response.error?.message || 'Errore durante il reset della password'
        
        setErrors({ general: errorMessage })
        onError?.(errorMessage)
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error('Recovery confirm error:', error)
      const errorMessage = isAuthError(error) 
        ? getErrorMessage(error.code)
        : 'Errore di connessione. Riprova'
      
      setErrors({ general: errorMessage })
      onError?.(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, navigate, onSuccess, onError, csrfToken])

  // =============================================
  // RENDER
  // =============================================

  return (
    <form 
      onSubmit={handleSubmit}
      className={`space-y-6 ${className}`}
      noValidate
      aria-label="Form conferma reset password"
    >
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

      {/* Password Policy Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">
          Requisiti Password
        </h3>
        <ul className="text-xs text-blue-600 space-y-1">
          <li>• Almeno 12 caratteri</li>
          <li>• Solo lettere (maiuscole e minuscole)</li>
          <li>• Non può contenere la tua email</li>
        </ul>
      </div>

      {/* Password Field */}
      <div>
        <label 
          htmlFor="recovery-password"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Nuova Password *
        </label>
        <div className="relative">
          <input
            id="recovery-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all pr-12 ${
              hasFieldError(errors, 'password') 
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-200'
            }`}
            placeholder="Inserisci nuova password"
            aria-invalid={hasFieldError(errors, 'password')}
            aria-describedby={hasFieldError(errors, 'password') ? 'recovery-password-error' : undefined}
            data-testid="recovery-password-input"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            aria-label={showPassword ? 'Nascondi password' : 'Mostra password'}
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
            id="recovery-password-error"
            className="mt-2 text-sm text-red-600"
            role="alert"
          >
            {getFieldError(errors, 'password')}
          </p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div>
        <label 
          htmlFor="recovery-confirm-password"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Conferma Password *
        </label>
        <div className="relative">
          <input
            id="recovery-confirm-password"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all pr-12 ${
              hasFieldError(errors, 'confirmPassword') 
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-200'
            }`}
            placeholder="Conferma nuova password"
            aria-invalid={hasFieldError(errors, 'confirmPassword')}
            aria-describedby={hasFieldError(errors, 'confirmPassword') ? 'recovery-confirm-password-error' : undefined}
            data-testid="recovery-confirm-password-input"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            aria-label={showConfirmPassword ? 'Nascondi conferma password' : 'Mostra conferma password'}
          >
            {showConfirmPassword ? (
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
        {hasFieldError(errors, 'confirmPassword') && (
          <p 
            id="recovery-confirm-password-error"
            className="mt-2 text-sm text-red-600"
            role="alert"
          >
            {getFieldError(errors, 'confirmPassword')}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || !csrfToken || csrfLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        data-testid="recovery-confirm-button"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" data-testid="loading-spinner-button">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Reset in corso...
          </span>
        ) : csrfLoading ? (
          'Caricamento...'
        ) : (
          'Conferma Reset Password'
        )}
      </button>
    </form>
  )
}

export default RecoveryConfirmForm
