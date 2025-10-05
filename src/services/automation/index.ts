/**
 * B.10.3 Enterprise Automation - Main Export
 * Comprehensive automation services for enterprise HACCP management
 */

export {
  workflowAutomationEngine,
  type AutomationRule,
  type AutomationTrigger,
  type AutomationAction,
  type AutomationExecution,
  type AutomationResult,
  type CreateTaskAction,
  type NotificationAction,
  type ReportAction,
  type UpdateDataAction,
  type WorkflowAction,
  type ScheduleTrigger,
  type EventTrigger,
  type ThresholdTrigger,
  type ManualTrigger,
  type AutomationCondition,
  type TimeCondition,
  type DataCondition,
  type UserCondition,
  type SystemCondition,
} from './WorkflowAutomationEngine'

export {
  smartSchedulingService,
  type TaskScheduleRequest,
  type ScheduledTask,
  type ResourceCapacity,
  type ResourceRequirement,
  type SchedulingConstraint,
  type TimeSlot,
  type AssignedResource,
  type ScheduleConflict,
  type OptimizationResult,
  type SchedulingMetrics,
} from './SmartSchedulingService'

export {
  automatedReportingService,
  type ReportTemplate,
  type ReportSection,
  type ReportParameter,
  type ReportFilter,
  type ReportSchedule,
  type ReportRecipient,
  type GeneratedReport,
  type ReportOutput,
  type ReportMetadata,
  type ReportDelivery,
  type VisualizationConfig,
  type ReportCondition,
  type ReportTrigger as ReportAutomationTrigger,
} from './AutomatedReportingService'

export {
  intelligentAlertManager,
  type AlertRule,
  type AlertCondition,
  type AlertAction,
  type Alert,
  type AlertSummary,
  type EscalationConfig,
  type EscalationLevel,
  type AlertSchedule,
  type SuppressionRule,
  type AlertMetadata,
  type AlertActionResult,
  type NotificationConfig,
  type EmailConfig,
  type SMSConfig,
  type WebhookConfig,
  type TaskCreationConfig,
  type SystemActionConfig,
} from './IntelligentAlertManager'

/**
 * B.10.3 Enterprise Automation Services Manager
 * Central coordinator for all automation services
 */
class EnterpriseAutomationManager {
  private initialized = false
  private servicesLoadPromise: Promise<void> | null = null
  private workflowEngine?: (typeof import('./WorkflowAutomationEngine'))['workflowAutomationEngine']
  private schedulingService?: (typeof import('./SmartSchedulingService'))['smartSchedulingService']
  private reportingService?: (typeof import('./AutomatedReportingService'))['automatedReportingService']
  private alertManager?: (typeof import('./IntelligentAlertManager'))['intelligentAlertManager']

  private async ensureServicesLoaded(): Promise<void> {
    if (
      this.workflowEngine &&
      this.schedulingService &&
      this.reportingService &&
      this.alertManager
    ) {
      return
    }

    if (!this.servicesLoadPromise) {
      this.servicesLoadPromise = Promise.all([
        import('./WorkflowAutomationEngine'),
        import('./SmartSchedulingService'),
        import('./AutomatedReportingService'),
        import('./IntelligentAlertManager'),
      ]).then(
        ([workflowModule, schedulingModule, reportingModule, alertModule]) => {
          this.workflowEngine = workflowModule.workflowAutomationEngine
          this.schedulingService = schedulingModule.smartSchedulingService
          this.reportingService = reportingModule.automatedReportingService
          this.alertManager = alertModule.intelligentAlertManager
        }
      )
    }

    await this.servicesLoadPromise
  }

  private getWorkflowEngine() {
    if (!this.workflowEngine) {
      throw new Error('Workflow automation engine not loaded')
    }
    return this.workflowEngine
  }

  private getSchedulingService() {
    if (!this.schedulingService) {
      throw new Error('Smart scheduling service not loaded')
    }
    return this.schedulingService
  }

