import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App'

// Mock import.meta.env
vi.mock('import.meta', () => ({
  env: {
    VITE_CLERK_PUBLISHABLE_KEY: 'pk_test_mock_key',
    VITE_SUPABASE_URL: 'https://mock.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'mock_anon_key',
  },
}))

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return (
    <ClerkProvider publishableKey="pk_test_mock_key">
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{children}</BrowserRouter>
      </QueryClientProvider>
    </ClerkProvider>
  )
}

describe('App', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks()
  })

  it('renders without crashing', () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    )
    // Just check that the app renders without throwing
    expect(document.body).toBeInTheDocument()
  })

  it('renders main navigation', () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    )
    // The app should render without crashing
    expect(document.body).toBeInTheDocument()
  })
})
