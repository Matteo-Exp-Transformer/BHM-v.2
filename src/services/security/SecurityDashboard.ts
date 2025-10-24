/**
 * B.9.1 Enterprise Security Dashboard
 * Real-time security monitoring and compliance visualization
 */

import { securityManager } from './SecurityManager'
import { auditLogger } from './AuditLogger'
import { complianceMonitor } from './ComplianceMonitor'

export interface SecurityMetric {
  id: string
  name: string
  category:
    | 'AUTHENTICATION'
    | 'AUTHORIZATION'
    | 'THREATS'
    | 'COMPLIANCE'
    | 'AUDIT'
  value: number
  unit: string
  trend: 'INCREASING' | 'DECREASING' | 'STABLE'
  threshold: {
    warning: number
    critical: number
  }
  lastUpdated: Date
  status: 'NORMAL' | 'WARNING' | 'CRITICAL'
}

export interface SecurityAlert {
  id: string
  type:
    | 'SECURITY_INCIDENT'
    | 'COMPLIANCE_VIOLATION'
    | 'SYSTEM_ANOMALY'
    | 'THREAT_DETECTED'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  title: string
  description: string
  source: string
  timestamp: Date
  acknowledged: boolean
  acknowledgedBy?: string
  acknowledgedAt?: Date
  resolved: boolean
  resolvedBy?: string
  resolvedAt?: Date
  metadata: Record<string, any>
}

export interface SecurityDashboardData {
  overview: {
    securityScore: number
    complianceScore: number
    threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    activeAlerts: number
    lastUpdated: Date
  }
  metrics: SecurityMetric[]
  alerts: SecurityAlert[]
  recentActivity: {
    logins: number
    failedAttempts: number
    blockedIPs: number
    auditEvents: number
  }
  compliance: {
    overallStatus: 'COMPLIANT' | 'NON_COMPLIANT' | 'NEEDS_ATTENTION'
    standardsStatus: Record<
      string,
      {
        score: number
        status: 'COMPLIANT' | 'NON_COMPLIANT' | 'PARTIALLY_COMPLIANT'
        lastCheck: Date
      }
    >
    criticalFindings: number
    nextAudit: Date
  }
  trends: {
    securityScore: { date: Date; score: number }[]
    complianceScore: { date: Date; score: number }[]
    threatEvents: { date: Date; count: number }[]
    auditEvents: { date: Date; count: number }[]
  }
}

/**
 * Enterprise Security Dashboard Service
 */
class SecurityDashboardService {
  private alerts: SecurityAlert[] = []
  private metrics: SecurityMetric[] = []
  // private lastUpdateTime: Date = new Date()

  /**
   * Get comprehensive security dashboard data
   */
  public async getDashboardData(): Promise<SecurityDashboardData> {
    console.log('📊 Generating security dashboard data...')

    // Get data from all security services
    const [securityMetrics, complianceResult, auditLogs] = await Promise.all([
      securityManager.getSecurityMetrics(),
      complianceMonitor.runComplianceCheck(),
      auditLogger.getRecentAudits(24),
    ])

    // Calculate security score
    const securityScore = this.calculateSecurityScore(
      securityMetrics,
      auditLogs
    )

    // Update metrics
    await this.updateMetrics(securityMetrics, complianceResult, auditLogs)

    // Generate alerts
    await this.generateAlerts(securityMetrics, complianceResult, auditLogs)

    // Calculate trends
    const trends = this.calculateTrends()

    const dashboardData: SecurityDashboardData = {
      overview: {
        securityScore,
        complianceScore: complianceResult.overallScore,
        threatLevel: securityMetrics.threatLevel,
        activeAlerts: this.alerts.filter(alert => !alert.resolved).length,
        lastUpdated: new Date(),
      },
      metrics: this.metrics,
      alerts: this.alerts.slice(0, 10), // Latest 10 alerts
      recentActivity: {
        logins: auditLogs.filter(log => log.event === 'USER_LOGIN').length,
        failedAttempts: securityMetrics.failedLogins,
        blockedIPs: securityMetrics.blockedIPs,
        auditEvents: auditLogs.length,
      },
      compliance: {
        overallStatus: this.mapComplianceLevelToStatus(
          complianceResult.complianceLevel
        ),
        standardsStatus: this.formatStandardsStatus(
          complianceResult.standardResults
        ),
        criticalFindings: complianceResult.criticalFindings,
        nextAudit: complianceResult.nextScheduledCheck,
      },
      trends,
    }

    // this.lastUpdateTime = new Date()
    console.log(
      `📈 Dashboard updated: Security ${securityScore}%, Compliance ${complianceResult.overallScore}%`
    )

    return dashboardData
  }

