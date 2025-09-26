/**
 * B.8.3 Multi-Tenant Dashboard Integration
 * Provides multi-company data aggregation for Cursor's B.8.2 dashboard
 */

import { multiTenantServices } from '../multi-tenant'
import type { CompanyTenant } from '../multi-tenant/MultiTenantManager'

export interface DashboardMetrics {
  totalCompanies: number
  activeUsers: number
  temperatureReadings: number
  complianceScore: number
  pendingTasks: number
  criticalAlerts: number
}

export interface CompanyDashboardData {
  companyId: string
  companyName: string
  metrics: DashboardMetrics
  lastUpdated: Date
}

export interface CrossCompanyAnalytics {
  averageCompliance: number
  totalTemperatureReadings: number
  alertTrends: Array<{
    date: string
    count: number
    severity: 'low' | 'medium' | 'high' | 'critical'
  }>
  performanceComparison: Array<{
    companyId: string
    companyName: string
    score: number
    trend: 'up' | 'down' | 'stable'
  }>
}

/**
 * Multi-Tenant Dashboard Service
 * Integrates with Cursor's B.8.2 dashboard components
 */
class MultiTenantDashboardService {
  private initialized = false
  private currentUserId: string | null = null
  private accessibleCompanies: CompanyTenant[] = []

  /**
   * Initialize for dashboard integration
   */
  public async initialize(userId: string): Promise<void> {
    if (this.initialized && this.currentUserId === userId) {
      return
    }

    console.log('🏢 Initializing Multi-Tenant Dashboard Service...')

    try {
      // Get user's accessible companies
      this.accessibleCompanies = await this.getUserAccessibleCompanies(userId)
      console.log(`✅ Access to ${this.accessibleCompanies.length} companies`)

      this.currentUserId = userId
      this.initialized = true

      console.log('🚀 Multi-Tenant Dashboard Service ready')
    } catch (error) {
      console.error('❌ Failed to initialize multi-tenant dashboard:', error)
      throw error
    }
  }

  /**
   * Get dashboard metrics for all accessible companies
   */
  public async getAllCompaniesMetrics(): Promise<CompanyDashboardData[]> {
    this.ensureInitialized()

    const companiesData: CompanyDashboardData[] = []

    for (const company of this.accessibleCompanies) {
      try {
        const metrics = await this.getCompanyMetrics(company.id)
        companiesData.push({
          companyId: company.id,
          companyName: company.name,
          metrics,
          lastUpdated: new Date(),
        })
      } catch (error) {
        console.warn(
          `⚠️ Failed to get metrics for company ${company.id}:`,
          error
        )
        // Continue with other companies
      }
    }

    return companiesData
  }

  /**
   * Get metrics for a specific company
   */
  public async getCompanyMetrics(companyId: string): Promise<DashboardMetrics> {
    this.ensureInitialized()

    // Check permission
    const hasAccess = this.accessibleCompanies.some(c => c.id === companyId)
    if (!hasAccess) {
      throw new Error(`Access denied to company ${companyId}`)
    }

    // Initialize tenant context
    await multiTenantServices.initialize(companyId, this.currentUserId!)

    // Get aggregated metrics
    const analytics = await multiTenantServices.getTenantAnalytics()

    return {
      totalCompanies: this.accessibleCompanies.length,
      activeUsers: analytics.activeUsers || 0,
      temperatureReadings: analytics.temperatureReadings || 0,
      complianceScore: analytics.complianceScore || 0,
      pendingTasks: analytics.pendingTasks || 0,
      criticalAlerts: analytics.criticalAlerts || 0,
    }
  }

  /**
   * Get cross-company analytics for dashboard
   */
  public async getCrossCompanyAnalytics(): Promise<CrossCompanyAnalytics> {
    this.ensureInitialized()

    const allMetrics = await this.getAllCompaniesMetrics()

    // Calculate cross-company aggregations
    const totalReadings = allMetrics.reduce(
      (sum, data) => sum + data.metrics.temperatureReadings,
      0
    )
    const avgCompliance =
      allMetrics.reduce((sum, data) => sum + data.metrics.complianceScore, 0) /
      allMetrics.length

    // Mock alert trends (would come from actual data)
    const alertTrends = this.generateAlertTrends()

    // Performance comparison
    const performanceComparison = allMetrics.map(data => ({
      companyId: data.companyId,
      companyName: data.companyName,
      score: data.metrics.complianceScore,
      trend: this.calculateTrend(data.metrics.complianceScore) as
        | 'up'
        | 'down'
        | 'stable',
    }))

    return {
      averageCompliance: avgCompliance,
      totalTemperatureReadings: totalReadings,
      alertTrends,
      performanceComparison,
    }
  }

  /**
   * Get real-time dashboard updates
   */
  public async getRealtimeUpdates(
    companyId?: string
  ): Promise<Partial<DashboardMetrics>> {
    this.ensureInitialized()

    if (companyId) {
      // Single company updates
      const metrics = await this.getCompanyMetrics(companyId)
      return {
        temperatureReadings: metrics.temperatureReadings,
        criticalAlerts: metrics.criticalAlerts,
      }
    } else {
      // Cross-company updates
      const analytics = await this.getCrossCompanyAnalytics()
      return {
        totalCompanies: this.accessibleCompanies.length,
        temperatureReadings: analytics.totalTemperatureReadings,
        complianceScore: analytics.averageCompliance,
      }
    }
  }

  /**
   * Check if user has dashboard access to company
   */
  public async hasCompanyAccess(companyId: string): Promise<boolean> {
    this.ensureInitialized()

    return await multiTenantServices.hasPermission(
      this.currentUserId!,
      companyId,
      'dashboard.view'
    )
  }

  /**
   * Get available dashboard features for user
   */
  public getAvailableFeatures(): string[] {
    this.ensureInitialized()

    const features = ['basic_metrics']

    // Check if user has access to multiple companies
    if (this.accessibleCompanies.length > 1) {
      features.push('cross_company_analytics')
      features.push('performance_comparison')
    }

    // Check if user has admin features
    const hasAdminAccess = this.accessibleCompanies.some(company =>
      multiTenantServices.hasFeature('advanced_analytics')
    )

    if (hasAdminAccess) {
      features.push('advanced_analytics')
      features.push('custom_reports')
    }

    return features
  }

  // Private helper methods
  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('Multi-tenant dashboard service not initialized')
    }
  }

  private async getUserAccessibleCompanies(
    userId: string
  ): Promise<CompanyTenant[]> {
    // This would query the database for user's company access
    // For now, return mock data
    return [
      {
        id: 'company_1',
        name: 'HACCP Restaurant Alpha',
        plan: 'enterprise',
        status: 'active',
        limits: {
          max_users: 50,
          max_locations: 10,
          storage_gb: 100,
        },
        features: {
          advanced_analytics: true,
          cross_company_reporting: true,
          api_access: true,
          custom_branding: true,
        },
      },
    ]
  }

  private generateAlertTrends() {
    // Mock trend data - would come from actual database
    const trends = []
    for (let i = 7; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      trends.push({
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 20) + 5,
        severity: ['low', 'medium', 'high', 'critical'][
          Math.floor(Math.random() * 4)
        ] as any,
      })
    }
    return trends
  }

  private calculateTrend(score: number): string {
    // Simple trend calculation - would use historical data
    if (score > 85) return 'up'
    if (score < 70) return 'down'
    return 'stable'
  }

  /**
   * Get dashboard layout preferences for multi-tenant
   */
  public getDashboardLayout(userId: string, companyId?: string) {
    return {
      showCrossCompanyView: this.accessibleCompanies.length > 1,
      defaultView: companyId || this.accessibleCompanies[0]?.id,
      availableWidgets: [
        'kpi_overview',
        'temperature_trends',
        'compliance_score',
        'alert_summary',
        ...(this.accessibleCompanies.length > 1 ? ['company_comparison'] : []),
      ],
    }
  }
}

// Export singleton instance
export const multiTenantDashboard = new MultiTenantDashboardService()

// Export for Cursor's dashboard components
export default multiTenantDashboard
