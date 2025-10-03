/**
 * B.10.3 Enterprise Automation - Workflow Automation Engine
 * Automated HACCP workflow management and intelligent task scheduling
 */

export interface AutomationRule {
  id: string
  name: string
  description: string
  trigger: AutomationTrigger
  conditions: AutomationCondition[]
  actions: AutomationAction[]
  enabled: boolean
  priority: 'low' | 'medium' | 'high' | 'critical'
  companyId: string
  createdBy: string
  createdAt: Date
  lastExecuted?: Date
  executionCount: number
  successRate: number
}

export interface AutomationTrigger {
  type: 'schedule' | 'event' | 'threshold' | 'manual'
  config: ScheduleTrigger | EventTrigger | ThresholdTrigger | ManualTrigger
}

export interface ScheduleTrigger {
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom'
  time: string // HH:MM format
  days?: number[] // Days of week (0-6)
  interval?: number // Custom interval
}

export interface EventTrigger {
  eventType:
    | 'temperature_reading'
    | 'task_completed'
    | 'product_expired'
    | 'compliance_check'
  source: string
  filters?: Record<string, any>
}

export interface ThresholdTrigger {
  metric:
    | 'temperature'
    | 'compliance_score'
    | 'task_overdue'
    | 'inventory_level'
  operator: '>' | '<' | '>=' | '<=' | '==' | '!='
  value: number
  duration?: number // Minutes to wait before trigger
}

export interface ManualTrigger {
  allowedRoles: string[]
  confirmationRequired: boolean
}

export interface AutomationCondition {
  type: 'time' | 'data' | 'user' | 'system'
  config: TimeCondition | DataCondition | UserCondition | SystemCondition
}

export interface TimeCondition {
  startTime?: string
  endTime?: string
  days?: number[]
  excludeHolidays?: boolean
}

export interface DataCondition {
  source: string
  field: string
  operator: string
  value: any
}

export interface UserCondition {
  roles?: string[]
  departments?: string[]
  users?: string[]
}

export interface SystemCondition {
  systemStatus: 'healthy' | 'warning' | 'critical'
  minimumDataQuality?: number
}

export interface AutomationAction {
  type:
    | 'create_task'
    | 'send_notification'
    | 'generate_report'
    | 'update_data'
    | 'trigger_workflow'
  config:
    | CreateTaskAction
    | NotificationAction
    | ReportAction
    | UpdateDataAction
    | WorkflowAction
  retryConfig?: {
    maxRetries: number
    delayMs: number
    backoffMultiplier: number
  }
}

export interface CreateTaskAction {
  title: string
  description: string
  assignedTo?: string
  department?: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  dueDate?: string
  category: string
  checklist?: string[]
}

export interface NotificationAction {
  type: 'email' | 'sms' | 'push' | 'dashboard'
  recipients: string[]
  subject: string
  message: string
  urgency: 'low' | 'medium' | 'high' | 'critical'
  channels: string[]
}

export interface ReportAction {
  reportType:
    | 'temperature_log'
    | 'compliance_summary'
    | 'task_status'
    | 'custom'
  format: 'pdf' | 'excel' | 'csv'
  recipients: string[]
  schedule?: ScheduleTrigger
}

export interface UpdateDataAction {
  target: string
  operation: 'create' | 'update' | 'delete'
  data: Record<string, any>
}

export interface WorkflowAction {
  workflowId: string
  parameters: Record<string, any>
}

export interface AutomationExecution {
  id: string
  ruleId: string
  triggeredAt: Date
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  progress: number
  results: AutomationResult[]
  logs: AutomationLog[]
  executionTime: number
  error?: string
}

export interface AutomationResult {
  actionId: string
  actionType: string
  status: 'success' | 'failure' | 'skipped'
  output?: any
  error?: string
  executionTime: number
}

export interface AutomationLog {
  timestamp: Date
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  data?: any
}

/**
 * Workflow Automation Engine
 * Central engine for managing and executing automation workflows
 */
export class WorkflowAutomationEngine {
  private rules: Map<string, AutomationRule> = new Map()
  private executions: Map<string, AutomationExecution> = new Map()
  private scheduledJobs: Map<string, NodeJS.Timeout> = new Map()
  private eventListeners: Map<string, Function[]> = new Map()

  /**
   * Initialize automation engine
   */
  public async initialize(): Promise<void> {
    console.log('🤖 Initializing B.10.3 Workflow Automation Engine...')

    try {
      // Load existing automation rules
      await this.loadAutomationRules()

      // Setup event listeners
      await this.setupEventListeners()

      // Schedule recurring jobs
      await this.scheduleJobs()

      console.log('✅ Workflow Automation Engine initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize automation engine:', error)
      throw error
    }
  }

  /**
   * Create new automation rule
   */
  public async createAutomationRule(
    rule: Omit<
      AutomationRule,
      'id' | 'createdAt' | 'executionCount' | 'successRate'
    >
  ): Promise<AutomationRule> {
    const newRule: AutomationRule = {
      ...rule,
      id: this.generateId(),
      createdAt: new Date(),
      executionCount: 0,
      successRate: 100,
    }

    this.rules.set(newRule.id, newRule)

    // Setup schedule if trigger is schedule-based
    if (newRule.trigger.type === 'schedule' && newRule.enabled) {
      await this.scheduleRule(newRule)
    }

    console.log(`🤖 Automation rule created: ${newRule.name}`)
    return newRule
  }

  /**
   * Execute automation rule manually
   */
  public async executeRule(
    ruleId: string,
    context?: Record<string, any>
  ): Promise<AutomationExecution> {
    const rule = this.rules.get(ruleId)
    if (!rule) {
      throw new Error(`Automation rule not found: ${ruleId}`)
    }

    if (!rule.enabled) {
      throw new Error(`Automation rule is disabled: ${rule.name}`)
    }

    const execution: AutomationExecution = {
      id: this.generateId(),
      ruleId: rule.id,
      triggeredAt: new Date(),
      status: 'pending',
      progress: 0,
      results: [],
      logs: [],
      executionTime: 0,
    }

    this.executions.set(execution.id, execution)

    try {
      await this.runExecution(execution, rule, context)
    } catch (error) {
      execution.status = 'failed'
      execution.error = error instanceof Error ? error.message : 'Unknown error'
      this.logExecution(
        execution,
        'error',
        `Execution failed: ${execution.error}`
      )
    }

    return execution
  }

  /**
   * Get automation rules for company
   */
  public getAutomationRules(companyId?: string): AutomationRule[] {
    const rules = Array.from(this.rules.values())
    return companyId
      ? rules.filter(rule => rule.companyId === companyId)
      : rules
  }

  /**
   * Get execution history
   */
  public getExecutionHistory(ruleId?: string): AutomationExecution[] {
    const executions = Array.from(this.executions.values())
    return ruleId
      ? executions.filter(exec => exec.ruleId === ruleId)
      : executions
  }

  /**
   * Update automation rule
   */
  public async updateAutomationRule(
    ruleId: string,
    updates: Partial<AutomationRule>
  ): Promise<AutomationRule> {
    const rule = this.rules.get(ruleId)
    if (!rule) {
      throw new Error(`Automation rule not found: ${ruleId}`)
    }

    const updatedRule = { ...rule, ...updates }
    this.rules.set(ruleId, updatedRule)

    // Reschedule if schedule changed
    if (updates.trigger || updates.enabled !== undefined) {
      this.unscheduleRule(ruleId)
      if (updatedRule.trigger.type === 'schedule' && updatedRule.enabled) {
        await this.scheduleRule(updatedRule)
      }
    }

    console.log(`🤖 Automation rule updated: ${updatedRule.name}`)
    return updatedRule
  }

  /**
   * Delete automation rule
   */
  public async deleteAutomationRule(ruleId: string): Promise<void> {
    const rule = this.rules.get(ruleId)
    if (!rule) {
      throw new Error(`Automation rule not found: ${ruleId}`)
    }

    this.unscheduleRule(ruleId)
    this.rules.delete(ruleId)

    console.log(`🤖 Automation rule deleted: ${rule.name}`)
  }

