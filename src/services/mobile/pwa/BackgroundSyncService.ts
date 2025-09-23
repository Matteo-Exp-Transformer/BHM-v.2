/**
 * Advanced Background Sync Service - B.10.4 Advanced Mobile & PWA
 * Handles intelligent sync queue management, conflict resolution, and offline operations
 */

interface SyncItem {
  id: string
  type: 'temperature' | 'task' | 'product' | 'maintenance' | 'general'
  data: any
  endpoint: string
  method: 'POST' | 'PUT' | 'DELETE'
  timestamp: number
  retryCount: number
  priority: 'low' | 'normal' | 'high' | 'critical'
  metadata?: {
    userId?: string
    companyId?: string
    departmentId?: string
    deviceId?: string
  }
}

interface SyncStatus {
  isOnline: boolean
  isSyncing: boolean
  pendingItems: number
  lastSyncTime: number | null
  nextSyncTime: number | null
  syncErrors: number
  totalSynced: number
}

interface ConflictResolution {
  strategy: 'server_wins' | 'client_wins' | 'merge' | 'manual'
  resolved: boolean
  data: any
  timestamp: number
}

interface SyncConfig {
  maxRetries: number
  retryDelayMs: number
  batchSize: number
  syncIntervalMs: number
  conflictResolution: 'auto' | 'manual'
  priorities: {
    critical: number
    high: number
    normal: number
    low: number
  }
}

export class BackgroundSyncService {
  private syncQueue: Map<string, SyncItem> = new Map()
  private isOnline: boolean = navigator.onLine
  private isSyncing: boolean = false
  private syncInterval: number | null = null
  private config: SyncConfig = {
    maxRetries: 3,
    retryDelayMs: 1000,
    batchSize: 10,
    syncIntervalMs: 30000, // 30 seconds
    conflictResolution: 'auto',
    priorities: {
      critical: 4,
      high: 3,
      normal: 2,
      low: 1,
    },
  }
  private stats: SyncStatus = {
    isOnline: navigator.onLine,
    isSyncing: false,
    pendingItems: 0,
    lastSyncTime: null,
    nextSyncTime: null,
    syncErrors: 0,
    totalSynced: 0,
  }

  /**
   * Initialize background sync service
   */
  public async initialize(): Promise<void> {
    try {
      // Load existing sync queue from IndexedDB
      await this.loadSyncQueue()

      // Set up online/offline event listeners
      this.setupNetworkListeners()

      // Start periodic sync if online
      if (this.isOnline) {
        this.startPeriodicSync()
      }

      // Register background sync with service worker
      await this.registerBackgroundSync()

      console.log('🔄 Background sync service initialized')
    } catch (error) {
      console.error('❌ Failed to initialize background sync:', error)
      throw error
    }
  }

  /**
   * Add item to sync queue
   */
  public async addToSyncQueue(
    type: SyncItem['type'],
    data: any,
    endpoint: string,
    method: SyncItem['method'] = 'POST',
    priority: SyncItem['priority'] = 'normal',
    metadata?: SyncItem['metadata']
  ): Promise<string> {
    const syncItem: SyncItem = {
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      endpoint,
      method,
      timestamp: Date.now(),
      retryCount: 0,
      priority,
      metadata,
    }

    try {
      // Add to memory queue
      this.syncQueue.set(syncItem.id, syncItem)

      // Save to IndexedDB
      await this.saveSyncItem(syncItem)

      // Update stats
      this.stats.pendingItems = this.syncQueue.size

      // Trigger immediate sync if online and high priority
      if (this.isOnline && (priority === 'critical' || priority === 'high')) {
        this.triggerSync()
      }

      console.log(`🔄 Added ${type} item to sync queue:`, syncItem.id)
      return syncItem.id
    } catch (error) {
      console.error('❌ Failed to add item to sync queue:', error)
      throw error
    }
  }

