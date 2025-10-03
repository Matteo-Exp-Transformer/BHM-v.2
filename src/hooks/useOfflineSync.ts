import { useState, useEffect, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'

const OFFLINE_ENTITIES = [
  'temperature-reading',
  'maintenance-task',
  'conservation-point',
  'calendar-event',
  'staff',
  'department',
  'product',
] as const

type OfflineEntity = (typeof OFFLINE_ENTITIES)[number]

interface OfflineEntityMap {
  'temperature-reading': {
    id?: string
    temperature: number
    recorded_at?: string | Date
    [key: string]: unknown
  }
  'maintenance-task': {
    id?: string
    title: string
    [key: string]: unknown
  }
  'conservation-point': {
    id?: string
    name: string
    [key: string]: unknown
  }
  'calendar-event': {
    id?: string
    title: string
    [key: string]: unknown
  }
  staff: {
    id?: string
    name: string
    [key: string]: unknown
  }
  department: {
    id?: string
    name: string
    [key: string]: unknown
  }
  product: {
    id?: string
    name: string
    [key: string]: unknown
  }
}

type SyncOperationType = 'CREATE' | 'UPDATE' | 'DELETE'

type SyncOperationPayload<Entity extends OfflineEntity> = OfflineEntityMap[Entity]

interface SyncOperation<Entity extends OfflineEntity = OfflineEntity> {
  id: string
  type: SyncOperationType
  entity: Entity
  data: SyncOperationPayload<Entity>
  timestamp: number
  retryCount: number
  maxRetries: number
}

interface OfflineSyncState {
  isOnline: boolean
  isSyncing: boolean
  pendingOperations: SyncOperation[]
  lastSyncTime: Date | null
  syncErrors: Array<{ operation: SyncOperation; error: string }>
}

interface UseOfflineSyncOptions {
  autoSync?: boolean
  syncInterval?: number
  maxRetries?: number
}

const isOfflineEntity = (value: string): value is OfflineEntity =>
  OFFLINE_ENTITIES.includes(value as OfflineEntity)

const getEndpointForEntity = (entity: OfflineEntity): string => {
  const endpoints: Record<OfflineEntity, string> = {
    'temperature-reading': '/api/temperature-readings',
    'maintenance-task': '/api/maintenance-tasks',
    'conservation-point': '/api/conservation-points',
    'calendar-event': '/api/calendar-events',
    staff: '/api/staff',
    department: '/api/departments',
    product: '/api/products',
  }

  return endpoints[entity]
}

export function useOfflineSync(options: UseOfflineSyncOptions = {}) {
  const {
    autoSync = true,
    syncInterval = 30000,
    maxRetries = 3,
  } = options

  const queryClient = useQueryClient()
  const [state, setState] = useState<OfflineSyncState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSyncing: false,
    pendingOperations: [],
    lastSyncTime: null,
    syncErrors: [],
  })

  const savePendingOperations = useCallback((operations: SyncOperation[]) => {
    try {
      localStorage.setItem('haccp_pending_operations', JSON.stringify(operations))
    } catch (error) {
      console.error('Failed to save pending operations:', error)
    }
  }, [])

  const syncPendingOperations = useCallback(async () => {
    if (state.isSyncing || state.pendingOperations.length === 0 || !state.isOnline) {
      return
    }

    setState(prev => ({ ...prev, isSyncing: true, syncErrors: [] }))

    const results = await Promise.allSettled(
      state.pendingOperations.map(operation => syncSingleOperation(operation, queryClient))
    )

    const successfulOperations: string[] = []
    const failedOperations: Array<{ operation: SyncOperation; error: string }> = []

    results.forEach((result, index) => {
      const operation = state.pendingOperations[index]

      if (result.status === 'fulfilled' && result.value) {
        successfulOperations.push(operation.id)
      } else {
        const errorMessage =
          result.status === 'rejected'
            ? result.reason instanceof Error
              ? result.reason.message
              : String(result.reason)
            : 'Unknown error'

        const shouldRemove = operation.retryCount + 1 >= operation.maxRetries

        if (shouldRemove) {
          failedOperations.push({ operation, error: errorMessage })
          successfulOperations.push(operation.id)
        } else {
          operation.retryCount += 1
        }
      }
    })

    setState(prev => {
      const remainingOperations = prev.pendingOperations.filter(
        op => !successfulOperations.includes(op.id)
      )
      savePendingOperations(remainingOperations)

      return {
        ...prev,
        pendingOperations: remainingOperations,
        syncErrors: failedOperations,
        isSyncing: false,
        lastSyncTime: new Date(),
      }
    })

    if (successfulOperations.length > 0) {
      queryClient.invalidateQueries({ queryKey: ['conservation'] })
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
      queryClient.invalidateQueries({ queryKey: ['maintenance'] })
    }
  }, [queryClient, savePendingOperations, state])

  const loadPendingOperations = useCallback(() => {
    try {
      const stored = localStorage.getItem('haccp_pending_operations')
      if (stored) {
        const operations = JSON.parse(stored) as Array<SyncOperation>
        const validOperations = operations.filter(op => isOfflineEntity(op.entity))
        setState(prev => ({ ...prev, pendingOperations: validOperations }))
      }
    } catch (error) {
      console.error('Failed to load pending operations:', error)
    }
  }, [])

  useEffect(() => {
    loadPendingOperations()
  }, [loadPendingOperations])

  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }))
      if (autoSync) {
        void syncPendingOperations()
      }
    }

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [autoSync, syncPendingOperations])

  useEffect(() => {
    if (!autoSync || !state.isOnline) return

    const interval = setInterval(() => {
      if (state.pendingOperations.length > 0) {
        void syncPendingOperations()
      }
    }, syncInterval)

    return () => clearInterval(interval)
  }, [autoSync, state.isOnline, state.pendingOperations.length, syncInterval, syncPendingOperations])

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === 'SYNC_COMPLETE') {
          setState(prev => ({
            ...prev,
            lastSyncTime: new Date(),
            isSyncing: false,
          }))
          queryClient.invalidateQueries({ queryKey: ['conservation'] })
          queryClient.invalidateQueries({ queryKey: ['calendar'] })
          queryClient.invalidateQueries({ queryKey: ['maintenance'] })
        }
      }

      navigator.serviceWorker.addEventListener('message', handleMessage)
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleMessage)
      }
    }
  }, [queryClient])

  const queueOperation = useCallback(
    async <Entity extends OfflineEntity>(
      type: SyncOperationType,
      entity: Entity,
      data: SyncOperationPayload<Entity>,
      id?: string
    ): Promise<string> => {
      const operation: SyncOperation<Entity> = {
        id:
          id ||
          `${entity}_${type}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        type,
        entity,
        data,
        timestamp: Date.now(),
        retryCount: 0,
        maxRetries,
      }

      setState(prev => {
        const newOperations: SyncOperation[] = [...prev.pendingOperations, operation]
        savePendingOperations(newOperations)
        return {
          ...prev,
          pendingOperations: newOperations,
        }
      })

      return operation.id
    },
    [maxRetries, savePendingOperations]
  )

  const syncSingleOperation = useCallback(async (
    operation: SyncOperation,
    client: ReturnType<typeof useQueryClient>
  ): Promise<boolean> => {
    const endpoint = getEndpointForEntity(operation.entity)
    const baseData = operation.data as { id?: string }
    const url =
      operation.type === 'CREATE' ? endpoint : `${endpoint}/${baseData?.id ?? ''}`

    const methodMap: Record<SyncOperationType, 'POST' | 'PUT' | 'DELETE'> = {
      CREATE: 'POST',
      UPDATE: 'PUT',
      DELETE: 'DELETE',
    }

    const response = await fetch(url, {
      method: methodMap[operation.type],
      headers: {
        'Content-Type': 'application/json',
      },
      body: operation.type !== 'DELETE' ? JSON.stringify(operation.data) : undefined,
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    client.invalidateQueries({ queryKey: [operation.entity] })
    return true
  }, [])

  const syncSingleOperationMemo = useCallback(
    (operation: SyncOperation) => syncSingleOperation(operation, queryClient),
    [queryClient, syncSingleOperation]
  )

  const syncOperationsWrapper = useCallback(async () => {
    if (state.isSyncing || state.pendingOperations.length === 0 || !state.isOnline) {
      return
    }

    setState(prev => ({ ...prev, isSyncing: true, syncErrors: [] }))

    const results = await Promise.allSettled(
      state.pendingOperations.map(operation => syncSingleOperationMemo(operation))
    )

    const successfulOperations: string[] = []
    const failedOperations: Array<{ operation: SyncOperation; error: string }> = []

    results.forEach((result, index) => {
      const operation = state.pendingOperations[index]

      if (result.status === 'fulfilled' && result.value) {
        successfulOperations.push(operation.id)
      } else {
        const errorMessage =
          result.status === 'rejected'
            ? result.reason instanceof Error
              ? result.reason.message
              : String(result.reason)
            : 'Unknown error'

        const shouldRemove = operation.retryCount + 1 >= operation.maxRetries

        if (shouldRemove) {
          failedOperations.push({ operation, error: errorMessage })
          successfulOperations.push(operation.id)
        } else {
          operation.retryCount += 1
        }
      }
    })

    setState(prev => {
      const remainingOperations = prev.pendingOperations.filter(
        op => !successfulOperations.includes(op.id)
      )
      savePendingOperations(remainingOperations)

      return {
        ...prev,
        pendingOperations: remainingOperations,
        syncErrors: failedOperations,
        isSyncing: false,
        lastSyncTime: new Date(),
      }
    })

    if (successfulOperations.length > 0) {
      queryClient.invalidateQueries({ queryKey: ['conservation'] })
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
      queryClient.invalidateQueries({ queryKey: ['maintenance'] })
    }
  }, [queryClient, savePendingOperations, state, syncSingleOperationMemo])

  useEffect(() => {
    if (!autoSync || !state.isOnline) return

    const interval = setInterval(() => {
      if (state.pendingOperations.length > 0) {
        void syncOperationsWrapper()
      }
    }, syncInterval)

    return () => clearInterval(interval)
  }, [autoSync, state.isOnline, state.pendingOperations.length, syncInterval, syncOperationsWrapper])

  const clearSyncErrors = useCallback(() => {
    setState(prev => ({ ...prev, syncErrors: [] }))
  }, [])

  const retrySyncOperation = useCallback(
    async (operationId: string) => {
      const operation = state.pendingOperations.find(op => op.id === operationId)
      if (!operation) return

      operation.retryCount = 0
      await syncOperationsWrapper()
    },
    [state.pendingOperations, syncOperationsWrapper]
  )

  const removeOperation = useCallback((operationId: string) => {
    setState(prev => {
      const newOperations = prev.pendingOperations.filter(op => op.id !== operationId)
      savePendingOperations(newOperations)
      return {
        ...prev,
        pendingOperations: newOperations,
      }
    })
  }, [savePendingOperations])

  return {
    isOnline: state.isOnline,
    isSyncing: state.isSyncing,
    pendingOperations: state.pendingOperations,
    lastSyncTime: state.lastSyncTime,
    syncErrors: state.syncErrors,
    queueOperation,
    syncPendingOperations: syncOperationsWrapper,
    clearSyncErrors,
    retrySyncOperation,
    removeOperation,
    hasPendingOperations: state.pendingOperations.length > 0,
    hasErrors: state.syncErrors.length > 0,
  }
}
