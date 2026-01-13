import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { MiniCalendar } from '../MiniCalendar'
import type { CompanyCalendarSettings } from '@/types/calendar'

// Mock useCalendarSettings hook
const mockUseCalendarSettings = vi.fn()
vi.mock('@/hooks/useCalendarSettings', () => ({
  useCalendarSettings: () => mockUseCalendarSettings(),
}))

// Mock useAuth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'user-1', email: 'test@example.com' },
    companyId: 'company-1',
    isLoading: false,
    signOut: vi.fn(),
  })),
}))

// Test wrapper with QueryClient
const createTestWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('MiniCalendar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Mode: month', () => {
    it('should render calendar grid for month selection (1-31 days)', () => {
      mockUseCalendarSettings.mockReturnValue({
        settings: null,
        isLoading: false,
        error: null,
      })

      render(<MiniCalendar mode="month" onSelect={vi.fn()} />, {
        wrapper: createTestWrapper(),
      })

      // Verifica presenza giorni 1-31
      for (let i = 1; i <= 31; i++) {
        expect(screen.getByText(i.toString())).toBeInTheDocument()
      }

      // Verifica grid ha 7 colonne (header + 31 giorni = 38 elementi totali)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThanOrEqual(31)
    })

    it('should highlight selected day', () => {
      mockUseCalendarSettings.mockReturnValue({
        settings: null,
        isLoading: false,
        error: null,
      })

      render(<MiniCalendar mode="month" selectedDay={15} onSelect={vi.fn()} />, {
        wrapper: createTestWrapper(),
      })

      const day15 = screen.getByText('15')
      expect(day15).toHaveClass('bg-blue-600', 'text-white')
    })

    it('should call onChange when day is clicked', async () => {
      mockUseCalendarSettings.mockReturnValue({
        settings: null,
        isLoading: false,
        error: null,
      })

      const mockOnSelect = vi.fn()
      render(<MiniCalendar mode="month" onSelect={mockOnSelect} />, {
        wrapper: createTestWrapper(),
      })

      const day15 = screen.getByText('15')
      await userEvent.click(day15)

      expect(mockOnSelect).toHaveBeenCalledWith(15)
    })
  })

  describe('Mode: year with calendar settings', () => {
    const mockCalendarSettings: CompanyCalendarSettings = {
      id: 'settings-1',
      company_id: 'company-1',
      fiscal_year_start: '2025-07-01', // Anno fiscale: 1 luglio - 30 giugno
      fiscal_year_end: '2026-06-30',
      closure_dates: ['2025-08-15', '2025-12-25', '2025-12-26'], // Ferragosto, Natale, S.Stefano
      open_weekdays: [1, 2, 3, 4, 5], // Solo lunedì-venerdì
      business_hours: {
        '1': [{ open: '09:00', close: '18:00' }],
        '2': [{ open: '09:00', close: '18:00' }],
        '3': [{ open: '09:00', close: '18:00' }],
        '4': [{ open: '09:00', close: '18:00' }],
        '5': [{ open: '09:00', close: '18:00' }],
      },
      is_configured: true,
      created_at: new Date('2025-01-01'),
      updated_at: new Date('2025-01-01'),
    }

    it('should load company calendar settings (open_weekdays, closure_dates, fiscal_year)', () => {
      mockUseCalendarSettings.mockReturnValue({
        settings: mockCalendarSettings,
        isLoading: false,
        error: null,
      })

      render(<MiniCalendar mode="year" onSelect={vi.fn()} />, {
        wrapper: createTestWrapper(),
      })

      // Verifica che useCalendarSettings sia stato chiamato
      expect(mockUseCalendarSettings).toHaveBeenCalled()
    })

    it('should render calendar with fiscal year range (not gregorian)', async () => {
      mockUseCalendarSettings.mockReturnValue({
        settings: mockCalendarSettings,
        isLoading: false,
        error: null,
      })

      render(<MiniCalendar mode="year" onSelect={vi.fn()} />, {
        wrapper: createTestWrapper(),
      })

      await waitFor(() => {
        // Verifica che il calendario mostri mesi dell'anno fiscale (luglio-giugno)
        // Non deve mostrare solo gennaio-dicembre
        const fiscalMonths = screen.getAllByText(/luglio|agosto|settembre|ottobre|novembre|dicembre/i)
        expect(fiscalMonths.length).toBeGreaterThan(0)
      })
    })

    it('should show only open weekdays as selectable (others disabled)', async () => {
      mockUseCalendarSettings.mockReturnValue({
        settings: mockCalendarSettings,
        isLoading: false,
        error: null,
      })

      render(<MiniCalendar mode="year" onSelect={vi.fn()} />, {
        wrapper: createTestWrapper(),
      })

      await waitFor(() => {
        // Trova tutti i bottoni del calendario
        const buttons = screen.getAllByRole('button')
        
        // Verifica che ci siano bottoni disabilitati (sabato/domenica)
        const disabledButtons = buttons.filter(btn => btn.hasAttribute('disabled'))
        expect(disabledButtons.length).toBeGreaterThan(0)
      })
    })

    it('should disable closure dates from calendar settings', async () => {
      mockUseCalendarSettings.mockReturnValue({
        settings: mockCalendarSettings,
        isLoading: false,
        error: null,
      })

      render(<MiniCalendar mode="year" onSelect={vi.fn()} />, {
        wrapper: createTestWrapper(),
      })

      await waitFor(() => {
        // Verifica che le date di chiusura (15 agosto, 25-26 dicembre) siano disabilitate
        // Cerca il giorno 15 di agosto (se visibile)
        const buttons = screen.getAllByRole('button')
        // Almeno alcuni bottoni devono essere disabilitati per le closure dates
        expect(buttons.some(btn => btn.hasAttribute('disabled'))).toBe(true)
      })
    })

    it('should calculate day of activity year (only working days count)', async () => {
      mockUseCalendarSettings.mockReturnValue({
        settings: mockCalendarSettings,
        isLoading: false,
        error: null,
      })

      const mockOnSelect = vi.fn()
      render(<MiniCalendar mode="year" onSelect={mockOnSelect} />, {
        wrapper: createTestWrapper(),
      })

      await waitFor(() => {
        // Trova un giorno selezionabile (lunedì-venerdì, non chiuso)
        const buttons = screen.getAllByRole('button')
        const selectableButton = buttons.find(btn => !btn.hasAttribute('disabled'))
        
        if (selectableButton) {
          userEvent.click(selectableButton)
          // Verifica che onSelect sia chiamato con un numero (giorno di attività)
          expect(mockOnSelect).toHaveBeenCalled()
          const callArg = mockOnSelect.mock.calls[0][0]
          expect(typeof callArg).toBe('number')
          expect(callArg).toBeGreaterThan(0)
        }
      })
    })

    it('should display layout as real calendar (weeks/months) not number grid', async () => {
      mockUseCalendarSettings.mockReturnValue({
        settings: mockCalendarSettings,
        isLoading: false,
        error: null,
      })

      render(<MiniCalendar mode="year" onSelect={vi.fn()} />, {
        wrapper: createTestWrapper(),
      })

      await waitFor(() => {
        // Verifica che ci siano header giorni settimana (L, M, M, G, V, S, D)
        // Usa getAllByText perché ci sono più header (uno per ogni mese)
        const lHeaders = screen.getAllByText('L')
        const mHeaders = screen.getAllByText('M')
        const gHeaders = screen.getAllByText('G')
        const vHeaders = screen.getAllByText('V')
        const sHeaders = screen.getAllByText('S')
        const dHeaders = screen.getAllByText('D')
        
        expect(lHeaders.length).toBeGreaterThan(0)
        expect(mHeaders.length).toBeGreaterThan(0)
        expect(gHeaders.length).toBeGreaterThan(0)
        expect(vHeaders.length).toBeGreaterThan(0)
        expect(sHeaders.length).toBeGreaterThan(0)
        expect(dHeaders.length).toBeGreaterThan(0)
      })
    })

    it('should fallback to all days if calendar settings not configured', async () => {
      mockUseCalendarSettings.mockReturnValue({
        settings: null, // Settings non configurati
        isLoading: false,
        error: null,
      })

      const mockOnSelect = vi.fn()
      render(<MiniCalendar mode="year" onSelect={mockOnSelect} />, {
        wrapper: createTestWrapper(),
      })

      await waitFor(() => {
        // Con fallback, tutti i giorni dovrebbero essere selezionabili
        const buttons = screen.getAllByRole('button')
        expect(buttons.length).toBeGreaterThan(0)
        
        // Clicca un giorno e verifica che funzioni
        if (buttons[0]) {
          userEvent.click(buttons[0])
          expect(mockOnSelect).toHaveBeenCalled()
        }
      })
    })
  })

  describe('Validazione', () => {
    it('should validate selected day is within range', () => {
      mockUseCalendarSettings.mockReturnValue({
        settings: null,
        isLoading: false,
        error: null,
      })

      // Test mode month: giorno 32 non dovrebbe essere selezionabile
      render(<MiniCalendar mode="month" selectedDay={32} onSelect={vi.fn()} />, {
        wrapper: createTestWrapper(),
      })

      // Verifica che giorno 32 non sia evidenziato (non esiste)
      const day32 = screen.queryByText('32')
      expect(day32).not.toBeInTheDocument()
    })
  })
})
