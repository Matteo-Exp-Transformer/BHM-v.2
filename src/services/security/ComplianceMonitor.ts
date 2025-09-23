/**
 * B.9.1 Enterprise Compliance Monitor
 * Automated monitoring and reporting for HACCP and food safety standards
 */

export interface ComplianceStandard {
  id: string
  name: string
  version: string
  description: string
  requirements: ComplianceRequirement[]
  criticalControlPoints: string[]
  monitoringFrequency: 'real-time' | 'hourly' | 'daily' | 'weekly' | 'monthly'
  mandatory: boolean
}

export interface ComplianceRequirement {
  id: string
  standardId: string
  title: string
  description: string
  checkType:
    | 'TEMPERATURE'
    | 'DOCUMENTATION'
    | 'TRAINING'
    | 'MAINTENANCE'
    | 'ACCESS_CONTROL'
  criticalLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  automatable: boolean
  checkFrequency: string
  acceptanceCriteria: any
  remedialActions: string[]
}

export interface ComplianceCheck {
  id: string
  requirementId: string
  standardId: string
  executedAt: Date
  executedBy: 'SYSTEM' | 'USER'
  result: 'PASS' | 'FAIL' | 'WARNING' | 'NOT_APPLICABLE'
  score: number // 0-100
  findings: ComplianceFinding[]
  recommendations: string[]
  nextCheckDue: Date
  evidenceFiles: string[]
}

export interface ComplianceFinding {
  id: string
  type: 'VIOLATION' | 'OBSERVATION' | 'BEST_PRACTICE'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  description: string
  location?: string
  timestamp: Date
  correctionRequired: boolean
  timeToCorrect?: string
  responsible?: string
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'
}

export interface ComplianceResult {
  overallScore: number
  standardsChecked: number
  totalRequirements: number
  passedChecks: number
  failedChecks: number
  warningChecks: number
  criticalFindings: number
  lastCheckDate: Date
  nextScheduledCheck: Date
  complianceLevel: 'EXCELLENT' | 'GOOD' | 'ACCEPTABLE' | 'POOR' | 'CRITICAL'
  standardResults: Record<
    string,
    {
      score: number
      status: 'COMPLIANT' | 'NON_COMPLIANT' | 'PARTIALLY_COMPLIANT'
      criticalIssues: number
    }
  >
}

export interface ComplianceSchedule {
  id: string
  standardId: string
  requirementId: string
  frequency: string
  nextDueDate: Date
  lastExecuted?: Date
  assignedTo?: string
  automated: boolean
  notifications: {
    advance: number // days
    recipients: string[]
  }
}

/**
 * Enterprise Compliance Monitor Service
 */
class ComplianceMonitorService {
  private standards: Map<string, ComplianceStandard> = new Map()
  private checks: ComplianceCheck[] = []
  private schedule: ComplianceSchedule[] = []
  private findings: ComplianceFinding[] = []

  /**
   * Initialize compliance monitor
   */
  public async initialize(config: {
    standards: ('HACCP' | 'ISO22000' | 'FDA' | 'EU_REGULATION')[]
    automaticChecks: boolean
    reportingFrequency: 'daily' | 'weekly' | 'monthly'
  }): Promise<void> {
    console.log('📊 Initializing Enterprise Compliance Monitor...')

    // Load compliance standards
    await this.loadStandards(config.standards)

    // Setup automatic checks
    if (config.automaticChecks) {
      this.setupAutomaticChecks()
    }

    // Setup reporting
    this.setupReporting(config.reportingFrequency)

    console.log(
      `✅ Compliance Monitor initialized with ${config.standards.length} standards`
    )
  }

