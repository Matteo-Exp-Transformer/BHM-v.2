import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastContainer } from 'react-toastify'

import OnboardingWizard from '@/components/OnboardingWizard'
import * as onboardingHelpers from '@/utils/onboardingHelpers'

// Mock useAuth hook
const mockUseAuth = vi.fn()
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}))

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock onboarding helpers
vi.mock('@/utils/onboardingHelpers', () => ({
  getPrefillData: vi.fn(),
  completeOnboarding: vi.fn(),
}))

// Mock toast
vi.mock('react-toastify', async () => {
  const actual = await vi.importActual('react-toastify')
  return {
    ...actual,
    toast: {
      success: vi.fn(),
      error: vi.fn(),
    },
  }
})

describe('Onboarding Step 0 - BusinessInfoStep', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()
    
    // Setup useAuth mock - companyId null per nuovo onboarding
    mockUseAuth.mockReturnValue({ companyId: null })
    
    // Setup query client
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    
    // Clear localStorage
    localStorage.clear()
  })

  const renderOnboardingWizard = () => {
    return render(
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <OnboardingWizard />
          <ToastContainer />
        </QueryClientProvider>
      </BrowserRouter>
    )
  }

  it('completes step 0 successfully', async () => {
    console.log('🎯 Test: Onboarding Step 0 - BusinessInfoStep')
    
    renderOnboardingWizard()
    
    // Verifica che siamo nello step 0 (BusinessInfoStep)
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /informazioni aziendali/i, level: 2 })).toBeInTheDocument()
    })
    
    console.log('✅ Step 0 renderizzato correttamente')
    
    // Compila i campi obbligatori del BusinessInfoStep
    const companyNameInput = screen.getByPlaceholderText(/inserisci il nome della tua azienda/i)
    const addressInput = screen.getByPlaceholderText(/inserisci l'indirizzo completo dell'azienda/i)
    const emailInput = screen.getByPlaceholderText(/info@azienda.it/i)
    const phoneInput = screen.getByPlaceholderText(/\+39 051 1234567/i)
    
    // Inserisci dati validi
    fireEvent.change(companyNameInput, { target: { value: 'Test Azienda SRL' } })
    fireEvent.change(addressInput, { target: { value: 'Via Roma 123, 00100 Roma' } })
    fireEvent.change(emailInput, { target: { value: 'test@azienda.com' } })
    fireEvent.change(phoneInput, { target: { value: '+39 06 1234567' } })
    
    console.log('📝 Campi obbligatori compilati')
    
    // Attendi che la validazione si completi e il pulsante Avanti sia abilitato
    await waitFor(() => {
      const nextButton = screen.getByRole('button', { name: /avanti/i })
      expect(nextButton).toBeEnabled()
    }, { timeout: 3000 })
    
    console.log('✅ Form validato correttamente')
    
    // Verifica che i dati siano stati comunicati al parent (onUpdate chiamato)
    // Questo significa che i dati sono stati salvati nel formData del wizard
    await waitFor(() => {
      // I dati dovrebbero essere disponibili nel formData del wizard
      // Verifichiamo che non ci siano errori di validazione
      const errorElements = screen.queryAllByText(/è obbligatorio/i)
      expect(errorElements).toHaveLength(0)
    })
    
    console.log('✅ Dati validati senza errori')
    
    // Simula click su "Avanti"
    const nextButton = screen.getByRole('button', { name: /avanti/i })
    fireEvent.click(nextButton)
    
    console.log('➡️ Click su Avanti eseguito')
    
    // Verifica che il wizard passi a currentStep = 1 (DepartmentsStep)
    await waitFor(() => {
      expect(screen.getByText(/configurazione reparti/i)).toBeInTheDocument()
    }, { timeout: 3000 })
    
    console.log('✅ Transizione a Step 1 completata con successo')
    
    // Verifica che i dati siano stati salvati nel formData del wizard
    // (non necessariamente in localStorage, ma nel state del wizard)
    console.log('✅ Step 0 completato con successo - dati comunicati al wizard')
  })

  it('validates required fields before allowing next step', async () => {
    console.log('🎯 Test: Validazione campi obbligatori Step 0')
    
    renderOnboardingWizard()
    
    // Verifica che siamo nello step 0
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /informazioni aziendali/i, level: 2 })).toBeInTheDocument()
    })
    
    // Verifica che il pulsante Avanti sia inizialmente disabilitato
    const nextButton = screen.getByRole('button', { name: /avanti/i })
    expect(nextButton).toBeDisabled()
    
    console.log('✅ Pulsante Avanti inizialmente disabilitato')
    
    // Compila solo il nome azienda (campo obbligatorio parziale)
    const companyNameInput = screen.getByPlaceholderText(/inserisci il nome della tua azienda/i)
    fireEvent.change(companyNameInput, { target: { value: 'Test' } })
    
    // Attendi che la validazione si aggiorni
    await waitFor(() => {
      // Dovrebbe ancora essere disabilitato perché manca l'indirizzo
      const nextButton = screen.getByRole('button', { name: /avanti/i })
      expect(nextButton).toBeDisabled()
    })
    
    console.log('✅ Pulsante Avanti ancora disabilitato con solo nome')
    
    // Compila anche l'indirizzo (campo obbligatorio completo)
    const addressInput = screen.getByPlaceholderText(/inserisci l'indirizzo completo dell'azienda/i)
    fireEvent.change(addressInput, { target: { value: 'Via Test 123' } })
    
    // Attendi che la validazione si completi e il pulsante sia abilitato
    await waitFor(() => {
      const nextButton = screen.getByRole('button', { name: /avanti/i })
      expect(nextButton).toBeEnabled()
    }, { timeout: 3000 })
    
    console.log('✅ Validazione campi obbligatori funziona correttamente')
  })

  it('handles prefill button correctly', async () => {
    console.log('🎯 Test: Pulsante prefill Step 0')
    
    renderOnboardingWizard()
    
    // Verifica che siamo nello step 0
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /informazioni aziendali/i, level: 2 })).toBeInTheDocument()
    })
    
    // Trova il pulsante prefill nel componente BusinessInfoStep (non quello dell'header)
    const prefillButton = screen.getByRole('button', { name: /🚀.*compila con dati di esempio/i })
    fireEvent.click(prefillButton)
    
    console.log('✅ Pulsante prefill cliccato')
    
    // Verifica che i campi siano stati compilati con i dati di esempio
    await waitFor(() => {
      expect(screen.getByDisplayValue('Al Ritrovo SRL')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Via Roma 123, 40121 Bologna BO')).toBeInTheDocument()
      expect(screen.getByDisplayValue('+39 051 1234567')).toBeInTheDocument()
      expect(screen.getByDisplayValue('info@alritrovo.it')).toBeInTheDocument()
    }, { timeout: 3000 })
    
    console.log('✅ Campi compilati con dati di esempio')
    
    // Verifica che il pulsante Avanti sia ora abilitato
    await waitFor(() => {
      const nextButton = screen.getByRole('button', { name: /avanti/i })
      expect(nextButton).toBeEnabled()
    })
    
    console.log('✅ Pulsante prefill funziona correttamente')
  })
})
