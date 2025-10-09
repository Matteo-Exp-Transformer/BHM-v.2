/**
 * 📩 AcceptInvitePage - Accettazione Invito
 * 
 * Pagina per accettare invito e creare account
 * URL: /accept-invite?token=xxx
 * 
 * @date 2025-01-09
 */

import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useValidateInvite, useAcceptInvite } from '@/hooks/useInvites'
import { toast } from 'react-toastify'

const AcceptInvitePage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const { data: validation, isLoading: isValidating } = useValidateInvite(token)
  const { mutate: acceptInvite, isPending: isAccepting } = useAcceptInvite()

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
  })
  const [showPassword, setShowPassword] = useState(false)

  // Redirect se no token
  useEffect(() => {
    if (!token) {
      toast.error('Token di invito mancante')
      navigate('/sign-in')
    }
  }, [token, navigate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error('Le password non coincidono')
      return
    }

    if (formData.password.length < 8) {
      toast.error('La password deve essere almeno 8 caratteri')
      return
    }

    if (!token) return

    acceptInvite(
      {
        token,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
      },
      {
        onSuccess: () => {
          toast.success('Account creato con successo!')
          setTimeout(() => navigate('/sign-in'), 2000)
        },
      }
    )
  }

  // Loading state
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-600">Verifica invito in corso...</p>
        </div>
      </div>
    )
  }

  // Invalid token
  if (!validation?.isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white shadow-2xl rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Invito Non Valido
            </h2>

            <p className="text-gray-600 mb-6">
              {validation?.error || 'Questo link di invito non è valido o è scaduto.'}
            </p>

            <div className="space-y-3">
              <Link
                to="/sign-in"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
              >
                Vai al Login
              </Link>

              <p className="text-sm text-gray-500">
                Se pensi sia un errore, contatta il tuo amministratore per un nuovo invito.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const invite = validation.invite!

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
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

          <div className="bg-purple-100 border border-purple-300 rounded-lg p-4 mb-4">
            <p className="text-sm font-medium text-purple-800">
              📩 Sei stato invitato come <strong className="uppercase">{invite.role}</strong>
            </p>
            <p className="text-xs text-purple-600 mt-1">
              Email: {invite.email}
            </p>
          </div>

          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Crea il Tuo Account
          </h2>

          <p className="text-sm text-gray-600">
            Completa il form per accettare l'invito
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white shadow-2xl rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nome e Cognome */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome
                </label>
                <input
                  name="first_name"
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  placeholder="Mario"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cognome
                </label>
                <input
                  name="last_name"
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  placeholder="Rossi"
                />
              </div>
            </div>

            {/* Email (readonly) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={invite.email}
                disabled
                className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all pr-12"
                  placeholder="Minimo 8 caratteri"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conferma Password
              </label>
              <input
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                placeholder="Ripeti password"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isAccepting}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAccepting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creazione account...
                </span>
              ) : (
                '✅ Accetta Invito e Crea Account'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AcceptInvitePage

