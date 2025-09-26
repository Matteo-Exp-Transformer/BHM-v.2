/**
 * Dashboard Services - Integration Hub for B.8.2 + B.8.3
 * Provides unified interface for Cursor's dashboard components
 */

export {
  multiTenantDashboard,
  type DashboardMetrics,
  type CompanyDashboardData,
  type CrossCompanyAnalytics,
} from './MultiTenantDashboard'

// Real-time dashboard updates service
export class DashboardRealtimeService {
  private subscribers = new Set<(data: any) => void>()
  private updateInterval: NodeJS.Timeout | null = null

  /**
   * Subscribe to real-time dashboard updates
   */
  public subscribe(callback: (data: any) => void): () => void {
    this.subscribers.add(callback)

    // Start updates if first subscriber
    if (this.subscribers.size === 1) {
      this.startRealtimeUpdates()
    }

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback)
      if (this.subscribers.size === 0) {
        this.stopRealtimeUpdates()
      }
    }
  }

  private startRealtimeUpdates(): void {
    this.updateInterval = setInterval(async () => {
      try {
        const { multiTenantDashboard } = await import('./MultiTenantDashboard')
        const updates = await multiTenantDashboard.getRealtimeUpdates()

        this.subscribers.forEach(callback => {
          try {
            callback(updates)
          } catch (error) {
            console.error('Dashboard subscriber error:', error)
          }
        })
      } catch (error) {
        console.error('Dashboard realtime update error:', error)
      }
    }, 5000) // Update every 5 seconds
  }

  private stopRealtimeUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
  }
}

// Export singleton for real-time updates
export const dashboardRealtime = new DashboardRealtimeService()

// Dashboard widget registry for Cursor components
export const dashboardWidgets = {
  // KPI Widgets
  temperature_overview: {
    component: 'TemperatureOverviewWidget',
    dataSource: 'multiTenantDashboard.getCompanyMetrics',
    updateFrequency: 30000, // 30 seconds
  },
  compliance_score: {
    component: 'ComplianceScoreWidget',
    dataSource: 'multiTenantDashboard.getCrossCompanyAnalytics',
    updateFrequency: 60000, // 1 minute
  },
  alert_summary: {
    component: 'AlertSummaryWidget',
    dataSource: 'multiTenantDashboard.getRealtimeUpdates',
    updateFrequency: 10000, // 10 seconds
  },
  task_overview: {
    component: 'TaskOverviewWidget',
    dataSource: 'multiTenantDashboard.getCompanyMetrics',
    updateFrequency: 30000,
  },
  // Chart Widgets (for Cursor's Chart.js integration)
  temperature_trends: {
    component: 'TemperatureTrendsChart',
    dataSource: 'multiTenantDashboard.getCrossCompanyAnalytics',
    updateFrequency: 300000, // 5 minutes
    chartType: 'line',
  },
  compliance_trends: {
    component: 'ComplianceTrendsChart',
    dataSource: 'multiTenantDashboard.getCrossCompanyAnalytics',
    updateFrequency: 300000,
    chartType: 'bar',
  },
  company_comparison: {
    component: 'CompanyComparisonChart',
    dataSource: 'multiTenantDashboard.getCrossCompanyAnalytics',
    updateFrequency: 300000,
    chartType: 'radar',
  },
} as const

// Dashboard layout configurations
export const dashboardLayouts = {
  single_company: {
    widgets: [
      'temperature_overview',
      'compliance_score',
      'alert_summary',
      'task_overview',
      'temperature_trends',
    ],
    grid: {
      cols: 12,
      rows: 4,
      positions: {
        temperature_overview: { x: 0, y: 0, w: 3, h: 1 },
        compliance_score: { x: 3, y: 0, w: 3, h: 1 },
        alert_summary: { x: 6, y: 0, w: 3, h: 1 },
        task_overview: { x: 9, y: 0, w: 3, h: 1 },
        temperature_trends: { x: 0, y: 1, w: 12, h: 3 },
      },
    },
  },
  multi_company: {
    widgets: [
      'temperature_overview',
      'compliance_score',
      'alert_summary',
      'company_comparison',
      'temperature_trends',
      'compliance_trends',
    ],
    grid: {
      cols: 12,
      rows: 6,
      positions: {
        temperature_overview: { x: 0, y: 0, w: 4, h: 1 },
        compliance_score: { x: 4, y: 0, w: 4, h: 1 },
        alert_summary: { x: 8, y: 0, w: 4, h: 1 },
        company_comparison: { x: 0, y: 1, w: 6, h: 2 },
        temperature_trends: { x: 6, y: 1, w: 6, h: 2 },
        compliance_trends: { x: 0, y: 3, w: 12, h: 3 },
      },
    },
  },
} as const

// Performance optimization for dashboard
export const dashboardOptimizer = {
  /**
   * Optimize widget loading based on viewport
   */
  optimizeWidgetLoading: (visibleWidgets: string[]) => {
    return visibleWidgets.map(widgetId => ({
      id: widgetId,
      priority:
        dashboardWidgets[widgetId as keyof typeof dashboardWidgets]
          ?.updateFrequency < 30000
          ? 'high'
          : 'normal',
      shouldLazyLoad: !['temperature_overview', 'alert_summary'].includes(
        widgetId
      ),
    }))
  },

  /**
   * Get recommended update frequencies based on user activity
   */
  getOptimizedUpdateFrequencies: (userActive: boolean) => {
    const multiplier = userActive ? 1 : 3 // Slow down when user inactive

    return Object.fromEntries(
      Object.entries(dashboardWidgets).map(([key, widget]) => [
        key,
        widget.updateFrequency * multiplier,
      ])
    )
  },
}

// Export everything for Cursor's dashboard implementation
export default {
  multiTenantDashboard,
  dashboardRealtime,
  dashboardWidgets,
  dashboardLayouts,
  dashboardOptimizer,
}
