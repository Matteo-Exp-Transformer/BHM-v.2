/**
 * B.10.4 Advanced Mobile & PWA - Mobile Automation Service
 * Mobile-specific automation coordinator and touch-optimized controls
 */

import {
  enterpriseAutomationManager,
  type AutomationRule,
  type AutomationExecution,
  type AutomationTrigger,
  type AutomationAction,
} from '../../automation'
import { mobileServices } from '../index'

export interface MobileAutomationConfig {
  enableTouchGestures: boolean
  enableHapticFeedback: boolean
  enableVoiceCommands: boolean
  offlineMode: boolean
  pushNotifications: boolean
  backgroundSync: boolean
}

export interface TouchGesture {
  type: 'swipe' | 'pinch' | 'tap' | 'longPress' | 'doubleTap'
  direction?: 'up' | 'down' | 'left' | 'right'
  threshold: number
  action: () => Promise<void>
}

export interface MobileAutomationStats {
  totalInteractions: number
  touchGesturesUsed: number
  voiceCommandsUsed: number
  offlineExecutions: number
  avgResponseTime: number
  successRate: number
  batteryImpact: number
}

export class MobileAutomationService {
  private initialized = false
  private config: MobileAutomationConfig
  private touchGestures: Map<string, TouchGesture> = new Map()
  private offlineQueue: AutomationExecution[] = []
  private stats: MobileAutomationStats
  private lastSyncTime: Date | null = null
  private isOnline: boolean = true

  constructor() {
    this.config = {
      enableTouchGestures: true,
      enableHapticFeedback: true,
      enableVoiceCommands: false,
      offlineMode: true,
      pushNotifications: true,
      backgroundSync: true,
    }

    this.stats = {
      totalInteractions: 0,
      touchGesturesUsed: 0,
      voiceCommandsUsed: 0,
      offlineExecutions: 0,
      avgResponseTime: 0,
      successRate: 100,
      batteryImpact: 0,
    }

    this.setupNetworkListeners()
    this.setupBatteryMonitoring()
  }

  /**
   * Initialize mobile automation service
   */
  public async initialize(): Promise<void> {
    if (this.initialized) return

    console.log('📱 Initializing Mobile Automation Service...')

    try {
      // Initialize enterprise automation manager
      await enterpriseAutomationManager.initialize()

      // Setup mobile-specific features
      await this.setupTouchGestures()
      await this.setupHapticFeedback()
      await this.setupVoiceCommands()
      await this.setupOfflineMode()
      await this.setupPushNotifications()

      this.initialized = true
      console.log('✅ Mobile Automation Service initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize mobile automation service:', error)
      throw error
    }
  }

  /**
   * Execute automation with mobile optimizations
   */
  public async executeMobileAutomation(
    ruleId: string,
    context?: Record<string, any>
  ): Promise<AutomationExecution> {
    const startTime = Date.now()

    try {
      // Add mobile context
      const mobileContext = {
        ...context,
        deviceInfo: this.getDeviceInfo(),
        touchOptimized: true,
        batteryLevel: await this.getBatteryLevel(),
        networkStatus: this.isOnline ? 'online' : 'offline',
      }

      let execution: AutomationExecution

      if (this.isOnline) {
        // Execute online
        execution = await enterpriseAutomationManager.processAutomationEvent(
          'mobile_execution',
          mobileContext,
          'mobile_app'
        )
      } else {
        // Queue for offline execution
        execution = await this.queueOfflineExecution(ruleId, mobileContext)
      }

      // Update stats
      this.updateStats(Date.now() - startTime, true)

      // Provide haptic feedback
      if (this.config.enableHapticFeedback) {
        await this.triggerHapticFeedback('success')
      }

      return execution
    } catch (error) {
      console.error('Mobile automation execution failed:', error)

      // Update stats
      this.updateStats(Date.now() - startTime, false)

      // Provide error haptic feedback
      if (this.config.enableHapticFeedback) {
        await this.triggerHapticFeedback('error')
      }

      throw error
    }
  }

  /**
   * Get mobile-optimized automation status
   */
  public getMobileAutomationStatus(): {
    systemHealth: 'healthy' | 'warning' | 'critical'
    mobileOptimizations: {
      touchGestures: boolean
      hapticFeedback: boolean
      voiceCommands: boolean
      offlineMode: boolean
    }
    performance: {
      avgResponseTime: number
      batteryImpact: number
      networkEfficiency: number
    }
    stats: MobileAutomationStats
  } {
    const baseStatus = enterpriseAutomationManager.getAutomationStatus()

    return {
      systemHealth: baseStatus.systemHealth,
      mobileOptimizations: {
        touchGestures: this.config.enableTouchGestures,
        hapticFeedback: this.config.enableHapticFeedback,
        voiceCommands: this.config.enableVoiceCommands,
        offlineMode: this.config.offlineMode,
      },
      performance: {
        avgResponseTime: this.stats.avgResponseTime,
        batteryImpact: this.stats.batteryImpact,
        networkEfficiency: this.isOnline ? 100 : 75,
      },
      stats: this.stats,
    }
  }