  /**
   * Get real-time security alerts
   */
  public async getActiveAlerts(): Promise<SecurityAlert[]> {
    return this.alerts.filter(alert => !alert.resolved)
  }

  /**
   * Acknowledge security alert
   */
  public async acknowledgeAlert(
    alertId: string,
    acknowledgedBy: string
  ): Promise<void> {
    const alert = this.alerts.find(a => a.id === alertId)
    if (alert) {
      alert.acknowledged = true
      alert.acknowledgedBy = acknowledgedBy
      alert.acknowledgedAt = new Date()

      console.log(`✅ Alert acknowledged: ${alert.title} by ${acknowledgedBy}`)

      // Log acknowledgment
      await auditLogger.logEvent({
        type: 'SECURITY',
        event: 'SECURITY_VIOLATION',
        severity: 'INFO',
        description: `Security alert acknowledged: ${alert.title}`,
        userId: acknowledgedBy,
        metadata: { alertId, alertType: alert.type },
      })
    }
  }

  /**
   * Resolve security alert
   */
  public async resolveAlert(
    alertId: string,
    resolvedBy: string,
    resolution: string
  ): Promise<void> {
    const alert = this.alerts.find(a => a.id === alertId)
    if (alert) {
      alert.resolved = true
      alert.resolvedBy = resolvedBy
      alert.resolvedAt = new Date()
      alert.metadata.resolution = resolution

      console.log(`🔒 Alert resolved: ${alert.title} by ${resolvedBy}`)

      // Log resolution
      await auditLogger.logEvent({
        type: 'SECURITY',
        event: 'SECURITY_VIOLATION',
        severity: 'INFO',
        description: `Security alert resolved: ${alert.title}`,
        userId: resolvedBy,
        metadata: { alertId, alertType: alert.type, resolution },
      })
    }
  }

  /**
   * Add custom security alert
   */
  public async addAlert(
    alert: Omit<SecurityAlert, 'id' | 'timestamp' | 'acknowledged' | 'resolved'>
  ): Promise<string> {
    const newAlert: SecurityAlert = {
      ...alert,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      acknowledged: false,
      resolved: false,
    }

    this.alerts.unshift(newAlert) // Add to beginning

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(0, 100)
    }

    console.log(`🚨 New security alert: ${alert.title} (${alert.severity})`)

    // Log alert creation
    await auditLogger.logEvent({
      type: 'SECURITY',
      event: 'SECURITY_VIOLATION',
      severity: alert.severity === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
      description: `Security alert created: ${alert.title}`,
      metadata: { alertId: newAlert.id, alertType: alert.type },
    })

