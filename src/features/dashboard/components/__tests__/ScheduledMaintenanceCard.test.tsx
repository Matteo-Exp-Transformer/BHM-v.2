import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ScheduledMaintenanceCard } from '../ScheduledMaintenanceCard'
import type { MaintenanceTask } from '@/types/conservation'

// Mock hooks
const mockCompleteTask = vi.fn()
const mockIsCompleting = false

vi.mock('@/features/conservation/hooks/useMaintenanceTasks', () => ({
  useMaintenanceTasks: vi.fn(() => ({
    maintenanceTasks: [],
    isLoading: false,
    completeTask: mockCompleteTask,
    isCompleting: mockIsCompleting,
  })),
}))

vi.mock('@/features/conservation/hooks/useConservationPoints', () => ({
  useConservationPoints: vi.fn(() => ({
    conservationPoints: [],
    isLoading: false,
  })),
}))

describe('ScheduledMaintenanceCard - TASK 3.4: Pulsante Completa', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display "Completa" button for pending maintenance', async () => {
    // RED: Test che fallisce - pulsante non esiste ancora
    const { useMaintenanceTasks } = await import('@/features/conservation/hooks/useMaintenanceTasks')
    const { useConservationPoints } = await import('@/features/conservation/hooks/useConservationPoints')

    const mockMaintenanceTask: MaintenanceTask = {
      id: 'task-1',
      company_id: 'company-1',
      conservation_point_id: 'point-1',
      title: 'Rilevamento temperatura',
      type: 'temperature',
      frequency: 'daily',
      estimated_duration: 15,
      next_due: new Date(),
      priority: 'medium',
      status: 'scheduled', // Non completata
      created_at: new Date(),
      updated_at: new Date(),
    }

    const mockConservationPoint = {
      id: 'point-1',
      company_id: 'company-1',
      department_id: 'dept-1',
      name: 'Frigo Test',
      setpoint_temp: 4,
      type: 'fridge' as const,
      product_categories: [],
      status: 'normal' as const,
      is_blast_chiller: false,
      created_at: new Date(),
      updated_at: new Date(),
    }

    vi.mocked(useMaintenanceTasks).mockReturnValue({
      maintenanceTasks: [mockMaintenanceTask],
      isLoading: false,
      completeTask: mockCompleteTask,
      isCompleting: false,
      error: null,
      stats: {
        total_tasks: 1,
        completed_tasks: 0,
        overdue_tasks: 0,
        completion_rate: 0,
        tasks_by_type: {
          temperature: 1,
          sanitization: 0,
          defrosting: 0,
        },
        average_completion_time: 0,
        upcoming_tasks: [],
      },
      getTaskStatus: () => 'scheduled',
      createTask: vi.fn(),
      updateTask: vi.fn(),
      deleteTask: vi.fn(),
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })

    vi.mocked(useConservationPoints).mockReturnValue({
      conservationPoints: [mockConservationPoint],
      isLoading: false,
      error: null,
      stats: {
        total_points: 1,
        by_status: {
          normal: 1,
          warning: 0,
          critical: 0,
        },
        by_type: {
          ambient: 0,
          fridge: 1,
          freezer: 0,
          blast: 0,
        },
        temperature_compliance_rate: 100,
        maintenance_compliance_rate: 100,
        alerts_count: 0,
      },
      createConservationPoint: vi.fn(),
      updateConservationPoint: vi.fn(),
      deleteConservationPoint: vi.fn(),
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })

    render(<ScheduledMaintenanceCard />)

    // Aspetta che il componente si carichi
    await waitFor(() => {
      expect(screen.getByText(/Manutenzioni Programmate/i)).toBeInTheDocument()
    })

    // Espandi il punto cliccando sulla card
    const pointCard = screen.getByText('Frigo Test')
    await userEvent.click(pointCard)

    // Aspetta che le manutenzioni vengano renderizzate
    await waitFor(() => {
      expect(screen.getByText(/Rilevamento Temperature/i)).toBeInTheDocument()
    })

    // Verifica che il pulsante "Completa" sia presente
    const completeButton = screen.getByRole('button', { name: /completa/i })
    expect(completeButton).toBeInTheDocument()
  })

  it('should call completeTask when "Completa" button is clicked', async () => {
    // RED: Test che fallisce - pulsante non chiama ancora completeTask
    const { useMaintenanceTasks } = await import('@/features/conservation/hooks/useMaintenanceTasks')
    const { useConservationPoints } = await import('@/features/conservation/hooks/useConservationPoints')

    const mockMaintenanceTask: MaintenanceTask = {
      id: 'task-1',
      company_id: 'company-1',
      conservation_point_id: 'point-1',
      title: 'Rilevamento temperatura',
      type: 'temperature',
      frequency: 'daily',
      estimated_duration: 15,
      next_due: new Date(),
      priority: 'medium',
      status: 'scheduled',
      created_at: new Date(),
      updated_at: new Date(),
    }

    const mockConservationPoint = {
      id: 'point-1',
      company_id: 'company-1',
      department_id: 'dept-1',
      name: 'Frigo Test',
      setpoint_temp: 4,
      type: 'fridge' as const,
      product_categories: [],
      status: 'normal' as const,
      is_blast_chiller: false,
      created_at: new Date(),
      updated_at: new Date(),
    }

    vi.mocked(useMaintenanceTasks).mockReturnValue({
      maintenanceTasks: [mockMaintenanceTask],
      isLoading: false,
      completeTask: mockCompleteTask,
      isCompleting: false,
      error: null,
      stats: {
        total_tasks: 1,
        completed_tasks: 0,
        overdue_tasks: 0,
        completion_rate: 0,
        tasks_by_type: {
          temperature: 1,
          sanitization: 0,
          defrosting: 0,
        },
        average_completion_time: 0,
        upcoming_tasks: [],
      },
      getTaskStatus: () => 'scheduled',
      createTask: vi.fn(),
      updateTask: vi.fn(),
      deleteTask: vi.fn(),
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })

    vi.mocked(useConservationPoints).mockReturnValue({
      conservationPoints: [mockConservationPoint],
      isLoading: false,
      error: null,
      stats: {
        total_points: 1,
        by_status: {
          normal: 1,
          warning: 0,
          critical: 0,
        },
        by_type: {
          ambient: 0,
          fridge: 1,
          freezer: 0,
          blast: 0,
        },
        temperature_compliance_rate: 100,
        maintenance_compliance_rate: 100,
        alerts_count: 0,
      },
      createConservationPoint: vi.fn(),
      updateConservationPoint: vi.fn(),
      deleteConservationPoint: vi.fn(),
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })

    render(<ScheduledMaintenanceCard />)

    // Aspetta caricamento e espandi
    await waitFor(() => {
      expect(screen.getByText(/Manutenzioni Programmate/i)).toBeInTheDocument()
    })

    const pointCard = screen.getByText('Frigo Test')
    await userEvent.click(pointCard)

    await waitFor(() => {
      expect(screen.getByText(/Rilevamento Temperature/i)).toBeInTheDocument()
    })

    // Trova e clicca il pulsante "Completa"
    const completeButton = screen.getByRole('button', { name: /completa/i })
    await userEvent.click(completeButton)

    // Verifica che completeTask sia stato chiamato con i parametri corretti
    expect(mockCompleteTask).toHaveBeenCalledWith(
      expect.objectContaining({
        maintenance_task_id: 'task-1',
        completed_at: expect.any(Date),
        completed_by: '',
        notes: undefined,
        photos: undefined,
      })
    )
  })

  it('should NOT display completed maintenance (filtered out by Task 3.2)', async () => {
    // ✅ Task 3.2 MODIFICATO: Le manutenzioni completate non vengono visualizzate
    const { useMaintenanceTasks } = await import('@/features/conservation/hooks/useMaintenanceTasks')
    const { useConservationPoints } = await import('@/features/conservation/hooks/useConservationPoints')

    const mockMaintenanceTask: MaintenanceTask = {
      id: 'task-1',
      company_id: 'company-1',
      conservation_point_id: 'point-1',
      title: 'Rilevamento temperatura',
      type: 'temperature',
      frequency: 'daily',
      estimated_duration: 15,
      next_due: new Date(),
      priority: 'medium',
      status: 'completed' as const, // Completata - deve essere filtrata
      last_completed: new Date(),
      completed_at: new Date(),
      completed_by: 'user-1',
      created_at: new Date(),
      updated_at: new Date(),
    }

    const mockConservationPoint = {
      id: 'point-1',
      company_id: 'company-1',
      department_id: 'dept-1',
      name: 'Frigo Test',
      setpoint_temp: 4,
      type: 'fridge' as const,
      product_categories: [],
      status: 'normal' as const,
      is_blast_chiller: false,
      created_at: new Date(),
      updated_at: new Date(),
    }

    vi.mocked(useMaintenanceTasks).mockReturnValue({
      maintenanceTasks: [mockMaintenanceTask],
      isLoading: false,
      completeTask: mockCompleteTask,
      isCompleting: false,
      error: null,
      stats: {
        total_tasks: 1,
        completed_tasks: 1,
        overdue_tasks: 0,
        completion_rate: 100,
        tasks_by_type: {
          temperature: 1,
          sanitization: 0,
          defrosting: 0,
        },
        average_completion_time: 0,
        upcoming_tasks: [],
      },
      getTaskStatus: () => 'scheduled' as const,
      createTask: vi.fn(),
      updateTask: vi.fn(),
      deleteTask: vi.fn(),
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })

    vi.mocked(useConservationPoints).mockReturnValue({
      conservationPoints: [mockConservationPoint],
      isLoading: false,
      error: null,
      stats: {
        total_points: 1,
        by_status: {
          normal: 1,
          warning: 0,
          critical: 0,
        },
        by_type: {
          ambient: 0,
          fridge: 1,
          freezer: 0,
          blast: 0,
        },
        temperature_compliance_rate: 100,
        maintenance_compliance_rate: 100,
        alerts_count: 0,
      },
      createConservationPoint: vi.fn(),
      updateConservationPoint: vi.fn(),
      deleteConservationPoint: vi.fn(),
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })

    render(<ScheduledMaintenanceCard />)

    // Aspetta caricamento e espandi
    await waitFor(() => {
      expect(screen.getByText(/Manutenzioni Programmate/i)).toBeInTheDocument()
    })

    const pointCard = screen.getByText('Frigo Test')
    await userEvent.click(pointCard)

    // ✅ Verifica che la manutenzione completata NON sia visualizzata (filtrata)
    await waitFor(() => {
      // La manutenzione completata deve essere filtrata, quindi non deve essere visibile
      expect(screen.queryByText(/Rilevamento Temperature/i)).not.toBeInTheDocument()
    })

    // ✅ Verifica che viene mostrato il messaggio "Nessuna manutenzione obbligatoria" (perché tutte sono completate)
    expect(screen.getByText(/Nessuna manutenzione obbligatoria configurata per questo punto/i)).toBeInTheDocument()
  })

  it('should disable button while completing', async () => {
    // RED: Test che verifica che il pulsante sia disabilitato durante il completamento
    const { useMaintenanceTasks } = await import('@/features/conservation/hooks/useMaintenanceTasks')
    const { useConservationPoints } = await import('@/features/conservation/hooks/useConservationPoints')

    const mockMaintenanceTask: MaintenanceTask = {
      id: 'task-1',
      company_id: 'company-1',
      conservation_point_id: 'point-1',
      title: 'Rilevamento temperatura',
      type: 'temperature',
      frequency: 'daily',
      estimated_duration: 15,
      next_due: new Date(),
      priority: 'medium',
      status: 'scheduled',
      created_at: new Date(),
      updated_at: new Date(),
    }

    const mockConservationPoint = {
      id: 'point-1',
      company_id: 'company-1',
      department_id: 'dept-1',
      name: 'Frigo Test',
      setpoint_temp: 4,
      type: 'fridge' as const,
      product_categories: [],
      status: 'normal' as const,
      is_blast_chiller: false,
      created_at: new Date(),
      updated_at: new Date(),
    }

    vi.mocked(useMaintenanceTasks).mockReturnValue({
      maintenanceTasks: [mockMaintenanceTask],
      isLoading: false,
      completeTask: mockCompleteTask,
      isCompleting: true, // Completamento in corso
      error: null,
      stats: {
        total_tasks: 1,
        completed_tasks: 0,
        overdue_tasks: 0,
        completion_rate: 0,
        tasks_by_type: {
          temperature: 1,
          sanitization: 0,
          defrosting: 0,
        },
        average_completion_time: 0,
        upcoming_tasks: [],
      },
      getTaskStatus: () => 'scheduled',
      createTask: vi.fn(),
      updateTask: vi.fn(),
      deleteTask: vi.fn(),
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })

    vi.mocked(useConservationPoints).mockReturnValue({
      conservationPoints: [mockConservationPoint],
      isLoading: false,
      error: null,
      stats: {
        total_points: 1,
        by_status: {
          normal: 1,
          warning: 0,
          critical: 0,
        },
        by_type: {
          ambient: 0,
          fridge: 1,
          freezer: 0,
          blast: 0,
        },
        temperature_compliance_rate: 100,
        maintenance_compliance_rate: 100,
        alerts_count: 0,
      },
      createConservationPoint: vi.fn(),
      updateConservationPoint: vi.fn(),
      deleteConservationPoint: vi.fn(),
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })

    render(<ScheduledMaintenanceCard />)

    // Aspetta caricamento e espandi
    await waitFor(() => {
      expect(screen.getByText(/Manutenzioni Programmate/i)).toBeInTheDocument()
    })

    const pointCard = screen.getByText('Frigo Test')
    await userEvent.click(pointCard)

    await waitFor(() => {
      expect(screen.getByText(/Rilevamento Temperature/i)).toBeInTheDocument()
    })

    // Verifica che il pulsante sia disabilitato e mostri "Completamento..."
    const completeButton = screen.getByRole('button', { name: /completamento|completa/i })
    expect(completeButton).toBeDisabled()
    expect(completeButton).toHaveTextContent(/completamento/i)
  })
})