  /**
   * Register touch gesture for automation control
   */
  public registerTouchGesture(id: string, gesture: TouchGesture): void {
    this.touchGestures.set(id, gesture)
    console.log(`📱 Registered touch gesture: ${id}`)
  }

  /**
   * Execute touch gesture
   */
  public async executeTouchGesture(gestureId: string): Promise<void> {
    const gesture = this.touchGestures.get(gestureId)
    if (!gesture) {
      throw new Error(`Touch gesture not found: ${gestureId}`)
    }

    try {
      await gesture.action()
      this.stats.touchGesturesUsed++

      // Provide haptic feedback
      if (this.config.enableHapticFeedback) {
        await this.triggerHapticFeedback('light')
      }
    } catch (error) {
      console.error(`Touch gesture execution failed: ${gestureId}`, error)
      throw error
    }
  }

  /**
   * Get automation rules optimized for mobile
   */
  public getMobileAutomationRules(): AutomationRule[] {
    const allRules = enterpriseAutomationManager.getAutomationRules()

    // Filter and optimize rules for mobile
    return allRules
      .filter(rule => {
        // Only show rules that are mobile-friendly
        return (
          (rule.enabled && rule.priority !== 'critical') ||
          this.config.enableTouchGestures
        )
      })
      .map(rule => ({
        ...rule,
        // Add mobile-specific metadata
        mobileOptimized: true,
        touchFriendly: true,
        offlineCapable: this.config.offlineMode,
      }))
  }

  /**
   * Sync offline automation queue
   */
  public async syncOfflineQueue(): Promise<void> {
    if (!this.isOnline || this.offlineQueue.length === 0) return

    console.log(
      `📱 Syncing ${this.offlineQueue.length} offline automation executions...`
    )

    const executions = [...this.offlineQueue]
    this.offlineQueue = []

    for (const execution of executions) {
      try {
        await enterpriseAutomationManager.processAutomationEvent(
          'offline_sync',
          execution,
          'mobile_offline_sync'
        )
        console.log(`✅ Synced offline execution: ${execution.id}`)
      } catch (error) {
        console.error(
          `❌ Failed to sync offline execution: ${execution.id}`,
          error
        )
        // Re-queue failed executions
        this.offlineQueue.push(execution)
      }
    }

    this.lastSyncTime = new Date()
    console.log('📱 Offline queue sync completed')
  }

  /**
   * Get device information for mobile context
   */
  private getDeviceInfo(): Record<string, any> {
    const capabilities = mobileServices.getDeviceCapabilities()

    return {
      isMobile: mobileServices.isMobile(),
      hasCamera: capabilities.hasCamera,
      hasGeolocation: capabilities.hasGeolocation,
      hasVibration: capabilities.hasVibration,
      hasNotifications: capabilities.hasNotifications,
      isStandalone: capabilities.isStandalone,
      userAgent: navigator.userAgent,
      screenSize: {
        width: window.screen.width,
        height: window.screen.height,
      },
      viewportSize: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    }
  }

  /**
   * Setup touch gestures for common automation actions
   */
  private async setupTouchGestures(): Promise<void> {
    if (!this.config.enableTouchGestures) return

    // Swipe up to start automation
    this.registerTouchGesture('swipe-up-start', {
      type: 'swipe',
      direction: 'up',
      threshold: 50,
      action: async () => {
        console.log('📱 Swipe up gesture: Starting automation')
        // In real implementation, this would start a common automation workflow
      },
    })

    // Swipe down to stop automation
    this.registerTouchGesture('swipe-down-stop', {
      type: 'swipe',
      direction: 'down',
      threshold: 50,
      action: async () => {
        console.log('📱 Swipe down gesture: Stopping automation')
        // In real implementation, this would stop running automations
      },
    })

    // Long press for automation menu
    this.registerTouchGesture('long-press-menu', {
      type: 'longPress',
      threshold: 1000,
      action: async () => {
        console.log('📱 Long press gesture: Opening automation menu')
        // In real implementation, this would open automation management menu
      },
    })

    // Double tap for quick automation
    this.registerTouchGesture('double-tap-quick', {
      type: 'doubleTap',
      threshold: 300,
      action: async () => {
        console.log('📱 Double tap gesture: Quick automation')
        // In real implementation, this would execute a quick automation
      },
    })
  }

  /**
   * Setup haptic feedback for automation events
   */
  private async setupHapticFeedback(): Promise<void> {
    if (!this.config.enableHapticFeedback || !('vibrate' in navigator)) return

    console.log('📱 Haptic feedback enabled')
  }

