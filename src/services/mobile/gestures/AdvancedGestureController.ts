/**
 * B.10.4 Advanced Mobile & PWA - Advanced Gesture Controller
 * Advanced gesture controls for automation features
 */

export interface GestureConfig {
  enableSwipeGestures: boolean
  enablePinchGestures: boolean
  enableLongPress: boolean
  enableDoubleTap: boolean
  enableMultiTouch: boolean
  enableCustomGestures: boolean
  sensitivity: number // 0-1
  threshold: number // pixels
  timeout: number // milliseconds
}

export interface GestureEvent {
  type: 'swipe' | 'pinch' | 'longpress' | 'doubletap' | 'multitouch' | 'custom'
  direction?: 'up' | 'down' | 'left' | 'right'
  scale?: number
  duration?: number
  touches?: number
  data?: any
  timestamp: Date
  element: HTMLElement
}

export interface GestureAction {
  id: string
  name: string
  description: string
  gesture: GestureEvent['type']
  config: any
  action: (event: GestureEvent) => Promise<void>
  enabled: boolean
  automationTarget?: string
}

export interface GestureAnalytics {
  totalGestures: number
  gestureTypes: Record<string, number>
  successRate: number
  averageResponseTime: number
  userPreferences: Record<string, any>
}

export class AdvancedGestureController {
  private config: GestureConfig
  private gestures: Map<string, GestureAction> = new Map()
  private analytics: GestureAnalytics
  private isInitialized = false
  private touchStartTime = 0
  private touchStartPosition = { x: 0, y: 0 }
  private lastTouchTime = 0
  private touchCount = 0
  private activeTouches: Map<number, Touch> = new Map()

  constructor() {
    this.config = {
      enableSwipeGestures: true,
      enablePinchGestures: true,
      enableLongPress: true,
      enableDoubleTap: true,
      enableMultiTouch: true,
      enableCustomGestures: true,
      sensitivity: 0.7,
      threshold: 50,
      timeout: 500,
    }

    this.analytics = {
      totalGestures: 0,
      gestureTypes: {},
      successRate: 0,
      averageResponseTime: 0,
      userPreferences: {},
    }
  }

  /**
   * Initialize advanced gesture controller
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    console.log('👆 Initializing Advanced Gesture Controller...')

    try {
      // Setup gesture detection
      this.setupGestureDetection()

      // Register default automation gestures
      await this.registerDefaultGestures()

      // Setup analytics tracking
      this.setupAnalyticsTracking()

      this.isInitialized = true
      console.log('✅ Advanced Gesture Controller initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize gesture controller:', error)
      throw error
    }
  }

  /**
   * Register gesture action
   */
  public registerGesture(gestureAction: GestureAction): void {
    this.gestures.set(gestureAction.id, gestureAction)
    console.log(`👆 Registered gesture: ${gestureAction.name}`)
  }

  /**
   * Unregister gesture action
   */
  public unregisterGesture(gestureId: string): boolean {
    const removed = this.gestures.delete(gestureId)
    if (removed) {
      console.log(`👆 Unregistered gesture: ${gestureId}`)
    }
    return removed
  }

  /**
   * Execute gesture
   */
  public async executeGesture(
    gestureId: string,
    event: GestureEvent
  ): Promise<boolean> {
    const gesture = this.gestures.get(gestureId)
    if (!gesture || !gesture.enabled) {
      return false
    }

    try {
      const startTime = Date.now()
      await gesture.action(event)
      const responseTime = Date.now() - startTime

      // Update analytics
      this.updateAnalytics(gesture.type, true, responseTime)

      console.log(`👆 Executed gesture: ${gesture.name}`)
      return true
    } catch (error) {
      console.error(`Failed to execute gesture ${gestureId}:`, error)
      this.updateAnalytics(gesture.type, false, 0)
      return false
    }
  }

  /**
   * Get available gestures
   */
  public getAvailableGestures(): GestureAction[] {
    return Array.from(this.gestures.values())
  }

  /**
   * Get gesture analytics
   */
  public getGestureAnalytics(): GestureAnalytics {
    return { ...this.analytics }
  }

  /**
   * Update gesture configuration
   */
  public updateConfig(newConfig: Partial<GestureConfig>): void {
    this.config = { ...this.config, ...newConfig }
    console.log('👆 Gesture configuration updated')
  }

  /**
   * Private helper methods
   */

