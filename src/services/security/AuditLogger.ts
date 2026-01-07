/**
 * B.9.1 Enterprise Audit Logger
 * Comprehensive audit logging for HACCP compliance and security tracking
 */

export interface AuditLog {
  id: string
  timestamp: Date
  event: AuditEvent
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'
  category: AuditCategory
  userId?: string
  companyId: string
  sessionId?: string
  ipAddress: string
  userAgent: string
  description: string
  entityType?: string
  entityId?: string
  oldValue?: any
  newValue?: any
  metadata: Record<string, any>
  complianceStandards: string[] // HACCP, ISO22000, etc.
}

export type AuditEvent =
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'USER_CREATED'
  | 'USER_MODIFIED'
  | 'USER_DELETED'
  | 'ROLE_ASSIGNED'
  | 'ROLE_REMOVED'
  | 'PERMISSION_GRANTED'
  | 'PERMISSION_DENIED'
  | 'DATA_CREATED'
  | 'DATA_MODIFIED'
  | 'DATA_DELETED'
  | 'DATA_EXPORTED'
  | 'TEMPERATURE_RECORDED'
  | 'TEMPERATURE_ALERT'
  | 'TASK_CREATED'
  | 'TASK_COMPLETED'
  | 'MAINTENANCE_PERFORMED'
  | 'SYSTEM_CONFIG_CHANGED'
  | 'BACKUP_CREATED'
  | 'SECURITY_VIOLATION'
  | 'COMPLIANCE_CHECK'
  | 'AUDIT_TRAIL_ACCESSED'
  | 'INTEGRATION_TEST'

export type AuditCategory =
  | 'AUTHENTICATION'
  | 'AUTHORIZATION'
  | 'DATA_MANAGEMENT'
  | 'SYSTEM_ADMINISTRATION'
  | 'SECURITY'
  | 'COMPLIANCE'
  | 'HACCP_OPERATIONS'
  | 'TEMPERATURE_MONITORING'
  | 'MAINTENANCE'
  | 'REPORTING'

export interface AuditFilter {
  startDate?: Date
  endDate?: Date
  userId?: string
  companyId?: string
  category?: AuditCategory
  event?: AuditEvent
  severity?: string[]
  entityType?: string
  ipAddress?: string
  limit?: number
  offset?: number
}

export interface ComplianceReport {
  id: string
  reportType: 'HACCP' | 'ISO22000' | 'FDA' | 'EU_REGULATION'
  generatedAt: Date
  generatedBy: string
  companyId: string
  periodStart: Date
  periodEnd: Date
  totalEvents: number
  complianceScore: number
  violations: AuditViolation[]
  recommendations: string[]
  summary: {
    criticalEvents: number
    warningEvents: number
    infoEvents: number
    dataIntegrityChecks: number
    temperatureViolations: number
    maintenanceEvents: number
  }
  exportFormat: 'PDF' | 'CSV' | 'JSON'
  digitalSignature?: string
}

export interface AuditViolation {
  id: string
  type: 'DATA_INTEGRITY' | 'TEMPERATURE' | 'MAINTENANCE' | 'ACCESS_CONTROL'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  description: string
  affectedStandards: string[]
  correctionRequired: boolean
  timeline: string
}

/**
 * Enterprise Audit Logger Service
 */
class AuditLoggerService {
  private logs: AuditLog[] = []
  private config: {
    companyId: string
    userId: string
    logLevel: 'minimal' | 'standard' | 'verbose'
    retentionDays: number
    enableRealTimeCompliance: boolean
  } = {
    companyId: '',
    userId: '',
    logLevel: 'standard',
    retentionDays: 365,
    enableRealTimeCompliance: true,
  }

  /**
   * Initialize audit logger
   */
  public async initialize(config: {
    companyId: string
    userId: string
    logLevel?: 'minimal' | 'standard' | 'verbose'
    retentionDays?: number
    enableRealTimeCompliance?: boolean
  }): Promise<void> {
    this.config = { ...this.config, ...config }

    console.log('📋 Initializing Enterprise Audit Logger...')
    console.log(
      `📊 Log level: ${this.config.logLevel}, Retention: ${this.config.retentionDays} days`
    )

    // Start automatic cleanup
    this.startAutomaticCleanup()

    // Log initialization
    await this.logEvent({
      type: 'SYSTEM_ADMINISTRATION',
      event: 'SYSTEM_CONFIG_CHANGED',
      severity: 'INFO',
      description: 'Audit logger initialized',
      metadata: {
        logLevel: this.config.logLevel,
        retentionDays: this.config.retentionDays,
      },
    })

    console.log('✅ Audit Logger initialized successfully')
  }

