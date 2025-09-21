import { useState, useEffect, useCallback } from 'react'

interface NetworkStatusState {
  isOnline: boolean
  isSlowConnection: boolean
  connectionType: string | null
  effectiveType: string | null
  downlink: number | null
  rtt: number | null
  lastChecked: Date
}

interface NetworkStatusOptions {
  pollInterval?: number
  enableConnectionInfo?: boolean
  onConnectionChange?: (isOnline: boolean) => void
  onSlowConnection?: (isSlow: boolean) => void
}

export function useNetworkStatus(options: NetworkStatusOptions = {}) {
  const {
    pollInterval = 30000, // 30 seconds
    enableConnectionInfo = true,
    onConnectionChange,
    onSlowConnection,
  } = options

  const [state, setState] = useState<NetworkStatusState>({
    isOnline: navigator.onLine,
    isSlowConnection: false,
    connectionType: null,
    effectiveType: null,
    downlink: null,
    rtt: null,
    lastChecked: new Date(),
  })

  // Get connection info if available
  const getConnectionInfo = useCallback(() => {
    if (!enableConnectionInfo) return {}

    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection

    if (!connection) return {}

    const isSlowConnection =
      connection.effectiveType === 'slow-2g' ||
      connection.effectiveType === '2g' ||
      (connection.downlink && connection.downlink < 0.5)

    return {
      connectionType: connection.type || null,
      effectiveType: connection.effectiveType || null,
      downlink: connection.downlink || null,
      rtt: connection.rtt || null,
      isSlowConnection,
    }
  }, [enableConnectionInfo])

  // Update network status
  const updateStatus = useCallback(() => {
    const connectionInfo = getConnectionInfo()
    const newState = {
      isOnline: navigator.onLine,
      lastChecked: new Date(),
      ...connectionInfo,
    }

    setState(prev => {
      // Trigger callbacks if status changed
      if (prev.isOnline !== newState.isOnline && onConnectionChange) {
        onConnectionChange(newState.isOnline)
      }

      if (
        prev.isSlowConnection !== newState.isSlowConnection &&
        onSlowConnection
      ) {
        onSlowConnection(newState.isSlowConnection || false)
      }

      return { ...prev, ...newState }
    })
  }, [getConnectionInfo, onConnectionChange, onSlowConnection])

  // Test actual connectivity (not just navigator.onLine)
  const testConnectivity = useCallback(async (): Promise<boolean> => {
    try {
      // Try to fetch a small resource with cache-busting
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

      const response = await fetch('/favicon.ico?' + Date.now(), {
        method: 'HEAD',
        cache: 'no-cache',
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      return response.ok
    } catch (error) {
      return false
    }
  }, [])

  // Enhanced connectivity check
  const checkConnectivity = useCallback(async () => {
    const isActuallyOnline = await testConnectivity()

    setState(prev => ({
      ...prev,
      isOnline: isActuallyOnline,
      lastChecked: new Date(),
    }))

    return isActuallyOnline
  }, [testConnectivity])

  // Setup event listeners
  useEffect(() => {
    const handleOnline = () => {
      updateStatus()
      // Do an actual connectivity test when coming back online
      checkConnectivity()
    }

    const handleOffline = () => {
      updateStatus()
    }

    // Connection change listener (if supported)
    const handleConnectionChange = () => {
      updateStatus()
    }

    // Add listeners
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Listen for connection changes
    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection

    if (connection) {
      connection.addEventListener('change', handleConnectionChange)
    }

    // Initial status update
    updateStatus()

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)

      if (connection) {
        connection.removeEventListener('change', handleConnectionChange)
      }
    }
  }, [updateStatus, checkConnectivity])

  // Periodic connectivity check
  useEffect(() => {
    if (pollInterval <= 0) return

    const interval = setInterval(() => {
      if (state.isOnline) {
        checkConnectivity()
      }
    }, pollInterval)

    return () => clearInterval(interval)
  }, [pollInterval, state.isOnline, checkConnectivity])

  return {
    // Current state
    isOnline: state.isOnline,
    isSlowConnection: state.isSlowConnection,
    connectionType: state.connectionType,
    effectiveType: state.effectiveType,
    downlink: state.downlink,
    rtt: state.rtt,
    lastChecked: state.lastChecked,

    // Methods
    checkConnectivity,
    testConnectivity,

    // Derived state
    isConnected: state.isOnline,
    isFastConnection: state.isOnline && !state.isSlowConnection,
    connectionQuality: state.isSlowConnection
      ? 'poor'
      : state.effectiveType === '4g'
        ? 'excellent'
        : state.effectiveType === '3g'
          ? 'good'
          : 'fair',
  }
}
