import React from 'react'
import { SignUp } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'

const RegisterPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Registrati al HACCP Manager
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Inizia a gestire la sicurezza alimentare del tuo ristorante
          </p>
        </div>

        <div className="mt-8">
          <SignUp
            appearance={{
              elements: {
                formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
                card: 'shadow-lg',
              },
            }}
            afterSignInUrl="/"
            afterSignUpUrl="/"
          />
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-500 text-sm"
          >
            ← Torna alla home
          </button>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
