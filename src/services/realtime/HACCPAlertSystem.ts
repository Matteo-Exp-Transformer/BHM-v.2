/**
 * HACCP Alert System - Real-time Compliance Monitoring
 * Handles real-time alerts for HACCP compliance violations and critical events
 */

import { toast } from 'react-toastify'
import { realtimeManager } from './RealtimeConnectionManager'
import { temperatureMonitor, type TemperatureAlert } from './TemperatureMonitor'

export interface HACCPAlert {
  id: string
  type:
    | 'temperature_violation'
    | 'maintenance_overdue'
    | 'expiry_warning'
    | 'certification_expiry'
    | 'audit_required'
    | 'system_error'
  severity: 'info' | 'warning' | 'critical' | 'emergency'
  title: string
  message: string
  source: {
    table: string
    id: string
    name?: string
  }
  timestamp: Date
  company_id: string
  affected_users: string[]
  auto_dismiss?: boolean
  dismiss_timeout?: number
  actions?: HACCPAlertAction[]
  metadata?: Record<string, unknown>
  acknowledged: boolean
  acknowledged_by?: string
  acknowledged_at?: Date
  escalated: boolean
  escalated_at?: Date
}

export interface HACCPAlertAction {
  id: string
  label: string
  type: 'primary' | 'secondary' | 'danger'
  action: () => void | Promise<void>
  confirm?: boolean
  confirmMessage?: string
}

export interface AlertSubscription {
  id: string
  userId: string
  alertTypes: HACCPAlert['type'][]
  severityFilter: HACCPAlert['severity'][]
  channels: ('browser' | 'email' | 'sms')[]
  active: boolean
}

export interface AlertingConfig {
  escalation_rules: {
    [key in HACCPAlert['type']]: {
      escalate_after: number // minutes
      escalate_to: string[] // user IDs or roles
    }
  }
  notification_settings: {
    browser_notifications: boolean
    sound_alerts: boolean
    persistent_critical: boolean
    group_similar: boolean
    rate_limiting: {
      max_per_minute: number
      max_per_hour: number
    }
  }
  compliance_thresholds: {
    temperature_tolerance: number
    maintenance_grace_period: number
    expiry_warning_days: number
    certification_warning_days: number
  }
}

class HACCPAlertSystem {
  private alerts: Map<string, HACCPAlert> = new Map()
  private subscriptions: Map<string, AlertSubscription> = new Map()
  private alertCallbacks: ((alert: HACCPAlert) => void)[] = []
  private config: AlertingConfig
  private soundEnabled = true
  private permissionGranted = false

  // Real-time subscriptions
  private temperatureSubscriptionId?: string
  private maintenanceSubscriptionId?: string
  private productSubscriptionId?: string

  constructor() {
    this.config = this.getDefaultConfig()
    this.requestNotificationPermission()
    this.setupTemperatureMonitoring()
  }

  /**
   * Initialize alert system for a company
   */
  public async initialize(companyId: string): Promise<void> {
    // Subscribe to maintenance task updates
    this.maintenanceSubscriptionId = realtimeManager.subscribe({
      table: 'maintenance_tasks',
      event: '*',
      callback: payload => this.handleMaintenanceUpdate(payload),
      filter: `company_id=eq.${companyId}`,
    })

    // Subscribe to product updates (expiry tracking)
    this.productSubscriptionId = realtimeManager.subscribe({
      table: 'products',
      event: '*',
      callback: payload => this.handleProductUpdate(payload),
      filter: `company_id=eq.${companyId}`,
    })

    console.log('🚨 HACCP Alert System initialized')
  }

