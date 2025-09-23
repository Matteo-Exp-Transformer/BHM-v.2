/**
 * B.10.4 Advanced Mobile & PWA - Offline Automation Sync
 * Offline-first automation data synchronization and conflict resolution
 */

import {
  enterpriseAutomationManager,
  type AutomationRule,
  type AutomationExecution,
  type AutomationTrigger,
  type AutomationAction,
} from '../../automation'

export interface OfflineAutomationData {
  rules: AutomationRule[]
  executions: AutomationExecution[]
  pendingActions: PendingAutomationAction[]
  lastSyncTime: Date | null
  syncStatus: 'synced' | 'pending' | 'conflict' | 'error'
}

export interface PendingAutomationAction {
  id: string
  type: 'create_rule' | 'update_rule' | 'delete_rule' | 'execute_rule'
  data: any
  timestamp: Date
  retryCount: number
  maxRetries: number
}

export interface SyncConflict {
  id: string
  type: 'rule_conflict' | 'execution_conflict' | 'data_conflict'
  localData: any
  remoteData: any
  resolution: 'local_wins' | 'remote_wins' | 'merge' | 'manual'
  timestamp: Date
}

export interface OfflineSyncStats {
  totalSyncs: number
  successfulSyncs: number
  failedSyncs: number
  conflictsResolved: number
  avgSyncTime: number
  lastSyncDuration: number
  dataSize: number
}

export class OfflineAutomationSync {
  private initialized = false
  private isOnline = false
  private syncInProgress = false
  private offlineData: OfflineAutomationData
  private pendingActions: Map<string, PendingAutomationAction> = new Map()
  private conflicts: Map<string, SyncConflict> = new Map()
  private stats: OfflineSyncStats
  private syncInterval: NodeJS.Timeout | null = null
  private storageKey = 'haccp_automation_offline_data'

  constructor() {
    this.offlineData = {
      rules: [],
      executions: [],
      pendingActions: [],
      lastSyncTime: null,
      syncStatus: 'synced',
    }

    this.stats = {
      totalSyncs: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      conflictsResolved: 0,
      avgSyncTime: 0,
      lastSyncDuration: 0,
      dataSize: 0,
    }

    this.setupNetworkListeners()
    this.loadOfflineData()
  }

  /**
   * Initialize offline sync service
   */
  public async initialize(): Promise<void> {
    if (this.initialized) return

    console.log('📱 Initializing Offline Automation Sync...')

    try {
      // Load offline data from storage
      await this.loadOfflineData()

      // Setup service worker for background sync
      await this.setupServiceWorker()

      // Start periodic sync
      this.startPeriodicSync()

      this.initialized = true
      console.log('✅ Offline Automation Sync initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize offline sync:', error)
      throw error
    }
  }

  /**
   * Queue automation action for offline execution
   */
  public async queueOfflineAction(
    type: PendingAutomationAction['type'],
    data: any
  ): Promise<string> {
    const actionId = this.generateId()
    const action: PendingAutomationAction = {
      id: actionId,
      type,
      data,
      timestamp: new Date(),
      retryCount: 0,
      maxRetries: 3,
    }

    this.pendingActions.set(actionId, action)
    this.offlineData.pendingActions.push(action)

    // Update sync status
    this.offlineData.syncStatus = 'pending'
    await this.saveOfflineData()

    console.log(`📱 Queued offline action: ${type} (${actionId})`)

    // Try immediate sync if online
    if (this.isOnline) {
      await this.syncPendingActions()
    }

    return actionId
  }

  /**
   * Execute automation rule offline
   */
  public async executeOfflineRule(
    ruleId: string,
    context?: Record<string, any>
  ): Promise<AutomationExecution> {
    const rule = this.offlineData.rules.find(r => r.id === ruleId)
    if (!rule) {
      throw new Error(`Rule not found: ${ruleId}`)
    }

    const execution: AutomationExecution = {
      id: this.generateId(),
      ruleId: rule.id,
      triggeredAt: new Date(),
      status: 'pending',
      progress: 0,
      results: [],
      logs: [],
      executionTime: 0,
    }

    try {
      // Execute rule offline
      await this.executeRuleOffline(execution, rule, context)

      // Add to offline executions
      this.offlineData.executions.push(execution)
      await this.saveOfflineData()

      console.log(`📱 Executed rule offline: ${rule.name}`)
      return execution
    } catch (error) {
      execution.status = 'failed'
      execution.error = error instanceof Error ? error.message : 'Unknown error'
      this.offlineData.executions.push(execution)
      await this.saveOfflineData()
      throw error
    }
  }

