import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import OnboardingWizard from '@/components/OnboardingWizard'
import { completeOnboarding as completeOnboardingHelper } from '@/utils/onboardingHelpers'
import { useAuth } from '@/hooks/useAuth'

// Mock delle dipendenze
vi.mock('@/hooks/useAuth')
vi.mock('@/utils/onboardingHelpers')
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock data realistici per ogni step
const mockBusinessData = {
  name: 'Ristorante Test',
  address: 'Via Roma 123, Milano',
  phone: '+39 02 1234567',
  email: 'test@ristorante.com',
  vat_number: 'IT12345678901',
  business_type: 'ristorante',
  established_date: '2020-01-15',
  license_number: 'LIC123456',
}

const mockDepartmentsData = [
  {
    id: 'dept-1',
    name: 'Cucina',
    description: 'Area di preparazione piatti',
    is_active: true,
  },
  {
    id: 'dept-2',
    name: 'Sala',
    description: 'Area di servizio clienti',
    is_active: true,
  },
]

const mockStaffData = [
  {
    id: 'staff-1',
    name: 'Mario',
    surname: 'Rossi',
    fullName: 'Mario Rossi',
    role: 'admin' as const,
    categories: ['Chef'],
    email: 'mario@ristorante.com',
    phone: '+39 333 1234567',
    department_assignments: ['dept-1'],
    haccpExpiry: '2025-12-31',
    notes: 'Responsabile HACCP',
  },
]

const mockConservationData = {
  points: [
    {
      id: 'point-1',
      name: 'Frigo Principale',
      type: 'fridge' as const,
      departmentId: 'dept-1',
      minTemperature: 2,
      maxTemperature: 8,
      categories: ['Carne', 'Pesce'],
      source: 'manual' as const,
    },
  ],
}

const mockTasksData = {
  maintenanceTasks: [
    {
      id: 'task-1',
      title: 'Controllo Temperatura',
      conservationPointId: 'point-1',
      type: 'temperature_calibration' as const,
      frequency: 'weekly' as const,
      assignedTo: 'staff-1',
      notes: 'Controllo settimanale temperatura',
    },
  ],
}

const mockInventoryData = {
  categories: [
    {
      id: 'cat-1',
      name: 'Carne',
      minTemperature: 2,
      maxTemperature: 8,
      storageType: 'fridge' as const,
      allergens: ['none'],
      expiryDays: 3,
      conservationRules: {
        temperature: { min: 2, max: 8 },
        humidity: { min: 60, max: 80 },
      },
    },
  ],
}

const mockCalendarData = {
  fiscalYearStart: '2025-01-01',
  businessDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  businessHours: {
    start: '08:00',
    end: '18:00',
  },
  workingDays: 250,
}