  /**
   * Trigger immediate sync
   */
  public async triggerSync(): Promise<void> {
    if (this.isSyncing || !this.isOnline || this.syncQueue.size === 0) {
      return
    }

    this.isSyncing = true
    this.stats.isSyncing = true

    try {
      // Get items sorted by priority
      const items = Array.from(this.syncQueue.values())
        .sort(
          (a, b) =>
            this.config.priorities[b.priority] -
            this.config.priorities[a.priority]
        )
        .slice(0, this.config.batchSize)

      console.log(`🔄 Syncing ${items.length} items...`)

      // Process items in parallel
      const syncPromises = items.map(item => this.syncItem(item))
      const results = await Promise.allSettled(syncPromises)

      // Handle results
      let successCount = 0
      let errorCount = 0

      results.forEach((result, index) => {
        const item = items[index]

        if (result.status === 'fulfilled') {
          // Success - remove from queue
          this.syncQueue.delete(item.id)
          this.removeSyncItem(item.id)
          successCount++
        } else {
          // Error - increment retry count
          item.retryCount++
          if (item.retryCount >= this.config.maxRetries) {
            // Max retries reached - remove item
            this.syncQueue.delete(item.id)
            this.removeSyncItem(item.id)
            console.error(`❌ Max retries reached for sync item: ${item.id}`)
          } else {
            // Update retry count in storage
            this.saveSyncItem(item)
          }
          errorCount++
        }
      })

      // Update stats
      this.stats.lastSyncTime = Date.now()
      this.stats.pendingItems = this.syncQueue.size
      this.stats.syncErrors += errorCount
      this.stats.totalSynced += successCount

      console.log(
        `✅ Sync completed: ${successCount} success, ${errorCount} errors`
      )

      // Emit sync completed event
      this.emitSyncEvent('completed', {
        successCount,
        errorCount,
        pendingItems: this.stats.pendingItems,
      })
    } catch (error) {
      console.error('❌ Sync failed:', error)
      this.stats.syncErrors++
      this.emitSyncEvent('error', error)
    } finally {
      this.isSyncing = false
      this.stats.isSyncing = false
    }
  }

