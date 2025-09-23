/**
 * LocationHistory - B.8.4 Advanced Mobile Features
 * Track and manage user location history for HACCP compliance
 */

import { LocationData } from './GPSService'

export interface LocationHistoryEntry {
  id: string
  timestamp: Date
  latitude: number
  longitude: number
  accuracy: number
  source: 'gps' | 'network' | 'passive'
  activity?: 'walking' | 'driving' | 'stationary' | 'unknown'
  batteryLevel?: number
  haccpContext?: {
    conservationPointId?: string
    taskId?: string
    inspectionId?: string
    locationType?: 'inspection' | 'travel' | 'break' | 'emergency'
    notes?: string
  }
  metadata: {
    deviceInfo: {
      platform: string
      model: string
      osVersion: string
    }
    appState: 'foreground' | 'background' | 'inactive'
    networkType?: 'wifi' | 'cellular' | 'unknown'
  }
}

export interface LocationHistoryFilter {
  dateRange?: {
    start: Date
    end: Date
  }
  haccpContext?: {
    conservationPointId?: string
    taskId?: string
    inspectionId?: string
    locationType?: string
  }
  activity?: LocationHistoryEntry['activity']
  accuracy?: {
    min: number
    max: number
  }
  source?: LocationHistoryEntry['source']
}

export interface LocationHistoryStats {
  totalEntries: number
  totalDistance: number // meters
  totalDuration: number // minutes
  entriesByDay: Record<string, number>
  entriesByActivity: Record<string, number>
  entriesBySource: Record<string, number>
  averageAccuracy: number
  batteryUsage: {
    totalDrain: number
    averageLevel: number
    lowBatteryEvents: number
  }
  haccpCompliance: {
    inspectionEntries: number
    travelEntries: number
    emergencyEntries: number
    complianceScore: number // 0-100
  }
}

export interface LocationCluster {
  id: string
  center: {
    latitude: number
    longitude: number
  }
  radius: number // meters
  entryCount: number
  timeSpent: number // minutes
  firstEntry: Date
  lastEntry: Date
  dominantActivity: LocationHistoryEntry['activity']
  haccpContext?: {
    conservationPointId?: string
    taskId?: string
    inspectionId?: string
  }
}

export class LocationHistory {
  private static instance: LocationHistory
  private entries: LocationHistoryEntry[] = []
  private isTracking = false
  private lastEntry: LocationHistoryEntry | null = null
  private dbName = 'LocationHistory'
  private dbVersion = 1
  private db: IDBDatabase | null = null
  private maxEntries = 10000 // Maximum entries to keep in memory
  private compressionEnabled = true

  private constructor() {}

  public static getInstance(): LocationHistory {
    if (!LocationHistory.instance) {
      LocationHistory.instance = new LocationHistory()
    }
    return LocationHistory.instance
  }

  /**
   * Initialize location history
   */
  public async initialize(): Promise<void> {
    try {
      await this.initIndexedDB()
      await this.loadRecentEntries()
      console.log('📍 Location history initialized')
    } catch (error) {
      console.error('❌ Location history initialization failed:', error)
      throw new Error('Location history initialization failed')
    }
  }

  /**
   * Start tracking location history
   */
  public startTracking(): void {
    if (this.isTracking) {
      console.warn('⚠️ Location history tracking already active')
      return
    }

    this.isTracking = true
    console.log('📍 Location history tracking started')
  }

  /**
   * Stop tracking location history
   */
  public stopTracking(): void {
    this.isTracking = false
    console.log('📍 Location history tracking stopped')
  }

  /**
   * Add location entry
   */
  public async addEntry(
    locationData: LocationData,
    additionalData?: {
      activity?: LocationHistoryEntry['activity']
      batteryLevel?: number
      appState?: 'foreground' | 'background' | 'inactive'
      networkType?: 'wifi' | 'cellular' | 'unknown'
    }
  ): Promise<string> {
    if (!this.isTracking) return ''

    // Check if we should add this entry (avoid duplicates and low accuracy)
    if (this.shouldSkipEntry(locationData)) {
      return ''
    }

    const entry: LocationHistoryEntry = {
      id: this.generateEntryId(),
      timestamp: new Date(),
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      accuracy: locationData.accuracy,
      source: locationData.source,
      activity: additionalData?.activity || this.detectActivity(locationData),
      batteryLevel: additionalData?.batteryLevel,
      haccpContext: locationData.haccpContext,
      metadata: {
        deviceInfo: locationData.deviceInfo,
        appState: additionalData?.appState || 'foreground',
        networkType: additionalData?.networkType
      }
    }

    this.entries.push(entry)
    this.lastEntry = entry

    // Compress old entries if needed
    if (this.entries.length > this.maxEntries) {
      await this.compressOldEntries()
    }

    // Save to IndexedDB
    await this.saveEntryToDB(entry)

    return entry.id
  }

