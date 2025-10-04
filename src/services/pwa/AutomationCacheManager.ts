/**
 * B.10.4 Advanced Mobile & PWA - Automation Cache Manager
 * Intelligent caching for automation data with offline support
 */

export interface CacheStrategy {
  type:
    | 'networkFirst'
    | 'cacheFirst'
    | 'staleWhileRevalidate'
    | 'networkOnly'
    | 'cacheOnly'
  maxAge: number // milliseconds
  maxEntries: number
  enableCompression: boolean
}

export interface CacheEntry<T = any> {
  key: string
  data: T
  timestamp: Date
  lastAccessed: Date
  accessCount: number
  size: number
  ttl: number
  version: string
  tags: string[]
  compressed: boolean
}

export interface CacheStats {
  totalEntries: number
  totalSize: number
  hitRate: number
  missRate: number
  evictionCount: number
  compressionRatio: number
  averageAccessTime: number
}

export interface CacheConfig {
  defaultStrategy: CacheStrategy
  maxTotalSize: number // bytes
  enableIndexedDB: boolean
  enableCompression: boolean
  compressionThreshold: number // bytes
  cleanupInterval: number // milliseconds
}

export class AutomationCacheManager {
  private cache: Map<string, CacheEntry> = new Map()
  private config: CacheConfig
  private stats: CacheStats
  private cleanupTimer: NodeJS.Timeout | null = null
  private db: IDBDatabase | null = null
  private isInitialized = false

  constructor() {
    this.config = {
      defaultStrategy: {
        type: 'staleWhileRevalidate',
        maxAge: 5 * 60 * 1000, // 5 minutes
        maxEntries: 1000,
        enableCompression: true,
      },
      maxTotalSize: 50 * 1024 * 1024, // 50MB
      enableIndexedDB: true,
      enableCompression: true,
      compressionThreshold: 1024, // 1KB
      cleanupInterval: 5 * 60 * 1000, // 5 minutes
    }

    this.stats = {
      totalEntries: 0,
      totalSize: 0,
      hitRate: 0,
      missRate: 0,
      evictionCount: 0,
      compressionRatio: 0,
      averageAccessTime: 0,
    }
  }

  /**
   * Initialize cache manager
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    console.log('💾 Initializing Automation Cache Manager...')

    try {
      // Initialize IndexedDB if enabled
      if (this.config.enableIndexedDB) {
        await this.initializeIndexedDB()
      }

      // Load existing cache from storage
      await this.loadCacheFromStorage()

      // Start cleanup timer
      this.startCleanupTimer()

      this.isInitialized = true
      console.log('✅ Automation Cache Manager initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize cache manager:', error)
      throw error
    }
  }

  /**
   * Get data from cache with strategy
   */
  public async get<T>(
    key: string,
    strategy?: Partial<CacheStrategy>
  ): Promise<T | null> {
    const startTime = Date.now()
    const effectiveStrategy = { ...this.config.defaultStrategy, ...strategy }

    try {
      // Check memory cache first
      let entry = this.cache.get(key)

      if (!entry && this.config.enableIndexedDB) {
        // Try IndexedDB
        entry = await this.getFromIndexedDB(key)
        if (entry) {
          this.cache.set(key, entry)
        }
      }

      if (!entry) {
        this.stats.missRate++
        return null
      }

      // Check if expired
      if (this.isExpired(entry)) {
        this.cache.delete(key)
        this.stats.missRate++
        return null
      }

      // Update access info
      entry.lastAccessed = new Date()
      entry.accessCount++

      // Update stats
      this.stats.hitRate++
      this.stats.averageAccessTime =
        (this.stats.averageAccessTime + (Date.now() - startTime)) / 2

      // Handle strategy-specific behavior
      if (effectiveStrategy.type === 'staleWhileRevalidate') {
        // Return cached data immediately, but refresh in background
        this.refreshInBackground(key, effectiveStrategy)
      }

      return entry.data as T
    } catch (error) {
      console.error(`Failed to get cache entry ${key}:`, error)
      this.stats.missRate++
      return null
    }
  }

