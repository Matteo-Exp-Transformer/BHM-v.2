/**
 * ExecutiveOverview - B.10.2 Advanced Analytics & Reporting
 * C-level dashboard view with high-level business metrics and insights
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Progress } from '@/components/ui/Progress'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Target,
  BarChart3,
  Users,
  Shield,
  Clock,
  RefreshCw,
  Download,
  Settings,
  Award,
  AlertCircle,
  Info,
} from 'lucide-react'

import {
  executiveDashboard,
  ExecutiveSummary,
  ExecutiveKPI,
  CompanyPerformance,
  ExecutiveInsight,
} from '@/services/businessIntelligence'

interface ExecutiveOverviewProps {
  companyIds?: string[]
  timeRange?: {
    start: Date
    end: Date
  }
  onCompanyClick?: (companyId: string) => void
  onInsightClick?: (insight: ExecutiveInsight) => void
}

export const ExecutiveOverview: React.FC<ExecutiveOverviewProps> = ({
  companyIds,
  timeRange = {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date(),
  },
  onCompanyClick,
  onInsightClick,
}) => {
  const [summary, setSummary] = useState<ExecutiveSummary | null>(null)
  const [kpis, setKpis] = useState<ExecutiveKPI[]>([])
  const [insights, setInsights] = useState<ExecutiveInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadExecutiveData()
  }, [companyIds, timeRange])

  const loadExecutiveData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [summaryData, kpisData, insightsData] = await Promise.all([
        executiveDashboard.getExecutiveSummary(
          timeRange.start,
          timeRange.end,
          companyIds
        ),
        executiveDashboard.getExecutiveKPIs(companyIds),
        executiveDashboard.getExecutiveAlerts(),
      ])

      setSummary(summaryData)
      setKpis(kpisData)
      setInsights(insightsData)
      setLastUpdated(new Date())
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load executive data'
      )
    } finally {
      setLoading(false)
    }
  }

  const getKPIStatusColor = (status: ExecutiveKPI['status']) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600 bg-green-100 border-green-200'
      case 'good':
        return 'text-blue-600 bg-blue-100 border-blue-200'
      case 'warning':
        return 'text-orange-600 bg-orange-100 border-orange-200'
      case 'critical':
        return 'text-red-600 bg-red-100 border-red-200'
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  const getKPIStatusIcon = (status: ExecutiveKPI['status']) => {
    switch (status) {
      case 'excellent':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'good':
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Target className="h-4 w-4 text-blue-500" />
    }
  }

  const getInsightPriorityColor = (priority: ExecutiveInsight['priority']) => {
    switch (priority) {
      case 'high':
        return 'destructive'
      case 'medium':
        return 'default'
      case 'low':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getInsightTypeIcon = (type: ExecutiveInsight['type']) => {
    switch (type) {
      case 'achievement':
        return <Award className="h-5 w-5 text-green-500" />
      case 'concern':
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case 'opportunity':
        return <Target className="h-5 w-5 text-blue-500" />
      case 'trend':
        return <TrendingUp className="h-5 w-5 text-purple-500" />
      default:
        return <Info className="h-5 w-5 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading executive overview...</span>
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
            onClick={loadExecutiveData}
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
          <h1 className="text-3xl font-bold">Executive Overview</h1>
          <p className="text-muted-foreground">
            High-level business intelligence and performance metrics
          </p>
          {lastUpdated && (
            <p className="text-sm text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadExecutiveData}>
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
      {insights.filter(insight => insight.priority === 'high').length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {insights.filter(insight => insight.priority === 'high').length}{' '}
            high-priority issues require executive attention
          </AlertDescription>
        </Alert>
      )}

      {/* Main Dashboard Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="kpis">KPIs</TabsTrigger>
          <TabsTrigger value="companies">Companies</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Key Metrics Cards */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Portfolio Compliance
                </CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary?.overallCompliance.toFixed(1) || 'N/A'}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Average across {summary?.totalCompanies || 0} companies
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Violations
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary?.keyMetrics.totalViolations || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {summary?.keyMetrics.resolvedIssues || 0} resolved
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Critical Alerts
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary?.criticalAlerts || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Companies at risk
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Actions
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary?.keyMetrics.pendingActions || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Requiring attention
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Top and Bottom Performers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-green-500" />
                  <span>Top Performers</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {summary?.topPerformers.slice(0, 5).map((company, index) => (
                    <div
                      key={company.companyId}
                      className="flex items-center justify-between p-2 hover:bg-muted rounded cursor-pointer"
                      onClick={() => onCompanyClick?.(company.companyId)}
                    >
                      <div className="flex items-center space-x-3">
                        <Badge
                          variant="outline"
                          className="w-6 h-6 flex items-center justify-center p-0"
                        >
                          {index + 1}
                        </Badge>
                        <span className="font-medium">
                          {company.companyName}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">
                          {company.overallScore.toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {company.growthRate > 0 ? '+' : ''}
                          {company.growthRate.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  <span>Attention Required</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {summary?.bottomPerformers
                    .slice(0, 5)
                    .map((company, index) => (
                      <div
                        key={company.companyId}
                        className="flex items-center justify-between p-2 hover:bg-muted rounded cursor-pointer"
                        onClick={() => onCompanyClick?.(company.companyId)}
                      >
                        <div className="flex items-center space-x-3">
                          <Badge
                            variant={
                              company.riskLevel === 'critical'
                                ? 'destructive'
                                : 'secondary'
                            }
                            className="w-6 h-6 flex items-center justify-center p-0"
                          >
                            {index + 1}
                          </Badge>
                          <span className="font-medium">
                            {company.companyName}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">
                            {company.overallScore.toFixed(1)}%
                          </div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {company.riskLevel}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* KPIs Tab */}
        <TabsContent value="kpis" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {kpis.map(kpi => (
              <Card key={kpi.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-sm">{kpi.name}</span>
                    <div className="flex items-center space-x-2">
                      {getKPIStatusIcon(kpi.status)}
                      {getTrendIcon(kpi.trend)}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">
                        {kpi.value.toFixed(1)}
                        <span className="text-sm font-normal text-muted-foreground ml-1">
                          {kpi.unit}
                        </span>
                      </div>
                      <Badge className={getKPIStatusColor(kpi.status)}>
                        {kpi.status}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Target:</span>
                        <span className="font-medium">
                          {kpi.target} {kpi.unit}
                        </span>
                      </div>
                      <Progress
                        value={(kpi.value / kpi.target) * 100}
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                          Trend: {kpi.trendValue > 0 ? '+' : ''}
                          {kpi.trendValue.toFixed(1)}
                        </span>
                        <span>{kpi.trendPeriod}</span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {kpi.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Companies Tab */}
        <TabsContent value="companies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Company Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {summary?.topPerformers
                  .concat(summary?.bottomPerformers || [])
                  .map(company => (
                    <div
                      key={company.companyId}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted cursor-pointer"
                      onClick={() => onCompanyClick?.(company.companyId)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">
                            Rank
                          </div>
                          <div className="font-bold text-lg">
                            {company.ranking}
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold">
                            {company.companyName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Last assessment:{' '}
                            {company.lastAssessment.toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">
                            Score
                          </div>
                          <div className="font-bold text-lg">
                            {company.overallScore.toFixed(1)}%
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">
                            Growth
                          </div>
                          <div
                            className={`font-bold text-lg ${company.growthRate > 0 ? 'text-green-600' : 'text-red-600'}`}
                          >
                            {company.growthRate > 0 ? '+' : ''}
                            {company.growthRate.toFixed(1)}%
                          </div>
                        </div>
                        <Badge
                          variant={
                            company.riskLevel === 'critical'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {company.riskLevel}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
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
                      {getInsightTypeIcon(insight.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold">{insight.title}</h3>
                        <Badge
                          variant={getInsightPriorityColor(insight.priority)}
                        >
                          {insight.priority}
                        </Badge>
                        <Badge variant="outline">
                          {Math.round(insight.confidence * 100)}% confidence
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-3">
                        {insight.description}
                      </p>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Recommendation:</p>
                        <p className="text-sm text-muted-foreground">
                          {insight.recommendation}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Timeline: {insight.timeline}</span>
                          <span>{insight.createdAt.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Benchmarks Tab */}
        <TabsContent value="benchmarks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Industry Benchmarks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {summary?.benchmarks.map(benchmark => (
                  <div
                    key={`${benchmark.industry}_${benchmark.metric}`}
                    className="p-4 border rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{benchmark.metric}</h4>
                      <Badge
                        variant={
                          benchmark.percentile >= 75
                            ? 'default'
                            : benchmark.percentile >= 50
                              ? 'secondary'
                              : 'destructive'
                        }
                      >
                        {benchmark.percentile.toFixed(0)}th percentile
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          Our Value:
                        </span>
                        <div className="font-medium">
                          {benchmark.ourValue.toFixed(1)}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Industry Avg:
                        </span>
                        <div className="font-medium">
                          {benchmark.average.toFixed(1)}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Top Quartile:
                        </span>
                        <div className="font-medium">
                          {benchmark.topQuartile.toFixed(1)}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Industry:</span>
                        <div className="font-medium">{benchmark.industry}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ExecutiveOverview
