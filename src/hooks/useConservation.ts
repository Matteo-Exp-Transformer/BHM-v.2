import { useState, useCallback, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useOfflineSync } from './useOfflineSync'
import { useOfflineStorage, OFFLINE_STORES } from './useOfflineStorage'
import { useNetworkStatus } from './useNetworkStatus'
import type {
  ConservationPoint,
  TemperatureReading,
  MaintenanceTask,
  MaintenanceCompletion,
  CreateConservationPointRequest,
  UpdateConservationPointRequest,
  CreateTemperatureReadingRequest,
  CreateMaintenanceTaskRequest,
  CreateMaintenanceCompletionRequest,
  ConservationPointsFilter,
  TemperatureReadingsFilter,
  MaintenanceTasksFilter,
  ConservationStats,
} from '@/types/conservation'

interface UseConservationOptions {
  autoRefresh?: boolean
  refreshInterval?: number
}

export function useConservation(options: UseConservationOptions = {}) {
  const { autoRefresh = true, refreshInterval = 30000 } = options
  const queryClient = useQueryClient()

  // Offline functionality
  const { queueOperation } = useOfflineSync()
  const { store, getAll } = useOfflineStorage()
  const { isOnline } = useNetworkStatus()

  const [conservationFilter] = useState<ConservationPointsFilter>({})
  const [temperatureFilter, setTemperatureFilter] =
    useState<TemperatureReadingsFilter>({})
  const [maintenanceFilter, setMaintenanceFilter] =
    useState<MaintenanceTasksFilter>({})

  // Conservation Points Query
  const {
    data: conservationPoints = [],
    isLoading: loadingPoints,
    error: pointsError,
    refetch: refetchPoints,
  } = useQuery({
    queryKey: ['conservation-points', conservationFilter],
    queryFn: async (): Promise<ConservationPoint[]> => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      let query = supabase
        .from('conservation_points')
        .select(
          `
          *,
          department:departments(*),
          temperature_readings:temperature_readings(
            *,
            recorded_by_user:user_profiles(id, name)
          ),
          maintenance_tasks:maintenance_tasks(
            *,
            assigned_user:staff(id, name),
            completions:maintenance_completions(*)
          )
        `
        )
        .order('created_at', { ascending: false })

      // Apply filters
      if (conservationFilter.type && conservationFilter.type.length > 0) {
        query = query.in('type', conservationFilter.type)
      }
      if (conservationFilter.status && conservationFilter.status.length > 0) {
        query = query.in('status', conservationFilter.status)
      }
      if (conservationFilter.department_id) {
        query = query.eq('department_id', conservationFilter.department_id)
      }
      if (conservationFilter.has_maintenance_due) {
        query = query.not('maintenance_due', 'is', null)
      }

      const { data, error } = await query
      if (error) throw error

      return (
        data?.map((point: any) => ({
          ...point,
          created_at: new Date(point.created_at),
          updated_at: new Date(point.updated_at),
          maintenance_due: point.maintenance_due
            ? new Date(point.maintenance_due)
            : undefined,
          temperature_readings: point.temperature_readings?.map(
            (reading: any) => ({
              ...reading,
              recorded_at: new Date(reading.recorded_at),
              created_at: new Date(reading.created_at),
            })
          ),
          maintenance_tasks: point.maintenance_tasks?.map((task: any) => ({
            ...task,
            next_due: new Date(task.next_due),
            created_at: new Date(task.created_at),
            updated_at: new Date(task.updated_at),
          })),
        })) || []
      )
    },
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 10000,
  })

  // Temperature Readings Query
  const {
    data: temperatureReadings = [],
    isLoading: loadingReadings,
    error: readingsError,
    refetch: refetchReadings,
  } = useQuery({
    queryKey: ['temperature-readings', temperatureFilter],
    queryFn: async (): Promise<TemperatureReading[]> => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      let query = supabase
        .from('temperature_readings')
        .select(
          `
          *,
          conservation_point:conservation_points(*),
          recorded_by_user:user_profiles(id, name)
        `
        )
        .order('recorded_at', { ascending: false })

      // Apply filters
      if (temperatureFilter.conservation_point_id) {
        query = query.eq(
          'conservation_point_id',
          temperatureFilter.conservation_point_id
        )
      }
      if (temperatureFilter.status && temperatureFilter.status.length > 0) {
        query = query.in('status', temperatureFilter.status)
      }
      if (temperatureFilter.method) {
        query = query.eq('method', temperatureFilter.method)
      }
      if (temperatureFilter.date_from) {
        query = query.gte(
          'recorded_at',
          temperatureFilter.date_from.toISOString()
        )
      }
      if (temperatureFilter.date_to) {
        query = query.lte(
          'recorded_at',
          temperatureFilter.date_to.toISOString()
        )
      }
      if (temperatureFilter.recorded_by) {
        query = query.eq('recorded_by', temperatureFilter.recorded_by)
      }

      const { data, error } = await query
      if (error) throw error

      return (
        data?.map((reading: any) => ({
          ...reading,
          recorded_at: new Date(reading.recorded_at),
          created_at: new Date(reading.created_at),
        })) || []
      )
    },
    refetchInterval: autoRefresh ? refreshInterval : false,
    enabled:
      !!temperatureFilter.conservation_point_id ||
      Object.keys(temperatureFilter).length > 0,
  })

  // Maintenance Tasks Query
  const {
    data: maintenanceTasks = [],
    isLoading: loadingMaintenance,
    error: maintenanceError,
    refetch: refetchMaintenance,
  } = useQuery({
    queryKey: ['maintenance-tasks', maintenanceFilter],
    queryFn: async (): Promise<MaintenanceTask[]> => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      let query = supabase
        .from('maintenance_tasks')
        .select(
          `
          *,
          conservation_point:conservation_points(*),
          assigned_user:staff(id, name)
        `
        )
        .order('next_due', { ascending: true })

      // Apply filters
      if (maintenanceFilter.conservation_point_id) {
        query = query.eq(
          'conservation_point_id',
          maintenanceFilter.conservation_point_id
        )
      }
      if (maintenanceFilter.type) {
        query = query.eq('type', maintenanceFilter.type)
      }
      if (maintenanceFilter.frequency) {
        query = query.eq('frequency', maintenanceFilter.frequency)
      }
      if (maintenanceFilter.assigned_to) {
        query = query.eq('assigned_to', maintenanceFilter.assigned_to)
      }
      if (maintenanceFilter.status) {
        query = query.eq('status', maintenanceFilter.status)
      }
      if (maintenanceFilter.priority) {
        query = query.eq('priority', maintenanceFilter.priority)
      }

      const { data, error } = await query
      if (error) throw error

      return (
        data?.map((task: any) => ({
          ...task,
          next_due: new Date(task.next_due),
          created_at: new Date(task.created_at),
          updated_at: new Date(task.updated_at),
        })) || []
      )
    },
    refetchInterval: autoRefresh ? refreshInterval : false,
  })

  // Statistics
  const conservationStats = useMemo((): ConservationStats => {
    const total_points = conservationPoints.length

    const by_type = conservationPoints.reduce(
      (acc, point) => {
        acc[point.type] = (acc[point.type] || 0) + 1
        return acc
      },
      {} as Record<ConservationPoint['type'], number>
    )

    const by_status = conservationPoints.reduce(
      (acc, point) => {
        acc[point.status] = (acc[point.status] || 0) + 1
        return acc
      },
      {} as Record<ConservationPoint['status'], number>
    )

    const totalReadings = temperatureReadings.length
    const compliantReadings = temperatureReadings.filter(
      r => r.status === 'compliant'
    ).length
    const temperature_compliance_rate =
      totalReadings > 0 ? (compliantReadings / totalReadings) * 100 : 0

    const totalTasks = maintenanceTasks.length
    const completedTasks = maintenanceTasks.filter(
      task => task.status === 'completed'
    ).length
    const maintenance_compliance_rate =
      totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

    const alerts_count =
      conservationPoints.filter(p => p.status !== 'normal').length +
      temperatureReadings.filter(r => r.status === 'critical').length +
      maintenanceTasks.filter(task => {
        if (!task.next_due) return false
        const nextDueDate =
          task.next_due instanceof Date
            ? task.next_due
            : new Date(task.next_due)
        return !Number.isNaN(nextDueDate.getTime()) && nextDueDate < new Date()
      }).length

    return {
      total_points,
      by_type,
      by_status,
      temperature_compliance_rate,
      maintenance_compliance_rate,
      alerts_count,
    }
  }, [conservationPoints, temperatureReadings, maintenanceTasks])

  // Mutations
  const createConservationPointMutation = useMutation({
    mutationFn: async (
      data: CreateConservationPointRequest
    ): Promise<ConservationPoint> => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: result, error } = await supabase
        .from('conservation_points')
        .insert({
          ...data,
          product_categories: data.product_categories || [],
        })
        .select()
        .single()

      if (error) throw error
      return {
        ...result,
        created_at: new Date(result.created_at),
        updated_at: new Date(result.updated_at),
        maintenance_due: result.maintenance_due
          ? new Date(result.maintenance_due)
          : undefined,
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conservation-points'] })
    },
  })

  const updateConservationPointMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: UpdateConservationPointRequest
    }): Promise<ConservationPoint> => {
      const { data: result, error } = await supabase
        .from('conservation_points')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return {
        ...result,
        created_at: new Date(result.created_at),
        updated_at: new Date(result.updated_at),
        maintenance_due: result.maintenance_due
          ? new Date(result.maintenance_due)
          : undefined,
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conservation-points'] })
    },
  })

  const deleteConservationPointMutation = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('conservation_points')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conservation-points'] })
    },
  })

  const createTemperatureReadingMutation = useMutation({
    mutationFn: async (
      data: CreateTemperatureReadingRequest
    ): Promise<TemperatureReading> => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Try to get conservation point (online) or from cache (offline)
      let conservationPoint

      try {
        if (isOnline) {
          const { data: cp } = await supabase
            .from('conservation_points')
            .select('setpoint_temp, type')
            .eq('id', data.conservation_point_id)
            .single()
          conservationPoint = cp
        } else {
          // Get from offline storage
          const points = await getAll(OFFLINE_STORES.CONSERVATION_POINTS)
          conservationPoint = points.find(
            (p: any) => p.id === data.conservation_point_id
          )
        }
      } catch (error) {
        // Fallback to offline storage if online fails
        if (isOnline) {
          const points = await getAll(OFFLINE_STORES.CONSERVATION_POINTS)
          conservationPoint = points.find(
            (p: any) => p.id === data.conservation_point_id
          )
        }
      }

      const tolerance = getToleranceRange(conservationPoint?.type || 'fridge')

      const reading_data = {
        ...data,
        id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        company_id: 'temp-company',
        status: determineTemperatureStatus(
          data.temperature,
          (conservationPoint?.setpoint_temp ?? data.temperature) - tolerance,
          (conservationPoint?.setpoint_temp ?? data.temperature) + tolerance
        ),
        recorded_by: 'temp-user',
        validation_status: 'pending' as const,
        recorded_at: new Date(),
        created_at: new Date(),
      }

      if (isOnline) {
        // Online: save to Supabase
        try {
          const { data: result, error } = await supabase
            .from('temperature_readings')
            .insert(reading_data)
            .select()
            .single()

          if (error) throw error

          const processedResult = {
            ...result,
            recorded_at: new Date(result.recorded_at),
            created_at: new Date(result.created_at),
          }

          // Also store in offline cache
          await store(OFFLINE_STORES.TEMPERATURE_READINGS, processedResult)

          return processedResult
        } catch (error) {
          // If online save fails, queue for offline sync
          await queueOperation('CREATE', 'temperature-reading', reading_data)
          await store(OFFLINE_STORES.TEMPERATURE_READINGS, reading_data)
          return reading_data
        }
      } else {
        // Offline: store locally and queue for sync
        await queueOperation('CREATE', 'temperature-reading', reading_data)
        await store(OFFLINE_STORES.TEMPERATURE_READINGS, reading_data)
        return reading_data
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['temperature-readings'] })
      queryClient.invalidateQueries({ queryKey: ['conservation-points'] })
    },
  })

  const createMaintenanceTaskMutation = useMutation({
    mutationFn: async (
      data: CreateMaintenanceTaskRequest
    ): Promise<MaintenanceTask> => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: result, error } = await supabase
        .from('maintenance_tasks')
        .insert({
          conservation_point_id: data.conservation_point_id,
          title: data.name,
          description: data.description,
          type: data.type,
          frequency: data.frequency,
          estimated_duration: data.estimated_duration,
          next_due: data.next_due.toISOString(),
          assigned_to: data.assigned_to,
          priority: data.priority,
          checklist: data.instructions,
          company_id: user.company_id,
          status: 'scheduled',
        })
        .select()
        .single()

      if (error) throw error
      return {
        ...result,
        next_due: new Date(result.next_due),
        created_at: new Date(result.created_at),
        updated_at: new Date(result.updated_at),
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-tasks'] })
    },
  })

  const createMaintenanceCompletionMutation = useMutation({
    mutationFn: async (
      data: CreateMaintenanceCompletionRequest
    ): Promise<MaintenanceCompletion> => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: result, error } = await supabase
        .from('maintenance_completions')
        .insert({
          maintenance_task_id: data.maintenance_task_id,
          notes: data.notes,
          photos: data.photos,
          next_due: data.next_due?.toISOString(),
          company_id: user.company_id,
          completed_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      return {
        ...result,
        completed_at: new Date(result.completed_at),
        next_due: result.next_due ? new Date(result.next_due) : undefined,
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-tasks'] })
      queryClient.invalidateQueries({ queryKey: ['conservation-points'] })
    },
  })

  // Helper functions
  const getToleranceRange = (type: ConservationPoint['type']): number => {
    switch (type) {
      case 'freezer':
        return 3
      case 'fridge':
        return 2
      case 'blast':
        return 1
      case 'ambient':
        return 5
      default:
        return 2
    }
  }

  const determineTemperatureStatus = (
    temperature: number,
    min: number,
    max: number
  ): TemperatureReading['status'] => {
    if (temperature < min) return 'critical'
    if (temperature > max) return 'critical'
    if (temperature === min || temperature === max) return 'warning'
    return 'compliant'
  }

  const updateFilters = useCallback((filterType: string, filter: any) => {
    switch (filterType) {
      case 'temperature':
        setTemperatureFilter(filter)
        break
      case 'maintenance':
        setMaintenanceFilter(filter)
        break
    }
  }, [])

  return {
    // Data
    conservationPoints,
    temperatureReadings,
    maintenanceTasks,
    conservationStats,

    // Loading states
    loading: {
      points: loadingPoints,
      readings: loadingReadings,
      maintenance: loadingMaintenance,
    },

    // Errors
    errors: {
      points: pointsError,
      readings: readingsError,
      maintenance: maintenanceError,
    },

    // Filters
    filters: {
      conservation: conservationFilter,
      temperature: temperatureFilter,
      maintenance: maintenanceFilter,
    },
    updateFilters,

    // Mutations
    createConservationPoint: createConservationPointMutation.mutate,
    updateConservationPoint: updateConservationPointMutation.mutate,
    deleteConservationPoint: deleteConservationPointMutation.mutate,
    createTemperatureReading: createTemperatureReadingMutation.mutate,
    createMaintenanceTask: createMaintenanceTaskMutation.mutate,
    createMaintenanceCompletion: createMaintenanceCompletionMutation.mutate,

    // Mutation states
    creating: {
      point: createConservationPointMutation.isPending,
      reading: createTemperatureReadingMutation.isPending,
      task: createMaintenanceTaskMutation.isPending,
      completion: createMaintenanceCompletionMutation.isPending,
    },
    updating: updateConservationPointMutation.isPending,
    deleting: deleteConservationPointMutation.isPending,

    // Refetch functions
    refetch: {
      points: refetchPoints,
      readings: refetchReadings,
      maintenance: refetchMaintenance,
      all: () => {
        refetchPoints()
        refetchReadings()
        refetchMaintenance()
      },
    },
  }
}