  /**
   * Run compliance check for all standards
   */
  public async runComplianceCheck(): Promise<ComplianceResult> {
    console.log('🔍 Running comprehensive compliance check...')

    const allChecks: ComplianceCheck[] = []
    const standardResults: Record<string, any> = {}

    for (const [standardId, standard] of this.standards.entries()) {
      console.log(`📋 Checking compliance for ${standard.name}...`)

      const standardChecks = await this.checkStandardCompliance(standardId)
      allChecks.push(...standardChecks)

      // Calculate standard-specific results
      const passedChecks = standardChecks.filter(
        check => check.result === 'PASS'
      ).length
      const failedChecks = standardChecks.filter(
        check => check.result === 'FAIL'
      ).length
      const warningChecks = standardChecks.filter(
        check => check.result === 'WARNING'
      ).length
      const totalChecks = standardChecks.length

      const score = totalChecks > 0 ? (passedChecks / totalChecks) * 100 : 0
      const criticalIssues = standardChecks.reduce(
        (count, check) =>
          count +
          check.findings.filter(finding => finding.severity === 'CRITICAL')
            .length,
        0
      )

      let status: 'COMPLIANT' | 'NON_COMPLIANT' | 'PARTIALLY_COMPLIANT'
      if (score >= 95 && criticalIssues === 0) status = 'COMPLIANT'
      else if (score >= 70 && criticalIssues === 0)
        status = 'PARTIALLY_COMPLIANT'
      else status = 'NON_COMPLIANT'

      standardResults[standardId] = { score, status, criticalIssues }
    }

    // Calculate overall results
    const totalRequirements = allChecks.length
    const passedChecks = allChecks.filter(
      check => check.result === 'PASS'
    ).length
    const failedChecks = allChecks.filter(
      check => check.result === 'FAIL'
    ).length
    const warningChecks = allChecks.filter(
      check => check.result === 'WARNING'
    ).length

    const overallScore =
      totalRequirements > 0 ? (passedChecks / totalRequirements) * 100 : 0
    const criticalFindings = allChecks.reduce(
      (count, check) =>
        count +
        check.findings.filter(finding => finding.severity === 'CRITICAL')
          .length,
      0
    )

    let complianceLevel: ComplianceResult['complianceLevel']
    if (overallScore >= 95 && criticalFindings === 0)
      complianceLevel = 'EXCELLENT'
    else if (overallScore >= 85 && criticalFindings === 0)
      complianceLevel = 'GOOD'
    else if (overallScore >= 70 && criticalFindings <= 2)
      complianceLevel = 'ACCEPTABLE'
    else if (overallScore >= 50) complianceLevel = 'POOR'
    else complianceLevel = 'CRITICAL'

    const result: ComplianceResult = {
      overallScore,
      standardsChecked: this.standards.size,
      totalRequirements,
      passedChecks,
      failedChecks,
      warningChecks,
      criticalFindings,
      lastCheckDate: new Date(),
      nextScheduledCheck: this.getNextScheduledCheck(),
      complianceLevel,
      standardResults,
    }

    this.checks.push(...allChecks)

    console.log(
      `📊 Compliance check completed: ${overallScore.toFixed(1)}% (${complianceLevel})`
    )
    return result
  }

  /**
   * Generate compliance report
   */
  public async generateReport(
    standard: 'HACCP' | 'ISO22000' | 'FDA' | 'EU_REGULATION',
    dateRange: { start: Date; end: Date }
  ): Promise<{
    id: string
    standard: string
    generatedAt: Date
    period: { start: Date; end: Date }
    summary: {
      totalChecks: number
      passedChecks: number
      failedChecks: number
      criticalFindings: number
      complianceScore: number
    }
    details: ComplianceCheck[]
    findings: ComplianceFinding[]
    recommendations: string[]
    certificateData?: {
      issued: Date
      validUntil: Date
      certificationBody: string
    }
  }> {
    const relevantChecks = this.checks.filter(
      check =>
        check.standardId === standard &&
        check.executedAt >= dateRange.start &&
        check.executedAt <= dateRange.end
    )

    const findings = relevantChecks.flatMap(check => check.findings)
    const criticalFindings = findings.filter(
      finding => finding.severity === 'CRITICAL'
    ).length
    const passedChecks = relevantChecks.filter(
      check => check.result === 'PASS'
    ).length
    const failedChecks = relevantChecks.filter(
      check => check.result === 'FAIL'
    ).length

    const complianceScore =
      relevantChecks.length > 0
        ? (passedChecks / relevantChecks.length) * 100
        : 0

    // Generate recommendations based on findings
    const recommendations = this.generateRecommendations(findings, standard)

    const report = {
      id: crypto.randomUUID(),
      standard,
      generatedAt: new Date(),
      period: dateRange,
      summary: {
        totalChecks: relevantChecks.length,
        passedChecks,
        failedChecks,
        criticalFindings,
        complianceScore,
      },
      details: relevantChecks,
      findings,
      recommendations,
      ...(complianceScore >= 95 &&
        criticalFindings === 0 && {
          certificateData: {
            issued: new Date(),
            validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
            certificationBody: 'Internal Compliance System',
          },
        }),
    }

    console.log(
      `📄 Generated ${standard} compliance report: ${complianceScore.toFixed(1)}% compliance`
    )
    return report
  }