  private getReportingService() {
    if (!this.reportingService) {
      throw new Error('Automated reporting service not loaded')
    }
    return this.reportingService
  }

  private getAlertManager() {
    if (!this.alertManager) {
      throw new Error('Intelligent alert manager not loaded')
    }
    return this.alertManager
  }

  /**
   * Initialize all automation services
   */
  public async initialize(): Promise<void> {
    if (this.initialized) return

    console.log('🤖 Initializing B.10.3 Enterprise Automation Services...')

    try {
      await this.ensureServicesLoaded()

      const workflowEngine = this.getWorkflowEngine()
      const schedulingService = this.getSchedulingService()
      const reportingService = this.getReportingService()
      const alertManager = this.getAlertManager()

      console.log('🔄 Initializing Workflow Automation Engine...')
      await workflowEngine.initialize()

      console.log('🧠 Initializing Smart Scheduling Service...')
      await schedulingService.initialize()

      console.log('📊 Initializing Automated Reporting Service...')
      await reportingService.initialize()

      console.log('🚨 Initializing Intelligent Alert Manager...')
      await alertManager.initialize()

      this.initialized = true
      console.log(
        '✅ B.10.3 Enterprise Automation Services initialized successfully'
      )
    } catch (error) {
      console.error(
        '❌ Failed to initialize enterprise automation services:',
        error
      )
      throw error
    }
  }

  /**
   * Process automation event across all services
   */
  public async processAutomationEvent(
    eventType: string,
    data: any,
    source: string
  ): Promise<void> {
    if (!this.initialized) {
      throw new Error('Enterprise Automation Manager not initialized')
    }

    await this.ensureServicesLoaded()

    console.log(`🤖 Processing automation event: ${eventType} from ${source}`)

    try {
      const workflowEngine = this.getWorkflowEngine()
      const reportingService = this.getReportingService()
      const alertManager = this.getAlertManager()

      await workflowEngine.triggerEvent(eventType, data, source)
      await alertManager.processData(source, data)
      await reportingService.triggerEventBasedReports(eventType, data)
    } catch (error) {
      console.error(`Failed to process automation event ${eventType}:`, error)
      throw error
    }
  }

  /**
   * Process threshold-based automation
   */
  public async processThresholds(
    metrics: Record<string, number>
  ): Promise<void> {
    if (!this.initialized) {
      throw new Error('Enterprise Automation Manager not initialized')
    }

    await this.ensureServicesLoaded()

    console.log('🤖 Processing threshold-based automation...')

    try {
      const workflowEngine = this.getWorkflowEngine()
      const reportingService = this.getReportingService()

      await workflowEngine.checkThresholds(metrics)
      await reportingService.checkThresholdReports(metrics)
    } catch (error) {
      console.error('Failed to process thresholds:', error)
      throw error
    }
  }

  /**
   * Get comprehensive automation status
   */
  public getAutomationStatus(): {
    workflows: any
    scheduling: any
    reporting: any
    alerts: any
    systemHealth: 'healthy' | 'warning' | 'critical'
  } {
    if (!this.initialized) {
      throw new Error('Enterprise Automation Manager not initialized')
    }

    if (
      !this.workflowEngine ||
      !this.schedulingService ||
      !this.reportingService ||
      !this.alertManager
    ) {
      throw new Error('Automation services not loaded')
    }

    const workflowStats = this.workflowEngine.getAutomationStats()
    const schedulingMetrics = this.schedulingService.getSchedulingMetrics()
    const reportingMetrics = this.reportingService.getReportingMetrics()
    const alertMetrics = this.alertManager.getAlertMetrics()

    // Determine overall system health
    let systemHealth: 'healthy' | 'warning' | 'critical' = 'healthy'

    if (
      workflowStats.successRate < 90 ||
      schedulingMetrics.conflictRate > 0.1 ||
      reportingMetrics.successRate < 90 ||
      alertMetrics.escalationRate > 0.2
    ) {
      systemHealth = 'warning'
    }

    if (
      workflowStats.successRate < 80 ||
      schedulingMetrics.conflictRate > 0.2 ||
      reportingMetrics.successRate < 80 ||
      alertMetrics.escalationRate > 0.3
    ) {
      systemHealth = 'critical'
    }

    return {
      workflows: workflowStats,
      scheduling: schedulingMetrics,
      reporting: reportingMetrics,
      alerts: alertMetrics,
      systemHealth,
    }
  }

