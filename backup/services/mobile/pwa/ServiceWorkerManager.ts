/**
 * Advanced Service Worker Manager - B.10.4 Advanced Mobile & PWA
 * Handles service worker lifecycle, updates, and performance monitoring
 */

interface ServiceWorkerConfig {
  updateCheckInterval: number // milliseconds
  forceUpdate: boolean
  skipWaiting: boolean
  cacheStrategy: 'aggressive' | 'balanced' | 'conservative'
  enableAnalytics: boolean
  enablePerformanceMonitoring: boolean
}

interface ServiceWorkerStatus {
  isRegistered: boolean
  isActive: boolean
  isInstalling: boolean
  isWaiting: boolean
  hasUpdate: boolean
  lastUpdateCheck: number | null
  version: string | null
  registration: ServiceWorkerRegistration | null
}

interface UpdateInfo {
  available: boolean
  version: string | null
  timestamp: number
  downloadSize?: number
  changes?: string[]
}

interface PerformanceMetrics {
  loadTime: number
  cacheHitRate: number
  networkRequests: number
  offlineRequests: number
  syncOperations: number
  lastUpdated: number
}

export class ServiceWorkerManager {
  private config: ServiceWorkerConfig = {
    updateCheckInterval: 60000, // 1 minute
    forceUpdate: false,
    skipWaiting: true,
    cacheStrategy: 'balanced',
    enableAnalytics: true,
    enablePerformanceMonitoring: true,
  }

  private status: ServiceWorkerStatus = {
    isRegistered: false,
    isActive: false,
    isInstalling: false,
    isWaiting: false,
    hasUpdate: false,
    lastUpdateCheck: null,
    version: null,
    registration: null,
  }

  private updateCheckInterval: NodeJS.Timeout | null = null
  private performanceMetrics: PerformanceMetrics = {
    loadTime: 0,
    cacheHitRate: 0,
    networkRequests: 0,
    offlineRequests: 0,
    syncOperations: 0,
    lastUpdated: Date.now(),
  }

  /**
   * Initialize service worker manager
   */
  public async initialize(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      console.warn('⚠️ Service Worker not supported')
      return
    }