  private setupGestureDetection(): void {
    // Setup touch event listeners
    document.addEventListener('touchstart', this.handleTouchStart.bind(this), {
      passive: false,
    })
    document.addEventListener('touchmove', this.handleTouchMove.bind(this), {
      passive: false,
    })
    document.addEventListener('touchend', this.handleTouchEnd.bind(this), {
      passive: false,
    })
    document.addEventListener(
      'touchcancel',
      this.handleTouchCancel.bind(this),
      { passive: false }
    )

    // Setup mouse events for desktop testing
    document.addEventListener('mousedown', this.handleMouseDown.bind(this))
    document.addEventListener('mousemove', this.handleMouseMove.bind(this))
    document.addEventListener('mouseup', this.handleMouseUp.bind(this))

    console.log('👆 Gesture detection setup complete')
  }

  private async registerDefaultGestures(): Promise<void> {
    // Swipe up - Show automation dashboard
    this.registerGesture({
      id: 'swipe-up-dashboard',
      name: 'Show Dashboard',
      description: 'Swipe up to show automation dashboard',
      gesture: 'swipe',
      config: { direction: 'up', threshold: this.config.threshold },
      action: async event => {
        if (event.direction === 'up') {
          window.dispatchEvent(
            new CustomEvent('gestureAutomationCommand', {
              detail: { command: 'showDashboard', gesture: event },
            })
          )
        }
      },
      enabled: true,
      automationTarget: 'dashboard',
    })

    // Swipe down - Hide automation panel
    this.registerGesture({
      id: 'swipe-down-hide',
      name: 'Hide Panel',
      description: 'Swipe down to hide automation panel',
      gesture: 'swipe',
      config: { direction: 'down', threshold: this.config.threshold },
      action: async event => {
        if (event.direction === 'down') {
          window.dispatchEvent(
            new CustomEvent('gestureAutomationCommand', {
              detail: { command: 'hidePanel', gesture: event },
            })
          )
        }
      },
      enabled: true,
      automationTarget: 'panel',
    })

    // Swipe left - Previous automation
    this.registerGesture({
      id: 'swipe-left-previous',
      name: 'Previous Automation',
      description: 'Swipe left to go to previous automation',
      gesture: 'swipe',
      config: { direction: 'left', threshold: this.config.threshold },
      action: async event => {
        if (event.direction === 'left') {
          window.dispatchEvent(
            new CustomEvent('gestureAutomationCommand', {
              detail: { command: 'previousAutomation', gesture: event },
            })
          )
        }
      },
      enabled: true,
      automationTarget: 'navigation',
    })

    // Swipe right - Next automation
    this.registerGesture({
      id: 'swipe-right-next',
      name: 'Next Automation',
      description: 'Swipe right to go to next automation',
      gesture: 'swipe',
      config: { direction: 'right', threshold: this.config.threshold },
      action: async event => {
        if (event.direction === 'right') {
          window.dispatchEvent(
            new CustomEvent('gestureAutomationCommand', {
              detail: { command: 'nextAutomation', gesture: event },
            })
          )
        }
      },
      enabled: true,
      automationTarget: 'navigation',
    })

    // Long press - Context menu
    this.registerGesture({
      id: 'long-press-context',
      name: 'Context Menu',
      description: 'Long press to show context menu',
      gesture: 'longpress',
      config: { duration: 800 },
      action: async event => {
        window.dispatchEvent(
          new CustomEvent('gestureAutomationCommand', {
            detail: { command: 'showContextMenu', gesture: event },
          })
        )
      },
      enabled: true,
      automationTarget: 'context',
    })

    // Double tap - Quick action
    this.registerGesture({
      id: 'double-tap-quick',
      name: 'Quick Action',
      description: 'Double tap for quick automation action',
      gesture: 'doubletap',
      config: { timeout: 300 },
      action: async event => {
        window.dispatchEvent(
          new CustomEvent('gestureAutomationCommand', {
            detail: { command: 'quickAction', gesture: event },
          })
        )
      },
      enabled: true,
      automationTarget: 'quick',
    })

    // Pinch in - Zoom out automation view
    this.registerGesture({
      id: 'pinch-in-zoom-out',
      name: 'Zoom Out',
      description: 'Pinch in to zoom out automation view',
      gesture: 'pinch',
      config: { scale: 0.8 },
      action: async event => {
        if (event.scale && event.scale < 1) {
          window.dispatchEvent(
            new CustomEvent('gestureAutomationCommand', {
              detail: { command: 'zoomOut', gesture: event },
            })
          )
        }
      },
      enabled: true,
      automationTarget: 'zoom',
    })

    // Pinch out - Zoom in automation view
    this.registerGesture({
      id: 'pinch-out-zoom-in',
      name: 'Zoom In',
      description: 'Pinch out to zoom in automation view',
      gesture: 'pinch',
      config: { scale: 1.2 },
      action: async event => {
        if (event.scale && event.scale > 1) {
          window.dispatchEvent(
            new CustomEvent('gestureAutomationCommand', {
              detail: { command: 'zoomIn', gesture: event },
            })
          )
        }
      },
      enabled: true,
      automationTarget: 'zoom',
    })

    // Multi-touch - Multi-select automation
    this.registerGesture({
      id: 'multi-touch-select',
      name: 'Multi Select',
      description: 'Multi-touch to select multiple automations',
      gesture: 'multitouch',
      config: { touches: 2 },
      action: async event => {
        if (event.touches && event.touches >= 2) {
          window.dispatchEvent(
            new CustomEvent('gestureAutomationCommand', {
              detail: { command: 'multiSelect', gesture: event },
            })
          )
        }
      },
      enabled: true,
      automationTarget: 'selection',
    })

    console.log('👆 Default automation gestures registered')
  }

