import { supabase } from '../lib/supabase/client'
import type {
  ActivityType,
  EntityType,
  UserActivityLog,
  ActivityFilters,
  ActivityWithUser,
  ActivityStatistics,
  ActiveSessionInfo,
} from '../types/activity'

export const activityTrackingService = {
  async logActivity(
    userId: string,
    companyId: string,
    activityType: ActivityType,
    activityData: Record<string, any> = {},
    options?: {
      sessionId?: string
      entityType?: EntityType
      entityId?: string
      ipAddress?: string
      userAgent?: string
    }
  ): Promise<{ success: boolean; error?: string; activityId?: string }> {
    try {
      const { data, error } = await supabase.rpc('log_user_activity', {
        p_user_id: userId,
        p_company_id: companyId,
        p_session_id: options?.sessionId || null,
        p_activity_type: activityType,
        p_activity_data: activityData,
        p_entity_type: options?.entityType || null,
        p_entity_id: options?.entityId || null,
        p_ip_address: options?.ipAddress || null,
        p_user_agent: options?.userAgent || null,
      })

      if (error) {
        // RPC non presente in Supabase (es. schema non deployato): non bloccare l'app
        const isRpcNotFound = error.code === 'PGRST202' || (error.message?.includes('Could not find the function'))
        if (isRpcNotFound) {
          if (import.meta.env.DEV) {
            console.warn('Activity logging skipped: log_user_activity RPC not found in Supabase. Completamento mansione OK.')
          }
        } else {
          console.error('Error logging activity:', error)
        }
        return { success: false, error: error.message }
      }

      return { success: true, activityId: data }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      const isRpcNotFound = message.includes('404') || message.includes('log_user_activity') || message.includes('PGRST202')
      if (isRpcNotFound && import.meta.env.DEV) {
        console.warn('Activity logging skipped: RPC non disponibile. Completamento mansione OK.')
      } else {
        console.error('Exception logging activity:', err)
      }
      return { success: false, error: message }
    }
  },

  async startSession(
    userId: string,
    companyId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ success: boolean; error?: string; sessionId?: string }> {
    try {
      const { data: session, error: sessionError } = await supabase
        .from('user_sessions')
        .insert({
          user_id: userId,
          active_company_id: companyId,
          session_start: new Date().toISOString(),
          last_activity: new Date().toISOString(),
          is_active: true,
          ip_address: ipAddress,
          user_agent: userAgent,
        })
        .select('id')
        .single()

      if (sessionError) {
        console.error('Error creating session:', sessionError)
        return { success: false, error: sessionError.message }
      }

      const deviceType = userAgent?.toLowerCase().includes('mobile')
        ? 'mobile'
        : userAgent?.toLowerCase().includes('tablet')
        ? 'tablet'
        : 'desktop'

      await this.logActivity(userId, companyId, 'session_start', {
        login_method: 'email',
        device_type: deviceType,
      }, {
        sessionId: session.id,
        ipAddress,
        userAgent,
      })

      return { success: true, sessionId: session.id }
    } catch (err) {
      console.error('Exception starting session:', err)
      return { success: false, error: String(err) }
    }
  },

  async endSession(
    sessionId: string,
    logoutType: 'manual' | 'timeout' | 'auto' = 'manual'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.rpc('end_user_session', {
        p_session_id: sessionId,
        p_logout_type: logoutType,
      })

      if (error) {
        console.error('Error ending session:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (err) {
      console.error('Exception ending session:', err)
      return { success: false, error: String(err) }
    }
  },

  async updateLastActivity(sessionId: string): Promise<void> {
    try {
      await supabase
        .from('user_sessions')
        .update({ last_activity: new Date().toISOString() })
        .eq('id', sessionId)
    } catch (err) {
      console.error('Error updating last activity:', err)
    }
  },

  async getActiveSessions(companyId: string): Promise<{
    success: boolean
    data?: ActiveSessionInfo[]
    error?: string
  }> {
    try {
      const { data, error } = await supabase.rpc('get_active_sessions', {
        p_company_id: companyId,
      })

      if (error) {
        console.error('Error getting active sessions:', error)
        return { success: false, error: error.message }
      }

      return { success: true, data: data || [] }
    } catch (err) {
      console.error('Exception getting active sessions:', err)
      return { success: false, error: String(err) }
    }
  },

  async getUserActivities(
    userId: string,
    filters?: ActivityFilters
  ): Promise<{
    success: boolean
    data?: UserActivityLog[]
    error?: string
  }> {
    try {
      const { data, error } = await supabase.rpc('get_user_activities', {
        p_user_id: userId,
        p_activity_type: filters?.activity_type || null,
        p_start_date: filters?.start_date || null,
        p_end_date: filters?.end_date || null,
        p_limit: filters?.limit || 100,
        p_offset: filters?.offset || 0,
      })

      if (error) {
        console.error('Error getting user activities:', error)
        return { success: false, error: error.message }
      }

      return { success: true, data: data || [] }
    } catch (err) {
      console.error('Exception getting user activities:', err)
      return { success: false, error: String(err) }
    }
  },

  async getCompanyActivities(
    companyId: string,
    filters?: ActivityFilters
  ): Promise<{
    success: boolean
    data?: ActivityWithUser[]
    error?: string
  }> {
    try {
      const { data, error } = await supabase.rpc('get_company_activities', {
        p_company_id: companyId,
        p_activity_type: filters?.activity_type || null,
        p_user_id: filters?.user_id || null,
        p_start_date: filters?.start_date || null,
        p_end_date: filters?.end_date || null,
        p_limit: filters?.limit || 100,
        p_offset: filters?.offset || 0,
      })

      if (error) {
        console.error('Error getting company activities:', error)
        return { success: false, error: error.message }
      }

      return { success: true, data: data || [] }
    } catch (err) {
      console.error('Exception getting company activities:', err)
      return { success: false, error: String(err) }
    }
  },

  async getActivityStatistics(
    companyId: string,
    startDate?: string,
    endDate?: string
  ): Promise<{
    success: boolean
    data?: ActivityStatistics[]
    error?: string
  }> {
    try {
      const { data, error } = await supabase.rpc('get_activity_statistics', {
        p_company_id: companyId,
        p_start_date: startDate || null,
        p_end_date: endDate || null,
      })

      if (error) {
        console.error('Error getting activity statistics:', error)
        return { success: false, error: error.message }
      }

      return { success: true, data: data || [] }
    } catch (err) {
      console.error('Exception getting activity statistics:', err)
      return { success: false, error: String(err) }
    }
  },

  async cleanupInactiveSessions(inactivityMinutes: number = 30): Promise<{
    success: boolean
    affectedRows?: number
    error?: string
  }> {
    try {
      const { data, error } = await supabase.rpc('cleanup_inactive_sessions', {
        p_inactivity_minutes: inactivityMinutes,
      })

      if (error) {
        console.error('Error cleaning up inactive sessions:', error)
        return { success: false, error: error.message }
      }

      return { success: true, affectedRows: data }
    } catch (err) {
      console.error('Exception cleaning up inactive sessions:', err)
      return { success: false, error: String(err) }
    }
  },
}