    return newAlert.id
  }

  /**
   * Get security metrics history
   */
  public async getMetricsHistory(
    // metricId: string,
    days: number = 30
  ): Promise<{ date: Date; value: number }[]> {
    // In production, this would fetch from persistent storage
    return Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000),
      value: Math.random() * 100,
    }))
  }

  /**
   * Export security report
   */
  public async exportSecurityReport(
    format: 'PDF' | 'CSV' | 'JSON'
  ): Promise<string> {
    const dashboardData = await this.getDashboardData()

    await auditLogger.logEvent({
      type: 'REPORTING',
      event: 'DATA_EXPORTED',
      severity: 'INFO',
      description: `Security report exported in ${format} format`,
      metadata: { format, reportType: 'security_dashboard' },
    })

    switch (format) {
      case 'JSON':
        return JSON.stringify(dashboardData, null, 2)
      case 'CSV':
        return this.convertDashboardToCSV(dashboardData)
      case 'PDF':
        return this.generateSecurityPDFReport(dashboardData)
      default:
        throw new Error(`Unsupported format: ${format}`)
    }
  }

  /**
   * Private helper methods
   */
  private calculateSecurityScore(
    securityMetrics: any,
    auditLogs: any[]
  ): number {
    let score = 100

    // Deduct points for security issues
    if (securityMetrics.threatLevel === 'CRITICAL') score -= 30
    else if (securityMetrics.threatLevel === 'HIGH') score -= 20
    else if (securityMetrics.threatLevel === 'MEDIUM') score -= 10

    // Deduct points for failed logins
    if (securityMetrics.failedLogins > 20) score -= 15
    else if (securityMetrics.failedLogins > 10) score -= 10
    else if (securityMetrics.failedLogins > 5) score -= 5

    // Deduct points for blocked IPs
    if (securityMetrics.blockedIPs > 10) score -= 10
    else if (securityMetrics.blockedIPs > 5) score -= 5

    // Deduct points for critical audit events
    const criticalEvents = auditLogs.filter(
      log => log.severity === 'CRITICAL'
    ).length
    score -= criticalEvents * 5

    return Math.max(0, score)
  }

  private async updateMetrics(
    securityMetrics: any,
    complianceResult: any,
    auditLogs: any[]
  ): Promise<void> {
    const newMetrics: SecurityMetric[] = [
      {
        id: 'failed_logins',
        name: 'Failed Login Attempts',
        category: 'AUTHENTICATION',
        value: securityMetrics.failedLogins,
        unit: 'count',
        trend: 'STABLE',
        threshold: { warning: 10, critical: 20 },
        lastUpdated: new Date(),
        status:
          securityMetrics.failedLogins > 20
            ? 'CRITICAL'
            : securityMetrics.failedLogins > 10
              ? 'WARNING'
              : 'NORMAL',
      },
      {
        id: 'blocked_ips',
        name: 'Blocked IP Addresses',
        category: 'THREATS',
        value: securityMetrics.blockedIPs,
        unit: 'count',
        trend: 'STABLE',
        threshold: { warning: 5, critical: 10 },
        lastUpdated: new Date(),
        status:
          securityMetrics.blockedIPs > 10
            ? 'CRITICAL'
            : securityMetrics.blockedIPs > 5
              ? 'WARNING'
              : 'NORMAL',
      },
      {
        id: 'active_sessions',
        name: 'Active Sessions',
        category: 'AUTHENTICATION',
        value: securityMetrics.activeSessions,
        unit: 'count',
        trend: 'STABLE',
        threshold: { warning: 50, critical: 100 },
        lastUpdated: new Date(),
        status:
          securityMetrics.activeSessions > 100
            ? 'CRITICAL'
            : securityMetrics.activeSessions > 50
              ? 'WARNING'
              : 'NORMAL',
      },
      {
        id: 'compliance_score',
        name: 'Compliance Score',
        category: 'COMPLIANCE',
        value: complianceResult.overallScore,
        unit: 'percentage',
        trend: 'STABLE',
        threshold: { warning: 80, critical: 70 },
        lastUpdated: new Date(),
        status:
          complianceResult.overallScore < 70
            ? 'CRITICAL'
            : complianceResult.overallScore < 80
              ? 'WARNING'
              : 'NORMAL',
      },
      {
        id: 'audit_events',
        name: 'Recent Audit Events',
        category: 'AUDIT',
        value: auditLogs.length,
        unit: 'count',
        trend: 'STABLE',
        threshold: { warning: 1000, critical: 2000 },
        lastUpdated: new Date(),
        status:
          auditLogs.length > 2000
            ? 'CRITICAL'
            : auditLogs.length > 1000
              ? 'WARNING'
              : 'NORMAL',
      },
    ]

    this.metrics = newMetrics
  }

  private async generateAlerts(
    securityMetrics: any,
    complianceResult: any,
    auditLogs: any[]
  ): Promise<void> {
    // Generate alerts based on current security state
    const currentAlerts = this.alerts.filter(alert => !alert.resolved)

    // Check for new security threats
    if (securityMetrics.threatLevel === 'CRITICAL') {
      const existingThreatAlert = currentAlerts.find(
        alert =>
          alert.type === 'THREAT_DETECTED' && alert.severity === 'CRITICAL'
      )

      if (!existingThreatAlert) {
        await this.addAlert({
          type: 'THREAT_DETECTED',
          severity: 'CRITICAL',
          title: 'Critical Security Threat Detected',
          description: `System threat level elevated to CRITICAL. Failed logins: ${securityMetrics.failedLogins}, Blocked IPs: ${securityMetrics.blockedIPs}`,
          source: 'SecurityManager',
          metadata: {
            threatLevel: securityMetrics.threatLevel,
            failedLogins: securityMetrics.failedLogins,
          },
        })
      }
    }

    // Check for compliance violations
    if (complianceResult.overallScore < 70) {
      const existingComplianceAlert = currentAlerts.find(
        alert => alert.type === 'COMPLIANCE_VIOLATION'
      )

      if (!existingComplianceAlert) {
        await this.addAlert({
          type: 'COMPLIANCE_VIOLATION',
          severity: 'HIGH',
          title: 'Compliance Score Below Threshold',
          description: `Overall compliance score dropped to ${complianceResult.overallScore}%. Critical findings: ${complianceResult.criticalFindings}`,
          source: 'ComplianceMonitor',
          metadata: {
            score: complianceResult.overallScore,
            criticalFindings: complianceResult.criticalFindings,
          },
        })
      }
    }

    // Check for critical audit events
    const criticalAuditEvents = auditLogs.filter(
      log => log.severity === 'CRITICAL'
    )
    if (criticalAuditEvents.length > 5) {
      const existingAuditAlert = currentAlerts.find(
        alert =>
          alert.type === 'SYSTEM_ANOMALY' &&
          alert.description.includes('critical audit events')
      )

      if (!existingAuditAlert) {
        await this.addAlert({
          type: 'SYSTEM_ANOMALY',
          severity: 'HIGH',
          title: 'High Volume of Critical Events',
          description: `${criticalAuditEvents.length} critical audit events detected in the last 24 hours`,
          source: 'AuditLogger',
          metadata: {
            eventCount: criticalAuditEvents.length,
            timeframe: '24h',
          },
        })
      }
    }
  }

  private calculateTrends(): SecurityDashboardData['trends'] {
    // Generate mock trend data for demonstration
    return {
      securityScore: this.generateTrendData(30, 70, 100) as { date: Date; score: number }[],
      complianceScore: this.generateTrendData(30, 80, 100) as { date: Date; score: number }[],
      threatEvents: this.generateTrendData(30, 0, 10) as { date: Date; count: number }[],
      auditEvents: this.generateTrendData(30, 50, 200) as { date: Date; count: number }[],
    }
  }

  private generateTrendData(
    days: number,
    min: number,
    max: number
  ): { date: Date; score?: number; count?: number }[] {
    return Array.from({ length: days }, (_, i) => {
      const value = min + Math.random() * (max - min)
      const date = new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000)

      return {
        date,
        ...(max > 50 ? { score: value } : { count: Math.floor(value) }),
      }
    })
  }

  private mapComplianceLevelToStatus(
    level: string
  ): 'COMPLIANT' | 'NON_COMPLIANT' | 'NEEDS_ATTENTION' {
    switch (level) {
      case 'EXCELLENT':
      case 'GOOD':
        return 'COMPLIANT'
      case 'ACCEPTABLE':
        return 'NEEDS_ATTENTION'
      case 'POOR':
      case 'CRITICAL':
        return 'NON_COMPLIANT'
      default:
        return 'NEEDS_ATTENTION'
    }
  }

  private formatStandardsStatus(standardResults: any): Record<string, any> {
    const formattedStatus: Record<string, any> = {}

    for (const [standardId, result] of Object.entries(standardResults)) {
      formattedStatus[standardId] = {
        score: (result as any).score,
        status: (result as any).status,
        lastCheck: new Date(),
      }
    }

    return formattedStatus
  }

  private convertDashboardToCSV(data: SecurityDashboardData): string {
    const headers = ['Metric', 'Value', 'Status', 'Last Updated']
    const rows = data.metrics.map(metric => [
      metric.name,
      `${metric.value} ${metric.unit}`,
      metric.status,
      metric.lastUpdated.toISOString(),
    ])

    return [headers, ...rows].map(row => row.join(',')).join('\n')
  }

  private generateSecurityPDFReport(data: SecurityDashboardData): string {
    // In production, this would generate actual PDF content
    return `Security Dashboard PDF Report - Generated: ${data.overview.lastUpdated.toISOString()}`
  }
}

// Export singleton instance
export const securityDashboard = new SecurityDashboardService()

export default securityDashboard