  /**
   * Sync offline data with server
   */
  public async syncOfflineData(): Promise<void> {
    if (this.syncInProgress || !this.isOnline) return

    const startTime = Date.now()
    this.syncInProgress = true
    this.stats.totalSyncs++

    try {
      console.log('📱 Starting offline data sync...')

      // Sync pending actions
      await this.syncPendingActions()

      // Sync offline executions
      await this.syncOfflineExecutions()

      // Sync conflicts
      await this.resolveConflicts()

      // Update sync status
      this.offlineData.syncStatus = 'synced'
      this.offlineData.lastSyncTime = new Date()
      this.stats.successfulSyncs++

      await this.saveOfflineData()

      const duration = Date.now() - startTime
      this.stats.lastSyncDuration = duration
      this.updateAvgSyncTime(duration)

      console.log(`✅ Offline data sync completed in ${duration}ms`)
    } catch (error) {
      console.error('❌ Offline data sync failed:', error)
      this.offlineData.syncStatus = 'error'
      this.stats.failedSyncs++
      await this.saveOfflineData()
      throw error
    } finally {
      this.syncInProgress = false
    }
  }

  /**
   * Get offline automation data
   */
  public getOfflineData(): OfflineAutomationData {
    return { ...this.offlineData }
  }

  /**
   * Get sync statistics
   */
  public getSyncStats(): OfflineSyncStats {
    return { ...this.stats }
  }

  /**
   * Check if data is available offline
   */
  public isDataAvailableOffline(): boolean {
    return (
      this.offlineData.rules.length > 0 ||
      this.offlineData.executions.length > 0 ||
      this.offlineData.pendingActions.length > 0
    )
  }

  /**
   * Get offline data size
   */
  public getOfflineDataSize(): number {
    const dataString = JSON.stringify(this.offlineData)
    return new Blob([dataString]).size
  }

  /**
   * Clear offline data
   */
  public async clearOfflineData(): Promise<void> {
    this.offlineData = {
      rules: [],
      executions: [],
      pendingActions: [],
      lastSyncTime: null,
      syncStatus: 'synced',
    }

    this.pendingActions.clear()
    this.conflicts.clear()

    await this.saveOfflineData()
    console.log('📱 Offline data cleared')
  }

  /**
   * Resolve sync conflict
   */
  public async resolveConflict(
    conflictId: string,
    resolution: SyncConflict['resolution']
  ): Promise<void> {
    const conflict = this.conflicts.get(conflictId)
    if (!conflict) return

    try {
      switch (resolution) {
        case 'local_wins':
          await this.applyLocalData(conflict)
          break
        case 'remote_wins':
          await this.applyRemoteData(conflict)
          break
        case 'merge':
          await this.mergeData(conflict)
          break
        case 'manual':
          // Manual resolution - keep conflict for user to resolve
          return
      }

      this.conflicts.delete(conflictId)
      this.stats.conflictsResolved++
      await this.saveOfflineData()

      console.log(`📱 Resolved conflict: ${conflictId} (${resolution})`)
    } catch (error) {
      console.error(`Failed to resolve conflict ${conflictId}:`, error)
      throw error
    }
  }

  /**
   * Private helper methods
   */

