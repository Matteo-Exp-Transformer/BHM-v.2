/**
 * Background Sync Service for HACCP Business Manager
 * Handles synchronization of offline data when connection is restored
 */

import { indexedDBManager, type SyncQueue } from './IndexedDBManager'
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
        console.log(
          `[Sync] Processing ${operations.length} operations for table: ${table}`
        )

        for (let i = 0; i < operations.length; i++) {
          const operation = operations[i]

          this.notifyProgress({
            total: syncQueue.length,
            completed: result.syncedCount + result.failedCount,
            current: `${operation.operation} ${table}`,
          })

          try {
            await this.processSyncOperation(operation)
            await indexedDBManager.removeSyncItem(operation.id)
            result.syncedCount++
            console.log(
              `[Sync] Successfully synced: ${operation.operation} ${table}`
            )
          } catch (error) {
            console.error(`[Sync] Failed to sync operation:`, error)
            result.failedCount++
            result.errors.push({
              item: operation,
              error: error instanceof Error ? error.message : 'Unknown error',
            })

            // Increment retry count or remove if max retries reached
            if (operation.retryCount >= 2) {
              await indexedDBManager.removeSyncItem(operation.id)
              console.log(
                `[Sync] Removed operation after max retries: ${operation.id}`
              )
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
    const grouped: Record<string, SyncQueue[]> = {}

    for (const operation of operations) {
      if (!grouped[operation.table]) {
        grouped[operation.table] = []
      }
      grouped[operation.table].push(operation)
    }

    return grouped
  }

  private async processSyncOperation(operation: SyncQueue): Promise<void> {
    const { table, operation: op, data } = operation

    switch (table) {
      case 'temperature_readings':
        await this.syncTemperatureReading(op, data)
        break

      case 'tasks':
        await this.syncTask(op, data)
        break

      case 'products':
        await this.syncProduct(op, data)
        break

      case 'task_completions':
        await this.syncTaskCompletion(op, data)
        break

      default:
        await this.syncGenericOperation(table, op, data)
    }
  }

  private async syncTemperatureReading(
    operation: string,
    data: any
  ): Promise<void> {
    switch (operation) {
      case 'create':
        const { data: created, error: createError } = await supabase
          .from('temperature_readings')
          .insert(data)

        if (createError) throw createError
        break

      case 'update':
        const { error: updateError } = await supabase
          .from('temperature_readings')
          .update(data)
          .eq('id', data.id)

        if (updateError) throw updateError
        break

      case 'delete':
        const { error: deleteError } = await supabase
          .from('temperature_readings')
          .delete()
          .eq('id', data.id)

        if (deleteError) throw deleteError
        break
    }
  }

  private async syncTask(operation: string, data: any): Promise<void> {
    switch (operation) {
      case 'create':
        const { data: created, error: createError } = await supabase
          .from('tasks')
          .insert(data)

        if (createError) throw createError
        break

      case 'update':
        const { error: updateError } = await supabase
          .from('tasks')
          .update(data)
          .eq('id', data.id)

        if (updateError) throw updateError
        break

      case 'delete':
        const { error: deleteError } = await supabase
          .from('tasks')
          .delete()
          .eq('id', data.id)

        if (deleteError) throw deleteError
        break
    }
  }

  private async syncProduct(operation: string, data: any): Promise<void> {
    switch (operation) {
      case 'create':
        const { data: created, error: createError } = await supabase
          .from('products')
          .insert(data)

        if (createError) throw createError
        break

      case 'update':
        const { error: updateError } = await supabase
          .from('products')
          .update(data)
          .eq('id', data.id)

        if (updateError) throw updateError
        break

      case 'delete':
        const { error: deleteError } = await supabase
          .from('products')
          .delete()
          .eq('id', data.id)

        if (deleteError) throw deleteError
        break
    }
  }

  private async syncTaskCompletion(
    operation: string,
    data: any
  ): Promise<void> {
    switch (operation) {
      case 'create':
        const { data: created, error: createError } = await supabase
          .from('task_completions')
          .insert(data)

        if (createError) throw createError
        break

      case 'update':
        const { error: updateError } = await supabase
          .from('task_completions')
          .update(data)
          .eq('id', data.id)

        if (updateError) throw updateError
        break
    }
  }

  private async syncGenericOperation(
    table: string,
    operation: string,
    data: any
  ): Promise<void> {
    switch (operation) {
      case 'create':
        const { data: created, error: createError } = await supabase
          .from(table)
          .insert(data)

        if (createError) throw createError
        break

      case 'update':
        const { error: updateError } = await supabase
          .from(table)
          .update(data)
          .eq('id', data.id)

        if (updateError) throw updateError
        break

      case 'delete':
        const { error: deleteError } = await supabase
          .from(table)
          .delete()
          .eq('id', data.id)

        if (deleteError) throw deleteError
        break
    }
  }

  private notifyProgress(progress: SyncProgress): void {
    if (this.progressCallback) {
      this.progressCallback(progress)
    }
  }

  async queueForSync(
    table: string,
    operation: 'create' | 'update' | 'delete',
    data: any
  ): Promise<void> {
    await indexedDBManager.init()
    await indexedDBManager.addToSyncQueue({
      operation,
      table,
      data,
    })

    console.log(`[Sync] Queued ${operation} operation for ${table}`)

    // Try to sync immediately if online
    if (this.isOnline && !this.syncInProgress) {
      setTimeout(() => this.startSync(), 1000)
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
