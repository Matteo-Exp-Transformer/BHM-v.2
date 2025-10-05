/**
 * B.10.4 Advanced Mobile & PWA - Install Prompt Manager
 * PWA installation with automation features and user engagement
 */

export interface InstallPromptConfig {
  enableAutoPrompt: boolean
  promptDelay: number // milliseconds
  maxPromptAttempts: number
  promptCooldown: number // milliseconds
  enableAnalytics: boolean
  customPromptMessage: string
  showAutomationBenefits: boolean
}

export interface InstallPromptData {
  promptEvent: BeforeInstallPromptEvent | null
  isInstallable: boolean
  isInstalled: boolean
  installSource: 'prompt' | 'manual' | 'automatic' | null
  installTimestamp: Date | null
  promptCount: number
  lastPromptTime: Date | null
}

export interface AutomationInstallBenefits {
  offlineAccess: boolean
  pushNotifications: boolean
  backgroundSync: boolean
  fasterLoading: boolean
  nativeFeel: boolean
  automationFeatures: string[]
}

export interface InstallAnalytics {
  totalPrompts: number
  successfulInstalls: number
  installRate: number
  promptDismissals: number
  installSources: Record<string, number>
  userEngagement: number
}

export class InstallPromptManager {
  private config: InstallPromptConfig
  private promptData: InstallPromptData
  private analytics: InstallAnalytics
  private promptTimer: ReturnType<typeof setTimeout> | null = null
  private isInitialized = false
  private deferredPrompt: BeforeInstallPromptEvent | null = null

  constructor() {
    this.config = {
      enableAutoPrompt: true,
      promptDelay: 10000, // 10 seconds
      maxPromptAttempts: 3,
      promptCooldown: 24 * 60 * 60 * 1000, // 24 hours
      enableAnalytics: true,
      customPromptMessage:
        'Install HACCP Business Manager for better automation experience',
      showAutomationBenefits: true,
    }

    this.promptData = {
      promptEvent: null,
      isInstallable: false,
      isInstalled: false,
      installSource: null,
      installTimestamp: null,
      promptCount: 0,
      lastPromptTime: null,
    }

    this.analytics = {
      totalPrompts: 0,
      successfulInstalls: 0,
      installRate: 0,
      promptDismissals: 0,
      installSources: {},
      userEngagement: 0,
    }
  }

  /**
   * Initialize install prompt manager
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    console.log('📱 Initializing Install Prompt Manager...')

    try {
      // Check if already installed
      this.checkInstallationStatus()

      // Setup event listeners
      this.setupEventListeners()

      // Load analytics data
      await this.loadAnalytics()

      // Start auto-prompt if enabled
      if (this.config.enableAutoPrompt) {
        this.startAutoPrompt()
      }

      this.isInitialized = true
      console.log('✅ Install Prompt Manager initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize install prompt manager:', error)
      throw error
    }
  }

  /**
   * Show install prompt
   */
  public async showInstallPrompt(): Promise<boolean> {
    if (!this.canShowPrompt()) {
      console.log('📱 Cannot show install prompt at this time')
      return false
    }

    try {
      if (this.deferredPrompt) {
        // Show the install prompt
        this.deferredPrompt.prompt()

        // Wait for the user to respond to the prompt
        const { outcome } = await this.deferredPrompt.userChoice

        // Update analytics
        this.analytics.totalPrompts++
        this.promptData.promptCount++
        this.promptData.lastPromptTime = new Date()

        if (outcome === 'accepted') {
          this.handleInstallAccepted()
          return true
        } else {
          this.handleInstallDismissed()
          return false
        }
      } else {
        // Fallback: show custom install prompt
        return await this.showCustomInstallPrompt()
      }
    } catch (error) {
      console.error('Failed to show install prompt:', error)
      return false
    }
  }

  /**
   * Show custom install prompt with automation benefits
   */
  public async showCustomInstallPrompt(): Promise<boolean> {
    const benefits = this.getAutomationBenefits()

    const customPrompt = this.createCustomPromptElement(benefits)
    document.body.appendChild(customPrompt)

    return new Promise(resolve => {
      const acceptButton = customPrompt.querySelector('.install-accept')
      const dismissButton = customPrompt.querySelector('.install-dismiss')

      acceptButton?.addEventListener('click', () => {
        this.handleInstallAccepted()
        document.body.removeChild(customPrompt)
        resolve(true)
      })

      dismissButton?.addEventListener('click', () => {
        this.handleInstallDismissed()
        document.body.removeChild(customPrompt)
        resolve(false)
      })

      // Auto-dismiss after 30 seconds
      setTimeout(() => {
        if (document.body.contains(customPrompt)) {
          this.handleInstallDismissed()
          document.body.removeChild(customPrompt)
          resolve(false)
        }
      }, 30000)
    })
  }

