/**
 * React Hook for Real-time Connection Management
 * Provides real-time data subscriptions and presence features
 */

import { useEffect, useState, useCallback, useRef } from 'react'
import { useAuth } from './useAuth'
import {
  realtimeManager,
  type ConnectionStatus,
  type PresenceState,
  type TableName,
  type RealtimeEvent,
} from '@/services/realtime/RealtimeConnectionManager'
import type {
  RealtimePostgresInsertPayload,
  RealtimePostgresChangesPayload,
} from '@supabase/supabase-js'

interface UseRealtimeOptions {
  autoConnect?: boolean
  trackPresence?: boolean
  activityTracking?: boolean
}

export interface RealtimeHookReturn {
  isConnected: boolean
  isReconnecting: boolean
  connectionError?: string
  connect: () => Promise<void>
  disconnect: () => void
  subscribe: (
    table: TableName,
    event: RealtimeEvent | '*',
    callback: (payload: unknown) => void,
    filter?: string
  ) => string
  unsubscribe: (subscriptionId: string) => void
  onlineUsers: PresenceState[]
  updateActivity: (
    status: PresenceState['activity_status'],
    currentPage?: string
  ) => Promise<void>
  connectionStatus: ConnectionStatus
  lastConnected?: Date
  connectionAttempts: number
}