describe('OnboardingWizard full flow', () => {
  let mockNavigate: ReturnType<typeof vi.fn>
  let mockCompleteOnboarding: ReturnType<typeof vi.fn>
  let mockQueryClient: QueryClient

  beforeEach(() => {
    // Reset localStorage
    localStorage.clear()

    // Setup mocks
    mockNavigate = vi.fn()
    mockCompleteOnboarding = vi.fn().mockResolvedValue('company-123')
    
    // Mock useAuth
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user-123', email: 'test@example.com' },
      companyId: null, // Inizia con null per nuovo utente
      isLoading: false,
      signOut: vi.fn(),
    })

    // Mock completeOnboarding
    vi.mocked(completeOnboardingHelper).mockImplementation(mockCompleteOnboarding)

    // Mock navigate
    vi.doMock('react-router-dom', () => ({
      ...vi.importActual('react-router-dom'),
      useNavigate: () => mockNavigate,
    }))

    // Setup QueryClient
    mockQueryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

    // Mock queryClient.invalidateQueries
    mockQueryClient.invalidateQueries = vi.fn().mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('completes full onboarding and redirects to dashboard', async () => {
    // Render component
    render(
      <QueryClientProvider client={mockQueryClient}>
        <BrowserRouter>
          <OnboardingWizard />
        </BrowserRouter>
      </QueryClientProvider>
    )

    // Verifica che siamo al primo step (Business Info)
    expect(screen.getByText('Configurazione Iniziale HACCP')).toBeInTheDocument()

    // Step 1: Business Info
    await waitFor(() => {
      const nameInput = screen.getByLabelText(/nome/i)
      expect(nameInput).toBeInTheDocument()
    })

    // Compila Business Info
    fireEvent.change(screen.getByLabelText(/nome/i), { target: { value: mockBusinessData.name } })
    fireEvent.change(screen.getByLabelText(/indirizzo/i), { target: { value: mockBusinessData.address } })
    fireEvent.change(screen.getByLabelText(/telefono/i), { target: { value: mockBusinessData.phone } })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: mockBusinessData.email } })
    fireEvent.change(screen.getByLabelText(/partita iva/i), { target: { value: mockBusinessData.vat_number } })
    fireEvent.change(screen.getByLabelText(/tipo/i), { target: { value: mockBusinessData.business_type } })
    fireEvent.change(screen.getByLabelText(/data/i), { target: { value: mockBusinessData.established_date } })
    fireEvent.change(screen.getByLabelText(/licenza/i), { target: { value: mockBusinessData.license_number } })

    // Avanti al prossimo step
    fireEvent.click(screen.getByText('Avanti'))

    // Step 2: Departments
    await waitFor(() => {
      expect(screen.getByText(/reparti/i)).toBeInTheDocument()
    })

    // Aggiungi reparti
    fireEvent.change(screen.getByLabelText(/nome reparto/i), { target: { value: mockDepartmentsData[0].name } })
    fireEvent.change(screen.getByLabelText(/descrizione/i), { target: { value: mockDepartmentsData[0].description } })
    fireEvent.click(screen.getByText(/aggiungi/i))

    fireEvent.change(screen.getByLabelText(/nome reparto/i), { target: { value: mockDepartmentsData[1].name } })
    fireEvent.change(screen.getByLabelText(/descrizione/i), { target: { value: mockDepartmentsData[1].description } })
    fireEvent.click(screen.getByText(/aggiungi/i))

    fireEvent.click(screen.getByText('Avanti'))

    // Step 3: Staff
    await waitFor(() => {
      expect(screen.getByText(/personale/i)).toBeInTheDocument()
    })

    // Aggiungi staff
    fireEvent.change(screen.getByLabelText(/nome/i), { target: { value: mockStaffData[0].name } })
    fireEvent.change(screen.getByLabelText(/cognome/i), { target: { value: mockStaffData[0].surname } })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: mockStaffData[0].email } })
    fireEvent.change(screen.getByLabelText(/telefono/i), { target: { value: mockStaffData[0].phone } })
    fireEvent.change(screen.getByLabelText(/ruolo/i), { target: { value: mockStaffData[0].role } })
    fireEvent.change(screen.getByLabelText(/scadenza haccp/i), { target: { value: mockStaffData[0].haccpExpiry } })

    fireEvent.click(screen.getByText(/aggiungi/i))
    fireEvent.click(screen.getByText('Avanti'))

    // Step 4: Conservation Points
    await waitFor(() => {
      expect(screen.getByText(/conservazione/i)).toBeInTheDocument()
    })

    // Aggiungi punto conservazione
    fireEvent.change(screen.getByLabelText(/nome punto/i), { target: { value: mockConservationData.points[0].name } })
    fireEvent.change(screen.getByLabelText(/tipo/i), { target: { value: mockConservationData.points[0].type } })
    fireEvent.change(screen.getByLabelText(/temperatura minima/i), { target: { value: mockConservationData.points[0].minTemperature } })
    fireEvent.change(screen.getByLabelText(/temperatura massima/i), { target: { value: mockConservationData.points[0].maxTemperature } })

    fireEvent.click(screen.getByText(/aggiungi/i))
    fireEvent.click(screen.getByText('Avanti'))

    // Step 5: Tasks
    await waitFor(() => {
      expect(screen.getByText(/attività/i)).toBeInTheDocument()
    })

    // Aggiungi task
    fireEvent.change(screen.getByLabelText(/titolo/i), { target: { value: mockTasksData.maintenanceTasks[0].title } })
    fireEvent.change(screen.getByLabelText(/tipo/i), { target: { value: mockTasksData.maintenanceTasks[0].type } })
    fireEvent.change(screen.getByLabelText(/frequenza/i), { target: { value: mockTasksData.maintenanceTasks[0].frequency } })

    fireEvent.click(screen.getByText(/aggiungi/i))
    fireEvent.click(screen.getByText('Avanti'))

    // Step 6: Inventory
    await waitFor(() => {
      expect(screen.getByText(/inventario/i)).toBeInTheDocument()
    })

    // Aggiungi categoria inventario
    fireEvent.change(screen.getByLabelText(/nome categoria/i), { target: { value: mockInventoryData.categories[0].name } })
    fireEvent.change(screen.getByLabelText(/temperatura minima/i), { target: { value: mockInventoryData.categories[0].minTemperature } })
    fireEvent.change(screen.getByLabelText(/temperatura massima/i), { target: { value: mockInventoryData.categories[0].maxTemperature } })

    fireEvent.click(screen.getByText(/aggiungi/i))
    fireEvent.click(screen.getByText('Avanti'))

    // Step 7: Calendar Config
    await waitFor(() => {
      expect(screen.getByText(/calendario/i)).toBeInTheDocument()
    })

    // Configura calendario
    fireEvent.change(screen.getByLabelText(/inizio anno fiscale/i), { target: { value: mockCalendarData.fiscalYearStart } })
    fireEvent.change(screen.getByLabelText(/ora inizio/i), { target: { value: mockCalendarData.businessHours.start } })
    fireEvent.change(screen.getByLabelText(/ora fine/i), { target: { value: mockCalendarData.businessHours.end } })

    // Completa onboarding (ultimo step)
    fireEvent.click(screen.getByText('Completa Configurazione'))

    // Verifica che completeOnboarding sia stato chiamato
    await waitFor(() => {
      expect(mockCompleteOnboarding).toHaveBeenCalledWith(
        null, // companyId iniziale
        expect.objectContaining({
          business: expect.objectContaining({
            name: mockBusinessData.name,
            address: mockBusinessData.address,
          }),
          departments: expect.arrayContaining([
            expect.objectContaining({
              name: mockDepartmentsData[0].name,
            }),
          ]),
          staff: expect.arrayContaining([
            expect.objectContaining({
              name: mockStaffData[0].name,
              role: mockStaffData[0].role,
            }),
          ]),
          conservation: expect.objectContaining({
            points: expect.arrayContaining([
              expect.objectContaining({
                name: mockConservationData.points[0].name,
              }),
            ]),
          }),
          tasks: expect.objectContaining({
            maintenanceTasks: expect.arrayContaining([
              expect.objectContaining({
                title: mockTasksData.maintenanceTasks[0].title,
              }),
            ]),
          }),
          inventory: expect.objectContaining({
            categories: expect.arrayContaining([
              expect.objectContaining({
                name: mockInventoryData.categories[0].name,
              }),
            ]),
          }),
          calendar: expect.objectContaining({
            fiscalYearStart: mockCalendarData.fiscalYearStart,
          }),
        })
      )
    })

    // Verifica navigazione
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true })

    // Verifica localStorage
    expect(localStorage.getItem('onboarding-completed')).toBe('true')
    expect(localStorage.getItem('onboarding-completed-at')).toBeTruthy()

    // Verifica toast success
    expect(toast.success).toHaveBeenCalled()
  })

  it('handles validation errors correctly', async () => {
    render(
      <QueryClientProvider client={mockQueryClient}>
        <BrowserRouter>
          <OnboardingWizard />
        </BrowserRouter>
      </QueryClientProvider>
    )

    // Prova ad avanzare senza compilare i campi obbligatori
    fireEvent.click(screen.getByText('Avanti'))

    // Verifica che sia mostrato l'errore
    expect(toast.error).toHaveBeenCalledWith('Completa tutti i campi obbligatori prima di continuare')
  })

  it('saves form data to localStorage during progression', async () => {
    render(
      <QueryClientProvider client={mockQueryClient}>
        <BrowserRouter>
          <OnboardingWizard />
        </BrowserRouter>
      </QueryClientProvider>
    )

    // Compila primo step
    fireEvent.change(screen.getByLabelText(/nome/i), { target: { value: mockBusinessData.name } })
    fireEvent.change(screen.getByLabelText(/indirizzo/i), { target: { value: mockBusinessData.address } })
    // ... altri campi

    // Avanza
    fireEvent.click(screen.getByText('Avanti'))

    // Verifica che i dati siano stati salvati in localStorage
    await waitFor(() => {
      const savedData = localStorage.getItem('onboarding-data')
      expect(savedData).toBeTruthy()
      
      const parsedData = JSON.parse(savedData!)
      expect(parsedData.business).toMatchObject({
        name: mockBusinessData.name,
        address: mockBusinessData.address,
      })
    })
  })

  it('loads saved data from localStorage on component mount', async () => {
    // Pre-popola localStorage con dati salvati
    const savedData = {
      business: mockBusinessData,
      departments: mockDepartmentsData,
    }
    localStorage.setItem('onboarding-data', JSON.stringify(savedData))

    render(
      <QueryClientProvider client={mockQueryClient}>
        <BrowserRouter>
          <OnboardingWizard />
        </BrowserRouter>
      </QueryClientProvider>
    )

    // Verifica che i dati siano stati caricati
    await waitFor(() => {
      expect(screen.getByDisplayValue(mockBusinessData.name)).toBeInTheDocument()
      expect(screen.getByDisplayValue(mockBusinessData.address)).toBeInTheDocument()
    })
  })
})



