/**
 * ExecutiveDashboard - B.10.2 Advanced Analytics & Reporting
 * High-level KPI aggregation and executive insights for C-level management
 */

export interface ExecutiveKPI {
  id: string
  name: string
  category: 'compliance' | 'performance' | 'financial' | 'operational' | 'risk'
  value: number
  target: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  trendValue: number
  trendPeriod: string
  status: 'excellent' | 'good' | 'warning' | 'critical'
  lastUpdated: Date
  description: string
}

export interface CompanyPerformance {
  companyId: string
  companyName: string
  overallScore: number
  kpis: ExecutiveKPI[]
  ranking: number
  lastAssessment: Date
  growthRate: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
}

export interface IndustryBenchmark {
  industry: string
  metric: string
  average: number
  median: number
  topQuartile: number
  bottomQuartile: number
  ourValue: number
  percentile: number
  lastUpdated: Date
}

export interface ExecutiveInsight {
  id: string
  type: 'achievement' | 'concern' | 'opportunity' | 'trend'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  impact: 'positive' | 'negative' | 'neutral'
  affectedCompanies: string[]
  recommendation: string
  timeline: string
  confidence: number
  createdAt: Date
}

export interface ExecutiveSummary {
  period: {
    start: Date
    end: Date
  }
  totalCompanies: number
  overallCompliance: number
  keyMetrics: {
    averageCompliance: number
    totalViolations: number
    resolvedIssues: number
    pendingActions: number
  }
  topPerformers: CompanyPerformance[]
  bottomPerformers: CompanyPerformance[]
  criticalAlerts: number
  insights: ExecutiveInsight[]
  benchmarks: IndustryBenchmark[]
}

/**
 * Executive Dashboard Service for C-Level Business Intelligence
 */
export class ExecutiveDashboard {
  private isInitialized = false

  /**
   * Initialize the executive dashboard
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      console.log(
        '👔 Executive dashboard initialized - B.10.2 Advanced Analytics'
      )
      this.isInitialized = true
    } catch (error) {
      console.error('Failed to initialize executive dashboard:', error)
      throw error
    }
  }

  /**
   * Get executive summary for a time period
   */
  public async getExecutiveSummary(
    startDate: Date,
    endDate: Date,
    companyIds?: string[]
  ): Promise<ExecutiveSummary> {
    try {
      // Get company performance data
      const companies = await this.getCompanyPerformanceData(companyIds)

      // Calculate key metrics
      const keyMetrics = await this.calculateKeyMetrics(
        companies,
        startDate,
        endDate
      )

      // Get insights
      const insights = await this.generateExecutiveInsights(
        companies,
        startDate,
        endDate
      )

      // Get industry benchmarks
      const benchmarks = await this.getIndustryBenchmarks(companies)

      // Identify top and bottom performers
      const sortedCompanies = companies.sort(
        (a, b) => b.overallScore - a.overallScore
      )
      const topPerformers = sortedCompanies.slice(0, 5)
      const bottomPerformers = sortedCompanies.slice(-5).reverse()

      const summary: ExecutiveSummary = {
        period: { start: startDate, end: endDate },
        totalCompanies: companies.length,
        overallCompliance: this.calculateOverallCompliance(companies),
        keyMetrics,
        topPerformers,
        bottomPerformers,
        criticalAlerts: this.countCriticalAlerts(companies),
        insights,
        benchmarks,
      }

      console.log('👔 Generated executive summary')
      return summary
    } catch (error) {
      console.error('Failed to get executive summary:', error)
      throw error
    }
  }

  /**
   * Get executive KPIs for dashboard
   */
  public async getExecutiveKPIs(
    companyIds?: string[],
    categories?: ExecutiveKPI['category'][]
  ): Promise<ExecutiveKPI[]> {
    try {
      const companies = await this.getCompanyPerformanceData(companyIds)
      const kpis: ExecutiveKPI[] = []

      // Aggregate KPIs across companies
      const aggregatedKpis = this.aggregateKPIsAcrossCompanies(companies)

      // Filter by categories if specified
      const filteredKpis = categories
        ? aggregatedKpis.filter(kpi => categories.includes(kpi.category))
        : aggregatedKpis

      // Add calculated KPIs
      kpis.push(...filteredKpis)

      // Add derived KPIs
      kpis.push(...this.calculateDerivedKPIs(companies))

      console.log(`👔 Generated ${kpis.length} executive KPIs`)
      return kpis
    } catch (error) {
      console.error('Failed to get executive KPIs:', error)
      throw error
    }
  }

  /**
   * Get company performance comparison
   */
  public async getCompanyPerformanceComparison(
    companyIds: string[],
    metrics: string[]
  ): Promise<{
    companies: CompanyPerformance[]
    comparison: Record<string, Record<string, number>>
    rankings: Record<string, number>
  }> {
    try {
      const companies = await this.getCompanyPerformanceData(companyIds)

      // Calculate comparison matrix
      const comparison: Record<string, Record<string, number>> = {}
      const rankings: Record<string, number> = {}

      companies.forEach(company => {
        comparison[company.companyId] = {}
        metrics.forEach(metric => {
          const kpi = company.kpis.find(k => k.name === metric)
          comparison[company.companyId][metric] = kpi?.value || 0
        })
      })

      // Calculate rankings for each metric
      metrics.forEach(metric => {
        const values = companies
          .map(c => {
            const kpi = c.kpis.find(k => k.name === metric)
            return { companyId: c.companyId, value: kpi?.value || 0 }
          })
          .sort((a, b) => b.value - a.value)

        values.forEach((item, index) => {
          if (!rankings[item.companyId]) {
            rankings[item.companyId] = 0
          }
          rankings[item.companyId] += (index + 1) * (1 / metrics.length)
        })
      })

      return {
        companies,
        comparison,
        rankings,
      }
    } catch (error) {
      console.error('Failed to get company performance comparison:', error)
      throw error
    }
  }

  /**
   * Get industry benchmarking data
   */
  public async getIndustryBenchmarks(
    companies?: CompanyPerformance[]
  ): Promise<IndustryBenchmark[]> {
    try {
      const benchmarks: IndustryBenchmark[] = []

      // Mock industry benchmark data
      const industryData = {
        'Food Safety': {
          'Compliance Score': {
            average: 78,
            median: 80,
            topQuartile: 90,
            bottomQuartile: 65,
          },
          'Violation Rate': {
            average: 12,
            median: 8,
            topQuartile: 5,
            bottomQuartile: 20,
          },
          'Response Time': {
            average: 24,
            median: 18,
            topQuartile: 12,
            bottomQuartile: 48,
          },
        },
        'HACCP Management': {
          'Documentation Score': {
            average: 82,
            median: 85,
            topQuartile: 95,
            bottomQuartile: 70,
          },
          'Training Completion': {
            average: 75,
            median: 80,
            topQuartile: 95,
            bottomQuartile: 60,
          },
          'Audit Success Rate': {
            average: 88,
            median: 90,
            topQuartile: 98,
            bottomQuartile: 75,
          },
        },
      }

      // Calculate our values from company data
      const ourValues = companies
        ? this.calculateOurIndustryValues(companies)
        : {}

      // Generate benchmarks
      Object.entries(industryData).forEach(([industry, metrics]) => {
        Object.entries(metrics).forEach(([metric, values]) => {
          const ourValue = ourValues[metric] || values.average
          const percentile = this.calculatePercentile(ourValue, values)

          benchmarks.push({
            industry,
            metric,
            average: values.average,
            median: values.median,
            topQuartile: values.topQuartile,
            bottomQuartile: values.bottomQuartile,
            ourValue,
            percentile,
            lastUpdated: new Date(),
          })
        })
      })

      console.log(`👔 Generated ${benchmarks.length} industry benchmarks`)
      return benchmarks
    } catch (error) {
      console.error('Failed to get industry benchmarks:', error)
      throw error
    }
  }

  /**
   * Generate executive insights and recommendations
   */
  public async generateExecutiveInsights(
    companies: CompanyPerformance[],
    startDate: Date,
    endDate: Date
  ): Promise<ExecutiveInsight[]> {
    try {
      const insights: ExecutiveInsight[] = []

      // Analyze performance trends
      const performanceInsights = this.analyzePerformanceTrends(companies)
      insights.push(...performanceInsights)

      // Analyze compliance issues
      const complianceInsights = this.analyzeComplianceIssues(companies)
      insights.push(...complianceInsights)

      // Identify opportunities
      const opportunityInsights = this.identifyOpportunities(companies)
      insights.push(...opportunityInsights)

      // Generate strategic recommendations
      const strategicInsights = this.generateStrategicRecommendations(companies)
      insights.push(...strategicInsights)

      // Sort by priority and confidence
      insights.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        const priorityDiff =
          priorityOrder[b.priority] - priorityOrder[a.priority]
        if (priorityDiff !== 0) return priorityDiff
        return b.confidence - a.confidence
      })

