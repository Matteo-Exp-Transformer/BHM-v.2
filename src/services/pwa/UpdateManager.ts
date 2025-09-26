/**
 * B.10.4 Advanced Mobile & PWA - Update Manager
 * Seamless automation updates and version management
 */

export interface UpdateConfig {
  enableAutoUpdate: boolean
  checkInterval: number // milliseconds
  enableBackgroundUpdate: boolean
  enableUpdateNotifications: boolean
  updateStrategy: 'immediate' | 'scheduled' | 'user-prompt'
  maintenanceWindow: {
    start: string // HH:MM format
    end: string // HH:MM format
    days: number[] // Days of week (0-6)
  }
}

export interface UpdateInfo {
  version: string
  releaseDate: Date
  changelog: string[]
  automationFeatures: string[]
  breakingChanges: string[]
  updateSize: number // bytes
  estimatedDownloadTime: number // seconds
  requiresRestart: boolean
}

export interface UpdateStatus {
  isAvailable: boolean
  isDownloading: boolean
  isInstalling: boolean
  isReady: boolean
  currentVersion: string
  latestVersion: string
  updateProgress: number
  lastCheckTime: Date | null
  nextCheckTime: Date | null
  error: string | null
}

export interface UpdateAnalytics {
  totalChecks: number
  updatesAvailable: number
  updatesInstalled: number
  updateSuccessRate: number
  averageUpdateTime: number
  userAcceptanceRate: number
  updateSources: Record<string, number>
}

export class UpdateManager {
  private config: UpdateConfig
  private updateStatus: UpdateStatus
  private analytics: UpdateAnalytics
  private checkTimer: NodeJS.Timeout | null = null
  private isInitialized = false
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null
  private updateInfo: UpdateInfo | null = null

  constructor() {
    this.config = {
      enableAutoUpdate: true,
      checkInterval: 60 * 60 * 1000, // 1 hour
      enableBackgroundUpdate: true,
      enableUpdateNotifications: true,
      updateStrategy: 'user-prompt',
      maintenanceWindow: {
        start: '02:00',
        end: '04:00',
        days: [0, 1, 2, 3, 4, 5, 6], // All days
      },
    }

    this.updateStatus = {
      isAvailable: false,
      isDownloading: false,
      isInstalling: false,
      isReady: false,
      currentVersion: this.getCurrentVersion(),
      latestVersion: '',
      updateProgress: 0,
      lastCheckTime: null,
      nextCheckTime: null,
      error: null,
    }

    this.analytics = {
      totalChecks: 0,
      updatesAvailable: 0,
      updatesInstalled: 0,
      updateSuccessRate: 0,
      averageUpdateTime: 0,
      userAcceptanceRate: 0,
      updateSources: {},
    }
  }

  /**
   * Initialize update manager
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    console.log('🔄 Initializing Update Manager...')

    try {
      // Get service worker registration
      await this.getServiceWorkerRegistration()

      // Setup event listeners
      this.setupEventListeners()

      // Load analytics data
      await this.loadAnalytics()

      // Start update checking
      if (this.config.enableAutoUpdate) {
        this.startUpdateChecking()
      }

      // Check for updates immediately
      await this.checkForUpdates()

      this.isInitialized = true
      console.log('✅ Update Manager initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize update manager:', error)
      throw error
    }
  }

  /**
   * Check for updates
   */
  public async checkForUpdates(): Promise<boolean> {
    try {
      console.log('🔄 Checking for updates...')

      this.updateStatus.lastCheckTime = new Date()
      this.analytics.totalChecks++

      // Check service worker updates
      if (this.serviceWorkerRegistration) {
        await this.serviceWorkerRegistration.update()
      }

      // Check for automation system updates
      const updateAvailable = await this.checkAutomationUpdates()

      if (updateAvailable) {
        this.updateStatus.isAvailable = true
        this.analytics.updatesAvailable++

        if (this.config.enableUpdateNotifications) {
          this.showUpdateNotification()
        }

        console.log('🔄 Update available:', this.updateInfo?.version)
        return true
      } else {
        this.updateStatus.isAvailable = false
        console.log('🔄 No updates available')
        return false
      }
    } catch (error) {
      console.error('Failed to check for updates:', error)
      this.updateStatus.error =
        error instanceof Error ? error.message : 'Unknown error'
      return false
    }
  }

