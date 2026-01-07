/**
 * 📝 RegisterPage - Supabase Auth
 * 
 * Pagina di registrazione (solo per primo admin durante onboarding)
 * 
 * @date 2025-01-09
 */

import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { csrfService } from '@/services/security/CSRFService'
import { toast } from 'react-toastify'

const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const { signUp, isLoading } = useAuth()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [csrfToken, setCsrfToken] = useState('')

  // Initialize CSRF token on component mount (DECISIONE #1)
  useEffect(() => {
    const token = csrfService.getToken()
    setCsrfToken(token)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // CSRF Protection: Validate token (DECISIONE #1)
    if (!csrfService.validateToken(csrfToken)) {
      toast.error('Token di sicurezza non valido. Ricarica la pagina.')
      setIsSubmitting(false)
      return
    }

    // Validazione password
    if (formData.password !== formData.confirmPassword) {
      toast.error('Le password non coincidono')
      setIsSubmitting(false)
      return
    }

    // Password Policy: 12 caratteri, lettere + numeri (DECISIONE #12)
    if (formData.password.length < 12) {
      toast.error('La password deve essere almeno 12 caratteri')
      setIsSubmitting(false)
      return
    }
    
    // Validazione lettere + numeri
    const hasLetter = /[a-zA-Z]/.test(formData.password)
    const hasNumber = /[0-9]/.test(formData.password)
    
    if (!hasLetter || !hasNumber) {
      toast.error('La password deve contenere almeno una lettera e un numero')
      setIsSubmitting(false)
      return
    }

    try {
      await signUp(formData.email, formData.password, {
        first_name: formData.first_name,
        last_name: formData.last_name,
      })

      toast.success('Registrazione completata! Controlla la tua email per confermare l\'account.')
      
      // Redirect a una pagina di conferma o login
      setTimeout(() => navigate('/sign-in'), 2000)
    } catch (error: any) {
      console.error('Errore registrazione:', error)
      
      if (error.message.includes('already registered')) {
        toast.error('Questa email è già registrata')
      } else if (error.message.includes('weak password')) {
        toast.error('Password troppo debole. Usa almeno 8 caratteri con lettere e numeri.')
      } else {
        toast.error('Errore durante la registrazione. Riprova.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className="text-6xl font-bold text-blue-700 mb-4"
            style={{
              fontFamily: 'Tangerine, cursive',
              fontStyle: 'italic',
              letterSpacing: '0.02em',
            }}
          >
            Business H<span className="lowercase">accp</span> Manager
          </h1>

          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Registrati al Sistema
          </h2>

          <p className="text-sm text-gray-600 leading-relaxed">
            Inizia a gestire la sicurezza alimentare del tuo ristorante
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white shadow-2xl rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nome e Cognome */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="first_name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nome
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  placeholder="Mario"
                />
              </div>
              <div>
                <label
                  htmlFor="last_name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Cognome
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  placeholder="Rossi"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                placeholder="mario@esempio.com"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all pr-12"
                  placeholder="Minimo 12 caratteri"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Almeno 12 caratteri con lettere e numeri
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Conferma Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                placeholder="Ripeti password"
              />
            </div>

            {/* CSRF Token */}
            <input type="hidden" name="csrf_token" value={csrfToken} />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Registrazione in corso...
                </span>
              ) : (
                'Crea Account'
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">oppure</span>
              </div>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Hai già un account?{' '}
                <Link
                  to="/sign-in"
                  className="text-green-600 hover:text-green-700 font-medium transition-colors"
                >
                  Accedi ora
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Back Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-green-600 text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2 mx-auto"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Torna alla home
          </button>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
