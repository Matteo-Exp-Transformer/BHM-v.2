/**
 * OfflineMapCache - B.8.4 Advanced Mobile Features
 * Map caching for offline usage in remote HACCP inspection locations
 */

import { LocationData, ConservationPointLocation } from './GPSService'

export interface MapTile {
  x: number
  y: number
  z: number // zoom level
  url: string
  data: ArrayBuffer
  timestamp: Date
  size: number
  format: 'png' | 'jpg' | 'webp'
}

export interface MapRegion {
  id: string
  name: string
  bounds: {
    north: number
    south: number
    east: number
    west: number
  }
  zoomLevels: number[]
  tiles: MapTile[]
  size: number
  createdAt: Date
  updatedAt: Date
  priority: 'low' | 'medium' | 'high' | 'critical'
  haccpContext?: {
    conservationPointIds: string[]
    inspectionRoutes: string[]
    emergencyLocations: string[]
  }
}

export interface CacheOptions {
  maxCacheSize?: number // bytes
  maxTileAge?: number // milliseconds
  compressionEnabled?: boolean
  autoDownload?: boolean
  downloadOnWifiOnly?: boolean
}

export interface DownloadProgress {
  regionId: string
  totalTiles: number
  downloadedTiles: number
  progress: number // 0-100
  speed: number // bytes per second
  estimatedTimeRemaining: number // seconds
  status: 'downloading' | 'paused' | 'completed' | 'error'
  error?: string
}

export class OfflineMapCache {
  private static instance: OfflineMapCache
  private regions: Map<string, MapRegion> = new Map()
  private tiles: Map<string, MapTile> = new Map()
  private downloadQueue: MapRegion[] = []
  private activeDownloads: Map<string, DownloadProgress> = new Map()
  private options: CacheOptions
  private isOnline = navigator.onLine
  private dbName = 'OfflineMapCache'
  private dbVersion = 1
  private db: IDBDatabase | null = null

  private constructor() {
    this.options = {
      maxCacheSize: 100 * 1024 * 1024, // 100MB default
      maxTileAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      compressionEnabled: true,
      autoDownload: true,
      downloadOnWifiOnly: false
    }

    this.setupEventListeners()
  }

  public static getInstance(): OfflineMapCache {
    if (!OfflineMapCache.instance) {
      OfflineMapCache.instance = new OfflineMapCache()
    }
    return OfflineMapCache.instance
  }

  /**
   * Initialize offline map cache
   */
  public async initialize(): Promise<void> {
    try {
      await this.initIndexedDB()
      await this.loadCachedRegions()
      console.log('🗺️ Offline map cache initialized')
    } catch (error) {
      console.error('❌ Offline map cache initialization failed:', error)
      throw new Error('Offline map cache initialization failed')
    }
  }

