import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastContainer } from 'react-toastify'

import OnboardingWizard from '@/components/OnboardingWizard'

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

describe('Mapping Step 2 - StaffStep', () => {
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

  it('maps all elements in Step 2', async () => {
    console.log('🎯 Test: Mappatura completa Step 2 - StaffStep')
    
    renderOnboardingWizard()
    
    // Completa Step 0 e 1 rapidamente
    console.log('📝 Completando Step 0...')
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
    
    const nextButtonStep0 = screen.getByRole('button', { name: /avanti/i })
    fireEvent.click(nextButtonStep0)
    
    console.log('📝 Completando Step 1...')
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /configurazione reparti/i, level: 2 })).toBeInTheDocument()
    }, { timeout: 3000 })
    
    const nameInput = screen.getByPlaceholderText(/es. cucina, sala, bancone/i)
    fireEvent.change(nameInput, { target: { value: 'Cucina' } })
    
    const addButton = screen.getByRole('button', { name: /aggiungi/i })
    fireEvent.click(addButton)
    
    await waitFor(() => {
      expect(screen.getByText('Cucina')).toBeInTheDocument()
    })
    
    await waitFor(() => {
      const nextButton = screen.getByRole('button', { name: /avanti/i })
      expect(nextButton).toBeEnabled()
    }, { timeout: 3000 })
    
    const nextButtonStep1 = screen.getByRole('button', { name: /avanti/i })
    fireEvent.click(nextButtonStep1)
    
    // Arriva a Step 2
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /gestione del personale/i, level: 2 })).toBeInTheDocument()
    }, { timeout: 3000 })
    
    console.log('✅ Step 2 (StaffStep) renderizzato correttamente')
    
    // MAPPA TUTTI GLI ELEMENTI DELLO STEP 2
    console.log('\n🔍 MAPPATURA COMPLETA STEP 2:')
    console.log('================================')
    
    // 1. HEADER E TITOLI
    console.log('\n📋 HEADER E TITOLI:')
    const mainHeading = screen.getByRole('heading', { name: /gestione del personale/i, level: 2 })
    console.log('✅ Titolo principale:', mainHeading.textContent)
    
    const description = screen.getByText(/registra ruoli, categorie operative/i)
    console.log('✅ Descrizione:', description.textContent)
    
    // 2. SEZIONI PRINCIPALI
    console.log('\n📋 SEZIONI PRINCIPALI:')
    const staffConfiguredSection = screen.getByText(/staff configurato/i)
    console.log('✅ Sezione Staff configurato:', staffConfiguredSection.textContent)
    
    // 3. PULSANTI PRINCIPALI
    console.log('\n📋 PULSANTI PRINCIPALI:')
    const addMemberButton = screen.getByRole('button', { name: /aggiungi membro/i })
    console.log('✅ Pulsante Aggiungi membro:', addMemberButton.textContent)
    console.log('   - Tipo:', addMemberButton.getAttribute('type'))
    
    // 4. FORM CAMPI
    console.log('\n📋 FORM CAMPI:')
    
    // Nome
    const nameInputStaff = screen.getByPlaceholderText(/mario/i)
    console.log('✅ Campo Nome:', nameInputStaff.getAttribute('placeholder'))
    console.log('   - ID:', nameInputStaff.getAttribute('id'))
    const nameLabels = screen.getAllByLabelText(/nome \*/i)
    console.log('   - Label:', nameLabels[0].textContent)
    
    // Cognome
    const surnameInput = screen.getByPlaceholderText(/rossi/i)
    console.log('✅ Campo Cognome:', surnameInput.getAttribute('placeholder'))
    console.log('   - ID:', surnameInput.getAttribute('id'))
    console.log('   - Label:', screen.getByText(/cognome \*/i).textContent)
    
    // Email
    const emailInput = screen.getByPlaceholderText(/email@azienda\.it/i)
    console.log('✅ Campo Email:', emailInput.getAttribute('placeholder'))
    console.log('   - ID:', emailInput.getAttribute('id'))
    const emailLabels = screen.getAllByText(/email/i)
    console.log('   - Label:', emailLabels[0].textContent)
    console.log('   - ReadOnly:', emailInput.hasAttribute('readonly'))
    console.log('   - Disabled:', emailInput.hasAttribute('disabled'))
    
    // Telefono
    const phoneInput = screen.getByPlaceholderText(/\+39 340 1234567/i)
    console.log('✅ Campo Telefono:', phoneInput.getAttribute('placeholder'))
    console.log('   - ID:', phoneInput.getAttribute('id'))
    const phoneLabels = screen.getAllByText(/telefono/i)
    console.log('   - Label:', phoneLabels[0].textContent)
    
    // 5. DROPDOWN E SELECT
    console.log('\n📋 DROPDOWN E SELECT:')
    
    // Ruolo
    const roleSelect = screen.getByRole('combobox', { name: /ruolo/i })
    console.log('✅ Select Ruolo:', roleSelect.textContent)
    console.log('   - ID:', roleSelect.getAttribute('id'))
    console.log('   - Label:', screen.getByText(/ruolo \*/i).textContent)
    
    // Categorie
    const categoriesSelect = screen.getByRole('combobox', { name: /categorie/i })
    console.log('✅ Select Categorie:', categoriesSelect.textContent)
    console.log('   - ID:', categoriesSelect.getAttribute('id'))
    console.log('   - Label:', screen.getByText(/categorie/i).textContent)
    
    // 6. PULSANTI FORM
    console.log('\n📋 PULSANTI FORM:')
    const submitButton = screen.getByRole('button', { name: /aggiungi membro/i })
    console.log('✅ Pulsante Submit:', submitButton.textContent)
    console.log('   - Tipo:', submitButton.getAttribute('type'))
    
    // 7. PULSANTI NAVIGAZIONE
    console.log('\n📋 PULSANTI NAVIGAZIONE:')
    const nextButton = screen.getByRole('button', { name: /avanti/i })
    console.log('✅ Pulsante Avanti:', nextButton.textContent)
    console.log('   - Disabled:', nextButton.hasAttribute('disabled'))
    
    const backButton = screen.getByRole('button', { name: /indietro/i })
    console.log('✅ Pulsante Indietro:', backButton.textContent)
    console.log('   - Disabled:', backButton.hasAttribute('disabled'))
    
    // 8. PULSANTI HEADER
    console.log('\n📋 PULSANTI HEADER:')
    const prefillButton = screen.getByRole('button', { name: /🚀.*precompila/i })
    console.log('✅ Pulsante Precompila:', prefillButton.textContent)
    
    const completeButton = screen.getByRole('button', { name: /completa onboarding/i })
    console.log('✅ Pulsante Completa Onboarding:', completeButton.textContent)
    
    // 9. MESSAGGI INFORMATIVI
    console.log('\n📋 MESSAGGI INFORMATIVI:')
    const firstMemberMessage = screen.getByText(/👤 primo membro: amministratore/i)
    console.log('✅ Messaggio Primo Membro:', firstMemberMessage.textContent)
    
    const emailLockedMessage = screen.getByText(/🔒 email precompilata/i)
    console.log('✅ Messaggio Email Bloccata:', emailLockedMessage.textContent)
    
    // 10. AREA LISTA STAFF (vuota inizialmente)
    console.log('\n📋 AREA LISTA STAFF:')
    const noMembersMessage = screen.getByText(/nessun membro dello staff registrato/i)
    console.log('✅ Messaggio Nessun Membro:', noMembersMessage.textContent)
    
    console.log('\n✅ MAPPATURA COMPLETA STEP 2 TERMINATA')
    console.log('=====================================')
    
    // Test di interazione con i dropdown
    console.log('\n🧪 TEST INTERAZIONE DROPDOWN:')
    
    // Test dropdown Ruolo
    fireEvent.click(roleSelect)
    await waitFor(() => {
      const roleOptions = screen.getAllByRole('option')
      console.log('✅ Opzioni Ruolo disponibili:')
      roleOptions.forEach((option, index) => {
        console.log(`   ${index + 1}. ${option.textContent}`)
      })
    })
    
    // Chiudi dropdown
    fireEvent.keyDown(roleSelect, { key: 'Escape' })
    
    // Test dropdown Categorie
    fireEvent.click(categoriesSelect)
    await waitFor(() => {
      const categoryOptions = screen.getAllByRole('option')
      console.log('✅ Opzioni Categorie disponibili:')
      categoryOptions.forEach((option, index) => {
        console.log(`   ${index + 1}. ${option.textContent}`)
      })
    })
    
    // Chiudi dropdown
    fireEvent.keyDown(categoriesSelect, { key: 'Escape' })
    
    console.log('\n✅ TEST MAPPATURA COMPLETATO')
  })
})
