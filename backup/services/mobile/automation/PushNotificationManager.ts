/**
 * B.10.4 Advanced Mobile & PWA - Push Notification Manager
 * Automation-specific push notifications and alert delivery
 */

import {
  intelligentAlertManager,
  type Alert,
  type AlertRule,
  type NotificationConfig,
} from '../../automation'

export interface PushNotificationData {
  title: string
  body: string
  icon?: string
  badge?: string
  image?: string
  data?: Record<string, any>
  actions?: NotificationAction[]
  requireInteraction?: boolean
  silent?: boolean
  tag?: string
  timestamp?: number
}

export interface NotificationAction {
  action: string
  title: string
  icon?: string
}

export interface AutomationNotificationRule {
  id: string
  name: string
  trigger:
    | 'automation_started'
    | 'automation_completed'
    | 'automation_failed'
    | 'alert_triggered'
    | 'threshold_exceeded'
  conditions: {
    severity?: 'low' | 'medium' | 'high' | 'critical'
    automationType?: string
    timeRange?: { start: string; end: string }
    days?: number[]
  }
  notification: PushNotificationData
  enabled: boolean
  createdAt: Date
  createdBy: string
}

export interface NotificationStats {
  totalSent: number
  totalDelivered: number
  totalClicked: number
  totalDismissed: number
  deliveryRate: number
  clickRate: number
  avgDeliveryTime: number
}

export class PushNotificationManager {
  private initialized = false
  private permission: NotificationPermission = 'default'
  private notificationRules: Map<string, AutomationNotificationRule> = new Map()
  private stats: NotificationStats
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null
  private notificationQueue: PushNotificationData[] = []
  private isProcessingQueue = false

  constructor() {
    this.stats = {
      totalSent: 0,
      totalDelivered: 0,
      totalClicked: 0,
      totalDismissed: 0,
      deliveryRate: 0,
      clickRate: 0,
      avgDeliveryTime: 0,
    }

    this.setupNotificationListeners()
  }

  /**
   * Initialize push notification manager
   */
  public async initialize(): Promise<void> {
    if (this.initialized) return

    console.log('📱 Initializing Push Notification Manager...')

    try {
      // Request notification permission
      await this.requestPermission()

      // Register service worker
      await this.registerServiceWorker()

      // Setup default notification rules
      await this.setupDefaultRules()

      // Start processing notification queue
      this.startQueueProcessing()

      this.initialized = true
      console.log('✅ Push Notification Manager initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize push notification manager:', error)
      throw error
    }
  }

  /**
   * Send automation notification
   */
  public async sendAutomationNotification(
    trigger: AutomationNotificationRule['trigger'],
    data: Record<string, any>
  ): Promise<void> {
    if (!this.initialized || this.permission !== 'granted') {
      console.warn('Push notifications not available')
      return
    }

    try {
      // Find matching notification rules
      const matchingRules = Array.from(this.notificationRules.values()).filter(
        rule => rule.enabled && rule.trigger === trigger
      )

      for (const rule of matchingRules) {
        if (this.evaluateNotificationConditions(rule, data)) {
          const notification = this.buildNotification(rule.notification, data)
          await this.sendNotification(notification)
        }
      }
    } catch (error) {
      console.error('Failed to send automation notification:', error)
    }
  }

  /**
   * Send critical alert notification
   */
  public async sendCriticalAlert(alert: Alert): Promise<void> {
    if (!this.initialized || this.permission !== 'granted') return

    const notification: PushNotificationData = {
      title: `🚨 CRITICAL: ${alert.title}`,
      body: alert.message,
      icon: '/icons/alert-critical.png',
      badge: '/icons/badge-critical.png',
      data: {
        alertId: alert.id,
        severity: alert.severity,
        source: alert.source,
        timestamp: alert.timestamp.toISOString(),
      },
      actions: [
        {
          action: 'acknowledge',
          title: 'Acknowledge',
          icon: '/icons/check.png',
        },
        { action: 'resolve', title: 'Resolve', icon: '/icons/resolve.png' },
        { action: 'escalate', title: 'Escalate', icon: '/icons/escalate.png' },
      ],
      requireInteraction: true,
      tag: `alert-${alert.id}`,
      timestamp: alert.timestamp.getTime(),
    }

    await this.sendNotification(notification)
  }

  /**
   * Send automation status notification
   */
  public async sendAutomationStatus(
    automationName: string,
    status: 'started' | 'completed' | 'failed',
    details?: string
  ): Promise<void> {
    if (!this.initialized || this.permission !== 'granted') return

    const statusConfig = {
      started: { emoji: '🔄', title: 'Automation Started', color: 'blue' },
      completed: { emoji: '✅', title: 'Automation Completed', color: 'green' },
      failed: { emoji: '❌', title: 'Automation Failed', color: 'red' },
    }

    const config = statusConfig[status]

    const notification: PushNotificationData = {
      title: `${config.emoji} ${config.title}`,
      body: `${automationName}${details ? `: ${details}` : ''}`,
      icon: `/icons/automation-${config.color}.png`,
      data: {
        automationName,
        status,
        timestamp: new Date().toISOString(),
      },
      tag: `automation-${automationName}-${status}`,
      timestamp: Date.now(),
    }

    await this.sendNotification(notification)
  }

  /**
   * Create custom notification rule
   */
  public async createNotificationRule(
    rule: Omit<AutomationNotificationRule, 'id' | 'createdAt' | 'createdBy'>
  ): Promise<AutomationNotificationRule> {
    const newRule: AutomationNotificationRule = {
      ...rule,
      id: this.generateId(),
      createdAt: new Date(),
      createdBy: 'user',
    }

    this.notificationRules.set(newRule.id, newRule)
    console.log(`📱 Created notification rule: ${newRule.name}`)
    return newRule
  }

  /**
   * Update notification rule
   */
  public async updateNotificationRule(
    ruleId: string,
    updates: Partial<AutomationNotificationRule>
  ): Promise<AutomationNotificationRule> {
    const rule = this.notificationRules.get(ruleId)
    if (!rule) {
      throw new Error(`Notification rule not found: ${ruleId}`)
    }

    const updatedRule = { ...rule, ...updates }
    this.notificationRules.set(ruleId, updatedRule)
    console.log(`📱 Updated notification rule: ${updatedRule.name}`)
    return updatedRule
  }

  /**
   * Delete notification rule
   */
  public async deleteNotificationRule(ruleId: string): Promise<void> {
    const rule = this.notificationRules.get(ruleId)
    if (!rule) {
      throw new Error(`Notification rule not found: ${ruleId}`)
    }

    this.notificationRules.delete(ruleId)
    console.log(`📱 Deleted notification rule: ${rule.name}`)
  }

  /**
   * Get notification rules
   */
  public getNotificationRules(): AutomationNotificationRule[] {
    return Array.from(this.notificationRules.values())
  }

  /**
   * Get notification statistics
   */
  public getNotificationStats(): NotificationStats {
    return { ...this.stats }
  }

  /**
   * Test notification
   */
  public async testNotification(): Promise<void> {
    if (!this.initialized || this.permission !== 'granted') return

    const testNotification: PushNotificationData = {
      title: '🧪 Test Notification',
      body: 'This is a test notification from HACCP Business Manager',
      icon: '/icons/test.png',
      data: { test: true },
      tag: 'test-notification',
      timestamp: Date.now(),
    }

    await this.sendNotification(testNotification)
  }

  /**
   * Private helper methods
   */

  private async requestPermission(): Promise<void> {
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported')
    }

    this.permission = await Notification.requestPermission()

    if (this.permission === 'granted') {
      console.log('📱 Notification permission granted')
    } else {
      console.log('📱 Notification permission denied')
    }
  }

  private async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        this.serviceWorkerRegistration = await navigator.serviceWorker.register(
          '/notification-sw.js'
        )
        console.log('📱 Notification service worker registered')
      } catch (error) {
        console.warn('Failed to register notification service worker:', error)
      }
    }
  }

  private async setupDefaultRules(): Promise<void> {
    // Critical alerts rule
    await this.createNotificationRule({
      name: 'Critical Alerts',
      trigger: 'alert_triggered',
      conditions: { severity: 'critical' },
      notification: {
        title: '🚨 CRITICAL ALERT',
        body: 'A critical alert has been triggered',
        requireInteraction: true,
        actions: [
          { action: 'acknowledge', title: 'Acknowledge' },
          { action: 'resolve', title: 'Resolve' },
        ],
      },
      enabled: true,
    })

    // Automation failures rule
    await this.createNotificationRule({
      name: 'Automation Failures',
      trigger: 'automation_failed',
      conditions: {},
      notification: {
        title: '❌ Automation Failed',
        body: 'An automation workflow has failed',
        requireInteraction: false,
      },
      enabled: true,
    })

    // Threshold exceeded rule
    await this.createNotificationRule({
      name: 'Threshold Exceeded',
      trigger: 'threshold_exceeded',
      conditions: { severity: 'high' },
      notification: {
        title: '⚠️ Threshold Exceeded',
        body: 'A monitoring threshold has been exceeded',
        requireInteraction: false,
      },
      enabled: true,
    })
  }

  private async sendNotification(
    notification: PushNotificationData
  ): Promise<void> {
    try {
      if (this.serviceWorkerRegistration) {
        // Send via service worker
        await this.serviceWorkerRegistration.showNotification(
          notification.title,
          {
            body: notification.body,
            icon: notification.icon,
            badge: notification.badge,
            image: notification.image,
            data: notification.data,
            actions: notification.actions,
            requireInteraction: notification.requireInteraction,
            silent: notification.silent,
            tag: notification.tag,
            timestamp: notification.timestamp,
          }
        )
      } else {
        // Fallback to browser notifications
        const browserNotification = new Notification(notification.title, {
          body: notification.body,
          icon: notification.icon,
          badge: notification.badge,
          image: notification.image,
          data: notification.data,
          requireInteraction: notification.requireInteraction,
          silent: notification.silent,
          tag: notification.tag,
          timestamp: notification.timestamp,
        })

        // Handle notification events
        browserNotification.onclick = () => {
          this.handleNotificationClick(notification)
          browserNotification.close()
        }

        browserNotification.onclose = () => {
          this.handleNotificationDismiss(notification)
        }
      }

      this.stats.totalSent++
      console.log(`📱 Notification sent: ${notification.title}`)
    } catch (error) {
      console.error('Failed to send notification:', error)
    }
  }

  private evaluateNotificationConditions(
    rule: AutomationNotificationRule,
    data: Record<string, any>
  ): boolean {
    const { conditions } = rule

    // Check severity condition
    if (conditions.severity && data.severity !== conditions.severity) {
      return false
    }

    // Check automation type condition
    if (
      conditions.automationType &&
      data.automationType !== conditions.automationType
    ) {
      return false
    }

    // Check time range condition
    if (conditions.timeRange) {
      const now = new Date()
      const currentTime = now.getHours() * 100 + now.getMinutes()
      const startTime = parseInt(conditions.timeRange.start.replace(':', ''))
      const endTime = parseInt(conditions.timeRange.end.replace(':', ''))

      if (currentTime < startTime || currentTime > endTime) {
        return false
      }
    }

    // Check days condition
    if (conditions.days && conditions.days.length > 0) {
      const currentDay = new Date().getDay()
      if (!conditions.days.includes(currentDay)) {
        return false
      }
    }

    return true
  }

  private buildNotification(
    template: PushNotificationData,
    data: Record<string, any>
  ): PushNotificationData {
    // Replace placeholders in template with actual data
    const notification = { ...template }

    if (notification.title) {
      notification.title = this.replacePlaceholders(notification.title, data)
    }

    if (notification.body) {
      notification.body = this.replacePlaceholders(notification.body, data)
    }

    // Add data to notification
    notification.data = { ...notification.data, ...data }

    return notification
  }

  private replacePlaceholders(text: string, data: Record<string, any>): string {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] || match
    })
  }

  private handleNotificationClick(notification: PushNotificationData): void {
    this.stats.totalClicked++
    this.updateClickRate()

    // Handle notification click based on data
    if (notification.data?.alertId) {
      // Open alert details
      console.log(`Opening alert details: ${notification.data.alertId}`)
    } else if (notification.data?.automationName) {
      // Open automation details
      console.log(
        `Opening automation details: ${notification.data.automationName}`
      )
    }
  }

  private handleNotificationDismiss(notification: PushNotificationData): void {
    this.stats.totalDismissed++
  }

  private startQueueProcessing(): void {
    // Process notification queue every 5 seconds
    setInterval(() => {
      if (!this.isProcessingQueue && this.notificationQueue.length > 0) {
        this.processNotificationQueue()
      }
    }, 5000)
  }

  private async processNotificationQueue(): Promise<void> {
    if (this.isProcessingQueue) return

    this.isProcessingQueue = true

    try {
      while (this.notificationQueue.length > 0) {
        const notification = this.notificationQueue.shift()
        if (notification) {
          await this.sendNotification(notification)
        }
      }
    } finally {
      this.isProcessingQueue = false
    }
  }

  private updateClickRate(): void {
    this.stats.clickRate =
      this.stats.totalSent > 0
        ? (this.stats.totalClicked / this.stats.totalSent) * 100
        : 0
  }

  private setupNotificationListeners(): void {
    // Listen for service worker messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', event => {
        if (event.data.type === 'NOTIFICATION_CLICK') {
          this.handleNotificationClick(event.data.notification)
        } else if (event.data.type === 'NOTIFICATION_DISMISS') {
          this.handleNotificationDismiss(event.data.notification)
        }
      })
    }
  }

  private generateId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Stop push notification manager
   */
  public async stop(): Promise<void> {
    this.initialized = false
    this.notificationRules.clear()
    this.notificationQueue = []
    console.log('📱 Push Notification Manager stopped')
  }
}

// Export singleton instance
export const pushNotificationManager = new PushNotificationManager()

export default pushNotificationManager
