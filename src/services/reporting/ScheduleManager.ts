/**
 * ScheduleManager - B.10.2 Advanced Analytics & Reporting
 * Automated report scheduling and delivery system
 */

export interface ScheduleConfig {
  id: string
  reportId: string
  name: string
  description: string
  frequency: ScheduleFrequency
  timezone: string
  enabled: boolean
  recipients: RecipientConfig[]
  deliveryOptions: DeliveryOptions
  conditions: ScheduleCondition[]
  lastRun?: Date
  nextRun: Date
  runCount: number
  errorCount: number
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface ScheduleFrequency {
  type: 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'
  interval?: number // for custom frequency
  dayOfWeek?: number // 0-6 for weekly
  dayOfMonth?: number // 1-31 for monthly
  month?: number // 0-11 for yearly
  time: string // HH:MM format
  customExpression?: string // cron-like expression
}

export interface RecipientConfig {
  id: string
  type: 'email' | 'webhook' | 'dashboard' | 'file'
  address: string
  name?: string
  parameters?: Record<string, any>
  enabled: boolean
}

export interface DeliveryOptions {
  format: 'pdf' | 'excel' | 'csv' | 'json' | 'html'
  compression: boolean
  password?: string
  watermark?: string
  includeCharts: boolean
  includeData: boolean
  pageSize: 'A4' | 'A3' | 'Letter'
  orientation: 'portrait' | 'landscape'
}

export interface ScheduleCondition {
  id: string
  field: string
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains'
  value: any
  logicalOperator?: 'AND' | 'OR'
}

export interface ScheduleExecution {
  id: string
  scheduleId: string
  startTime: Date
  endTime?: Date
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  reportUrl?: string
  deliveryStatus: DeliveryStatus[]
  error?: string
  metadata: Record<string, any>
}

export interface DeliveryStatus {
  recipientId: string
  status: 'pending' | 'sent' | 'failed'
  timestamp: Date
  error?: string
  deliveryId?: string
}

export interface ScheduleStats {
  totalSchedules: number
  activeSchedules: number
  totalExecutions: number
  successfulExecutions: number
  failedExecutions: number
  averageExecutionTime: number
  lastExecutionTime?: Date
}

/**
 * Schedule Manager Service for Report Automation
 */
export class ScheduleManager {
  private schedules: Map<string, ScheduleConfig> = new Map()
  private executions: Map<string, ScheduleExecution> = new Map()
  private executionQueue: string[] = []
  private isInitialized = false
  private schedulerInterval: ReturnType<typeof setInterval> | null = null

  /**
   * Initialize the schedule manager
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      await this.loadSchedules()
      this.startScheduler()
      console.log('⏰ Schedule manager initialized - B.10.2 Advanced Analytics')
      this.isInitialized = true
    } catch (error) {
      console.error('Failed to initialize schedule manager:', error)
      throw error
    }
  }

  /**
   * Create a new schedule
   */
  public createSchedule(
    reportId: string,
    name: string,
    description: string,
    frequency: ScheduleFrequency,
    recipients: RecipientConfig[],
    deliveryOptions: DeliveryOptions,
    createdBy: string,
    timezone: string = 'UTC'
  ): ScheduleConfig {
    const schedule: ScheduleConfig = {
      id: this.generateScheduleId(),
      reportId,
      name,
      description,
      frequency,
      timezone,
      enabled: true,
      recipients,
      deliveryOptions,
      conditions: [],
      nextRun: this.calculateNextRun(frequency, timezone),
      runCount: 0,
      errorCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy,
    }

    this.schedules.set(schedule.id, schedule)
    console.log(`⏰ Created schedule: ${name}`)
    return schedule
  }

  /**
   * Update an existing schedule
   */
  public updateSchedule(
    scheduleId: string,
    updates: Partial<ScheduleConfig>
  ): ScheduleConfig {
    const schedule = this.schedules.get(scheduleId)
    if (!schedule) {
      throw new Error(`Schedule not found: ${scheduleId}`)
    }

    const updatedSchedule = {
      ...schedule,
      ...updates,
      updatedAt: new Date(),
    }

    // Recalculate next run if frequency changed
    if (updates.frequency) {
      updatedSchedule.nextRun = this.calculateNextRun(
        updates.frequency,
        updatedSchedule.timezone
      )
    }

    this.schedules.set(scheduleId, updatedSchedule)
    console.log(`⏰ Updated schedule: ${schedule.name}`)
    return updatedSchedule
  }

  /**
   * Delete a schedule
   */
  public deleteSchedule(scheduleId: string): void {
    const schedule = this.schedules.get(scheduleId)
    if (!schedule) {
      throw new Error(`Schedule not found: ${scheduleId}`)
    }

    this.schedules.delete(scheduleId)
    console.log(`⏰ Deleted schedule: ${schedule.name}`)
  }