    try {
      // Register service worker
      await this.registerServiceWorker()

      // Set up update checking
      this.startUpdateChecking()

      // Set up performance monitoring
      if (this.config.enablePerformanceMonitoring) {
        this.startPerformanceMonitoring()
      }

      console.log('🔧 Service Worker Manager initialized')
    } catch (error) {
      console.error('❌ Failed to initialize Service Worker Manager:', error)
      throw error
    }
  }

  /**
   * Register service worker
   */
  public async registerServiceWorker(): Promise<ServiceWorkerRegistration> {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      })

      this.status.registration = registration
      this.status.isRegistered = true

      // Set up event listeners
      this.setupEventListeners(registration)

      // Check for existing service worker
      if (registration.active) {
        this.status.isActive = true
        this.status.version = await this.getServiceWorkerVersion()
      }

      if (registration.installing) {
        this.status.isInstalling = true
      }

      if (registration.waiting) {
        this.status.isWaiting = true
        this.status.hasUpdate = true
      }

      console.log('✅ Service Worker registered successfully')
      return registration
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error)
      throw error
    }
  }

  /**
   * Check for updates
   */
  public async checkForUpdates(): Promise<UpdateInfo> {
    if (!this.status.registration) {
      throw new Error('Service Worker not registered')
    }

    try {
      const registration = this.status.registration
      await registration.update()

      this.status.lastUpdateCheck = Date.now()

      const updateInfo: UpdateInfo = {
        available: this.status.hasUpdate,
        version: this.status.version,
        timestamp: Date.now(),
      }

      // Get update details if available
      if (this.status.hasUpdate && registration.waiting) {
        updateInfo.changes = await this.getUpdateChanges()
      }

      console.log(
        `🔍 Update check completed: ${updateInfo.available ? 'Update available' : 'No updates'}`
      )
      return updateInfo
    } catch (error) {
      console.error('❌ Update check failed:', error)
      throw error
    }
  }

  /**
   * Apply update
   */
  public async applyUpdate(): Promise<void> {
    if (!this.status.hasUpdate || !this.status.registration?.waiting) {
      throw new Error('No update available')
    }

    try {
      const waitingWorker = this.status.registration.waiting

      // Skip waiting to activate new service worker
      if (this.config.skipWaiting) {
        waitingWorker.postMessage({ type: 'SKIP_WAITING' })
      }

      // Reload page to use new service worker
      window.location.reload()
    } catch (error) {
      console.error('❌ Failed to apply update:', error)
      throw error
    }
  }

  /**
   * Unregister service worker
   */
  public async unregister(): Promise<boolean> {
    if (!this.status.registration) {
      return false
    }

    try {
      const result = await this.status.registration.unregister()

      if (result) {
        this.status.isRegistered = false
        this.status.registration = null
        this.stopUpdateChecking()
        console.log('🗑️ Service Worker unregistered')
      }

      return result
    } catch (error) {
      console.error('❌ Failed to unregister Service Worker:', error)
      return false
    }
  }

  /**
   * Get service worker status
   */
  public getStatus(): ServiceWorkerStatus {
    return { ...this.status }
  }

  /**
   * Get performance metrics
   */
  public getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics }
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<ServiceWorkerConfig>): void {
    this.config = { ...this.config, ...newConfig }

    // Restart update checking if interval changed
    if (newConfig.updateCheckInterval) {
      this.stopUpdateChecking()
      this.startUpdateChecking()
    }
  }

  /**
   * Clear all caches
   */
  public async clearCaches(): Promise<void> {
    if (!('caches' in window)) {
      throw new Error('Cache API not supported')
    }

    try {
      const cacheNames = await caches.keys()
      await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)))

      console.log(`🗑️ Cleared ${cacheNames.length} caches`)
    } catch (error) {
      console.error('❌ Failed to clear caches:', error)
      throw error
    }
  }

  /**
   * Get cache statistics
   */
  public async getCacheStats(): Promise<{
    totalCaches: number
    totalSize: number
    cacheDetails: Array<{ name: string; size: number; entries: number }>
  }> {
    if (!('caches' in window)) {
      throw new Error('Cache API not supported')
    }

    try {
      const cacheNames = await caches.keys()
      const cacheDetails = []
      let totalSize = 0

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName)
        const keys = await cache.keys()
        let size = 0

        // Estimate cache size (rough calculation)
        for (const request of keys) {
          const response = await cache.match(request)
          if (response) {
            const blob = await response.blob()
            size += blob.size
          }
        }

        cacheDetails.push({
          name: cacheName,
          size,
          entries: keys.length,
        })

        totalSize += size
      }

      return {
        totalCaches: cacheNames.length,
        totalSize,
        cacheDetails,
      }
    } catch (error) {
      console.error('❌ Failed to get cache stats:', error)
      throw error
    }
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(registration: ServiceWorkerRegistration): void {
    // Handle service worker updates
    registration.addEventListener('updatefound', () => {
      console.log('🔄 Service Worker update found')

      const newWorker = registration.installing
      if (newWorker) {
        this.status.isInstalling = true

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New service worker available
              this.status.isInstalling = false
              this.status.isWaiting = true
              this.status.hasUpdate = true

              this.emitUpdateEvent('available', {
                version: this.status.version,
                timestamp: Date.now(),
              })
            } else {
              // Service worker installed for first time
              this.status.isInstalling = false
              this.status.isActive = true

              this.emitUpdateEvent('installed', {
                timestamp: Date.now(),
              })
            }
          }
        })
      }
    })

    // Handle service worker controller changes
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('🔄 Service Worker controller changed')
      this.status.isActive = true
      this.status.isWaiting = false
      this.status.hasUpdate = false

      this.emitUpdateEvent('activated', {
        timestamp: Date.now(),
      })
    })

    // Handle service worker messages
    navigator.serviceWorker.addEventListener('message', event => {
      this.handleServiceWorkerMessage(event)
    })
  }

  /**
   * Handle messages from service worker
   */
  private handleServiceWorkerMessage(event: MessageEvent): void {
    const { type, data } = event.data

    switch (type) {
      case 'CACHE_STATS':
        this.updatePerformanceMetrics({ cacheHitRate: data.cacheHitRate })
        break

      case 'SYNC_COMPLETED':
        this.updatePerformanceMetrics({ syncOperations: data.count })
        break

      case 'NETWORK_REQUEST':
        this.updatePerformanceMetrics({
          networkRequests: data.count,
          offlineRequests: data.offlineCount,
        })
        break

      default:
        console.log('📨 Unknown message from service worker:', type, data)
    }
  }

  /**
   * Start periodic update checking
   */
  private startUpdateChecking(): void {
    this.updateCheckInterval = setInterval(async () => {
      try {
        await this.checkForUpdates()
      } catch (error) {
        console.warn('⚠️ Periodic update check failed:', error)
      }
    }, this.config.updateCheckInterval)
  }

  /**
   * Stop periodic update checking
   */
  private stopUpdateChecking(): void {
    if (this.updateCheckInterval) {
      clearInterval(this.updateCheckInterval)
      this.updateCheckInterval = null
    }
  }

  /**
   * Start performance monitoring
   */
  private startPerformanceMonitoring(): void {
    // Monitor page load time
    window.addEventListener('load', () => {
      const loadTime = performance.now()
      this.updatePerformanceMetrics({ loadTime })
    })

    // Monitor network requests
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            this.updatePerformanceMetrics({ loadTime: entry.duration })
          }
        }
      })

      observer.observe({ entryTypes: ['navigation'] })
    }
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(updates: Partial<PerformanceMetrics>): void {
    this.performanceMetrics = {
      ...this.performanceMetrics,
      ...updates,
      lastUpdated: Date.now(),
    }
  }

  /**
   * Get service worker version
   */
  private async getServiceWorkerVersion(): Promise<string | null> {
    try {
      if (this.status.registration?.active) {
        const response = await fetch('/sw.js?v=' + Date.now())
        const text = await response.text()

        // Extract version from service worker content
        const versionMatch = text.match(
          /const CACHE_VERSION = ['"]([^'"]+)['"]/
        )
        return versionMatch ? versionMatch[1] : null
      }
    } catch (error) {
      console.warn('⚠️ Failed to get service worker version:', error)
    }

    return null
  }

  /**
   * Get update changes
   */
  private async getUpdateChanges(): Promise<string[]> {
    try {
      // This would typically fetch from a changelog or API
      // For now, return a generic message
      return ['Performance improvements', 'Bug fixes', 'New features']
    } catch (error) {
      console.warn('⚠️ Failed to get update changes:', error)
      return []
    }
  }

  /**
   * Emit update events
   */
  private emitUpdateEvent(type: string, data: any): void {
    const event = new CustomEvent('service-worker-update', {
      detail: { type, data, timestamp: Date.now() },
    })
    window.dispatchEvent(event)
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    this.stopUpdateChecking()
    this.status.registration = null
  }
}

// Export singleton
export const serviceWorkerManager = new ServiceWorkerManager()

export default serviceWorkerManager
