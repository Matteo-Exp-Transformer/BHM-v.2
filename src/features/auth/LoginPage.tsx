/**
 * 🔐 LoginPage - Supabase Auth
 * 
 * Pagina di login con Supabase Auth (sostituisce Clerk)
 * 
 * @date 2025-01-09
 */

import React from 'react'
// import { Link } from 'react-router-dom'
import { LoginForm } from './components/LoginForm'

const LoginPage: React.FC = () => {
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
            Accedi al Sistema
          </h2>

          <p className="text-sm text-gray-600 leading-relaxed">
            Gestisci la sicurezza alimentare del tuo ristorante con strumenti
            professionali e intuitivi
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white shadow-2xl rounded-2xl p-8">
          <LoginForm
            onSuccess={() => {
              // Redirect a pagina intermedia che aspetta il completamento di useAuth
              // prima di decidere dove andare (dashboard/onboarding/sign-in).
              // Questo elimina la race condition tra getSession() e ProtectedRoute.
              window.location.replace('/auth/callback?post_login=true')
            }}
            onError={(error) => console.error('Login error:', error)}
          />
        </div>
      </div>
    </div>
  )
}

export default LoginPage
