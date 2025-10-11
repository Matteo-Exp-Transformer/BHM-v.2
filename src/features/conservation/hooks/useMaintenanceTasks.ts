import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import type {
  MaintenanceTask,
  MaintenanceCompletion,
  MaintenanceStats,
} from '@/types/conservation'
import { MAINTENANCE_TASK_TYPES } from '@/types/conservation'
import { toast } from 'react-toastify'
import { activityTrackingService } from '@/services/activityTrackingService'

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

      console.log('🔧 Loading maintenance tasks from Supabase for company:', companyId)

      let query = supabase
        .from('maintenance_tasks')
        .select(`
          *,
          conservation_point:conservation_points(id, name),
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

      console.log('✅ Loaded maintenance tasks from Supabase:', data?.length || 0)
      return data || []
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

      const { data: result, error } = await supabase
        .from('maintenance_tasks')
        .insert([
          {
            ...data,
            checklist: data.checklist ?? [],
            company_id: companyId,
          },
        ])
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
      const { data: result, error } = await supabase
        .from('maintenance_tasks')
        .update(data)
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
      completion: Omit<MaintenanceCompletion, 'id' | 'company_id'>
    ) => {
      if (!companyId) throw new Error('No company ID available')

      const { data: result, error } = await supabase
        .from('maintenance_completions')
        .insert([
          {
            ...completion,
            company_id: companyId,
          },
        ])
        .select()
        .single()

      if (error) throw error

      const task = maintenanceTasks?.find((t: MaintenanceTask) => t.id === completion.maintenance_task_id)
      if (user?.id && companyId && task) {
        await activityTrackingService.logActivity(
          user.id,
          companyId,
          'task_completed',
          {
            task_id: completion.maintenance_task_id,
            task_type: task.type,
            task_name: task.title,
            conservation_point_id: task.conservation_point_id,
            completed_by: completion.completed_by,
            completion_notes: completion.notes,
          },
          {
            sessionId: sessionId || undefined,
            entityType: 'maintenance_task',
            entityId: completion.maintenance_task_id,
          }
        )
      }

      return result
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

  // Helper function to determine task status
  const getTaskStatus = (task: MaintenanceTask) => {
    const now = new Date()
    const dueDate = new Date(task.next_due)

    if (dueDate < now) {
      return 'overdue'
    }

    const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (hoursUntilDue <= 2) {
      return 'pending'
    }

    return 'scheduled'
  }

  const tasks = (maintenanceTasks ?? []) as MaintenanceTask[]

  const stats: MaintenanceStats = {
    total_tasks: tasks.length,
    completed_tasks: tasks.filter(task => task.status === 'completed').length,
    overdue_tasks: tasks.filter(task => getTaskStatus(task) === 'overdue')
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
      .filter(task => getTaskStatus(task) !== 'overdue')
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
    getTaskStatus,
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
