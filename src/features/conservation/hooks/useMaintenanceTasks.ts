import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import type {
  MaintenanceTask,
  MaintenanceCompletion,
  MaintenanceStats,
  MaintenanceFrequency,
} from '@/types/conservation'
// import { MAINTENANCE_TASK_TYPES } from '@/types/conservation'
import { toast } from 'react-toastify'
import { activityTrackingService } from '@/services/activityTrackingService'

/**
 * Determines the status of a maintenance task based on its due date.
 * @param nextDue - ISO string of the task's next due date
 * @returns 'overdue' if past due or due now, 'pending' if due within 2 hours, 'scheduled' otherwise
 */
export const getTaskStatus = (nextDue: string): 'overdue' | 'pending' | 'scheduled' => {
  const now = new Date()
  const dueDate = new Date(nextDue)

  // If due date is in the past or exactly now, it's overdue
  if (dueDate <= now) {
    return 'overdue'
  }

  const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60)

  // If due within 2 hours, it's pending
  if (hoursUntilDue <= 2) {
    return 'pending'
  }

  // Otherwise, it's scheduled
  return 'scheduled'
}

/**
 * Calculates the next due date for a maintenance task based on its frequency.
 * @param frequency - The frequency of the maintenance task
 * @param fromDate - The date to calculate from (typically the completion date)
 * @returns ISO string of the next due date
 */
export const calculateNextDue = (
  frequency: MaintenanceFrequency,
  fromDate: Date = new Date()
): string => {
  const next = new Date(fromDate)
  
  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1)
      break
    case 'weekly':
      next.setDate(next.getDate() + 7)
      break
    case 'monthly':
      next.setMonth(next.getMonth() + 1)
      break
    case 'quarterly':
      next.setMonth(next.getMonth() + 3)
      break
    case 'biannually':
      next.setMonth(next.getMonth() + 6)
      break
    case 'annually':
      next.setFullYear(next.getFullYear() + 1)
      break
    case 'as_needed':
    case 'custom':
      // For as_needed and custom, keep the same date (no automatic rescheduling)
      // The user will need to set the next due date manually
      break
    default:
      console.warn(`Unknown frequency: ${frequency}, using monthly as default`)
      next.setMonth(next.getMonth() + 1)
  }
  
  return next.toISOString()
}

