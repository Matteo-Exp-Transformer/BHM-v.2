/**
 * Advanced Install Prompt Manager - B.10.4 Advanced Mobile & PWA
 * Handles PWA installation prompts, user engagement tracking, and installation analytics
 */

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface InstallPromptConfig {
  showAfterDelay: number // milliseconds
  showAfterInteraction: number // number of interactions
  maxShowAttempts: number
  cooldownPeriod: number // milliseconds
  trackEngagement: boolean
  showOnMobileOnly: boolean
}

interface InstallPromptStatus {
  isInstallable: boolean
  hasBeenPrompted: boolean
  hasBeenInstalled: boolean
  promptCount: number
  lastPromptTime: number | null
  userEngagement: number
  isStandalone: boolean
}

interface InstallationAnalytics {
  totalPrompts: number
  acceptedInstalls: number
  dismissedPrompts: number
  installRate: number
  averageEngagementBeforeInstall: number
  deviceTypes: Record<string, number>
  browsers: Record<string, number>
}

export class InstallPromptManager {
  private config: InstallPromptConfig = {
    showAfterDelay: 30000, // 30 seconds
    showAfterInteraction: 3, // 3 interactions
    maxShowAttempts: 3,
    cooldownPeriod: 86400000, // 24 hours
    trackEngagement: true,
    showOnMobileOnly: true,
  }

  private status: InstallPromptStatus = {
    isInstallable: false,
    hasBeenPrompted: false,
    hasBeenInstalled: false,
    promptCount: 0,
    lastPromptTime: null,
    userEngagement: 0,
    isStandalone: window.matchMedia('(display-mode: standalone)').matches,
  }

  private analytics: InstallationAnalytics = {
    totalPrompts: 0,
    acceptedInstalls: 0,
    dismissedPrompts: 0,
    installRate: 0,
    averageEngagementBeforeInstall: 0,
    deviceTypes: {},
    browsers: {},
  }

  private deferredPrompt: InstallPromptEvent | null = null
  private interactionCount: number = 0
  private engagementTimer: NodeJS.Timeout | null = null
  private promptTimer: NodeJS.Timeout | null = null

  /**
   * Initialize install prompt manager
   */
  public async initialize(): Promise<void> {
    try {
      // Load saved data
      await this.loadPersistedData()

      // Check if already installed
      this.checkInstallationStatus()

      // Set up event listeners
      this.setupEventListeners()

      // Start engagement tracking
      if (this.config.trackEngagement) {
        this.startEngagementTracking()
      }

      // Set up automatic prompt timing
      this.setupPromptTiming()

      console.log('📱 Install Prompt Manager initialized')
    } catch (error) {
      console.error('❌ Failed to initialize Install Prompt Manager:', error)
      throw error
    }
  }

  /**
   * Show install prompt
   */
  public async showInstallPrompt(): Promise<boolean> {
    // Check if we can show prompt
    if (!this.canShowPrompt()) {
      console.log('🚫 Cannot show install prompt at this time')
      return false
    }

    try {
      if (!this.deferredPrompt) {
        throw new Error('No install prompt available')
      }

      // Show the prompt
      await this.deferredPrompt.prompt()

      // Wait for user choice
      const choiceResult = await this.deferredPrompt.userChoice

      // Update analytics
      this.updateAnalytics(choiceResult.outcome)

      // Update status
      this.status.hasBeenPrompted = true
      this.status.promptCount++
      this.status.lastPromptTime = Date.now()

      // Clear deferred prompt
      this.deferredPrompt = null

      console.log(`📱 Install prompt ${choiceResult.outcome}`)
      return choiceResult.outcome === 'accepted'
    } catch (error) {
      console.error('❌ Failed to show install prompt:', error)
      return false
    }
  }

  /**
   * Check if prompt can be shown
   */
  private canShowPrompt(): boolean {
    // Check if already installed
    if (this.status.hasBeenInstalled || this.status.isStandalone) {
      return false
    }

    // Check if not installable
    if (!this.status.isInstallable || !this.deferredPrompt) {
      return false
    }

    // Check if already prompted recently
    if (this.status.lastPromptTime) {
      const timeSinceLastPrompt = Date.now() - this.status.lastPromptTime
      if (timeSinceLastPrompt < this.config.cooldownPeriod) {
        return false
      }
    }

    // Check if max attempts reached
    if (this.status.promptCount >= this.config.maxShowAttempts) {
      return false
    }

    // Check if mobile only and not on mobile
    if (this.config.showOnMobileOnly && !this.isMobileDevice()) {
      return false
    }

    // Check engagement threshold
    if (this.status.userEngagement < this.config.showAfterInteraction) {
      return false
    }

    return true
  }

