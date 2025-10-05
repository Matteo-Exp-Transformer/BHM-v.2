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

export function useMaintenanceTasks(conservationPointId?: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // MOCK DATA FOR TESTING - Remove when database works
  const mockTasks: MaintenanceTask[] = [
    {
      id: '1',
      company_id: 'test',
      conservation_point_id: '1',
      title: 'Calibrazione Termometro',
      type: 'temperature_calibration',
      frequency: 'daily',
      assigned_to: 'user1',
      next_due: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      estimated_duration: 15,
      priority: 'high',
      status: 'scheduled',
      checklist: [
        ...MAINTENANCE_TASK_TYPES.temperature_calibration.defaultChecklist,
      ],
      created_at: new Date(),
      updated_at: new Date(),
      assigned_user: {
        id: 'user1',
        name: 'Matteo Cavallaro',
      },
    },
    {
      id: '2',
      company_id: 'test',
      conservation_point_id: '1',
      title: 'Pulizia Profonda',
      type: 'deep_cleaning',
      frequency: 'weekly',
      assigned_to: 'user2',
      next_due: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
      estimated_duration: 30,
      priority: 'medium',
      status: 'scheduled',
      checklist: [...MAINTENANCE_TASK_TYPES.deep_cleaning.defaultChecklist],
      created_at: new Date(),
      updated_at: new Date(),
      assigned_user: {
        id: 'user2',
        name: 'Fabrizio Dettori',
      },
    },
    {
      id: '3',
      company_id: 'test',
      conservation_point_id: '2',
      title: 'Sbrinamento',
      type: 'defrosting',
      frequency: 'monthly',
      assigned_to: 'user1',
      next_due: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago (overdue)
      estimated_duration: 45,
      priority: 'high',
      status: 'overdue',
      checklist: [...MAINTENANCE_TASK_TYPES.defrosting.defaultChecklist],
      created_at: new Date(),
      updated_at: new Date(),
      assigned_user: {
        id: 'user1',
        name: 'Matteo Cavallaro',
      },
    },
    {
      id: '4',
      company_id: 'test',
      conservation_point_id: '3',
      title: 'Pulizia Profonda',
      type: 'deep_cleaning',
      frequency: 'daily',
      assigned_to: 'user3',
      next_due: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
      estimated_duration: 20,
      priority: 'medium',
      status: 'scheduled',
      checklist: [...MAINTENANCE_TASK_TYPES.deep_cleaning.defaultChecklist],
      created_at: new Date(),
      updated_at: new Date(),
      assigned_user: {
        id: 'user3',
        name: 'Elena Guaitoli',
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
          task => task.conservation_point_id === conservationPointId
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
            checklist: data.checklist ?? [],
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
