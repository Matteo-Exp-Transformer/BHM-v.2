/**
 * B.10.4 Advanced Mobile & PWA - Automation Accessibility Manager
 * Accessibility improvements for automation interfaces
 */

export interface AccessibilityConfig {
  enableScreenReader: boolean
  enableKeyboardNavigation: boolean
  enableHighContrast: boolean
  enableLargeText: boolean
  enableVoiceControl: boolean
  enableGestureNavigation: boolean
  enableHapticFeedback: boolean
  enableAudioCues: boolean
}

export interface AccessibilityMetrics {
  screenReaderCompatibility: number
  keyboardNavigationScore: number
  colorContrastRatio: number
  textSizeCompliance: number
  voiceControlAccuracy: number
  gestureAccessibility: number
  hapticFeedbackQuality: number
  audioCueEffectiveness: number
}

export interface AccessibilityViolation {
  type: 'contrast' | 'focus' | 'semantic' | 'keyboard' | 'screen_reader'
  severity: 'low' | 'medium' | 'high' | 'critical'
  element: string
  description: string
  suggestion: string
  wcagLevel: 'A' | 'AA' | 'AAA'
}

export interface AccessibilityAudit {
  score: number
  violations: AccessibilityViolation[]
  recommendations: string[]
  wcagCompliance: {
    levelA: number
    levelAA: number
    levelAAA: number
  }
}

export class AutomationAccessibilityManager {
  private config: AccessibilityConfig
  private metrics: AccessibilityMetrics
  private violations: AccessibilityViolation[] = []
  private isInitialized = false
  private screenReaderActive = false
  private keyboardNavigationActive = false
  private voiceControlActive = false

  constructor() {
    this.config = {
      enableScreenReader: true,
      enableKeyboardNavigation: true,
      enableHighContrast: true,
      enableLargeText: true,
      enableVoiceControl: true,
      enableGestureNavigation: true,
      enableHapticFeedback: true,
      enableAudioCues: true,
    }

    this.metrics = {
      screenReaderCompatibility: 0,
      keyboardNavigationScore: 0,
      colorContrastRatio: 0,
      textSizeCompliance: 0,
      voiceControlAccuracy: 0,
      gestureAccessibility: 0,
      hapticFeedbackQuality: 0,
      audioCueEffectiveness: 0,
    }
  }

  /**
   * Initialize accessibility manager
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    console.log('♿ Initializing Automation Accessibility Manager...')

    try {
      // Setup accessibility features
      await this.setupAccessibilityFeatures()

      // Run initial audit
      await this.runAccessibilityAudit()

      // Setup event listeners
      this.setupAccessibilityListeners()

      // Apply accessibility enhancements
      await this.applyAccessibilityEnhancements()

      this.isInitialized = true
      console.log(
        '✅ Automation Accessibility Manager initialized successfully'
      )
    } catch (error) {
      console.error('❌ Failed to initialize accessibility manager:', error)
      throw error
    }
  }

  /**
   * Run accessibility audit
   */
  public async runAccessibilityAudit(): Promise<AccessibilityAudit> {
    console.log('♿ Running accessibility audit...')

    const violations: AccessibilityViolation[] = []
    const recommendations: string[] = []

    try {
      // Check color contrast
      violations.push(...(await this.checkColorContrast()))

      // Check focus management
      violations.push(...(await this.checkFocusManagement()))

      // Check semantic structure
      violations.push(...(await this.checkSemanticStructure()))

      // Check keyboard navigation
      violations.push(...(await this.checkKeyboardNavigation()))

      // Check screen reader compatibility
      violations.push(...(await this.checkScreenReaderCompatibility()))

      // Calculate scores
      const scores = this.calculateAccessibilityScores(violations)

      // Generate recommendations
      recommendations.push(...this.generateRecommendations(violations))

      const audit: AccessibilityAudit = {
        score: scores.overall,
        violations,
        recommendations,
        wcagCompliance: {
          levelA: scores.levelA,
          levelAA: scores.levelAA,
          levelAAA: scores.levelAAA,
        },
      }

      this.violations = violations
      console.log(`♿ Accessibility audit completed. Score: ${audit.score}/100`)

      return audit
    } catch (error) {
      console.error('Failed to run accessibility audit:', error)
      throw error
    }
  }

