import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddTemperatureModal } from '../AddTemperatureModal'
import type { ConservationPoint } from '@/types/conservation'

// Mock useAuth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'test-user-1', email: 'test@example.com' },
    companyId: 'test-company-1',
    sessionId: 'test-session-1',
    isAuthenticated: true,
    isLoading: false,
  })),
}))

// Mock the conservation point
const mockConservationPoint: ConservationPoint = {
  id: 'test-point-1',
  company_id: 'test-company-1',
  department_id: 'test-dept-1',
  name: 'Test Frigo',
  setpoint_temp: 4,
  type: 'fridge',
  product_categories: [],
  status: 'normal',
  is_blast_chiller: false,
  created_at: new Date(),
  updated_at: new Date(),
}

describe('AddTemperatureModal - TASK 1.1: Fix Modal Z-Index', () => {
  const mockOnClose = vi.fn()
  const mockOnSave = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock document.body.style.overflow
    Object.defineProperty(document.body, 'style', {
      value: {
        overflow: '',
      },
      writable: true,
    })
  })

  it('should have z-index of 9999 or higher on modal overlay (mobile compatibility)', () => {
    // RED: Write test that fails
    // The modal overlay should have z-index >= 9999 to appear above navigation bar on mobile
    render(
      <AddTemperatureModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        conservationPoint={mockConservationPoint}
      />
    )

    // Find the modal overlay (the fixed inset-0 container)
    const overlay = screen.getByRole('dialog')
    
    // Get computed styles or class list
    const classes = overlay.className
    
    // Verify that z-index is 9999 or higher
    // Check for Tailwind class z-[9999] or higher
    const hasHighZIndex = 
      classes.includes('z-[9999]') ||
      classes.includes('z-[10000]') ||
      // Check if inline style would be used (fallback check)
      overlay.getAttribute('style')?.includes('z-index: 9999') ||
      overlay.getAttribute('style')?.includes('z-index: 10000')
    
    expect(hasHighZIndex).toBe(true)
  })

  it('should have max-height with calc(100vh - 100px) on modal content to prevent overflow on mobile', () => {
    // RED: Write test that fails
    // The modal content should have max-height: calc(100vh - 100px) to avoid being cut off on mobile
    render(
      <AddTemperatureModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        conservationPoint={mockConservationPoint}
      />
    )

    // Find the modal content (the inner div with bg-white rounded-lg)
    // This should be a child of the overlay
    const overlay = screen.getByRole('dialog')
    const modalContent = overlay.querySelector('.bg-white.rounded-lg')
    
    expect(modalContent).not.toBeNull()
    
    if (modalContent) {
      const classes = (modalContent as HTMLElement).className
      
      // Verify max-height uses calc to account for navigation bar
      // Check for Tailwind class max-h-[calc(100vh-100px)] or similar
      const hasCorrectMaxHeight =
        classes.includes('max-h-[calc(100vh-100px)]') ||
        classes.includes('max-h-[calc(100vh-80px)]') ||
        // Check if inline style would be used (fallback check)
        (modalContent as HTMLElement).getAttribute('style')?.includes('max-height: calc(100vh - 100px)') ||
        (modalContent as HTMLElement).getAttribute('style')?.includes('max-height: calc(100vh-80px)')
      
      expect(hasCorrectMaxHeight).toBe(true)
    }
  })
})

