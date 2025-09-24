/**
 * B.10.4 Advanced Mobile & PWA - Haptic Feedback Manager
 * Haptic feedback for automation alerts and interactions
 */

export interface HapticConfig {
  enableHapticFeedback: boolean
  enableVibration: boolean
  enableTactileFeedback: boolean
  intensity: number // 0-1
  duration: number // milliseconds
  pattern: 'single' | 'double' | 'triple' | 'long' | 'custom'
  customPattern?: number[]
  enableContextualFeedback: boolean
  enableAccessibilityMode: boolean
}

export interface HapticEvent {
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
}

export interface HapticPattern {
  name: string
  pattern: number[]
  description: string
  useCase: string[]
}

export interface HapticAnalytics {
  totalFeedback: number
  feedbackTypes: Record<string, number>
  averageIntensity: number
  averageDuration: number
  userPreferences: Record<string, any>
  batteryImpact: number
}

export class HapticFeedbackManager {
  private config: HapticConfig
  private patterns: Map<string, HapticPattern> = new Map()
  private analytics: HapticAnalytics
  private isInitialized = false
  private isSupported = false
  private batteryLevel = 100

  constructor() {
    this.config = {
      enableHapticFeedback: true,
      enableVibration: true,
      enableTactileFeedback: true,
      intensity: 0.7,
      duration: 100,
      pattern: 'single',
      enableContextualFeedback: true,
      enableAccessibilityMode: false,
    }

    this.analytics = {
      totalFeedback: 0,
      feedbackTypes: {},
      averageIntensity: 0,
      averageDuration: 0,
      userPreferences: {},
      batteryImpact: 0,
    }
  }

  /**
   * Initialize haptic feedback manager
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    console.log('📳 Initializing Haptic Feedback Manager...')

    try {
      // Check device support
      this.checkDeviceSupport()

      // Setup haptic patterns
      this.setupHapticPatterns()

      // Setup battery monitoring
      this.setupBatteryMonitoring()

      // Setup analytics tracking
      this.setupAnalyticsTracking()

      this.isInitialized = true
      console.log('✅ Haptic Feedback Manager initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize haptic feedback manager:', error)
      throw error
    }
  }

  /**
   * Trigger haptic feedback
   */
  public async triggerFeedback(event: HapticEvent): Promise<boolean> {
    if (
      !this.isInitialized ||
      !this.isSupported ||
      !this.config.enableHapticFeedback
    ) {
      return false
    }

    try {
      // Check battery level
      if (this.batteryLevel < 20 && !this.config.enableAccessibilityMode) {
        console.log('📳 Battery low, skipping haptic feedback')
        return false
      }

      // Get pattern
      const pattern = this.getPatternForEvent(event)

      // Apply intensity and duration
      const adjustedPattern = this.adjustPatternForEvent(pattern, event)

      // Trigger vibration
      if (this.config.enableVibration && 'vibrate' in navigator) {
        navigator.vibrate(adjustedPattern)
      }

      // Update analytics
      this.updateAnalytics(event)

      console.log(`📳 Triggered haptic feedback: ${event.type}`)
      return true
    } catch (error) {
      console.error('Failed to trigger haptic feedback:', error)
      return false
    }
  }

  /**
   * Trigger automation alert feedback
   */
  public async triggerAutomationAlert(
    alertType: 'critical' | 'warning' | 'info',
    context?: string
  ): Promise<boolean> {
    const event: HapticEvent = {
      type: 'alert',
      intensity:
        alertType === 'critical' ? 1.0 : alertType === 'warning' ? 0.8 : 0.6,
      duration:
        alertType === 'critical' ? 200 : alertType === 'warning' ? 150 : 100,
      pattern:
        alertType === 'critical'
          ? 'triple'
          : alertType === 'warning'
            ? 'double'
            : 'single',
      context,
      timestamp: new Date(),
    }

    return await this.triggerFeedback(event)
  }

  /**
   * Trigger automation success feedback
   */
  public async triggerAutomationSuccess(context?: string): Promise<boolean> {
    const event: HapticEvent = {
      type: 'success',
      intensity: 0.8,
      duration: 150,
      pattern: 'double',
      context,
      timestamp: new Date(),
    }

    return await this.triggerFeedback(event)
  }