describe('ScheduledMaintenanceCard - TASK 3.1: Visualizza Dettagli Assegnazione', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display complete assignment details (role + category + department + staff)', async () => {
    // RED: Test che fallisce - visualizzazione mostra solo stringa generica
    const { useMaintenanceTasks } = await import('@/features/conservation/hooks/useMaintenanceTasks')
    const { useConservationPoints } = await import('@/features/conservation/hooks/useConservationPoints')

    const mockMaintenanceTask: MaintenanceTask = {
      id: 'task-1',
      company_id: 'company-1',
      conservation_point_id: 'point-1',
      title: 'Rilevamento temperatura',
      type: 'temperature',
      frequency: 'daily',
      estimated_duration: 15,
      next_due: new Date(),
      priority: 'medium',
      status: 'scheduled',
      assigned_to_role: 'responsabile',
      assigned_to_category: 'Cuochi',
      assigned_to_staff_id: 'staff-123',
      created_at: new Date(),
      updated_at: new Date(),
      conservation_point: {
        id: 'point-1',
        company_id: 'company-1',
        department_id: 'dept-1',
        name: 'Frigo Test',
        setpoint_temp: 4,
        type: 'fridge',
        product_categories: [],
        status: 'normal',
        is_blast_chiller: false,
        created_at: new Date(),
        updated_at: new Date(),
        department: {
          id: 'dept-1',
          name: 'Cucina',
        },
      },
      assigned_user: {
        id: 'staff-123',
        name: 'Mario Rossi',
      },
    }

    const mockConservationPoint = {
      id: 'point-1',
      company_id: 'company-1',
      department_id: 'dept-1',
      name: 'Frigo Test',
      setpoint_temp: 4,
      type: 'fridge' as const,
      product_categories: [],
      status: 'normal' as const,
      is_blast_chiller: false,
      created_at: new Date(),
      updated_at: new Date(),
    }

    vi.mocked(useMaintenanceTasks).mockReturnValue({
      maintenanceTasks: [mockMaintenanceTask],
      isLoading: false,
      completeTask: mockCompleteTask,
      isCompleting: false,
      error: null,
      stats: {
        total_tasks: 1,
        completed_tasks: 0,
        overdue_tasks: 0,
        completion_rate: 0,
        tasks_by_type: {
          temperature: 1,
          sanitization: 0,
          defrosting: 0,
        },
        average_completion_time: 0,
        upcoming_tasks: [],
      },
      getTaskStatus: () => 'scheduled',
      createTask: vi.fn(),
      updateTask: vi.fn(),
      deleteTask: vi.fn(),
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })

    vi.mocked(useConservationPoints).mockReturnValue({
      conservationPoints: [mockConservationPoint],
      isLoading: false,
      error: null,
      stats: {
        total_points: 1,
        by_status: {
          normal: 1,
          warning: 0,
          critical: 0,
        },
        by_type: {
          ambient: 0,
          fridge: 1,
          freezer: 0,
          blast: 0,
        },
        temperature_compliance_rate: 100,
        maintenance_compliance_rate: 100,
        alerts_count: 0,
      },
      createConservationPoint: vi.fn(),
      updateConservationPoint: vi.fn(),
      deleteConservationPoint: vi.fn(),
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })

    render(<ScheduledMaintenanceCard />)

    await waitFor(() => {
      expect(screen.getByText(/Manutenzioni Programmate/i)).toBeInTheDocument()
    })

    const pointCard = screen.getByText('Frigo Test')
    await userEvent.click(pointCard)

    await waitFor(() => {
      expect(screen.getByText(/Rilevamento Temperature/i)).toBeInTheDocument()
    })

    // Verifica formato completo: Ruolo | Reparto | Categoria | Dipendente
    expect(screen.getByText(/Responsabile/i)).toBeInTheDocument()
    expect(screen.getByText(/Cucina/i)).toBeInTheDocument()
    expect(screen.getByText(/Cuochi/i)).toBeInTheDocument()
    expect(screen.getByText(/Mario Rossi/i)).toBeInTheDocument()
  })

  it('should display "Non assegnato" when no assignment fields are present', async () => {
    // RED: Test che verifica gestione campi opzionali
    const { useMaintenanceTasks } = await import('@/features/conservation/hooks/useMaintenanceTasks')
    const { useConservationPoints } = await import('@/features/conservation/hooks/useConservationPoints')

    const mockMaintenanceTask: MaintenanceTask = {
      id: 'task-1',
      company_id: 'company-1',
      conservation_point_id: 'point-1',
      title: 'Rilevamento temperatura',
      type: 'temperature',
      frequency: 'daily',
      estimated_duration: 15,
      next_due: new Date(),
      priority: 'medium',
      status: 'scheduled',
      created_at: new Date(),
      updated_at: new Date(),
      conservation_point: {
        id: 'point-1',
        company_id: 'company-1',
        department_id: 'dept-1',
        name: 'Frigo Test',
        setpoint_temp: 4,
        type: 'fridge',
        product_categories: [],
        status: 'normal',
        is_blast_chiller: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
    }

    const mockConservationPoint = {
      id: 'point-1',
      company_id: 'company-1',
      department_id: 'dept-1',
      name: 'Frigo Test',
      setpoint_temp: 4,
      type: 'fridge' as const,
      product_categories: [],
      status: 'normal' as const,
      is_blast_chiller: false,
      created_at: new Date(),
      updated_at: new Date(),
    }

    vi.mocked(useMaintenanceTasks).mockReturnValue({
      maintenanceTasks: [mockMaintenanceTask],
      isLoading: false,
      completeTask: mockCompleteTask,
      isCompleting: false,
      error: null,
      stats: {
        total_tasks: 1,
        completed_tasks: 0,
        overdue_tasks: 0,
        completion_rate: 0,
        tasks_by_type: {
          temperature: 1,
          sanitization: 0,
          defrosting: 0,
        },
        average_completion_time: 0,
        upcoming_tasks: [],
      },
      getTaskStatus: () => 'scheduled',
      createTask: vi.fn(),
      updateTask: vi.fn(),
      deleteTask: vi.fn(),
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })

    vi.mocked(useConservationPoints).mockReturnValue({
      conservationPoints: [mockConservationPoint],
      isLoading: false,
      error: null,
      stats: {
        total_points: 1,
        by_status: {
          normal: 1,
          warning: 0,
          critical: 0,
        },
        by_type: {
          ambient: 0,
          fridge: 1,
          freezer: 0,
          blast: 0,
        },
        temperature_compliance_rate: 100,
        maintenance_compliance_rate: 100,
        alerts_count: 0,
      },
      createConservationPoint: vi.fn(),
      updateConservationPoint: vi.fn(),
      deleteConservationPoint: vi.fn(),
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })

    render(<ScheduledMaintenanceCard />)

    await waitFor(() => {
      expect(screen.getByText(/Manutenzioni Programmate/i)).toBeInTheDocument()
    })

    const pointCard = screen.getByText('Frigo Test')
    await userEvent.click(pointCard)

    await waitFor(() => {
      expect(screen.getByText(/Rilevamento Temperature/i)).toBeInTheDocument()
    })

    // Verifica che venga mostrato "Non assegnato"
    expect(screen.getByText(/Non assegnato/i)).toBeInTheDocument()
  })
})

describe('ScheduledMaintenanceCard - TASK 3.2 MODIFICATO: Ordina Manutenzioni + Filtro Completate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should filter out completed maintenances', async () => {
    // ✅ Test che verifica che le manutenzioni completate non vengano visualizzate
    const { useMaintenanceTasks } = await import('@/features/conservation/hooks/useMaintenanceTasks')
    const { useConservationPoints } = await import('@/features/conservation/hooks/useConservationPoints')

    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const mockMaintenanceTasks: MaintenanceTask[] = [
      {
        id: 'task-1',
        company_id: 'company-1',
        conservation_point_id: 'point-1',
        title: 'Manutenzione Completata',
        type: 'temperature',
        frequency: 'daily',
        estimated_duration: 15,
        next_due: now,
        priority: 'medium',
        status: 'completed', // ✅ Completata - non dovrebbe essere visualizzata
        last_completed: now,
        completed_at: now,
        completed_by: 'user-1',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 'task-2',
        company_id: 'company-1',
        conservation_point_id: 'point-1',
        title: 'Manutenzione Pendente',
        type: 'sanitization',
        frequency: 'weekly',
        estimated_duration: 30,
        next_due: tomorrow, // ✅ Pendente - dovrebbe essere visualizzata
        priority: 'high',
        status: 'scheduled',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]

    const mockConservationPoint = {
      id: 'point-1',
      company_id: 'company-1',
      department_id: 'dept-1',
      name: 'Frigo Test',
      setpoint_temp: 4,
      type: 'fridge' as const,
      product_categories: [],
      status: 'normal' as const,
      is_blast_chiller: false,
      created_at: new Date(),
      updated_at: new Date(),
    }

    vi.mocked(useMaintenanceTasks).mockReturnValue({
      maintenanceTasks: mockMaintenanceTasks,
      isLoading: false,
      completeTask: mockCompleteTask,
      isCompleting: false,
      error: null,
      stats: {
        total_tasks: 2,
        completed_tasks: 1,
        overdue_tasks: 0,
        completion_rate: 50,
        tasks_by_type: {
          temperature: 1,
          sanitization: 1,
          defrosting: 0,
        },
        average_completion_time: 0,
        upcoming_tasks: [],
      },
      getTaskStatus: () => 'scheduled',
      createTask: vi.fn(),
      updateTask: vi.fn(),
      deleteTask: vi.fn(),
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })

    vi.mocked(useConservationPoints).mockReturnValue({
      conservationPoints: [mockConservationPoint],
      isLoading: false,
      error: null,
      stats: {
        total_points: 1,
        by_status: {
          normal: 1,
          warning: 0,
          critical: 0,
        },
        by_type: {
          ambient: 0,
          fridge: 1,
          freezer: 0,
          blast: 0,
        },
        temperature_compliance_rate: 100,
        maintenance_compliance_rate: 100,
        alerts_count: 0,
      },
      createConservationPoint: vi.fn(),
      updateConservationPoint: vi.fn(),
      deleteConservationPoint: vi.fn(),
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })

    render(<ScheduledMaintenanceCard />)

    await waitFor(() => {
      expect(screen.getByText(/Manutenzioni Programmate/i)).toBeInTheDocument()
    })

    const pointCard = screen.getByText('Frigo Test')
    await userEvent.click(pointCard)

    await waitFor(() => {
      expect(screen.getByText(/Sanificazione/i)).toBeInTheDocument()
    })

    // ✅ Verifica che la manutenzione completata NON sia visualizzata
    expect(screen.queryByText(/Manutenzione Completata/i)).not.toBeInTheDocument()
    
    // ✅ Verifica che la manutenzione pendente SIA visualizzata
    expect(screen.getByText(/Sanificazione/i)).toBeInTheDocument()
  })

  it('should display maintenances ordered by next_due ascending (earliest first)', async () => {
    // RED: Test che fallisce - manutenzioni non ordinate per scadenza
    const { useMaintenanceTasks } = await import('@/features/conservation/hooks/useMaintenanceTasks')
    const { useConservationPoints } = await import('@/features/conservation/hooks/useConservationPoints')

    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const nextWeek = new Date(now)
    nextWeek.setDate(nextWeek.getDate() + 7)

    const mockMaintenanceTasks: MaintenanceTask[] = [
      {
        id: 'task-3',
        company_id: 'company-1',
        conservation_point_id: 'point-1',
        title: 'Manutenzione 3',
        type: 'temperature',
        frequency: 'daily',
        estimated_duration: 15,
        next_due: nextWeek, // Scadenza più lontana
        priority: 'medium',
        status: 'scheduled',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 'task-1',
        company_id: 'company-1',
        conservation_point_id: 'point-1',
        title: 'Manutenzione 1',
        type: 'sanitization',
        frequency: 'weekly',
        estimated_duration: 30,
        next_due: now, // Scadenza più prossima
        priority: 'high',
        status: 'scheduled',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 'task-2',
        company_id: 'company-1',
        conservation_point_id: 'point-1',
        title: 'Manutenzione 2',
        type: 'defrosting',
        frequency: 'monthly',
        estimated_duration: 60,
        next_due: tomorrow, // Scadenza intermedia
        priority: 'medium',
        status: 'scheduled',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]

    const mockConservationPoint = {
      id: 'point-1',
      company_id: 'company-1',
      department_id: 'dept-1',
      name: 'Frigo Test',
      setpoint_temp: 4,
      type: 'fridge' as const,
      product_categories: [],
      status: 'normal' as const,
      is_blast_chiller: false,
      created_at: new Date(),
      updated_at: new Date(),
    }

    vi.mocked(useMaintenanceTasks).mockReturnValue({
      maintenanceTasks: mockMaintenanceTasks,
      isLoading: false,
      completeTask: mockCompleteTask,
      isCompleting: false,
      error: null,
      stats: {
        total_tasks: 3,
        completed_tasks: 0,
        overdue_tasks: 0,
        completion_rate: 0,
        tasks_by_type: {
          temperature: 1,
          sanitization: 1,
          defrosting: 1,
        },
        average_completion_time: 0,
        upcoming_tasks: [],
      },
      getTaskStatus: () => 'scheduled',
      createTask: vi.fn(),
      updateTask: vi.fn(),
      deleteTask: vi.fn(),
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })

    vi.mocked(useConservationPoints).mockReturnValue({
      conservationPoints: [mockConservationPoint],
      isLoading: false,
      error: null,
      stats: {
        total_points: 1,
        by_status: {
          normal: 1,
          warning: 0,
          critical: 0,
        },
        by_type: {
          ambient: 0,
          fridge: 1,
          freezer: 0,
          blast: 0,
        },
        temperature_compliance_rate: 100,
        maintenance_compliance_rate: 100,
        alerts_count: 0,
      },
      createConservationPoint: vi.fn(),
      updateConservationPoint: vi.fn(),
      deleteConservationPoint: vi.fn(),
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })

    render(<ScheduledMaintenanceCard />)

    await waitFor(() => {
      expect(screen.getByText(/Manutenzioni Programmate/i)).toBeInTheDocument()
    })

    const pointCard = screen.getByText('Frigo Test')
    await userEvent.click(pointCard)

    await waitFor(() => {
      expect(screen.getByText(/Sanificazione/i)).toBeInTheDocument()
    })

    // Verifica che le manutenzioni siano ordinate per scadenza (più prossime prima)
    // La prima manutenzione visibile dovrebbe essere "Sanificazione" (scadenza: now)
    const maintenanceCards = screen.getAllByText(/Manutenzione|Sanificazione|Rilevamento|Sbrinamento/i)
    // Verifica che "Sanificazione" (scadenza più prossima) appaia prima di "Sbrinamento" (scadenza intermedia)
    const sanitizationIndex = maintenanceCards.findIndex(card => card.textContent?.includes('Sanificazione'))
    const defrostingIndex = maintenanceCards.findIndex(card => card.textContent?.includes('Sbrinamento'))
    
    expect(sanitizationIndex).toBeGreaterThan(-1)
    expect(defrostingIndex).toBeGreaterThan(-1)
    expect(sanitizationIndex).toBeLessThan(defrostingIndex) // Sanificazione prima di Sbrinamento
  })
})

