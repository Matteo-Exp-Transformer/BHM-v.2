import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import {
  MaintenanceTask,
  MaintenanceCompletion,
  // MaintenanceType,
  // MaintenanceFrequency,
  MAINTENANCE_TASK_TYPES,
} from '@/types/conservation'
import { toast } from 'react-toastify'

export function useMaintenanceTasks(conservationPointId?: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // MOCK DATA FOR TESTING - Remove when database works
  const mockTasks: MaintenanceTask[] = [
    {
      id: '1',
      company_id: 'test',
      conservation_point_id: '1',
      kind: 'temperature',
      frequency: 'daily',
      assigned_to: 'user1',
      assignment_type: 'user',
      next_due_date: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      estimated_duration: 15,
      checklist: MAINTENANCE_TASK_TYPES.temperature.defaultChecklist,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
      assigned_staff: {
        id: 'user1',
        name: 'Matteo Cavallaro',
        role: 'responsabile',
      },
    },
    {
      id: '2',
      company_id: 'test',
      conservation_point_id: '1',
      kind: 'sanitization',
      frequency: 'weekly',
      assigned_to: 'user2',
      assignment_type: 'user',
      next_due_date: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
      estimated_duration: 30,
      checklist: MAINTENANCE_TASK_TYPES.sanitization.defaultChecklist,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
      assigned_staff: {
        id: 'user2',
        name: 'Fabrizio Dettori',
        role: 'responsabile',
      },
    },
    {
      id: '3',
      company_id: 'test',
      conservation_point_id: '2',
      kind: 'defrosting',
      frequency: 'monthly',
      assigned_to: 'user1',
      assignment_type: 'user',
      next_due_date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago (overdue)
      estimated_duration: 45,
      checklist: MAINTENANCE_TASK_TYPES.defrosting.defaultChecklist,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
      assigned_staff: {
        id: 'user1',
        name: 'Matteo Cavallaro',
        role: 'responsabile',
      },
    },
    {
      id: '4',
      company_id: 'test',
      conservation_point_id: '3',
      kind: 'sanitization',
      frequency: 'daily',
      assigned_to: 'user3',
      assignment_type: 'user',
      next_due_date: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
      estimated_duration: 20,
      checklist: MAINTENANCE_TASK_TYPES.sanitization.defaultChecklist,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
      assigned_staff: {
        id: 'user3',
        name: 'Elena Guaitoli',
        role: 'dipendente',
      },
    },
  ]

  const {
    data: maintenanceTasks,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['maintenance-tasks', conservationPointId],
    queryFn: async () => {
      console.log('🔧 Using mock data for maintenance tasks')
      if (conservationPointId) {
        return mockTasks.filter(
          t => t.conservation_point_id === conservationPointId
        )
      }
      return mockTasks
    },
    enabled: true,
  })

  const createTaskMutation = useMutation({
    mutationFn: async (
      data: Omit<
        MaintenanceTask,
        'id' | 'company_id' | 'created_at' | 'updated_at'
      >
    ) => {
      if (!user?.company_id) throw new Error('No company ID available')

      const { data: result, error } = await supabase
        .from('maintenance_tasks')
        .insert([
          {
            ...data,
            company_id: user.company_id,
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
      if (!user?.company_id) throw new Error('No company ID available')

      const { data: result, error } = await supabase
        .from('maintenance_completions')
        .insert([
          {
            ...completion,
            company_id: user.company_id,
          },
        ])
        .select()
        .single()

      if (error) throw error
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
    const dueDate = new Date(task.next_due_date)

    if (dueDate < now) {
      return 'overdue'
    }

    const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (hoursUntilDue <= 2) {
      return 'pending'
    }

    return 'scheduled'
  }

  // Statistics
  const stats = {
    total: maintenanceTasks?.length || 0,
    overdue:
      maintenanceTasks?.filter(t => getTaskStatus(t) === 'overdue').length || 0,
    pending:
      maintenanceTasks?.filter(t => getTaskStatus(t) === 'pending').length || 0,
    scheduled:
      maintenanceTasks?.filter(t => getTaskStatus(t) === 'scheduled').length ||
      0,
    byType: {
      temperature:
        maintenanceTasks?.filter(t => t.kind === 'temperature').length || 0,
      sanitization:
        maintenanceTasks?.filter(t => t.kind === 'sanitization').length || 0,
      defrosting:
        maintenanceTasks?.filter(t => t.kind === 'defrosting').length || 0,
    },
    byFrequency: {
      daily: maintenanceTasks?.filter(t => t.frequency === 'daily').length || 0,
      weekly:
        maintenanceTasks?.filter(t => t.frequency === 'weekly').length || 0,
      monthly:
        maintenanceTasks?.filter(t => t.frequency === 'monthly').length || 0,
      custom:
        maintenanceTasks?.filter(t => t.frequency === 'custom').length || 0,
    },
  }

  return {
    maintenanceTasks: maintenanceTasks || [],
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
