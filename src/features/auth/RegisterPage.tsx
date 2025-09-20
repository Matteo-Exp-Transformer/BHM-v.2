import React from 'react'
import { SignUp } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'

const RegisterPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8">
        <div className="text-center">
          {/* Logo grande e centrato */}
          <div className="mx-auto mb-6 flex justify-center">
            <img
              src="/dist/assets/logo_ottimizzato.png"
              alt="Business HACCP Manager Logo"
              className="h-32 w-auto max-w-full rounded-xl shadow-xl"
            />
          </div>

          {/* Sottotitolo elegante */}
          <h2
            className="text-2xl font-semibold text-gray-700 mb-2"
            style={{
              fontFamily: 'Playfair Display, serif',
              fontStyle: 'italic',
              letterSpacing: '0.01em',
            }}
          >
            Gestione Professionale
          </h2>

          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Registrati al Sistema
          </h2>

          <p className="text-sm text-gray-600 leading-relaxed">
            Inizia a gestire la sicurezza alimentare del tuo ristorante con
            strumenti professionali
          </p>
        </div>

        <div className="mt-8">
          <SignUp
            appearance={{
              elements: {
                formButtonPrimary:
                  'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl',
                card: 'shadow-2xl border-0 rounded-2xl',
                headerTitle: 'text-gray-800 font-semibold',
                headerSubtitle: 'text-gray-600',
                socialButtonsBlockButton:
                  'border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200',
                formFieldInput:
                  'border-gray-200 focus:border-green-500 focus:ring-green-500 rounded-lg',
                footerActionLink:
                  'text-green-600 hover:text-green-700 font-medium',
              },
            }}
            afterSignInUrl="/"
            afterSignUpUrl="/"
          />
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-green-600 text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2"
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
