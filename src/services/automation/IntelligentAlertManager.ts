/**
 * B.10.3 Enterprise Automation - Intelligent Alert Manager
 * Smart alert system with context-aware notifications and escalation
 */

export interface AlertRule {
  id: string
  name: string
  description: string
  category:
    | 'temperature'
    | 'compliance'
    | 'maintenance'
    | 'security'
    | 'operational'
    | 'custom'
  severity: 'low' | 'medium' | 'high' | 'critical'
  source: string
  conditions: AlertCondition[]
  actions: AlertAction[]
  escalation?: EscalationConfig
  schedule?: AlertSchedule
  enabled: boolean
  companyId: string
  departmentId?: string
  createdBy: string
  createdAt: Date
  lastTriggered?: Date
  triggerCount: number
  suppressionRules?: SuppressionRule[]
}

export interface AlertCondition {
  type: 'threshold' | 'pattern' | 'anomaly' | 'duration' | 'frequency'
  field: string
  operator:
    | '>'
    | '<'
    | '>='
    | '<='
    | '=='
    | '!='
    | 'contains'
    | 'matches'
    | 'in'
    | 'between'
  value: string | number | boolean | string[] | number[]
  duration?: number // Minutes for sustained conditions
  lookbackPeriod?: number // Minutes to look back for pattern detection
  sensitivity?: number // 0-1 for anomaly detection
}

export interface AlertAction {
  type:
    | 'notification'
    | 'email'
    | 'sms'
    | 'webhook'
    | 'task_creation'
    | 'system_action'
  config:
    | NotificationConfig
    | EmailConfig
    | SMSConfig
    | WebhookConfig
    | TaskCreationConfig
    | SystemActionConfig
  delay?: number // Minutes to delay action
  conditions?: AlertCondition[] // Additional conditions for this action
}

export interface NotificationConfig {
  channels: ('push' | 'desktop' | 'mobile')[]
  recipients: string[]
  template: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  sound?: string
  vibration?: boolean
  persistent?: boolean
}

export interface EmailConfig {
  recipients: string[]
  subject: string
  template: string
  attachments?: string[]
  priority: 'low' | 'normal' | 'high'
}

export interface SMSConfig {
  recipients: string[]
  message: string
  shortUrl?: boolean
}

export interface WebhookConfig {
  url: string
  method: 'POST' | 'PUT' | 'PATCH'
  headers: Record<string, string>
  payload: Record<string, unknown>
  retries: number
}

export interface TaskCreationConfig {
  title: string
  description: string
  assignedTo?: string
  department?: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  dueInMinutes?: number
  category: string
  checklist?: string[]
}

export interface SystemActionConfig {
  action: 'log' | 'metric' | 'flag' | 'shutdown' | 'restart' | 'custom'
  parameters: Record<string, unknown>
}

export interface EscalationConfig {
  levels: EscalationLevel[]
  maxLevel: number
  backoffMultiplier: number // Multiplier for each escalation level
  resetAfterMinutes: number // Reset escalation after this time
}

export interface EscalationLevel {
  level: number
  delayMinutes: number
  recipients: string[]
  actions: AlertAction[]
  condition?: 'unacknowledged' | 'unresolved' | 'custom'
}

export interface AlertSchedule {
  enabledDays: number[] // Days of week (0-6)
  enabledHours: { start: string; end: string }[]
  timezone: string
  blackoutPeriods?: BlackoutPeriod[]
}

export interface BlackoutPeriod {
  name: string
  start: Date
  end: Date
  recurring?: 'daily' | 'weekly' | 'monthly' | 'yearly'
}

export interface SuppressionRule {
  type: 'frequency' | 'duplicate' | 'maintenance' | 'dependency'
  config:
    | FrequencySuppressionConfig
    | DuplicateSuppressionConfig
    | MaintenanceSuppressionConfig
    | DependencySuppressionConfig
}

export interface FrequencySuppressionConfig {
  maxAlertsPerHour: number
  windowMinutes: number
}

export interface DuplicateSuppressionConfig {
  fields: string[]
  windowMinutes: number
}

export interface MaintenanceSuppressionConfig {
  maintenanceWindows: { start: Date; end: Date }[]
}

export interface DependencySuppressionConfig {
  dependsOn: string[] // Other alert rule IDs
  suppressWhenActive: boolean
}

export interface Alert {
  id: string
  ruleId: string
  ruleName: string
  category: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  source: string
  sourceData: Record<string, unknown>
  triggeredAt: Date
  acknowledgedAt?: Date
  acknowledgedBy?: string
  resolvedAt?: Date
  resolvedBy?: string
  status: 'active' | 'acknowledged' | 'resolved' | 'suppressed' | 'expired'
  escalationLevel: number
  actions: AlertActionResult[]
  metadata: AlertMetadata
  tags: string[]
  companyId: string
  departmentId?: string
}

