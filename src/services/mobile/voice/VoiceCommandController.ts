/**
 * B.10.4 Advanced Mobile & PWA - Voice Command Controller
 * Voice commands for hands-free automation control
 */

export interface VoiceConfig {
  enableVoiceControl: boolean
  enableContinuousListening: boolean
  enableWakeWord: boolean
  wakeWord: string
  language: string
  sensitivity: number // 0-1
  timeout: number // milliseconds
  enableAudioFeedback: boolean
  enableVisualFeedback: boolean
}

export interface VoiceCommand {
  id: string
  name: string
  description: string
  phrases: string[]
  action: (data: any) => Promise<void>
  enabled: boolean
  automationTarget?: string
  requiresConfirmation: boolean
}

export interface VoiceEvent {
  type: 'command' | 'wake' | 'error' | 'timeout'
  command?: string
  confidence?: number
  transcript?: string
  timestamp: Date
  data?: any
}

export interface VoiceAnalytics {
  totalCommands: number
  successfulCommands: number
  failedCommands: number
  averageConfidence: number
  mostUsedCommands: string[]
  averageResponseTime: number
  languageAccuracy: number
}

export class VoiceCommandController {
  private config: VoiceConfig
  private commands: Map<string, VoiceCommand> = new Map()
  private analytics: VoiceAnalytics
  private isInitialized = false
  private recognition: any = null
  private isListening = false
  private wakeWordDetected = false
  private lastCommandTime = 0

  constructor() {
    this.config = {
      enableVoiceControl: true,
      enableContinuousListening: false,
      enableWakeWord: true,
      wakeWord: 'automation',
      language: 'en-US',
      sensitivity: 0.8,
      timeout: 5000,
      enableAudioFeedback: true,
      enableVisualFeedback: true,
    }

    this.analytics = {
      totalCommands: 0,
      successfulCommands: 0,
      failedCommands: 0,
      averageConfidence: 0,
      mostUsedCommands: [],
      averageResponseTime: 0,
      languageAccuracy: 0,
    }
  }

  /**
   * Initialize voice command controller
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    console.log('🎤 Initializing Voice Command Controller...')

    try {
      // Check browser support
      if (!this.isVoiceSupported()) {
        throw new Error('Voice recognition not supported in this browser')
      }

      // Setup voice recognition
      await this.setupVoiceRecognition()

      // Register default automation commands
      await this.registerDefaultCommands()

      // Setup analytics tracking
      this.setupAnalyticsTracking()

      this.isInitialized = true
      console.log('✅ Voice Command Controller initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize voice command controller:', error)
      throw error
    }
  }

  /**
   * Register voice command
   */
  public registerCommand(command: VoiceCommand): void {
    this.commands.set(command.id, command)
    console.log(`🎤 Registered voice command: ${command.name}`)
  }

  /**
   * Unregister voice command
   */
  public unregisterCommand(commandId: string): boolean {
    const removed = this.commands.delete(commandId)
    if (removed) {
      console.log(`🎤 Unregistered voice command: ${commandId}`)
    }
    return removed
  }

  /**
   * Start voice recognition
   */
  public async startListening(): Promise<void> {
    if (!this.isInitialized || !this.recognition) {
      throw new Error('Voice controller not initialized')
    }

    if (this.isListening) {
      console.log('🎤 Already listening')
      return
    }

    try {
      this.recognition.start()
      this.isListening = true
      console.log('🎤 Voice recognition started')
    } catch (error) {
      console.error('Failed to start voice recognition:', error)
      throw error
    }
  }

  /**
   * Stop voice recognition
   */
  public async stopListening(): Promise<void> {
    if (!this.isListening || !this.recognition) {
      return
    }

    try {
      this.recognition.stop()
      this.isListening = false
      console.log('🎤 Voice recognition stopped')
    } catch (error) {
      console.error('Failed to stop voice recognition:', error)
    }
  }

