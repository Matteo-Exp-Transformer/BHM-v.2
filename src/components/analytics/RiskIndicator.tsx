/**
 * RiskIndicator - B.10.2 Advanced Analytics & Reporting
 * Risk assessment visualization and management component
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import {
  AlertTriangle,
  Shield,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  Users,
  Settings,
  BarChart3,
  PieChart,
  Activity,
} from 'lucide-react'

import {
  RiskAssessment,
  RiskFactor,
  RiskRecommendation,
} from '@/services/analytics'

interface RiskIndicatorProps {
  riskAssessment: RiskAssessment
  showDetails?: boolean
  showHistory?: boolean
  onRecommendationClick?: (recommendation: RiskRecommendation) => void
  onFactorClick?: (factor: RiskFactor) => void
  onUpdateAssessment?: () => void
}

export const RiskIndicator: React.FC<RiskIndicatorProps> = ({
  riskAssessment,
  showDetails = true,
  showHistory = false,
  onRecommendationClick,
  onFactorClick,
  onUpdateAssessment,
}) => {
  const [selectedTab, setSelectedTab] = useState('overview')
  const [expandedFactors, setExpandedFactors] = useState<Set<string>>(new Set())

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical':
        return {
          bg: 'bg-red-500',
          text: 'text-red-600',
          border: 'border-red-200',
          bgLight: 'bg-red-50',
        }
      case 'high':
        return {
          bg: 'bg-orange-500',
          text: 'text-orange-600',
          border: 'border-orange-200',
          bgLight: 'bg-orange-50',
        }
      case 'medium':
        return {
          bg: 'bg-yellow-500',
          text: 'text-yellow-600',
          border: 'border-yellow-200',
          bgLight: 'bg-yellow-50',
        }
      case 'low':
        return {
          bg: 'bg-green-500',
          text: 'text-green-600',
          border: 'border-green-200',
          bgLight: 'bg-green-50',
        }
      default:
        return {
          bg: 'bg-gray-500',
          text: 'text-gray-600',
          border: 'border-gray-200',
          bgLight: 'bg-gray-50',
        }
    }
  }

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />
      case 'medium':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'low':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      default:
        return <Shield className="h-5 w-5 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'destructive'
      case 'high':
        return 'default'
      case 'medium':
        return 'secondary'
      case 'low':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getImpactIcon = (category: string) => {
    switch (category) {
      case 'temperature':
        return '🌡️'
      case 'hygiene':
        return '🧼'
      case 'equipment':
        return '🔧'
      case 'staff':
        return '👥'
      case 'process':
        return '📋'
      case 'external':
        return '🌐'
      default:
        return '📊'
    }
  }

  const toggleFactorExpansion = (factorId: string) => {
    const newExpanded = new Set(expandedFactors)
    if (newExpanded.has(factorId)) {
      newExpanded.delete(factorId)
    } else {
      newExpanded.add(factorId)
    }
    setExpandedFactors(newExpanded)
  }

  const riskColors = getRiskLevelColor(riskAssessment.riskLevel)

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            {getRiskIcon(riskAssessment.riskLevel)}
            <span>Risk Assessment</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge
              className={`${riskColors.text} ${riskColors.bgLight} ${riskColors.border} border`}
            >
              {riskAssessment.riskLevel.toUpperCase()}
            </Badge>
            <Button variant="outline" size="sm" onClick={onUpdateAssessment}>
              <Settings className="h-4 w-4 mr-1" />
              Update
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="factors">Risk Factors</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {/* Risk Score */}
            <div className="text-center space-y-2">
              <div className={`text-4xl font-bold ${riskColors.text}`}>
                {riskAssessment.overallScore.toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">
                Overall Risk Score
              </div>
              <Progress value={riskAssessment.overallScore} className="h-2" />
            </div>

            {/* Risk Trend */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Risk Trend</span>
                <div className="flex items-center space-x-2">
                  {riskAssessment.trends.direction === 'improving' ? (
                    <TrendingDown className="h-4 w-4 text-green-500" />
                  ) : riskAssessment.trends.direction === 'deteriorating' ? (
                    <TrendingUp className="h-4 w-4 text-red-500" />
                  ) : (
                    <Activity className="h-4 w-4 text-blue-500" />
                  )}
                  <span className="text-sm capitalize">
                    {riskAssessment.trends.direction}
                  </span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Confidence: {Math.round(riskAssessment.trends.confidence * 100)}
                %
              </div>
            </div>

            {/* Assessment Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Last Assessment:</span>
                <div className="font-medium">
                  {riskAssessment.lastAssessment.toLocaleDateString()}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Next Assessment:</span>
                <div className="font-medium">
                  {riskAssessment.nextAssessment.toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Critical Alerts */}
            {riskAssessment.riskLevel === 'critical' && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Critical risk level detected. Immediate action required.
                </AlertDescription>
              </Alert>
            )}

            {riskAssessment.riskLevel === 'high' && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  High risk level detected. Review recommendations and take
                  action.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Risk Factors Tab */}
          <TabsContent value="factors" className="space-y-4">
            <div className="space-y-3">
              {riskAssessment.factors.map(factor => (
                <Card
                  key={factor.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    factor.status === 'critical'
                      ? 'border-red-200 bg-red-50'
                      : factor.status === 'warning'
                        ? 'border-orange-200 bg-orange-50'
                        : 'border-gray-200'
                  }`}
                  onClick={() => onFactorClick?.(factor)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">
                          {getImpactIcon(factor.category)}
                        </span>
                        <div>
                          <div className="font-medium">{factor.name}</div>
                          <div className="text-sm text-muted-foreground capitalize">
                            {factor.category} • {factor.impact} impact
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="font-bold text-lg">
                            {factor.score.toFixed(1)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Weight: {Math.round(factor.weight * 100)}%
                          </div>
                        </div>

                        <Badge
                          variant={
                            factor.status === 'critical'
                              ? 'destructive'
                              : factor.status === 'warning'
                                ? 'default'
                                : 'secondary'
                          }
                        >
                          {factor.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Factor Progress */}
                    <div className="mt-3">
                      <Progress value={factor.score} className="h-2" />
                    </div>

                    {/* Expanded Details */}
                    {expandedFactors.has(factor.id) && (
                      <div className="mt-3 pt-3 border-t space-y-2">
                        <div className="text-sm">
                          <span className="font-medium">Last Updated:</span>{' '}
                          {factor.lastUpdated.toLocaleString()}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Weight:</span>{' '}
                          {Math.round(factor.weight * 100)}%
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Impact Level:</span>{' '}
                          <Badge variant="outline" className="ml-1">
                            {factor.impact}
                          </Badge>
                        </div>
                      </div>
                    )}

                    {/* Expand/Collapse Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 w-full"
                      onClick={e => {
                        e.stopPropagation()
                        toggleFactorExpansion(factor.id)
                      }}
                    >
                      {expandedFactors.has(factor.id)
                        ? 'Show Less'
                        : 'Show More'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Risk Factors Summary */}
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Risk Factors Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {
                        riskAssessment.factors.filter(
                          f => f.status === 'critical'
                        ).length
                      }
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Critical
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {
                        riskAssessment.factors.filter(
                          f => f.status === 'warning'
                        ).length
                      }
                    </div>
                    <div className="text-xs text-muted-foreground">Warning</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {
                        riskAssessment.factors.filter(
                          f => f.status === 'normal'
                        ).length
                      }
                    </div>
                    <div className="text-xs text-muted-foreground">Normal</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {riskAssessment.factors.length}
                    </div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-4">
            <div className="space-y-3">
              {riskAssessment.recommendations.map(recommendation => (
                <Card
                  key={recommendation.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onRecommendationClick?.(recommendation)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium">
                            {recommendation.title}
                          </h4>
                          <Badge
                            variant={getPriorityColor(recommendation.priority)}
                          >
                            {recommendation.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {recommendation.description}
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                          <div>
                            <span className="text-muted-foreground">
                              Impact:
                            </span>
                            <div className="font-medium capitalize">
                              {recommendation.impact}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Effort:
                            </span>
                            <div className="font-medium capitalize">
                              {recommendation.effort}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Timeline:
                            </span>
                            <div className="font-medium">
                              {recommendation.timeline}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Cost:</span>
                            <div className="font-medium capitalize">
                              {recommendation.cost}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recommendations Summary */}
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Recommendations Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {
                        riskAssessment.recommendations.filter(
                          r => r.priority === 'urgent'
                        ).length
                      }
                    </div>
                    <div className="text-xs text-muted-foreground">Urgent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {
                        riskAssessment.recommendations.filter(
                          r => r.priority === 'high'
                        ).length
                      }
                    </div>
                    <div className="text-xs text-muted-foreground">High</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {
                        riskAssessment.recommendations.filter(
                          r => r.priority === 'medium'
                        ).length
                      }
                    </div>
                    <div className="text-xs text-muted-foreground">Medium</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">
                      {
                        riskAssessment.recommendations.filter(
                          r => r.priority === 'low'
                        ).length
                      }
                    </div>
                    <div className="text-xs text-muted-foreground">Low</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default RiskIndicator
