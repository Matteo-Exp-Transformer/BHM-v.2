/**
 * Conflict Resolution System for Offline Sync
 * Handles data conflicts when syncing offline changes with server data
 */

export interface ConflictData {
  id: string
  table: string
  localData: any
  serverData: any
  conflictType: 'update' | 'delete' | 'concurrent'
  timestamp: number
}

export interface ResolutionStrategy {
  strategy: 'local-wins' | 'server-wins' | 'merge' | 'manual'
  mergedData?: any
  reason?: string
}

export interface ConflictResolution {
  conflictId: string
  resolution: ResolutionStrategy
  resolvedData: any
  timestamp: number
}

class ConflictResolverService {
  private manualConflicts: ConflictData[] = []
  private resolutionCallbacks: Map<
    string,
    (resolution: ConflictResolution) => void
  > = new Map()

  /**
   * Detect and resolve conflicts between local and server data
   */
  async resolveConflict(
    table: string,
    localData: any,
    serverData: any,
    operation: 'create' | 'update' | 'delete'
  ): Promise<ConflictResolution | null> {
    const conflictType = this.detectConflictType(
      localData,
      serverData,
      operation
    )

    if (!conflictType) {
      return null // No conflict detected
    }

    const conflict: ConflictData = {
      id: `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      table,
      localData,
      serverData,
      conflictType,
      timestamp: Date.now(),
    }

    console.log(
      `[Conflict] Detected ${conflictType} conflict in ${table}:`,
      conflict.id
    )

    const strategy = await this.determineResolutionStrategy(conflict)
    const resolvedData = await this.applyResolutionStrategy(conflict, strategy)

    const resolution: ConflictResolution = {
      conflictId: conflict.id,
      resolution: strategy,
      resolvedData,
      timestamp: Date.now(),
    }

    console.log(
      `[Conflict] Resolved conflict ${conflict.id} using ${strategy.strategy}`
    )

    return resolution
  }

  private detectConflictType(
    localData: any,
    serverData: any,
    operation: string
  ): ConflictData['conflictType'] | null {
    // No server data means record was deleted on server
    if (!serverData && operation === 'update') {
      return 'delete'
    }

    // Both have changes - check timestamps
    if (localData && serverData) {
      const localTime = new Date(
        localData.updated_at || localData.created_at
      ).getTime()
      const serverTime = new Date(
        serverData.updated_at || serverData.created_at
      ).getTime()

      // Concurrent modifications (within 5 minutes)
      if (Math.abs(localTime - serverTime) < 5 * 60 * 1000) {
        return 'concurrent'
      }

      // Check for actual data differences
      if (this.hasDataConflicts(localData, serverData)) {
        return 'update'
      }
    }

    return null
  }

  private hasDataConflicts(localData: any, serverData: any): boolean {
    const ignoredFields = ['id', 'created_at', 'updated_at', 'version']

    const localKeys = Object.keys(localData).filter(
      key => !ignoredFields.includes(key)
    )
    const serverKeys = Object.keys(serverData).filter(
      key => !ignoredFields.includes(key)
    )

    // Check if any field values differ
    const allKeys = new Set([...localKeys, ...serverKeys])

    for (const key of allKeys) {
      const localValue = this.normalizeValue(localData[key])
      const serverValue = this.normalizeValue(serverData[key])

      if (localValue !== serverValue) {
        console.log(
          `[Conflict] Field '${key}' differs: local='${localValue}', server='${serverValue}'`
        )
        return true
      }
    }

    return false
  }

  private normalizeValue(value: any): string {
    if (value === null || value === undefined) return ''
    if (typeof value === 'object') return JSON.stringify(value)
    return String(value).trim()
  }

  private async determineResolutionStrategy(
    conflict: ConflictData
  ): Promise<ResolutionStrategy> {
    // Automatic resolution strategies based on table and conflict type
    switch (conflict.table) {
      case 'temperature_readings':
        return this.resolveTemperatureConflict(conflict)

      case 'tasks':
        return this.resolveTaskConflict(conflict)

      case 'products':
        return this.resolveProductConflict(conflict)

      case 'task_completions':
        return this.resolveTaskCompletionConflict(conflict)

      default:
        return this.resolveGenericConflict(conflict)
    }
  }

  private resolveTemperatureConflict(
    conflict: ConflictData
  ): ResolutionStrategy {
    // Temperature readings: always prefer local (they're time-sensitive)
    if (conflict.conflictType === 'delete') {
      return {
        strategy: 'local-wins',
        reason: 'Temperature readings should not be deleted once recorded',
      }
    }

    // For concurrent updates, merge critical fields
    if (conflict.conflictType === 'concurrent') {
      const merged = {
        ...conflict.serverData,
        temperature: conflict.localData.temperature, // Local measurement wins
        notes: this.mergeNotes(
          conflict.localData.notes,
          conflict.serverData.notes
        ),
        recorded_by: conflict.localData.recorded_by, // Keep local recorder
        recorded_at: conflict.localData.recorded_at,
      }

      return {
        strategy: 'merge',
        mergedData: merged,
        reason: 'Merged temperature data preserving local measurements',
      }
    }

    return {
      strategy: 'local-wins',
      reason: 'Local temperature data preferred',
    }
  }

  private resolveTaskConflict(conflict: ConflictData): ResolutionStrategy {
    // Task updates: consider completion status
    if (conflict.conflictType === 'delete') {
      return {
        strategy: 'server-wins',
        reason: 'Respect server-side task deletion',
      }
    }

    // Check if task was completed offline
    const localCompleted = conflict.localData.status === 'completed'
    const serverCompleted = conflict.serverData.status === 'completed'

    if (localCompleted && !serverCompleted) {
      return {
        strategy: 'local-wins',
        reason: 'Task completed offline - preserve completion',
      }
    }

    // Merge non-conflicting updates
    const merged = {
      ...conflict.serverData,
      ...conflict.localData,
      updated_at: new Date().toISOString(),
    }

    return {
      strategy: 'merge',
      mergedData: merged,
      reason: 'Merged task updates',
    }
  }

  private resolveProductConflict(conflict: ConflictData): ResolutionStrategy {
    // Product updates: check inventory changes
    if (conflict.conflictType === 'delete') {
      return {
        strategy: 'server-wins',
        reason: 'Respect server-side product deletion',
      }
    }

    // For inventory quantities, sum the changes
    const localQty = conflict.localData.quantity || 0
    const serverQty = conflict.serverData.quantity || 0
    const baseQty = conflict.serverData.previous_quantity || serverQty

    // Calculate change made offline
    const localChange = localQty - baseQty

    const merged = {
      ...conflict.serverData,
      quantity: serverQty + localChange,
      last_updated_offline: true,
      updated_at: new Date().toISOString(),
    }

    return {
      strategy: 'merge',
      mergedData: merged,
      reason: 'Merged inventory quantity changes',
    }
  }

  private resolveTaskCompletionConflict(
    conflict: ConflictData
  ): ResolutionStrategy {
    // Task completions: always prefer local (user performed the work)
    return {
      strategy: 'local-wins',
      reason: 'Task completion performed offline should be preserved',
    }
  }

  private resolveGenericConflict(conflict: ConflictData): ResolutionStrategy {
    // Generic resolution: newer timestamp wins
    const localTime = new Date(
      conflict.localData.updated_at || conflict.localData.created_at
    ).getTime()
    const serverTime = new Date(
      conflict.serverData.updated_at || conflict.serverData.created_at
    ).getTime()

    if (localTime > serverTime) {
      return {
        strategy: 'local-wins',
        reason: 'Local data is newer',
      }
    } else {
      return {
        strategy: 'server-wins',
        reason: 'Server data is newer',
      }
    }
  }

  private async applyResolutionStrategy(
    conflict: ConflictData,
    strategy: ResolutionStrategy
  ): Promise<any> {
    switch (strategy.strategy) {
      case 'local-wins':
        return conflict.localData

      case 'server-wins':
        return conflict.serverData

      case 'merge':
        return strategy.mergedData

      case 'manual':
        // Queue for manual resolution
        this.manualConflicts.push(conflict)
        return null
    }
  }

  private mergeNotes(
    localNotes: string = '',
    serverNotes: string = ''
  ): string {
    if (!localNotes && !serverNotes) return ''
    if (!localNotes) return serverNotes
    if (!serverNotes) return localNotes

    if (localNotes === serverNotes) return localNotes

    return `${serverNotes}\n\n[Offline update]: ${localNotes}`
  }

  /**
   * Get pending manual conflicts that need user resolution
   */
  getPendingManualConflicts(): ConflictData[] {
    return [...this.manualConflicts]
  }

  /**
   * Resolve a manual conflict with user input
   */
  async resolveManualConflict(
    conflictId: string,
    resolution: ResolutionStrategy
  ): Promise<ConflictResolution> {
    const conflictIndex = this.manualConflicts.findIndex(
      c => c.id === conflictId
    )

    if (conflictIndex === -1) {
      throw new Error(`Conflict ${conflictId} not found`)
    }

    const conflict = this.manualConflicts[conflictIndex]
    const resolvedData = await this.applyResolutionStrategy(
      conflict,
      resolution
    )

    // Remove from pending list
    this.manualConflicts.splice(conflictIndex, 1)

    const conflictResolution: ConflictResolution = {
      conflictId,
      resolution,
      resolvedData,
      timestamp: Date.now(),
    }

    // Notify callback if registered
    const callback = this.resolutionCallbacks.get(conflictId)
    if (callback) {
      callback(conflictResolution)
      this.resolutionCallbacks.delete(conflictId)
    }

    return conflictResolution
  }

  /**
   * Register callback for conflict resolution
   */
  onConflictResolved(
    conflictId: string,
    callback: (resolution: ConflictResolution) => void
  ): void {
    this.resolutionCallbacks.set(conflictId, callback)
  }

  /**
   * Check if data has version field for optimistic locking
   */
  private hasVersioning(data: any): boolean {
    return data && typeof data.version === 'number'
  }

  /**
   * Create version-based conflict detection
   */
  detectVersionConflict(localData: any, serverData: any): boolean {
    if (!this.hasVersioning(localData) || !this.hasVersioning(serverData)) {
      return false
    }

    return localData.version !== serverData.version
  }
}

export const conflictResolver = new ConflictResolverService()
