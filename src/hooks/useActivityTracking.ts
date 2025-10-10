import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { activityTrackingService } from '../services/activityTrackingService'
import type {
  ActivityType,
  EntityType,
  ActivityFilters,
} from '../types/activity'
import { useAuth } from './useAuth'

export function useActivityTracking() {
  const { user, companyId } = useAuth()

  const logActivity = async (
    activityType: ActivityType,
    activityData: Record<string, any> = {},
    options?: {
      sessionId?: string
      entityType?: EntityType
      entityId?: string
    }
  ) => {
    if (!user?.id || !companyId) {
      console.warn('Cannot log activity: user or company not found')
      return { success: false, error: 'User or company not found' }
    }

    return activityTrackingService.logActivity(
      user.id,
      companyId,
      activityType,
      activityData,
      options
    )
  }

  return {
    logActivity,
  }
}

export function useActiveSessions() {
  const { companyId } = useAuth()

  return useQuery({
    queryKey: ['active-sessions', companyId],
    queryFn: async () => {
      if (!companyId) throw new Error('Company ID not found')
      const result = await activityTrackingService.getActiveSessions(companyId)
      if (!result.success) throw new Error(result.error)
      return result.data || []
    },
    enabled: !!companyId,
    refetchInterval: 30000,
  })
}

export function useUserActivities(filters?: ActivityFilters) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['user-activities', user?.id, filters],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not found')
      const result = await activityTrackingService.getUserActivities(
        user.id,
        filters
      )
      if (!result.success) throw new Error(result.error)
      return result.data || []
    },
    enabled: !!user?.id,
  })
}

export function useCompanyActivities(filters?: ActivityFilters) {
  const { companyId } = useAuth()

  return useQuery({
    queryKey: ['company-activities', companyId, filters],
    queryFn: async () => {
      if (!companyId) throw new Error('Company ID not found')
      const result = await activityTrackingService.getCompanyActivities(
        companyId,
        filters
      )
      if (!result.success) throw new Error(result.error)
      return result.data || []
    },
    enabled: !!companyId,
  })
}

export function useActivityStatistics(startDate?: string, endDate?: string) {
  const { companyId } = useAuth()

  return useQuery({
    queryKey: ['activity-statistics', companyId, startDate, endDate],
    queryFn: async () => {
      if (!companyId) throw new Error('Company ID not found')
      const result = await activityTrackingService.getActivityStatistics(
        companyId,
        startDate,
        endDate
      )
      if (!result.success) throw new Error(result.error)
      return result.data || []
    },
    enabled: !!companyId,
  })
}

export function useCleanupInactiveSessions() {
  const queryClient = useQueryClient()
  const { companyId } = useAuth()

  return useMutation({
    mutationFn: async (inactivityMinutes: number = 30) => {
      const result = await activityTrackingService.cleanupInactiveSessions(
        inactivityMinutes
      )
      if (!result.success) throw new Error(result.error)
      return result.affectedRows
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-sessions', companyId] })
    },
  })
}