export interface AlertActionResult {
  actionType: string
  executedAt: Date
  status: 'success' | 'failure' | 'pending'
  result?: unknown
  error?: string
  retryCount: number
}

export interface AlertMetadata {
  confidence: number // 0-1, confidence in alert accuracy
  impact: number // 0-1, estimated business impact
  urgency: number // 0-1, time sensitivity
  context: Record<string, unknown>
  relatedAlerts: string[]
  trends: {
    frequency: number // Alerts per hour in last 24h
    pattern: 'increasing' | 'decreasing' | 'stable' | 'spike'
  }
}

export interface AlertSummary {
  totalActive: number
  bySeverity: Record<string, number>
  byCategory: Record<string, number>
  byDepartment: Record<string, number>
  escalated: number
  unacknowledged: number
  avgResolutionTime: number
  topSources: Array<{ source: string; count: number }>
}

/**
 * Intelligent Alert Manager
 * Context-aware alert system with smart escalation and suppression
 */
export class IntelligentAlertManager {
  private alertRules: Map<string, AlertRule> = new Map()
  private activeAlerts: Map<string, Alert> = new Map()
  private alertHistory: Alert[] = []
  private escalationTimers: Map<string, ReturnType<typeof setTimeout>> =
    new Map()
  private suppressionCache: Map<string, Date> = new Map()
  private anomalyDetector: AnomalyDetector
  private patternAnalyzer: PatternAnalyzer
  private isInitialized = false

  constructor() {
    this.anomalyDetector = new AnomalyDetector()
    this.patternAnalyzer = new PatternAnalyzer()
  }

  /**
   * Initialize intelligent alert manager
   */
  public async initialize(): Promise<void> {
    console.log('🚨 Initializing Intelligent Alert Manager...')

    try {
      // Load alert rules
      await this.loadAlertRules()

      // Initialize ML components
      await this.anomalyDetector.initialize()
      await this.patternAnalyzer.initialize()

      // Setup monitoring
      await this.setupMonitoring()

      // Load existing alerts
      await this.loadActiveAlerts()

      this.isInitialized = true
      console.log('✅ Intelligent Alert Manager initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize alert manager:', error)
      throw error
    }
  }

  /**
   * Create new alert rule
   */
  public async createAlertRule(
    rule: Omit<AlertRule, 'id' | 'createdAt' | 'lastTriggered' | 'triggerCount'>
  ): Promise<AlertRule> {
    const newRule: AlertRule = {
      ...rule,
      id: this.generateId(),
      createdAt: new Date(),
      triggerCount: 0,
    }

    this.alertRules.set(newRule.id, newRule)

    console.log(`🚨 Alert rule created: ${newRule.name}`)
    return newRule
  }

  /**
   * Process incoming data and check for alert conditions
   */
  public async processData(
    source: string,
    data: Record<string, unknown>
  ): Promise<Alert[]> {
    if (!this.isInitialized) {
      throw new Error('Alert Manager not initialized')
    }

    const triggeredAlerts: Alert[] = []

    // Get relevant alert rules for this source
    const relevantRules = Array.from(this.alertRules.values()).filter(
      rule => rule.enabled && rule.source === source
    )

    for (const rule of relevantRules) {
      try {
        // Check if alert should be triggered
        if (await this.evaluateAlertRule(rule, data)) {
          // Check suppression rules
          if (!this.isAlertSuppressed(rule, data)) {
            const alert = await this.triggerAlert(rule, data)
            triggeredAlerts.push(alert)
          }
        }
      } catch (error) {
        console.error(`Error evaluating alert rule ${rule.name}:`, error)
      }
    }

    return triggeredAlerts
  }

  /**
   * Acknowledge alert
   */
  public async acknowledgeAlert(
    alertId: string,
    acknowledgedBy: string
  ): Promise<Alert> {
    const alert = this.activeAlerts.get(alertId)
    if (!alert) {
      throw new Error(`Alert not found: ${alertId}`)
    }

    if (alert.status !== 'active') {
      throw new Error(`Alert cannot be acknowledged in status: ${alert.status}`)
    }

    alert.acknowledgedAt = new Date()
    alert.acknowledgedBy = acknowledgedBy
    alert.status = 'acknowledged'

    // Stop escalation
    this.stopEscalation(alertId)

    console.log(`✅ Alert acknowledged: ${alert.title} by ${acknowledgedBy}`)
    return alert
  }

  /**
   * Resolve alert
   */
  public async resolveAlert(
    alertId: string,
    resolvedBy: string,
    resolution?: string
  ): Promise<Alert> {
    const alert = this.activeAlerts.get(alertId)
    if (!alert) {
      throw new Error(`Alert not found: ${alertId}`)
    }

    alert.resolvedAt = new Date()
    alert.resolvedBy = resolvedBy
    alert.status = 'resolved'

    if (resolution) {
      alert.metadata.context.resolution = resolution
    }

    // Stop escalation
    this.stopEscalation(alertId)

    // Move to history
    this.alertHistory.push(alert)
    this.activeAlerts.delete(alertId)

    console.log(`✅ Alert resolved: ${alert.title} by ${resolvedBy}`)
    return alert
  }

