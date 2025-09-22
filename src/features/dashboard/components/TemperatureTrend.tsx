import React from 'react'
import {
  Thermometer,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
} from 'lucide-react'

interface TemperatureData {
  date: string
  temperature: number
  status: 'compliant' | 'warning' | 'critical'
  point_name: string
}

interface TemperatureTrendProps {
  data: TemperatureData[]
  title?: string
  className?: string
}

export const TemperatureTrend: React.FC<TemperatureTrendProps> = ({
  data,
  title = 'Temperature Trends (7 Days)',
  className = '',
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'text-green-600 bg-green-100'
      case 'warning':
        return 'text-yellow-600 bg-yellow-100'
      case 'critical':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case 'critical':
        return <TrendingDown className="w-4 h-4 text-red-600" />
      default:
        return <Minus className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'Compliant'
      case 'warning':
        return 'Warning'
      case 'critical':
        return 'Critical'
      default:
        return 'Unknown'
    }
  }

  // Group data by date and calculate averages
  const groupedData = data.reduce(
    (acc, item) => {
      const date = new Date(item.date).toLocaleDateString('it-IT', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })

      if (!acc[date]) {
        acc[date] = {
          date,
          temperatures: [],
          statuses: [],
          points: new Set(),
        }
      }

      acc[date].temperatures.push(item.temperature)
      acc[date].statuses.push(item.status)
      acc[date].points.add(item.point_name)

      return acc
    },
    {} as Record<
      string,
      {
        date: string
        temperatures: number[]
        statuses: string[]
        points: Set<string>
      }
    >
  )

  const chartData = Object.values(groupedData).map(day => {
    const avgTemp =
      day.temperatures.reduce((sum, temp) => sum + temp, 0) /
      day.temperatures.length
    const compliantCount = day.statuses.filter(
      status => status === 'compliant'
    ).length
    const warningCount = day.statuses.filter(
      status => status === 'warning'
    ).length
    const criticalCount = day.statuses.filter(
      status => status === 'critical'
    ).length

    let overallStatus: 'compliant' | 'warning' | 'critical' = 'compliant'
    if (criticalCount > 0) overallStatus = 'critical'
    else if (warningCount > 0) overallStatus = 'warning'

    return {
      date: day.date,
      avgTemperature: Math.round(avgTemp * 10) / 10,
      overallStatus,
      readingsCount: day.temperatures.length,
      pointsCount: day.points.size,
      compliantCount,
      warningCount,
      criticalCount,
    }
  })

  const getTemperatureColor = (temp: number) => {
    if (temp <= 4) return 'text-blue-600'
    if (temp <= 8) return 'text-green-600'
    if (temp <= 15) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getBarHeight = (count: number, maxCount: number) => {
    return maxCount > 0 ? (count / maxCount) * 100 : 0
  }

  const maxReadings = Math.max(...chartData.map(d => d.readingsCount), 1)

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Thermometer className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="text-sm text-gray-500">
          {data.length} readings from{' '}
          {new Set(data.map(d => d.point_name)).size} points
        </div>
      </div>

      {chartData.length > 0 ? (
        <div className="space-y-4">
          {chartData.map((day, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {day.date}
                </span>
                <div className="flex items-center space-x-4">
                  <span
                    className={`text-lg font-bold ${getTemperatureColor(day.avgTemperature)}`}
                  >
                    {day.avgTemperature}°C
                  </span>
                  <div
                    className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(day.overallStatus)}`}
                  >
                    {getStatusIcon(day.overallStatus)}
                    <span>{getStatusText(day.overallStatus)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-end space-x-1 h-8">
                {day.compliantCount > 0 && (
                  <div
                    className="bg-green-500 rounded-t"
                    style={{
                      width: '25%',
                      height: `${getBarHeight(day.compliantCount, maxReadings)}%`,
                      minHeight: '4px',
                    }}
                    title={`${day.compliantCount} compliant readings`}
                  />
                )}
                {day.warningCount > 0 && (
                  <div
                    className="bg-yellow-500 rounded-t"
                    style={{
                      width: '25%',
                      height: `${getBarHeight(day.warningCount, maxReadings)}%`,
                      minHeight: '4px',
                    }}
                    title={`${day.warningCount} warning readings`}
                  />
                )}
                {day.criticalCount > 0 && (
                  <div
                    className="bg-red-500 rounded-t"
                    style={{
                      width: '25%',
                      height: `${getBarHeight(day.criticalCount, maxReadings)}%`,
                      minHeight: '4px',
                    }}
                    title={`${day.criticalCount} critical readings`}
                  />
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  {day.readingsCount} readings from {day.pointsCount} points
                </span>
                <div className="flex items-center space-x-4">
                  {day.compliantCount > 0 && (
                    <span className="text-green-600">
                      {day.compliantCount} compliant
                    </span>
                  )}
                  {day.warningCount > 0 && (
                    <span className="text-yellow-600">
                      {day.warningCount} warning
                    </span>
                  )}
                  {day.criticalCount > 0 && (
                    <span className="text-red-600">
                      {day.criticalCount} critical
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Thermometer className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            No temperature data available for the last 7 days
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-center space-x-6 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded" />
            <span className="text-gray-600">Compliant</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-yellow-500 rounded" />
            <span className="text-gray-600">Warning</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded" />
            <span className="text-gray-600">Critical</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TemperatureTrend