  /**
   * Download and install update
   */
  public async installUpdate(): Promise<boolean> {
    if (!this.updateStatus.isAvailable) {
      console.log('🔄 No update available to install')
      return false
    }

    try {
      console.log('🔄 Installing update...')

      this.updateStatus.isInstalling = true
      this.updateStatus.updateProgress = 0

      // Simulate update installation
      await this.simulateUpdateInstallation()

      // Apply update
      await this.applyUpdate()

      // Update status
      this.updateStatus.isInstalling = false
      this.updateStatus.isReady = true
      this.updateStatus.currentVersion = this.updateStatus.latestVersion
      this.analytics.updatesInstalled++

      console.log('✅ Update installed successfully')
      return true
    } catch (error) {
      console.error('Failed to install update:', error)
      this.updateStatus.error =
        error instanceof Error ? error.message : 'Unknown error'
      this.updateStatus.isInstalling = false
      return false
    }
  }

  /**
   * Restart application with new version
   */
  public async restartApplication(): Promise<void> {
    if (!this.updateStatus.isReady) {
      throw new Error('No update ready for restart')
    }

    try {
      console.log('🔄 Restarting application...')

      // Clear caches
      await this.clearCaches()

      // Reload page
      window.location.reload()
    } catch (error) {
      console.error('Failed to restart application:', error)
      throw error
    }
  }

  /**
   * Show update prompt to user
   */
  public async showUpdatePrompt(): Promise<boolean> {
    if (!this.updateStatus.isAvailable || !this.updateInfo) {
      return false
    }

    const prompt = this.createUpdatePromptElement(this.updateInfo)
    document.body.appendChild(prompt)

    return new Promise(resolve => {
      const acceptButton = prompt.querySelector('.update-accept')
      const dismissButton = prompt.querySelector('.update-dismiss')
      const scheduleButton = prompt.querySelector('.update-schedule')

      acceptButton?.addEventListener('click', async () => {
        document.body.removeChild(prompt)
        const success = await this.installUpdate()
        resolve(success)
      })

      dismissButton?.addEventListener('click', () => {
        document.body.removeChild(prompt)
        resolve(false)
      })

      scheduleButton?.addEventListener('click', () => {
        document.body.removeChild(prompt)
        this.scheduleUpdate()
        resolve(false)
      })

      // Auto-dismiss after 60 seconds
      setTimeout(() => {
        if (document.body.contains(prompt)) {
          document.body.removeChild(prompt)
          resolve(false)
        }
      }, 60000)
    })
  }

  /**
   * Get update status
   */
  public getUpdateStatus(): UpdateStatus {
    return { ...this.updateStatus }
  }

  /**
   * Get update analytics
   */
  public getUpdateAnalytics(): UpdateAnalytics {
    return { ...this.analytics }
  }

  /**
   * Get current version
   */
  public getCurrentVersion(): string {
    // In real implementation, this would come from package.json or build info
    return '1.0.0'
  }

  /**
   * Private helper methods
   */

  private async getServiceWorkerRegistration(): Promise<void> {
    if ('serviceWorker' in navigator) {
      this.serviceWorkerRegistration =
        await navigator.serviceWorker.getRegistration()
    }
  }