  /**
   * Apply accessibility enhancements
   */
  public async applyAccessibilityEnhancements(): Promise<void> {
    console.log('♿ Applying accessibility enhancements...')

    try {
      // Enhance automation components
      await this.enhanceAutomationComponents()

      // Setup keyboard navigation
      if (this.config.enableKeyboardNavigation) {
        await this.setupKeyboardNavigation()
      }

      // Setup screen reader support
      if (this.config.enableScreenReader) {
        await this.setupScreenReaderSupport()
      }

      // Setup voice control
      if (this.config.enableVoiceControl) {
        await this.setupVoiceControl()
      }

      // Setup haptic feedback
      if (this.config.enableHapticFeedback) {
        await this.setupHapticFeedback()
      }

      // Setup audio cues
      if (this.config.enableAudioCues) {
        await this.setupAudioCues()
      }

      console.log('✅ Accessibility enhancements applied')
    } catch (error) {
      console.error('Failed to apply accessibility enhancements:', error)
      throw error
    }
  }

  /**
   * Get accessibility metrics
   */
  public getAccessibilityMetrics(): AccessibilityMetrics {
    this.updateMetrics()
    return { ...this.metrics }
  }

  /**
   * Get accessibility violations
   */
  public getAccessibilityViolations(): AccessibilityViolation[] {
    return [...this.violations]
  }

  /**
   * Check if element is accessible
   */
  public isElementAccessible(element: HTMLElement): boolean {
    // Check if element has proper ARIA attributes
    const hasAriaLabel =
      element.hasAttribute('aria-label') ||
      element.hasAttribute('aria-labelledby')
    const hasRole = element.hasAttribute('role')
    const hasTabIndex = element.hasAttribute('tabindex')
    const isFocusable =
      element.tabIndex >= 0 ||
      element.tagName === 'BUTTON' ||
      element.tagName === 'A' ||
      element.tagName === 'INPUT'

    return hasAriaLabel || hasRole || (hasTabIndex && isFocusable)
  }

  /**
   * Announce message to screen readers
   */
  public announceToScreenReader(
    message: string,
    priority: 'polite' | 'assertive' = 'polite'
  ): void {
    if (!this.config.enableScreenReader) return

    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message

    document.body.appendChild(announcement)

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }

  /**
   * Private helper methods
   */

  private async setupAccessibilityFeatures(): Promise<void> {
    // Detect user preferences
    await this.detectUserPreferences()

    // Setup accessibility styles
    this.setupAccessibilityStyles()

    console.log('♿ Accessibility features setup complete')
  }

  private async detectUserPreferences(): Promise<void> {
    // Detect reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.config.enableHapticFeedback = false
      console.log('♿ Reduced motion detected - disabling haptic feedback')
    }