  /**
   * Execute voice command
   */
  public async executeCommand(commandId: string, data?: any): Promise<boolean> {
    const command = this.commands.get(commandId)
    if (!command || !command.enabled) {
      return false
    }

    try {
      const startTime = Date.now()
      await command.action(data)
      const responseTime = Date.now() - startTime

      // Update analytics
      this.updateAnalytics(commandId, true, responseTime)

      console.log(`🎤 Executed voice command: ${command.name}`)
      return true
    } catch (error) {
      console.error(`Failed to execute voice command ${commandId}:`, error)
      this.updateAnalytics(commandId, false, 0)
      return false
    }
  }

  /**
   * Get available commands
   */
  public getAvailableCommands(): VoiceCommand[] {
    return Array.from(this.commands.values())
  }

  /**
   * Get voice analytics
   */
  public getVoiceAnalytics(): VoiceAnalytics {
    return { ...this.analytics }
  }

  /**
   * Update voice configuration
   */
  public updateConfig(newConfig: Partial<VoiceConfig>): void {
    this.config = { ...this.config, ...newConfig }

    if (this.recognition) {
      this.recognition.language = this.config.language
    }

    console.log('🎤 Voice configuration updated')
  }

  /**
   * Check if voice is supported
   */
  public isVoiceSupported(): boolean {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
  }

  /**
   * Check if currently listening
   */
  public isCurrentlyListening(): boolean {
    return this.isListening
  }

  /**
   * Private helper methods
   */

  private async setupVoiceRecognition(): Promise<void> {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    this.recognition = new SpeechRecognition()

    // Configure recognition
    this.recognition.continuous = this.config.enableContinuousListening
    this.recognition.interimResults = false
    this.recognition.lang = this.config.language
    this.recognition.maxAlternatives = 1

    // Setup event handlers
    this.recognition.onstart = () => {
      console.log('🎤 Voice recognition started')
      this.showVisualFeedback('listening')
    }

    this.recognition.onresult = (event: any) => {
      this.handleRecognitionResult(event)
    }

    this.recognition.onerror = (event: any) => {
      this.handleRecognitionError(event)
    }

    this.recognition.onend = () => {
      console.log('🎤 Voice recognition ended')
      this.isListening = false
      this.hideVisualFeedback()
    }

    console.log('🎤 Voice recognition setup complete')
  }