  /**
   * Setup temperature monitoring integration
   */
  private setupTemperatureMonitoring(): void {
    temperatureMonitor.onAlert((tempAlert: TemperatureAlert) => {
      this.createAlert({
        type: 'temperature_violation',
        severity:
          tempAlert.severity === 'emergency'
            ? 'emergency'
            : tempAlert.severity === 'critical'
              ? 'critical'
              : 'warning',
        title: `Temperature Violation - ${tempAlert.conservation_point_name}`,
        message: `Temperature ${tempAlert.reading.temperature}°C is ${tempAlert.violation_type.replace('_', ' ')} (Range: ${tempAlert.threshold_min}°C - ${tempAlert.threshold_max}°C)`,
        source: {
          table: 'temperature_readings',
          id: tempAlert.reading.id,
          name: tempAlert.conservation_point_name,
        },
        metadata: {
          temperature: tempAlert.reading.temperature,
          conservation_point_id: tempAlert.conservation_point_id,
          deviation: tempAlert.deviation,
          reading_time: tempAlert.reading.reading_time,
        },
        actions: [
          {
            id: 'acknowledge',
            label: 'Acknowledge',
            type: 'primary',
            action: () => this.acknowledgeAlert(tempAlert.id),
          },
          {
            id: 'view_history',
            label: 'View History',
            type: 'secondary',
            action: () =>
              this.viewTemperatureHistory(tempAlert.conservation_point_id),
          },
          {
            id: 'emergency_action',
            label: 'Emergency Response',
            type: 'danger',
            action: () => this.initiateEmergencyResponse(tempAlert),
            confirm: true,
            confirmMessage:
              'This will notify emergency contacts and create an incident report.',
          },
        ],
      })
    })
  }

  /**
   * Create a new HACCP alert
   */
  public createAlert(
    alertData: Omit<
      HACCPAlert,
      | 'id'
      | 'timestamp'
      | 'acknowledged'
      | 'escalated'
      | 'company_id'
      | 'affected_users'
    >
  ): string {
    const alert: HACCPAlert = {
      id: this.generateAlertId(),
      timestamp: new Date(),
      company_id: '', // Will be set by caller
      affected_users: [], // Will be determined by subscriptions
      acknowledged: false,
      escalated: false,
      ...alertData,
    }

    this.alerts.set(alert.id, alert)
    this.processAlert(alert)

    return alert.id
  }

  /**
   * Process alert - notifications, escalation, etc.
   */
  private processAlert(alert: HACCPAlert): void {
    // Determine affected users based on subscriptions
    alert.affected_users = this.getAffectedUsers(alert)

    // Send notifications
    this.sendNotifications(alert)

    // Setup escalation if needed
    this.setupEscalation(alert)

    // Notify callbacks
    this.notifyCallbacks(alert)

    console.log(`🚨 HACCP Alert created: ${alert.type} - ${alert.severity}`)
  }

  /**
   * Send notifications for an alert
   */
  private sendNotifications(alert: HACCPAlert): void {
    const relevantSubscriptions = Array.from(
      this.subscriptions.values()
    ).filter(
      sub =>
        sub.active &&
        sub.alertTypes.includes(alert.type) &&
        sub.severityFilter.includes(alert.severity)
    )

    relevantSubscriptions.forEach(subscription => {
      if (subscription.channels.includes('browser')) {
        this.sendBrowserNotification(alert)
      }
      // Email and SMS would be handled by backend services
    })

    // Toast notification for UI
    this.showToastNotification(alert)
  }

  /**
   * Send browser notification
   */
  private sendBrowserNotification(alert: HACCPAlert): void {
    if (!this.permissionGranted) return

    const notification = new Notification(alert.title, {
      body: alert.message,
      icon: this.getAlertIcon(alert.severity),
      tag: alert.id,
      requireInteraction:
        alert.severity === 'critical' || alert.severity === 'emergency',
    })

    notification.onclick = () => {
      window.focus()
      this.handleAlertClick(alert)
    }

    // Auto-dismiss if configured
    if (alert.auto_dismiss && alert.dismiss_timeout) {
      setTimeout(() => {
        notification.close()
      }, alert.dismiss_timeout)
    }
  }

  /**
   * Show toast notification
   */
  private showToastNotification(alert: HACCPAlert): void {
    const toastOptions: Parameters<typeof toast.error>[1] = {
      position: 'top-right',
      autoClose: alert.auto_dismiss ? alert.dismiss_timeout || 5000 : false,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    }

    // Create toast content (simplified for TypeScript compatibility)
    const toastContent = `${alert.title}: ${alert.message}`

    switch (alert.severity) {
      case 'emergency':
        toast.error(toastContent, toastOptions)
        if (this.soundEnabled) this.playAlertSound('emergency')
        break
      case 'critical':
        toast.error(toastContent, toastOptions)
        if (this.soundEnabled) this.playAlertSound('critical')
        break
      case 'warning':
        toast.warn(toastContent, toastOptions)
        break
      case 'info':
        toast.info(toastContent, toastOptions)
        break
    }
  }

