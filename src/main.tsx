import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './styles/index.css'

// Test Supabase connection in development
if (import.meta.env.DEV) {
  import('./lib/supabase/test-connection')
}

// Initialize Sentry only in production
if (import.meta.env.PROD) {
  const { initSentry } = await import('./lib/sentry')
  initSentry()
} else {
  console.log('🔧 Sentry disabled in development mode')
}

// Verifica configurazione Supabase
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase configuration. Check .env file.')
}

// Create a client with optimized cache settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes - garbage collect after 10 minutes
      retry: 2, // Reduced retries for better performance
      refetchOnWindowFocus: false, // Prevent unnecessary refetches
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1, // Less aggressive retries for mutations
    },
  },
})

// Esponi queryClient globalmente per resetApp() e altri utilities
declare global {
  interface Window {
    queryClient: QueryClient
  }
}
window.queryClient = queryClient

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
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
  </React.StrictMode>
)