  /**
   * Check specific requirement
   */
  public async checkRequirement(
    requirementId: string
  ): Promise<ComplianceCheck> {
    const requirement = this.findRequirement(requirementId)
    if (!requirement) {
      throw new Error(`Requirement not found: ${requirementId}`)
    }

    console.log(`🔍 Checking requirement: ${requirement.title}`)

    const check: ComplianceCheck = {
      id: crypto.randomUUID(),
      requirementId,
      standardId: requirement.standardId,
      executedAt: new Date(),
      executedBy: 'SYSTEM',
      result: 'PASS',
      score: 0,
      findings: [],
      recommendations: [],
      nextCheckDue: this.calculateNextCheckDue(requirement.checkFrequency),
      evidenceFiles: [],
    }

    // Perform specific checks based on requirement type
    switch (requirement.checkType) {
      case 'TEMPERATURE':
        await this.checkTemperatureCompliance(check, requirement)
        break
      case 'DOCUMENTATION':
        await this.checkDocumentationCompliance(check, requirement)
        break
      case 'TRAINING':
        await this.checkTrainingCompliance(check, requirement)
        break
      case 'MAINTENANCE':
        await this.checkMaintenanceCompliance(check, requirement)
        break
      case 'ACCESS_CONTROL':
        await this.checkAccessControlCompliance(check, requirement)
        break
    }

    // Calculate overall score for this check
    check.score = this.calculateCheckScore(check)

    return check
  }

  /**
   * Get compliance dashboard data
   */
  public async getComplianceDashboard(): Promise<{
    overallStatus: 'COMPLIANT' | 'NON_COMPLIANT' | 'NEEDS_ATTENTION'
    score: number
    recentChecks: ComplianceCheck[]
    openFindings: ComplianceFinding[]
    upcomingChecks: ComplianceSchedule[]
    trends: {
      scoreHistory: { date: Date; score: number }[]
      findingsTrend: { date: Date; count: number }[]
    }
  }> {
    const recentChecks = this.checks
      .filter(
        check =>
          check.executedAt >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      )
      .slice(0, 10)

    const openFindings = this.findings.filter(
      finding => finding.status !== 'RESOLVED'
    )

    const upcomingChecks = this.schedule
      .filter(
        schedule =>
          schedule.nextDueDate <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      )
      .sort((a, b) => a.nextDueDate.getTime() - b.nextDueDate.getTime())
      .slice(0, 5)

    const avgScore =
      recentChecks.length > 0
        ? recentChecks.reduce((sum, check) => sum + check.score, 0) /
          recentChecks.length
        : 0

    let overallStatus: 'COMPLIANT' | 'NON_COMPLIANT' | 'NEEDS_ATTENTION'
    if (
      avgScore >= 95 &&
      openFindings.filter(f => f.severity === 'CRITICAL').length === 0
    ) {
      overallStatus = 'COMPLIANT'
    } else if (avgScore >= 70) {
      overallStatus = 'NEEDS_ATTENTION'
    } else {
      overallStatus = 'NON_COMPLIANT'
    }

    return {
      overallStatus,
      score: avgScore,
      recentChecks,
      openFindings,
      upcomingChecks,
      trends: {
        scoreHistory: this.generateScoreHistory(),
        findingsTrend: this.generateFindingsTrend(),
      },
    }
  }

  /**
   * Enable automatic reporting
   */
  public async enableAutomaticReporting(): Promise<void> {
    console.log('📈 Enabling automatic compliance reporting')
    // In production, this would set up scheduled report generation
  }

  /**
   * Private helper methods
   */
  private async loadStandards(standardIds: string[]): Promise<void> {
    for (const standardId of standardIds) {
      const standard = this.createStandard(standardId)
      this.standards.set(standardId, standard)
    }
  }

