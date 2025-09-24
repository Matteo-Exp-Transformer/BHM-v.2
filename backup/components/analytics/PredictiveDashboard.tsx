/**
 * PredictiveDashboard - B.10.2 Advanced Analytics & Reporting
 * Main analytics dashboard with predictive insights and forecasts
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Brain,
  BarChart3,
  Activity,
  Zap,
  Target,
  Calendar,
  RefreshCw,
  Download,
  Settings,
} from 'lucide-react'

import {
  analyticsProcessor,
  ProcessedAnalytics,
  AnalyticsInsight,
  AnalyticsAlert,
} from '@/services/analytics'

interface PredictiveDashboardProps {
  companyId: string
  onInsightClick?: (insight: AnalyticsInsight) => void
  onAlertClick?: (alert: AnalyticsAlert) => void
}

export const PredictiveDashboard: React.FC<PredictiveDashboardProps> = ({
  companyId,
  onInsightClick,
  onAlertClick,
}) => {
  const [dashboardData, setDashboardData] = useState<ProcessedAnalytics | null>(
    null
  )
  const [insights, setInsights] = useState<AnalyticsInsight[]>([])
  const [alerts, setAlerts] = useState<AnalyticsAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    loadDashboardData()

    // Set up auto-refresh every 5 minutes
    const interval = setInterval(loadDashboardData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [companyId])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await analyticsProcessor.getDashboardAnalytics(companyId)
      setDashboardData(data.overview)
      setInsights(data.insights)
      setAlerts(data.alerts)
      setLastUpdated(new Date())
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load dashboard data'
      )
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive'
      case 'warning':
        return 'default'
      case 'info':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-blue-500" />
    }
  }

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading predictive analytics...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {error}
          <Button
            variant="outline"
            size="sm"
            onClick={loadDashboardData}
            className="ml-2"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Predictive Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            AI-powered insights and forecasts for HACCP compliance
          </p>
          {lastUpdated && (
            <p className="text-sm text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadDashboardData}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </Button>
        </div>
      </div>

      {/* Critical Alerts */}
      {alerts.filter(alert => alert.severity === 'critical').length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {alerts.filter(alert => alert.severity === 'critical').length}{' '}
            critical alerts require immediate attention
          </AlertDescription>
        </Alert>
      )}

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="risks">Risk Assessment</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Key Metrics Cards */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Overall Risk Score
                </CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData?.risks[0]?.overallScore.toFixed(1) || 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Risk Level:{' '}
                  {dashboardData?.risks[0]?.riskLevel.toUpperCase() ||
                    'UNKNOWN'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Predictions
                </CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData?.predictions.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  High confidence:{' '}
                  {dashboardData?.predictions.filter(p => p.confidence > 0.8)
                    .length || 0}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Trend Analysis
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData?.trends.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Strong trends:{' '}
                  {dashboardData?.trends.filter(t => t.strength === 'strong')
                    .length || 0}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Alerts
                </CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{alerts.length}</div>
                <p className="text-xs text-muted-foreground">
                  Critical:{' '}
                  {alerts.filter(a => a.severity === 'critical').length}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {insights.slice(0, 5).map(insight => (
                  <div
                    key={insight.id}
                    className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                    onClick={() => onInsightClick?.(insight)}
                  >
                    <div className="flex-shrink-0">
                      {insight.severity === 'critical' ? (
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      ) : insight.severity === 'warning' ? (
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                      ) : (
                        <Brain className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {insight.description}
                      </p>
                      <div className="flex items-center mt-1 space-x-2">
                        <Badge variant={getSeverityColor(insight.severity)}>
                          {insight.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {Math.round(insight.confidence * 100)}% confidence
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {dashboardData?.predictions.map(prediction => (
              <Card key={prediction.type}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="h-5 w-5" />
                    <span>
                      {prediction.type.charAt(0).toUpperCase() +
                        prediction.type.slice(1)}{' '}
                      Prediction
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-2xl font-bold">
                      {prediction.prediction.toFixed(2)}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        {Math.round(prediction.confidence * 100)}% confidence
                      </Badge>
                      <Badge variant="secondary">{prediction.timeframe}</Badge>
                    </div>
                    {prediction.recommendation && (
                      <p className="text-sm text-muted-foreground">
                        {prediction.recommendation}
                      </p>
                    )}
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">
                        Key Factors:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {prediction.factors.map((factor, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {dashboardData?.trends.map(trend => (
              <Card key={trend.id}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {getTrendIcon(trend.direction)}
                    <span>{trend.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{trend.direction}</Badge>
                      <Badge variant="secondary">{trend.strength}</Badge>
                      <Badge variant="outline">
                        {Math.round(trend.confidence * 100)}% confidence
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>R² Score:</span>
                        <span className="font-medium">
                          {trend.rSquared.toFixed(3)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Slope:</span>
                        <span className="font-medium">
                          {trend.slope.toFixed(3)}
                        </span>
                      </div>
                    </div>

                    {trend.recommendations.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">
                          Recommendations:
                        </p>
                        <ul className="text-xs space-y-1">
                          {trend.recommendations
                            .slice(0, 3)
                            .map((rec, index) => (
                              <li key={index} className="text-muted-foreground">
                                • {rec}
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Risk Assessment Tab */}
        <TabsContent value="risks" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {dashboardData?.risks.map(risk => (
              <Card key={risk.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Risk Assessment</span>
                    <Badge className={getRiskLevelColor(risk.riskLevel)}>
                      {risk.riskLevel.toUpperCase()}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-3xl font-bold">
                      {risk.overallScore.toFixed(1)}
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Risk Factors:</p>
                      <div className="space-y-2">
                        {risk.factors.map(factor => (
                          <div
                            key={factor.id}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm">{factor.name}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium">
                                {factor.score.toFixed(1)}
                              </span>
                              <Badge
                                variant={
                                  factor.status === 'critical'
                                    ? 'destructive'
                                    : 'secondary'
                                }
                                className="text-xs"
                              >
                                {factor.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {risk.recommendations.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Recommendations:</p>
                        <div className="space-y-1">
                          {risk.recommendations.slice(0, 3).map(rec => (
                            <div
                              key={rec.id}
                              className="text-xs p-2 bg-muted rounded"
                            >
                              <div className="font-medium">{rec.title}</div>
                              <div className="text-muted-foreground">
                                {rec.description}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="space-y-4">
            {insights.map(insight => (
              <Card
                key={insight.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onInsightClick?.(insight)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {insight.severity === 'critical' ? (
                        <AlertTriangle className="h-6 w-6 text-red-500" />
                      ) : insight.severity === 'warning' ? (
                        <AlertTriangle className="h-6 w-6 text-orange-500" />
                      ) : (
                        <Brain className="h-6 w-6 text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold">{insight.title}</h3>
                        <Badge variant={getSeverityColor(insight.severity)}>
                          {insight.severity}
                        </Badge>
                        <Badge variant="outline">
                          {Math.round(insight.confidence * 100)}% confidence
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-3">
                        {insight.description}
                      </p>

                      {insight.recommendations.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">
                            Recommendations:
                          </p>
                          <ul className="text-sm space-y-1">
                            {insight.recommendations.map((rec, index) => (
                              <li key={index} className="text-muted-foreground">
                                • {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {insight.timestamp.toLocaleString()}
                          </span>
                        </div>
                        <Badge variant="secondary">{insight.type}</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default PredictiveDashboard
