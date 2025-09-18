import { SignIn } from '@clerk/clerk-react'

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">H</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          HACCP Business Manager
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Accedi per gestire la sicurezza alimentare
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <SignIn
            path="/login"
            routing="path"
            signUpUrl="/register"
            redirectUrl="/"
            appearance={{
              elements: {
                formButtonPrimary: 'btn-primary',
                card: 'shadow-none border-none',
                headerTitle: 'text-xl font-semibold text-gray-900',
                headerSubtitle: 'text-sm text-gray-600',
                socialButtonsBlockButton:
                  'border border-gray-300 hover:bg-gray-50',
                formFieldInput: 'input-field',
                footerActionLink: 'text-primary-600 hover:text-primary-500',
              },
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default LoginPage
