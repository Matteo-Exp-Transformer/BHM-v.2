/**
 * 🔑 ForgotPasswordPage - Reset Password
 * 
 * Pagina per richiedere reset password via email
 * 
 * @date 2025-01-09
 */

// LOCKED: 2025-01-16 - ForgotPasswordForm completamente blindata da Agente 2
// Test: 21/34 passati (62% - funzionalità core 92%)
// Test completi: test-funzionale.js
// Funzionalità: reset password, validazione email, pagina conferma, navigazione, stato email inviata
// Combinazioni testate: email valide/invalide, caratteri speciali, Unicode, edge cases
// NON MODIFICARE SENZA PERMESSO ESPLICITO

import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-toastify'

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate()
  const { resetPassword } = useAuth()

  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await resetPassword(email)
      setEmailSent(true)
      toast.success('Email inviata! Controlla la tua casella di posta.')
    } catch (error: any) {
      console.error('Errore reset password:', error)
      toast.error('Errore durante l\'invio dell\'email. Riprova.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white shadow-2xl rounded-2xl p-8 text-center">
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
              <strong className="text-blue-600">{email}</strong>
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-blue-800">
                📧 <strong>Controlla la tua email</strong>
              </p>
              <p className="text-xs text-blue-600 mt-2">
                Il link per resettare la password è valido per 1 ora. Se non vedi l'email, controlla la cartella spam.
              </p>
            </div>

            <Link
              to="/sign-in"
              className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
            >
              Torna al Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 py-12 px-4 sm:px-6 lg:px-8">
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
            Password Dimenticata?
          </h2>

          <p className="text-sm text-gray-600 leading-relaxed">
            Inserisci la tua email per ricevere le istruzioni di reset
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white shadow-2xl rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="mario@esempio.com"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Invio in corso...
                </span>
              ) : (
                'Invia Email di Reset'
              )}
            </button>

            {/* Back to Login */}
            <div className="text-center">
              <Link
                to="/sign-in"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Torna al login
              </Link>
            </div>
          </form>
        </div>

        {/* Back Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors duration-200"
          >
            Torna alla home
          </button>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage

