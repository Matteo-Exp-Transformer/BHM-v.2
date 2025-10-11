import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-toastify'

export interface GenericTask {
  id: string
  company_id: string
  name: string
  description?: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'biannually' | 'annually' | 'annual' | 'as_needed' | 'custom'
  assigned_to: string // Ruolo o ID dipendente
  assigned_to_role?: string
  assigned_to_category?: string
  assigned_to_staff_id?: string
  assignment_type?: string // 'role' | 'staff' | 'category' (dall'onboarding)
  priority: 'low' | 'medium' | 'high' | 'critical'
  estimated_duration?: number // in minuti
  next_due?: Date
  status: string
  created_at: Date
  updated_at: Date
}

export interface CreateGenericTaskInput {
  name: string
  frequency: GenericTask['frequency']
  assigned_to_role: string
  assigned_to_category?: string
  assigned_to_staff_id?: string
  note?: string
  custom_days?: string[] // Giorni della settimana se frequenza custom
}

const QUERY_KEYS = {
  genericTasks: (companyId: string) => ['generic-tasks', companyId],
}

// Mappa frequenza IT → EN per il database (allineato con onboarding)
const mapFrequency = (frequenza: string): GenericTask['frequency'] => {
  const map: Record<string, GenericTask['frequency']> = {
    'giornaliera': 'daily',
    'settimanale': 'weekly',
    'mensile': 'monthly',
    'annuale': 'annually', // DB accetta entrambi annually e annual
    'custom': 'custom',
  }
  return map[frequenza] || 'weekly'
}

// Calcola next_due in base alla frequenza
const calculateNextDue = (frequency: string, customDays?: string[]): Date => {
  const now = new Date()
  
  switch (frequency) {
    case 'giornaliera':
      now.setDate(now.getDate() + 1)
      break
    case 'settimanale':
      now.setDate(now.getDate() + 7)
      break
    case 'mensile':
      now.setMonth(now.getMonth() + 1)
      break
    case 'annuale':
      now.setFullYear(now.getFullYear() + 1)
      break
    case 'custom':
      // Se custom, imposta al prossimo giorno selezionato
      if (customDays && customDays.length > 0) {
        // Logica semplificata: prossima settimana
        now.setDate(now.getDate() + 7)
      }
      break
    default:
      now.setDate(now.getDate() + 7)
  }
  
  return now
}

export const useGenericTasks = () => {
  const { user, companyId } = useAuth()
  const queryClient = useQueryClient()

  // Fetch generic tasks
  const {
    data: tasks = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.genericTasks(companyId || ''),
    queryFn: async (): Promise<GenericTask[]> => {
      if (!companyId) {
        console.warn('⚠️ No company_id available')
        return []
      }

      console.log('🔧 Loading generic tasks from Supabase for company:', companyId)

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching generic tasks:', error)
        throw error
      }

      console.log('✅ Loaded generic tasks from Supabase:', data?.length || 0)
      if (data && data.length > 0) {
        console.log('📋 Sample task:', data[0])
      }

      return (data || []).map(task => ({
        id: task.id,
        company_id: task.company_id,
        name: task.name,
        description: task.description,
        frequency: task.frequency,
        assigned_to: task.assigned_to,
        assigned_to_role: task.assigned_to_role,
        assigned_to_category: task.assigned_to_category,
        assigned_to_staff_id: task.assigned_to_staff_id,
        assignment_type: task.assignment_type, // Supporto per dati onboarding
        priority: task.priority || 'medium',
        estimated_duration: task.estimated_duration,
        next_due: task.next_due ? new Date(task.next_due) : undefined,
        status: task.status || 'pending',
        created_at: new Date(task.created_at),
        updated_at: new Date(task.updated_at),
      }))
    },
    enabled: !!companyId && !!user,
  })

  // Create generic task
  const createTaskMutation = useMutation({
    mutationFn: async (input: CreateGenericTaskInput) => {
      if (!companyId) throw new Error('No company ID available')

      const frequency = mapFrequency(input.frequency)
      const next_due = calculateNextDue(input.frequency, input.custom_days)

      // Payload allineato esattamente con schema onboarding (riga 998-1024 onboardingHelpers.ts)
      const payload: any = {
        company_id: companyId,
        name: input.name,
        frequency: frequency,
        assigned_to: input.assigned_to_staff_id && input.assigned_to_staff_id !== 'none'
          ? input.assigned_to_staff_id
          : input.assigned_to_role || '',
        assignment_type: input.assigned_to_staff_id && input.assigned_to_staff_id !== 'none' ? 'staff' : 'role',
      }

      // Campi opzionali - aggiungi solo se presenti
      if (input.note) payload.description = input.note
      if (input.assigned_to_staff_id && input.assigned_to_staff_id !== 'none') {
        payload.assigned_to_staff_id = input.assigned_to_staff_id
      }
      if (input.assigned_to_role) {
        payload.assigned_to_role = input.assigned_to_role
      }
      if (input.assigned_to_category && input.assigned_to_category !== 'all') {
        payload.assigned_to_category = input.assigned_to_category
      }
      if (next_due) payload.next_due = next_due.toISOString()

      // Creating task with payload

      const { data, error } = await supabase
        .from('tasks')
        .insert(payload)
        .select()
        .single()

      if (error) {
        console.error('❌ Error creating task:', error)
        console.error('❌ Failed payload:', payload)
        throw error
      }

      // Task created successfully
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.genericTasks(companyId || ''),
      })
      queryClient.invalidateQueries({
        queryKey: ['calendar-events', companyId],
      })
      toast.success('Attività creata con successo')
    },
    onError: (error: Error) => {
      console.error('Error creating task:', error)
      toast.error('Errore nella creazione dell\'attività')
    },
  })

  // Delete generic task
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      if (!companyId) throw new Error('No company ID available')

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('company_id', companyId)

      if (error) {
        console.error('Error deleting task:', error)
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.genericTasks(companyId || ''),
      })
      queryClient.invalidateQueries({
        queryKey: ['calendar-events', companyId],
      })
      toast.success('Attività eliminata')
    },
    onError: (error: Error) => {
      console.error('Error deleting task:', error)
      toast.error('Errore nell\'eliminazione dell\'attività')
    },
  })

  return {
    tasks,
    isLoading,
    error,
    refetch,
    createTask: createTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,
    isCreating: createTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
  }
}