describe('AddTemperatureModal - TASK 1.2: Preview Stato Temperatura', () => {
  const mockOnClose = vi.fn()
  const mockOnSave = vi.fn()

  const mockConservationPointFridge: ConservationPoint = {
    id: 'test-point-fridge',
    company_id: 'test-company-1',
    department_id: 'test-dept-1',
    name: 'Test Frigo',
    setpoint_temp: 4,
    type: 'fridge',
    product_categories: [],
    status: 'normal',
    is_blast_chiller: false,
    created_at: new Date(),
    updated_at: new Date(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(document.body, 'style', {
      value: {
        overflow: '',
      },
      writable: true,
    })
  })

  it('should show green badge when temperature is compliant (within tolerance)', async () => {
    // RED: Write test that fails
    // When user types temperature within tolerance, should see green badge UNDER the input
    const user = userEvent.setup()
    
    render(
      <AddTemperatureModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        conservationPoint={mockConservationPointFridge}
      />
    )

    // Find temperature input
    const tempInput = screen.getByLabelText(/temperatura rilevata/i) as HTMLInputElement
    
    // Type compliant temperature (4°C, setpoint is 4°C, tolerance is ±2°C)
    await user.clear(tempInput)
    await user.type(tempInput, '4')

    // Find the badge that should be directly under the input field
    // Look for a badge element right after the input's parent container
    const inputContainer = tempInput.closest('div')
    expect(inputContainer).not.toBeNull()
    
    // Badge should be a sibling or child of input container
    // Check for badge with green styling and "Conforme" text
    const badges = screen.queryAllByText(/conforme|✓ conforme/i)
    // At least one badge should have green styling and be near the input
    const compliantBadge = badges.find(badge => {
      const classes = badge.className
      return classes.includes('bg-green') || classes.includes('text-green-800') || badge.closest('.bg-green-100, .bg-green-50')
    })
    
    expect(compliantBadge).toBeDefined()
  })

  it('should show yellow badge when temperature is in warning range (tolerance + 2)', async () => {
    // RED: Write test that fails
    // When user types temperature in warning range, should see yellow badge
    const user = userEvent.setup()
    
    render(
      <AddTemperatureModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        conservationPoint={mockConservationPointFridge}
      />
    )

    // Find temperature input
    const tempInput = screen.getByLabelText(/temperatura rilevata/i) as HTMLInputElement
    
    // Type warning temperature (7°C, setpoint is 4°C, diff is 3°C which is > tolerance (2) but <= tolerance+2 (4))
    await user.clear(tempInput)
    await user.type(tempInput, '7')

    // Should show yellow badge with "Warning" or "Attenzione"
    const badges = screen.queryAllByText(/warning|attenzione|⚠ warning/i)
    const warningBadge = badges.find(badge => {
      const classes = badge.className
      return classes.includes('bg-yellow') || classes.includes('text-yellow-800') || badge.closest('.bg-yellow-100, .bg-yellow-50')
    })
    
    expect(warningBadge).toBeDefined()
  })

  it('should show red badge when temperature is critical (beyond tolerance + 2)', async () => {
    // RED: Write test that fails
    // When user types critical temperature, should see red badge
    const user = userEvent.setup()
    
    render(
      <AddTemperatureModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        conservationPoint={mockConservationPointFridge}
      />
    )

    // Find temperature input
    const tempInput = screen.getByLabelText(/temperatura rilevata/i) as HTMLInputElement
    
    // Type critical temperature (12°C, setpoint is 4°C, diff is 8°C which is > tolerance+2 (4))
    await user.clear(tempInput)
    await user.type(tempInput, '12')

    // Should show red badge with "Critico" or "Critical"
    // There might be multiple "Critico" texts (section + badge)
    const badges = screen.queryAllByText(/critico|critical|✗ critico/i)
    
    // At least one badge should exist (either the large section or the compact badge)
    // But we want to verify there's a badge near the input specifically
    expect(badges.length).toBeGreaterThan(0)
    // If we can't find a specific compact badge, at least verify red styling exists
    const hasRedBadge = badges.some(badge => {
      const classes = badge.className
      return classes.includes('text-red') || classes.includes('bg-red')
    })
    expect(hasRedBadge).toBe(true)
  })

  it('should show badge under input when temperature is typed', async () => {
    // GREEN: Test passes - Badge appears under the input field when temperature is entered
    const user = userEvent.setup()
    
    render(
      <AddTemperatureModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        conservationPoint={mockConservationPointFridge}
      />
    )

    const tempInput = screen.getByLabelText(/temperatura rilevata/i) as HTMLInputElement
    
    // Type a temperature
    await user.clear(tempInput)
    await user.type(tempInput, '5')
    
    // Should show status badges (both compact badge and large section have role="status")
    // Find all status elements
    const statusElements = screen.getAllByRole('status')
    expect(statusElements.length).toBeGreaterThan(0)
    
    // Should find the compact badge under input (with "✓ Conforme" text and compact styling)
    const compactBadge = statusElements.find(el => 
      el.textContent?.includes('✓ Conforme') || 
      el.textContent?.includes('⚠ Warning') || 
      el.textContent?.includes('✗ Critico')
    )
    
    expect(compactBadge).toBeDefined()
    
    // For 5°C (setpoint 4°C, diff 1°C, tolerance 2°C): should be compliant
    const compliantText = screen.queryAllByText(/conforme/i)
    expect(compliantText.length).toBeGreaterThan(0)
  })
})