  /**
   * Trigger event-based automation
   */
  public async triggerEvent(
    eventType: string,
    data: any,
    source: string
  ): Promise<void> {
    const eventRules = Array.from(this.rules.values()).filter(
      rule =>
        rule.enabled &&
        rule.trigger.type === 'event' &&
        (rule.trigger.config as EventTrigger).eventType === eventType
    )

    for (const rule of eventRules) {
      try {
        await this.executeRule(rule.id, { eventData: data, source })
      } catch (error) {
        console.error(`Failed to execute event rule ${rule.name}:`, error)
      }
    }
  }

  /**
   * Check threshold-based automations
   */
  public async checkThresholds(metrics: Record<string, number>): Promise<void> {
    const thresholdRules = Array.from(this.rules.values()).filter(
      rule => rule.enabled && rule.trigger.type === 'threshold'
    )

    for (const rule of thresholdRules) {
      const trigger = rule.trigger.config as ThresholdTrigger
      const value = metrics[trigger.metric]

      if (value !== undefined && this.evaluateThreshold(value, trigger)) {
        try {
          await this.executeRule(rule.id, {
            metrics,
            triggeredMetric: trigger.metric,
            triggeredValue: value,
          })
        } catch (error) {
          console.error(`Failed to execute threshold rule ${rule.name}:`, error)
        }
      }
    }
  }

  /**
   * Get automation statistics
   */
  public getAutomationStats(): {
    totalRules: number
    activeRules: number
    totalExecutions: number
    successRate: number
    avgExecutionTime: number
  } {
    const rules = Array.from(this.rules.values())
    const executions = Array.from(this.executions.values())

    const successfulExecutions = executions.filter(
      exec => exec.status === 'completed'
    )
    const avgExecutionTime =
      executions.length > 0
        ? executions.reduce((sum, exec) => sum + exec.executionTime, 0) /
          executions.length
        : 0

    return {
      totalRules: rules.length,
      activeRules: rules.filter(rule => rule.enabled).length,
      totalExecutions: executions.length,
      successRate:
        executions.length > 0
          ? (successfulExecutions.length / executions.length) * 100
          : 100,
      avgExecutionTime,
    }
  }

  /**
   * Stop automation engine
   */
  public async stop(): Promise<void> {
    // Clear all scheduled jobs
    for (const timeout of this.scheduledJobs.values()) {
      clearTimeout(timeout)
    }
    this.scheduledJobs.clear()

    // Clear event listeners
    this.eventListeners.clear()

    console.log('🤖 Workflow Automation Engine stopped')
  }

  /**
   * Private helper methods
   */
  private async loadAutomationRules(): Promise<void> {
    // In a real implementation, this would load from database
    console.log('📋 Loading automation rules from database...')

    // Create some default automation rules
    await this.createDefaultRules()
  }

  private async createDefaultRules(): Promise<void> {
    // Daily temperature monitoring automation
    const temperatureRule: Omit<
      AutomationRule,
      'id' | 'createdAt' | 'executionCount' | 'successRate'
    > = {
      name: 'Daily Temperature Monitoring',
      description: 'Automatic daily temperature compliance check',
      trigger: {
        type: 'schedule',
        config: {
          frequency: 'daily',
          time: '08:00',
          days: [1, 2, 3, 4, 5], // Weekdays only
        } as ScheduleTrigger,
      },
      conditions: [
        {
          type: 'system',
          config: {
            systemStatus: 'healthy',
          } as SystemCondition,
        },
      ],
      actions: [
        {
          type: 'generate_report',
          config: {
            reportType: 'temperature_log',
            format: 'pdf',
            recipients: ['manager@company.com'],
          } as ReportAction,
        },
      ],
      enabled: true,
      priority: 'medium',
      companyId: 'default',
      createdBy: 'system',
    }

    await this.createAutomationRule(temperatureRule)

    // Critical temperature alert automation
    const criticalTempRule: Omit<
      AutomationRule,
      'id' | 'createdAt' | 'executionCount' | 'successRate'
    > = {
      name: 'Critical Temperature Alert',
      description: 'Immediate alerts for critical temperature readings',
      trigger: {
        type: 'threshold',
        config: {
          metric: 'temperature',
          operator: '>',
          value: 8, // Above 8°C for refrigeration
          duration: 0, // Immediate
        } as ThresholdTrigger,
      },
      conditions: [],
      actions: [
        {
          type: 'send_notification',
          config: {
            type: 'push',
            recipients: ['manager', 'supervisor'],
            subject: 'CRITICAL: Temperature Threshold Exceeded',
            message: 'Immediate attention required for temperature control',
            urgency: 'critical',
            channels: ['email', 'sms', 'push'],
          } as NotificationAction,
        },
        {
          type: 'create_task',
          config: {
            title: 'URGENT: Temperature Control Action Required',
            description:
              'Critical temperature reading detected - immediate investigation required',
            priority: 'critical',
            category: 'temperature',
            assignedTo: 'supervisor',
          } as CreateTaskAction,
        },
      ],
      enabled: true,
      priority: 'critical',
      companyId: 'default',
      createdBy: 'system',
    }

    await this.createAutomationRule(criticalTempRule)
  }

  private async setupEventListeners(): Promise<void> {
    console.log('🎯 Setting up automation event listeners...')
    // In a real implementation, this would setup listeners for database events, websockets, etc.
  }

  private async scheduleJobs(): Promise<void> {
    console.log('⏰ Scheduling automation jobs...')

    for (const rule of this.rules.values()) {
      if (rule.enabled && rule.trigger.type === 'schedule') {
        await this.scheduleRule(rule)
      }
    }
  }

  private async scheduleRule(rule: AutomationRule): Promise<void> {
    const trigger = rule.trigger.config as ScheduleTrigger
    const now = new Date()
    const nextRun = this.calculateNextRun(trigger, now)
    const delay = nextRun.getTime() - now.getTime()

    const timeout = setTimeout(async () => {
      try {
        await this.executeRule(rule.id, { scheduledExecution: true })
        // Reschedule for next run
        await this.scheduleRule(rule)
      } catch (error) {
        console.error(
          `Scheduled execution failed for rule ${rule.name}:`,
          error
        )
      }
    }, delay)

    this.scheduledJobs.set(rule.id, timeout)
    console.log(`⏰ Scheduled rule '${rule.name}' for ${nextRun.toISOString()}`)
  }

  private unscheduleRule(ruleId: string): void {
    const timeout = this.scheduledJobs.get(ruleId)
    if (timeout) {
      clearTimeout(timeout)
      this.scheduledJobs.delete(ruleId)
    }
  }

  private calculateNextRun(trigger: ScheduleTrigger, from: Date): Date {
    const next = new Date(from)
    const [hours, minutes] = trigger.time.split(':').map(Number)

    next.setHours(hours, minutes, 0, 0)

    // If time has passed today, schedule for tomorrow
    if (next <= from) {
      next.setDate(next.getDate() + 1)
    }

    // Handle weekly scheduling
    if (trigger.frequency === 'weekly' && trigger.days) {
      while (!trigger.days.includes(next.getDay())) {
        next.setDate(next.getDate() + 1)
      }
    }

    return next
  }

  private async runExecution(
    execution: AutomationExecution,
    rule: AutomationRule,
    context?: Record<string, any>
  ): Promise<void> {
    const startTime = Date.now()
    execution.status = 'running'

    this.logExecution(
      execution,
      'info',
      `Starting execution of rule: ${rule.name}`
    )

    try {
      // Check conditions
      if (!(await this.evaluateConditions(rule.conditions, context))) {
        execution.status = 'completed'
        execution.progress = 100
        this.logExecution(
          execution,
          'info',
          'Execution skipped - conditions not met'
        )
        return
      }

      // Execute actions
      for (let i = 0; i < rule.actions.length; i++) {
        const action = rule.actions[i]
        execution.progress = (i / rule.actions.length) * 100

        try {
          const result = await this.executeAction(action, context, rule)
          execution.results.push(result)
          this.logExecution(
            execution,
            'info',
            `Action ${action.type} completed successfully`
          )
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error'
          execution.results.push({
            actionId: this.generateId(),
            actionType: action.type,
            status: 'failure',
            error: errorMessage,
            executionTime: 0,
          })
          this.logExecution(
            execution,
            'error',
            `Action ${action.type} failed: ${errorMessage}`
          )

          // Continue with other actions unless it's a critical failure
          if (rule.priority === 'critical') {
            throw error
          }
        }
      }

      execution.status = 'completed'
      execution.progress = 100

      // Update rule statistics
      rule.executionCount++
      rule.lastExecuted = new Date()
      const successCount = execution.results.filter(
        r => r.status === 'success'
      ).length
      rule.successRate = (successCount / execution.results.length) * 100
    } catch (error) {
      execution.status = 'failed'
      execution.error = error instanceof Error ? error.message : 'Unknown error'
      this.logExecution(
        execution,
        'error',
        `Execution failed: ${execution.error}`
      )
    } finally {
      execution.executionTime = Date.now() - startTime
      this.logExecution(
        execution,
        'info',
        `Execution completed in ${execution.executionTime}ms`
      )
    }
  }

  private async evaluateConditions(
    conditions: AutomationCondition[],
    context?: Record<string, any>
  ): Promise<boolean> {
    if (conditions.length === 0) return true

    for (const condition of conditions) {
      if (!(await this.evaluateCondition(condition, context))) {
        return false
      }
    }
    return true
  }

  private async evaluateCondition(
    condition: AutomationCondition,
    context?: Record<string, any>
  ): Promise<boolean> {
    switch (condition.type) {
      case 'time':
        return this.evaluateTimeCondition(condition.config as TimeCondition)
      case 'system':
        return this.evaluateSystemCondition(condition.config as SystemCondition)
      case 'data':
        return this.evaluateDataCondition(
          condition.config as DataCondition,
          context
        )
      case 'user':
        return this.evaluateUserCondition(
          condition.config as UserCondition,
          context
        )
      default:
        return true
    }
  }

  private evaluateTimeCondition(condition: TimeCondition): boolean {
    const now = new Date()
    const currentTime = now.getHours() * 100 + now.getMinutes()
    const currentDay = now.getDay()

    if (condition.days && !condition.days.includes(currentDay)) {
      return false
    }

    if (condition.startTime) {
      const [hours, minutes] = condition.startTime.split(':').map(Number)
      const startTime = hours * 100 + minutes
      if (currentTime < startTime) return false
    }

    if (condition.endTime) {
      const [hours, minutes] = condition.endTime.split(':').map(Number)
      const endTime = hours * 100 + minutes
      if (currentTime > endTime) return false
    }

    return true
  }

  private evaluateSystemCondition(condition: SystemCondition): boolean {
    // In a real implementation, this would check actual system status
    return condition.systemStatus === 'healthy'
  }

  private evaluateDataCondition(
    condition: DataCondition,
    context?: Record<string, any>
  ): boolean {
    if (!context) return false

    const value = context[condition.field]
    if (value === undefined) return false

    switch (condition.operator) {
      case '>':
        return value > condition.value
      case '<':
        return value < condition.value
      case '>=':
        return value >= condition.value
      case '<=':
        return value <= condition.value
      case '==':
        return value === condition.value
      case '!=':
        return value !== condition.value
      default:
        return false
    }
  }

  private evaluateUserCondition(
    _condition: UserCondition,
    _context?: Record<string, any>
  ): boolean {
    // In a real implementation, this would check user roles, departments, etc.
    return true
  }

  private evaluateThreshold(value: number, trigger: ThresholdTrigger): boolean {
    switch (trigger.operator) {
      case '>':
        return value > trigger.value
      case '<':
        return value < trigger.value
      case '>=':
        return value >= trigger.value
      case '<=':
        return value <= trigger.value
      case '==':
        return value === trigger.value
      case '!=':
        return value !== trigger.value
      default:
        return false
    }
  }