  private async registerDefaultCommands(): Promise<void> {
    // Start automation
    this.registerCommand({
      id: 'start-automation',
      name: 'Start Automation',
      description: 'Start automation process',
      phrases: [
        'start automation',
        'begin automation',
        'run automation',
        'execute automation',
      ],
      action: async data => {
        window.dispatchEvent(
          new CustomEvent('voiceAutomationCommand', {
            detail: { command: 'start', data },
          })
        )
      },
      enabled: true,
      automationTarget: 'workflow',
      requiresConfirmation: false,
    })

    // Stop automation
    this.registerCommand({
      id: 'stop-automation',
      name: 'Stop Automation',
      description: 'Stop automation process',
      phrases: [
        'stop automation',
        'halt automation',
        'pause automation',
        'end automation',
      ],
      action: async data => {
        window.dispatchEvent(
          new CustomEvent('voiceAutomationCommand', {
            detail: { command: 'stop', data },
          })
        )
      },
      enabled: true,
      automationTarget: 'workflow',
      requiresConfirmation: true,
    })

    // Show dashboard
    this.registerCommand({
      id: 'show-dashboard',
      name: 'Show Dashboard',
      description: 'Show automation dashboard',
      phrases: [
        'show dashboard',
        'open dashboard',
        'view dashboard',
        'dashboard',
      ],
      action: async data => {
        window.dispatchEvent(
          new CustomEvent('voiceAutomationCommand', {
            detail: { command: 'showDashboard', data },
          })
        )
      },
      enabled: true,
      automationTarget: 'dashboard',
      requiresConfirmation: false,
    })

    // Show alerts
    this.registerCommand({
      id: 'show-alerts',
      name: 'Show Alerts',
      description: 'Show automation alerts',
      phrases: [
        'show alerts',
        'open alerts',
        'view alerts',
        'alerts',
        'notifications',
      ],
      action: async data => {
        window.dispatchEvent(
          new CustomEvent('voiceAutomationCommand', {
            detail: { command: 'showAlerts', data },
          })
        )
      },
      enabled: true,
      automationTarget: 'alerts',
      requiresConfirmation: false,
    })

    // Show reports
    this.registerCommand({
      id: 'show-reports',
      name: 'Show Reports',
      description: 'Show automation reports',
      phrases: [
        'show reports',
        'open reports',
        'view reports',
        'reports',
        'generate report',
      ],
      action: async data => {
        window.dispatchEvent(
          new CustomEvent('voiceAutomationCommand', {
            detail: { command: 'showReports', data },
          })
        )
      },
      enabled: true,
      automationTarget: 'reports',
      requiresConfirmation: false,
    })

    // Show scheduling
    this.registerCommand({
      id: 'show-scheduling',
      name: 'Show Scheduling',
      description: 'Show automation scheduling',
      phrases: [
        'show scheduling',
        'open scheduling',
        'view scheduling',
        'schedule',
        'scheduling',
      ],
      action: async data => {
        window.dispatchEvent(
          new CustomEvent('voiceAutomationCommand', {
            detail: { command: 'showScheduling', data },
          })
        )
      },
      enabled: true,
      automationTarget: 'scheduling',
      requiresConfirmation: false,
    })

    // Check status
    this.registerCommand({
      id: 'check-status',
      name: 'Check Status',
      description: 'Check automation status',
      phrases: [
        'check status',
        'what is the status',
        'status',
        'how is automation',
      ],
      action: async data => {
        window.dispatchEvent(
          new CustomEvent('voiceAutomationCommand', {
            detail: { command: 'checkStatus', data },
          })
        )
      },
      enabled: true,
      automationTarget: 'status',
      requiresConfirmation: false,
    })

    // Help
    this.registerCommand({
      id: 'help',
      name: 'Help',
      description: 'Show available voice commands',
      phrases: ['help', 'what can I say', 'commands', 'voice commands'],
      action: async data => {
        window.dispatchEvent(
          new CustomEvent('voiceAutomationCommand', {
            detail: { command: 'help', data },
          })
        )
      },
      enabled: true,
      automationTarget: 'help',
      requiresConfirmation: false,
    })

    console.log('🎤 Default automation voice commands registered')
  }

  private setupAnalyticsTracking(): void {
    // Track voice command usage patterns
    setInterval(() => {
      this.analyzeVoicePatterns()
    }, 60000) // Every minute

    console.log('🎤 Analytics tracking setup complete')
  }

  private handleRecognitionResult(event: any): void {
    const result = event.results[event.results.length - 1]
    const transcript = result[0].transcript.toLowerCase().trim()
    const confidence = result[0].confidence

    console.log(`🎤 Recognized: "${transcript}" (confidence: ${confidence})`)

    // Check for wake word
    if (this.config.enableWakeWord && !this.wakeWordDetected) {
      if (transcript.includes(this.config.wakeWord)) {
        this.wakeWordDetected = true
        this.showVisualFeedback('wake')
        this.playAudioFeedback('wake')
        return
      }
    }

    // Process command
    if (this.wakeWordDetected || !this.config.enableWakeWord) {
      this.processVoiceCommand(transcript, confidence)
    }

    this.wakeWordDetected = false
  }

  private handleRecognitionError(event: any): void {
    console.error('🎤 Voice recognition error:', event.error)

    const voiceEvent: VoiceEvent = {
      type: 'error',
      timestamp: new Date(),
      data: { error: event.error },
    }

    this.dispatchVoiceEvent(voiceEvent)
    this.showVisualFeedback('error')
    this.playAudioFeedback('error')
  }

  private processVoiceCommand(transcript: string, confidence: number): void {
    // Find matching command
    const command = this.findMatchingCommand(transcript)

    if (command && confidence >= this.config.sensitivity) {
      const voiceEvent: VoiceEvent = {
        type: 'command',
        command: command.id,
        confidence,
        transcript,
        timestamp: new Date(),
      }

      this.dispatchVoiceEvent(voiceEvent)
      this.executeCommand(command.id, { transcript, confidence })

      this.showVisualFeedback('success')
      this.playAudioFeedback('success')
    } else {
      console.log('🎤 No matching command found or low confidence')
      this.showVisualFeedback('no_match')
      this.playAudioFeedback('no_match')
    }
  }