  /**
   * Track user engagement
   */
  public trackEngagement(): void {
    this.interactionCount++
    this.status.userEngagement = this.interactionCount

    // Save engagement data
    this.saveEngagementData()

    // Check if we should show prompt based on engagement
    if (this.status.userEngagement >= this.config.showAfterInteraction) {
      this.schedulePrompt()
    }
  }

  /**
   * Get installation status
   */
  public getInstallationStatus(): InstallPromptStatus {
    return { ...this.status }
  }

  /**
   * Get installation analytics
   */
  public getInstallationAnalytics(): InstallationAnalytics {
    return { ...this.analytics }
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<InstallPromptConfig>): void {
    this.config = { ...this.config, ...newConfig }

    // Restart engagement tracking if needed
    if (newConfig.trackEngagement !== undefined) {
      if (newConfig.trackEngagement) {
        this.startEngagementTracking()
      } else {
        this.stopEngagementTracking()
      }
    }
  }

  /**
   * Reset installation data
   */
  public resetInstallationData(): void {
    this.status = {
      isInstallable: false,
      hasBeenPrompted: false,
      hasBeenInstalled: false,
      promptCount: 0,
      lastPromptTime: null,
      userEngagement: 0,
      isStandalone: window.matchMedia('(display-mode: standalone)').matches,
    }

    this.interactionCount = 0
    this.deferredPrompt = null

    // Clear persisted data
    this.clearPersistedData()
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault()
      this.deferredPrompt = e as InstallPromptEvent
      this.status.isInstallable = true

      console.log('📱 Install prompt available')
      this.emitInstallEvent('prompt-available', null)
    })

    // Listen for appinstalled event
    window.addEventListener('appinstalled', () => {
      this.status.hasBeenInstalled = true
      this.status.isStandalone = true
      this.analytics.acceptedInstalls++

      console.log('📱 App installed successfully')
      this.emitInstallEvent('installed', null)

      // Clear deferred prompt
      this.deferredPrompt = null
    })

    // Listen for display mode changes
    window
      .matchMedia('(display-mode: standalone)')
      .addEventListener('change', e => {
        this.status.isStandalone = e.matches
        if (e.matches) {
          this.status.hasBeenInstalled = true
          console.log('📱 App is now in standalone mode')
        }
      })

    // Track user interactions
    const interactionEvents = ['click', 'scroll', 'keydown', 'touchstart']
    interactionEvents.forEach(eventType => {
      document.addEventListener(
        eventType,
        () => {
          if (this.config.trackEngagement) {
            this.trackEngagement()
          }
        },
        { passive: true, once: false }
      )
    })
  }

  /**
   * Start engagement tracking
   */
  private startEngagementTracking(): void {
    this.engagementTimer = setInterval(() => {
      // Track time-based engagement
      if (document.hasFocus()) {
        this.status.userEngagement += 0.1 // Increment engagement over time
      }
    }, 10000) // Every 10 seconds
  }

  /**
   * Stop engagement tracking
   */
  private stopEngagementTracking(): void {
    if (this.engagementTimer) {
      clearInterval(this.engagementTimer)
      this.engagementTimer = null
    }
  }

  /**
   * Setup prompt timing
   */
  private setupPromptTiming(): void {
    // Show prompt after delay
    this.promptTimer = setTimeout(() => {
      if (this.canShowPrompt()) {
        this.showInstallPrompt()
      }
    }, this.config.showAfterDelay)
  }

  /**
   * Schedule prompt based on conditions
   */
  private schedulePrompt(): void {
    if (this.canShowPrompt()) {
      // Small delay to avoid interrupting user flow
      setTimeout(() => {
        this.showInstallPrompt()
      }, 2000)
    }
  }

  /**
   * Check installation status
   */
  private checkInstallationStatus(): void {
    // Check if running in standalone mode
    this.status.isStandalone = window.matchMedia(
      '(display-mode: standalone)'
    ).matches

    // Check if app was installed via other means
    if (this.status.isStandalone) {
      this.status.hasBeenInstalled = true
    }

    // Check if app is in home screen (iOS)
    if (this.isIOSDevice() && window.navigator.standalone) {
      this.status.hasBeenInstalled = true
    }
  }

  /**
   * Update analytics
   */
  private updateAnalytics(outcome: 'accepted' | 'dismissed'): void {
    this.analytics.totalPrompts++

    if (outcome === 'accepted') {
      this.analytics.acceptedInstalls++
    } else {
      this.analytics.dismissedPrompts++
    }

    // Calculate install rate
    this.analytics.installRate =
      this.analytics.totalPrompts > 0
        ? (this.analytics.acceptedInstalls / this.analytics.totalPrompts) * 100
        : 0

    // Update average engagement
    if (this.analytics.acceptedInstalls > 0) {
      this.analytics.averageEngagementBeforeInstall =
        (this.analytics.averageEngagementBeforeInstall +
          this.status.userEngagement) /
        2
    }

    // Track device and browser info
    this.trackDeviceInfo()

    // Save analytics
    this.saveAnalytics()
  }

  /**
   * Track device and browser information
   */
  private trackDeviceInfo(): void {
    const userAgent = navigator.userAgent
    const isMobile = this.isMobileDevice()
    const isIOS = this.isIOSDevice()
    const isAndroid = this.isAndroidDevice()

    // Track device types
    if (isIOS) {
      this.analytics.deviceTypes.iOS = (this.analytics.deviceTypes.iOS || 0) + 1
    } else if (isAndroid) {
      this.analytics.deviceTypes.Android =
        (this.analytics.deviceTypes.Android || 0) + 1
    } else {
      this.analytics.deviceTypes.Desktop =
        (this.analytics.deviceTypes.Desktop || 0) + 1
    }

    // Track browsers
    let browser = 'Unknown'
    if (userAgent.includes('Chrome')) browser = 'Chrome'
    else if (userAgent.includes('Firefox')) browser = 'Firefox'
    else if (userAgent.includes('Safari')) browser = 'Safari'
    else if (userAgent.includes('Edge')) browser = 'Edge'

    this.analytics.browsers[browser] =
      (this.analytics.browsers[browser] || 0) + 1
  }

  /**
   * Check if device is mobile
   */
  private isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  }

  /**
   * Check if device is iOS
   */
  private isIOSDevice(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent)
  }

  /**
   * Check if device is Android
   */
  private isAndroidDevice(): boolean {
    return /Android/i.test(navigator.userAgent)
  }

  /**
   * Load persisted data from localStorage
   */
  private async loadPersistedData(): Promise<void> {
    try {
      const savedStatus = localStorage.getItem('install-prompt-status')
      if (savedStatus) {
        this.status = { ...this.status, ...JSON.parse(savedStatus) }
      }

      const savedAnalytics = localStorage.getItem('install-prompt-analytics')
      if (savedAnalytics) {
        this.analytics = { ...this.analytics, ...JSON.parse(savedAnalytics) }
      }

      const savedEngagement = localStorage.getItem('install-prompt-engagement')
      if (savedEngagement) {
        this.interactionCount = parseInt(savedEngagement) || 0
      }
    } catch (error) {
      console.warn('⚠️ Failed to load persisted data:', error)
    }
  }

  /**
   * Save engagement data
   */
  private saveEngagementData(): void {
    try {
      localStorage.setItem(
        'install-prompt-engagement',
        this.interactionCount.toString()
      )
      localStorage.setItem('install-prompt-status', JSON.stringify(this.status))
    } catch (error) {
      console.warn('⚠️ Failed to save engagement data:', error)
    }
  }

  /**
   * Save analytics data
   */
  private saveAnalytics(): void {
    try {
      localStorage.setItem(
        'install-prompt-analytics',
        JSON.stringify(this.analytics)
      )
    } catch (error) {
      console.warn('⚠️ Failed to save analytics:', error)
    }
  }

  /**
   * Clear persisted data
   */
  private clearPersistedData(): void {
    try {
      localStorage.removeItem('install-prompt-status')
      localStorage.removeItem('install-prompt-analytics')
      localStorage.removeItem('install-prompt-engagement')
    } catch (error) {
      console.warn('⚠️ Failed to clear persisted data:', error)
    }
  }

  /**
   * Emit install events
   */
  private emitInstallEvent(type: string, data: any): void {
    const event = new CustomEvent('install-prompt-event', {
      detail: { type, data, timestamp: Date.now() },
    })
    window.dispatchEvent(event)
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    this.stopEngagementTracking()

    if (this.promptTimer) {
      clearTimeout(this.promptTimer)
      this.promptTimer = null
    }

    this.deferredPrompt = null
  }
}

// Export singleton
export const installPromptManager = new InstallPromptManager()

export default installPromptManager