  /**
   * Enable/disable a schedule
   */
  public toggleSchedule(scheduleId: string, enabled: boolean): void {
    const schedule = this.schedules.get(scheduleId)
    if (!schedule) {
      throw new Error(`Schedule not found: ${scheduleId}`)
    }

    schedule.enabled = enabled
    schedule.updatedAt = new Date()

    console.log(
      `⏰ ${enabled ? 'Enabled' : 'Disabled'} schedule: ${schedule.name}`
    )
  }

  /**
   * Add recipient to a schedule
   */
  public addRecipient(
    scheduleId: string,
    recipient: Omit<RecipientConfig, 'id'>
  ): RecipientConfig {
    const schedule = this.schedules.get(scheduleId)
    if (!schedule) {
      throw new Error(`Schedule not found: ${scheduleId}`)
    }

    const newRecipient: RecipientConfig = {
      id: this.generateRecipientId(),
      ...recipient,
    }

    schedule.recipients.push(newRecipient)
    schedule.updatedAt = new Date()

    console.log(`📧 Added recipient to schedule: ${schedule.name}`)
    return newRecipient
  }

  /**
   * Remove recipient from a schedule
   */
  public removeRecipient(scheduleId: string, recipientId: string): void {
    const schedule = this.schedules.get(scheduleId)
    if (!schedule) {
      throw new Error(`Schedule not found: ${scheduleId}`)
    }

    const recipientIndex = schedule.recipients.findIndex(
      r => r.id === recipientId
    )
    if (recipientIndex === -1) {
      throw new Error(`Recipient not found: ${recipientId}`)
    }

    schedule.recipients.splice(recipientIndex, 1)
    schedule.updatedAt = new Date()

    console.log(`📧 Removed recipient from schedule: ${schedule.name}`)
  }

  /**
   * Execute a schedule immediately
   */
  public async executeSchedule(scheduleId: string): Promise<ScheduleExecution> {
    const schedule = this.schedules.get(scheduleId)
    if (!schedule) {
      throw new Error(`Schedule not found: ${scheduleId}`)
    }

    const execution: ScheduleExecution = {
      id: this.generateExecutionId(),
      scheduleId,
      startTime: new Date(),
      status: 'pending',
      deliveryStatus: [],
      metadata: {},
    }

    this.executions.set(execution.id, execution)
    this.executionQueue.push(execution.id)

    console.log(`⏰ Queued schedule execution: ${schedule.name}`)
    return execution
  }

  /**
   * Get schedule execution history
   */
  public getExecutionHistory(
    scheduleId: string,
    limit: number = 50
  ): ScheduleExecution[] {
    const executions = Array.from(this.executions.values())
      .filter(exec => exec.scheduleId === scheduleId)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(0, limit)

    return executions
  }

  /**
   * Get all schedules
   */
  public getSchedules(): ScheduleConfig[] {
    return Array.from(this.schedules.values())
  }

  /**
   * Get schedule by ID
   */
  public getSchedule(scheduleId: string): ScheduleConfig | null {
    return this.schedules.get(scheduleId) || null
  }

  /**
   * Get schedules for a report
   */
  public getSchedulesForReport(reportId: string): ScheduleConfig[] {
    return Array.from(this.schedules.values()).filter(
      s => s.reportId === reportId
    )
  }

  /**
   * Get schedule statistics
   */
  public getScheduleStats(): ScheduleStats {
    const schedules = Array.from(this.schedules.values())
    const executions = Array.from(this.executions.values())

    const totalExecutions = executions.length
    const successfulExecutions = executions.filter(
      e => e.status === 'completed'
    ).length
    const failedExecutions = executions.filter(
      e => e.status === 'failed'
    ).length
    const averageExecutionTime =
      executions.length > 0
        ? executions
            .filter(e => e.endTime)
            .reduce(
              (sum, e) => sum + (e.endTime!.getTime() - e.startTime.getTime()),
              0
            ) / executions.length
        : 0

    const lastExecution = executions
      .filter(e => e.endTime)
      .sort((a, b) => b.endTime!.getTime() - a.endTime!.getTime())[0]

    return {
      totalSchedules: schedules.length,
      activeSchedules: schedules.filter(s => s.enabled).length,
      totalExecutions,
      successfulExecutions,
      failedExecutions,
      averageExecutionTime,
      lastExecutionTime: lastExecution?.endTime,
    }
  }