  /**
   * Check if PWA is installable
   */
  public isInstallable(): boolean {
    return this.promptData.isInstallable
  }

  /**
   * Check if PWA is already installed
   */
  public isInstalled(): boolean {
    return this.promptData.isInstalled
  }

  /**
   * Get install prompt data
   */
  public getInstallPromptData(): InstallPromptData {
    return { ...this.promptData }
  }

  /**
   * Get install analytics
   */
  public getInstallAnalytics(): InstallAnalytics {
    return { ...this.analytics }
  }

  /**
   * Get automation benefits for installation
   */
  public getAutomationBenefits(): AutomationInstallBenefits {
    return {
      offlineAccess: true,
      pushNotifications: true,
      backgroundSync: true,
      fasterLoading: true,
      nativeFeel: true,
      automationFeatures: [
        'Real-time automation monitoring',
        'Offline automation execution',
        'Push notifications for critical alerts',
        'Background data synchronization',
        'Touch-optimized automation controls',
        'Mobile automation management',
      ],
    }
  }

  /**
   * Private helper methods
   */

  private checkInstallationStatus(): void {
    // Check if running in standalone mode (installed)
    this.promptData.isInstalled =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone ===
        true

    // Check if installable
    this.promptData.isInstallable =
      !this.promptData.isInstalled &&
      'serviceWorker' in navigator &&
      'PushManager' in window

    console.log(
      `📱 PWA Status - Installed: ${this.promptData.isInstalled}, Installable: ${this.promptData.isInstallable}`
    )
  }