      console.log(`👔 Generated ${insights.length} executive insights`)
      return insights.slice(0, 10) // Return top 10 insights
    } catch (error) {
      console.error('Failed to generate executive insights:', error)
      throw error
    }
  }

  /**
   * Get real-time executive alerts
   */
  public async getExecutiveAlerts(): Promise<ExecutiveInsight[]> {
    try {
      const companies = await this.getCompanyPerformanceData()
      const alerts: ExecutiveInsight[] = []

      // Check for critical compliance issues
      companies.forEach(company => {
        if (company.riskLevel === 'critical') {
          alerts.push({
            id: `alert_critical_${company.companyId}`,
            type: 'concern',
            priority: 'high',
            title: `Critical Risk Alert: ${company.companyName}`,
            description: `${company.companyName} has critical compliance issues requiring immediate attention.`,
            impact: 'negative',
            affectedCompanies: [company.companyId],
            recommendation:
              'Schedule immediate compliance review and implement corrective actions.',
            timeline: 'Within 24 hours',
            confidence: 0.95,
            createdAt: new Date(),
          })
        }

        // Check for significant performance drops
        if (company.growthRate < -10) {
          alerts.push({
            id: `alert_performance_${company.companyId}`,
            type: 'concern',
            priority: 'medium',
            title: `Performance Decline: ${company.companyName}`,
            description: `${company.companyName} shows significant performance decline (${company.growthRate.toFixed(1)}%).`,
            impact: 'negative',
            affectedCompanies: [company.companyId],
            recommendation:
              'Review operational processes and implement improvement initiatives.',
            timeline: 'Within 7 days',
            confidence: 0.85,
            createdAt: new Date(),
          })
        }
      })

      console.log(`👔 Generated ${alerts.length} executive alerts`)
      return alerts
    } catch (error) {
      console.error('Failed to get executive alerts:', error)
      throw error
    }
  }

  // Private helper methods

  private async getCompanyPerformanceData(
    companyIds?: string[]
  ): Promise<CompanyPerformance[]> {
    // Mock implementation - would fetch from database
    const companies: CompanyPerformance[] = []
    const companyCount = companyIds?.length || 10

    for (let i = 0; i < companyCount; i++) {
      const companyId = companyIds?.[i] || `COMPANY_${i + 1}`
      const baseScore = 75 + Math.sin(i / 5) * 15 + Math.random() * 10

      companies.push({
        companyId,
        companyName: `Company ${i + 1}`,
        overallScore: Math.max(0, Math.min(100, baseScore)),
        kpis: this.generateCompanyKPIs(companyId),
        ranking: i + 1,
        lastAssessment: new Date(
          Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
        ),
        growthRate: -5 + Math.random() * 20,
        riskLevel: this.determineRiskLevel(baseScore),
      })
    }

    return companies
  }

  private generateCompanyKPIs(companyId: string): ExecutiveKPI[] {
    return [
      {
        id: `compliance_${companyId}`,
        name: 'Overall Compliance Score',
        category: 'compliance',
        value: 78 + Math.random() * 20,
        target: 90,
        unit: '%',
        trend: Math.random() > 0.5 ? 'up' : 'down',
        trendValue: Math.random() * 10,
        trendPeriod: '30 days',
        status: 'good',
        lastUpdated: new Date(),
        description: 'Overall HACCP compliance score',
      },
      {
        id: `violations_${companyId}`,
        name: 'Critical Violations',
        category: 'compliance',
        value: Math.floor(Math.random() * 5),
        target: 0,
        unit: 'count',
        trend: 'down',
        trendValue: -1,
        trendPeriod: '30 days',
        status: 'warning',
        lastUpdated: new Date(),
        description: 'Number of critical compliance violations',
      },
      {
        id: `response_time_${companyId}`,
        name: 'Average Response Time',
        category: 'performance',
        value: 18 + Math.random() * 12,
        target: 12,
        unit: 'hours',
        trend: 'down',
        trendValue: -2,
        trendPeriod: '30 days',
        status: 'good',
        lastUpdated: new Date(),
        description: 'Average time to respond to compliance issues',
      },
      {
        id: `training_${companyId}`,
        name: 'Training Completion Rate',
        category: 'performance',
        value: 85 + Math.random() * 15,
        target: 95,
        unit: '%',
        trend: 'up',
        trendValue: 5,
        trendPeriod: '30 days',
        status: 'good',
        lastUpdated: new Date(),
        description: 'Percentage of staff completing required training',
      },
    ]
  }

  private determineRiskLevel(
    score: number
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 90) return 'low'
    if (score >= 80) return 'medium'
    if (score >= 70) return 'high'
    return 'critical'
  }

  private aggregateKPIsAcrossCompanies(
    companies: CompanyPerformance[]
  ): ExecutiveKPI[] {
    const kpiMap = new Map<string, ExecutiveKPI>()

    companies.forEach(company => {
      company.kpis.forEach(kpi => {
        const key = `${kpi.category}_${kpi.name}`

        if (kpiMap.has(key)) {
          const existing = kpiMap.get(key)!
          existing.value = (existing.value + kpi.value) / 2
          existing.target = (existing.target + kpi.target) / 2
        } else {
          kpiMap.set(key, { ...kpi })
        }
      })
    })

    return Array.from(kpiMap.values())
  }

  private calculateDerivedKPIs(
    companies: CompanyPerformance[]
  ): ExecutiveKPI[] {
    const totalCompanies = companies.length
    const totalScore = companies.reduce((sum, c) => sum + c.overallScore, 0)
    const averageScore = totalScore / totalCompanies
    const criticalCompanies = companies.filter(
      c => c.riskLevel === 'critical'
    ).length

    return [
      {
        id: 'portfolio_compliance',
        name: 'Portfolio Compliance Average',
        category: 'compliance',
        value: averageScore,
        target: 85,
        unit: '%',
        trend: 'up',
        trendValue: 2.5,
        trendPeriod: '30 days',
        status:
          averageScore >= 85
            ? 'excellent'
            : averageScore >= 75
              ? 'good'
              : 'warning',
        lastUpdated: new Date(),
        description: 'Average compliance score across all companies',
      },
      {
        id: 'critical_risk_companies',
        name: 'Companies at Critical Risk',
        category: 'risk',
        value: criticalCompanies,
        target: 0,
        unit: 'count',
        trend: criticalCompanies === 0 ? 'stable' : 'up',
        trendValue: criticalCompanies,
        trendPeriod: '30 days',
        status: criticalCompanies === 0 ? 'excellent' : 'critical',
        lastUpdated: new Date(),
        description: 'Number of companies with critical risk levels',
      },
    ]
  }

  private async calculateKeyMetrics(
    companies: CompanyPerformance[],
    startDate: Date,
    endDate: Date
  ): Promise<ExecutiveSummary['keyMetrics']> {
    const averageCompliance =
      companies.reduce((sum, c) => sum + c.overallScore, 0) / companies.length
    const totalViolations = companies.reduce((sum, c) => {
      const violationsKpi = c.kpis.find(k => k.name === 'Critical Violations')
      return sum + (violationsKpi?.value || 0)
    }, 0)

    return {
      averageCompliance,
      totalViolations,
      resolvedIssues: Math.floor(totalViolations * 0.7),
      pendingActions: Math.floor(totalViolations * 0.3),
    }
  }

  private calculateOverallCompliance(companies: CompanyPerformance[]): number {
    return (
      companies.reduce((sum, c) => sum + c.overallScore, 0) / companies.length
    )
  }

  private countCriticalAlerts(companies: CompanyPerformance[]): number {
    return companies.filter(c => c.riskLevel === 'critical').length
  }

  private calculateOurIndustryValues(
    companies: CompanyPerformance[]
  ): Record<string, number> {
    const averageCompliance =
      companies.reduce((sum, c) => sum + c.overallScore, 0) / companies.length
    const averageViolations =
      companies.reduce((sum, c) => {
        const violationsKpi = c.kpis.find(k => k.name === 'Critical Violations')
        return sum + (violationsKpi?.value || 0)
      }, 0) / companies.length
    const averageResponseTime =
      companies.reduce((sum, c) => {
        const responseKpi = c.kpis.find(k => k.name === 'Average Response Time')
        return sum + (responseKpi?.value || 0)
      }, 0) / companies.length

    return {
      'Compliance Score': averageCompliance,
      'Violation Rate': averageViolations,
      'Response Time': averageResponseTime,
      'Documentation Score': averageCompliance * 1.05,
      'Training Completion': averageCompliance * 0.95,
      'Audit Success Rate': averageCompliance * 1.1,
    }
  }

  private calculatePercentile(
    ourValue: number,
    benchmark: {
      average: number
      median: number
      topQuartile: number
      bottomQuartile: number
    }
  ): number {
    if (ourValue >= benchmark.topQuartile) return 90
    if (ourValue >= benchmark.median) return 75
    if (ourValue >= benchmark.average) return 50
    if (ourValue >= benchmark.bottomQuartile) return 25
    return 10
  }

  private analyzePerformanceTrends(
    companies: CompanyPerformance[]
  ): ExecutiveInsight[] {
    const insights: ExecutiveInsight[] = []
    const improvingCompanies = companies.filter(c => c.growthRate > 5)
    const decliningCompanies = companies.filter(c => c.growthRate < -5)

    if (improvingCompanies.length > companies.length * 0.3) {
      insights.push({
        id: 'trend_performance_improvement',
        type: 'trend',
        priority: 'medium',
        title: 'Positive Performance Trend',
        description: `${improvingCompanies.length} companies showing significant performance improvement.`,
        impact: 'positive',
        affectedCompanies: improvingCompanies.map(c => c.companyId),
        recommendation:
          'Analyze best practices from top performers and share across portfolio.',
        timeline: 'Ongoing',
        confidence: 0.8,
        createdAt: new Date(),
      })
    }

    if (decliningCompanies.length > companies.length * 0.2) {
      insights.push({
        id: 'trend_performance_decline',
        type: 'concern',
        priority: 'high',
        title: 'Performance Decline Trend',
        description: `${decliningCompanies.length} companies showing performance decline.`,
        impact: 'negative',
        affectedCompanies: decliningCompanies.map(c => c.companyId),
        recommendation:
          'Implement immediate intervention programs for underperforming companies.',
        timeline: 'Within 2 weeks',
        confidence: 0.85,
        createdAt: new Date(),
      })
    }

    return insights
  }

  private analyzeComplianceIssues(
    companies: CompanyPerformance[]
  ): ExecutiveInsight[] {
    const insights: ExecutiveInsight[] = []
    const criticalCompanies = companies.filter(c => c.riskLevel === 'critical')

    if (criticalCompanies.length > 0) {
      insights.push({
        id: 'compliance_critical_issues',
        type: 'concern',
        priority: 'high',
        title: 'Critical Compliance Issues',
        description: `${criticalCompanies.length} companies have critical compliance issues requiring immediate attention.`,
        impact: 'negative',
        affectedCompanies: criticalCompanies.map(c => c.companyId),
        recommendation:
          'Deploy compliance support team and implement emergency corrective measures.',
        timeline: 'Within 48 hours',
        confidence: 0.95,
        createdAt: new Date(),
      })
    }

    return insights
  }

  private identifyOpportunities(
    companies: CompanyPerformance[]
  ): ExecutiveInsight[] {
    const insights: ExecutiveInsight[] = []
    const highPerformers = companies.filter(c => c.overallScore >= 90)

    if (highPerformers.length > 0) {
      insights.push({
        id: 'opportunity_best_practices',
        type: 'opportunity',
        priority: 'medium',
        title: 'Best Practice Sharing Opportunity',
        description: `${highPerformers.length} companies are exceeding compliance targets.`,
        impact: 'positive',
        affectedCompanies: highPerformers.map(c => c.companyId),
        recommendation:
          'Create best practice documentation and knowledge sharing sessions.',
        timeline: 'Within 30 days',
        confidence: 0.75,
        createdAt: new Date(),
      })
    }

    return insights
  }

  private generateStrategicRecommendations(
    companies: CompanyPerformance[]
  ): ExecutiveInsight[] {
    const insights: ExecutiveInsight[] = []
    const averageCompliance =
      companies.reduce((sum, c) => sum + c.overallScore, 0) / companies.length

    if (averageCompliance < 80) {
      insights.push({
        id: 'strategic_portfolio_improvement',
        type: 'achievement',
        priority: 'high',
        title: 'Portfolio-wide Compliance Improvement',
        description:
          'Overall portfolio compliance is below target. Strategic intervention needed.',
        impact: 'neutral',
        affectedCompanies: companies.map(c => c.companyId),
        recommendation:
          'Implement portfolio-wide compliance improvement program with dedicated resources.',
        timeline: 'Within 90 days',
        confidence: 0.9,
        createdAt: new Date(),
      })
    }

    return insights
  }
}

// Export singleton instance
export const executiveDashboard = new ExecutiveDashboard()

export default executiveDashboard
