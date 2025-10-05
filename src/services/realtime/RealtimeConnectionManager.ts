/**
 * Real-time Connection Manager for HACCP Business Manager
 * Handles WebSocket connections, subscriptions, and real-time data flow
 */

import type {
  RealtimeChannel,
  RealtimeClient,
  RealtimePostgresChangesPayload,
} from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE'
export type TableName =
  | 'temperature_readings'
  | 'maintenance_tasks'
  | 'products'
  | 'tasks'
  | 'shopping_lists'

export interface RealtimeSubscription {
  id: string
  table: TableName
  event: RealtimeEvent | '*'
  callback: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void
  filter?: string
  channel?: RealtimeChannel
}

export interface ConnectionStatus {
  connected: boolean
  reconnecting: boolean
  error?: string
  lastConnected?: Date
  connectionAttempts: number
}

export interface PresenceState {
  userId: string
  userEmail: string
  presence_ref: string
  online_at: string
  current_page?: string
  activity_status: 'active' | 'idle' | 'away'
}

class RealtimeConnectionManager {
  private subscriptions: Map<string, RealtimeSubscription> = new Map()
  private presenceChannel: RealtimeChannel | null = null
  private connectionStatus: ConnectionStatus = {
    connected: false,
    reconnecting: false,
    connectionAttempts: 0,
  }
  private statusCallbacks: ((status: ConnectionStatus) => void)[] = []
  private presenceCallbacks: ((presence: PresenceState[]) => void)[] = []
  private client: RealtimeClient

  // Connection configuration
  private readonly maxReconnectAttempts = 5
  private readonly reconnectInterval = 3000
  private readonly heartbeatInterval = 30000

  constructor() {
    this.client = supabase.realtime
    this.setupConnectionListeners()
  }

  /**
   * Initialize real-time connection and presence
   */
  public async connect(
    companyId: string,
    userId: string,
    userEmail: string
  ): Promise<void> {
    try {
      this.updateConnectionStatus({
        connected: false,
        reconnecting: true,
      })

      // Setup presence channel for collaborative features
      await this.setupPresenceChannel(companyId, userId, userEmail)

      this.updateConnectionStatus({
        connected: true,
        reconnecting: false,
        lastConnected: new Date(),
        connectionAttempts: 0,
      })

      console.log('✅ Real-time connection established')
    } catch (error) {
      console.error('❌ Failed to establish real-time connection:', error)
      this.handleConnectionError(error)
    }
  }

  /**
   * Subscribe to table changes with advanced filtering
   */
  public subscribe(
    subscription: Omit<RealtimeSubscription, 'id' | 'channel'>
  ): string {
    const subscriptionId = this.generateSubscriptionId()

    const channel = supabase
      .channel(`${subscription.table}_${subscriptionId}`)
      .on(
        'postgres_changes',
        {
          event: subscription.event,
          schema: 'public',
          table: subscription.table,
          filter: subscription.filter,
        },
        payload => {
          try {
            subscription.callback(payload)
          } catch (error) {
            console.error(
              `Error in subscription callback for ${subscription.table}:`,
              error
            )
          }
        }
      )
      .subscribe(status => {
        if (status === 'SUBSCRIBED') {
          console.log(`📡 Subscribed to ${subscription.table} changes`)
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`❌ Subscription error for ${subscription.table}`)
          this.handleSubscriptionError(subscriptionId)
        }
      })

    const fullSubscription: RealtimeSubscription = {
      id: subscriptionId,
      channel,
      ...subscription,
    }