  private setupAnalyticsTracking(): void {
    // Track gesture usage patterns
    setInterval(() => {
      this.analyzeGesturePatterns()
    }, 30000) // Every 30 seconds

    console.log('👆 Analytics tracking setup complete')
  }

  private handleTouchStart(event: TouchEvent): void {
    event.preventDefault()

    this.touchStartTime = Date.now()
    this.touchCount = event.touches.length

    if (event.touches.length === 1) {
      const touch = event.touches[0]
      this.touchStartPosition = { x: touch.clientX, y: touch.clientY }
    }

    // Track active touches
    for (let i = 0; i < event.touches.length; i++) {
      const touch = event.touches[i]
      this.activeTouches.set(touch.identifier, touch)
    }

    // Check for long press
    if (this.config.enableLongPress) {
      setTimeout(() => {
        if (this.touchCount === 1 && Date.now() - this.touchStartTime >= 800) {
          this.triggerLongPress(event)
        }
      }, 800)
    }
  }

  private handleTouchMove(event: TouchEvent): void {
    event.preventDefault()

    if (event.touches.length === 1) {
      const touch = event.touches[0]
      const deltaX = touch.clientX - this.touchStartPosition.x
      const deltaY = touch.clientY - this.touchStartPosition.y

      // Check for swipe gesture
      if (this.config.enableSwipeGestures) {
        if (
          Math.abs(deltaX) > this.config.threshold ||
          Math.abs(deltaY) > this.config.threshold
        ) {
          this.triggerSwipe(event, deltaX, deltaY)
        }
      }
    } else if (event.touches.length === 2) {
      // Check for pinch gesture
      if (this.config.enablePinchGestures) {
        this.triggerPinch(event)
      }
    }
  }

  private handleTouchEnd(event: TouchEvent): void {
    event.preventDefault()

    const touchDuration = Date.now() - this.touchStartTime

    // Check for double tap
    if (this.config.enableDoubleTap && touchDuration < 300) {
      const timeSinceLastTouch = Date.now() - this.lastTouchTime
      if (timeSinceLastTouch < 300) {
        this.triggerDoubleTap(event)
      }
      this.lastTouchTime = Date.now()
    }

    // Check for multi-touch
    if (this.config.enableMultiTouch && this.touchCount >= 2) {
      this.triggerMultiTouch(event)
    }

    // Clear active touches
    this.activeTouches.clear()
    this.touchCount = 0
  }

  private handleTouchCancel(event: TouchEvent): void {
    event.preventDefault()
    this.activeTouches.clear()
    this.touchCount = 0
  }

  private handleMouseDown(event: MouseEvent): void {
    this.touchStartTime = Date.now()
    this.touchStartPosition = { x: event.clientX, y: event.clientY }
  }

  private handleMouseMove(event: MouseEvent): void {
    // Handle mouse drag as swipe
    if (event.buttons === 1) {
      // Left button pressed
      const deltaX = event.clientX - this.touchStartPosition.x
      const deltaY = event.clientY - this.touchStartPosition.y

      if (
        Math.abs(deltaX) > this.config.threshold ||
        Math.abs(deltaY) > this.config.threshold
      ) {
        this.triggerSwipe(event, deltaX, deltaY)
      }
    }
  }

  private handleMouseUp(event: MouseEvent): void {
    const touchDuration = Date.now() - this.touchStartTime

    // Check for double click
    if (touchDuration < 300) {
      const timeSinceLastTouch = Date.now() - this.lastTouchTime
      if (timeSinceLastTouch < 300) {
        this.triggerDoubleTap(event)
      }
      this.lastTouchTime = Date.now()
    }
  }

