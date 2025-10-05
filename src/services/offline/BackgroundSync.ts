/**
 * Background Sync Service for HACCP Business Manager
 * Handles synchronization of offline data when connection is restored
 */

import { indexedDBManager, type SyncQueue, type SyncPayload, type SyncOperationType } from './IndexedDBManager'
import { supabase } from '@/lib/supabase/client'

export interface SyncResult {
  success: boolean
  syncedCount: number
  failedCount: number
  errors: Array<{ item: SyncQueue; error: string }>
}

export interface SyncProgress {
  total: number
  completed: number
  current?: string
}

type SyncTable =
  | 'temperature_readings'
  | 'tasks'
  | 'products'
  | 'task_completions'
  | string

interface OperationHandler {
  create?: (payload: SyncPayload) => Promise<void>
  update?: (payload: SyncPayload) => Promise<void>
  delete?: (payload: SyncPayload) => Promise<void>
}

const handlers: Record<SyncTable, OperationHandler> = {
  temperature_readings: {
    create: async payload => {
      const { error } = await supabase.from('temperature_readings').insert(payload)
      if (error) throw error
    },
    update: async payload => {
      const { error } = await supabase
        .from('temperature_readings')
        .update(payload)
        .eq('id', payload.id as string)
      if (error) throw error
    },
    delete: async payload => {
      const { error } = await supabase
        .from('temperature_readings')
        .delete()
        .eq('id', payload.id as string)
      if (error) throw error
    },
  },
  tasks: {
    create: async payload => {
      const { error } = await supabase.from('tasks').insert(payload)
      if (error) throw error
    },
    update: async payload => {
      const { error } = await supabase
        .from('tasks')
        .update(payload)
        .eq('id', payload.id as string)
      if (error) throw error
    },
    delete: async payload => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', payload.id as string)
      if (error) throw error
    },
  },
  products: {
    create: async payload => {
      const { error } = await supabase.from('products').insert(payload)
      if (error) throw error
    },
    update: async payload => {
      const { error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', payload.id as string)
      if (error) throw error
    },
    delete: async payload => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', payload.id as string)
      if (error) throw error
    },
  },
  task_completions: {
    create: async payload => {
      const { error } = await supabase.from('task_completions').insert(payload)
      if (error) throw error
    },
    update: async payload => {
      const { error } = await supabase
        .from('task_completions')
        .update(payload)
        .eq('id', payload.id as string)
      if (error) throw error
    },
  },
}

const getHandler = (table: string): OperationHandler => {
  if (handlers[table as SyncTable]) {
    return handlers[table as SyncTable]
  }
  return {
    create: async payload => {
      const { error } = await supabase.from(table).insert(payload)
      if (error) throw error
    },
    update: async payload => {
      const { error } = await supabase
        .from(table)
        .update(payload)
        .eq('id', payload.id as string)
      if (error) throw error
    },
    delete: async payload => {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', payload.id as string)
      if (error) throw error
    },
  }
}

class BackgroundSyncService {
  private isOnline = navigator.onLine
  private syncInProgress = false
  private progressCallback?: (progress: SyncProgress) => void

  constructor() {
    this.setupOnlineListeners()
  }

  private setupOnlineListeners(): void {
    window.addEventListener('online', () => {
      console.log('[Sync] Connection restored, starting sync...')
      this.isOnline = true
      this.startSync()
    })

    window.addEventListener('offline', () => {
      console.log('[Sync] Connection lost')
      this.isOnline = false
    })
  }

