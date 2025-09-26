/**
 * B.10.4 Advanced Mobile & PWA - Automation Service Worker
 * Background automation sync and offline automation support
 */

export interface AutomationServiceWorkerConfig {
  enableBackgroundSync: boolean
  enableOfflineExecution: boolean
  enablePushNotifications: boolean
  syncInterval: number // milliseconds
  maxRetries: number
  cacheStrategy: 'networkFirst' | 'cacheFirst' | 'staleWhileRevalidate'
}

export interface AutomationSyncEvent {
  type: 'automation_sync' | 'offline_execution' | 'push_notification'
  data: any
  timestamp: Date
  retryCount: number
}

export interface AutomationCacheEntry {
  key: string
  data: any
  timestamp: Date
  ttl: number // time to live in milliseconds
  version: string
}

export class AutomationServiceWorker {
  private config: AutomationServiceWorkerConfig
  private cache: Map<string, AutomationCacheEntry> = new Map()
  private syncQueue: AutomationSyncEvent[] = []
  private isOnline = true
  private syncInProgress = false

  constructor() {
    this.config = {
      enableBackgroundSync: true,
      enableOfflineExecution: true,
      enablePushNotifications: true,
      syncInterval: 30000, // 30 seconds
      maxRetries: 3,
      cacheStrategy: 'staleWhileRevalidate',
    }

    this.setupServiceWorker()
  }

  /**
   * Initialize automation service worker
   */
  public async initialize(): Promise<void> {
    console.log('🔧 Initializing Automation Service Worker...')

    try {
      // Register service worker
      await this.registerServiceWorker()

      // Setup event listeners
      this.setupEventListeners()

      // Start background sync
      this.startBackgroundSync()

      console.log('✅ Automation Service Worker initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize automation service worker:', error)
      throw error
    }
  }

  /**
   * Register service worker
   */
  private async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register(
          '/automation-sw.js',
          {
            scope: '/',
          }
        )

