/**
 * B.9.1 Enterprise Security & Compliance - Main Export
 * Advanced security services for enterprise HACCP Business Manager
 */

export {
  securityManager,
  type SecurityConfig,
  type SecurityEvent,
  type ThreatLevel,
  type SecurityAudit,
} from './SecurityManager'

export {
  auditLogger,
  type AuditLog,
  type AuditEvent,
  type AuditFilter,
  type ComplianceReport,
} from './AuditLogger'

export {
  complianceMonitor,
  type ComplianceStandard,
  type ComplianceCheck,
  type ComplianceResult,
  type ComplianceSchedule,
} from './ComplianceMonitor'

export {
  securityDashboard,
  type SecurityMetric,
  type SecurityAlert,
  type SecurityDashboardData,
} from './SecurityDashboard'

/**
 * B.9.1 Enterprise Security Services Manager
 * Central coordinator for all enterprise security functionality
 */
class EnterpriseSecurityManager {
  private initialized = false
  private securityLevel: 'basic' | 'standard' | 'enterprise' = 'basic'

  /**
   * Initialize enterprise security services
   */
  public async initialize(config: {
    securityLevel?: 'basic' | 'standard' | 'enterprise'
    companyId: string
    userId: string
  }): Promise<void> {
    if (this.initialized) return

    console.log('🔒 Initializing B.9.1 Enterprise Security Services...')

    try {
      this.securityLevel = config.securityLevel || 'standard'

      // Initialize security monitoring
      await securityManager.initialize({
        enableRealTimeMonitoring: true,
        enableThreatDetection: this.securityLevel !== 'basic',
        enableAdvancedAudit: this.securityLevel === 'enterprise',
      })

      // Initialize audit logging
      await auditLogger.initialize({
        companyId: config.companyId,
        userId: config.userId,
        logLevel: this.securityLevel === 'enterprise' ? 'verbose' : 'standard',
        retentionDays: this.securityLevel === 'enterprise' ? 2555 : 365, // 7 years for enterprise
      })

      // Initialize compliance monitoring
      await complianceMonitor.initialize({
        standards: ['HACCP', 'ISO22000', 'FDA', 'EU_REGULATION'],
        automaticChecks: true,
        reportingFrequency:
          this.securityLevel === 'enterprise' ? 'daily' : 'weekly',
      })

      this.initialized = true
      console.log('✅ Enterprise Security Services initialized successfully')

      // Log security initialization
      await auditLogger.logEvent({
        type: 'SECURITY_INIT',
        severity: 'INFO',
        description: `Enterprise security initialized at level: ${this.securityLevel}`,
        userId: config.userId,
        companyId: config.companyId,
      })
    } catch (error) {
      console.error('❌ Failed to initialize enterprise security:', error)
      await auditLogger.logEvent({
        type: 'SECURITY_ERROR',
        severity: 'CRITICAL',
        description: `Security initialization failed: ${error}`,
        userId: config.userId,
        companyId: config.companyId,
      })
      throw error
    }
  }

  /**
   * Perform comprehensive security health check
   */
  public async performSecurityHealthCheck(): Promise<{
    overall: 'HEALTHY' | 'WARNING' | 'CRITICAL'
    score: number
    vulnerabilities: Array<{
      type: string
      severity: string
      description: string
    }>
    recommendations: string[]
  }> {
    console.log('🔍 Running comprehensive security health check...')

    const [securityMetrics, auditResults, complianceStatus] = await Promise.all(
      [
        securityManager.getSecurityMetrics(),
        auditLogger.getRecentAudits(24), // Last 24 hours
        complianceMonitor.runComplianceCheck(),
      ]
    )

    let score = 100
    const vulnerabilities: Array<{
      type: string
      severity: string
      description: string
    }> = []
    const recommendations: string[] = []

    // Analyze security metrics
    if (securityMetrics.failedLogins > 10) {
      score -= 15
      vulnerabilities.push({
        type: 'AUTHENTICATION',
        severity: 'HIGH',
        description: `${securityMetrics.failedLogins} failed login attempts detected`,
      })
      recommendations.push('Enable account lockout after failed attempts')
    }

    // Analyze audit logs for suspicious activity
    const criticalEvents = auditResults.filter(
      audit => audit.severity === 'CRITICAL'
    )
    if (criticalEvents.length > 0) {
      score -= 20
      vulnerabilities.push({
        type: 'AUDIT',
        severity: 'CRITICAL',
        description: `${criticalEvents.length} critical security events in last 24h`,
      })
      recommendations.push('Review critical security events immediately')
    }

    // Analyze compliance status
    if (complianceStatus.overallScore < 85) {
      score -= 10
      vulnerabilities.push({
        type: 'COMPLIANCE',
        severity: 'MEDIUM',
        description: `Compliance score below threshold: ${complianceStatus.overallScore}%`,
      })
      recommendations.push('Address compliance gaps to meet HACCP standards')
    }

    let overall: 'HEALTHY' | 'WARNING' | 'CRITICAL'
    if (score >= 85) overall = 'HEALTHY'
    else if (score >= 70) overall = 'WARNING'
    else overall = 'CRITICAL'

    return {
      overall,
      score,
      vulnerabilities,
      recommendations,
    }
  }

  /**
   * Generate enterprise compliance report
   */
  public async generateComplianceReport(
    standard: 'HACCP' | 'ISO22000' | 'FDA' | 'EU_REGULATION',
    dateRange: { start: Date; end: Date }
  ) {
    return await complianceMonitor.generateReport(standard, dateRange)
  }

  /**
   * Get real-time security dashboard data
   */
  public async getSecurityDashboardData() {
    return await securityDashboard.getDashboardData()
  }

  /**
   * Enable enterprise features
   */
  public async enableEnterpriseFeatures() {
    if (this.securityLevel === 'enterprise') {
      await securityManager.enableAdvancedThreatDetection()
      await auditLogger.enableVerboseLogging()
      await complianceMonitor.enableAutomaticReporting()
      console.log('🏢 Enterprise security features enabled')
    }
  }

  /**
   * Cleanup security services
   */
  public cleanup(): void {
    this.initialized = false
    console.log('🧹 Enterprise security services cleaned up')
  }

  /**
   * Get security status
   */
  public getStatus(): {
    initialized: boolean
    securityLevel: string
    services: {
      security: boolean
      audit: boolean
      compliance: boolean
      dashboard: boolean
    }
  } {
    return {
      initialized: this.initialized,
      securityLevel: this.securityLevel,
      services: {
        security: true,
        audit: true,
        compliance: true,
        dashboard: true,
      },
    }
  }
}

// Export singleton instance
export const enterpriseSecurityManager = new EnterpriseSecurityManager()

// Export individual services for direct access
export { securityManager, auditLogger, complianceMonitor, securityDashboard }

// Auto-initialize in production mode with security focus
if (import.meta.env?.PROD) {
  console.log('🔒 Enterprise security services ready for production')
}

export default enterpriseSecurityManager
