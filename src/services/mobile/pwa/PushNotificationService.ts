/**
 * Advanced Push Notification Service - B.10.4 Advanced Mobile & PWA
 * Handles push notifications, subscription management, and notification campaigns
 */

interface NotificationPermission {
  granted: boolean
  denied: boolean
  default: boolean
}

interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

interface NotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  data?: any
  actions?: NotificationAction[]
  requireInteraction?: boolean
  silent?: boolean
  tag?: string
  renotify?: boolean
}

interface NotificationAction {
  action: string
  title: string
  icon?: string
}

interface NotificationSettings {
  temperatureAlerts: boolean
  taskReminders: boolean
  complianceAlerts: boolean
  maintenanceReminders: boolean
  systemUpdates: boolean
  soundEnabled: boolean
  vibrationEnabled: boolean
}

export class PushNotificationService {
  private registration: ServiceWorkerRegistration | null = null
  private subscription: PushSubscription | null = null
  private settings: NotificationSettings = {
    temperatureAlerts: true,
    taskReminders: true,
    complianceAlerts: true,
    maintenanceReminders: true,
    systemUpdates: false,
    soundEnabled: true,
    vibrationEnabled: true,
  }

  /**
   * Initialize push notification service
   */
  public async initialize(): Promise<void> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('⚠️ Push notifications not supported')
      return
    }

    try {
      // Get service worker registration
      this.registration = await navigator.serviceWorker.ready

      // Load user settings
      await this.loadSettings()

      // Check existing subscription
      this.subscription = await this.registration.pushManager.getSubscription()

      console.log('🔔 Push notification service initialized')
    } catch (error) {
      console.error('❌ Failed to initialize push notifications:', error)
    }
  }

  /**
   * Request notification permission
   */
  public async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported')
    }

    let permission = Notification.permission

    if (permission === 'default') {
      permission = await Notification.requestPermission()
    }

    return {
      granted: permission === 'granted',
      denied: permission === 'denied',
      default: permission === 'default',
    }
  }

  /**
   * Subscribe to push notifications
   */
  public async subscribe(): Promise<PushSubscription> {
    if (!this.registration) {
      throw new Error('Service worker not ready')
    }

    // Check permission
    const permission = await this.requestPermission()
    if (!permission.granted) {
      throw new Error('Notification permission denied')
    }

    try {
      // Create push subscription
      this.subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          process.env.VITE_VAPID_PUBLIC_KEY || ''
        ),
      })

      // Send subscription to server
      await this.sendSubscriptionToServer(this.subscription)

      console.log('🔔 Push notification subscription created')
      return this.subscription
    } catch (error) {
      console.error('❌ Failed to subscribe to push notifications:', error)
      throw error
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  public async unsubscribe(): Promise<boolean> {
    if (!this.subscription) {
      return false
    }

    try {
      const result = await this.subscription.unsubscribe()
      if (result) {
        await this.removeSubscriptionFromServer(this.subscription)
        this.subscription = null
        console.log('🔔 Push notification subscription removed')
      }
      return result
    } catch (error) {
      console.error('❌ Failed to unsubscribe from push notifications:', error)
      return false
    }
  }

  /**
   * Send local notification
   */
  public async sendNotification(payload: NotificationPayload): Promise<void> {
    if (!this.registration) {
      throw new Error('Service worker not ready')
    }

    // Check if user has granted permission
    if (Notification.permission !== 'granted') {
      throw new Error('Notification permission not granted')
    }

    // Apply user settings
    const notificationOptions: NotificationInit = {
      body: payload.body,
      icon: payload.icon || '/icons/icon-192x192.png',
      badge: payload.badge || '/icons/badge-72x72.png',
      data: payload.data,
      actions: payload.actions,
      requireInteraction: payload.requireInteraction,
      silent: payload.silent || !this.settings.soundEnabled,
      tag: payload.tag,
      renotify: payload.renotify,
    }

    // Add vibration if enabled and supported
    if (this.settings.vibrationEnabled && 'vibrate' in navigator) {
      notificationOptions.vibrate = [200, 100, 200]
    }

    await this.registration.showNotification(payload.title, notificationOptions)
  }

  /**
   * Send HACCP-specific notifications
   */
  public async sendTemperatureAlert(
    pointName: string,
    temperature: number,
    threshold: number
  ): Promise<void> {
    if (!this.settings.temperatureAlerts) return

    await this.sendNotification({
      title: '🌡️ Temperature Alert',
      body: `${pointName}: ${temperature}°C (Threshold: ${threshold}°C)`,
      tag: `temp-${pointName}`,
      requireInteraction: true,
      data: {
        type: 'temperature_alert',
        pointName,
        temperature,
        threshold,
      },
      actions: [
        {
          action: 'view',
          title: 'View Details',
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
        },
      ],
    })
  }

  /**
   * Send task reminder notification
   */
  public async sendTaskReminder(
    taskTitle: string,
    dueDate: Date,
    assignedTo: string
  ): Promise<void> {
    if (!this.settings.taskReminders) return

    const timeUntilDue = Math.ceil(
      (dueDate.getTime() - Date.now()) / (1000 * 60)
    )

    await this.sendNotification({
      title: '📋 Task Reminder',
      body: `${taskTitle} (${assignedTo}) - Due in ${timeUntilDue} minutes`,
      tag: `task-${taskTitle}`,
      requireInteraction: false,
      data: {
        type: 'task_reminder',
        taskTitle,
        dueDate: dueDate.toISOString(),
        assignedTo,
      },
      actions: [
        {
          action: 'complete',
          title: 'Mark Complete',
        },
        {
          action: 'view',
          title: 'View Task',
        },
      ],
    })
  }

  /**
   * Send compliance alert
   */
  public async sendComplianceAlert(
    alertType: string,
    message: string,
    severity: 'low' | 'medium' | 'high' | 'critical'
  ): Promise<void> {
    if (!this.settings.complianceAlerts) return

    const icons = {
      low: '🟢',
      medium: '🟡',
      high: '🟠',
      critical: '🔴',
    }

    await this.sendNotification({
      title: `${icons[severity]} Compliance Alert`,
      body: `${alertType}: ${message}`,
      tag: `compliance-${alertType}`,
      requireInteraction: severity === 'critical' || severity === 'high',
      data: {
        type: 'compliance_alert',
        alertType,
        message,
        severity,
      },
      actions: [
        {
          action: 'view',
          title: 'View Details',
        },
        {
          action: 'resolve',
          title: 'Resolve',
        },
      ],
    })
  }

  /**
   * Send maintenance reminder
   */
  public async sendMaintenanceReminder(
    equipmentName: string,
    maintenanceType: string,
    dueDate: Date
  ): Promise<void> {
    if (!this.settings.maintenanceReminders) return

    const daysUntilDue = Math.ceil(
      (dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )

    await this.sendNotification({
      title: '🔧 Maintenance Reminder',
      body: `${equipmentName} - ${maintenanceType} due in ${daysUntilDue} days`,
      tag: `maintenance-${equipmentName}`,
      requireInteraction: daysUntilDue <= 1,
      data: {
        type: 'maintenance_reminder',
        equipmentName,
        maintenanceType,
        dueDate: dueDate.toISOString(),
      },
      actions: [
        {
          action: 'schedule',
          title: 'Schedule',
        },
        {
          action: 'view',
          title: 'View Details',
        },
      ],
    })
  }

  /**
   * Update notification settings
   */
  public async updateSettings(
    newSettings: Partial<NotificationSettings>
  ): Promise<void> {
    this.settings = { ...this.settings, ...newSettings }
    await this.saveSettings()
  }

  /**
   * Get current settings
   */
  public getSettings(): NotificationSettings {
    return { ...this.settings }
  }

  /**
   * Get subscription status
   */
  public getSubscriptionStatus(): {
    subscribed: boolean
    endpoint?: string
    permission: string
  } {
    return {
      subscribed: !!this.subscription,
      endpoint: this.subscription?.endpoint,
      permission: Notification.permission,
    }
  }

  /**
   * Schedule recurring notifications
   */
  public async scheduleRecurringNotification(
    title: string,
    body: string,
    intervalMinutes: number,
    tag: string
  ): Promise<void> {
    // Clear existing scheduled notification
    await this.clearScheduledNotification(tag)

    // Schedule new notification
    const intervalMs = intervalMinutes * 60 * 1000
    const nextNotification = new Date(Date.now() + intervalMs)

    await this.sendNotification({
      title,
      body,
      tag,
      data: {
        type: 'recurring',
        intervalMinutes,
        nextNotification: nextNotification.toISOString(),
      },
    })

    // Schedule next notification
    setTimeout(() => {
      this.scheduleRecurringNotification(title, body, intervalMinutes, tag)
    }, intervalMs)
  }

  /**
   * Clear scheduled notification
   */
  public async clearScheduledNotification(tag: string): Promise<void> {
    if (!this.registration) return

    const notifications = await this.registration.getNotifications({ tag })
    notifications.forEach(notification => notification.close())
  }

  /**
   * Clear all notifications
   */
  public async clearAllNotifications(): Promise<void> {
    if (!this.registration) return

    const notifications = await this.registration.getNotifications()
    notifications.forEach(notification => notification.close())
  }

  /**
   * Send subscription to server
   */
  private async sendSubscriptionToServer(
    subscription: PushSubscription
  ): Promise<void> {
    try {
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      })

      if (!response.ok) {
        throw new Error('Failed to send subscription to server')
      }
    } catch (error) {
      console.error('❌ Failed to send subscription to server:', error)
      throw error
    }
  }

  /**
   * Remove subscription from server
   */
  private async removeSubscriptionFromServer(
    subscription: PushSubscription
  ): Promise<void> {
    try {
      const response = await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      })

      if (!response.ok) {
        throw new Error('Failed to remove subscription from server')
      }
    } catch (error) {
      console.error('❌ Failed to remove subscription from server:', error)
    }
  }

  /**
   * Load settings from localStorage
   */
  private async loadSettings(): Promise<void> {
    try {
      const saved = localStorage.getItem('notification-settings')
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) }
      }
    } catch (error) {
      console.warn('⚠️ Failed to load notification settings:', error)
    }
  }

  /**
   * Save settings to localStorage
   */
  private async saveSettings(): Promise<void> {
    try {
      localStorage.setItem(
        'notification-settings',
        JSON.stringify(this.settings)
      )
    } catch (error) {
      console.warn('⚠️ Failed to save notification settings:', error)
    }
  }

  /**
   * Convert VAPID key to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }
}

// Export singleton
export const pushNotificationService = new PushNotificationService()

export default pushNotificationService