  private findMatchingCommand(transcript: string): VoiceCommand | null {
    for (const command of this.commands.values()) {
      if (!command.enabled) continue

      for (const phrase of command.phrases) {
        if (transcript.includes(phrase.toLowerCase())) {
          return command
        }
      }
    }
    return null
  }

  private dispatchVoiceEvent(event: VoiceEvent): void {
    window.dispatchEvent(
      new CustomEvent('voiceEvent', {
        detail: event,
      })
    )
  }

  private showVisualFeedback(
    type: 'listening' | 'wake' | 'success' | 'error' | 'no_match'
  ): void {
    if (!this.config.enableVisualFeedback) return

    // Create visual feedback element
    const feedback = document.createElement('div')
    feedback.className = `voice-feedback voice-feedback-${type}`
    feedback.innerHTML = this.getVisualFeedbackHTML(type)

    document.body.appendChild(feedback)

    // Remove after timeout
    setTimeout(() => {
      if (document.body.contains(feedback)) {
        document.body.removeChild(feedback)
      }
    }, 2000)
  }

  private hideVisualFeedback(): void {
    const existingFeedback = document.querySelector('.voice-feedback')
    if (existingFeedback) {
      document.body.removeChild(existingFeedback)
    }
  }

  private getVisualFeedbackHTML(type: string): string {
    const feedbackMap: Record<string, string> = {
      listening: '🎤 Listening...',
      wake: '👂 Wake word detected',
      success: '✅ Command executed',
      error: '❌ Recognition error',
      no_match: '❓ Command not recognized',
    }

    return feedbackMap[type] || '🎤 Voice feedback'
  }

  private playAudioFeedback(
    type: 'wake' | 'success' | 'error' | 'no_match'
  ): void {
    if (!this.config.enableAudioFeedback) return

    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    // Different frequencies for different feedback types
    const frequencies = {
      wake: 800,
      success: 1000,
      error: 400,
      no_match: 600,
    }

    oscillator.frequency.setValueAtTime(
      frequencies[type],
      audioContext.currentTime
    )
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.2
    )

    oscillator.start()
    oscillator.stop(audioContext.currentTime + 0.2)
  }

  private updateAnalytics(
    commandId: string,
    success: boolean,
    responseTime: number
  ): void {
    this.analytics.totalCommands++

    if (success) {
      this.analytics.successfulCommands++
    } else {
      this.analytics.failedCommands++
    }

    // Update average response time
    this.analytics.averageResponseTime =
      (this.analytics.averageResponseTime + responseTime) / 2

    // Update most used commands
    const command = this.commands.get(commandId)
    if (command) {
      const index = this.analytics.mostUsedCommands.indexOf(command.name)
      if (index === -1) {
        this.analytics.mostUsedCommands.push(command.name)
      }
    }
  }

  private analyzeVoicePatterns(): void {
    // Analyze voice command usage patterns
    const successRate =
      (this.analytics.successfulCommands / this.analytics.totalCommands) * 100

    if (successRate < 80) {
      // Adjust sensitivity if success rate is low
      this.config.sensitivity = Math.max(0.5, this.config.sensitivity - 0.1)
      console.log('🎤 Adjusted voice sensitivity due to low success rate')
    } else if (successRate > 95) {
      // Increase sensitivity if success rate is very high
      this.config.sensitivity = Math.min(1, this.config.sensitivity + 0.05)
      console.log('🎤 Adjusted voice sensitivity due to high success rate')
    }
  }

  /**
   * Stop voice command controller
   */
  public async stop(): Promise<void> {
    if (this.isListening) {
      await this.stopListening()
    }

    this.commands.clear()
    this.recognition = null
    this.isInitialized = false
    console.log('🎤 Voice Command Controller stopped')
  }
}

// Export singleton instance
export const voiceCommandController = new VoiceCommandController()

export default voiceCommandController