  /**
   * Trigger automation error feedback
   */
  public async triggerAutomationError(context?: string): Promise<boolean> {
    const event: HapticEvent = {
      type: 'error',
      intensity: 1.0,
      duration: 200,
      pattern: 'triple',
      context,
      timestamp: new Date(),
    }

    return await this.triggerFeedback(event)
  }

  /**
   * Trigger interaction feedback
   */
  public async triggerInteractionFeedback(element: string): Promise<boolean> {
    const event: HapticEvent = {
      type: 'interaction',
      intensity: 0.5,
      duration: 50,
      pattern: 'single',
      context: element,
      timestamp: new Date(),
    }

    return await this.triggerFeedback(event)
  }

  /**
   * Get available patterns
   */
  public getAvailablePatterns(): HapticPattern[] {
    return Array.from(this.patterns.values())
  }

  /**
   * Get haptic analytics
   */
  public getHapticAnalytics(): HapticAnalytics {
    return { ...this.analytics }
  }

  /**
   * Update haptic configuration
   */
  public updateConfig(newConfig: Partial<HapticConfig>): void {
    this.config = { ...this.config, ...newConfig }
    console.log('📳 Haptic configuration updated')
  }

  /**
   * Check if haptic feedback is supported
   */
  public isHapticSupported(): boolean {
    return this.isSupported
  }

  /**
   * Private helper methods
   */

  private checkDeviceSupport(): void {
    // Check for vibration API support
    this.isSupported = 'vibrate' in navigator

    // Check for other haptic APIs
    if ('navigator' in window && 'haptics' in navigator) {
      this.isSupported = true
    }

    // Check for Web Haptics API
    if ('navigator' in window && 'vibrate' in navigator) {
      this.isSupported = true
    }

    console.log(`📳 Haptic support: ${this.isSupported}`)
  }

  private setupHapticPatterns(): void {
    // Single vibration
    this.patterns.set('single', {
      name: 'Single',
      pattern: [100],
      description: 'Single short vibration',
      useCase: ['interaction', 'notification', 'info'],
    })

    // Double vibration
    this.patterns.set('double', {
      name: 'Double',
      pattern: [100, 50, 100],
      description: 'Double vibration with pause',
      useCase: ['success', 'confirmation', 'warning'],
    })

    // Triple vibration
    this.patterns.set('triple', {
      name: 'Triple',
      pattern: [100, 50, 100, 50, 100],
      description: 'Triple vibration with pauses',
      useCase: ['error', 'critical', 'alert'],
    })

    // Long vibration
    this.patterns.set('long', {
      name: 'Long',
      pattern: [300],
      description: 'Long continuous vibration',
      useCase: ['alarm', 'urgent', 'emergency'],
    })

    // Custom patterns for automation
    this.patterns.set('automation-start', {
      name: 'Automation Start',
      pattern: [50, 25, 50, 25, 100],
      description: 'Pattern for automation start',
      useCase: ['automation', 'workflow'],
    })

    this.patterns.set('automation-stop', {
      name: 'Automation Stop',
      pattern: [100, 50, 50, 50, 50],
      description: 'Pattern for automation stop',
      useCase: ['automation', 'workflow'],
    })

    this.patterns.set('automation-complete', {
      name: 'Automation Complete',
      pattern: [75, 25, 75, 25, 75, 25, 150],
      description: 'Pattern for automation completion',
      useCase: ['automation', 'success'],
    })

    this.patterns.set('automation-error', {
      name: 'Automation Error',
      pattern: [200, 100, 200, 100, 200],
      description: 'Pattern for automation error',
      useCase: ['automation', 'error'],
    })

    console.log(`📳 Registered ${this.patterns.size} haptic patterns`)
  }

