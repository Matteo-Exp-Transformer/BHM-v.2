import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import OnboardingWizard from '../../../../src/components/OnboardingWizard'

// Mock delle dipendenze
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useAuth: () => ({ companyId: null })
  }
})

vi.mock('../../../src/utils/onboardingHelpers', () => ({
  completeOnboarding: vi.fn()
}))

vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

describe('Onboarding Step 2 - StaffStep', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })
  })

  it('should render Step 2 correctly and allow adding a staff member', async () => {
    const user = userEvent.setup()
    
    // Mock formData consolidato dai passi precedenti
    // const mockFormData = {
      // Step 0 - BusinessInfoStep
      businessName: 'Test Restaurant',
      businessAddress: 'Via Roma 123, Milano',
      businessEmail: 'test@restaurant.it',
      businessPhone: '+39 02 1234567',
      businessVat: 'IT12345678901',
      
      // Step 1 - DepartmentsStep
      departments: [
        { id: '1', name: 'Cucina', description: 'Area cucina' },
        { id: '2', name: 'Sala', description: 'Area sala' }
      ],
      
      // Step 2 - StaffStep (inizialmente vuoto)
      staff: []
    }

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <OnboardingWizard />
        </BrowserRouter>
      </QueryClientProvider>
    )

    // Completa Step 0 e Step 1 per arrivare a Step 2
    // Step 0: Compila informazioni aziendali
    const nameInput = screen.getByPlaceholderText(/nome dell'azienda/i)
    const addressInput = screen.getByPlaceholderText(/indirizzo completo/i)
    const emailInput = screen.getByPlaceholderText(/email aziendale/i)
    const phoneInput = screen.getByPlaceholderText(/telefono aziendale/i)
    const vatInput = screen.getByPlaceholderText(/partita iva/i)

    await user.type(nameInput, 'Test Restaurant')
    await user.type(addressInput, 'Via Roma 123, Milano')
    await user.type(emailInput, 'test@restaurant.it')
    await user.type(phoneInput, '+39 02 1234567')
    await user.type(vatInput, 'IT12345678901')

    // Clicca Avanti per andare a Step 1
    const nextButtonStep0 = screen.getByRole('button', { name: /avanti/i })
    await user.click(nextButtonStep0)

    // Aspetta che Step 1 si carichi
    await waitFor(() => {
      expect(screen.getByText(/gestione reparti/i)).toBeInTheDocument()
    })

    // Step 1: Aggiungi un reparto
    const addDeptButton = screen.getByRole('button', { name: /aggiungi reparto/i })
    await user.click(addDeptButton)

    const deptNameInput = screen.getByPlaceholderText(/nome del reparto/i)
    const deptDescInput = screen.getByPlaceholderText(/descrizione del reparto/i)
    
    await user.type(deptNameInput, 'Cucina')
    await user.type(deptDescInput, 'Area cucina')

    const saveDeptButton = screen.getByRole('button', { name: /salva reparto/i })
    await user.click(saveDeptButton)

    // Clicca Avanti per andare a Step 2
    const nextButtonStep1 = screen.getByRole('button', { name: /avanti/i })
    await user.click(nextButtonStep1)

    // Aspetta che Step 2 si carichi
    await waitFor(() => {
      expect(screen.getByText(/gestione del personale/i)).toBeInTheDocument()
    })

    // VERIFICA RENDERING STEP 2
    expect(screen.getByText(/gestione del personale/i)).toBeInTheDocument()
    expect(screen.getByText(/staff configurato/i)).toBeInTheDocument()
    
    // VERIFICA PULSANTE AGGIUNGI NUOVO MEMBRO
    const addMemberButton = screen.getByRole('button', { name: /aggiungi membro/i })
    expect(addMemberButton).toBeInTheDocument()

    // CLICCA SUL PULSANTE AGGIUNGI NUOVO MEMBRO
    await user.click(addMemberButton)

    // VERIFICA CHE IL FORM SI APRA
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/mario/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/rossi/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/email@azienda\.it/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/\+39 340 1234567/i)).toBeInTheDocument()
    })

    // COMPILA I CAMPI DEL FORM
    const nameInputStaff = screen.getByDisplayValue('Mario') || screen.getByPlaceholderText(/mario/i)
    const surnameInput = screen.getByDisplayValue('Rossi') || screen.getByPlaceholderText(/rossi/i)
    const emailInputStaff = screen.getByDisplayValue('email@azienda.it') || screen.getByPlaceholderText(/email@azienda\.it/i)
    const phoneInputStaff = screen.getByDisplayValue('+39 340 1234567') || screen.getByPlaceholderText(/\+39 340 1234567/i)
    const roleSelect = screen.getByRole('combobox', { name: /ruolo/i })
    const categoriesSelect = screen.getByRole('combobox', { name: /categorie/i })
    const haccpDateInput = screen.getByPlaceholderText(/gg\/mm\/aaaa/i)

    // Compila i campi (se non sono già precompilati)
    if (!nameInputStaff.value) await user.type(nameInputStaff, 'Mario')
    if (!surnameInput.value) await user.type(surnameInput, 'Rossi')
    if (!emailInputStaff.value) await user.type(emailInputStaff, 'mario.rossi@restaurant.it')
    if (!phoneInputStaff.value) await user.type(phoneInputStaff, '+39 340 1234567')

    // Seleziona ruolo dal dropdown (se non è già selezionato)
    await user.click(roleSelect)
    await waitFor(() => {
      expect(screen.getByText(/responsabile/i)).toBeInTheDocument()
    })
    await user.click(screen.getByText(/responsabile/i))

    // Seleziona categoria dal dropdown
    await user.click(categoriesSelect)
    await waitFor(() => {
      expect(screen.getByText(/responsabile/i)).toBeInTheDocument()
    })
    await user.click(screen.getByText(/responsabile/i))

    // Compila data scadenza HACCP
    await user.type(haccpDateInput, '31/12/2025')

    // Seleziona reparti (opzionale)
    const allDepartmentsCheckbox = screen.getByLabelText(/tutti i reparti/i)
    if (allDepartmentsCheckbox) {
      await user.click(allDepartmentsCheckbox)
    }

    // VERIFICA PULSANTE SALVA MODIFICHE
    const saveButton = screen.getByRole('button', { name: /salva modifiche/i })
    expect(saveButton).toBeInTheDocument()

    // CLICCA SALVA MODIFICHE
    await user.click(saveButton)

    // VERIFICA CHE IL MEMBRO SIA STATO AGGIUNTO
    await waitFor(() => {
      expect(screen.getByText(/mario rossi/i)).toBeInTheDocument()
      expect(screen.getByText(/responsabile/i)).toBeInTheDocument()
    })

    // VERIFICA CHE IL PULSANTE AVANTI SIA ABILITATO
    const nextButtonStep2 = screen.getByRole('button', { name: /avanti/i })
    expect(nextButtonStep2).not.toHaveAttribute('disabled')

    // CLICCA AVANTI PER ANDARE AL PROSSIMO STEP
    await user.click(nextButtonStep2)

    // VERIFICA CHE SI PASSI AL PROSSIMO STEP
    await waitFor(() => {
      expect(screen.getByText(/punti di conservazione/i)).toBeInTheDocument()
    })
  })

  it('should validate required fields in Step 2', async () => {
    const user = userEvent.setup()
    
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <OnboardingWizard />
        </BrowserRouter>
      </QueryClientProvider>
    )

    // Completa Step 0 e Step 1 per arrivare a Step 2
    // (codice semplificato per il test di validazione)
    
    // Simula navigazione diretta a Step 2
    // const wizard = screen.getByTestId('onboarding-wizard')
    // Qui dovresti simulare il completamento dei passi precedenti
    
    // VERIFICA VALIDAZIONE CAMPI OBBLIGATORI
    const addMemberButton = screen.getByRole('button', { name: /aggiungi membro/i })
    await user.click(addMemberButton)

    // Prova a salvare senza compilare i campi
    const saveButton = screen.getByRole('button', { name: /aggiungi membro/i })
    await user.click(saveButton)

    // VERIFICA MESSAGGI DI ERRORE
    await waitFor(() => {
      expect(screen.getByText(/nome è richiesto/i)).toBeInTheDocument()
      expect(screen.getByText(/cognome è richiesto/i)).toBeInTheDocument()
    })
  })

  it('should handle prefill functionality in Step 2', async () => {
    const user = userEvent.setup()
    
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <OnboardingWizard />
        </BrowserRouter>
      </QueryClientProvider>
    )

    // Completa Step 0 e Step 1 per arrivare a Step 2
    // (codice semplificato per il test di prefill)
    
    // VERIFICA PULSANTE PRECOMPILA
    const prefillButton = screen.getByRole('button', { name: /🚀.*precompila/i })
    expect(prefillButton).toBeInTheDocument()

    // CLICCA PRECOMPILA
    await user.click(prefillButton)

    // VERIFICA CHE I CAMPI SIANO PRECOMPILATI
    await waitFor(() => {
      expect(screen.getByDisplayValue(/paolo/i)).toBeInTheDocument()
      expect(screen.getByDisplayValue(/dettori/i)).toBeInTheDocument()
    })
  })
})