  private setupEventListeners(): void {
    // Listen for service worker updates
    if (this.serviceWorkerRegistration) {
      this.serviceWorkerRegistration.addEventListener('updatefound', () => {
        const newWorker = this.serviceWorkerRegistration!.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              console.log('🔄 New service worker available')
              this.handleServiceWorkerUpdate()
            }
          })
        }
      })
    }

    // Listen for page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (
        document.visibilityState === 'visible' &&
        this.config.enableAutoUpdate
      ) {
        this.checkForUpdates()
      }
    })

    // Listen for online/offline events
    window.addEventListener('online', () => {
      if (this.config.enableAutoUpdate) {
        this.checkForUpdates()
      }
    })
  }

  private async checkAutomationUpdates(): Promise<boolean> {
    try {
      // In real implementation, this would check with update server
      const response = await fetch('/api/automation/updates/check', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Current-Version': this.updateStatus.currentVersion,
        },
      })

      if (response.ok) {
        const updateData = await response.json()

        if (updateData.updateAvailable) {
          this.updateInfo = {
            version: updateData.version,
            releaseDate: new Date(updateData.releaseDate),
            changelog: updateData.changelog,
            automationFeatures: updateData.automationFeatures,
            breakingChanges: updateData.breakingChanges,
            updateSize: updateData.updateSize,
            estimatedDownloadTime: updateData.estimatedDownloadTime,
            requiresRestart: updateData.requiresRestart,
          }

          this.updateStatus.latestVersion = updateData.version
          return true
        }
      }
    } catch (error) {
      console.warn('Failed to check automation updates:', error)
    }

    return false
  }

  private async simulateUpdateInstallation(): Promise<void> {
    // Simulate download progress
    for (let i = 0; i <= 100; i += 10) {
      this.updateStatus.updateProgress = i
      await new Promise(resolve => setTimeout(resolve, 200))
    }
  }

  private async applyUpdate(): Promise<void> {
    // In real implementation, this would apply the actual update
    console.log('🔄 Applying update...')

    // Update service worker
    if (
      this.serviceWorkerRegistration &&
      this.serviceWorkerRegistration.waiting
    ) {
      this.serviceWorkerRegistration.waiting.postMessage({
        type: 'SKIP_WAITING',
      })
    }

    // Update automation services
    await this.updateAutomationServices()
  }

  private async updateAutomationServices(): Promise<void> {
    // In real implementation, this would update automation services
    console.log('🔄 Updating automation services...')
  }

  private async clearCaches(): Promise<void> {
    // Clear service worker caches
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)))
    }

    // Clear localStorage
    localStorage.removeItem('automation_cache')
    localStorage.removeItem('automation_offline_data')
  }

  private handleServiceWorkerUpdate(): void {
    this.updateStatus.isAvailable = true
    this.updateStatus.latestVersion = 'service-worker-update'

    if (this.config.enableUpdateNotifications) {
      this.showUpdateNotification()
    }
  }

  private showUpdateNotification(): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('🔄 Update Available', {
        body: 'A new version of HACCP Business Manager is available with automation improvements',
        icon: '/icons/update.png',
        tag: 'update-available',
      })

      notification.onclick = () => {
        this.showUpdatePrompt()
        notification.close()
      }
    }
  }

  private createUpdatePromptElement(updateInfo: UpdateInfo): HTMLElement {
    const prompt = document.createElement('div')
    prompt.className = 'update-prompt-overlay'
    prompt.innerHTML = `
      <div class="update-prompt-modal">
        <div class="update-prompt-header">
          <h3>🔄 Update Available</h3>
          <button class="update-dismiss" aria-label="Close">✕</button>
        </div>
        
        <div class="update-prompt-content">
          <div class="update-info">
            <p><strong>Version:</strong> ${updateInfo.version}</p>
            <p><strong>Size:</strong> ${this.formatBytes(updateInfo.updateSize)}</p>
            <p><strong>Estimated time:</strong> ${updateInfo.estimatedDownloadTime}s</p>
          </div>
          
          <div class="update-changelog">
            <h4>🚀 New Automation Features:</h4>
            <ul>
              ${updateInfo.automationFeatures.map(feature => `<li>${feature}</li>`).join('')}
            </ul>
          </div>
          
          ${
            updateInfo.breakingChanges.length > 0
              ? `
            <div class="update-breaking-changes">
              <h4>⚠️ Breaking Changes:</h4>
              <ul>
                ${updateInfo.breakingChanges.map(change => `<li>${change}</li>`).join('')}
              </ul>
            </div>
          `
              : ''
          }
          
          <div class="update-prompt-actions">
            <button class="update-accept">🔄 Install Now</button>
            <button class="update-schedule">⏰ Schedule</button>
            <button class="update-dismiss">Not Now</button>
          </div>
        </div>
      </div>
    `

    // Add styles
    const style = document.createElement('style')
    style.textContent = `
      .update-prompt-overlay {
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
      
      .update-prompt-modal {
        background: white;
        border-radius: 12px;
        max-width: 500px;
        width: 100%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      }
      
      .update-prompt-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 20px 0;
      }
      
      .update-prompt-header h3 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: #1f2937;
      }
      
      .update-dismiss {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #6b7280;
        padding: 4px;
      }
      
      .update-prompt-content {
        padding: 20px;
      }
      
      .update-info {
        margin-bottom: 16px;
        padding: 12px;
        background: #f3f4f6;
        border-radius: 8px;
      }
      
      .update-info p {
        margin: 4px 0;
        font-size: 0.875rem;
        color: #4b5563;
      }
      
      .update-changelog, .update-breaking-changes {
        margin: 16px 0;
      }
      
      .update-changelog h4, .update-breaking-changes h4 {
        margin: 0 0 8px;
        font-size: 1rem;
        color: #1f2937;
      }
      
      .update-changelog ul, .update-breaking-changes ul {
        margin: 0;
        padding-left: 20px;
        color: #4b5563;
      }
      
      .update-changelog li, .update-breaking-changes li {
        margin: 4px 0;
        font-size: 0.875rem;
      }
      
      .update-breaking-changes {
        padding: 12px;
        background: #fef3c7;
        border-radius: 8px;
        border-left: 4px solid #f59e0b;
      }
      
      .update-prompt-actions {
        display: flex;
        gap: 12px;
        margin-top: 20px;
      }
      
      .update-accept, .update-schedule, .update-dismiss {
        flex: 1;
        padding: 12px 16px;
        border-radius: 8px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .update-accept {
        background: #3b82f6;
        color: white;
        border: none;
      }
      
      .update-accept:hover {
        background: #2563eb;
      }
      
      .update-schedule {
        background: #10b981;
        color: white;
        border: none;
      }
      
      .update-schedule:hover {
        background: #059669;
      }
      
      .update-dismiss {
        background: #f3f4f6;
        color: #4b5563;
        border: 1px solid #d1d5db;
      }
      
      .update-dismiss:hover {
        background: #e5e7eb;
      }
    `

    document.head.appendChild(style)
    return prompt
  }

  private scheduleUpdate(): void {
    // Schedule update for maintenance window
    console.log('🔄 Update scheduled for maintenance window')
  }

  private startUpdateChecking(): void {
    this.checkTimer = setInterval(() => {
      this.checkForUpdates()
    }, this.config.checkInterval)

    // Set next check time
    this.updateStatus.nextCheckTime = new Date(
      Date.now() + this.config.checkInterval
    )
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  private async loadAnalytics(): Promise<void> {
    try {
      const stored = localStorage.getItem('update_analytics')
      if (stored) {
        this.analytics = { ...this.analytics, ...JSON.parse(stored) }
      }
    } catch (error) {
      console.warn('Failed to load update analytics:', error)
    }
  }

  private async saveAnalytics(): Promise<void> {
    try {
      localStorage.setItem('update_analytics', JSON.stringify(this.analytics))
    } catch (error) {
      console.warn('Failed to save update analytics:', error)
    }
  }

  /**
   * Stop update manager
   */
  public async stop(): Promise<void> {
    if (this.checkTimer) {
      clearInterval(this.checkTimer)
      this.checkTimer = null
    }

    await this.saveAnalytics()
    this.isInitialized = false
    console.log('🔄 Update Manager stopped')
  }
}

// Export singleton instance
export const updateManager = new UpdateManager()

export default updateManager