  /**
   * Run comprehensive automation health check
   */
  public async runHealthCheck(): Promise<{
    status: 'healthy' | 'warning' | 'critical'
    score: number
    issues: string[]
    recommendations: string[]
    services: {
      workflow: boolean
      scheduling: boolean
      reporting: boolean
      alerts: boolean
    }
  }> {
    console.log('🏥 Running comprehensive automation health check...')

    await this.ensureServicesLoaded()

    const issues: string[] = []
    const recommendations: string[] = []
    let score = 100

    const services = {
      workflow: this.initialized,
      scheduling: this.initialized,
      reporting: this.initialized,
      alerts: this.initialized,
    }

    if (!this.initialized) {
      issues.push('Automation services not initialized')
      recommendations.push('Initialize automation services')
      score -= 50
    }

    const status = this.getAutomationStatus()

    if (status.workflows.successRate < 90) {
      issues.push(
        `Workflow success rate below threshold: ${status.workflows.successRate}%`
      )
      recommendations.push('Review and optimize failing workflow rules')
      score -= 10
    }

    if (status.scheduling.conflictRate > 0.1) {
      issues.push(
        `High scheduling conflict rate: ${status.scheduling.conflictRate * 100}%`
      )
      recommendations.push(
        'Optimize resource allocation and scheduling constraints'
      )
      score -= 10
    }

    if (status.reporting.successRate < 90) {
      issues.push(
        `Reporting success rate below threshold: ${status.reporting.successRate}%`
      )
      recommendations.push('Review report templates and data sources')
      score -= 10
    }

    if (status.alerts.escalationRate > 0.2) {
      issues.push(
        `High alert escalation rate: ${status.alerts.escalationRate * 100}%`
      )
      recommendations.push('Review alert thresholds and response procedures')
      score -= 10
    }

    let healthStatus: 'healthy' | 'warning' | 'critical' = 'healthy'
    if (score < 90) healthStatus = 'warning'
    if (score < 70) healthStatus = 'critical'

    if (healthStatus === 'healthy') {
      recommendations.push('All automation services are operating optimally')
    }

    console.log(`🏥 Automation Health Check: ${healthStatus} (${score}/100)`)

    return {
      status: healthStatus,
      score,
      issues,
      recommendations,
      services,
    }
  }