  /**
   * Validate schedule configuration
   */
  public validateSchedule(schedule: Partial<ScheduleConfig>): {
    isValid: boolean
    errors: string[]
    warnings: string[]
  } {
    const errors: string[] = []
    const warnings: string[] = []

    // Required fields
    if (!schedule.name) {
      errors.push('Schedule name is required')
    }

    if (!schedule.reportId) {
      errors.push('Report ID is required')
    }

    if (!schedule.frequency) {
      errors.push('Schedule frequency is required')
    }

    if (!schedule.recipients || schedule.recipients.length === 0) {
      errors.push('At least one recipient is required')
    }

    // Validate frequency
    if (schedule.frequency) {
      if (!schedule.frequency.type) {
        errors.push('Frequency type is required')
      }

      if (!schedule.frequency.time) {
        errors.push('Schedule time is required')
      }

      if (
        schedule.frequency.type === 'weekly' &&
        schedule.frequency.dayOfWeek === undefined
      ) {
        errors.push('Day of week is required for weekly frequency')
      }

      if (
        schedule.frequency.type === 'monthly' &&
        schedule.frequency.dayOfMonth === undefined
      ) {
        errors.push('Day of month is required for monthly frequency')
      }
    }

    // Validate recipients
    if (schedule.recipients) {
      schedule.recipients.forEach((recipient, index) => {
        if (!recipient.type) {
          errors.push(`Recipient ${index + 1} type is required`)
        }

        if (!recipient.address) {
          errors.push(`Recipient ${index + 1} address is required`)
        }

        if (
          recipient.type === 'email' &&
          !this.isValidEmail(recipient.address)
        ) {
          errors.push(`Recipient ${index + 1} has invalid email address`)
        }
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  // Private helper methods

  private async loadSchedules(): Promise<void> {
    // Load existing schedules from storage
    console.log('⏰ Loading existing schedules...')
  }

  private startScheduler(): void {
    // Run scheduler every minute
    this.schedulerInterval = setInterval(() => {
      this.checkScheduledExecutions()
    }, 60000) // 1 minute

    console.log('⏰ Scheduler started')
  }

  private checkScheduledExecutions(): void {
    const now = new Date()
    const dueSchedules = Array.from(this.schedules.values()).filter(
      schedule => schedule.enabled && schedule.nextRun <= now
    )

    dueSchedules.forEach(schedule => {
      this.executeSchedule(schedule.id)
      this.updateScheduleNextRun(schedule.id)
    })

    if (dueSchedules.length > 0) {
      console.log(`⏰ Executed ${dueSchedules.length} due schedules`)
    }
  }

  private updateScheduleNextRun(scheduleId: string): void {
    const schedule = this.schedules.get(scheduleId)
    if (!schedule) return

    schedule.nextRun = this.calculateNextRun(
      schedule.frequency,
      schedule.timezone
    )
    schedule.runCount++
    schedule.updatedAt = new Date()
  }

  private calculateNextRun(
    frequency: ScheduleFrequency,
    timezone: string
  ): Date {
    const now = new Date()
    const nextRun = new Date(now)

    switch (frequency.type) {
      case 'once':
        // For one-time schedules, set to a past date to prevent execution
        return new Date(0)

      case 'daily':
        const dailyTime = this.parseTime(frequency.time)
        nextRun.setHours(dailyTime.hours, dailyTime.minutes, 0, 0)
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 1)
        }
        break

      case 'weekly':
        const weeklyTime = this.parseTime(frequency.time)
        const dayOfWeek = frequency.dayOfWeek || 0
        const currentDayOfWeek = nextRun.getDay()
        const daysUntilNext = (dayOfWeek - currentDayOfWeek + 7) % 7

        nextRun.setDate(nextRun.getDate() + daysUntilNext)
        nextRun.setHours(weeklyTime.hours, weeklyTime.minutes, 0, 0)

        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 7)
        }
        break

      case 'monthly':
        const monthlyTime = this.parseTime(frequency.time)
        const dayOfMonth = frequency.dayOfMonth || 1

        nextRun.setDate(dayOfMonth)
        nextRun.setHours(monthlyTime.hours, monthlyTime.minutes, 0, 0)

        if (nextRun <= now) {
          nextRun.setMonth(nextRun.getMonth() + 1)
        }
        break

      case 'yearly':
        const yearlyTime = this.parseTime(frequency.time)
        const month = frequency.month || 0
        const dayOfMonth = frequency.dayOfMonth || 1

        nextRun.setMonth(month)
        nextRun.setDate(dayOfMonth)
        nextRun.setHours(yearlyTime.hours, yearlyTime.minutes, 0, 0)

        if (nextRun <= now) {
          nextRun.setFullYear(nextRun.getFullYear() + 1)
        }
        break

      case 'custom':
        // For custom frequency, use interval in minutes
        const interval = frequency.interval || 60
        nextRun.setTime(now.getTime() + interval * 60000)
        break
    }

    return nextRun
  }

  private parseTime(timeString: string): { hours: number; minutes: number } {
    const [hours, minutes] = timeString.split(':').map(Number)
    return { hours: hours || 0, minutes: minutes || 0 }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  private generateScheduleId(): string {
    return `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateRecipientId(): string {
    return `recipient_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateExecutionId(): string {
    return `execution_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Cleanup method
   */
  public destroy(): void {
    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval)
      this.schedulerInterval = null
    }
    console.log('⏰ Schedule manager destroyed')
  }
}

// Export singleton instance
export const scheduleManager = new ScheduleManager()

export default scheduleManager
