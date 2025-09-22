import React from 'react'
import { CheckCircle, AlertTriangle, XCircle, BarChart3 } from 'lucide-react'

interface ComplianceData {
  category: string
  compliant: number
  warning: number
  critical: number
  total: number
}

interface ComplianceChartProps {
  data: ComplianceData[]
  title?: string
  className?: string
}

export const ComplianceChart: React.FC<ComplianceChartProps> = ({
  data,
  title = 'Compliance Overview',
  className = '',
}) => {
  const getCompliancePercentage = (item: ComplianceData) => {
    if (item.total === 0) return 100
    return Math.round((item.compliant / item.total) * 100)
  }

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500'
    if (percentage >= 70) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getStatusIcon = (percentage: number) => {
    if (percentage >= 90)
      return <CheckCircle className="w-4 h-4 text-green-600" />
    if (percentage >= 70)
      return <AlertTriangle className="w-4 h-4 text-yellow-600" />
    return <XCircle className="w-4 h-4 text-red-600" />
  }

  const getStatusText = (percentage: number) => {
    if (percentage >= 90) return 'Excellent'
    if (percentage >= 70) return 'Good'
    if (percentage >= 50) return 'Needs Improvement'
    return 'Critical'
  }

  const getOverallCompliance = () => {
    const totalCompliant = data.reduce((sum, item) => sum + item.compliant, 0)
    const totalItems = data.reduce((sum, item) => sum + item.total, 0)
    return totalItems > 0
      ? Math.round((totalCompliant / totalItems) * 100)
      : 100
  }

  const overallCompliance = getOverallCompliance()

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon(overallCompliance)}
          <span
            className={`text-sm font-medium ${
              overallCompliance >= 90
                ? 'text-green-600'
                : overallCompliance >= 70
                  ? 'text-yellow-600'
                  : 'text-red-600'
            }`}
          >
            {getStatusText(overallCompliance)} ({overallCompliance}%)
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {data.map((item, index) => {
          const percentage = getCompliancePercentage(item)
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {item.category}
                </span>
                <div className="flex items-center space-x-4">
                  <span className="text-xs text-gray-500">
                    {item.compliant}/{item.total}
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      percentage >= 90
                        ? 'text-green-600'
                        : percentage >= 70
                          ? 'text-yellow-600'
                          : 'text-red-600'
                    }`}
                  >
                    {percentage}%
                  </span>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getStatusColor(percentage)}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              {item.warning > 0 || item.critical > 0 ? (
                <div className="flex items-center space-x-4 text-xs">
                  {item.warning > 0 && (
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                      <span className="text-gray-600">
                        {item.warning} Warning{item.warning > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                  {item.critical > 0 && (
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      <span className="text-gray-600">
                        {item.critical} Critical
                      </span>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )
        })}
      </div>

      {data.length === 0 && (
        <div className="text-center py-8">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No compliance data available</p>
        </div>
      )}
    </div>
  )
}

export default ComplianceChart