  /**
   * Set data in cache
   */
  public async set<T>(
    key: string,
    data: T,
    options?: {
      ttl?: number
      tags?: string[]
      strategy?: Partial<CacheStrategy>
    }
  ): Promise<void> {
    try {
      const effectiveStrategy = {
        ...this.config.defaultStrategy,
        ...options?.strategy,
      }
      const ttl = options?.ttl || effectiveStrategy.maxAge
      const tags = options?.tags || []

      // Calculate size
      const dataString = JSON.stringify(data)
      let size = new Blob([dataString]).size
      let compressedData = data

      // Compress if enabled and above threshold
      if (
        this.config.enableCompression &&
        size > this.config.compressionThreshold
      ) {
        try {
          compressedData = await this.compress(data)
          size = new Blob([JSON.stringify(compressedData)]).size
        } catch (error) {
          console.warn('Compression failed, storing uncompressed:', error)
        }
      }

      const entry: CacheEntry<T> = {
        key,
        data: compressedData,
        timestamp: new Date(),
        lastAccessed: new Date(),
        accessCount: 1,
        size,
        ttl,
        version: '1.0',
        tags,
        compressed: compressedData !== data,
      }

      // Store in memory cache
      this.cache.set(key, entry)

      // Store in IndexedDB if enabled
      if (this.config.enableIndexedDB) {
        await this.setInIndexedDB(entry)
      }

      // Check size limits and evict if necessary
      await this.enforceSizeLimits()

      console.log(`💾 Cached data for key: ${key} (${size} bytes)`)
    } catch (error) {
      console.error(`Failed to set cache entry ${key}:`, error)
      throw error
    }
  }

  /**
   * Delete data from cache
   */
  public async delete(key: string): Promise<boolean> {
    try {
      const deleted = this.cache.delete(key)

      if (this.config.enableIndexedDB) {
        await this.deleteFromIndexedDB(key)
      }

      if (deleted) {
        console.log(`💾 Deleted cache entry: ${key}`)
      }

      return deleted
    } catch (error) {
      console.error(`Failed to delete cache entry ${key}:`, error)
      return false
    }
  }

  /**
   * Clear all cache data
   */
  public async clear(): Promise<void> {
    try {
      this.cache.clear()

      if (this.config.enableIndexedDB) {
        await this.clearIndexedDB()
      }

      this.stats = {
        totalEntries: 0,
        totalSize: 0,
        hitRate: 0,
        missRate: 0,
        evictionCount: 0,
        compressionRatio: 0,
        averageAccessTime: 0,
      }

      console.log('💾 Cleared all cache data')
    } catch (error) {
      console.error('Failed to clear cache:', error)
      throw error
    }
  }

  /**
   * Get cache statistics
   */
  public getStats(): CacheStats {
    this.updateStats()
    return { ...this.stats }
  }

  /**
   * Get cache entries by tag
   */
  public async getByTag(tag: string): Promise<CacheEntry[]> {
    const entries: CacheEntry[] = []

    for (const entry of this.cache.values()) {
      if (entry.tags.includes(tag)) {
        entries.push(entry)
      }
    }

    return entries
  }