  /**
   * Log audit event
   */
  public async logEvent(params: {
    type: AuditCategory
    event: AuditEvent
    severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'
    description: string
    userId?: string
    companyId?: string
    entityType?: string
    entityId?: string
    oldValue?: any
    newValue?: any
    metadata?: Record<string, any>
    complianceStandards?: string[]
  }): Promise<string> {
    const auditLog: AuditLog = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      category: params.type,
      event: params.event,
      severity: params.severity,
      description: params.description,
      userId: params.userId || this.config.userId,
      companyId: params.companyId || this.config.companyId,
      sessionId: this.generateSessionId(),
      ipAddress: this.getCurrentIP(),
      userAgent: navigator.userAgent,
      entityType: params.entityType,
      entityId: params.entityId,
      oldValue: params.oldValue,
      newValue: params.newValue,
      metadata: params.metadata || {},
      complianceStandards:
        params.complianceStandards ||
        this.determineComplianceStandards(params.type, params.event),
    }

    this.logs.push(auditLog)

    // Console logging based on severity
    const severityEmojis = {
      INFO: '📘',
      WARNING: '⚠️',
      ERROR: '❌',
      CRITICAL: '🚨',
    }

    console.log(
      `${severityEmojis[params.severity]} AUDIT: [${params.type}] ${params.event} - ${params.description}`
    )

    // Real-time compliance checking
    if (this.config.enableRealTimeCompliance) {
      await this.checkRealTimeCompliance(auditLog)
    }

    // Store in persistent storage (in production, this would be a database)
    if (typeof localStorage !== 'undefined') {
      try {
        const existingLogs = JSON.parse(
          localStorage.getItem('audit_logs') || '[]'
        )
        existingLogs.push(auditLog)
        localStorage.setItem('audit_logs', JSON.stringify(existingLogs))
      } catch (error) {
        console.warn('Failed to persist audit log:', error)
      }
    }

