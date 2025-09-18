import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

// Mock import.meta.env
vi.mock('import.meta', () => ({
  env: {
    VITE_CLERK_PUBLISHABLE_KEY: 'pk_test_mock_key',
    VITE_SUPABASE_URL: 'https://mock.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'mock_anon_key',
  },
}))

describe('App', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks()
  })

  it('renders without crashing', () => {
    render(<App />)
    expect(screen.getByText(/HACCP Business Manager/i)).toBeInTheDocument()
  })

  it('renders main navigation', () => {
    render(<App />)
    // Check for main navigation elements
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })
})