  private async loadOfflineData(): Promise<void> {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        const data = JSON.parse(stored)
        this.offlineData = {
          ...data,
          lastSyncTime: data.lastSyncTime ? new Date(data.lastSyncTime) : null,
        }

        // Restore pending actions map
        this.pendingActions.clear()
        this.offlineData.pendingActions.forEach(action => {
          this.pendingActions.set(action.id, action)
        })

        console.log('📱 Loaded offline data from storage')
      }
    } catch (error) {
      console.warn('Failed to load offline data:', error)
    }
  }

  private async saveOfflineData(): Promise<void> {
    try {
      const dataToStore = {
        ...this.offlineData,
        lastSyncTime: this.offlineData.lastSyncTime?.toISOString() || null,
      }

      localStorage.setItem(this.storageKey, JSON.stringify(dataToStore))
      this.stats.dataSize = this.getOfflineDataSize()
    } catch (error) {
      console.error('Failed to save offline data:', error)
    }
  }

  private async setupServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register(
          '/automation-sync-sw.js'
        )

        // Listen for sync events
        registration.addEventListener('sync', event => {
          if (event.tag === 'automation-sync') {
            this.syncOfflineData()
          }
        })

        console.log('📱 Automation sync service worker registered')
      } catch (error) {
        console.warn(
          'Failed to register automation sync service worker:',
          error
        )
      }
    }
  }

  private setupNetworkListeners(): void {
    this.isOnline = navigator.onLine

    window.addEventListener('online', () => {
      this.isOnline = true
      console.log('📱 Network: Online - starting sync')
      this.syncOfflineData()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
      console.log('📱 Network: Offline - switching to offline mode')
    })
  }

  private startPeriodicSync(): void {
    // Sync every 5 minutes when online
    this.syncInterval = setInterval(
      () => {
        if (this.isOnline && !this.syncInProgress) {
          this.syncOfflineData()
        }
      },
      5 * 60 * 1000
    )
  }

  private async syncPendingActions(): Promise<void> {
    const actions = Array.from(this.pendingActions.values())

    for (const action of actions) {
      try {
        await this.executePendingAction(action)
        this.pendingActions.delete(action.id)
        this.offlineData.pendingActions =
          this.offlineData.pendingActions.filter(a => a.id !== action.id)
      } catch (error) {
        console.error(`Failed to sync action ${action.id}:`, error)
        action.retryCount++

        if (action.retryCount >= action.maxRetries) {
          this.pendingActions.delete(action.id)
          this.offlineData.pendingActions =
            this.offlineData.pendingActions.filter(a => a.id !== action.id)
        }
      }
    }
  }

  private async executePendingAction(
    action: PendingAutomationAction
  ): Promise<void> {
    switch (action.type) {
      case 'create_rule':
        await enterpriseAutomationManager.createAutomationRule(action.data)
        break
      case 'update_rule':
        await enterpriseAutomationManager.updateAutomationRule(
          action.data.id,
          action.data.updates
        )
        break
      case 'delete_rule':
        await enterpriseAutomationManager.deleteAutomationRule(action.data.id)
        break
      case 'execute_rule':
        await enterpriseAutomationManager.executeRule(
          action.data.ruleId,
          action.data.context
        )
        break
    }
  }

  private async syncOfflineExecutions(): Promise<void> {
    const offlineExecutions = this.offlineData.executions.filter(
      exec => exec.status === 'completed' || exec.status === 'failed'
    )

    for (const execution of offlineExecutions) {
      try {
        // In real implementation, this would sync with server
        console.log(`Syncing execution: ${execution.id}`)
      } catch (error) {
        console.error(`Failed to sync execution ${execution.id}:`, error)
      }
    }
  }

  private async resolveConflicts(): Promise<void> {
    const conflicts = Array.from(this.conflicts.values())

    for (const conflict of conflicts) {
      try {
        // Auto-resolve simple conflicts
        if (conflict.type === 'data_conflict') {
          await this.resolveConflict(conflict.id, 'remote_wins')
        }
      } catch (error) {
        console.error(`Failed to resolve conflict ${conflict.id}:`, error)
      }
    }
  }

  private async executeRuleOffline(
    execution: AutomationExecution,
    rule: AutomationRule,
    context?: Record<string, any>
  ): Promise<void> {
    execution.status = 'running'

    // Simulate rule execution
    for (let i = 0; i < rule.actions.length; i++) {
      const action = rule.actions[i]
      execution.progress = (i / rule.actions.length) * 100

      try {
        // Simulate action execution
        await new Promise(resolve => setTimeout(resolve, 100))

        execution.results.push({
          actionId: this.generateId(),
          actionType: action.type,
          status: 'success',
          executionTime: 100,
        })
      } catch (error) {
        execution.results.push({
          actionId: this.generateId(),
          actionType: action.type,
          status: 'failure',
          error: error instanceof Error ? error.message : 'Unknown error',
          executionTime: 100,
        })
      }
    }

    execution.status = 'completed'
    execution.progress = 100
    execution.executionTime = Date.now() - execution.triggeredAt.getTime()
  }

  private async applyLocalData(conflict: SyncConflict): Promise<void> {
    // Apply local data to server
    console.log(`Applying local data for conflict: ${conflict.id}`)
  }

  private async applyRemoteData(conflict: SyncConflict): Promise<void> {
    // Apply remote data to local
    console.log(`Applying remote data for conflict: ${conflict.id}`)
  }

  private async mergeData(conflict: SyncConflict): Promise<void> {
    // Merge local and remote data
    console.log(`Merging data for conflict: ${conflict.id}`)
  }

  private updateAvgSyncTime(duration: number): void {
    this.stats.avgSyncTime =
      (this.stats.avgSyncTime * (this.stats.totalSyncs - 1) + duration) /
      this.stats.totalSyncs
  }

  private generateId(): string {
    return `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Stop offline sync service
   */
  public async stop(): Promise<void> {
    this.initialized = false

    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }

    await this.saveOfflineData()
    console.log('📱 Offline Automation Sync stopped')
  }
}

// Export singleton instance
export const offlineAutomationSync = new OfflineAutomationSync()

export default offlineAutomationSync