  private setupBatteryMonitoring(): void {
    // Monitor battery level if available
    if ('getBattery' in navigator) {
      ;(navigator as any).getBattery().then((battery: any) => {
        this.batteryLevel = battery.level * 100

        battery.addEventListener('levelchange', () => {
          this.batteryLevel = battery.level * 100
        })
      })
    }

    // Fallback: estimate battery impact
    setInterval(() => {
      this.estimateBatteryImpact()
    }, 60000) // Every minute
  }

  private setupAnalyticsTracking(): void {
    // Track haptic feedback usage
    setInterval(() => {
      this.analyzeHapticPatterns()
    }, 300000) // Every 5 minutes

    console.log('📳 Analytics tracking setup complete')
  }

  private getPatternForEvent(event: HapticEvent): number[] {
    let patternName = event.pattern

    // Use contextual patterns if enabled
    if (this.config.enableContextualFeedback && event.context) {
      const contextualPattern = this.getContextualPattern(event.context)
      if (contextualPattern) {
        patternName = contextualPattern
      }
    }

    const pattern = this.patterns.get(patternName)
    return pattern ? pattern.pattern : this.patterns.get('single')!.pattern
  }

  private getContextualPattern(context: string): string | null {
    const contextMap: Record<string, string> = {
      'automation-start': 'automation-start',
      'automation-stop': 'automation-stop',
      'automation-complete': 'automation-complete',
      'automation-error': 'automation-error',
      dashboard: 'single',
      alerts: 'double',
      reports: 'single',
      scheduling: 'single',
      workflow: 'automation-start',
      critical: 'triple',
      warning: 'double',
      info: 'single',
    }

    return contextMap[context] || null
  }

  private adjustPatternForEvent(
    pattern: number[],
    event: HapticEvent
  ): number[] {
    const adjustedPattern = [...pattern]

    // Adjust intensity
    if (event.intensity !== 1.0) {
      for (let i = 0; i < adjustedPattern.length; i++) {
        adjustedPattern[i] = Math.round(adjustedPattern[i] * event.intensity)
      }
    }

    // Adjust duration
    if (event.duration !== 100) {
      const durationMultiplier = event.duration / 100
      for (let i = 0; i < adjustedPattern.length; i++) {
        adjustedPattern[i] = Math.round(adjustedPattern[i] * durationMultiplier)
      }
    }

    return adjustedPattern
  }

  private updateAnalytics(event: HapticEvent): void {
    this.analytics.totalFeedback++
    this.analytics.feedbackTypes[event.type] =
      (this.analytics.feedbackTypes[event.type] || 0) + 1

    // Update average intensity
    this.analytics.averageIntensity =
      (this.analytics.averageIntensity + event.intensity) / 2

    // Update average duration
    this.analytics.averageDuration =
      (this.analytics.averageDuration + event.duration) / 2
  }

  private estimateBatteryImpact(): void {
    // Estimate battery impact based on usage
    const usagePerHour = this.analytics.totalFeedback / 24 // Assuming 24 hours
    const estimatedImpact = usagePerHour * 0.1 // 0.1% per vibration

    this.analytics.batteryImpact = Math.min(100, estimatedImpact)
  }

  private analyzeHapticPatterns(): void {
    // Analyze haptic feedback patterns and user preferences
    const mostUsedType = Object.entries(this.analytics.feedbackTypes).sort(
      ([, a], [, b]) => b - a
    )[0]

    if (mostUsedType) {
      this.analytics.userPreferences.mostUsedType = mostUsedType[0]
    }

    // Adjust intensity based on usage patterns
    if (this.analytics.averageIntensity < 0.5) {
      this.config.intensity = Math.min(1, this.config.intensity + 0.1)
      console.log('📳 Increased haptic intensity based on usage patterns')
    } else if (this.analytics.averageIntensity > 0.9) {
      this.config.intensity = Math.max(0.1, this.config.intensity - 0.1)
      console.log('📳 Decreased haptic intensity based on usage patterns')
    }
  }

  /**
   * Stop haptic feedback manager
   */
  public async stop(): Promise<void> {
    this.patterns.clear()
    this.isInitialized = false
    console.log('📳 Haptic Feedback Manager stopped')
  }
}

// Export singleton instance
export const hapticFeedbackManager = new HapticFeedbackManager()

export default hapticFeedbackManager