    this.subscriptions.set(subscriptionId, fullSubscription)
    return subscriptionId
  }

  /**
   * Unsubscribe from table changes
   */
  public unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId)
    if (subscription?.channel) {
      subscription.channel.unsubscribe()
      this.subscriptions.delete(subscriptionId)
      console.log(`🔇 Unsubscribed from ${subscription.table}`)
    }
  }

  /**
   * Unsubscribe from all active subscriptions
   */
  public unsubscribeAll(): void {
    this.subscriptions.forEach(subscription => {
      subscription.channel?.unsubscribe()
    })
    this.subscriptions.clear()

    if (this.presenceChannel) {
      this.presenceChannel.unsubscribe()
      this.presenceChannel = null
    }

    console.log('🔇 All subscriptions removed')
  }

  /**
   * Setup presence channel for collaborative features
   */
  private async setupPresenceChannel(
    companyId: string,
    userId: string,
    userEmail: string
  ): Promise<void> {
    if (this.presenceChannel) {
      this.presenceChannel.unsubscribe()
    }

    this.presenceChannel = supabase
      .channel(`company_${companyId}_presence`)
      .on('presence', { event: 'sync' }, () => {
        const presenceState = this.presenceChannel!.presenceState()
        const users = this.transformPresenceState(presenceState)
        this.notifyPresenceCallbacks(users)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('👤 User joined:', key, newPresences)
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('👋 User left:', key, leftPresences)
      })

    await this.presenceChannel.subscribe(async status => {
      if (status === 'SUBSCRIBED') {
        // Track user presence
        await this.presenceChannel!.track({
          userId,
          userEmail,
          online_at: new Date().toISOString(),
          activity_status: 'active',
        })
        console.log('👥 Presence tracking enabled')
      }
    })
  }

  /**
   * Update user activity status
   */
  public async updateActivity(
    status: 'active' | 'idle' | 'away',
    currentPage?: string
  ): Promise<void> {
    if (this.presenceChannel) {
      await this.presenceChannel.track({
        activity_status: status,
        current_page: currentPage,
        last_activity: new Date().toISOString(),
      })
    }
  }

  /**
   * Setup connection event listeners
   */
  private setupConnectionListeners(): void {
    // Listen for connection state changes
    supabase.realtime.onOpen(() => {
      this.updateConnectionStatus({
        connected: true,
        reconnecting: false,
        lastConnected: new Date(),
        connectionAttempts: 0,
      })
    })

    supabase.realtime.onClose(() => {
      this.updateConnectionStatus({ connected: false })
      this.attemptReconnection()
    })

    supabase.realtime.onError(error => {
      console.error('Real-time connection error:', error)
      this.handleConnectionError(error)
    })
  }

  /**
   * Handle connection errors with exponential backoff
   */
  private handleConnectionError(error: unknown): void {
    console.error('Real-time connection error:', error)
    this.connectionStatus.connectionAttempts++

    if (this.connectionStatus.connectionAttempts <= this.maxReconnectAttempts) {
      setTimeout(
        () => {
          this.attemptReconnection().catch(err => {
            console.error('Failed reconnection attempt:', err)
          })
        },
        this.reconnectInterval *
          Math.pow(2, this.connectionStatus.connectionAttempts - 1)
      )
    } else {
      this.updateConnectionStatus({
        connected: false,
        reconnecting: false,
        error: 'Max reconnection attempts exceeded',
      })
    }
  }

  /**
   * Attempt to reconnect with current subscriptions
   */
  private async attemptReconnection(): Promise<void> {
    if (this.connectionStatus.reconnecting) return

    this.updateConnectionStatus({ reconnecting: true })

    try {
      const currentSubscriptions = Array.from(this.subscriptions.values())
      this.subscriptions.clear()

      currentSubscriptions.forEach(subscription => {
        this.subscribe({
          table: subscription.table,
          event: subscription.event,
          callback: subscription.callback,
          filter: subscription.filter,
        })
      })
    } catch (error) {
      this.handleConnectionError(error)
    }
  }

  /**
   * Handle subscription-specific errors
   */
  private handleSubscriptionError(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId)
    if (subscription) {
      console.log(`🔄 Attempting to resubscribe to ${subscription.table}`)
      setTimeout(() => {
        this.subscribe({
          table: subscription.table,
          event: subscription.event,
          callback: subscription.callback,
          filter: subscription.filter,
        })
      }, 2000)
    }
  }

  /**
   * Transform Supabase presence state to our format
   */
  private transformPresenceState(
    presenceState: Record<string, Array<Record<string, unknown>>>
  ): PresenceState[] {
    const users: PresenceState[] = []

    Object.entries(presenceState).forEach(([key, presences]) => {
      presences.forEach(presence => {
        const typedPresence = presence as PresenceState & {
          last_activity?: string
        }

        users.push({
          userId: String(typedPresence.userId ?? ''),
          userEmail: String(typedPresence.userEmail ?? ''),
          presence_ref: key,
          online_at: typedPresence.online_at ?? new Date().toISOString(),
          current_page: typedPresence.current_page,
          activity_status: typedPresence.activity_status ?? 'active',
        })
      })
    })

    return users
  }

  /**
   * Utility methods
   */
  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private updateConnectionStatus(update: Partial<ConnectionStatus>): void {
    this.connectionStatus = { ...this.connectionStatus, ...update }
    this.statusCallbacks.forEach(callback => callback(this.connectionStatus))
  }

  private notifyPresenceCallbacks(users: PresenceState[]): void {
    this.presenceCallbacks.forEach(callback => callback(users))
  }

  /**
   * Public API for status monitoring
   */
  public getConnectionStatus(): ConnectionStatus {
    return { ...this.connectionStatus }
  }

  public onStatusChange(callback: (status: ConnectionStatus) => void): void {
    this.statusCallbacks.push(callback)
  }

  public onPresenceChange(callback: (users: PresenceState[]) => void): void {
    this.presenceCallbacks.push(callback)
  }

  public removeStatusCallback(
    callback: (status: ConnectionStatus) => void
  ): void {
    const index = this.statusCallbacks.indexOf(callback)
    if (index > -1) {
      this.statusCallbacks.splice(index, 1)
    }
  }

  public removePresenceCallback(
    callback: (users: PresenceState[]) => void
  ): void {
    const index = this.presenceCallbacks.indexOf(callback)
    if (index > -1) {
      this.presenceCallbacks.splice(index, 1)
    }
  }

  /**
   * Cleanup and disconnect
   */
  public disconnect(): void {
    this.unsubscribeAll()
    this.statusCallbacks = []
    this.presenceCallbacks = []
    this.updateConnectionStatus({ connected: false })
    console.log('🔌 Real-time connection manager disconnected')
  }
}

// Export singleton instance
export const realtimeManager = new RealtimeConnectionManager()
export default RealtimeConnectionManager