  private createStandard(standardId: string): ComplianceStandard {
    switch (standardId) {
      case 'HACCP':
        return {
          id: 'HACCP',
          name: 'Hazard Analysis Critical Control Points',
          version: '2023',
          description: 'Food safety management system',
          requirements: this.getHACCPRequirements(),
          criticalControlPoints: [
            'Temperature Control',
            'Contamination Prevention',
            'Documentation',
          ],
          monitoringFrequency: 'real-time',
          mandatory: true,
        }
      case 'ISO22000':
        return {
          id: 'ISO22000',
          name: 'Food Safety Management Systems',
          version: '2018',
          description: 'International standard for food safety',
          requirements: this.getISO22000Requirements(),
          criticalControlPoints: [
            'Food Safety Policy',
            'Risk Assessment',
            'Traceability',
          ],
          monitoringFrequency: 'daily',
          mandatory: false,
        }
      case 'FDA':
        return {
          id: 'FDA',
          name: 'FDA Food Safety Modernization Act',
          version: '2023',
          description: 'US FDA food safety regulations',
          requirements: this.getFDARequirements(),
          criticalControlPoints: [
            'Preventive Controls',
            'Supplier Verification',
            'Recall Procedures',
          ],
          monitoringFrequency: 'daily',
          mandatory: false,
        }
      case 'EU_REGULATION':
        return {
          id: 'EU_REGULATION',
          name: 'EU Food Safety Regulations',
          version: '2023',
          description: 'European Union food safety standards',
          requirements: this.getEURequirements(),
          criticalControlPoints: [
            'Traceability',
            'HACCP Implementation',
            'Hygiene Standards',
          ],
          monitoringFrequency: 'daily',
          mandatory: false,
        }
      default:
        throw new Error(`Unknown standard: ${standardId}`)
    }
  }

  private getHACCPRequirements(): ComplianceRequirement[] {
    return [
      {
        id: 'HACCP_001',
        standardId: 'HACCP',
        title: 'Temperature Monitoring',
        description: 'Continuous monitoring of critical temperature points',
        checkType: 'TEMPERATURE',
        criticalLevel: 'CRITICAL',
        automatable: true,
        checkFrequency: 'real-time',
        acceptanceCriteria: { temperatureRange: { min: -18, max: 4 } },
        remedialActions: [
          'Adjust equipment',
          'Move products',
          'Document incident',
        ],
      },
      {
        id: 'HACCP_002',
        standardId: 'HACCP',
        title: 'Documentation Completeness',
        description: 'All critical control point records must be complete',
        checkType: 'DOCUMENTATION',
        criticalLevel: 'HIGH',
        automatable: true,
        checkFrequency: 'daily',
        acceptanceCriteria: { completeness: 100 },
        remedialActions: ['Complete missing records', 'Update procedures'],
      },
    ]
  }

  private getISO22000Requirements(): ComplianceRequirement[] {
    return [
      {
        id: 'ISO_001',
        standardId: 'ISO22000',
        title: 'Management Review',
        description: 'Regular management review of food safety system',
        checkType: 'DOCUMENTATION',
        criticalLevel: 'MEDIUM',
        automatable: false,
        checkFrequency: 'monthly',
        acceptanceCriteria: { reviewFrequency: 'monthly' },
        remedialActions: ['Schedule review', 'Document findings'],
      },
    ]
  }

  private getFDARequirements(): ComplianceRequirement[] {
    return [
      {
        id: 'FDA_001',
        standardId: 'FDA',
        title: 'Preventive Controls Verification',
        description: 'Verification of preventive control measures',
        checkType: 'DOCUMENTATION',
        criticalLevel: 'HIGH',
        automatable: true,
        checkFrequency: 'weekly',
        acceptanceCriteria: { verificationRate: 100 },
        remedialActions: ['Update controls', 'Retrain staff'],
      },
    ]
  }

  private getEURequirements(): ComplianceRequirement[] {
    return [
      {
        id: 'EU_001',
        standardId: 'EU_REGULATION',
        title: 'Traceability System',
        description: 'Complete product traceability system',
        checkType: 'DOCUMENTATION',
        criticalLevel: 'HIGH',
        automatable: true,
        checkFrequency: 'daily',
        acceptanceCriteria: { traceabilityCompleteness: 100 },
        remedialActions: ['Update traceability records', 'System verification'],
      },
    ]
  }

  private async checkStandardCompliance(
    standardId: string
  ): Promise<ComplianceCheck[]> {
    const standard = this.standards.get(standardId)
    if (!standard) return []

    const checks: ComplianceCheck[] = []

    for (const requirement of standard.requirements) {
      const check = await this.checkRequirement(requirement.id)
      checks.push(check)
    }

    return checks
  }

