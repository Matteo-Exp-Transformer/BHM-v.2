/**
 * B.10.4 Advanced Mobile & PWA - Mobile Voice Services Index
 * Voice command services for mobile automation features
 */

// Voice Services (B.10.4 Session 4) - 🚀 IN PROGRESS
export {
  voiceCommandController,
  VoiceCommandController,
} from './VoiceCommandController'

/**
 * Mobile Voice Services Manager
 * Central coordinator for all mobile voice services
 */
class MobileVoiceServicesManager {
  private services: Map<string, any> = new Map()
  private initialized = false

  constructor() {
    this.registerServices()
  }

  /**
   * Initialize mobile voice services
   */
  public async initialize(): Promise<void> {
    if (this.initialized) return

    console.log('🎤 Initializing Mobile Voice Services...')

    try {
      // Initialize all voice services
      await voiceCommandController.initialize()

      this.initialized = true
      console.log('✅ Mobile Voice Services initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize mobile voice services:', error)
      throw error
    }
  }

  /**
   * Start voice recognition
   */
  public async startListening(): Promise<void> {
    await voiceCommandController.startListening()
  }

  /**
   * Stop voice recognition
   */
  public async stopListening(): Promise<void> {
    await voiceCommandController.stopListening()
  }

  /**
   * Register voice command
   */
  public registerCommand(command: {
    id: string
    name: string
    description: string
    phrases: string[]
    action: (data: any) => Promise<void>
    enabled: boolean
    automationTarget?: string
    requiresConfirmation: boolean
  }): void {
    voiceCommandController.registerCommand(command)
  }

  /**
   * Execute voice command
   */
  public async executeCommand(commandId: string, data?: any): Promise<boolean> {
    return await voiceCommandController.executeCommand(commandId, data)
  }

  /**
   * Get available commands
   */
  public getAvailableCommands(): any[] {
    return voiceCommandController.getAvailableCommands()
  }

  /**
   * Get voice analytics
   */
  public getVoiceAnalytics(): {
    totalCommands: number
    successfulCommands: number
    failedCommands: number
    averageConfidence: number
    mostUsedCommands: string[]
    averageResponseTime: number
    languageAccuracy: number
  } {
    return voiceCommandController.getVoiceAnalytics()
  }

  /**
   * Update voice configuration
   */
  public updateConfig(newConfig: {
    enableVoiceControl?: boolean
    enableContinuousListening?: boolean
    enableWakeWord?: boolean
    wakeWord?: string
    language?: string
    sensitivity?: number
    timeout?: number
    enableAudioFeedback?: boolean
    enableVisualFeedback?: boolean
  }): void {
    voiceCommandController.updateConfig(newConfig)
  }

  /**
   * Check if voice is supported
   */
  public isVoiceSupported(): boolean {
    return voiceCommandController.isVoiceSupported()
  }

  /**
   * Check if currently listening
   */
  public isCurrentlyListening(): boolean {
    return voiceCommandController.isCurrentlyListening()
  }

  /**
   * Private helper methods
   */

  private registerServices(): void {
    this.services.set('voiceController', voiceCommandController)
    console.log('🎤 Registered mobile voice services')
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
   * Stop mobile voice services
   */
  public async stop(): Promise<void> {
    await voiceCommandController.stop()
    this.services.clear()
    this.initialized = false
    console.log('🎤 Mobile Voice Services stopped')
  }
}

// Export singleton instance
export const mobileVoiceServices = new MobileVoiceServicesManager()

export default mobileVoiceServices