  async startSync(
    progressCallback?: (progress: SyncProgress) => void
  ): Promise<SyncResult> {
    if (this.syncInProgress) {
      console.log('[Sync] Sync already in progress')
      return { success: false, syncedCount: 0, failedCount: 0, errors: [] }
    }

    if (!this.isOnline) {
      console.log('[Sync] Cannot sync while offline')
      return { success: false, syncedCount: 0, failedCount: 0, errors: [] }
    }

    this.syncInProgress = true
    this.progressCallback = progressCallback

    try {
      await indexedDBManager.init()
      const syncQueue = await indexedDBManager.getSyncQueue()

      console.log(`[Sync] Starting sync of ${syncQueue.length} items`)

      const result: SyncResult = {
        success: true,
        syncedCount: 0,
        failedCount: 0,
        errors: [],
      }

      if (syncQueue.length === 0) {
        this.notifyProgress({ total: 0, completed: 0 })
        return result
      }

      // Sort by timestamp (FIFO)
      const sortedQueue = syncQueue.sort((a, b) => a.timestamp - b.timestamp)

      // Group by table for batch operations
      const groupedOperations = this.groupOperationsByTable(sortedQueue)

      for (const [table, operations] of Object.entries(groupedOperations)) {
        const handler = getHandler(table)
        for (const operation of operations) {
          this.notifyProgress({
            total: syncQueue.length,
            completed: result.syncedCount + result.failedCount,
            current: `${operation.operation} ${table}`,
          })

          try {
            await this.processSyncOperation(operation, handler)
            await indexedDBManager.removeSyncItem(operation.id)
            result.syncedCount++
          } catch (error) {
            result.failedCount++
            result.errors.push({
              item: operation,
              error: error instanceof Error ? error.message : String(error),
            })

            if (operation.retryCount >= 2) {
              await indexedDBManager.removeSyncItem(operation.id)
            }
          }
        }
      }

      this.notifyProgress({
        total: syncQueue.length,
        completed: result.syncedCount + result.failedCount,
      })

      console.log(
        `[Sync] Sync completed. Success: ${result.syncedCount}, Failed: ${result.failedCount}`
      )
      return result
    } catch (error) {
      console.error('[Sync] Sync process failed:', error)
      return {
        success: false,
        syncedCount: 0,
        failedCount: 0,
        errors: [
          {
            item: {} as SyncQueue,
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        ],
      }
    } finally {
      this.syncInProgress = false
      this.progressCallback = undefined
    }
  }

  private groupOperationsByTable(
    operations: SyncQueue[]
  ): Record<string, SyncQueue[]> {
    return operations.reduce<Record<string, SyncQueue[]>>((acc, operation) => {
      const table = operation.table
      if (!acc[table]) {
        acc[table] = []
      }
      acc[table].push(operation)
      return acc
    }, {})
  }

  private async processSyncOperation(
    operation: SyncQueue,
    handler: OperationHandler
  ): Promise<void> {
    const payload = operation.data
    const executor = handler[operation.operation as SyncOperationType]
    if (!executor) {
      throw new Error(`Unsupported operation ${operation.operation}`)
    }
    await executor(payload)
  }

  private notifyProgress(progress: SyncProgress): void {
    if (this.progressCallback) {
      this.progressCallback(progress)
    }
  }

  async queueForSync(
    table: string,
    operation: SyncOperationType,
    data: SyncPayload
  ): Promise<void> {
    await indexedDBManager.init()
    await indexedDBManager.addToSyncQueue({ operation, table, data })

    if (this.isOnline && !this.syncInProgress) {
      setTimeout(() => {
        void this.startSync()
      }, 1000)
    }
  }

  async getPendingSyncCount(): Promise<number> {
    await indexedDBManager.init()
    const queue = await indexedDBManager.getSyncQueue()
    return queue.length
  }

  isCurrentlyOnline(): boolean {
    return this.isOnline
  }

  isSyncInProgress(): boolean {
    return this.syncInProgress
  }

  async clearSyncQueue(): Promise<void> {
    await indexedDBManager.init()
    const queue = await indexedDBManager.getSyncQueue()

    for (const item of queue) {
      await indexedDBManager.removeSyncItem(item.id)
    }

    console.log('[Sync] Cleared sync queue')
  }
}

export const backgroundSyncService = new BackgroundSyncService()