  /**
   * Get location history with filtering
   */
  public getHistory(filter?: LocationHistoryFilter): LocationHistoryEntry[] {
    let filteredEntries = [...this.entries]

    if (filter) {
      if (filter.dateRange) {
        filteredEntries = filteredEntries.filter(entry => 
          entry.timestamp >= filter.dateRange!.start && 
          entry.timestamp <= filter.dateRange!.end
        )
      }

      if (filter.haccpContext) {
        filteredEntries = filteredEntries.filter(entry => {
          if (!entry.haccpContext || !filter.haccpContext) return false
          
          return Object.keys(filter.haccpContext).every(key => {
            const contextKey = key as keyof LocationHistoryEntry['haccpContext']
            return entry.haccpContext?.[contextKey] === filter.haccpContext![contextKey]
          })
        })
      }

      if (filter.activity) {
        filteredEntries = filteredEntries.filter(entry => entry.activity === filter.activity)
      }

      if (filter.accuracy) {
        filteredEntries = filteredEntries.filter(entry => 
          entry.accuracy >= filter.accuracy!.min && 
          entry.accuracy <= filter.accuracy!.max
        )
      }

      if (filter.source) {
        filteredEntries = filteredEntries.filter(entry => entry.source === filter.source)
      }
    }

    return filteredEntries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  /**
   * Get location history statistics
   */
  public getStats(filter?: LocationHistoryFilter): LocationHistoryStats {
    const entries = this.getHistory(filter)
    
    let totalDistance = 0
    let totalDuration = 0
    const entriesByDay: Record<string, number> = {}
    const entriesByActivity: Record<string, number> = {}
    const entriesBySource: Record<string, number> = {}
    let totalAccuracy = 0
    let totalBatteryLevel = 0
    let batteryLevelCount = 0
    let lowBatteryEvents = 0
    let inspectionEntries = 0
    let travelEntries = 0
    let emergencyEntries = 0

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i]
      
      // Calculate distance
      if (i > 0) {
        const distance = this.calculateDistance(
          entries[i - 1].latitude,
          entries[i - 1].longitude,
          entry.latitude,
          entry.longitude
        )
        totalDistance += distance
      }

      // Count by day
      const day = entry.timestamp.toISOString().split('T')[0]
      entriesByDay[day] = (entriesByDay[day] || 0) + 1

      // Count by activity
      const activity = entry.activity || 'unknown'
      entriesByActivity[activity] = (entriesByActivity[activity] || 0) + 1

      // Count by source
      entriesBySource[entry.source] = (entriesBySource[entry.source] || 0) + 1

      // Accuracy
      totalAccuracy += entry.accuracy

      // Battery
      if (entry.batteryLevel !== undefined) {
        totalBatteryLevel += entry.batteryLevel
        batteryLevelCount++
        if (entry.batteryLevel < 20) {
          lowBatteryEvents++
        }
      }

      // HACCP compliance
      if (entry.haccpContext) {
        switch (entry.haccpContext.locationType) {
          case 'inspection':
            inspectionEntries++
            break
          case 'travel':
            travelEntries++
            break
          case 'emergency':
            emergencyEntries++
            break
        }
      }
    }

    // Calculate total duration
    if (entries.length > 1) {
      totalDuration = (entries[0].timestamp.getTime() - entries[entries.length - 1].timestamp.getTime()) / (1000 * 60)
    }

    // Calculate compliance score
    const totalHaccpEntries = inspectionEntries + travelEntries + emergencyEntries
    const complianceScore = totalHaccpEntries > 0 ? 
      ((inspectionEntries * 2 + travelEntries + emergencyEntries * 3) / (totalHaccpEntries * 3)) * 100 : 0

