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
  prefillOnboarding: vi.fn(),
  completeOnboardingHelper: vi.fn().mockResolvedValue('company-123'),
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

describe('Onboarding Step 1 - DepartmentsStep', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    
    // Reset mocks
    vi.clearAllMocks()
    
    // Mock auth state - no company (onboarding needed)
    mockUseAuth.mockReturnValue({
      companyId: null,
      user: { id: 'test-user-id', email: 'test@test.com' }
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

  it('completes step 1 successfully with business data from step 0', async () => {
    console.log('🎯 Test: Onboarding Step 1 - DepartmentsStep')
    
    renderOnboardingWizard()
    
    // Prima completa Step 0 (BusinessInfoStep)
    console.log('📝 Completando Step 0...')
    
    // Verifica che siamo nello step 0 (BusinessInfoStep)
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /informazioni aziendali/i, level: 2 })).toBeInTheDocument()
    })
    
    // Compila i campi obbligatori del BusinessInfoStep
    const companyNameInput = screen.getByPlaceholderText(/inserisci il nome della tua azienda/i)
    const addressInput = screen.getByPlaceholderText(/inserisci l'indirizzo completo dell'azienda/i)
    
    fireEvent.change(companyNameInput, { target: { value: 'Test Azienda SRL' } })
    fireEvent.change(addressInput, { target: { value: 'Via Roma 123, 00100 Roma' } })
    
    // Attendi che la validazione si completi e il pulsante Avanti sia abilitato
    await waitFor(() => {
      const nextButton = screen.getByRole('button', { name: /avanti/i })
      expect(nextButton).toBeEnabled()
    }, { timeout: 3000 })
    
    // Passa a Step 1
    const nextButtonStep0 = screen.getByRole('button', { name: /avanti/i })
    fireEvent.click(nextButtonStep0)
    
    console.log('✅ Step 0 completato, passando a Step 1')
    
    // Verifica che siamo nello step 1 (DepartmentsStep)
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /configurazione reparti/i, level: 2 })).toBeInTheDocument()
    }, { timeout: 3000 })
    
    console.log('✅ Step 1 (DepartmentsStep) renderizzato correttamente')
    
    // Aggiungi un reparto
    const nameInput = screen.getByPlaceholderText(/es. cucina, sala, bancone/i)
    const descriptionInput = screen.getByPlaceholderText(/descrizione del reparto/i)
    
    fireEvent.change(nameInput, { target: { value: 'Cucina' } })
    fireEvent.change(descriptionInput, { target: { value: 'Area preparazione cibi' } })
    
    // Clicca il pulsante per aggiungere il reparto
    const addButton = screen.getByRole('button', { name: /aggiungi/i })
    fireEvent.click(addButton)
    
    console.log('📝 Reparto aggiunto')
    
    // Verifica che il reparto sia stato aggiunto alla lista
    await waitFor(() => {
      expect(screen.getByText('Cucina')).toBeInTheDocument()
      expect(screen.getByText('Area preparazione cibi')).toBeInTheDocument()
    })
    
    console.log('✅ Reparto visualizzato nella lista')
    
    // Verifica che il pulsante Avanti sia abilitato
    await waitFor(() => {
      const nextButton = screen.getByRole('button', { name: /avanti/i })
      expect(nextButton).toBeEnabled()
    }, { timeout: 3000 })
    
    console.log('✅ Form validato correttamente')
    
    // Simula click su "Avanti"
    const nextButtonStep1 = screen.getByRole('button', { name: /avanti/i })
    fireEvent.click(nextButtonStep1)
    
    console.log('➡️ Click su Avanti eseguito')
    
    // Verifica che il wizard passi a currentStep = 2 (StaffStep)
    await waitFor(() => {
      expect(screen.getByText(/gestione del personale/i)).toBeInTheDocument()
    }, { timeout: 3000 })
    
    console.log('✅ Transizione a Step 2 completata con successo')
    console.log('✅ Step 1 completato con successo - reparto aggiunto e validato')
  })

  it('validates department name requirements', async () => {
    console.log('🎯 Test: Validazione nome reparto Step 1')
    
    renderOnboardingWizard()
    
    // Completa Step 0 rapidamente
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /informazioni aziendali/i, level: 2 })).toBeInTheDocument()
    })
    
    const companyNameInput = screen.getByPlaceholderText(/inserisci il nome della tua azienda/i)
    const addressInput = screen.getByPlaceholderText(/inserisci l'indirizzo completo dell'azienda/i)
    
    fireEvent.change(companyNameInput, { target: { value: 'Test Azienda SRL' } })
    fireEvent.change(addressInput, { target: { value: 'Via Roma 123, 00100 Roma' } })
    
    await waitFor(() => {
      const nextButton = screen.getByRole('button', { name: /avanti/i })
      expect(nextButton).toBeEnabled()
    }, { timeout: 3000 })
    
    const nextButton = screen.getByRole('button', { name: /avanti/i })
    fireEvent.click(nextButton)
    
    // Arriva a Step 1
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /configurazione reparti/i, level: 2 })).toBeInTheDocument()
    }, { timeout: 3000 })
    
    // Prova ad aggiungere un reparto con nome vuoto
    const addButton = screen.getByRole('button', { name: /aggiungi/i })
    fireEvent.click(addButton)
    
    // Verifica che appaia l'errore
    await waitFor(() => {
      expect(screen.getByText(/il nome del reparto è obbligatorio/i)).toBeInTheDocument()
    })
    
    console.log('✅ Validazione nome vuoto funziona')
    
    // Prova con nome troppo corto
    const nameInput = screen.getByPlaceholderText(/es. cucina, sala, bancone/i)
    fireEvent.change(nameInput, { target: { value: 'A' } })
    
    fireEvent.click(addButton)
    
    // Verifica che appaia l'errore per nome troppo corto
    await waitFor(() => {
      expect(screen.getByText(/il nome deve essere di almeno 2 caratteri/i)).toBeInTheDocument()
    })
    
    console.log('✅ Validazione nome troppo corto funziona')
    
    // Prova con nome valido
    fireEvent.change(nameInput, { target: { value: 'Cucina' } })
    
    fireEvent.click(addButton)
    
    // Verifica che il reparto sia aggiunto senza errori
    await waitFor(() => {
      expect(screen.getByText('Cucina')).toBeInTheDocument()
      expect(screen.queryByText(/è obbligatorio/i)).not.toBeInTheDocument()
    })
    
    console.log('✅ Validazione nome reparto funziona correttamente')
  })

  it('handles prefill button correctly', async () => {
    console.log('🎯 Test: Pulsante prefill Step 1')
    
    renderOnboardingWizard()
    
    // Completa Step 0 rapidamente
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /informazioni aziendali/i, level: 2 })).toBeInTheDocument()
    })
    
    const companyNameInput = screen.getByPlaceholderText(/inserisci il nome della tua azienda/i)
    const addressInput = screen.getByPlaceholderText(/inserisci l'indirizzo completo dell'azienda/i)
    
    fireEvent.change(companyNameInput, { target: { value: 'Test Azienda SRL' } })
    fireEvent.change(addressInput, { target: { value: 'Via Roma 123, 00100 Roma' } })
    
    await waitFor(() => {
      const nextButton = screen.getByRole('button', { name: /avanti/i })
      expect(nextButton).toBeEnabled()
    }, { timeout: 3000 })
    
    const nextButton = screen.getByRole('button', { name: /avanti/i })
    fireEvent.click(nextButton)
    
    // Arriva a Step 1
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /configurazione reparti/i, level: 2 })).toBeInTheDocument()
    }, { timeout: 3000 })
    
    // Clicca il pulsante prefill
    const prefillButton = screen.getByRole('button', { name: /🚀.*carica reparti predefiniti/i })
    fireEvent.click(prefillButton)
    
    console.log('✅ Pulsante prefill cliccato')
    
    // Verifica che i reparti predefiniti siano stati caricati
    await waitFor(() => {
      expect(screen.getByText('Cucina')).toBeInTheDocument()
      expect(screen.getByText('Bancone')).toBeInTheDocument()
      expect(screen.getByText('Sala')).toBeInTheDocument()
      expect(screen.getByText('Magazzino')).toBeInTheDocument()
    }, { timeout: 3000 })
    
    console.log('✅ Reparti predefiniti caricati correttamente')
    
    // Verifica che il pulsante Avanti sia ora abilitato
    await waitFor(() => {
      const nextButton = screen.getByRole('button', { name: /avanti/i })
      expect(nextButton).toBeEnabled()
    })
    
    console.log('✅ Pulsante prefill funziona correttamente')
  })
})
