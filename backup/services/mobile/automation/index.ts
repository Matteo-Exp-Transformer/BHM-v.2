/**
 * B.10.4 Advanced Mobile & PWA - Mobile Automation Services Index
 * Mobile-specific automation services and components
 */

// Core mobile automation service
export {
  mobileAutomationService,
  type MobileAutomationConfig,
  type TouchGesture,
  type MobileAutomationStats,
} from './MobileAutomationService'

// Offline automation sync
export {
  offlineAutomationSync,
  type OfflineAutomationData,
  type PendingAutomationAction,
  type SyncConflict,
  type OfflineSyncStats,
} from './OfflineAutomationSync'

// Push notification manager
export {
  pushNotificationManager,
  type PushNotificationData,
  type NotificationAction,
  type AutomationNotificationRule,
  type NotificationStats,
} from './PushNotificationManager'

/**
 * Mobile Automation Services Manager
 * Central coordinator for all mobile automation functionality
 */
class MobileAutomationServicesManager {
  private initialized = false
  private mobileAutomationInitialized = false
  private offlineSyncInitialized = false
  private pushNotificationsInitialized = false

  /**
   * Initialize all mobile automation services
   */
  public async initialize(): Promise<void> {
    if (this.initialized) return

    console.log('📱 Initializing Mobile Automation Services...')

    try {
      // Initialize mobile automation service
      await mobileAutomationService.initialize()
      this.mobileAutomationInitialized = true
      console.log('✅ Mobile Automation Service initialized')

      // Initialize offline sync
      await offlineAutomationSync.initialize()
      this.offlineSyncInitialized = true
      console.log('✅ Offline Automation Sync initialized')

      // Initialize push notifications
      await pushNotificationManager.initialize()
      this.pushNotificationsInitialized = true
      console.log('✅ Push Notification Manager initialized')

      this.initialized = true
      console.log('✅ Mobile Automation Services initialized successfully')
    } catch (error) {
      console.error(
        '❌ Failed to initialize mobile automation services:',
        error
      )
      throw error
    }
  }

  /**
   * Get mobile automation status
   */
  public getMobileAutomationStatus(): {
    initialized: boolean
    services: {
      mobileAutomation: boolean
      offlineSync: boolean
      pushNotifications: boolean
    }
    stats: {
      mobileAutomation: any
      offlineSync: any
      pushNotifications: any
    }
  } {
    return {
      initialized: this.initialized,
      services: {
        mobileAutomation: this.mobileAutomationInitialized,
        offlineSync: this.offlineSyncInitialized,
        pushNotifications: this.pushNotificationsInitialized,
      },
      stats: {
        mobileAutomation: mobileAutomationService.getStatus(),
        offlineSync: offlineAutomationSync.getSyncStats(),
        pushNotifications: pushNotificationManager.getNotificationStats(),
      },
    }
  }

  /**
   * Execute mobile automation with all services
   */
  public async executeMobileAutomation(
    ruleId: string,
    context?: Record<string, any>
  ): Promise<any> {
    if (!this.initialized) {
      throw new Error('Mobile automation services not initialized')
    }

    try {
      // Execute via mobile automation service
      const execution = await mobileAutomationService.executeMobileAutomation(
        ruleId,
        context
      )

      // Send notification if enabled
      if (this.pushNotificationsInitialized) {
        await pushNotificationManager.sendAutomationStatus(
          `Rule ${ruleId}`,
          'completed',
          'Automation executed successfully'
        )
      }

      return execution
    } catch (error) {
      // Send failure notification
      if (this.pushNotificationsInitialized) {
        await pushNotificationManager.sendAutomationStatus(
          `Rule ${ruleId}`,
          'failed',
          error instanceof Error ? error.message : 'Unknown error'
        )
      }
      throw error
    }
  }

  /**
   * Sync offline data
   */
  public async syncOfflineData(): Promise<void> {
    if (!this.offlineSyncInitialized) return

    try {
      await offlineAutomationSync.syncOfflineData()
      console.log('📱 Offline data sync completed')
    } catch (error) {
      console.error('Failed to sync offline data:', error)
      throw error
    }
  }

  /**
   * Send critical alert notification
   */
  public async sendCriticalAlert(alert: any): Promise<void> {
    if (!this.pushNotificationsInitialized) return

    try {
      await pushNotificationManager.sendCriticalAlert(alert)
    } catch (error) {
      console.error('Failed to send critical alert:', error)
    }
  }

  /**
   * Stop all mobile automation services
   */
  public async stop(): Promise<void> {
    if (!this.initialized) return

    try {
      await mobileAutomationService.stop()
      await offlineAutomationSync.stop()
      await pushNotificationManager.stop()

      this.initialized = false
      this.mobileAutomationInitialized = false
      this.offlineSyncInitialized = false
      this.pushNotificationsInitialized = false

      console.log('📱 Mobile Automation Services stopped')
    } catch (error) {
      console.error('Failed to stop mobile automation services:', error)
      throw error
    }
  }
}

// Export singleton instance
export const mobileAutomationServices = new MobileAutomationServicesManager()

export default mobileAutomationServices
