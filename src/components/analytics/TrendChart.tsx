/**
 * TrendChart - B.10.2 Advanced Analytics & Reporting
 * Advanced trend visualization component with interactive charts
 */

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  TrendingUp,
  TrendingDown,
  Activity,
  ZoomIn,
  ZoomOut,
  Download,
  Calendar,
  BarChart3,
  LineChart,
  PieChart,
} from 'lucide-react'

import { TrendAnalysis, TrendDataPoint } from '@/services/analytics'

interface TrendChartProps {
  trendAnalysis: TrendAnalysis
  timeRange?: '24h' | '7d' | '30d' | '90d' | '1y'
  chartType?: 'line' | 'bar' | 'area'
  showForecast?: boolean
  showAnomalies?: boolean
  onDataPointClick?: (dataPoint: TrendDataPoint) => void
  onExport?: (format: 'png' | 'svg' | 'csv') => void
}

export const TrendChart: React.FC<TrendChartProps> = ({
  trendAnalysis,
  timeRange = '30d',
  chartType = 'line',
  showForecast = true,
  showAnomalies = true,
  onDataPointClick,
  onExport,
}) => {
  const [selectedChartType, setSelectedChartType] = useState(chartType)
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    renderChart()
  }, [selectedChartType, selectedTimeRange, zoomLevel])

  const renderChart = async () => {
    if (!chartRef.current) return

    setIsLoading(true)

    try {
      // Clear previous chart
      chartRef.current.innerHTML = ''

      // Create mock chart data (in real implementation, would use D3.js or Chart.js)
      const chartElement = createMockChart()
      chartRef.current.appendChild(chartElement)
    } catch (error) {
      console.error('Failed to render chart:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const createMockChart = (): HTMLElement => {
    const container = document.createElement('div')
    container.className =
      'w-full h-80 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center'

    const chartContent = document.createElement('div')
    chartContent.className = 'text-center space-y-4'

    const icon =
      selectedChartType === 'line'
        ? '📈'
        : selectedChartType === 'bar'
          ? '📊'
          : '📉'
    chartContent.innerHTML = `
      <div class="text-6xl">${icon}</div>
      <div class="text-lg font-semibold text-gray-700">${trendAnalysis.name}</div>
      <div class="text-sm text-gray-500">
        ${trendAnalysis.direction} trend • ${trendAnalysis.strength} strength
      </div>
      <div class="text-xs text-gray-400">
        R² = ${trendAnalysis.rSquared.toFixed(3)} • Slope = ${trendAnalysis.slope.toFixed(3)}
      </div>
    `

    container.appendChild(chartContent)
    return container
  }

  const getTrendIcon = () => {
    switch (trendAnalysis.direction) {
      case 'increasing':
        return <TrendingUp className="h-5 w-5 text-green-500" />
      case 'decreasing':
        return <TrendingDown className="h-5 w-5 text-red-500" />
      default:
        return <Activity className="h-5 w-5 text-blue-500" />
    }
  }

  const getTrendColor = () => {
    switch (trendAnalysis.direction) {
      case 'increasing':
        return 'text-green-600 bg-green-100 border-green-200'
      case 'decreasing':
        return 'text-red-600 bg-red-100 border-red-200'
      default:
        return 'text-blue-600 bg-blue-100 border-blue-200'
    }
  }

  const getStrengthColor = () => {
    switch (trendAnalysis.strength) {
      case 'strong':
        return 'text-purple-600 bg-purple-100 border-purple-200'
      case 'moderate':
        return 'text-orange-600 bg-orange-100 border-orange-200'
      case 'weak':
        return 'text-gray-600 bg-gray-100 border-gray-200'
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  const handleExport = (format: 'png' | 'svg' | 'csv') => {
    onExport?.(format)
  }

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev * 1.5, 5))
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev / 1.5, 0.5))
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            {getTrendIcon()}
            <span>{trendAnalysis.name}</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge className={getTrendColor()}>{trendAnalysis.direction}</Badge>
            <Badge className={getStrengthColor()}>
              {trendAnalysis.strength}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Chart Type Selector */}
            <Select
              value={selectedChartType}
              onValueChange={setSelectedChartType}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">
                  <div className="flex items-center space-x-2">
                    <LineChart className="h-4 w-4" />
                    <span>Line</span>
                  </div>
                </SelectItem>
                <SelectItem value="bar">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4" />
                    <span>Bar</span>
                  </div>
                </SelectItem>
                <SelectItem value="area">
                  <div className="flex items-center space-x-2">
                    <PieChart className="h-4 w-4" />
                    <span>Area</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Time Range Selector */}
            <Select
              value={selectedTimeRange}
              onValueChange={setSelectedTimeRange}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">24h</SelectItem>
                <SelectItem value="7d">7d</SelectItem>
                <SelectItem value="30d">30d</SelectItem>
                <SelectItem value="90d">90d</SelectItem>
                <SelectItem value="1y">1y</SelectItem>
              </SelectContent>
            </Select>

            {/* Zoom Controls */}
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 0.5}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                {Math.round(zoomLevel * 100)}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 5}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Export Controls */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('png')}
            >
              <Download className="h-4 w-4 mr-1" />
              PNG
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('csv')}
            >
              <Download className="h-4 w-4 mr-1" />
              CSV
            </Button>
          </div>
        </div>

        {/* Chart Container */}
        <div className="relative">
          {isLoading ? (
            <div className="w-full h-80 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div ref={chartRef} className="w-full" />
          )}
        </div>

        {/* Chart Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {trendAnalysis.rSquared.toFixed(3)}
            </div>
            <div className="text-xs text-muted-foreground">R² Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {trendAnalysis.slope.toFixed(3)}
            </div>
            <div className="text-xs text-muted-foreground">Slope</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(trendAnalysis.confidence * 100)}%
            </div>
            <div className="text-xs text-muted-foreground">Confidence</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {trendAnalysis.forecast.length}
            </div>
            <div className="text-xs text-muted-foreground">Forecast Points</div>
          </div>
        </div>

        {/* Anomalies Section */}
        {showAnomalies && trendAnalysis.anomalies.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Detected Anomalies</h4>
            <div className="space-y-1">
              {trendAnalysis.anomalies.slice(0, 5).map((anomaly, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-yellow-50 border border-yellow-200 rounded"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">
                      {anomaly.timestamp.toLocaleDateString()}
                    </span>
                  </div>
                  <span className="text-sm font-medium">
                    {anomaly.value.toFixed(2)}
                  </span>
                </div>
              ))}
              {trendAnalysis.anomalies.length > 5 && (
                <div className="text-xs text-muted-foreground text-center">
                  +{trendAnalysis.anomalies.length - 5} more anomalies
                </div>
              )}
            </div>
          </div>
        )}

        {/* Forecast Section */}
        {showForecast && trendAnalysis.forecast.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Forecast Preview</h4>
            <div className="space-y-1">
              {trendAnalysis.forecast.slice(0, 3).map((forecast, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded"
                >
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">
                      {forecast.timestamp.toLocaleDateString()}
                    </span>
                  </div>
                  <span className="text-sm font-medium">
                    {forecast.value.toFixed(2)}
                  </span>
                </div>
              ))}
              {trendAnalysis.forecast.length > 3 && (
                <div className="text-xs text-muted-foreground text-center">
                  +{trendAnalysis.forecast.length - 3} more forecast points
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {trendAnalysis.recommendations.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Recommendations</h4>
            <div className="space-y-1">
              {trendAnalysis.recommendations
                .slice(0, 3)
                .map((recommendation, index) => (
                  <div key={index} className="text-sm text-muted-foreground">
                    • {recommendation}
                  </div>
                ))}
              {trendAnalysis.recommendations.length > 3 && (
                <div className="text-xs text-muted-foreground">
                  +{trendAnalysis.recommendations.length - 3} more
                  recommendations
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default TrendChart
