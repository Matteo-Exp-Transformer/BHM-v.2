/**
 * AdvancedAnalyticsPage - B.10.2 Advanced Analytics & Reporting
 * Main page integrating all B.10.2 analytics features
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  BarChart3,
  Brain,
  TrendingUp,
  Users,
  Shield,
  Clock,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react'

// Import B.10.2 components
import { PredictiveDashboard } from '@/components/analytics'
import { ReportDesigner } from '@/components/reporting'
import { ExecutiveOverview } from '@/components/businessIntelligence'

// Import integration service
import { advancedAnalyticsIntegration } from '@/services/integration/AdvancedAnalyticsIntegration'

interface AdvancedAnalyticsPageProps {
  companyId?: string
}

export const AdvancedAnalyticsPage: React.FC<AdvancedAnalyticsPageProps> = ({
  companyId = 'default',
}) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [integrationStatus, setIntegrationStatus] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    initializeAdvancedAnalytics()
  }, [])

  const initializeAdvancedAnalytics = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Initialize integration service
      await advancedAnalyticsIntegration.initialize()

      // Get integration status
      const status = advancedAnalyticsIntegration.getIntegrationHealth()
      setIntegrationStatus(status)

      console.log('✅ Advanced Analytics initialized successfully')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to initialize advanced analytics'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const getIntegrationStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-600 bg-green-100 border-green-200'
      case 'disconnected':
        return 'text-orange-600 bg-orange-100 border-orange-200'
      case 'error':
        return 'text-red-600 bg-red-100 border-red-200'
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  const getIntegrationStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'disconnected':
        return <Clock className="h-4 w-4 text-orange-500" />
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Initializing Advanced Analytics...</span>
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
            onClick={initializeAdvancedAnalytics}
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
          <h1 className="text-3xl font-bold">Advanced Analytics & Reporting</h1>
          <p className="text-muted-foreground">
            B.10.2 - AI-powered analytics, custom reporting, and business
            intelligence
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span>B.10.2 Active</span>
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={initializeAdvancedAnalytics}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Integration Status */}
      {integrationStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>System Integration Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {integrationStatus.connectedServices}
                </div>
                <div className="text-xs text-muted-foreground">Connected</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {integrationStatus.disconnectedServices}
                </div>
                <div className="text-xs text-muted-foreground">
                  Disconnected
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {integrationStatus.errorServices}
                </div>
                <div className="text-xs text-muted-foreground">Errors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {integrationStatus.averageResponseTime}ms
                </div>
                <div className="text-xs text-muted-foreground">
                  Avg Response
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Analytics Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="predictive">Predictive</TabsTrigger>
          <TabsTrigger value="reporting">Reporting</TabsTrigger>
          <TabsTrigger value="executive">Executive</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Feature Cards */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Predictive Analytics
                </CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">AI-Powered</div>
                <p className="text-xs text-muted-foreground">
                  ML models for forecasting
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Custom Reporting
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Drag & Drop</div>
                <p className="text-xs text-muted-foreground">
                  Dynamic report builder
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Executive BI
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">C-Level</div>
                <p className="text-xs text-muted-foreground">
                  Business intelligence
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  System Integration
                </CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Cross-System</div>
                <p className="text-xs text-muted-foreground">
                  B.8.2 + B.9.1 + B.10.1
                </p>
              </CardContent>
            </Card>
          </div>

          {/* B.10.2 Features Summary */}
          <Card>
            <CardHeader>
              <CardTitle>
                B.10.2 Advanced Analytics & Reporting Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center space-x-2">
                    <Brain className="h-5 w-5 text-blue-500" />
                    <span>Session 1-2: Predictive Analytics</span>
                  </h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Machine learning models for HACCP prediction</li>
                    <li>• Temperature trend forecasting</li>
                    <li>• Compliance risk assessment algorithms</li>
                    <li>• Real-time analytics processing pipeline</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-green-500" />
                    <span>Session 3-4: Custom Reporting</span>
                  </h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Flexible report builder with drag-and-drop</li>
                    <li>• Advanced data filtering and aggregation</li>
                    <li>• Automated report scheduling system</li>
                    <li>• Multi-format export capabilities</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-purple-500" />
                    <span>Session 5-6: Business Intelligence</span>
                  </h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Executive BI dashboard with KPIs</li>
                    <li>• Cross-company analytics aggregation</li>
                    <li>• Performance benchmarking</li>
                    <li>• Real-time monitoring and alerts</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Predictive Analytics Tab */}
        <TabsContent value="predictive" className="space-y-4">
          <PredictiveDashboard
            companyId={companyId}
            onInsightClick={insight => {
              console.log('Insight clicked:', insight)
            }}
            onAlertClick={alert => {
              console.log('Alert clicked:', alert)
            }}
          />
        </TabsContent>

        {/* Reporting Tab */}
        <TabsContent value="reporting" className="space-y-4">
          <ReportDesigner
            onSave={report => {
              console.log('Report saved:', report)
            }}
            onPreview={report => {
              console.log('Report preview:', report)
            }}
            onExport={(report, format) => {
              console.log('Report export:', report, format)
            }}
          />
        </TabsContent>

        {/* Executive Tab */}
        <TabsContent value="executive" className="space-y-4">
          <ExecutiveOverview
            companyIds={[companyId]}
            onCompanyClick={companyId => {
              console.log('Company clicked:', companyId)
            }}
            onInsightClick={insight => {
              console.log('Executive insight clicked:', insight)
            }}
          />
        </TabsContent>

        {/* Integration Tab */}
        <TabsContent value="integration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Integration Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Integrated Systems</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="default">B.8.2</Badge>
                        <span className="font-medium">Dashboard Analytics</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Real-time KPIs, Chart.js integration, export system
                      </p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="default">B.9.1</Badge>
                        <span className="font-medium">Security System</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Security monitoring, HACCP compliance, audit logging
                      </p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="default">B.10.1</Badge>
                        <span className="font-medium">Integration Testing</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Comprehensive testing, performance benchmarking
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">
                    Integration Capabilities
                  </h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Cross-system data synchronization</li>
                    <li>• Unified analytics processing</li>
                    <li>• Integrated alert management</li>
                    <li>• Consolidated reporting</li>
                    <li>• Real-time health monitoring</li>
                  </ul>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={async () => {
                      await advancedAnalyticsIntegration.syncDataAcrossSystems()
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Sync Data
                  </Button>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      const data =
                        await advancedAnalyticsIntegration.getCrossSystemDashboardData()
                      console.log('Cross-system data:', data)
                    }}
                  >
                    <BarChart3 className="h-4 w-4 mr-1" />
                    Get Cross-System Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AdvancedAnalyticsPage