  /**
   * Trigger haptic feedback
   */
  private async triggerHapticFeedback(
    type: 'light' | 'medium' | 'heavy' | 'success' | 'error'
  ): Promise<void> {
    if (!this.config.enableHapticFeedback || !('vibrate' in navigator)) return

    const patterns = {
      light: [50],
      medium: [100],
      heavy: [200],
      success: [100, 50, 100],
      error: [200, 100, 200],
    }

    try {
      navigator.vibrate(patterns[type])
    } catch (error) {
      console.warn('Haptic feedback failed:', error)
    }
  }

  /**
   * Setup voice commands for automation
   */
  private async setupVoiceCommands(): Promise<void> {
    if (
      !this.config.enableVoiceCommands ||
      !('webkitSpeechRecognition' in window)
    )
      return

    console.log('📱 Voice commands enabled')
    // In real implementation, this would setup speech recognition
  }

  /**
   * Setup offline mode capabilities
   */
  private async setupOfflineMode(): Promise<void> {
    if (!this.config.offlineMode) return

    console.log('📱 Offline mode enabled')

    // Setup service worker for offline automation
    if ('serviceWorker' in navigator) {
      try {
        const registration =
          await navigator.serviceWorker.register('/automation-sw.js')
        console.log('📱 Automation service worker registered')
      } catch (error) {
        console.warn('Failed to register automation service worker:', error)
      }
    }
  }

  /**
   * Setup push notifications for automation events
   */
  private async setupPushNotifications(): Promise<void> {
    if (!this.config.pushNotifications || !('Notification' in window)) return

    try {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        console.log('📱 Push notifications enabled')
      } else {
        console.log('📱 Push notifications denied')
      }
    } catch (error) {
      console.warn('Failed to setup push notifications:', error)
    }
  }

  /**
   * Setup network status listeners
   */
  private setupNetworkListeners(): void {
    this.isOnline = navigator.onLine

    window.addEventListener('online', () => {
      this.isOnline = true
      console.log('📱 Network: Online')
      this.syncOfflineQueue()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
      console.log('📱 Network: Offline')
    })
  }

  /**
   * Setup battery monitoring
   */
  private setupBatteryMonitoring(): void {
    if ('getBattery' in navigator) {
      ;(navigator as any).getBattery().then((battery: any) => {
        battery.addEventListener('levelchange', () => {
          this.stats.batteryImpact = Math.max(0, 100 - battery.level * 100)
        })
      })
    }
  }

  /**
   * Get battery level
   */
  private async getBatteryLevel(): Promise<number> {
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery()
        return battery.level * 100
      } catch (error) {
        console.warn('Failed to get battery level:', error)
      }
    }
    return 100 // Default to full battery
  }

  /**
   * Queue automation for offline execution
   */
  private async queueOfflineExecution(
    ruleId: string,
    context: Record<string, any>
  ): Promise<AutomationExecution> {
    const execution: AutomationExecution = {
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ruleId,
      triggeredAt: new Date(),
      status: 'pending',
      progress: 0,
      results: [],
      logs: [],
      executionTime: 0,
    }

    this.offlineQueue.push(execution)
    this.stats.offlineExecutions++

    console.log(`📱 Queued offline execution: ${execution.id}`)
    return execution
  }

  /**
   * Update performance statistics
   */
  private updateStats(responseTime: number, success: boolean): void {
    this.stats.totalInteractions++

    // Update average response time
    this.stats.avgResponseTime =
      (this.stats.avgResponseTime * (this.stats.totalInteractions - 1) +
        responseTime) /
      this.stats.totalInteractions

    // Update success rate
    const successCount =
      (this.stats.successRate * (this.stats.totalInteractions - 1)) / 100
    this.stats.successRate =
      ((successCount + (success ? 1 : 0)) / this.stats.totalInteractions) * 100
  }

  /**
   * Get service status
   */
  public getStatus(): {
    initialized: boolean
    config: MobileAutomationConfig
    stats: MobileAutomationStats
    offlineQueueSize: number
    lastSyncTime: Date | null
    isOnline: boolean
  } {
    return {
      initialized: this.initialized,
      config: this.config,
      stats: this.stats,
      offlineQueueSize: this.offlineQueue.length,
      lastSyncTime: this.lastSyncTime,
      isOnline: this.isOnline,
    }
  }

  /**
   * Stop mobile automation service
   */
  public async stop(): Promise<void> {
    this.initialized = false
    this.touchGestures.clear()
    this.offlineQueue = []
    console.log('📱 Mobile Automation Service stopped')
  }
}

// Export singleton instance
export const mobileAutomationService = new MobileAutomationService()

export default mobileAutomationService