  private async executeAction(
    action: AutomationAction,
    context?: Record<string, any>,
    _rule?: AutomationRule
  ): Promise<AutomationResult> {
    const startTime = Date.now()
    const actionId = this.generateId()

    try {
      let output: any

      switch (action.type) {
        case 'create_task':
          output = await this.executeCreateTaskAction(
            action.config as CreateTaskAction,
            context
          )
          break
        case 'send_notification':
          output = await this.executeNotificationAction(
            action.config as NotificationAction,
            context
          )
          break
        case 'generate_report':
          output = await this.executeReportAction(
            action.config as ReportAction,
            context
          )
          break
        case 'update_data':
          output = await this.executeUpdateDataAction(
            action.config as UpdateDataAction,
            context
          )
          break
        case 'trigger_workflow':
          output = await this.executeWorkflowAction(
            action.config as WorkflowAction,
            context
          )
          break
        default:
          throw new Error(`Unknown action type: ${action.type}`)
      }

      return {
        actionId,
        actionType: action.type,
        status: 'success',
        output,
        executionTime: Date.now() - startTime,
      }
    } catch (error) {
      return {
        actionId,
        actionType: action.type,
        status: 'failure',
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: Date.now() - startTime,
      }
    }
  }

  private async executeCreateTaskAction(
    config: CreateTaskAction,
    _context?: Record<string, any>
  ): Promise<any> {
    console.log(`📋 Creating automated task: ${config.title}`)

    // In a real implementation, this would create a task in the database
    const task = {
      id: this.generateId(),
      title: config.title,
      description: config.description,
      assignedTo: config.assignedTo,
      department: config.department,
      priority: config.priority,
      dueDate: config.dueDate,
      category: config.category,
      checklist: config.checklist || [],
      createdAt: new Date(),
      createdBy: 'automation-engine',
      status: 'pending',
    }

    return task
  }

  private async executeNotificationAction(
    config: NotificationAction,
    _context?: Record<string, any>
  ): Promise<any> {
    console.log(`📧 Sending automated notification: ${config.subject}`)

    // In a real implementation, this would send actual notifications
    const notification = {
      id: this.generateId(),
      type: config.type,
      recipients: config.recipients,
      subject: config.subject,
      message: config.message,
      urgency: config.urgency,
      channels: config.channels,
      sentAt: new Date(),
      status: 'sent',
    }

    return notification
  }

  private async executeReportAction(
    config: ReportAction,
    _context?: Record<string, any>
  ): Promise<any> {
    console.log(`📊 Generating automated report: ${config.reportType}`)

    // In a real implementation, this would generate actual reports
    const report = {
      id: this.generateId(),
      type: config.reportType,
      format: config.format,
      recipients: config.recipients,
      generatedAt: new Date(),
      status: 'generated',
      fileSize: Math.floor(Math.random() * 1000000), // Mock file size
      downloadUrl: `/reports/${this.generateId()}.${config.format}`,
    }

    return report
  }

  private async executeUpdateDataAction(
    config: UpdateDataAction,
    _context?: Record<string, any>
  ): Promise<any> {
    console.log(
      `🔄 Executing data update: ${config.operation} on ${config.target}`
    )

    // In a real implementation, this would perform actual data operations
    const result = {
      target: config.target,
      operation: config.operation,
      data: config.data,
      updatedAt: new Date(),
      status: 'completed',
    }

    return result
  }

  private async executeWorkflowAction(
    config: WorkflowAction,
    _context?: Record<string, any>
  ): Promise<any> {
    console.log(`🔗 Triggering workflow: ${config.workflowId}`)

    // In a real implementation, this would trigger another workflow
    const result = {
      workflowId: config.workflowId,
      parameters: config.parameters,
      triggeredAt: new Date(),
      status: 'triggered',
    }

    return result
  }

  private logExecution(
    execution: AutomationExecution,
    level: 'info' | 'warn' | 'error' | 'debug',
    message: string,
    data?: any
  ): void {
    const log: AutomationLog = {
      timestamp: new Date(),
      level,
      message,
      data,
    }

    execution.logs.push(log)
    console.log(`[${level.toUpperCase()}] ${message}`)
  }

  private generateId(): string {
    return `auto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

// Export singleton instance
export const workflowAutomationEngine = new WorkflowAutomationEngine()

export default workflowAutomationEngine