    return {
      totalEntries: entries.length,
      totalDistance,
      totalDuration,
      entriesByDay,
      entriesByActivity,
      entriesBySource,
      averageAccuracy: entries.length > 0 ? totalAccuracy / entries.length : 0,
      batteryUsage: {
        totalDrain: batteryLevelCount > 0 ? (100 - (totalBatteryLevel / batteryLevelCount)) : 0,
        averageLevel: batteryLevelCount > 0 ? totalBatteryLevel / batteryLevelCount : 0,
        lowBatteryEvents
      },
      haccpCompliance: {
        inspectionEntries,
        travelEntries,
        emergencyEntries,
        complianceScore: Math.round(complianceScore)
      }
    }
  }

  /**
   * Get location clusters
   */
  public getLocationClusters(
    minEntries: number = 5,
    maxDistance: number = 100
  ): LocationCluster[] {
    const clusters: LocationCluster[] = []
    const processedEntries = new Set<string>()

    for (const entry of this.entries) {
      if (processedEntries.has(entry.id)) continue

      const cluster: LocationCluster = {
        id: this.generateClusterId(),
        center: {
          latitude: entry.latitude,
          longitude: entry.longitude
        },
        radius: 0,
        entryCount: 1,
        timeSpent: 0,
        firstEntry: entry.timestamp,
        lastEntry: entry.timestamp,
        dominantActivity: entry.activity || 'unknown',
        haccpContext: entry.haccpContext
      }

      processedEntries.add(entry.id)

      // Find nearby entries
      for (const otherEntry of this.entries) {
        if (processedEntries.has(otherEntry.id)) continue

        const distance = this.calculateDistance(
          entry.latitude,
          entry.longitude,
          otherEntry.latitude,
          otherEntry.longitude
        )

        if (distance <= maxDistance) {
          cluster.entryCount++
          cluster.center.latitude = (cluster.center.latitude + otherEntry.latitude) / 2
          cluster.center.longitude = (cluster.center.longitude + otherEntry.longitude) / 2
          
          if (otherEntry.timestamp < cluster.firstEntry) {
            cluster.firstEntry = otherEntry.timestamp
          }
          if (otherEntry.timestamp > cluster.lastEntry) {
            cluster.lastEntry = otherEntry.timestamp
          }

          processedEntries.add(otherEntry.id)
        }
      }

      // Calculate cluster properties
      if (cluster.entryCount >= minEntries) {
        cluster.timeSpent = (cluster.lastEntry.getTime() - cluster.firstEntry.getTime()) / (1000 * 60)
        clusters.push(cluster)
      }
    }

    return clusters.sort((a, b) => b.entryCount - a.entryCount)
  }

  /**
   * Clear location history
   */
  public async clearHistory(): Promise<void> {
    this.entries = []
    this.lastEntry = null

    if (this.db) {
      const transaction = this.db.transaction(['entries'], 'readwrite')
      await transaction.objectStore('entries').clear()
    }

    console.log('📍 Location history cleared')
  }

  /**
   * Export location history
   */
  public exportHistory(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      return this.exportToCSV()
    } else {
      return JSON.stringify({
        entries: this.entries,
        exportedAt: new Date(),
        totalEntries: this.entries.length
      }, null, 2)
    }
  }

  /**
   * Import location history
   */
  public async importHistory(data: string): Promise<number> {
    try {
      const parsed = JSON.parse(data)
      const importedEntries = parsed.entries || []
      
      let importedCount = 0
      for (const entry of importedEntries) {
        if (this.validateEntry(entry)) {
          this.entries.push(entry)
          await this.saveEntryToDB(entry)
          importedCount++
        }
      }

      console.log(`📍 Imported ${importedCount} location entries`)
      return importedCount
    } catch (error) {
      console.error('❌ Failed to import location history:', error)
      throw new Error('Failed to import location history')
    }
  }

  /**
   * Check if entry should be skipped
   */
  private shouldSkipEntry(locationData: LocationData): boolean {
    if (!this.lastEntry) return false

    // Skip if too close to last entry (within 5 meters and 30 seconds)
    const distance = this.calculateDistance(
      this.lastEntry.latitude,
      this.lastEntry.longitude,
      locationData.latitude,
      locationData.longitude
    )

    const timeDiff = locationData.timestamp.getTime() - this.lastEntry.timestamp.getTime()

    if (distance < 5 && timeDiff < 30000) {
      return true
    }

    // Skip if accuracy is too poor
    if (locationData.accuracy > 100) {
      return true
    }

    return false
  }

  /**
   * Detect activity based on location data
   */
  private detectActivity(locationData: LocationData): LocationHistoryEntry['activity'] {
    if (!this.lastEntry) return 'unknown'

    const distance = this.calculateDistance(
      this.lastEntry.latitude,
      this.lastEntry.longitude,
      locationData.latitude,
      locationData.longitude
    )

    const timeDiff = locationData.timestamp.getTime() - this.lastEntry.timestamp.getTime()
    const speed = distance / (timeDiff / 1000) // meters per second

    if (speed < 0.5) return 'stationary'
    if (speed < 2) return 'walking'
    if (speed < 15) return 'driving'
    
    return 'unknown'
  }

  /**
   * Compress old entries
   */
  private async compressOldEntries(): Promise<void> {
    if (!this.compressionEnabled) return

    // Keep only the most recent 80% of entries
    const keepCount = Math.floor(this.maxEntries * 0.8)
    const entriesToRemove = this.entries.slice(0, this.entries.length - keepCount)
    
    // Remove from memory
    this.entries = this.entries.slice(-keepCount)
    
    // Remove from IndexedDB
    if (this.db) {
      const transaction = this.db.transaction(['entries'], 'readwrite')
      const store = transaction.objectStore('entries')
      
      for (const entry of entriesToRemove) {
        await store.delete(entry.id)
      }
    }

    console.log(`📍 Compressed ${entriesToRemove.length} old location entries`)
  }

  /**
   * Calculate distance between two points
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180
    const φ2 = lat2 * Math.PI / 180
    const Δφ = (lat2 - lat1) * Math.PI / 180
    const Δλ = (lon2 - lon1) * Math.PI / 180

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

    return R * c // Distance in meters
  }

  /**
   * Export to CSV format
   */
  private exportToCSV(): string {
    const headers = [
      'id',
      'timestamp',
      'latitude',
      'longitude',
      'accuracy',
      'source',
      'activity',
      'batteryLevel',
      'conservationPointId',
      'taskId',
      'inspectionId',
      'locationType',
      'notes',
      'platform',
      'model',
      'osVersion',
      'appState',
      'networkType'
    ]

    const rows = this.entries.map(entry => [
      entry.id,
      entry.timestamp.toISOString(),
      entry.latitude,
      entry.longitude,
      entry.accuracy,
      entry.source,
      entry.activity || '',
      entry.batteryLevel || '',
      entry.haccpContext?.conservationPointId || '',
      entry.haccpContext?.taskId || '',
      entry.haccpContext?.inspectionId || '',
      entry.haccpContext?.locationType || '',
      entry.haccpContext?.notes || '',
      entry.metadata.deviceInfo.platform,
      entry.metadata.deviceInfo.model,
      entry.metadata.deviceInfo.osVersion,
      entry.metadata.appState,
      entry.metadata.networkType || ''
    ])

    return [headers, ...rows].map(row => row.join(',')).join('\n')
  }

  /**
   * Validate entry
   */
  private validateEntry(entry: any): boolean {
    return (
      entry.id &&
      entry.timestamp &&
      typeof entry.latitude === 'number' &&
      typeof entry.longitude === 'number' &&
      typeof entry.accuracy === 'number' &&
      entry.source
    )
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

        if (!db.objectStoreNames.contains('entries')) {
          const store = db.createObjectStore('entries', { keyPath: 'id' })
          store.createIndex('timestamp', 'timestamp', { unique: false })
          store.createIndex('haccpContext', 'haccpContext.conservationPointId', { unique: false })
          store.createIndex('activity', 'activity', { unique: false })
        }
      }
    })
  }

  /**
   * Load recent entries from IndexedDB
   */
  private async loadRecentEntries(): Promise<void> {
    if (!this.db) return

    const transaction = this.db.transaction(['entries'], 'readonly')
    const store = transaction.objectStore('entries')
    const index = store.index('timestamp')
    const request = index.openCursor(null, 'prev')
    
    const entries: LocationHistoryEntry[] = []
    
    return new Promise((resolve, reject) => {
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor && entries.length < this.maxEntries) {
          entries.push(cursor.value)
          cursor.continue()
        } else {
          this.entries = entries.reverse() // Reverse to get chronological order
          resolve()
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Save entry to IndexedDB
   */
  private async saveEntryToDB(entry: LocationHistoryEntry): Promise<void> {
    if (!this.db) return

    const transaction = this.db.transaction(['entries'], 'readwrite')
    const store = transaction.objectStore('entries')
    await store.put(entry)
  }

  /**
   * Generate entry ID
   */
  private generateEntryId(): string {
    return `loc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Generate cluster ID
   */
  private generateClusterId(): string {
    return `cluster_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

// Export singleton instance
export const locationHistory = LocationHistory.getInstance()
export default locationHistory