        console.log(
          '🔧 Automation service worker registered:',
          registration.scope
        )

        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (
                newWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                console.log('🔧 New automation service worker available')
                this.notifyUpdateAvailable()
              }
            })
          }
        })
      } catch (error) {
        console.error('Failed to register automation service worker:', error)
        throw error
      }
    } else {
      throw new Error('Service workers not supported')
    }
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Network status
    window.addEventListener('online', () => {
      this.isOnline = true
      console.log('🔧 Network: Online - starting sync')
      this.processSyncQueue()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
      console.log('🔧 Network: Offline - switching to offline mode')
    })

    // Service worker messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', event => {
        this.handleServiceWorkerMessage(event.data)
      })
    }

    // Page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.isOnline) {
        this.processSyncQueue()
      }
    })
  }

  /**
   * Start background sync
   */
  private startBackgroundSync(): void {
    if (!this.config.enableBackgroundSync) return

    setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.performBackgroundSync()
      }
    }, this.config.syncInterval)
  }

  /**
   * Perform background sync
   */
  private async performBackgroundSync(): Promise<void> {
    if (this.syncInProgress) return

    this.syncInProgress = true

    try {
      console.log('🔧 Performing background automation sync...')

      // Sync automation rules
      await this.syncAutomationRules()

      // Sync automation executions
      await this.syncAutomationExecutions()

      // Sync offline data
      await this.syncOfflineData()

      // Process sync queue
      await this.processSyncQueue()

      console.log('✅ Background automation sync completed')
    } catch (error) {
      console.error('❌ Background automation sync failed:', error)
    } finally {
      this.syncInProgress = false
    }
  }

  /**
   * Sync automation rules
   */
  private async syncAutomationRules(): Promise<void> {
    try {
      // In real implementation, this would fetch from server
      const response = await fetch('/api/automation/rules', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
      })

      if (response.ok) {
        const rules = await response.json()
        this.cacheAutomationRules(rules)
        console.log(`🔧 Synced ${rules.length} automation rules`)
      }
    } catch (error) {
      console.warn('Failed to sync automation rules:', error)
    }
  }

  /**
   * Sync automation executions
   */
  private async syncAutomationExecutions(): Promise<void> {
    try {
      // In real implementation, this would sync execution history
      const response = await fetch('/api/automation/executions', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const executions = await response.json()
        this.cacheAutomationExecutions(executions)
        console.log(`🔧 Synced ${executions.length} automation executions`)
      }
    } catch (error) {
      console.warn('Failed to sync automation executions:', error)
    }
  }

  /**
   * Sync offline data
   */
  private async syncOfflineData(): Promise<void> {
    try {
      // Get offline data from IndexedDB or localStorage
      const offlineData = await this.getOfflineData()

      if (offlineData && offlineData.length > 0) {
        const response = await fetch('/api/automation/sync-offline', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ data: offlineData }),
        })

        if (response.ok) {
          await this.clearOfflineData()
          console.log(`🔧 Synced ${offlineData.length} offline data entries`)
        }
      }
    } catch (error) {
      console.warn('Failed to sync offline data:', error)
    }
  }

  /**
   * Process sync queue
   */
  private async processSyncQueue(): Promise<void> {
    if (this.syncQueue.length === 0) return

    console.log(`🔧 Processing ${this.syncQueue.length} queued sync events`)

    const events = [...this.syncQueue]
    this.syncQueue = []

    for (const event of events) {
      try {
        await this.processSyncEvent(event)
      } catch (error) {
        console.error(`Failed to process sync event ${event.type}:`, error)

        // Retry if under max retries
        if (event.retryCount < this.config.maxRetries) {
          event.retryCount++
          this.syncQueue.push(event)
        }
      }
    }
  }

  /**
   * Process individual sync event
   */
  private async processSyncEvent(event: AutomationSyncEvent): Promise<void> {
    switch (event.type) {
      case 'automation_sync':
        await this.syncAutomationData(event.data)
        break
      case 'offline_execution':
        await this.syncOfflineExecution(event.data)
        break
      case 'push_notification':
        await this.sendPushNotification(event.data)
        break
    }
  }

  /**
   * Queue sync event
   */
  public queueSyncEvent(type: AutomationSyncEvent['type'], data: any): void {
    const event: AutomationSyncEvent = {
      type,
      data,
      timestamp: new Date(),
      retryCount: 0,
    }

    this.syncQueue.push(event)
    console.log(`🔧 Queued sync event: ${type}`)

    // Try immediate processing if online
    if (this.isOnline) {
      this.processSyncQueue()
    }
  }

  /**
   * Cache automation rules
   */
  private cacheAutomationRules(rules: any[]): void {
    const cacheEntry: AutomationCacheEntry = {
      key: 'automation_rules',
      data: rules,
      timestamp: new Date(),
      ttl: 5 * 60 * 1000, // 5 minutes
      version: '1.0',
    }

    this.cache.set(cacheEntry.key, cacheEntry)
    this.saveCacheToStorage()
  }

  /**
   * Cache automation executions
   */
  private cacheAutomationExecutions(executions: any[]): void {
    const cacheEntry: AutomationCacheEntry = {
      key: 'automation_executions',
      data: executions,
      timestamp: new Date(),
      ttl: 2 * 60 * 1000, // 2 minutes
      version: '1.0',
    }

    this.cache.set(cacheEntry.key, cacheEntry)
    this.saveCacheToStorage()
  }

  /**
   * Get cached automation rules
   */
  public getCachedAutomationRules(): any[] | null {
    const entry = this.cache.get('automation_rules')
    if (!entry || this.isCacheExpired(entry)) {
      return null
    }
    return entry.data
  }

  /**
   * Get cached automation executions
   */
  public getCachedAutomationExecutions(): any[] | null {
    const entry = this.cache.get('automation_executions')
    if (!entry || this.isCacheExpired(entry)) {
      return null
    }
    return entry.data
  }

  /**
   * Check if cache entry is expired
   */
  private isCacheExpired(entry: AutomationCacheEntry): boolean {
    return Date.now() - entry.timestamp.getTime() > entry.ttl
  }

  /**
   * Save cache to storage
   */
  private saveCacheToStorage(): void {
    try {
      const cacheData = Array.from(this.cache.entries())
      localStorage.setItem('automation_cache', JSON.stringify(cacheData))
    } catch (error) {
      console.warn('Failed to save cache to storage:', error)
    }
  }

  /**
   * Load cache from storage
   */
  private loadCacheFromStorage(): void {
    try {
      const stored = localStorage.getItem('automation_cache')
      if (stored) {
        const cacheData = JSON.parse(stored)
        this.cache = new Map(cacheData)
        console.log('🔧 Loaded automation cache from storage')
      }
    } catch (error) {
      console.warn('Failed to load cache from storage:', error)
    }
  }

  /**
   * Get offline data
   */
  private async getOfflineData(): Promise<any[]> {
    try {
      const stored = localStorage.getItem('automation_offline_data')
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.warn('Failed to get offline data:', error)
      return []
    }
  }

  /**
   * Clear offline data
   */
  private async clearOfflineData(): Promise<void> {
    try {
      localStorage.removeItem('automation_offline_data')
    } catch (error) {
      console.warn('Failed to clear offline data:', error)
    }
  }

  /**
   * Handle service worker messages
   */
  private handleServiceWorkerMessage(data: any): void {
    switch (data.type) {
      case 'AUTOMATION_UPDATE':
        this.handleAutomationUpdate(data.payload)
        break
      case 'SYNC_REQUEST':
        this.performBackgroundSync()
        break
      case 'CACHE_UPDATE':
        this.handleCacheUpdate(data.payload)
        break
    }
  }

  /**
   * Handle automation update
   */
  private handleAutomationUpdate(payload: any): void {
    console.log('🔧 Received automation update:', payload)

    // Dispatch custom event for components to listen
    window.dispatchEvent(
      new CustomEvent('automationUpdate', {
        detail: payload,
      })
    )
  }

  /**
   * Handle cache update
   */
  private handleCacheUpdate(payload: any): void {
    console.log('🔧 Received cache update:', payload)

    // Update local cache
    if (payload.key && payload.data) {
      const entry: AutomationCacheEntry = {
        key: payload.key,
        data: payload.data,
        timestamp: new Date(),
        ttl: payload.ttl || 5 * 60 * 1000,
        version: payload.version || '1.0',
      }
      this.cache.set(payload.key, entry)
    }
  }

  /**
   * Sync automation data
   */
  private async syncAutomationData(data: any): Promise<void> {
    // In real implementation, this would sync with server
    console.log('🔧 Syncing automation data:', data)
  }

  /**
   * Sync offline execution
   */
  private async syncOfflineExecution(data: any): Promise<void> {
    // In real implementation, this would sync offline execution with server
    console.log('🔧 Syncing offline execution:', data)
  }

  /**
   * Send push notification
   */
  private async sendPushNotification(data: any): Promise<void> {
    // In real implementation, this would send push notification
    console.log('🔧 Sending push notification:', data)
  }

  /**
   * Notify update available
   */
  private notifyUpdateAvailable(): void {
    // Dispatch custom event for components to handle update
    window.dispatchEvent(
      new CustomEvent('serviceWorkerUpdate', {
        detail: { available: true },
      })
    )
  }

  /**
   * Get service worker status
   */
  public getStatus(): {
    registered: boolean
    online: boolean
    syncInProgress: boolean
    cacheSize: number
    queueSize: number
  } {
    return {
      registered: 'serviceWorker' in navigator,
      online: this.isOnline,
      syncInProgress: this.syncInProgress,
      cacheSize: this.cache.size,
      queueSize: this.syncQueue.length,
    }
  }

  /**
   * Stop automation service worker
   */
  public async stop(): Promise<void> {
    this.syncQueue = []
    this.cache.clear()
    console.log('🔧 Automation Service Worker stopped')
  }
}

// Export singleton instance
export const automationServiceWorker = new AutomationServiceWorker()

export default automationServiceWorker