  /**
   * Sync individual item
   */
  private async syncItem(item: SyncItem): Promise<void> {
    try {
      // Add retry delay for failed items
      if (item.retryCount > 0) {
        const delay =
          this.config.retryDelayMs * Math.pow(2, item.retryCount - 1)
        await new Promise(resolve => setTimeout(resolve, delay))
      }

      // Make API request
      const response = await fetch(item.endpoint, {
        method: item.method,
        headers: {
          'Content-Type': 'application/json',
          'X-Sync-Item-ID': item.id,
          'X-Sync-Timestamp': item.timestamp.toString(),
        },
        body: item.data ? JSON.stringify(item.data) : undefined,
      })

      if (!response.ok) {
        // Handle conflicts
        if (response.status === 409) {
          await this.handleConflict(item, response)
          return
        }

        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      console.log(`✅ Synced ${item.type} item: ${item.id}`)
    } catch (error) {
      console.error(`❌ Failed to sync item ${item.id}:`, error)
      throw error
    }
  }

  /**
   * Handle sync conflicts
   */
  private async handleConflict(
    item: SyncItem,
    response: Response
  ): Promise<void> {
    try {
      const conflictData = await response.json()

      if (this.config.conflictResolution === 'auto') {
        const resolution = await this.resolveConflict(item, conflictData)

        if (resolution.resolved) {
          // Update item with resolved data and retry
          item.data = resolution.data
          item.retryCount = 0
          await this.syncItem(item)
        } else {
          // Mark for manual resolution
          item.data = {
            ...item.data,
            _conflict: true,
            _conflictData: conflictData,
            _requiresManualResolution: true,
          }
          await this.saveSyncItem(item)
        }
      } else {
        // Manual resolution required
        item.data = {
          ...item.data,
          _conflict: true,
          _conflictData: conflictData,
          _requiresManualResolution: true,
        }
        await this.saveSyncItem(item)
      }
    } catch (error) {
      console.error('❌ Failed to handle conflict:', error)
      throw error
    }
  }

  /**
   * Resolve conflict automatically
   */
  private async resolveConflict(
    item: SyncItem,
    conflictData: any
  ): Promise<ConflictResolution> {
    // Implement conflict resolution strategies based on item type
    switch (item.type) {
      case 'temperature':
        // For temperature readings, use server data (more recent)
        return {
          strategy: 'server_wins',
          resolved: true,
          data: conflictData.serverData,
          timestamp: Date.now(),
        }

      case 'task':
        // For tasks, merge if possible
        return {
          strategy: 'merge',
          resolved: true,
          data: this.mergeTaskData(item.data, conflictData.serverData),
          timestamp: Date.now(),
        }

      case 'product':
        // For products, use client data (user edits)
        return {
          strategy: 'client_wins',
          resolved: true,
          data: item.data,
          timestamp: Date.now(),
        }

      default:
        // Default to server wins
        return {
          strategy: 'server_wins',
          resolved: true,
          data: conflictData.serverData,
          timestamp: Date.now(),
        }
    }
  }

  /**
   * Merge task data intelligently
   */
  private mergeTaskData(clientData: any, serverData: any): any {
    return {
      ...serverData,
      ...clientData,
      // Preserve server timestamps but update client changes
      updated_at: new Date().toISOString(),
      // Merge arrays intelligently
      assigned_staff: [
        ...new Set([
          ...(serverData.assigned_staff || []),
          ...(clientData.assigned_staff || []),
        ]),
      ],
    }
  }

  /**
   * Get sync status
   */
  public getSyncStatus(): SyncStatus {
    return {
      ...this.stats,
      pendingItems: this.syncQueue.size,
      nextSyncTime: this.syncInterval
        ? Date.now() + this.config.syncIntervalMs
        : null,
    }
  }

  /**
   * Clear sync queue
   */
  public async clearSyncQueue(): Promise<void> {
    try {
      this.syncQueue.clear()
      await this.clearIndexedDB()
      this.stats.pendingItems = 0
      console.log('🔄 Sync queue cleared')
    } catch (error) {
      console.error('❌ Failed to clear sync queue:', error)
      throw error
    }
  }

  /**
   * Update sync configuration
   */
  public updateConfig(newConfig: Partial<SyncConfig>): void {
    this.config = { ...this.config, ...newConfig }

    // Restart periodic sync if interval changed
    if (newConfig.syncIntervalMs && this.syncInterval) {
      window.clearInterval(this.syncInterval)
      this.startPeriodicSync()
    }
  }

  /**
   * Setup network status listeners
   */
  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true
      this.stats.isOnline = true
      this.startPeriodicSync()
      this.triggerSync()
      this.emitSyncEvent('online', null)
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
      this.stats.isOnline = false
      this.stopPeriodicSync()
      this.emitSyncEvent('offline', null)
    })
  }

  /**
   * Start periodic sync
   */
  private startPeriodicSync(): void {
    if (this.syncInterval) {
      window.clearInterval(this.syncInterval)
    }

    this.syncInterval = window.setInterval(() => {
      if (this.isOnline && !this.isSyncing && this.syncQueue.size > 0) {
        this.triggerSync()
      }
    }, this.config.syncIntervalMs)
  }

  /**
   * Stop periodic sync
   */
  private stopPeriodicSync(): void {
    if (this.syncInterval) {
      window.clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  /**
   * Register background sync with service worker
   */
  private async registerBackgroundSync(): Promise<void> {
    if (
      'serviceWorker' in navigator &&
      'sync' in window.ServiceWorkerRegistration.prototype
    ) {
      try {
        const registration = await navigator.serviceWorker.ready
        await registration.sync.register('haccp-background-sync')
      } catch (error) {
        console.warn('⚠️ Background sync registration failed:', error)
      }
    }
  }

  /**
   * Emit sync events
   */
  private emitSyncEvent(type: string, data: any): void {
    const event = new CustomEvent('sync-event', {
      detail: { type, data, timestamp: Date.now() },
    })
    window.dispatchEvent(event)
  }

  /**
   * Load sync queue from IndexedDB
   */
  private async loadSyncQueue(): Promise<void> {
    try {
      const db = await this.openIndexedDB()
      const transaction = db.transaction(['syncQueue'], 'readonly')
      const store = transaction.objectStore('syncQueue')
      const items = await store.getAll()

      this.syncQueue.clear()
      items.forEach(item => {
        this.syncQueue.set(item.id, item)
      })

      this.stats.pendingItems = this.syncQueue.size
    } catch (error) {
      console.warn('⚠️ Failed to load sync queue:', error)
    }
  }

  /**
   * Save sync item to IndexedDB
   */
  private async saveSyncItem(item: SyncItem): Promise<void> {
    try {
      const db = await this.openIndexedDB()
      const transaction = db.transaction(['syncQueue'], 'readwrite')
      const store = transaction.objectStore('syncQueue')
      await store.put(item)
    } catch (error) {
      console.error('❌ Failed to save sync item:', error)
    }
  }

  /**
   * Remove sync item from IndexedDB
   */
  private async removeSyncItem(id: string): Promise<void> {
    try {
      const db = await this.openIndexedDB()
      const transaction = db.transaction(['syncQueue'], 'readwrite')
      const store = transaction.objectStore('syncQueue')
      await store.delete(id)
    } catch (error) {
      console.error('❌ Failed to remove sync item:', error)
    }
  }

  /**
   * Clear IndexedDB sync queue
   */
  private async clearIndexedDB(): Promise<void> {
    try {
      const db = await this.openIndexedDB()
      const transaction = db.transaction(['syncQueue'], 'readwrite')
      const store = transaction.objectStore('syncQueue')
      await store.clear()
    } catch (error) {
      console.error('❌ Failed to clear IndexedDB:', error)
    }
  }

  /**
   * Open IndexedDB connection
   */
  private async openIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('HACCPBusinessManager', 1)

      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains('syncQueue')) {
          const store = db.createObjectStore('syncQueue', { keyPath: 'id' })
          store.createIndex('timestamp', 'timestamp')
          store.createIndex('priority', 'priority')
          store.createIndex('type', 'type')
        }
      }

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    this.stopPeriodicSync()
    this.syncQueue.clear()
    window.removeEventListener('online', () => {})
    window.removeEventListener('offline', () => {})
  }
}

// Export singleton
export const backgroundSyncService = new BackgroundSyncService()

export default backgroundSyncService