  /**
   * Get active alerts
   */
  public getActiveAlerts(filters?: {
    severity?: string
    category?: string
    companyId?: string
    departmentId?: string
    status?: string
  }): Alert[] {
    let alerts = Array.from(this.activeAlerts.values())

    if (filters) {
      if (filters.severity) {
        alerts = alerts.filter(a => a.severity === filters.severity)
      }
      if (filters.category) {
        alerts = alerts.filter(a => a.category === filters.category)
      }
      if (filters.companyId) {
        alerts = alerts.filter(a => a.companyId === filters.companyId)
      }
      if (filters.departmentId) {
        alerts = alerts.filter(a => a.departmentId === filters.departmentId)
      }
      if (filters.status) {
        alerts = alerts.filter(a => a.status === filters.status)
      }
    }

    // Sort by severity and time
    return alerts.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity]
      if (severityDiff !== 0) return severityDiff
      return b.triggeredAt.getTime() - a.triggeredAt.getTime()
    })
  }

  /**
   * Get alert summary
   */
  public getAlertSummary(companyId?: string): AlertSummary {
    const alerts = this.getActiveAlerts(companyId ? { companyId } : undefined)

    const bySeverity = alerts.reduce(
      (acc, alert) => {
        acc[alert.severity] = (acc[alert.severity] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const byCategory = alerts.reduce(
      (acc, alert) => {
        acc[alert.category] = (acc[alert.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const byDepartment = alerts.reduce(
      (acc, alert) => {
        if (alert.departmentId) {
          acc[alert.departmentId] = (acc[alert.departmentId] || 0) + 1
        }
        return acc
      },
      {} as Record<string, number>
    )

    const escalated = alerts.filter(a => a.escalationLevel > 0).length
    const unacknowledged = alerts.filter(a => a.status === 'active').length

    // Calculate average resolution time from history
    const resolvedAlerts = this.alertHistory.filter(
      a => a.resolvedAt && a.companyId === (companyId || a.companyId)
    )
    const avgResolutionTime =
      resolvedAlerts.length > 0
        ? resolvedAlerts.reduce((sum, a) => {
            const resolutionTime =
              a.resolvedAt!.getTime() - a.triggeredAt.getTime()
            return sum + resolutionTime
          }, 0) /
          resolvedAlerts.length /
          (60 * 1000) // Convert to minutes
        : 0

    // Top alert sources
    const sourceCounts = alerts.reduce(
      (acc, alert) => {
        acc[alert.source] = (acc[alert.source] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const topSources = Object.entries(sourceCounts)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return {
      totalActive: alerts.length,
      bySeverity,
      byCategory,
      byDepartment,
      escalated,
      unacknowledged,
      avgResolutionTime,
      topSources,
    }
  }

  /**
   * Update alert rule
   */
  public async updateAlertRule(
    ruleId: string,
    updates: Partial<AlertRule>
  ): Promise<AlertRule> {
    const rule = this.alertRules.get(ruleId)
    if (!rule) {
      throw new Error(`Alert rule not found: ${ruleId}`)
    }

    const updatedRule = { ...rule, ...updates }
    this.alertRules.set(ruleId, updatedRule)

    console.log(`🚨 Alert rule updated: ${updatedRule.name}`)
    return updatedRule
  }

  /**
   * Delete alert rule
   */
  public async deleteAlertRule(ruleId: string): Promise<void> {
    const rule = this.alertRules.get(ruleId)
    if (!rule) {
      throw new Error(`Alert rule not found: ${ruleId}`)
    }

    this.alertRules.delete(ruleId)
    console.log(`🚨 Alert rule deleted: ${rule.name}`)
  }

  /**
   * Get alert rules
   */
  public getAlertRules(companyId?: string): AlertRule[] {
    const rules = Array.from(this.alertRules.values())
    return companyId
      ? rules.filter(rule => rule.companyId === companyId)
      : rules
  }

  /**
   * Test alert rule
   */
  public async testAlertRule(
    ruleId: string,
    testData: Record<string, unknown>
  ): Promise<{
    wouldTrigger: boolean
    conditions: Array<{ condition: AlertCondition; result: boolean }>
    suppressed: boolean
    estimatedActions: string[]
  }> {
    const rule = this.alertRules.get(ruleId)
    if (!rule) {
      throw new Error(`Alert rule not found: ${ruleId}`)
    }

    const conditionResults = []
    let wouldTrigger = true

    for (const condition of rule.conditions) {
      const result = await this.evaluateCondition(condition, testData)
      conditionResults.push({ condition, result })
      if (!result) {
        wouldTrigger = false
      }
    }

    const suppressed = wouldTrigger && this.isAlertSuppressed(rule, testData)
    const estimatedActions = rule.actions.map(action => action.type)

    return {
      wouldTrigger: wouldTrigger && !suppressed,
      conditions: conditionResults,
      suppressed,
      estimatedActions,
    }
  }

  /**
   * Get alert metrics
   */
  public getAlertMetrics(companyId?: string): {
    totalRules: number
    activeRules: number
    totalAlerts: number
    alertsToday: number
    avgResponseTime: number
    falsePositiveRate: number
    escalationRate: number
    resolutionRate: number
  } {
    const rules = this.getAlertRules(companyId)
    const alerts = this.getActiveAlerts(companyId ? { companyId } : undefined)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const alertsToday = this.alertHistory.filter(
      a => a.triggeredAt >= today && (!companyId || a.companyId === companyId)
    ).length

    const resolvedAlerts = this.alertHistory.filter(
      a => a.resolvedAt && (!companyId || a.companyId === companyId)
    )

    const avgResponseTime =
      resolvedAlerts.length > 0
        ? resolvedAlerts.reduce((sum, a) => {
            const responseTime =
              (a.acknowledgedAt || a.resolvedAt!).getTime() -
              a.triggeredAt.getTime()
            return sum + responseTime
          }, 0) /
          resolvedAlerts.length /
          (60 * 1000) // Convert to minutes
        : 0

    return {
      totalRules: rules.length,
      activeRules: rules.filter(r => r.enabled).length,
      totalAlerts: alerts.length,
      alertsToday,
      avgResponseTime,
      falsePositiveRate: 0.05, // Mock data
      escalationRate: 0.15, // Mock data
      resolutionRate: 0.95, // Mock data
    }
  }

  /**
   * Stop alert manager
   */
  public async stop(): Promise<void> {
    // Clear all escalation timers
    for (const timer of this.escalationTimers.values()) {
      clearTimeout(timer)
    }
    this.escalationTimers.clear()

    console.log('🚨 Intelligent Alert Manager stopped')
  }

  /**
   * Private helper methods
   */
  private async loadAlertRules(): Promise<void> {
    console.log('📋 Loading alert rules...')

    // Create default HACCP alert rules
    await this.createDefaultAlertRules()
  }

  private async createDefaultAlertRules(): Promise<void> {
    // Critical temperature alert
    const temperatureRule: Omit<
      AlertRule,
      'id' | 'createdAt' | 'lastTriggered' | 'triggerCount'
    > = {
      name: 'Critical Temperature Alert',
      description: 'Alert when temperature exceeds safe limits',
      category: 'temperature',
      severity: 'critical',
      source: 'temperature_readings',
      conditions: [
        {
          type: 'threshold',
          field: 'temperature',
          operator: '>',
          value: 8,
        },
      ],
      actions: [
        {
          type: 'notification',
          config: {
            channels: ['push', 'desktop', 'mobile'],
            recipients: ['manager', 'supervisor'],
            template: 'critical-temperature-alert',
            priority: 'urgent',
            sound: 'critical',
            vibration: true,
            persistent: true,
          } as NotificationConfig,
        },
        {
          type: 'email',
          config: {
            recipients: ['manager@company.com', 'supervisor@company.com'],
            subject: 'CRITICAL: Temperature Threshold Exceeded',
            template: 'critical-temperature-email',
            priority: 'high',
          } as EmailConfig,
        },
        {
          type: 'task_creation',
          config: {
            title: 'URGENT: Temperature Control Required',
            description:
              'Critical temperature reading detected - immediate action required',
            priority: 'critical',
            dueInMinutes: 15,
            category: 'temperature',
            assignedTo: 'supervisor',
          } as TaskCreationConfig,
        },
      ],
      escalation: {
        levels: [
          {
            level: 1,
            delayMinutes: 5,
            recipients: ['department_head'],
            actions: [
              {
                type: 'sms',
                config: {
                  recipients: ['+1234567890'],
                  message:
                    'CRITICAL ALERT: Temperature control failure. Immediate action required.',
                } as SMSConfig,
              },
            ],
            condition: 'unacknowledged',
          },
          {
            level: 2,
            delayMinutes: 15,
            recipients: ['facility_manager'],
            actions: [
              {
                type: 'email',
                config: {
                  recipients: ['facility@company.com'],
                  subject: 'ESCALATED: Critical Temperature Alert',
                  template: 'escalated-temperature-alert',
                  priority: 'high',
                } as EmailConfig,
              },
            ],
            condition: 'unresolved',
          },
        ],
        maxLevel: 2,
        backoffMultiplier: 1.5,
        resetAfterMinutes: 60,
      },
      schedule: {
        enabledDays: [0, 1, 2, 3, 4, 5, 6], // All days
        enabledHours: [{ start: '00:00', end: '23:59' }], // 24/7
        timezone: 'Europe/Rome',
      },
      enabled: true,
      companyId: 'default',
      createdBy: 'system',
      suppressionRules: [
        {
          type: 'frequency',
          config: {
            maxAlertsPerHour: 3,
            windowMinutes: 60,
          } as FrequencySuppressionConfig,
        },
      ],
    }

    await this.createAlertRule(temperatureRule)

    // Compliance monitoring alert
    const complianceRule: Omit<
      AlertRule,
      'id' | 'createdAt' | 'lastTriggered' | 'triggerCount'
    > = {
      name: 'Compliance Score Alert',
      description: 'Alert when compliance score drops below threshold',
      category: 'compliance',
      severity: 'high',
      source: 'compliance_monitor',
      conditions: [
        {
          type: 'threshold',
          field: 'compliance_score',
          operator: '<',
          value: 85,
          duration: 5, // Sustained for 5 minutes
        },
      ],
      actions: [
        {
          type: 'notification',
          config: {
            channels: ['push', 'desktop'],
            recipients: ['quality_manager'],
            template: 'compliance-alert',
            priority: 'high',
          } as NotificationConfig,
        },
        {
          type: 'task_creation',
          config: {
            title: 'Compliance Review Required',
            description:
              'Compliance score has dropped below acceptable threshold',
            priority: 'high',
            dueInMinutes: 120,
            category: 'compliance',
            assignedTo: 'quality_manager',
          } as TaskCreationConfig,
        },
      ],
      enabled: true,
      companyId: 'default',
      createdBy: 'system',
    }

    await this.createAlertRule(complianceRule)
  }

  private async loadActiveAlerts(): Promise<void> {
    console.log('📋 Loading active alerts...')
    // In a real implementation, this would load from database
  }

  private async setupMonitoring(): Promise<void> {
    console.log('👁️ Setting up alert monitoring...')
    // In a real implementation, this would setup monitoring hooks
  }

  private async evaluateAlertRule(
    rule: AlertRule,
    data: Record<string, unknown>
  ): Promise<boolean> {
    // Check schedule first
    if (rule.schedule && !this.isWithinSchedule(rule.schedule)) {
      return false
    }

    // Evaluate all conditions
    for (const condition of rule.conditions) {
      if (!(await this.evaluateCondition(condition, data))) {
        return false
      }
    }

    return true
  }

  private async evaluateCondition(
    condition: AlertCondition,
    data: Record<string, unknown>
  ): Promise<boolean> {
    const fieldValue = this.getFieldValue(data, condition.field)

    if (fieldValue === undefined || fieldValue === null) {
      return false
    }

    switch (condition.type) {
      case 'threshold':
        return this.evaluateThresholdCondition(condition, fieldValue)
      case 'pattern':
        return await this.evaluatePatternCondition(condition, data)
      case 'anomaly':
        return await this.evaluateAnomalyCondition(condition, fieldValue)
      case 'duration':
        return this.evaluateDurationCondition(condition, data)
      case 'frequency':
        return this.evaluateFrequencyCondition(condition, data)
      default:
        return false
    }
  }

  private evaluateThresholdCondition(
    condition: AlertCondition,
    value: unknown
  ): boolean {
    const conditionVal = condition.value

    switch (condition.operator) {
      case '>':
        return (
          typeof value === 'number' &&
          typeof conditionVal === 'number' &&
          value > conditionVal
        )
      case '<':
        return (
          typeof value === 'number' &&
          typeof conditionVal === 'number' &&
          value < conditionVal
        )
      case '>=':
        return (
          typeof value === 'number' &&
          typeof conditionVal === 'number' &&
          value >= conditionVal
        )
      case '<=':
        return (
          typeof value === 'number' &&
          typeof conditionVal === 'number' &&
          value <= conditionVal
        )
      case '==':
        return value === conditionVal
      case '!=':
        return value !== conditionVal
      case 'contains':
        return String(value).includes(String(conditionVal))
      case 'in':
        return (
          Array.isArray(conditionVal) && conditionVal.includes(value as never)
        )
      case 'between':
        return (
          Array.isArray(conditionVal) &&
          conditionVal.length === 2 &&
          typeof value === 'number' &&
          typeof conditionVal[0] === 'number' &&
          typeof conditionVal[1] === 'number' &&
          value >= conditionVal[0] &&
          value <= conditionVal[1]
        )
      default:
        return false
    }
  }

  private async evaluatePatternCondition(
    condition: AlertCondition,
    data: Record<string, unknown>
  ): Promise<boolean> {
    return await this.patternAnalyzer.detectPattern(
      condition.field,
      data,
      condition.value
    )
  }

  private async evaluateAnomalyCondition(
    condition: AlertCondition,
    value: unknown
  ): Promise<boolean> {
    return await this.anomalyDetector.isAnomaly(
      condition.field,
      value,
      condition.sensitivity || 0.8
    )
  }

  private evaluateDurationCondition(
    _condition: AlertCondition,
    _data: Record<string, unknown>
  ): boolean {
    // In a real implementation, this would check if condition has been true for the specified duration
    return true
  }

  private evaluateFrequencyCondition(
    _condition: AlertCondition,
    _data: Record<string, unknown>
  ): boolean {
    // In a real implementation, this would check frequency over the lookback period
    return true
  }

  private getFieldValue(data: Record<string, unknown>, field: string): unknown {
    const parts = field.split('.')
    let value: unknown = data

    for (const part of parts) {
      if (value === null || value === undefined) {
        return undefined
      }
      if (typeof value === 'object' && value !== null && part in value) {
        value = (value as Record<string, unknown>)[part]
      } else {
        return undefined
      }
    }

    return value
  }

  private isWithinSchedule(schedule: AlertSchedule): boolean {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const currentTime = now.getHours() * 100 + now.getMinutes()

    // Check enabled days
    if (!schedule.enabledDays.includes(dayOfWeek)) {
      return false
    }

    // Check enabled hours
    let withinHours = false
    for (const timeRange of schedule.enabledHours) {
      const startTime = this.parseTime(timeRange.start)
      const endTime = this.parseTime(timeRange.end)

      if (currentTime >= startTime && currentTime <= endTime) {
        withinHours = true
        break
      }
    }

    if (!withinHours) {
      return false
    }

    // Check blackout periods
    if (schedule.blackoutPeriods) {
      for (const blackout of schedule.blackoutPeriods) {
        if (now >= blackout.start && now <= blackout.end) {
          return false
        }
      }
    }

    return true
  }

  private parseTime(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number)
    return hours * 100 + minutes
  }

  private isAlertSuppressed(
    rule: AlertRule,
    data: Record<string, unknown>
  ): boolean {
    if (!rule.suppressionRules) {
      return false
    }

    for (const suppressionRule of rule.suppressionRules) {
      if (this.evaluateSuppressionRule(suppressionRule, rule, data)) {
        return true
      }
    }

    return false
  }

  private evaluateSuppressionRule(
    suppressionRule: SuppressionRule,
    rule: AlertRule,
    data: Record<string, unknown>
  ): boolean {
    switch (suppressionRule.type) {
      case 'frequency':
        return this.evaluateFrequencySuppressionRule(
          suppressionRule.config as FrequencySuppressionConfig,
          rule
        )
      case 'duplicate':
        return this.evaluateDuplicateSuppressionRule(
          suppressionRule.config as DuplicateSuppressionConfig,
          rule,
          data
        )
      case 'maintenance':
        return this.evaluateMaintenanceSuppressionRule(
          suppressionRule.config as MaintenanceSuppressionConfig
        )
      case 'dependency':
        return this.evaluateDependencySuppressionRule(
          suppressionRule.config as DependencySuppressionConfig
        )
      default:
        return false
    }
  }

  private evaluateFrequencySuppressionRule(
    config: FrequencySuppressionConfig,
    rule: AlertRule
  ): boolean {
    const now = new Date()
    const windowStart = new Date(
      now.getTime() - config.windowMinutes * 60 * 1000
    )

    const recentAlerts = this.alertHistory.filter(
      alert =>
        alert.ruleId === rule.id &&
        alert.triggeredAt >= windowStart &&
        alert.triggeredAt <= now
    )

    return recentAlerts.length >= config.maxAlertsPerHour
  }

  private evaluateDuplicateSuppressionRule(
    config: DuplicateSuppressionConfig,
    rule: AlertRule,
    data: Record<string, unknown>
  ): boolean {
    // Check for duplicate alerts based on specified fields
    const cacheKey = config.fields
      .map(field => this.getFieldValue(data, field))
      .join('|')
    const lastSeen = this.suppressionCache.get(`${rule.id}|${cacheKey}`)

    if (lastSeen) {
      const windowEnd = new Date(
        lastSeen.getTime() + config.windowMinutes * 60 * 1000
      )
      if (new Date() < windowEnd) {
        return true
      }
    }

    // Update cache
    this.suppressionCache.set(`${rule.id}|${cacheKey}`, new Date())
    return false
  }

  private evaluateMaintenanceSuppressionRule(
    config: MaintenanceSuppressionConfig
  ): boolean {
    const now = new Date()

    for (const window of config.maintenanceWindows) {
      if (now >= window.start && now <= window.end) {
        return true
      }
    }

    return false
  }

  private evaluateDependencySuppressionRule(
    config: DependencySuppressionConfig
  ): boolean {
    if (!config.suppressWhenActive) {
      return false
    }

    // Check if any dependent alerts are active
    for (const dependentRuleId of config.dependsOn) {
      const dependentAlerts = Array.from(this.activeAlerts.values()).filter(
        alert => alert.ruleId === dependentRuleId && alert.status === 'active'
      )

      if (dependentAlerts.length > 0) {
        return true
      }
    }

    return false
  }

  private async triggerAlert(
    rule: AlertRule,
    data: Record<string, unknown>
  ): Promise<Alert> {
    const alert: Alert = {
      id: this.generateId(),
      ruleId: rule.id,
      ruleName: rule.name,
      category: rule.category,
      severity: rule.severity,
      title: this.generateAlertTitle(rule, data),
      message: this.generateAlertMessage(rule, data),
      source: rule.source,
      sourceData: data,
      triggeredAt: new Date(),
      status: 'active',
      escalationLevel: 0,
      actions: [],
      metadata: {
        confidence: 0.9, // High confidence for rule-based alerts
        impact: this.calculateImpact(rule, data),
        urgency: this.calculateUrgency(rule, data),
        context: { ...data },
        relatedAlerts: [],
        trends: {
          frequency: 0,
          pattern: 'stable',
        },
      },
      tags: [rule.category, rule.severity],
      companyId: rule.companyId,
      departmentId: rule.departmentId,
    }

    this.activeAlerts.set(alert.id, alert)

    // Execute immediate actions
    await this.executeAlertActions(alert, rule.actions)

    // Setup escalation if configured
    if (rule.escalation) {
      this.setupEscalation(alert, rule.escalation)
    }

    // Update rule statistics
    rule.triggerCount++
    rule.lastTriggered = new Date()

    console.log(`🚨 Alert triggered: ${alert.title} (${alert.severity})`)
    return alert
  }

  private async executeAlertActions(
    alert: Alert,
    actions: AlertAction[]
  ): Promise<void> {
    for (const action of actions) {
      try {
        // Check action conditions if any
        if (action.conditions) {
          let conditionsMet = true
          for (const condition of action.conditions) {
            if (!(await this.evaluateCondition(condition, alert.sourceData))) {
              conditionsMet = false
              break
            }
          }
          if (!conditionsMet) {
            continue
          }
        }

        // Apply delay if specified
        if (action.delay && action.delay > 0) {
          setTimeout(
            async () => {
              await this.executeAction(alert, action)
            },
            action.delay * 60 * 1000
          )
        } else {
          await this.executeAction(alert, action)
        }
      } catch (error) {
        console.error(
          `Failed to execute action ${action.type} for alert ${alert.id}:`,
          error
        )
      }
    }
  }

  private async executeAction(
    alert: Alert,
    action: AlertAction
  ): Promise<void> {
    try {
      let result: unknown

      switch (action.type) {
        case 'notification':
          result = await this.sendNotification(
            action.config as NotificationConfig,
            alert
          )
          break
        case 'email':
          result = await this.sendEmail(action.config as EmailConfig, alert)
          break
        case 'sms':
          result = await this.sendSMS(action.config as SMSConfig, alert)
          break
        case 'webhook':
          result = await this.callWebhook(action.config as WebhookConfig, alert)
          break
        case 'task_creation':
          result = await this.createTask(
            action.config as TaskCreationConfig,
            alert
          )
          break
        case 'system_action':
          result = await this.executeSystemAction(
            action.config as SystemActionConfig,
            alert
          )
          break
        default:
          throw new Error(`Unknown action type: ${action.type}`)
      }

      alert.actions.push({
        actionType: action.type,
        executedAt: new Date(),
        status: 'success',
        result,
        retryCount: 0,
      })
    } catch (error) {
      alert.actions.push({
        actionType: action.type,
        executedAt: new Date(),
        status: 'failure',
        error: error instanceof Error ? error.message : 'Unknown error',
        retryCount: 0,
      })
    }
  }

  private async sendNotification(
    config: NotificationConfig,
    alert: Alert
  ): Promise<{ sent: boolean; channels: string[]; recipients: string[] }> {
    console.log(`📱 Sending notification: ${alert.title}`)
    // In a real implementation, this would send actual notifications
    return {
      sent: true,
      channels: config.channels,
      recipients: config.recipients,
    }
  }

  private async sendEmail(
    config: EmailConfig,
    _alert: Alert
  ): Promise<{ sent: boolean; recipients: string[] }> {
    console.log(`📧 Sending email: ${config.subject}`)
    // In a real implementation, this would send actual emails
    return { sent: true, recipients: config.recipients }
  }

  private async sendSMS(
    config: SMSConfig,
    _alert: Alert
  ): Promise<{ sent: boolean; recipients: string[] }> {
    console.log(`📱 Sending SMS: ${config.message}`)
    // In a real implementation, this would send actual SMS
    return { sent: true, recipients: config.recipients }
  }

  private async callWebhook(
    config: WebhookConfig,
    _alert: Alert
  ): Promise<{ called: boolean; url: string; status: number }> {
    console.log(`🔗 Calling webhook: ${config.url}`)
    // In a real implementation, this would make actual HTTP calls
    return { called: true, url: config.url, status: 200 }
  }

  private async createTask(
    config: TaskCreationConfig,
    _alert: Alert
  ): Promise<{
    taskId: string
    title: string
    assignedTo?: string
    priority: string
  }> {
    console.log(`📋 Creating task: ${config.title}`)
    // In a real implementation, this would create actual tasks
    return {
      taskId: this.generateId(),
      title: config.title,
      assignedTo: config.assignedTo,
      priority: config.priority,
    }
  }

  private async executeSystemAction(
    config: SystemActionConfig,
    _alert: Alert
  ): Promise<{ executed: boolean; action: string }> {
    console.log(`⚙️ Executing system action: ${config.action}`)
    // In a real implementation, this would execute actual system actions
    return { executed: true, action: config.action }
  }

  private setupEscalation(alert: Alert, escalation: EscalationConfig): void {
    if (escalation.levels.length === 0) return

    const firstLevel = escalation.levels[0]
    const delay = firstLevel.delayMinutes * 60 * 1000

    const timer = setTimeout(async () => {
      await this.escalateAlert(alert, escalation, 0)
    }, delay)

    this.escalationTimers.set(alert.id, timer)
  }

  private async escalateAlert(
    alert: Alert,
    escalation: EscalationConfig,
    levelIndex: number
  ): Promise<void> {
    if (
      levelIndex >= escalation.levels.length ||
      levelIndex >= escalation.maxLevel
    ) {
      return
    }

    const level = escalation.levels[levelIndex]

    // Check escalation condition
    if (level.condition === 'unacknowledged' && alert.acknowledgedAt) {
      return
    }
    if (level.condition === 'unresolved' && alert.resolvedAt) {
      return
    }

    console.log(`🚨 Escalating alert ${alert.title} to level ${level.level}`)

    alert.escalationLevel = level.level

    // Execute escalation actions
    await this.executeAlertActions(alert, level.actions)

    // Schedule next escalation level
    const nextLevelIndex = levelIndex + 1
    if (
      nextLevelIndex < escalation.levels.length &&
      nextLevelIndex < escalation.maxLevel
    ) {
      const nextLevel = escalation.levels[nextLevelIndex]
      const delay =
        nextLevel.delayMinutes *
        60 *
        1000 *
        Math.pow(escalation.backoffMultiplier, levelIndex)

      const timer = setTimeout(async () => {
        await this.escalateAlert(alert, escalation, nextLevelIndex)
      }, delay)

      this.escalationTimers.set(alert.id, timer)
    }
  }

  private stopEscalation(alertId: string): void {
    const timer = this.escalationTimers.get(alertId)
    if (timer) {
      clearTimeout(timer)
      this.escalationTimers.delete(alertId)
    }
  }

  private generateAlertTitle(
    rule: AlertRule,
    _data: Record<string, unknown>
  ): string {
    // Generate intelligent alert title based on rule and data
    const severity = rule.severity.toUpperCase()
    const category = rule.category.replace('_', ' ')
    return `${severity} ${category}: ${rule.name}`
  }

  private generateAlertMessage(
    rule: AlertRule,
    data: Record<string, unknown>
  ): string {
    // Generate detailed alert message
    return `${rule.description}\n\nTriggered by: ${JSON.stringify(data, null, 2)}`
  }

  private calculateImpact(
    rule: AlertRule,
    _data: Record<string, unknown>
  ): number {
    // Calculate business impact (0-1)
    const severityImpact = {
      low: 0.2,
      medium: 0.5,
      high: 0.8,
      critical: 1.0,
    }
    return severityImpact[rule.severity] || 0.5
  }

  private calculateUrgency(
    rule: AlertRule,
    _data: Record<string, unknown>
  ): number {
    // Calculate time urgency (0-1)
    const categoryUrgency: Record<string, number> = {
      temperature: 0.9,
      security: 0.8,
      compliance: 0.6,
      maintenance: 0.4,
      operational: 0.3,
    }
    return categoryUrgency[rule.category] || 0.5
  }

  private generateId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

/**
 * Anomaly Detector
 * Machine learning-based anomaly detection for smart alerts
 */
class AnomalyDetector {
  public async initialize(): Promise<void> {
    console.log('🤖 Initializing Anomaly Detector...')
    // In a real implementation, this would load ML models
  }

  public async isAnomaly(
    _field: string,
    _value: unknown,
    _sensitivity: number
  ): Promise<boolean> {
    // In a real implementation, this would use ML models to detect anomalies
    // For now, simple statistical approach
    return Math.random() < 0.1 // 10% chance of anomaly
  }
}

/**
 * Pattern Analyzer
 * Pattern recognition for complex alert conditions
 */
class PatternAnalyzer {
  public async initialize(): Promise<void> {
    console.log('🔍 Initializing Pattern Analyzer...')
    // In a real implementation, this would load pattern recognition models
  }

  public async detectPattern(
    _field: string,
    _data: Record<string, unknown>,
    _pattern: string | number | boolean | string[] | number[]
  ): Promise<boolean> {
    // In a real implementation, this would analyze complex patterns
    return Math.random() < 0.2 // 20% chance of pattern match
  }
}

// Export singleton instance
export const intelligentAlertManager = new IntelligentAlertManager()

export default intelligentAlertManager