export function useMaintenanceTasks(conservationPointId?: string) {
  const { user, companyId, sessionId } = useAuth()
  const queryClient = useQueryClient()

  const {
    data: maintenanceTasks,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['maintenance-tasks', companyId, conservationPointId],
    queryFn: async () => {
      if (!companyId) {
        console.warn('⚠️ No company_id available, cannot load maintenance tasks')
        return []
      }


      let query = supabase
        .from('maintenance_tasks')
        .select(`
          *,
          assignment_type,
          assigned_to_role,
          assigned_to_category,
          assigned_to_staff_id,
          conservation_point:conservation_points(
            id,
            name,
            department:departments(id, name)
          ),
          assigned_user:staff(id, name)
        `)
        .eq('company_id', companyId)

      if (conservationPointId) {
        query = query.eq('conservation_point_id', conservationPointId)
      }

      const { data, error } = await query.order('next_due', { ascending: true })

      if (error) {
        console.error('❌ Error loading maintenance tasks:', error)
        throw error
      }

      // Converti i dati dal DB al tipo MaintenanceTask, gestendo Date e null
      return (data || []).map((task: any) => ({
        ...task,
        next_due: task.next_due ? new Date(task.next_due) : new Date(),
        last_completed: task.last_completed ? new Date(task.last_completed) : undefined,
        completed_at: task.completed_at ? new Date(task.completed_at) : undefined,
        created_at: task.created_at ? new Date(task.created_at) : new Date(),
        updated_at: task.updated_at ? new Date(task.updated_at) : new Date(),
      })) as MaintenanceTask[]
    },
    enabled: !!companyId,
  })

  const createTaskMutation = useMutation({
    mutationFn: async (
      data: Omit<
        MaintenanceTask,
        'id' | 'company_id' | 'created_at' | 'updated_at'
      >
    ) => {
      if (!companyId) throw new Error('No company ID available')

      // Prepara payload con campi obbligatori del database
      const payload: any = {
        ...data,
        checklist: data.checklist ?? [],
        company_id: companyId,
        assigned_to: data.assigned_to || data.assigned_to_role || '',
        assignment_type: data.assigned_to_role ? 'role' : data.assigned_to ? 'staff' : 'role',
      }

      // Converti Date a string ISO per campi timestamp
      if (data.next_due) {
        payload.next_due = data.next_due instanceof Date 
          ? data.next_due.toISOString() 
          : data.next_due
      }
      if (data.last_completed) {
        payload.last_completed = data.last_completed instanceof Date
          ? data.last_completed.toISOString()
          : data.last_completed
      }
      if (data.completed_at) {
        payload.completed_at = data.completed_at instanceof Date
          ? data.completed_at.toISOString()
          : data.completed_at
      }

      const { data: result, error } = await supabase
        .from('maintenance_tasks')
        .insert([payload])
        .select()
        .single()

      if (error) throw error
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-tasks'] })
      toast.success('Task di manutenzione creato')
    },
    onError: error => {
      console.error('Error creating maintenance task:', error)
      toast.error('Errore nella creazione del task di manutenzione')
    },
  })

  const updateTaskMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: Partial<MaintenanceTask>
    }) => {
      // Converti Date a string ISO per campi timestamp
      const updatePayload: any = { ...data }
      
      if (data.next_due !== undefined) {
        updatePayload.next_due = data.next_due instanceof Date
          ? data.next_due.toISOString()
          : data.next_due
      }
      if (data.last_completed !== undefined) {
        updatePayload.last_completed = data.last_completed instanceof Date
          ? data.last_completed.toISOString()
          : data.last_completed
      }
      if (data.completed_at !== undefined) {
        updatePayload.completed_at = data.completed_at instanceof Date
          ? data.completed_at.toISOString()
          : data.completed_at
      }
      if (data.created_at !== undefined) {
        updatePayload.created_at = data.created_at instanceof Date
          ? data.created_at.toISOString()
          : data.created_at
      }
      if (data.updated_at !== undefined) {
        updatePayload.updated_at = data.updated_at instanceof Date
          ? data.updated_at.toISOString()
          : data.updated_at
      }

      const { data: result, error } = await supabase
        .from('maintenance_tasks')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-tasks'] })
      toast.success('Task di manutenzione aggiornato')
    },
    onError: error => {
      console.error('Error updating maintenance task:', error)
      toast.error("Errore nell'aggiornamento del task")
    },
  })

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('maintenance_tasks')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-tasks'] })
      toast.success('Task di manutenzione eliminato')
    },
    onError: error => {
      console.error('Error deleting maintenance task:', error)
      toast.error("Errore nell'eliminazione del task")
    },
  })

  const completeTaskMutation = useMutation({
    mutationFn: async (
      completion: Omit<MaintenanceCompletion, 'id' | 'company_id' | 'next_due' | 'created_at'>
    ) => {
      if (!companyId) throw new Error('No company ID available')
      if (!user?.id) throw new Error('User not authenticated')

      // 1. Recupera il task corrente dal database per avere dati freschi
      const { data: task, error: taskError } = await supabase
        .from('maintenance_tasks')
        .select('*')
        .eq('id', completion.maintenance_task_id)
        .single()

      if (taskError) throw taskError
      if (!task) throw new Error('Task not found')

      // 2. Calcola la nuova scadenza basata sulla frequenza
      const completedAt = completion.completed_at 
        ? new Date(completion.completed_at)
        : new Date()
      const nextDue = calculateNextDue(
        task.frequency as MaintenanceTask['frequency'],
        completedAt
      )

      // 3. Crea il record di completamento
      // Nota: La tabella usa completion_notes invece di notes, photos è jsonb, e next_due è stata aggiunta dalla migration 016
      const completionPayload: any = {
        maintenance_task_id: completion.maintenance_task_id,
        company_id: companyId,
        next_due: nextDue, // Colonna aggiunta dalla migration 016
        completed_by: completion.completed_by || user.id,
        completed_at: completedAt.toISOString(),
        completion_notes: completion.notes || null, // La tabella usa completion_notes invece di notes
        photos: Array.isArray(completion.photos) 
          ? completion.photos 
          : (completion.photos ? [completion.photos] : []), // photos è jsonb nella tabella
      }

      const { data: completionResult, error: completionError } = await supabase
        .from('maintenance_completions')
        .insert([completionPayload])
        .select()
        .single()

      if (completionError) throw completionError

      // 4. Aggiorna la task con nuova scadenza e last_completed
      // Solo se la frequenza non è 'as_needed' o 'custom' (che richiedono impostazione manuale)
      if (task.frequency !== 'as_needed' && task.frequency !== 'custom') {
        const { error: updateError } = await supabase
          .from('maintenance_tasks')
          .update({
            next_due: nextDue,
            last_completed: completedAt.toISOString(),
            completed_at: completedAt.toISOString(),
            completed_by: completion.completed_by || user.id,
          })
          .eq('id', completion.maintenance_task_id)

        if (updateError) throw updateError
      } else {
        // Per as_needed e custom, aggiorniamo solo last_completed
        const { error: updateError } = await supabase
          .from('maintenance_tasks')
          .update({
            last_completed: completedAt.toISOString(),
            completed_at: completedAt.toISOString(),
            completed_by: completion.completed_by || user.id,
          })
          .eq('id', completion.maintenance_task_id)

        if (updateError) throw updateError
      }

      // 5. Log activity
      if (user.id && companyId) {
        await activityTrackingService.logActivity(
          user.id,
          companyId,
          'task_completed',
          {
            task_id: completion.maintenance_task_id,
            task_type: task.type,
            task_name: task.title,
            conservation_point_id: task.conservation_point_id,
            completed_by: completion.completed_by || user.id,
            completion_notes: completion.notes,
            next_due: nextDue,
          },
          {
            sessionId: sessionId || undefined,
            entityType: 'maintenance_task',
            entityId: completion.maintenance_task_id,
          }
        )
      }

      return completionResult
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-tasks'] })
      queryClient.invalidateQueries({ queryKey: ['maintenance-completions'] })
      toast.success('Manutenzione completata')
    },
    onError: error => {
      console.error('Error completing maintenance:', error)
      toast.error('Errore nel completamento della manutenzione')
    },
  })

  // Helper function to determine task status (internal use with full task object)
  const getTaskStatusInternal = (task: MaintenanceTask) => {
    if (!task.next_due) {
      return 'scheduled' as const // Se non c'è next_due, consideriamo scheduled
    }
    
    const nextDueString = task.next_due instanceof Date 
      ? task.next_due.toISOString() 
      : typeof task.next_due === 'string'
      ? task.next_due
      : String(task.next_due)
    return getTaskStatus(nextDueString)
  }

  const tasks = (maintenanceTasks ?? []) as MaintenanceTask[]

  const stats: MaintenanceStats = {
    total_tasks: tasks.length,
    completed_tasks: tasks.filter(task => task.status === 'completed').length,
    overdue_tasks: tasks.filter(task => getTaskStatusInternal(task) === 'overdue')
      .length,
    completion_rate: tasks.length
      ? (tasks.filter(task => task.status === 'completed').length /
          tasks.length) *
        100
      : 0,
    average_completion_time: 0,
    tasks_by_type: tasks.reduce<MaintenanceStats['tasks_by_type']>(
      (acc, task) => {
        acc[task.type] = (acc[task.type] ?? 0) + 1
        return acc
      },
      {} as MaintenanceStats['tasks_by_type']
    ),
    upcoming_tasks: tasks
      .filter(task => getTaskStatusInternal(task) !== 'overdue')
      .sort(
        (a, b) =>
          new Date(a.next_due).getTime() - new Date(b.next_due).getTime()
      )
      .slice(0, 5),
  }

  return {
    maintenanceTasks: tasks,
    isLoading,
    error,
    stats,
    getTaskStatus: getTaskStatusInternal,
    createTask: createTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,
    completeTask: completeTaskMutation.mutate,
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
    isCompleting: completeTaskMutation.isPending,
  }
}