  private async checkTemperatureCompliance(
    check: ComplianceCheck,
    requirement: ComplianceRequirement
  ): Promise<void> {
    // Simulate temperature compliance check
    // In production, this would check actual temperature data
    const mockTemperatureData = { current: 2, min: -1, max: 5 }

    if (
      mockTemperatureData.current <
        requirement.acceptanceCriteria.temperatureRange.min ||
      mockTemperatureData.current >
        requirement.acceptanceCriteria.temperatureRange.max
    ) {
      check.result = 'FAIL'
      check.findings.push({
        id: crypto.randomUUID(),
        type: 'VIOLATION',
        severity: 'CRITICAL',
        description: `Temperature ${mockTemperatureData.current}°C outside acceptable range`,
        timestamp: new Date(),
        correctionRequired: true,
        timeToCorrect: 'Immediate',
        status: 'OPEN',
      })
    } else {
      check.result = 'PASS'
    }
  }

  private async checkDocumentationCompliance(
    check: ComplianceCheck,
    requirement: ComplianceRequirement
  ): Promise<void> {
    // Simulate documentation check
    const mockCompleteness = Math.random() * 100

    if (mockCompleteness < requirement.acceptanceCriteria.completeness) {
      check.result = 'FAIL'
      check.findings.push({
        id: crypto.randomUUID(),
        type: 'VIOLATION',
        severity: 'MEDIUM',
        description: `Documentation only ${mockCompleteness.toFixed(1)}% complete`,
        timestamp: new Date(),
        correctionRequired: true,
        timeToCorrect: '24 hours',
        status: 'OPEN',
      })
    } else {
      check.result = 'PASS'
    }
  }

  private async checkTrainingCompliance(
    check: ComplianceCheck,
    requirement: ComplianceRequirement
  ): Promise<void> {
    check.result = 'PASS' // Simplified for demo
  }

  private async checkMaintenanceCompliance(
    check: ComplianceCheck,
    requirement: ComplianceRequirement
  ): Promise<void> {
    check.result = 'PASS' // Simplified for demo
  }

  private async checkAccessControlCompliance(
    check: ComplianceCheck,
    requirement: ComplianceRequirement
  ): Promise<void> {
    check.result = 'PASS' // Simplified for demo
  }

  private calculateCheckScore(check: ComplianceCheck): number {
    if (check.result === 'PASS') return 100
    if (check.result === 'WARNING') return 75
    if (check.result === 'FAIL') {
      const criticalFindings = check.findings.filter(
        f => f.severity === 'CRITICAL'
      ).length
      return Math.max(0, 50 - criticalFindings * 25)
    }
    return 0
  }

  private findRequirement(
    requirementId: string
  ): ComplianceRequirement | undefined {
    for (const standard of this.standards.values()) {
      const requirement = standard.requirements.find(
        req => req.id === requirementId
      )
      if (requirement) return requirement
    }
    return undefined
  }

  private calculateNextCheckDue(frequency: string): Date {
    const now = new Date()
    switch (frequency) {
      case 'real-time':
        return new Date(now.getTime() + 60 * 1000) // 1 minute
      case 'hourly':
        return new Date(now.getTime() + 60 * 60 * 1000) // 1 hour
      case 'daily':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000) // 1 day
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 1 week
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000) // Default 1 day
    }
  }

  private getNextScheduledCheck(): Date {
    return new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
  }

  private generateRecommendations(
    findings: ComplianceFinding[],
    standard: string
  ): string[] {
    const recommendations: string[] = []

    const criticalFindings = findings.filter(f => f.severity === 'CRITICAL')
    if (criticalFindings.length > 0) {
      recommendations.push(
        `Address ${criticalFindings.length} critical findings immediately`
      )
    }

    const temperatureFindings = findings.filter(f =>
      f.description.toLowerCase().includes('temperature')
    )
    if (temperatureFindings.length > 0) {
      recommendations.push(
        'Review temperature monitoring procedures and equipment calibration'
      )
    }

    if (standard === 'HACCP' && findings.length > 0) {
      recommendations.push(
        'Update HACCP plan documentation to address identified gaps'
      )
    }

    return recommendations
  }

  private generateScoreHistory(): { date: Date; score: number }[] {
    // Generate mock data for demo
    return Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
      score: 80 + Math.random() * 20,
    }))
  }

  private generateFindingsTrend(): { date: Date; count: number }[] {
    // Generate mock data for demo
    return Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
      count: Math.floor(Math.random() * 5),
    }))
  }

  private setupAutomaticChecks(): void {
    console.log('⚙️ Setting up automatic compliance checks')
    // In production, this would set up scheduled checks
  }

  private setupReporting(frequency: string): void {
    console.log(`📊 Setting up ${frequency} compliance reporting`)
    // In production, this would set up scheduled reporting
  }
}

// Export singleton instance
export const complianceMonitor = new ComplianceMonitorService()

export default complianceMonitor