  /**
   * Handle maintenance task updates
   */
  private handleMaintenanceUpdate(payload: Record<string, any>): void {
    const task = payload.new || payload.old

    if (payload.eventType === 'UPDATE' && task.status === 'overdue') {
      this.createAlert({
        type: 'maintenance_overdue',
        severity: 'critical',
        title: `Maintenance Overdue`,
        message: `Task "${task.title}" is overdue and requires immediate attention`,
        source: {
          table: 'maintenance_tasks',
          id: task.id,
          name: task.title,
        },
        actions: [
          {
            id: 'view_task',
            label: 'View Task',
            type: 'primary',
            action: () => this.navigateToTask(task.id),
          },
          {
            id: 'assign_staff',
            label: 'Assign Staff',
            type: 'secondary',
            action: () => this.showTaskAssignment(task.id),
          },
        ],
      })
    }
  }

  /**
   * Handle product updates (expiry warnings)
   */
  private handleProductUpdate(payload: Record<string, any>): void {
    const product = payload.new || payload.old

    if (payload.eventType === 'UPDATE' && product.expiry_date) {
      const expiryDate = new Date(product.expiry_date)
      const daysUntilExpiry = Math.ceil(
        (expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )

      if (
        daysUntilExpiry <=
          this.config.compliance_thresholds.expiry_warning_days &&
        daysUntilExpiry > 0
      ) {
        this.createAlert({
          type: 'expiry_warning',
          severity: daysUntilExpiry <= 1 ? 'critical' : 'warning',
          title: `Product Expiring Soon`,
          message: `${product.name} expires in ${daysUntilExpiry} day(s)`,
          source: {
            table: 'products',
            id: product.id,
            name: product.name,
          },
          actions: [
            {
              id: 'view_product',
              label: 'View Product',
              type: 'primary',
              action: () => this.navigateToProduct(product.id),
            },
            {
              id: 'update_expiry',
              label: 'Update Expiry',
              type: 'secondary',
              action: () => this.showExpiryUpdate(product.id),
            },
          ],
        })
      }
    }
  }

  /**
   * Setup alert escalation
   */
  private setupEscalation(alert: HACCPAlert): void {
    const escalationRule = this.config.escalation_rules[alert.type]
    if (!escalationRule) return

    setTimeout(
      () => {
        const currentAlert = this.alerts.get(alert.id)
        if (
          currentAlert &&
          !currentAlert.acknowledged &&
          !currentAlert.escalated
        ) {
          this.escalateAlert(alert.id)
        }
      },
      escalationRule.escalate_after * 60 * 1000
    )
  }

  /**
   * Escalate an alert
   */
  public escalateAlert(alertId: string): void {
    const alert = this.alerts.get(alertId)
    if (!alert) return

    alert.escalated = true
    alert.escalated_at = new Date()
    this.alerts.set(alertId, alert)

    // Create escalation notification
    this.createAlert({
      type: 'system_error',
      severity: 'critical',
      title: `Alert Escalation`,
      message: `Unacknowledged ${alert.type} alert has been escalated`,
      source: alert.source,
      auto_dismiss: false,
    })

    console.log(`⬆️ Alert escalated: ${alertId}`)
  }

  /**
   * Acknowledge an alert
   */
  public acknowledgeAlert(alertId: string, acknowledgedBy?: string): void {
    const alert = this.alerts.get(alertId)
    if (alert) {
      alert.acknowledged = true
      alert.acknowledged_by = acknowledgedBy
      alert.acknowledged_at = new Date()
      this.alerts.set(alertId, alert)

      console.log(`✅ Alert acknowledged: ${alertId}`)
    }
  }

  /**
   * Get active alerts
   */
  public getActiveAlerts(): HACCPAlert[] {
    return Array.from(this.alerts.values())
      .filter(alert => !alert.acknowledged)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  /**
   * Subscribe to alerts
   */
  public subscribe(subscription: Omit<AlertSubscription, 'id'>): string {
    const sub: AlertSubscription = {
      id: this.generateSubscriptionId(),
      ...subscription,
    }

    this.subscriptions.set(sub.id, sub)
    return sub.id
  }

  /**
   * Utility methods
   */
  private async requestNotificationPermission(): Promise<void> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      this.permissionGranted = permission === 'granted'
    }
  }