export function useRealtime(
  options: UseRealtimeOptions = {}
): RealtimeHookReturn {
  const {
    autoConnect = true,
    trackPresence = true,
    activityTracking = true,
  } = options

  const { user, companyId } = useAuth()

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    reconnecting: false,
    connectionAttempts: 0,
  })
  const [onlineUsers, setOnlineUsers] = useState<PresenceState[]>([])

  const lastActivityRef = useRef<Date>(new Date())
  const activityTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimers = useCallback(() => {
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current)
      activityTimeoutRef.current = null
    }
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current)
      idleTimeoutRef.current = null
    }
  }, [])

  const updateActivity = useCallback(
    async (status: PresenceState['activity_status'], currentPage?: string) => {
      lastActivityRef.current = new Date()
      await realtimeManager.updateActivity(status, currentPage)
    },
    []
  )

  const connect = useCallback(async () => {
    if (!user || !companyId) {
      console.warn('Cannot connect to real-time: user or company not available')
      return
    }

    const email = user.email || ''

    try {
      await realtimeManager.connect(companyId, user.id, email)
    } catch (error) {
      console.error('Failed to connect to real-time services:', error)
    }
  }, [companyId, user])

  const disconnect = useCallback(() => {
    realtimeManager.disconnect()
    clearTimers()
  }, [clearTimers])

  const subscribe = useCallback(
    (
      table: TableName,
      event: RealtimeEvent | '*',
      callback: (payload: unknown) => void,
      filter?: string
    ) =>
      realtimeManager.subscribe({
        table,
        event,
        callback,
        filter,
      }),
    []
  )

  const unsubscribe = useCallback((subscriptionId: string) => {
    realtimeManager.unsubscribe(subscriptionId)
  }, [])

  const setupActivityTracking = useCallback(() => {
    if (!activityTracking) return undefined

    const handleActivity = () => {
      clearTimers()
      void updateActivity('active', window.location.pathname)

      idleTimeoutRef.current = setTimeout(
        () => {
          void updateActivity('idle', window.location.pathname)
        },
        5 * 60 * 1000
      )

      activityTimeoutRef.current = setTimeout(
        () => {
          void updateActivity('away', window.location.pathname)
        },
        15 * 60 * 1000
      )
    }

    const events: (
      | 'mousedown'
      | 'mousemove'
      | 'keypress'
      | 'scroll'
      | 'touchstart'
      | 'click'
    )[] = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ]

    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true })
    })

    handleActivity()

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity)
      })
      clearTimers()
    }
  }, [activityTracking, clearTimers, updateActivity])

  useEffect(() => {
    const handleStatusChange = (status: ConnectionStatus) => {
      setConnectionStatus(status)
    }

    const handlePresenceChange = (users: PresenceState[]) => {
      setOnlineUsers(users)
    }

    realtimeManager.onStatusChange(handleStatusChange)
    if (trackPresence) {
      realtimeManager.onPresenceChange(handlePresenceChange)
    }

    setConnectionStatus(realtimeManager.getConnectionStatus())

    const cleanupActivity = setupActivityTracking()

    if (autoConnect && user && companyId) {
      void connect()
    }

    return () => {
      realtimeManager.removeStatusCallback(handleStatusChange)
      if (trackPresence) {
        realtimeManager.removePresenceCallback(handlePresenceChange)
      }
      if (cleanupActivity) {
        cleanupActivity()
      }
      clearTimers()
    }
  }, [
    autoConnect,
    clearTimers,
    connect,
    trackPresence,
    setupActivityTracking,
    user,
    companyId,
  ])

  useEffect(() => {
    const handleVisibilityChange = () => {
      const status = document.hidden ? 'away' : 'active'
      void updateActivity(status, window.location.pathname)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [updateActivity])

  useEffect(() => {
    const handleBeforeUnload = () => {
      void updateActivity('away')
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [updateActivity])

  return {
    isConnected: connectionStatus.connected,
    isReconnecting: connectionStatus.reconnecting,
    connectionError: connectionStatus.error,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    onlineUsers,
    updateActivity,
    connectionStatus,
    lastConnected: connectionStatus.lastConnected,
    connectionAttempts: connectionStatus.connectionAttempts,
  }
}

export interface TemperatureAlert {
  id: number
  type: 'temperature_violation'
  reading: Record<string, unknown>
  timestamp: Date
  severity: 'low' | 'medium' | 'high'
}

export function useTemperatureRealtime(companyId?: string) {
  const { subscribe, unsubscribe, isConnected } = useRealtime()
  const [temperatureReadings, setTemperatureReadings] = useState<
    Record<string, unknown>[]
  >([])
  const [criticalAlerts, setCriticalAlerts] = useState<TemperatureAlert[]>([])

  useEffect(() => {
    if (!isConnected || !companyId) return undefined

    const tempSubscriptionId = subscribe(
      'temperature_readings',
      'INSERT',
      payload => {
        const newReading = (
          payload as RealtimePostgresInsertPayload<Record<string, unknown>>
        ).new
        if (!newReading) return

        setTemperatureReadings(prev => [newReading, ...prev.slice(0, 99)])

        const violation = checkTemperatureViolation(newReading)
        if (violation) {
          setCriticalAlerts(prev => [
            {
              id: Date.now(),
              type: 'temperature_violation',
              reading: newReading,
              timestamp: new Date(),
              severity: violation,
            },
            ...prev,
          ])
        }
      },
      `company_id=eq.${companyId}`
    )

    return () => {
      unsubscribe(tempSubscriptionId)
    }
  }, [isConnected, companyId, subscribe, unsubscribe])

  const checkTemperatureViolation = (
    reading: Record<string, unknown>
  ): TemperatureAlert['severity'] | null => {
    const temperature =
      typeof reading.temperature === 'number' ? reading.temperature : undefined

    if (temperature === undefined) {
      return null
    }

    if (temperature >= 10) return 'high'
    if (temperature >= 6) return 'medium'
    if (temperature >= 4) return 'low'
    return null
  }

  return {
    temperatureReadings,
    criticalAlerts,
    isConnected,
  }
}

export interface TaskActivityEntry {
  id: number
  event: string
  data: unknown
  timestamp: Date
}

export function useTaskCollaboration(taskId?: string) {
  const { subscribe, unsubscribe, onlineUsers, isConnected } = useRealtime()
  const [taskActivity, setTaskActivity] = useState<TaskActivityEntry[]>([])
  const [activeCollaborators, setActiveCollaborators] = useState<
    PresenceState[]
  >([])

  useEffect(() => {
    if (!isConnected || !taskId) return undefined

    const taskSubscriptionId = subscribe(
      'maintenance_tasks',
      '*',
      payload => {
        const realtimePayload = payload as RealtimePostgresChangesPayload<
          Record<string, unknown>
        >

        const eventType = realtimePayload.eventType ?? 'UNKNOWN'
        const newData =
          'new' in realtimePayload ? realtimePayload.new : undefined
        const oldData =
          'old' in realtimePayload ? realtimePayload.old : undefined

        setTaskActivity(prev => [
          {
            id: Date.now(),
            event: eventType,
            data: newData ?? oldData ?? null,
            timestamp: new Date(),
          },
          ...prev.slice(0, 49),
        ])
      },
      `id=eq.${taskId}`
    )

    return () => {
      unsubscribe(taskSubscriptionId)
    }
  }, [isConnected, taskId, subscribe, unsubscribe])

  useEffect(() => {
    if (!taskId) {
      setActiveCollaborators([])
      return
    }

    const collaborators = onlineUsers.filter(user => {
      const currentPage = user.current_page ?? ''
      return currentPage.includes(taskId) && user.activity_status === 'active'
    })
    setActiveCollaborators(collaborators)
  }, [onlineUsers, taskId])

  return {
    taskActivity,
    activeCollaborators,
    isConnected,
  }
}