  private setupEventListeners(): void {
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', event => {
      console.log('📱 Before install prompt event received')

      // Prevent the mini-infobar from appearing on mobile
      event.preventDefault()

      // Stash the event so it can be triggered later
      this.deferredPrompt = event as BeforeInstallPromptEvent
      this.promptData.promptEvent = event as BeforeInstallPromptEvent
      this.promptData.isInstallable = true

      // Update analytics
      this.trackEvent('beforeinstallprompt')
    })

    // Listen for appinstalled event
    window.addEventListener('appinstalled', event => {
      console.log('📱 PWA was installed')

      this.promptData.isInstalled = true
      this.promptData.installTimestamp = new Date()
      this.promptData.isInstallable = false

      // Update analytics
      this.analytics.successfulInstalls++
      this.updateInstallRate()
      this.trackEvent('appinstalled')

      // Clear deferred prompt
      this.deferredPrompt = null
      this.promptData.promptEvent = null
    })

    // Listen for display mode changes
    window
      .matchMedia('(display-mode: standalone)')
      .addEventListener('change', event => {
        this.promptData.isInstalled = event.matches
        console.log(`📱 Display mode changed - Standalone: ${event.matches}`)
      })

    // Track user engagement
    this.trackUserEngagement()
  }

  private canShowPrompt(): boolean {
    // Don't show if already installed
    if (this.promptData.isInstalled) return false

    // Don't show if not installable
    if (!this.promptData.isInstallable) return false

    // Don't show if exceeded max attempts
    if (this.promptData.promptCount >= this.config.maxPromptAttempts)
      return false

    // Don't show if in cooldown period
    if (this.promptData.lastPromptTime) {
      const timeSinceLastPrompt =
        Date.now() - this.promptData.lastPromptTime.getTime()
      if (timeSinceLastPrompt < this.config.promptCooldown) return false
    }

    return true
  }

  private startAutoPrompt(): void {
    this.promptTimer = setTimeout(() => {
      if (this.canShowPrompt()) {
        this.showInstallPrompt()
      }
    }, this.config.promptDelay)
  }

  private handleInstallAccepted(): void {
    console.log('📱 User accepted PWA installation')

    this.promptData.installSource = 'prompt'
    this.analytics.successfulInstalls++
    this.updateInstallRate()

    // Track install source
    const source = 'prompt'
    this.analytics.installSources[source] =
      (this.analytics.installSources[source] || 0) + 1

    this.trackEvent('install_accepted')
  }

  private handleInstallDismissed(): void {
    console.log('📱 User dismissed PWA installation')

    this.analytics.promptDismissals++
    this.trackEvent('install_dismissed')
  }

  private createCustomPromptElement(
    benefits: AutomationInstallBenefits
  ): HTMLElement {
    const prompt = document.createElement('div')
    prompt.className = 'install-prompt-overlay'
    prompt.innerHTML = `
      <div class="install-prompt-modal">
        <div class="install-prompt-header">
          <h3>🚀 Install HACCP Business Manager</h3>
          <button class="install-dismiss" aria-label="Close">✕</button>
        </div>
        
        <div class="install-prompt-content">
          <p class="install-prompt-message">${this.config.customPromptMessage}</p>
          
          ${
            this.config.showAutomationBenefits
              ? `
            <div class="install-benefits">
              <h4>📱 Mobile Automation Benefits:</h4>
              <ul>
                ${benefits.automationFeatures.map(feature => `<li>${feature}</li>`).join('')}
              </ul>
            </div>
          `
              : ''
          }
          
          <div class="install-prompt-actions">
            <button class="install-accept">📱 Install App</button>
            <button class="install-dismiss">Not Now</button>
          </div>
        </div>
      </div>
    `

    // Add styles
    const style = document.createElement('style')
    style.textContent = `
      .install-prompt-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 20px;
      }
      
      .install-prompt-modal {
        background: white;
        border-radius: 12px;
        max-width: 400px;
        width: 100%;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      }
      
      .install-prompt-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 20px 0;
      }
      
      .install-prompt-header h3 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: #1f2937;
      }
      
      .install-dismiss {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #6b7280;
        padding: 4px;
      }
      
      .install-prompt-content {
        padding: 20px;
      }
      
      .install-prompt-message {
        margin: 0 0 16px;
        color: #4b5563;
        line-height: 1.5;
      }
      
      .install-benefits {
        margin: 16px 0;
        padding: 16px;
        background: #f3f4f6;
        border-radius: 8px;
      }
      
      .install-benefits h4 {
        margin: 0 0 8px;
        font-size: 1rem;
        color: #1f2937;
      }
      
      .install-benefits ul {
        margin: 0;
        padding-left: 20px;
        color: #4b5563;
      }
      
      .install-benefits li {
        margin: 4px 0;
        font-size: 0.875rem;
      }
      
      .install-prompt-actions {
        display: flex;
        gap: 12px;
        margin-top: 20px;
      }
      
      .install-accept, .install-dismiss {
        flex: 1;
        padding: 12px 16px;
        border-radius: 8px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .install-accept {
        background: #3b82f6;
        color: white;
        border: none;
      }
      
      .install-accept:hover {
        background: #2563eb;
      }
      
      .install-dismiss {
        background: #f3f4f6;
        color: #4b5563;
        border: 1px solid #d1d5db;
      }
      
      .install-dismiss:hover {
        background: #e5e7eb;
      }
    `

    document.head.appendChild(style)
    return prompt
  }

  private trackUserEngagement(): void {
    // Track page views, clicks, etc.
    let engagementScore = 0

    // Track page views
    engagementScore += 1

    // Track clicks
    document.addEventListener('click', () => {
      engagementScore += 0.1
    })

    // Track scroll depth
    let maxScrollDepth = 0
    window.addEventListener('scroll', () => {
      const scrollDepth =
        window.scrollY / (document.body.scrollHeight - window.innerHeight)
      maxScrollDepth = Math.max(maxScrollDepth, scrollDepth)
    })

    // Update engagement score periodically
    setInterval(() => {
      this.analytics.userEngagement = Math.min(
        engagementScore + maxScrollDepth,
        10
      )
    }, 30000) // Every 30 seconds
  }

  private trackEvent(eventName: string): void {
    if (!this.config.enableAnalytics) return

    console.log(`📱 Analytics: ${eventName}`)

    // In real implementation, this would send to analytics service
    // Example: analytics.track(eventName, { timestamp: new Date() })
  }

  private updateInstallRate(): void {
    if (this.analytics.totalPrompts > 0) {
      this.analytics.installRate =
        (this.analytics.successfulInstalls / this.analytics.totalPrompts) * 100
    }
  }

  private async loadAnalytics(): Promise<void> {
    try {
      const stored = localStorage.getItem('install_analytics')
      if (stored) {
        this.analytics = { ...this.analytics, ...JSON.parse(stored) }
      }
    } catch (error) {
      console.warn('Failed to load install analytics:', error)
    }
  }

  private async saveAnalytics(): Promise<void> {
    try {
      localStorage.setItem('install_analytics', JSON.stringify(this.analytics))
    } catch (error) {
      console.warn('Failed to save install analytics:', error)
    }
  }

  /**
   * Stop install prompt manager
   */
  public async stop(): Promise<void> {
    if (this.promptTimer) {
      clearTimeout(this.promptTimer)
      this.promptTimer = null
    }

    await this.saveAnalytics()
    this.isInitialized = false
    console.log('📱 Install Prompt Manager stopped')
  }
}

// Extend Window interface for TypeScript
declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
    appinstalled: Event
  }
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// Export singleton instance
export const installPromptManager = new InstallPromptManager()

export default installPromptManager
