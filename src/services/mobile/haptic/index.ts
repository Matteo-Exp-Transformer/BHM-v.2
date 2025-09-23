/**
 * B.10.4 Advanced Mobile & PWA - Mobile Haptic Services Index
 * Haptic feedback services for mobile automation features
 */

// Haptic Services (B.10.4 Session 4) - 🚀 IN PROGRESS
export {
  hapticFeedbackManager,
  HapticFeedbackManager,
} from './HapticFeedbackManager'

/**
 * Mobile Haptic Services Manager
 * Central coordinator for all mobile haptic services
 */
class MobileHapticServicesManager {
  private services: Map<string, any> = new Map()
  private initialized = false

  constructor() {
    this.registerServices()
  }

  /**
   * Initialize mobile haptic services
   */
  public async initialize(): Promise<void> {
    if (this.initialized) return

    console.log('📳 Initializing Mobile Haptic Services...')

    try {
      // Initialize all haptic services
      await hapticFeedbackManager.initialize()

      this.initialized = true
      console.log('✅ Mobile Haptic Services initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize mobile haptic services:', error)
      throw error
    }
  }

  /**
   * Trigger haptic feedback
   */
  public async triggerFeedback(event: {
    type:
      | 'success'
      | 'error'
      | 'warning'
      | 'info'
      | 'alert'
      | 'notification'
      | 'interaction'
    intensity: number
    duration: number
    pattern: string
    context?: string
    timestamp: Date
    data?: any
  }): Promise<boolean> {
    return await hapticFeedbackManager.triggerFeedback(event)
  }

  /**
   * Trigger automation alert feedback
   */
  public async triggerAutomationAlert(
    alertType: 'critical' | 'warning' | 'info',
    context?: string
  ): Promise<boolean> {
    return await hapticFeedbackManager.triggerAutomationAlert(
      alertType,
      context
    )
  }

  /**
   * Trigger automation success feedback
   */
  public async triggerAutomationSuccess(context?: string): Promise<boolean> {
    return await hapticFeedbackManager.triggerAutomationSuccess(context)
  }

  /**
   * Trigger automation error feedback
   */
  public async triggerAutomationError(context?: string): Promise<boolean> {
    return await hapticFeedbackManager.triggerAutomationError(context)
  }

  /**
   * Trigger interaction feedback
   */
  public async triggerInteractionFeedback(element: string): Promise<boolean> {
    return await hapticFeedbackManager.triggerInteractionFeedback(element)
  }

  /**
   * Get available patterns
   */
  public getAvailablePatterns(): any[] {
    return hapticFeedbackManager.getAvailablePatterns()
  }

  /**
   * Get haptic analytics
   */
  public getHapticAnalytics(): {
    totalFeedback: number
    feedbackTypes: Record<string, number>
    averageIntensity: number
    averageDuration: number
    userPreferences: Record<string, any>
    batteryImpact: number
  } {
    return hapticFeedbackManager.getHapticAnalytics()
  }

  /**
   * Update haptic configuration
   */
  public updateConfig(newConfig: {
    enableHapticFeedback?: boolean
    enableVibration?: boolean
    enableTactileFeedback?: boolean
    intensity?: number
    duration?: number
    pattern?: 'single' | 'double' | 'triple' | 'long' | 'custom'
    customPattern?: number[]
    enableContextualFeedback?: boolean
    enableAccessibilityMode?: boolean
  }): void {
    hapticFeedbackManager.updateConfig(newConfig)
  }

  /**
   * Check if haptic feedback is supported
   */
  public isHapticSupported(): boolean {
    return hapticFeedbackManager.isHapticSupported()
  }

  /**
   * Private helper methods
   */

  private registerServices(): void {
    this.services.set('hapticManager', hapticFeedbackManager)
    console.log('📳 Registered mobile haptic services')
  }

  /**
   * Get service status
   */
  public getStatus(): {
    initialized: boolean
    serviceCount: number
    availableServices: string[]
  } {
    return {
      initialized: this.initialized,
      serviceCount: this.services.size,
      availableServices: Array.from(this.services.keys()),
    }
  }

  /**
   * Stop mobile haptic services
   */
  public async stop(): Promise<void> {
    await hapticFeedbackManager.stop()
    this.services.clear()
    this.initialized = false
    console.log('📳 Mobile Haptic Services stopped')
  }
}

// Export singleton instance
export const mobileHapticServices = new MobileHapticServicesManager()

export default mobileHapticServices