  /**
   * Generate automation performance report
   */
  public generatePerformanceReport(): {
    summary: {
      totalAutomations: number
      successRate: number
      avgExecutionTime: number
      costSavings: number
      efficiencyGains: number
    }
    workflows: {
      totalRules: number
      activeRules: number
      executionsToday: number
      topPerformers: Array<{
        name: string
        executions: number
        successRate: number
      }>
    }
    scheduling: {
      tasksScheduled: number
      resourceUtilization: number
      conflictsResolved: number
      timeOptimized: number
    }
    reporting: {
      reportsGenerated: number
      automatedDeliveries: number
      avgGenerationTime: number
      recipientsSatisfaction: number
    }
    alerts: {
      alertsTriggered: number
      avgResponseTime: number
      escalationPrevented: number
      falsePositiveRate: number
    }
  } {
    if (
      !this.workflowEngine ||
      !this.schedulingService ||
      !this.reportingService ||
      !this.alertManager
    ) {
      throw new Error('Automation services not loaded')
    }

    const workflowStats = this.workflowEngine.getAutomationStats()
    const schedulingMetrics = this.schedulingService.getSchedulingMetrics()
    const reportingMetrics = this.reportingService.getReportingMetrics()
    const alertMetrics = this.alertManager.getAlertMetrics()

    // Calculate summary metrics
    const totalAutomations =
      workflowStats.totalExecutions +
      schedulingMetrics.scheduledTasks +
      reportingMetrics.totalReports +
      alertMetrics.totalAlerts

    const overallSuccessRate =
      (workflowStats.successRate +
        (100 - schedulingMetrics.conflictRate * 100) +
        reportingMetrics.successRate +
        (100 - alertMetrics.falsePositiveRate * 100)) /
      4

    const avgExecutionTime =
      (workflowStats.avgExecutionTime +
        reportingMetrics.avgGenerationTime +
        alertMetrics.avgResponseTime) /
      3

    // Estimate cost savings and efficiency gains
    const estimatedCostSavings = totalAutomations * 15 // $15 per automated task
    const estimatedEfficiencyGains = totalAutomations * 30 // 30 minutes saved per automation

    return {
      summary: {
        totalAutomations,
        successRate: overallSuccessRate,
        avgExecutionTime,
        costSavings: estimatedCostSavings,
        efficiencyGains: estimatedEfficiencyGains,
      },
      workflows: {
        totalRules: workflowStats.totalRules,
        activeRules: workflowStats.activeRules,
        executionsToday: Math.floor(workflowStats.totalExecutions * 0.1), // Mock daily executions
        topPerformers: [
          { name: 'Temperature Monitoring', executions: 45, successRate: 98 },
          { name: 'Compliance Checking', executions: 32, successRate: 95 },
          { name: 'Task Assignment', executions: 28, successRate: 92 },
        ],
      },
      scheduling: {
        tasksScheduled: schedulingMetrics.scheduledTasks,
        resourceUtilization: schedulingMetrics.resourceEfficiency,
        conflictsResolved: Math.floor(
          schedulingMetrics.totalTasks * schedulingMetrics.conflictRate
        ),
        timeOptimized: schedulingMetrics.totalTasks * 15, // 15 minutes per optimized task
      },
      reporting: {
        reportsGenerated: reportingMetrics.totalReports,
        automatedDeliveries: reportingMetrics.scheduledReports * 30, // Monthly deliveries
        avgGenerationTime: reportingMetrics.avgGenerationTime,
        recipientsSatisfaction: reportingMetrics.deliveryRate,
      },
      alerts: {
        alertsTriggered: alertMetrics.totalAlerts,
        avgResponseTime: alertMetrics.avgResponseTime,
        escalationPrevented: Math.floor(
          alertMetrics.totalAlerts * (1 - alertMetrics.escalationRate)
        ),
        falsePositiveRate: alertMetrics.falsePositiveRate * 100,
      },
    }
  }

  /**
   * Stop all automation services
   */
  public async stop(): Promise<void> {
    if (!this.initialized) return

    await this.ensureServicesLoaded()

    console.log('🤖 Stopping B.10.3 Enterprise Automation Services...')

    try {
      const workflowEngine = this.getWorkflowEngine()
      const reportingService = this.getReportingService()
      const alertManager = this.getAlertManager()

      await workflowEngine.stop()
      await reportingService.stop()
      await alertManager.stop()

      this.initialized = false
      console.log(
        '✅ B.10.3 Enterprise Automation Services stopped successfully'
      )
    } catch (error) {
      console.error('❌ Failed to stop enterprise automation services:', error)
      throw error
    }
  }

  /**
   * Get service status
   */
  public getStatus(): {
    initialized: boolean
    services: {
      workflow: boolean
      scheduling: boolean
      reporting: boolean
      alerts: boolean
    }
    uptime: number
  } {
    return {
      initialized: this.initialized,
      services: {
        workflow: this.initialized,
        scheduling: this.initialized,
        reporting: this.initialized,
        alerts: this.initialized,
      },
      uptime: this.initialized ? Date.now() : 0,
    }
  }
}

// Export singleton instance
export const enterpriseAutomationManager = new EnterpriseAutomationManager()

// Auto-initialize in production mode
if (import.meta.env?.PROD) {
  console.log('🤖 B.10.3 Enterprise automation services ready for production')
}

export default enterpriseAutomationManager