describe('ScheduledMaintenanceCard - TASK 3.3: Raggruppa Manutenzioni per Tipo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should group maintenances by type and show only first per type', async () => {
    // RED: Test che fallisce - manutenzioni non raggruppate per tipo
    const { useMaintenanceTasks } = await import('@/features/conservation/hooks/useMaintenanceTasks')
    const { useConservationPoints } = await import('@/features/conservation/hooks/useConservationPoints')

    const now = new Date('2026-01-11')
    const later1 = new Date('2026-01-15')
    const later2 = new Date('2026-01-20')
    const later3 = new Date('2026-01-25')

    const mockMaintenanceTasks: MaintenanceTask[] = [
      {
        id: 'task-1',
        company_id: 'company-1',
        conservation_point_id: 'point-1',
        title: 'Rilevamento temperatura 1',
        type: 'temperature',
        frequency: 'daily',
        estimated_duration: 15,
        next_due: later2, // Scadenza più lontana
        priority: 'medium',
        status: 'scheduled',
        created_at: now,
        updated_at: now,
      },
      {
        id: 'task-2',
        company_id: 'company-1',
        conservation_point_id: 'point-1',
        title: 'Rilevamento temperatura 2',
        type: 'temperature',
        frequency: 'daily',
        estimated_duration: 15,
        next_due: later1, // Prima scadenza (dovrebbe essere visibile)
        priority: 'medium',
        status: 'scheduled',
        created_at: now,
        updated_at: now,
      },
      {
        id: 'task-3',
        company_id: 'company-1',
        conservation_point_id: 'point-1',
        title: 'Sanificazione 1',
        type: 'sanitization',
        frequency: 'weekly',
        estimated_duration: 30,
        next_due: later3, // Scadenza più lontana
        priority: 'high',
        status: 'scheduled',
        created_at: now,
        updated_at: now,
      },
      {
        id: 'task-4',
        company_id: 'company-1',
        conservation_point_id: 'point-1',
        title: 'Sanificazione 2',
        type: 'sanitization',
        frequency: 'weekly',
        estimated_duration: 30,
        next_due: later1, // Prima scadenza (dovrebbe essere visibile)
        priority: 'high',
        status: 'scheduled',
        created_at: now,
        updated_at: now,
      },
    ]

    const mockConservationPoint = {
      id: 'point-1',
      company_id: 'company-1',
      department_id: 'dept-1',
      name: 'Frigo Test',
      setpoint_temp: 4,
      type: 'fridge' as const,
      product_categories: [],
      status: 'normal' as const,
      is_blast_chiller: false,
      created_at: now,
      updated_at: now,
    }

    vi.mocked(useMaintenanceTasks).mockReturnValue({
      maintenanceTasks: mockMaintenanceTasks,
      isLoading: false,
      completeTask: mockCompleteTask,
      isCompleting: false,
      error: null,
      stats: {
        total_tasks: 4,
        completed_tasks: 0,
        overdue_tasks: 0,
        completion_rate: 0,
        tasks_by_type: {
          temperature: 1,
          sanitization: 1,
          defrosting: 2,
        },
        average_completion_time: 0,
        upcoming_tasks: [],
      },
      getTaskStatus: () => 'scheduled',
      createTask: vi.fn(),
      updateTask: vi.fn(),
      deleteTask: vi.fn(),
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })

    vi.mocked(useConservationPoints).mockReturnValue({
      conservationPoints: [mockConservationPoint],
      isLoading: false,
      error: null,
      stats: {
        total_points: 1,
        by_status: {
          normal: 1,
          warning: 0,
          critical: 0,
        },
        by_type: {
          ambient: 0,
          fridge: 1,
          freezer: 0,
          blast: 0,
        },
        temperature_compliance_rate: 100,
        maintenance_compliance_rate: 100,
        alerts_count: 0,
      },
      createConservationPoint: vi.fn(),
      updateConservationPoint: vi.fn(),
      deleteConservationPoint: vi.fn(),
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })

    render(<ScheduledMaintenanceCard />)

    await waitFor(() => {
      expect(screen.getByText(/Manutenzioni Programmate/i)).toBeInTheDocument()
    })

    const pointCard = screen.getByText('Frigo Test')
    await userEvent.click(pointCard)

    await waitFor(() => {
      // Verifica che almeno una manutenzione è visibile
      expect(screen.getAllByText(/Scadenza:/i).length).toBeGreaterThan(0)
    })

    // Verifica che solo la prima manutenzione per tipo è visibile
    // Conta le card di manutenzione (escludendo i pulsanti)
    const maintenanceCards = screen.getAllByText(/Scadenza:/i)
    
    // Dovrebbero essere visibili solo 2 card (una per tipo: temperature e sanitization)
    expect(maintenanceCards.length).toBe(2)
    
    // Verifica che entrambi i tipi sono rappresentati (usando getAllByText per gestire multipli)
    const temperatureElements = screen.getAllByText(/Rilevamento Temperature/i)
    expect(temperatureElements.length).toBeGreaterThan(0)
    
    const sanitizationElements = screen.getAllByText(/Sanificazione/i)
    expect(sanitizationElements.length).toBeGreaterThan(0)
    
    // Verifica che ci sono pulsanti per espandere (se ci sono più manutenzioni per tipo)
    const expandButtons = screen.queryAllByText(/Mostra altre.*manutenzioni/i)
    expect(expandButtons.length).toBeGreaterThan(0)
  })

  it('should show expand button and display next 2 maintenances when expanded', async () => {
    // RED: Test che fallisce - pulsante espansione non presente
    const { useMaintenanceTasks } = await import('@/features/conservation/hooks/useMaintenanceTasks')
    const { useConservationPoints } = await import('@/features/conservation/hooks/useConservationPoints')

    const now = new Date('2026-01-11')
    const later1 = new Date('2026-01-15')
    const later2 = new Date('2026-01-20')
    const later3 = new Date('2026-01-25')

    const mockMaintenanceTasks: MaintenanceTask[] = [
      {
        id: 'task-1',
        company_id: 'company-1',
        conservation_point_id: 'point-1',
        title: 'Rilevamento temperatura 1',
        type: 'temperature',
        frequency: 'daily',
        estimated_duration: 15,
        next_due: later1, // Prima (sempre visibile)
        priority: 'medium',
        status: 'scheduled',
        created_at: now,
        updated_at: now,
      },
      {
        id: 'task-2',
        company_id: 'company-1',
        conservation_point_id: 'point-1',
        title: 'Rilevamento temperatura 2',
        type: 'temperature',
        frequency: 'daily',
        estimated_duration: 15,
        next_due: later2, // Seconda (espandibile)
        priority: 'medium',
        status: 'scheduled',
        created_at: now,
        updated_at: now,
      },
      {
        id: 'task-3',
        company_id: 'company-1',
        conservation_point_id: 'point-1',
        title: 'Rilevamento temperatura 3',
        type: 'temperature',
        frequency: 'daily',
        estimated_duration: 15,
        next_due: later3, // Terza (espandibile)
        priority: 'medium',
        status: 'scheduled',
        created_at: now,
        updated_at: now,
      },
    ]

    const mockConservationPoint = {
      id: 'point-1',
      company_id: 'company-1',
      department_id: 'dept-1',
      name: 'Frigo Test',
      setpoint_temp: 4,
      type: 'fridge' as const,
      product_categories: [],
      status: 'normal' as const,
      is_blast_chiller: false,
      created_at: now,
      updated_at: now,
    }

    vi.mocked(useMaintenanceTasks).mockReturnValue({
      maintenanceTasks: mockMaintenanceTasks,
      isLoading: false,
      completeTask: mockCompleteTask,
      isCompleting: false,
      error: null,
      stats: {
        total_tasks: 3,
        completed_tasks: 0,
        overdue_tasks: 0,
        completion_rate: 0,
        tasks_by_type: {
          temperature: 1,
          sanitization: 1,
          defrosting: 1,
        },
        average_completion_time: 0,
        upcoming_tasks: [],
      },
      getTaskStatus: () => 'scheduled',
      createTask: vi.fn(),
      updateTask: vi.fn(),
      deleteTask: vi.fn(),
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })

    vi.mocked(useConservationPoints).mockReturnValue({
      conservationPoints: [mockConservationPoint],
      isLoading: false,
      error: null,
      stats: {
        total_points: 1,
        by_status: {
          normal: 1,
          warning: 0,
          critical: 0,
        },
        by_type: {
          ambient: 0,
          fridge: 1,
          freezer: 0,
          blast: 0,
        },
        temperature_compliance_rate: 100,
        maintenance_compliance_rate: 100,
        alerts_count: 0,
      },
      createConservationPoint: vi.fn(),
      updateConservationPoint: vi.fn(),
      deleteConservationPoint: vi.fn(),
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })

    render(<ScheduledMaintenanceCard />)

    await waitFor(() => {
      expect(screen.getByText(/Manutenzioni Programmate/i)).toBeInTheDocument()
    })

    const pointCard = screen.getByText('Frigo Test')
    await userEvent.click(pointCard)

    await waitFor(() => {
      // Verifica che almeno una manutenzione è visibile
      expect(screen.getAllByText(/Scadenza:/i).length).toBeGreaterThan(0)
    })

    // Verifica che inizialmente c'è solo 1 card di manutenzione visibile (la prima)
    const initialCards = screen.getAllByText(/Scadenza:/i)
    expect(initialCards.length).toBe(1) // Solo la prima

    // Verifica che pulsante espansione sia presente
    const expandButton = screen.getByText(/Mostra altre.*manutenzioni/i)
    expect(expandButton).toBeInTheDocument()

    // Clicca per espandere
    await userEvent.click(expandButton)

    // Verifica che ora sono visibili 3 manutenzioni (prima + 2 successive)
    await waitFor(() => {
      const expandedCards = screen.getAllByText(/Scadenza:/i)
      expect(expandedCards.length).toBe(3) // Prima + 2 successive
    })
  })
})