  private triggerSwipe(event: Event, deltaX: number, deltaY: number): void {
    let direction: 'up' | 'down' | 'left' | 'right'

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      direction = deltaX > 0 ? 'right' : 'left'
    } else {
      direction = deltaY > 0 ? 'down' : 'up'
    }

    const gestureEvent: GestureEvent = {
      type: 'swipe',
      direction,
      timestamp: new Date(),
      element: event.target as HTMLElement,
    }

    this.executeGestureByType('swipe', gestureEvent)
  }

  private triggerPinch(event: TouchEvent): void {
    if (event.touches.length !== 2) return

    const touch1 = event.touches[0]
    const touch2 = event.touches[1]

    const distance = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
    )

    // Calculate scale based on initial distance
    const initialDistance = 100 // Mock initial distance
    const scale = distance / initialDistance

    const gestureEvent: GestureEvent = {
      type: 'pinch',
      scale,
      timestamp: new Date(),
      element: event.target as HTMLElement,
    }

    this.executeGestureByType('pinch', gestureEvent)
  }

  private triggerLongPress(event: TouchEvent): void {
    const gestureEvent: GestureEvent = {
      type: 'longpress',
      duration: Date.now() - this.touchStartTime,
      timestamp: new Date(),
      element: event.target as HTMLElement,
    }

    this.executeGestureByType('longpress', gestureEvent)
  }

  private triggerDoubleTap(event: Event): void {
    const gestureEvent: GestureEvent = {
      type: 'doubletap',
      timestamp: new Date(),
      element: event.target as HTMLElement,
    }

    this.executeGestureByType('doubletap', gestureEvent)
  }

  private triggerMultiTouch(event: TouchEvent): void {
    const gestureEvent: GestureEvent = {
      type: 'multitouch',
      touches: this.touchCount,
      timestamp: new Date(),
      element: event.target as HTMLElement,
    }

    this.executeGestureByType('multitouch', gestureEvent)
  }

  private executeGestureByType(
    type: GestureEvent['type'],
    event: GestureEvent
  ): void {
    const gestures = Array.from(this.gestures.values()).filter(
      g => g.gesture === type && g.enabled
    )

    gestures.forEach(gesture => {
      this.executeGesture(gesture.id, event)
    })
  }

  private updateAnalytics(
    gestureType: string,
    success: boolean,
    responseTime: number
  ): void {
    this.analytics.totalGestures++
    this.analytics.gestureTypes[gestureType] =
      (this.analytics.gestureTypes[gestureType] || 0) + 1

    // Update success rate
    const totalSuccessful = Object.values(this.analytics.gestureTypes).reduce(
      (sum, count) => sum + count,
      0
    )
    this.analytics.successRate =
      (totalSuccessful / this.analytics.totalGestures) * 100

    // Update average response time
    this.analytics.averageResponseTime =
      (this.analytics.averageResponseTime + responseTime) / 2
  }

  private analyzeGesturePatterns(): void {
    // Analyze user gesture patterns and preferences
    const mostUsedGesture = Object.entries(this.analytics.gestureTypes).sort(
      ([, a], [, b]) => b - a
    )[0]

    if (mostUsedGesture) {
      this.analytics.userPreferences.mostUsedGesture = mostUsedGesture[0]
    }

    // Update gesture sensitivity based on usage
    if (this.analytics.successRate < 80) {
      this.config.sensitivity = Math.min(1, this.config.sensitivity + 0.1)
    } else if (this.analytics.successRate > 95) {
      this.config.sensitivity = Math.max(0.1, this.config.sensitivity - 0.05)
    }
  }

  /**
   * Stop advanced gesture controller
   */
  public async stop(): Promise<void> {
    // Remove event listeners
    document.removeEventListener('touchstart', this.handleTouchStart)
    document.removeEventListener('touchmove', this.handleTouchMove)
    document.removeEventListener('touchend', this.handleTouchEnd)
    document.removeEventListener('touchcancel', this.handleTouchCancel)
    document.removeEventListener('mousedown', this.handleMouseDown)
    document.removeEventListener('mousemove', this.handleMouseMove)
    document.removeEventListener('mouseup', this.handleMouseUp)

    this.gestures.clear()
    this.isInitialized = false
    console.log('👆 Advanced Gesture Controller stopped')
  }
}

// Export singleton instance
export const advancedGestureController = new AdvancedGestureController()

export default advancedGestureController
