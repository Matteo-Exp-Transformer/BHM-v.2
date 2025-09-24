import React, { memo } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react'

interface KPICardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: 'up' | 'down' | 'stable'
  trendValue?: string
  icon?: React.ReactNode
  status?: 'success' | 'warning' | 'error' | 'info'
  className?: string
  onClick?: () => void
}

export const KPICard: React.FC<KPICardProps> = memo(
  ({
    title,
    value,
    subtitle,
    trend,
    trendValue,
    icon,
    status = 'info',
    className = '',
    onClick,
  }) => {
    const getTrendIcon = () => {
      switch (trend) {
        case 'up':
          return <TrendingUp className="w-4 h-4 text-green-600" />
        case 'down':
          return <TrendingDown className="w-4 h-4 text-red-600" />
        case 'stable':
          return <Minus className="w-4 h-4 text-gray-500" />
        default:
          return null
      }
    }

    const getStatusIcon = () => {
      switch (status) {
        case 'success':
          return <CheckCircle className="w-5 h-5 text-green-600" />
        case 'warning':
          return <AlertTriangle className="w-5 h-5 text-yellow-600" />
        case 'error':
          return <AlertTriangle className="w-5 h-5 text-red-600" />
        case 'info':
          return <Clock className="w-5 h-5 text-blue-600" />
        default:
          return icon
      }
    }

    const getStatusColors = () => {
      switch (status) {
        case 'success':
          return 'border-green-200 bg-green-50'
        case 'warning':
          return 'border-yellow-200 bg-yellow-50'
        case 'error':
          return 'border-red-200 bg-red-50'
        case 'info':
          return 'border-blue-200 bg-blue-50'
        default:
          return 'border-gray-200 bg-white'
      }
    }

    const getTrendColors = () => {
      switch (trend) {
        case 'up':
          return 'text-green-600 bg-green-100'
        case 'down':
          return 'text-red-600 bg-red-100'
        case 'stable':
          return 'text-gray-600 bg-gray-100'
        default:
          return 'text-gray-600 bg-gray-100'
      }
    }

    return (
      <div
        className={`p-4 rounded-lg border ${getStatusColors()} ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2' : ''} ${className}`}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-label={
          onClick
            ? `${title}: ${value}${subtitle ? `, ${subtitle}` : ''}`
            : undefined
        }
        onKeyDown={
          onClick
            ? e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onClick()
                }
              }
            : undefined
        }
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span aria-hidden="true">{getStatusIcon()}</span>
              <h3 className="text-sm font-medium text-gray-700">{title}</h3>
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-gray-900">{value}</span>
              {trendValue && (
                <div
                  className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getTrendColors()}`}
                  aria-label={`Trend: ${trend} ${trendValue}`}
                >
                  <span aria-hidden="true">{getTrendIcon()}</span>
                  <span>{trendValue}</span>
                </div>
              )}
            </div>

            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
    )
  }
)

export default KPICard