    return auditLog.id
  }

  /**
   * Get audit logs with filtering
   */
  public async getAuditLogs(filter: AuditFilter = {}): Promise<AuditLog[]> {
    let filteredLogs = [...this.logs]

    // Apply filters
    if (filter.startDate) {
      filteredLogs = filteredLogs.filter(
        log => log.timestamp >= filter.startDate!
      )
    }

    if (filter.endDate) {
      filteredLogs = filteredLogs.filter(
        log => log.timestamp <= filter.endDate!
      )
    }

    if (filter.userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === filter.userId)
    }

    if (filter.companyId) {
      filteredLogs = filteredLogs.filter(
        log => log.companyId === filter.companyId
      )
    }

    if (filter.category) {
      filteredLogs = filteredLogs.filter(
        log => log.category === filter.category
      )
    }

    if (filter.event) {
      filteredLogs = filteredLogs.filter(log => log.event === filter.event)
    }

    if (filter.severity) {
      filteredLogs = filteredLogs.filter(log =>
        filter.severity!.includes(log.severity)
      )
    }

    if (filter.entityType) {
      filteredLogs = filteredLogs.filter(
        log => log.entityType === filter.entityType
      )
    }

    if (filter.ipAddress) {
      filteredLogs = filteredLogs.filter(
        log => log.ipAddress === filter.ipAddress
      )
    }

    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    // Apply pagination
    if (filter.offset) {
      filteredLogs = filteredLogs.slice(filter.offset)
    }

    if (filter.limit) {
      filteredLogs = filteredLogs.slice(0, filter.limit)
    }

    return filteredLogs
  }

  /**
   * Get recent audits
   */
  public async getRecentAudits(hours: number = 24): Promise<AuditLog[]> {
    const startDate = new Date(Date.now() - hours * 60 * 60 * 1000)
    return this.getAuditLogs({ startDate })
  }

  /**
   * Generate compliance report
   */
  public async generateComplianceReport(
    reportType: 'HACCP' | 'ISO22000' | 'FDA' | 'EU_REGULATION',
    periodStart: Date,
    periodEnd: Date,
    generatedBy: string
  ): Promise<ComplianceReport> {
    const logs = await this.getAuditLogs({
      startDate: periodStart,
      endDate: periodEnd,
    })
    const relevantLogs = logs.filter(log =>
      log.complianceStandards.includes(reportType)
    )

    // Analyze compliance violations
    const violations = this.analyzeViolations(relevantLogs, reportType)

    // Calculate compliance score
    const complianceScore = this.calculateComplianceScore(
      relevantLogs,
      violations
    )

    // Generate summary
    const summary = {
      criticalEvents: relevantLogs.filter(log => log.severity === 'CRITICAL')
        .length,
      warningEvents: relevantLogs.filter(log => log.severity === 'WARNING')
        .length,
      infoEvents: relevantLogs.filter(log => log.severity === 'INFO').length,
      dataIntegrityChecks: relevantLogs.filter(
        log => log.category === 'DATA_MANAGEMENT'
      ).length,
      temperatureViolations: relevantLogs.filter(
        log => log.event === 'TEMPERATURE_ALERT'
      ).length,
      maintenanceEvents: relevantLogs.filter(
        log => log.category === 'MAINTENANCE'
      ).length,
    }

    // Generate recommendations
    const recommendations = this.generateRecommendations(violations, summary)

    const report: ComplianceReport = {
      id: crypto.randomUUID(),
      reportType,
      generatedAt: new Date(),
      generatedBy,
      companyId: this.config.companyId,
      periodStart,
      periodEnd,
      totalEvents: relevantLogs.length,
      complianceScore,
      violations,
      recommendations,
      summary,
      exportFormat: 'JSON',
    }

    // Log report generation
    await this.logEvent({
      type: 'REPORTING',
      event: 'AUDIT_TRAIL_ACCESSED',
      severity: 'INFO',
      description: `Generated ${reportType} compliance report`,
      metadata: { reportId: report.id, eventsAnalyzed: relevantLogs.length },
    })

    return report
  }

  /**
   * Enable verbose logging
   */
  public async enableVerboseLogging(): Promise<void> {
    this.config.logLevel = 'verbose'
    await this.logEvent({
      type: 'SYSTEM_ADMINISTRATION',
      event: 'SYSTEM_CONFIG_CHANGED',
      severity: 'INFO',
      description: 'Verbose logging enabled',
      metadata: { previousLevel: 'standard', newLevel: 'verbose' },
    })
  }

  /**
   * Export audit logs
   */
  public async exportAuditLogs(
    filter: AuditFilter,
    format: 'JSON' | 'CSV' | 'PDF'
  ): Promise<string> {
    const logs = await this.getAuditLogs(filter)

    await this.logEvent({
      type: 'REPORTING',
      event: 'DATA_EXPORTED',
      severity: 'INFO',
      description: `Exported ${logs.length} audit logs in ${format} format`,
      metadata: { format, recordCount: logs.length, filter },
    })

    switch (format) {
      case 'JSON':
        return JSON.stringify(logs, null, 2)
      case 'CSV':
        return this.convertToCSV(logs)
      case 'PDF':
        return this.generatePDFReport(logs)
      default:
        throw new Error(`Unsupported export format: ${format}`)
    }
  }

  /**
   * Cleanup old logs
   */
  public cleanupOldLogs(): void {
    const cutoffDate = new Date(
      Date.now() - this.config.retentionDays * 24 * 60 * 60 * 1000
    )
    const beforeCount = this.logs.length
    this.logs = this.logs.filter(log => log.timestamp >= cutoffDate)
    const afterCount = this.logs.length

    console.log(`🧹 Cleaned up ${beforeCount - afterCount} old audit logs`)
  }

  /**
   * Private helper methods
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getCurrentIP(): string {
    // In production, this would be obtained from the request
    return '127.0.0.1' // Placeholder for development
  }

  private determineComplianceStandards(
    category: AuditCategory,
    _event: AuditEvent
  ): string[] {
    const standards: string[] = []

    // All HACCP operations require HACCP compliance
    if (
      category === 'HACCP_OPERATIONS' ||
      category === 'TEMPERATURE_MONITORING'
    ) {
      standards.push('HACCP', 'ISO22000')
    }

    // Authentication and authorization events
    if (category === 'AUTHENTICATION' || category === 'AUTHORIZATION') {
      standards.push('HACCP', 'ISO22000', 'FDA')
    }

    // Data management events
    if (category === 'DATA_MANAGEMENT') {
      standards.push('HACCP', 'ISO22000', 'FDA', 'EU_REGULATION')
    }

    // Security events
    if (category === 'SECURITY') {
      standards.push('HACCP', 'ISO22000', 'FDA', 'EU_REGULATION')
    }

    return standards.length > 0 ? standards : ['HACCP']
  }

  private async checkRealTimeCompliance(log: AuditLog): Promise<void> {
    // Real-time compliance checks
    if (
      log.severity === 'CRITICAL' &&
      log.category === 'TEMPERATURE_MONITORING'
    ) {
      console.warn(
        '🚨 CRITICAL TEMPERATURE VIOLATION - Immediate action required for HACCP compliance'
      )
    }

    if (log.event === 'SECURITY_VIOLATION') {
      console.warn(
        '🔒 SECURITY VIOLATION - Review required for compliance standards'
      )
    }
  }

  private analyzeViolations(
    logs: AuditLog[],
    _reportType: string
  ): AuditViolation[] {
    const violations: AuditViolation[] = []

    // Analyze critical events
    const criticalEvents = logs.filter(log => log.severity === 'CRITICAL')

    for (const event of criticalEvents) {
      violations.push({
        id: crypto.randomUUID(),
        type: this.mapCategoryToViolationType(event.category),
        severity: 'CRITICAL',
        description: event.description,
        affectedStandards: event.complianceStandards,
        correctionRequired: true,
        timeline: 'Immediate',
      })
    }

    return violations
  }

  private mapCategoryToViolationType(
    category: AuditCategory
  ): AuditViolation['type'] {
    switch (category) {
      case 'TEMPERATURE_MONITORING':
        return 'TEMPERATURE'
      case 'DATA_MANAGEMENT':
        return 'DATA_INTEGRITY'
      case 'MAINTENANCE':
        return 'MAINTENANCE'
      case 'SECURITY':
      case 'AUTHENTICATION':
      case 'AUTHORIZATION':
        return 'ACCESS_CONTROL'
      default:
        return 'DATA_INTEGRITY'
    }
  }

  private calculateComplianceScore(
    logs: AuditLog[],
    violations: AuditViolation[]
  ): number {
    if (logs.length === 0) return 100

    const criticalViolations = violations.filter(
      v => v.severity === 'CRITICAL'
    ).length
    const highViolations = violations.filter(v => v.severity === 'HIGH').length
    const mediumViolations = violations.filter(
      v => v.severity === 'MEDIUM'
    ).length

    // Start with 100 and deduct points
    let score = 100
    score -= criticalViolations * 20
    score -= highViolations * 10
    score -= mediumViolations * 5

    return Math.max(0, score)
  }

  private generateRecommendations(
    violations: AuditViolation[],
    summary: any
  ): string[] {
    const recommendations: string[] = []

    if (summary.criticalEvents > 0) {
      recommendations.push(
        'Address all critical violations immediately to maintain HACCP compliance'
      )
    }

    if (summary.temperatureViolations > 5) {
      recommendations.push(
        'Review temperature monitoring procedures and equipment calibration'
      )
    }

    if (summary.dataIntegrityChecks < summary.criticalEvents) {
      recommendations.push(
        'Implement additional data integrity verification procedures'
      )
    }

    if (violations.length === 0) {
      recommendations.push(
        'Continue current compliance procedures - all standards met'
      )
    }

    return recommendations
  }

  private convertToCSV(logs: AuditLog[]): string {
    const headers = [
      'ID',
      'Timestamp',
      'Category',
      'Event',
      'Severity',
      'Description',
      'User ID',
      'Company ID',
    ]
    const rows = logs.map(log => [
      log.id,
      log.timestamp.toISOString(),
      log.category,
      log.event,
      log.severity,
      log.description,
      log.userId || '',
      log.companyId,
    ])

    return [headers, ...rows].map(row => row.join(',')).join('\n')
  }

  private generatePDFReport(logs: AuditLog[]): string {
    // In production, this would generate actual PDF content
    return `PDF Report Generated: ${logs.length} audit logs`
  }

  private startAutomaticCleanup(): void {
    // Run cleanup daily
    setInterval(
      () => {
        this.cleanupOldLogs()
      },
      24 * 60 * 60 * 1000
    )
  }
}

// Export singleton instance
export const auditLogger = new AuditLoggerService()

export default auditLogger
