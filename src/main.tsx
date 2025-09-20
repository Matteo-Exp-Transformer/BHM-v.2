import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ClerkProvider } from '@clerk/clerk-react'
import { initSentry } from './lib/sentry'
import App from './App.tsx'
import './styles/index.css'

// DEBUG - rimuovi dopo il test
console.log('🔍 Debug env vars:')
console.log('Clerk key exists:', !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY)
console.log(
  'Clerk key length:',
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.length
)
console.log(
  'First 20 chars:',
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.substring(0, 20)
)

// Test Supabase connection in development
if (import.meta.env.DEV) {
  import('./lib/supabase/test-connection')
}

// Initialize Sentry
initSentry()

// Import your publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key')
}

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 3,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: '#3b82f6',
        },
      }}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/"
      afterSignUpUrl="/"
    >
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </ClerkProvider>
  </React.StrictMode>
)
