/**
 * React Hook for Real-time Connection Management
 * Provides real-time data subscriptions and presence features
 */

import { useEffect, useState, useCallback, useRef } from 'react'
import { useAuth } from './useAuth'
import {
  realtimeManager,
  type RealtimeSubscription,
  type ConnectionStatus,
  type PresenceState,
  type TableName,
  type RealtimeEvent,
} from '@/services/realtime/RealtimeConnectionManager'

interface UseRealtimeOptions {
  autoConnect?: boolean
  trackPresence?: boolean
  activityTracking?: boolean
}

export interface RealtimeHookReturn {
  // Connection management
  isConnected: boolean
  isReconnecting: boolean
  connectionError?: string
  connect: () => Promise<void>
  disconnect: () => void

  // Subscription management
  subscribe: (
    table: TableName,
    event: RealtimeEvent | '*',
    callback: (payload: any) => void,
    filter?: string
  ) => string
  unsubscribe: (subscriptionId: string) => void

  // Presence features
  onlineUsers: PresenceState[]
  updateActivity: (
    status: 'active' | 'idle' | 'away',
    currentPage?: string
  ) => Promise<void>

  // Connection status
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
  const { user, userData } = useAuth()

  // State management
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    reconnecting: false,
    connectionAttempts: 0,
  })
  const [onlineUsers, setOnlineUsers] = useState<PresenceState[]>([])

  // Track activity for idle detection
  const lastActivityRef = useRef<Date>(new Date())
  const activityTimeoutRef = useRef<NodeJS.Timeout>()
  const idleTimeoutRef = useRef<NodeJS.Timeout>()

  /**
   * Connect to real-time services
   */
  const connect = useCallback(async (): Promise<void> => {
    if (!user || !userData?.company_id) {
      console.warn('Cannot connect to real-time: user or company not available')
      return
    }

    try {
      await realtimeManager.connect(
        userData.company_id,
        user.id,
        user.emailAddresses[0]?.emailAddress || userData.email
      )
    } catch (error) {
      console.error('Failed to connect to real-time services:', error)
    }
  }, [user, userData])

  /**
   * Disconnect from real-time services
   */
  const disconnect = useCallback((): void => {
    realtimeManager.disconnect()

    // Clear activity tracking timers
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current)
    }
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current)
    }
  }, [])

  /**
   * Subscribe to table changes
   */
  const subscribe = useCallback(
    (
      table: TableName,
      event: RealtimeEvent | '*',
      callback: (payload: any) => void,
      filter?: string
    ): string => {
      return realtimeManager.subscribe({
        table,
        event,
        callback,
        filter,
      })
    },
    []
  )

  /**
   * Unsubscribe from table changes
   */
  const unsubscribe = useCallback((subscriptionId: string): void => {
    realtimeManager.unsubscribe(subscriptionId)
  }, [])

  /**
   * Update user activity status
   */
  const updateActivity = useCallback(
    async (
      status: 'active' | 'idle' | 'away',
      currentPage?: string
    ): Promise<void> => {
      lastActivityRef.current = new Date()
      await realtimeManager.updateActivity(status, currentPage)
    },
    []
  )

  /**
   * Track user activity for automatic idle detection
   */
  const setupActivityTracking = useCallback((): void => {
    if (!activityTracking) return

    const handleActivity = (): void => {
      lastActivityRef.current = new Date()
      updateActivity('active', window.location.pathname)

      // Clear existing timers
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current)
      }
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current)
      }

      // Set idle timer (5 minutes)
      idleTimeoutRef.current = setTimeout(
        () => {
          updateActivity('idle', window.location.pathname)
        },
        5 * 60 * 1000
      )

      // Set away timer (15 minutes)
      activityTimeoutRef.current = setTimeout(
        () => {
          updateActivity('away', window.location.pathname)
        },
        15 * 60 * 1000
      )
    }

    // Listen for user activity
    const events = [
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

    // Initial activity
    handleActivity()

    // Cleanup function
    return (): void => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity)
      })
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current)
      }
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current)
      }
    }
  }, [activityTracking, updateActivity])

  /**
   * Setup event listeners on mount
   */
  useEffect(() => {
    // Listen for connection status changes
    const handleStatusChange = (status: ConnectionStatus): void => {
      setConnectionStatus(status)
    }

    // Listen for presence changes
    const handlePresenceChange = (users: PresenceState[]): void => {
      setOnlineUsers(users)
    }

    realtimeManager.onStatusChange(handleStatusChange)
    if (trackPresence) {
      realtimeManager.onPresenceChange(handlePresenceChange)
    }

    // Initial status
    setConnectionStatus(realtimeManager.getConnectionStatus())

    // Setup activity tracking
    const cleanupActivity = setupActivityTracking()

    // Auto-connect if enabled
    if (autoConnect && user && userData?.company_id) {
      connect()
    }

    // Cleanup on unmount
    return (): void => {
      realtimeManager.removeStatusCallback(handleStatusChange)
      if (trackPresence) {
        realtimeManager.removePresenceCallback(handlePresenceChange)
      }
      if (cleanupActivity) {
        cleanupActivity()
      }
    }
  }, [
    autoConnect,
    trackPresence,
    connect,
    setupActivityTracking,
    user,
    userData?.company_id,
  ])

  /**
   * Handle page visibility changes
   */
  useEffect(() => {
    const handleVisibilityChange = (): void => {
      if (document.hidden) {
        updateActivity('away', window.location.pathname)
      } else {
        updateActivity('active', window.location.pathname)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return (): void => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [updateActivity])

  /**
   * Handle beforeunload to update status
   */
  useEffect(() => {
    const handleBeforeUnload = (): void => {
      updateActivity('away')
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return (): void => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [updateActivity])

  return {
    // Connection management
    isConnected: connectionStatus.connected,
    isReconnecting: connectionStatus.reconnecting,
    connectionError: connectionStatus.error,
    connect,
    disconnect,

    // Subscription management
    subscribe,
    unsubscribe,

    // Presence features
    onlineUsers,
    updateActivity,

    // Connection status
    connectionStatus,
    lastConnected: connectionStatus.lastConnected,
    connectionAttempts: connectionStatus.connectionAttempts,
  }
}

/**
 * Specialized hook for temperature monitoring
 */
export function useTemperatureRealtime(companyId?: string) {
  const { subscribe, unsubscribe, isConnected } = useRealtime()
  const [temperatureReadings, setTemperatureReadings] = useState<any[]>([])
  const [criticalAlerts, setCriticalAlerts] = useState<any[]>([])

  useEffect(() => {
    if (!isConnected || !companyId) return

    // Subscribe to temperature readings
    const tempSubscriptionId = subscribe(
      'temperature_readings',
      'INSERT',
      payload => {
        const newReading = payload.new
        setTemperatureReadings(prev => [newReading, ...prev.slice(0, 99)]) // Keep last 100 readings

        // Check for critical temperature violations
        const isViolation = checkTemperatureViolation(newReading)
        if (isViolation) {
          setCriticalAlerts(prev => [
            {
              id: Date.now(),
              type: 'temperature_violation',
              reading: newReading,
              timestamp: new Date(),
              severity: isViolation.severity,
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

  const checkTemperatureViolation = (reading: any) => {
    // Implementation of temperature violation logic
    // This would check against conservation point thresholds
    return null // Placeholder
  }

  return {
    temperatureReadings,
    criticalAlerts,
    isConnected,
  }
}

/**
 * Specialized hook for task collaboration
 */
export function useTaskCollaboration(taskId?: string) {
  const { subscribe, unsubscribe, onlineUsers, isConnected } = useRealtime()
  const [taskActivity, setTaskActivity] = useState<any[]>([])
  const [activeCollaborators, setActiveCollaborators] = useState<
    PresenceState[]
  >([])

  useEffect(() => {
    if (!isConnected || !taskId) return

    // Subscribe to task updates
    const taskSubscriptionId = subscribe(
      'maintenance_tasks',
      '*',
      payload => {
        setTaskActivity(prev => [
          {
            id: Date.now(),
            event: payload.eventType,
            data: payload.new || payload.old,
            timestamp: new Date(),
          },
          ...prev.slice(0, 49), // Keep last 50 activities
        ])
      },
      `id=eq.${taskId}`
    )

    return () => {
      unsubscribe(taskSubscriptionId)
    }
  }, [isConnected, taskId, subscribe, unsubscribe])

  useEffect(() => {
    // Filter users working on current task
    const collaborators = onlineUsers.filter(
      user =>
        user.current_page?.includes(taskId || '') &&
        user.activity_status === 'active'
    )
    setActiveCollaborators(collaborators)
  }, [onlineUsers, taskId])

  return {
    taskActivity,
    activeCollaborators,
    isConnected,
  }
}