  /**
   * Delete cache entries by tag
   */
  public async deleteByTag(tag: string): Promise<number> {
    let deletedCount = 0
    const keysToDelete: string[] = []

    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(tag)) {
        keysToDelete.push(key)
      }
    }

    for (const key of keysToDelete) {
      if (await this.delete(key)) {
        deletedCount++
      }
    }

    console.log(`💾 Deleted ${deletedCount} cache entries with tag: ${tag}`)
    return deletedCount
  }

  /**
   * Preload automation data
   */
  public async preloadAutomationData(): Promise<void> {
    console.log('💾 Preloading automation data...')

    try {
      // Preload automation rules
      await this.preloadAutomationRules()

      // Preload automation executions
      await this.preloadAutomationExecutions()

      // Preload alert data
      await this.preloadAlertData()

      console.log('✅ Automation data preloaded successfully')
    } catch (error) {
      console.error('Failed to preload automation data:', error)
    }
  }

  /**
   * Private helper methods
   */

  private async initializeIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('AutomationCache', 1)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result

        if (!db.objectStoreNames.contains('cache')) {
          const store = db.createObjectStore('cache', { keyPath: 'key' })
          store.createIndex('timestamp', 'timestamp', { unique: false })
          store.createIndex('tags', 'tags', { unique: false, multiEntry: true })
        }
      }
    })
  }

  private async loadCacheFromStorage(): Promise<void> {
    try {
      const stored = localStorage.getItem('automation_cache_manager')
      if (stored) {
        const data = JSON.parse(stored)
        this.cache = new Map(data.entries)
        this.stats = data.stats
        console.log('💾 Loaded cache from storage')
      }
    } catch (error) {
      console.warn('Failed to load cache from storage:', error)
    }
  }

  private async saveCacheToStorage(): Promise<void> {
    try {
      const data = {
        entries: Array.from(this.cache.entries()),
        stats: this.stats,
      }
      localStorage.setItem('automation_cache_manager', JSON.stringify(data))
    } catch (error) {
      console.warn('Failed to save cache to storage:', error)
    }
  }

  private async getFromIndexedDB(key: string): Promise<CacheEntry | undefined> {
    if (!this.db) return undefined

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readonly')
      const store = transaction.objectStore('cache')
      const request = store.get(key)

      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  private async setInIndexedDB(entry: CacheEntry): Promise<void> {
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite')
      const store = transaction.objectStore('cache')
      const request = store.put(entry)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  private async deleteFromIndexedDB(key: string): Promise<void> {
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite')
      const store = transaction.objectStore('cache')
      const request = store.delete(key)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  private async clearIndexedDB(): Promise<void> {
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite')
      const store = transaction.objectStore('cache')
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp.getTime() > entry.ttl
  }

  private async enforceSizeLimits(): Promise<void> {
    let totalSize = 0
    for (const entry of this.cache.values()) {
      totalSize += entry.size
    }

    if (totalSize > this.config.maxTotalSize) {
      await this.evictOldEntries()
    }
  }

  private async evictOldEntries(): Promise<void> {
    // Sort entries by last accessed time (oldest first)
    const entries = Array.from(this.cache.entries()).sort(
      ([, a], [, b]) => a.lastAccessed.getTime() - b.lastAccessed.getTime()
    )

    let totalSize = 0
    for (const [, entry] of entries) {
      totalSize += entry.size
    }

    // Remove oldest entries until under limit
    for (const [key, entry] of entries) {
      if (totalSize <= this.config.maxTotalSize * 0.8) break // Leave some headroom

      await this.delete(key)
      totalSize -= entry.size
      this.stats.evictionCount++
    }

    console.log(`💾 Evicted old cache entries, new size: ${totalSize} bytes`)
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpiredEntries()
    }, this.config.cleanupInterval)
  }

  private async cleanupExpiredEntries(): Promise<void> {
    const expiredKeys: string[] = []

    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        expiredKeys.push(key)
      }
    }

    for (const key of expiredKeys) {
      await this.delete(key)
    }

    if (expiredKeys.length > 0) {
      console.log(`💾 Cleaned up ${expiredKeys.length} expired cache entries`)
    }
  }

  private async refreshInBackground(
    key: string,
    strategy: CacheStrategy
  ): Promise<void> {
    // In real implementation, this would fetch fresh data from server
    console.log(`💾 Refreshing cache entry in background: ${key}`)
  }

  private async compress(data: any): Promise<any> {
    // Simple compression simulation - in real implementation, use actual compression
    return data
  }

  private async preloadAutomationRules(): Promise<void> {
    // In real implementation, this would fetch and cache automation rules
    console.log('💾 Preloading automation rules...')
  }

  private async preloadAutomationExecutions(): Promise<void> {
    // In real implementation, this would fetch and cache automation executions
    console.log('💾 Preloading automation executions...')
  }

  private async preloadAlertData(): Promise<void> {
    // In real implementation, this would fetch and cache alert data
    console.log('💾 Preloading alert data...')
  }

  private updateStats(): void {
    this.stats.totalEntries = this.cache.size
    this.stats.totalSize = Array.from(this.cache.values()).reduce(
      (sum, entry) => sum + entry.size,
      0
    )

    const totalRequests = this.stats.hitRate + this.stats.missRate
    if (totalRequests > 0) {
      this.stats.hitRate = (this.stats.hitRate / totalRequests) * 100
      this.stats.missRate = (this.stats.missRate / totalRequests) * 100
    }
  }

  /**
   * Stop cache manager
   */
  public async stop(): Promise<void> {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }

    await this.saveCacheToStorage()
    this.isInitialized = false
    console.log('💾 Automation Cache Manager stopped')
  }
}

// Export singleton instance
export const automationCacheManager = new AutomationCacheManager()

export default automationCacheManager
