import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ClerkProvider } from '@clerk/clerk-react'
import { initSentry } from './lib/sentry'
import App from './App.tsx'
import './styles/index.css'

// Debug logs removed for cleaner console

// Test Supabase connection in development
if (import.meta.env.DEV) {
  import('./lib/supabase/test-connection')
}

// Initialize Sentry
initSentry()

// Register Service Worker for offline functionality
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      })

      console.log('SW registered: ', registration)

      // Listen for SW updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              // New content is available
              console.log('New content available; please refresh.')
              // You can show a notification to the user here
            }
          })
        }
      })
    } catch (error) {
      console.log('SW registration failed: ', error)
    }
  })
}

// Import your publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key')
}

// Create a client with optimized cache settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes - garbage collect after 10 minutes
      retry: 2, // Reduced retries for better performance
      refetchOnWindowFocus: false, // Prevent unnecessary refetches
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1, // Less aggressive retries for mutations
    },
  },
  // Configure garbage collection
  gcTime: 10 * 60 * 1000, // 10 minutes for garbage collection
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
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
    >
      <QueryClientProvider client={queryClient}>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </ClerkProvider>
  </React.StrictMode>
)
