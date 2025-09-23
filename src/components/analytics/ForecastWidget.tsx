/**
 * ForecastWidget - B.10.2 Advanced Analytics & Reporting
 * Predictive forecast display widget with confidence indicators
 */

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Brain,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  Calendar,
  BarChart3,
  RefreshCw,
} from 'lucide-react'

import { PredictionResult } from '@/services/analytics'

interface ForecastWidgetProps {
  prediction: PredictionResult
  showDetails?: boolean
  showConfidence?: boolean
  showFactors?: boolean
  onRefresh?: () => void
  onExport?: () => void
}

export const ForecastWidget: React.FC<ForecastWidgetProps> = ({
  prediction,
  showDetails = true,
  showConfidence = true,
  showFactors = true,
  onRefresh,
  onExport,
}) => {
  const [isLoading, setIsLoading] = useState(false)

  const getPredictionIcon = () => {
    switch (prediction.type) {
      case 'temperature':
        return '🌡️'
      case 'compliance':
        return '🛡️'
      case 'expiry':
        return '📅'
      case 'performance':
        return '📊'
      case 'risk':
        return '⚠️'
      default:
        return '🔮'
    }
  }

  const getPredictionColor = () => {
    switch (prediction.type) {
      case 'temperature':
        if (prediction.prediction > 8)
          return 'text-red-600 bg-red-50 border-red-200'
        if (prediction.prediction > 5)
          return 'text-orange-600 bg-orange-50 border-orange-200'
        return 'text-green-600 bg-green-50 border-green-200'
      case 'compliance':
        if (prediction.prediction < 60)
          return 'text-red-600 bg-red-50 border-red-200'
        if (prediction.prediction < 80)
          return 'text-orange-600 bg-orange-50 border-orange-200'
        return 'text-green-600 bg-green-50 border-green-200'
      case 'expiry':
        if (prediction.prediction < 3)
          return 'text-red-600 bg-red-50 border-red-200'
        if (prediction.prediction < 7)
          return 'text-orange-600 bg-orange-50 border-orange-200'
        return 'text-green-600 bg-green-50 border-green-200'
      case 'performance':
        if (prediction.prediction < 60)
          return 'text-red-600 bg-red-50 border-red-200'
        if (prediction.prediction < 80)
          return 'text-orange-600 bg-orange-50 border-orange-200'
        return 'text-green-600 bg-green-50 border-green-200'
      case 'risk':
        if (prediction.prediction > 80)
          return 'text-red-600 bg-red-50 border-red-200'
        if (prediction.prediction > 60)
          return 'text-orange-600 bg-orange-50 border-orange-200'
        return 'text-green-600 bg-green-50 border-green-200'
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600 bg-green-100'
    if (confidence >= 0.7) return 'text-blue-600 bg-blue-100'
    if (confidence >= 0.5) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.9) return 'Very High'
    if (confidence >= 0.7) return 'High'
    if (confidence >= 0.5) return 'Medium'
    return 'Low'
  }

  const getRecommendationIcon = () => {
    if (
      prediction.recommendation?.includes('Critical') ||
      prediction.recommendation?.includes('Immediate')
    ) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />
    }
    if (
      prediction.recommendation?.includes('Warning') ||
      prediction.recommendation?.includes('Monitor')
    ) {
      return <AlertTriangle className="h-4 w-4 text-orange-500" />
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />
  }

  const getRecommendationColor = () => {
    if (
      prediction.recommendation?.includes('Critical') ||
      prediction.recommendation?.includes('Immediate')
    ) {
      return 'border-red-200 bg-red-50'
    }
    if (
      prediction.recommendation?.includes('Warning') ||
      prediction.recommendation?.includes('Monitor')
    ) {
      return 'border-orange-200 bg-orange-50'
    }
    return 'border-green-200 bg-green-50'
  }

  const formatPredictionValue = () => {
    switch (prediction.type) {
      case 'temperature':
        return `${prediction.prediction.toFixed(1)}°C`
      case 'compliance':
        return `${prediction.prediction.toFixed(1)}%`
      case 'expiry':
        return `${Math.round(prediction.prediction)} days`
      case 'performance':
        return `${prediction.prediction.toFixed(1)}%`
      case 'risk':
        return `${prediction.prediction.toFixed(1)}%`
      default:
        return prediction.prediction.toFixed(2)
    }
  }

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsLoading(true)
      try {
        await onRefresh()
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <Card
      className={`w-full transition-all hover:shadow-md ${getPredictionColor()} border`}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <span className="text-2xl">{getPredictionIcon()}</span>
            <span className="capitalize">{prediction.type} Forecast</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
                />
              </Button>
            )}
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <BarChart3 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main Prediction Value */}
        <div className="text-center space-y-2">
          <div className="text-4xl font-bold">{formatPredictionValue()}</div>
          <div className="text-sm text-muted-foreground">
            Predicted for {prediction.timeframe}
          </div>
        </div>

        {/* Confidence Indicator */}
        {showConfidence && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Confidence Level</span>
              <Badge className={getConfidenceColor(prediction.confidence)}>
                {Math.round(prediction.confidence * 100)}%{' '}
                {getConfidenceLabel(prediction.confidence)}
              </Badge>
            </div>
            <Progress value={prediction.confidence * 100} className="h-2" />
          </div>
        )}

        {/* Recommendation */}
        {prediction.recommendation && (
          <Alert className={getRecommendationColor()}>
            {getRecommendationIcon()}
            <AlertDescription className="text-sm">
              {prediction.recommendation}
            </AlertDescription>
          </Alert>
        )}

        {/* Key Factors */}
        {showFactors && prediction.factors.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Key Factors</h4>
            <div className="flex flex-wrap gap-2">
              {prediction.factors.map((factor, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {factor.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Prediction Details */}
        {showDetails && (
          <div className="space-y-3 pt-3 border-t">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Prediction Type:</span>
                <div className="font-medium capitalize">{prediction.type}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Timeframe:</span>
                <div className="font-medium">{prediction.timeframe}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Confidence:</span>
                <div className="font-medium">
                  {Math.round(prediction.confidence * 100)}%
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Factors:</span>
                <div className="font-medium">{prediction.factors.length}</div>
              </div>
            </div>
          </div>
        )}

        {/* Prediction Quality Indicator */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Brain className="h-3 w-3" />
            <span>AI Prediction</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>Updated {new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Target className="h-4 w-4 mr-1" />
            View Details
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Calendar className="h-4 w-4 mr-1" />
            Schedule
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default ForecastWidget