  private getDefaultConfig(): AlertingConfig {
    return {
      escalation_rules: {
        temperature_violation: { escalate_after: 15, escalate_to: ['admin'] },
        maintenance_overdue: {
          escalate_after: 60,
          escalate_to: ['responsabile'],
        },
        expiry_warning: { escalate_after: 1440, escalate_to: ['admin'] },
        certification_expiry: { escalate_after: 2880, escalate_to: ['admin'] },
        audit_required: { escalate_after: 720, escalate_to: ['admin'] },
        system_error: { escalate_after: 5, escalate_to: ['admin'] },
      },
      notification_settings: {
        browser_notifications: true,
        sound_alerts: true,
        persistent_critical: true,
        group_similar: true,
        rate_limiting: {
          max_per_minute: 10,
          max_per_hour: 50,
        },
      },
      compliance_thresholds: {
        temperature_tolerance: 2,
        maintenance_grace_period: 24,
        expiry_warning_days: 3,
        certification_warning_days: 30,
      },
    }
  }

  private getAffectedUsers(_alert: HACCPAlert): string[] {
    // This would typically query user preferences
    return []
  }

  private getAlertIcon(severity: string): string {
    switch (severity) {
      case 'emergency':
        return '🚨'
      case 'critical':
        return '⚠️'
      case 'warning':
        return '⚡'
      case 'info':
        return 'ℹ️'
      default:
        return '📢'
    }
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private playAlertSound(type: 'critical' | 'emergency'): void {
    // Sound implementation would go here
    console.log(`🔊 Playing ${type} alert sound`)
  }

  private handleAlertClick(alert: HACCPAlert): void {
    // Navigate to relevant page based on alert type
    console.log(`🖱️ Alert clicked: ${alert.id}`)
  }

  private navigateToTask(taskId: string): void {
    // Navigation implementation
    console.log(`🧭 Navigate to task: ${taskId}`)
  }

  private navigateToProduct(productId: string): void {
    // Navigation implementation
    console.log(`🧭 Navigate to product: ${productId}`)
  }

  private showTaskAssignment(taskId: string): void {
    // Show task assignment modal
    console.log(`👥 Show task assignment: ${taskId}`)
  }

  private showExpiryUpdate(productId: string): void {
    // Show expiry update modal
    console.log(`📅 Show expiry update: ${productId}`)
  }

  private viewTemperatureHistory(conservationPointId: string): void {
    // Show temperature history
    console.log(`📊 View temperature history: ${conservationPointId}`)
  }

  private initiateEmergencyResponse(tempAlert: TemperatureAlert): void {
    // Emergency response procedures
    console.log(
      `🚨 Emergency response initiated for: ${tempAlert.conservation_point_id}`
    )
  }

  private notifyCallbacks(alert: HACCPAlert): void {
    this.alertCallbacks.forEach(callback => {
      try {
        callback(alert)
      } catch (error) {
        console.error('Error in alert callback:', error)
      }
    })
  }

  /**
   * Event listeners
   */
  public onAlert(callback: (alert: HACCPAlert) => void): void {
    this.alertCallbacks.push(callback)
  }

  public removeAlertCallback(callback: (alert: HACCPAlert) => void): void {
    const index = this.alertCallbacks.indexOf(callback)
    if (index > -1) {
      this.alertCallbacks.splice(index, 1)
    }
  }

  /**
   * Cleanup
   */
  public destroy(): void {
    if (this.temperatureSubscriptionId) {
      realtimeManager.unsubscribe(this.temperatureSubscriptionId)
    }
    if (this.maintenanceSubscriptionId) {
      realtimeManager.unsubscribe(this.maintenanceSubscriptionId)
    }
    if (this.productSubscriptionId) {
      realtimeManager.unsubscribe(this.productSubscriptionId)
    }

    this.alerts.clear()
    this.subscriptions.clear()
    this.alertCallbacks = []

    console.log('🧹 HACCP Alert System destroyed')
  }
}

// Export singleton instance
export const haccpAlertSystem = new HACCPAlertSystem()
export default HACCPAlertSystem