  /**
   * Download map region for offline use
   */
  public async downloadRegion(
    region: Omit<MapRegion, 'id' | 'tiles' | 'size' | 'createdAt' | 'updatedAt'>,
    progressCallback?: (progress: DownloadProgress) => void
  ): Promise<string> {
    if (!this.isOnline && !this.options.downloadOnWifiOnly) {
      throw new Error('No internet connection available')
    }

    const regionId = this.generateRegionId()
    const mapRegion: MapRegion = {
      ...region,
      id: regionId,
      tiles: [],
      size: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Calculate tiles needed
    const tiles = this.calculateTilesForRegion(mapRegion)
    const totalTiles = tiles.length

    const progress: DownloadProgress = {
      regionId,
      totalTiles,
      downloadedTiles: 0,
      progress: 0,
      speed: 0,
      estimatedTimeRemaining: 0,
      status: 'downloading'
    }

    this.activeDownloads.set(regionId, progress)

    try {
      for (let i = 0; i < tiles.length; i++) {
        const tile = tiles[i]
        
        try {
          const tileData = await this.downloadTile(tile)
          const mapTile: MapTile = {
            ...tile,
            data: tileData,
            timestamp: new Date(),
            size: tileData.byteLength,
            format: this.getTileFormat(tile.url)
          }

          mapRegion.tiles.push(mapTile)
          mapRegion.size += mapTile.size
          this.tiles.set(this.getTileKey(tile), mapTile)

          // Update progress
          progress.downloadedTiles = i + 1
          progress.progress = ((i + 1) / totalTiles) * 100
          progress.speed = this.calculateDownloadSpeed(progress)
          progress.estimatedTimeRemaining = this.calculateETA(progress)

          progressCallback?.(progress)
        } catch (error) {
          console.warn(`⚠️ Failed to download tile ${tile.x},${tile.y},${tile.z}:`, error)
        }
      }

      progress.status = 'completed'
      this.regions.set(regionId, mapRegion)
      await this.saveRegionToDB(mapRegion)

      console.log(`🗺️ Region downloaded: ${region.name} (${mapRegion.size} bytes)`)
      return regionId
    } catch (error) {
      progress.status = 'error'
      progress.error = error instanceof Error ? error.message : 'Unknown error'
      throw error
    } finally {
      this.activeDownloads.delete(regionId)
    }
  }

  /**
   * Get cached tile
   */
  public async getTile(x: number, y: number, z: number): Promise<MapTile | null> {
    const key = this.getTileKey({ x, y, z, url: '' })
    const tile = this.tiles.get(key)

    if (!tile) {
      return null
    }

    // Check if tile is expired
    if (this.isTileExpired(tile)) {
      this.tiles.delete(key)
      return null
    }

    return tile
  }

  /**
   * Get cached region
   */
  public getRegion(id: string): MapRegion | null {
    return this.regions.get(id) || null
  }

  /**
   * Get all cached regions
   */
  public getRegions(): MapRegion[] {
    return Array.from(this.regions.values())
  }

  /**
   * Delete region
   */
  public async deleteRegion(id: string): Promise<boolean> {
    const region = this.regions.get(id)
    if (!region) return false

    // Delete all tiles
    region.tiles.forEach(tile => {
      const key = this.getTileKey(tile)
      this.tiles.delete(key)
    })

    // Delete region
    this.regions.delete(id)
    await this.deleteRegionFromDB(id)

    console.log(`🗺️ Region deleted: ${region.name}`)
    return true
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): {
    totalRegions: number
    totalTiles: number
    totalSize: number
    oldestTile: Date | null
    newestTile: Date | null
    regionsByPriority: Record<string, number>
  } {
    const totalTiles = this.tiles.size
    let totalSize = 0
    let oldestTile: Date | null = null
    let newestTile: Date | null = null
    const regionsByPriority: Record<string, number> = {}

    this.tiles.forEach(tile => {
      totalSize += tile.size
      if (!oldestTile || tile.timestamp < oldestTile) {
        oldestTile = tile.timestamp
      }
      if (!newestTile || tile.timestamp > newestTile) {
        newestTile = tile.timestamp
      }
    })

    this.regions.forEach(region => {
      regionsByPriority[region.priority] = (regionsByPriority[region.priority] || 0) + 1
    })

    return {
      totalRegions: this.regions.size,
      totalTiles,
      totalSize,
      oldestTile,
      newestTile,
      regionsByPriority
    }
  }

  /**
   * Clean expired tiles
   */
  public async cleanExpiredTiles(): Promise<number> {
    let cleanedCount = 0
    const expiredTiles: string[] = []

    this.tiles.forEach((tile, key) => {
      if (this.isTileExpired(tile)) {
        expiredTiles.push(key)
      }
    })

    expiredTiles.forEach(key => {
      this.tiles.delete(key)
      cleanedCount++
    })

    if (cleanedCount > 0) {
      console.log(`🗺️ Cleaned ${cleanedCount} expired tiles`)
    }

    return cleanedCount
  }

  /**
   * Clear all cache
   */
  public async clearCache(): Promise<void> {
    this.regions.clear()
    this.tiles.clear()
    
    if (this.db) {
      const transaction = this.db.transaction(['regions', 'tiles'], 'readwrite')
      await Promise.all([
        transaction.objectStore('regions').clear(),
        transaction.objectStore('tiles').clear()
      ])
    }

    console.log('🗺️ Cache cleared')
  }

  /**
   * Get download progress
   */
  public getDownloadProgress(regionId: string): DownloadProgress | null {
    return this.activeDownloads.get(regionId) || null
  }

  /**
   * Pause download
   */
  public pauseDownload(regionId: string): boolean {
    const progress = this.activeDownloads.get(regionId)
    if (progress && progress.status === 'downloading') {
      progress.status = 'paused'
      return true
    }
    return false
  }

  /**
   * Resume download
   */
  public resumeDownload(regionId: string): boolean {
    const progress = this.activeDownloads.get(regionId)
    if (progress && progress.status === 'paused') {
      progress.status = 'downloading'
      return true
    }
    return false
  }

  /**
   * Update cache options
   */
  public updateOptions(options: Partial<CacheOptions>): void {
    this.options = { ...this.options, ...options }
  }

  /**
   * Calculate tiles needed for region
   */
  private calculateTilesForRegion(region: MapRegion): Array<{ x: number; y: number; z: number; url: string }> {
    const tiles: Array<{ x: number; y: number; z: number; url: string }> = []

    region.zoomLevels.forEach(z => {
      const nwTile = this.latLngToTile(region.bounds.north, region.bounds.west, z)
      const seTile = this.latLngToTile(region.bounds.south, region.bounds.east, z)

      for (let x = nwTile.x; x <= seTile.x; x++) {
        for (let y = nwTile.y; y <= seTile.y; y++) {
          tiles.push({
            x,
            y,
            z,
            url: this.getTileUrl(x, y, z)
          })
        }
      }
    })

    return tiles
  }

  /**
   * Convert lat/lng to tile coordinates
   */
  private latLngToTile(lat: number, lng: number, zoom: number): { x: number; y: number } {
    const n = Math.pow(2, zoom)
    const x = Math.floor((lng + 180) / 360 * n)
    const y = Math.floor((1 - Math.asinh(Math.tan(lat * Math.PI / 180)) / Math.PI) / 2 * n)
    return { x, y }
  }

  /**
   * Get tile URL
   */
  private getTileUrl(x: number, y: number, z: number): string {
    // Using OpenStreetMap tiles as default
    return `https://tile.openstreetmap.org/${z}/${x}/${y}.png`
  }

  /**
   * Download tile
   */
  private async downloadTile(tile: { x: number; y: number; z: number; url: string }): Promise<ArrayBuffer> {
    const response = await fetch(tile.url)
    if (!response.ok) {
      throw new Error(`Failed to download tile: ${response.statusText}`)
    }
    return response.arrayBuffer()
  }

  /**
   * Get tile format from URL
   */
  private getTileFormat(url: string): 'png' | 'jpg' | 'webp' {
    if (url.includes('.png')) return 'png'
    if (url.includes('.jpg') || url.includes('.jpeg')) return 'jpg'
    if (url.includes('.webp')) return 'webp'
    return 'png' // default
  }

  /**
   * Check if tile is expired
   */
  private isTileExpired(tile: MapTile): boolean {
    const age = Date.now() - tile.timestamp.getTime()
    return age > (this.options.maxTileAge || 7 * 24 * 60 * 60 * 1000)
  }

  /**
   * Get tile key
   */
  private getTileKey(tile: { x: number; y: number; z: number }): string {
    return `${tile.z}/${tile.x}/${tile.y}`
  }

  /**
   * Generate region ID
   */
  private generateRegionId(): string {
    return `region_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Calculate download speed
   */
  private calculateDownloadSpeed(progress: DownloadProgress): number {
    // Simplified calculation - in real implementation, track bytes downloaded over time
    return 1024 * 1024 // 1MB/s placeholder
  }

  /**
   * Calculate estimated time remaining
   */
  private calculateETA(progress: DownloadProgress): number {
    if (progress.speed === 0) return 0
    const remainingTiles = progress.totalTiles - progress.downloadedTiles
    const estimatedBytesRemaining = remainingTiles * 15000 // Average tile size
    return estimatedBytesRemaining / progress.speed
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true
      console.log('🗺️ Network connection restored')
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
      console.log('🗺️ Network connection lost')
    })
  }

  /**
   * Initialize IndexedDB
   */
  private async initIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create regions store
        if (!db.objectStoreNames.contains('regions')) {
          const regionsStore = db.createObjectStore('regions', { keyPath: 'id' })
          regionsStore.createIndex('name', 'name', { unique: false })
          regionsStore.createIndex('priority', 'priority', { unique: false })
        }

        // Create tiles store
        if (!db.objectStoreNames.contains('tiles')) {
          const tilesStore = db.createObjectStore('tiles', { keyPath: 'key' })
          tilesStore.createIndex('regionId', 'regionId', { unique: false })
          tilesStore.createIndex('timestamp', 'timestamp', { unique: false })
        }
      }
    })
  }

  /**
   * Load cached regions from IndexedDB
   */
  private async loadCachedRegions(): Promise<void> {
    if (!this.db) return

    const transaction = this.db.transaction(['regions'], 'readonly')
    const store = transaction.objectStore('regions')
    const request = store.getAll()

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const regions = request.result
        regions.forEach((region: MapRegion) => {
          this.regions.set(region.id, region)
          // Load tiles for region
          region.tiles.forEach(tile => {
            this.tiles.set(this.getTileKey(tile), tile)
          })
        })
        resolve()
      }
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Save region to IndexedDB
   */
  private async saveRegionToDB(region: MapRegion): Promise<void> {
    if (!this.db) return

    const transaction = this.db.transaction(['regions'], 'readwrite')
    const store = transaction.objectStore('regions')
    await store.put(region)
  }

  /**
   * Delete region from IndexedDB
   */
  private async deleteRegionFromDB(regionId: string): Promise<void> {
    if (!this.db) return

    const transaction = this.db.transaction(['regions'], 'readwrite')
    const store = transaction.objectStore('regions')
    await store.delete(regionId)
  }
}

// Export singleton instance
export const offlineMapCache = OfflineMapCache.getInstance()
export default offlineMapCache