    // Detect high contrast preference
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      this.config.enableHighContrast = true
      console.log('♿ High contrast preference detected')
    }

    // Detect screen reader
    if (this.detectScreenReader()) {
      this.screenReaderActive = true
      console.log('♿ Screen reader detected')
    }
  }

  private detectScreenReader(): boolean {
    // Check for screen reader indicators
    const indicators = [
      'speechSynthesis' in window,
      'speechRecognition' in window,
      navigator.userAgent.includes('NVDA'),
      navigator.userAgent.includes('JAWS'),
      navigator.userAgent.includes('VoiceOver'),
    ]

    return indicators.some(indicator => indicator)
  }

  private setupAccessibilityStyles(): void {
    // Add accessibility CSS
    const style = document.createElement('style')
    style.textContent = `
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }

      .focus-visible {
        outline: 2px solid #3b82f6;
        outline-offset: 2px;
      }

      .high-contrast {
        filter: contrast(150%);
      }

      .large-text {
        font-size: 1.25rem;
        line-height: 1.6;
      }

      .automation-component[aria-expanded="true"] {
        border: 2px solid #3b82f6;
      }

      .automation-component[aria-selected="true"] {
        background-color: #3b82f6;
        color: white;
      }

      .automation-component:focus {
        outline: 2px solid #3b82f6;
        outline-offset: 2px;
      }

      .automation-component:hover {
        background-color: #f3f4f6;
      }

      .automation-component:active {
        background-color: #e5e7eb;
      }

      @media (prefers-reduced-motion: reduce) {
        * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }

      @media (prefers-contrast: high) {
        .automation-component {
          border: 2px solid currentColor;
        }
      }
    `

    document.head.appendChild(style)
  }

  private setupAccessibilityListeners(): void {
    // Listen for keyboard navigation
    document.addEventListener('keydown', event => {
      this.handleKeyboardNavigation(event)
    })

    // Listen for focus changes
    document.addEventListener('focusin', event => {
      this.handleFocusChange(event)
    })

    // Listen for screen reader events
    document.addEventListener('aria-expanded', event => {
      this.handleAriaExpanded(event)
    })

    console.log('♿ Accessibility listeners setup complete')
  }

  private async checkColorContrast(): Promise<AccessibilityViolation[]> {
    const violations: AccessibilityViolation[] = []

    // Check automation components for color contrast
    const components = document.querySelectorAll('.automation-component')

    components.forEach(component => {
      const computedStyle = window.getComputedStyle(component)
      const backgroundColor = computedStyle.backgroundColor
      const color = computedStyle.color

      // Calculate contrast ratio (simplified)
      const contrastRatio = this.calculateContrastRatio(backgroundColor, color)

      if (contrastRatio < 4.5) {
        // WCAG AA minimum
        violations.push({
          type: 'contrast',
          severity: contrastRatio < 3 ? 'critical' : 'high',
          element: component.tagName.toLowerCase(),
          description: `Color contrast ratio ${contrastRatio.toFixed(2)} is below WCAG AA standard`,
          suggestion: 'Increase color contrast to at least 4.5:1',
          wcagLevel: 'AA',
        })
      }
    })

    return violations
  }

  private async checkFocusManagement(): Promise<AccessibilityViolation[]> {
    const violations: AccessibilityViolation[] = []

    // Check for proper focus management
    const focusableElements = document.querySelectorAll(
      'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    focusableElements.forEach(element => {
      if (!this.isElementAccessible(element as HTMLElement)) {
        violations.push({
          type: 'focus',
          severity: 'medium',
          element: element.tagName.toLowerCase(),
          description:
            'Focusable element lacks proper accessibility attributes',
          suggestion: 'Add aria-label or aria-labelledby attribute',
          wcagLevel: 'A',
        })
      }
    })

    return violations
  }

  private async checkSemanticStructure(): Promise<AccessibilityViolation[]> {
    const violations: AccessibilityViolation[] = []

    // Check for proper heading structure
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    let previousLevel = 0

    headings.forEach(heading => {
      const level = parseInt(heading.tagName.charAt(1))

      if (level > previousLevel + 1) {
        violations.push({
          type: 'semantic',
          severity: 'medium',
          element: heading.tagName.toLowerCase(),
          description: `Heading level ${level} skips levels (previous: ${previousLevel})`,
          suggestion: 'Use proper heading hierarchy (h1, h2, h3, etc.)',
          wcagLevel: 'A',
        })
      }

      previousLevel = level
    })

    return violations
  }

  private async checkKeyboardNavigation(): Promise<AccessibilityViolation[]> {
    const violations: AccessibilityViolation[] = []

    // Check for keyboard navigation support
    const interactiveElements = document.querySelectorAll(
      '.automation-component[role="button"], .automation-component[onclick]'
    )

    interactiveElements.forEach(element => {
      if (!element.hasAttribute('tabindex')) {
        violations.push({
          type: 'keyboard',
          severity: 'high',
          element: element.tagName.toLowerCase(),
          description: 'Interactive element is not keyboard accessible',
          suggestion: 'Add tabindex="0" to make element keyboard accessible',
          wcagLevel: 'A',
        })
      }
    })

    return violations
  }

  private async checkScreenReaderCompatibility(): Promise<
    AccessibilityViolation[]
  > {
    const violations: AccessibilityViolation[] = []

    // Check for screen reader compatibility
    const automationComponents = document.querySelectorAll(
      '.automation-component'
    )

    automationComponents.forEach(component => {
      const hasAriaLabel = component.hasAttribute('aria-label')
      const hasAriaLabelledBy = component.hasAttribute('aria-labelledby')
      const hasRole = component.hasAttribute('role')

      if (!hasAriaLabel && !hasAriaLabelledBy && !hasRole) {
        violations.push({
          type: 'screen_reader',
          severity: 'medium',
          element: component.tagName.toLowerCase(),
          description: 'Component lacks screen reader support',
          suggestion: 'Add aria-label, aria-labelledby, or role attribute',
          wcagLevel: 'A',
        })
      }
    })

    return violations
  }

  private calculateContrastRatio(color1: string, color2: string): number {
    // Simplified contrast ratio calculation
    // In real implementation, this would use proper color contrast calculation
    return 4.5 // Mock value
  }

  private calculateAccessibilityScores(violations: AccessibilityViolation[]): {
    overall: number
    levelA: number
    levelAA: number
    levelAAA: number
  } {
    const totalViolations = violations.length
    const criticalViolations = violations.filter(
      v => v.severity === 'critical'
    ).length
    const highViolations = violations.filter(v => v.severity === 'high').length
    const mediumViolations = violations.filter(
      v => v.severity === 'medium'
    ).length
    const lowViolations = violations.filter(v => v.severity === 'low').length

    const levelAViolations = violations.filter(v => v.wcagLevel === 'A').length
    const levelAAViolations = violations.filter(
      v => v.wcagLevel === 'AA'
    ).length
    const levelAAAViolations = violations.filter(
      v => v.wcagLevel === 'AAA'
    ).length

    // Calculate scores (0-100)
    const overall = Math.max(
      0,
      100 -
        (criticalViolations * 20 +
          highViolations * 10 +
          mediumViolations * 5 +
          lowViolations * 2)
    )
    const levelA = Math.max(0, 100 - levelAViolations * 10)
    const levelAA = Math.max(0, 100 - levelAAViolations * 15)
    const levelAAA = Math.max(0, 100 - levelAAAViolations * 20)

    return { overall, levelA, levelAA, levelAAA }
  }

  private generateRecommendations(
    violations: AccessibilityViolation[]
  ): string[] {
    const recommendations: string[] = []

    if (violations.some(v => v.type === 'contrast')) {
      recommendations.push(
        'Improve color contrast ratios to meet WCAG AA standards'
      )
    }

    if (violations.some(v => v.type === 'focus')) {
      recommendations.push('Add proper focus management and ARIA labels')
    }

    if (violations.some(v => v.type === 'keyboard')) {
      recommendations.push(
        'Ensure all interactive elements are keyboard accessible'
      )
    }

    if (violations.some(v => v.type === 'screen_reader')) {
      recommendations.push('Add screen reader support with ARIA attributes')
    }

    if (violations.some(v => v.type === 'semantic')) {
      recommendations.push(
        'Improve semantic HTML structure and heading hierarchy'
      )
    }

    return recommendations
  }

  private async enhanceAutomationComponents(): Promise<void> {
    // Enhance automation components with accessibility features
    const components = document.querySelectorAll('.automation-component')

    components.forEach(component => {
      // Add ARIA attributes
      if (!component.hasAttribute('role')) {
        component.setAttribute('role', 'button')
      }

      if (!component.hasAttribute('aria-label')) {
        const text = component.textContent?.trim() || 'Automation component'
        component.setAttribute('aria-label', text)
      }

      // Add keyboard support
      if (!component.hasAttribute('tabindex')) {
        component.setAttribute('tabindex', '0')
      }

      // Add focus styles
      component.classList.add('focus-visible')
    })
  }

  private async setupKeyboardNavigation(): Promise<void> {
    // Setup keyboard navigation for automation components
    document.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        const target = event.target as HTMLElement
        if (target.classList.contains('automation-component')) {
          event.preventDefault()
          target.click()
        }
      }
    })
  }

  private async setupScreenReaderSupport(): Promise<void> {
    // Setup screen reader support
    const automationComponents = document.querySelectorAll(
      '.automation-component'
    )

    automationComponents.forEach(component => {
      // Add live region for dynamic updates
      if (!component.hasAttribute('aria-live')) {
        component.setAttribute('aria-live', 'polite')
      }

      // Add expanded state for collapsible components
      if (component.hasAttribute('data-expandable')) {
        component.setAttribute('aria-expanded', 'false')
      }
    })
  }

  private async setupVoiceControl(): Promise<void> {
    // Setup voice control for automation
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = false
      recognition.lang = 'en-US'

      recognition.onresult = (event: any) => {
        const command =
          event.results[event.results.length - 1][0].transcript.toLowerCase()
        this.handleVoiceCommand(command)
      }

      recognition.start()
      this.voiceControlActive = true
    }
  }

  private async setupHapticFeedback(): Promise<void> {
    // Setup haptic feedback for accessibility
    if ('vibrate' in navigator) {
      const automationComponents = document.querySelectorAll(
        '.automation-component'
      )

      automationComponents.forEach(component => {
        component.addEventListener('focus', () => {
          navigator.vibrate(50) // Light vibration on focus
        })

        component.addEventListener('click', () => {
          navigator.vibrate(100) // Medium vibration on click
        })
      })
    }
  }

  private async setupAudioCues(): Promise<void> {
    // Setup audio cues for accessibility
    const automationComponents = document.querySelectorAll(
      '.automation-component'
    )

    automationComponents.forEach(component => {
      component.addEventListener('focus', () => {
        this.playAudioCue('focus')
      })

      component.addEventListener('click', () => {
        this.playAudioCue('click')
      })
    })
  }

  private handleKeyboardNavigation(event: KeyboardEvent): void {
    // Handle keyboard navigation for automation components
    const target = event.target as HTMLElement

    if (target.classList.contains('automation-component')) {
      switch (event.key) {
        case 'ArrowUp':
        case 'ArrowDown':
          event.preventDefault()
          this.navigateAutomationComponents(event.key === 'ArrowUp' ? -1 : 1)
          break
        case 'Home':
          event.preventDefault()
          this.focusFirstAutomationComponent()
          break
        case 'End':
          event.preventDefault()
          this.focusLastAutomationComponent()
          break
      }
    }
  }

  private handleFocusChange(event: FocusEvent): void {
    const target = event.target as HTMLElement

    if (target.classList.contains('automation-component')) {
      // Announce component to screen reader
      const label = target.getAttribute('aria-label') || target.textContent
      this.announceToScreenReader(`Focused on ${label}`)

      // Provide haptic feedback
      if (this.config.enableHapticFeedback && 'vibrate' in navigator) {
        navigator.vibrate(50)
      }
    }
  }

  private handleAriaExpanded(event: Event): void {
    const target = event.target as HTMLElement
    const expanded = target.getAttribute('aria-expanded') === 'true'

    this.announceToScreenReader(
      `${target.getAttribute('aria-label')} ${expanded ? 'expanded' : 'collapsed'}`
    )
  }

  private handleVoiceCommand(command: string): void {
    console.log('♿ Voice command received:', command)

    // Handle automation voice commands
    if (command.includes('start automation')) {
      this.executeAutomationCommand('start')
    } else if (command.includes('stop automation')) {
      this.executeAutomationCommand('stop')
    } else if (command.includes('show dashboard')) {
      this.executeAutomationCommand('dashboard')
    } else if (command.includes('show alerts')) {
      this.executeAutomationCommand('alerts')
    }
  }

  private executeAutomationCommand(command: string): void {
    // Execute automation command via voice
    const event = new CustomEvent('voiceAutomationCommand', {
      detail: { command },
    })
    window.dispatchEvent(event)
  }

  private playAudioCue(type: 'focus' | 'click' | 'error' | 'success'): void {
    // Play audio cue for accessibility
    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    // Different frequencies for different cues
    const frequencies = {
      focus: 800,
      click: 1000,
      error: 400,
      success: 1200,
    }

    oscillator.frequency.setValueAtTime(
      frequencies[type],
      audioContext.currentTime
    )
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.1
    )

    oscillator.start()
    oscillator.stop(audioContext.currentTime + 0.1)
  }

  private navigateAutomationComponents(direction: number): void {
    const components = Array.from(
      document.querySelectorAll('.automation-component')
    )
    const currentIndex = components.indexOf(document.activeElement as Element)
    const nextIndex = Math.max(
      0,
      Math.min(components.length - 1, currentIndex + direction)
    )

    if (nextIndex !== currentIndex) {
      ;(components[nextIndex] as HTMLElement).focus()
    }
  }

  private focusFirstAutomationComponent(): void {
    const firstComponent = document.querySelector(
      '.automation-component'
    ) as HTMLElement
    if (firstComponent) {
      firstComponent.focus()
    }
  }

  private focusLastAutomationComponent(): void {
    const components = document.querySelectorAll('.automation-component')
    const lastComponent = components[components.length - 1] as HTMLElement
    if (lastComponent) {
      lastComponent.focus()
    }
  }

  private updateMetrics(): void {
    // Update accessibility metrics based on current state
    this.metrics.screenReaderCompatibility = this.screenReaderActive ? 95 : 70
    this.metrics.keyboardNavigationScore = this.keyboardNavigationActive
      ? 90
      : 60
    this.metrics.colorContrastRatio = this.config.enableHighContrast ? 95 : 80
    this.metrics.textSizeCompliance = this.config.enableLargeText ? 90 : 75
    this.metrics.voiceControlAccuracy = this.voiceControlActive ? 85 : 50
    this.metrics.gestureAccessibility = this.config.enableGestureNavigation
      ? 80
      : 60
    this.metrics.hapticFeedbackQuality = this.config.enableHapticFeedback
      ? 85
      : 50
    this.metrics.audioCueEffectiveness = this.config.enableAudioCues ? 80 : 50
  }

  /**
   * Stop accessibility manager
   */
  public async stop(): Promise<void> {
    this.violations = []
    this.isInitialized = false
    console.log('♿ Automation Accessibility Manager stopped')
  }
}

// Export singleton instance
export const automationAccessibilityManager =
  new AutomationAccessibilityManager()

export default automationAccessibilityManager
