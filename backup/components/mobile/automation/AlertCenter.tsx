/**
 * B.10.4 Advanced Mobile & PWA - Mobile Alert Center
 * Touch-optimized alert management and notification handling
 */

import React, { useState, useEffect, useCallback } from 'react'
import {
  intelligentAlertManager,
  type Alert,
  type AlertRule,
  type AlertSummary,
} from '../../../services/automation'
import { mobileAutomationService } from '../../../services/mobile/automation/MobileAutomationService'

interface AlertCardProps {
  alert: Alert
  onAcknowledge: (alertId: string) => Promise<void>
  onResolve: (alertId: string) => Promise<void>
  onEscalate: (alertId: string) => Promise<void>
  isLoading?: boolean
}

const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  onAcknowledge,
  onResolve,
  onEscalate,
  isLoading = false,
}) => {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleAction = async (action: () => Promise<void>) => {
    setIsProcessing(true)
    try {
      await action()
    } finally {
      setIsProcessing(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-200 bg-red-50'
      case 'high':
        return 'border-orange-200 bg-orange-50'
      case 'medium':
        return 'border-yellow-200 bg-yellow-50'
      case 'low':
        return 'border-blue-200 bg-blue-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '🚨'
      case 'high':
        return '⚠️'
      case 'medium':
        return '⚡'
      case 'low':
        return 'ℹ️'
      default:
        return '📢'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return '🔴'
      case 'acknowledged':
        return '🟡'
      case 'resolved':
        return '🟢'
      case 'escalated':
        return '🟠'
      default:
        return '⚪'
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  return (
    <div
      className={`p-4 rounded-lg border-2 ${getSeverityColor(alert.severity)}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-lg">{getSeverityIcon(alert.severity)}</span>
            <span className="text-lg">{getStatusIcon(alert.status)}</span>
            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              {alert.severity}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 text-sm">{alert.title}</h3>
          <p className="text-xs text-gray-600 mt-1">{alert.message}</p>
        </div>
      </div>

      {/* Metadata */}
      <div className="flex items-center justify-between mb-3 text-xs text-gray-600">
        <span>Source: {alert.source}</span>
        <span>{formatTimestamp(alert.timestamp)}</span>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        {alert.status === 'active' && (
          <>
            <button
              onClick={() => handleAction(() => onAcknowledge(alert.id))}
              disabled={isProcessing || isLoading}
              className="flex-1 py-2 px-3 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 active:bg-yellow-800 transition-colors touch-manipulation disabled:opacity-50"
            >
              {isProcessing ? '⏳' : '👁️'} Acknowledge
            </button>

            <button
              onClick={() => handleAction(() => onResolve(alert.id))}
              disabled={isProcessing || isLoading}
              className="flex-1 py-2 px-3 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 active:bg-green-800 transition-colors touch-manipulation disabled:opacity-50"
            >
              {isProcessing ? '⏳' : '✅'} Resolve
            </button>
          </>
        )}

        {alert.status === 'acknowledged' && (
          <button
            onClick={() => handleAction(() => onResolve(alert.id))}
            disabled={isProcessing || isLoading}
            className="flex-1 py-2 px-3 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 active:bg-green-800 transition-colors touch-manipulation disabled:opacity-50"
          >
            {isProcessing ? '⏳' : '✅'} Resolve
          </button>
        )}

        {alert.severity === 'critical' && alert.status === 'active' && (
          <button
            onClick={() => handleAction(() => onEscalate(alert.id))}
            disabled={isProcessing || isLoading}
            className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 active:bg-red-800 transition-colors touch-manipulation disabled:opacity-50"
          >
            {isProcessing ? '⏳' : '🚨'} Escalate
          </button>
        )}
      </div>
    </div>
  )
}

const AlertCenter: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [alertSummary, setAlertSummary] = useState<AlertSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<
    'all' | 'active' | 'acknowledged' | 'resolved' | 'critical'
  >('all')
  const [sortBy, setSortBy] = useState<'timestamp' | 'severity' | 'status'>(
    'timestamp'
  )

  // Load alerts
  const loadAlerts = useCallback(async () => {
    try {
      setIsLoading(true)

      // Mock alerts - in real implementation, this would come from IntelligentAlertManager
      const mockAlerts: Alert[] = [
        {
          id: '1',
          title: 'Temperature Threshold Exceeded',
          message: 'Refrigeration unit temperature exceeded 8°C for 15 minutes',
          severity: 'critical',
          status: 'active',
          source: 'Temperature Sensor #3',
          timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
          acknowledgedBy: null,
          resolvedBy: null,
          escalatedBy: null,
          metadata: {
            temperature: 8.5,
            threshold: 8.0,
            duration: 15,
          },
        },
        {
          id: '2',
          title: 'Compliance Check Overdue',
          message: 'Daily compliance check is 2 hours overdue',
          severity: 'high',
          status: 'acknowledged',
          source: 'Compliance System',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          acknowledgedBy: 'user123',
          resolvedBy: null,
          escalatedBy: null,
          metadata: {
            overdueHours: 2,
            checkType: 'daily',
          },
        },
        {
          id: '3',
          title: 'Inventory Level Low',
          message: 'Product XYZ inventory below minimum threshold',
          severity: 'medium',
          status: 'resolved',
          source: 'Inventory System',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          acknowledgedBy: 'user456',
          resolvedBy: 'user456',
          escalatedBy: null,
          metadata: {
            currentLevel: 5,
            minimumLevel: 10,
            productId: 'XYZ123',
          },
        },
      ]

      setAlerts(mockAlerts)

      // Mock alert summary
      const mockSummary: AlertSummary = {
        totalAlerts: mockAlerts.length,
        activeAlerts: mockAlerts.filter(a => a.status === 'active').length,
        acknowledgedAlerts: mockAlerts.filter(a => a.status === 'acknowledged')
          .length,
        resolvedAlerts: mockAlerts.filter(a => a.status === 'resolved').length,
        criticalAlerts: mockAlerts.filter(a => a.severity === 'critical')
          .length,
        avgResponseTime: 2.3, // minutes
        escalationRate: 0.15,
      }

      setAlertSummary(mockSummary)
      setError(null)
    } catch (err) {
      console.error('Failed to load alerts:', err)
      setError('Failed to load alerts')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAlerts()
  }, [loadAlerts])

  // Acknowledge alert
  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      // In real implementation, this would call intelligentAlertManager.acknowledgeAlert()
      console.log(`Acknowledging alert: ${alertId}`)
      await loadAlerts() // Refresh alerts
    } catch (err) {
      console.error('Failed to acknowledge alert:', err)
      setError('Failed to acknowledge alert')
    }
  }

  // Resolve alert
  const handleResolveAlert = async (alertId: string) => {
    try {
      // In real implementation, this would call intelligentAlertManager.resolveAlert()
      console.log(`Resolving alert: ${alertId}`)
      await loadAlerts() // Refresh alerts
    } catch (err) {
      console.error('Failed to resolve alert:', err)
      setError('Failed to resolve alert')
    }
  }

  // Escalate alert
  const handleEscalateAlert = async (alertId: string) => {
    try {
      // In real implementation, this would call intelligentAlertManager.escalateAlert()
      console.log(`Escalating alert: ${alertId}`)
      await loadAlerts() // Refresh alerts
    } catch (err) {
      console.error('Failed to escalate alert:', err)
      setError('Failed to escalate alert')
    }
  }

  // Filter and sort alerts
  const filteredAlerts = alerts
    .filter(alert => {
      switch (filter) {
        case 'active':
          return alert.status === 'active'
        case 'acknowledged':
          return alert.status === 'acknowledged'
        case 'resolved':
          return alert.status === 'resolved'
        case 'critical':
          return alert.severity === 'critical'
        default:
          return true
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'timestamp':
          return b.timestamp.getTime() - a.timestamp.getTime()
        case 'severity': {
          const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
          return (
            severityOrder[b.severity as keyof typeof severityOrder] -
            severityOrder[a.severity as keyof typeof severityOrder]
          )
        }
        case 'status':
          return a.status.localeCompare(b.status)
        default:
          return 0
      }
    })

  // Get filter counts
  const filterCounts = {
    all: alerts.length,
    active: alerts.filter(a => a.status === 'active').length,
    acknowledged: alerts.filter(a => a.status === 'acknowledged').length,
    resolved: alerts.filter(a => a.status === 'resolved').length,
    critical: alerts.filter(a => a.severity === 'critical').length,
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading alert center...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                🚨 Alert Center
              </h1>
              <p className="text-sm text-gray-500">
                {alertSummary?.totalAlerts || 0} total alerts
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-red-600">
                {alertSummary?.activeAlerts || 0}
              </div>
              <div className="text-xs text-gray-500">Active</div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-4 py-3 bg-red-50 border-l-4 border-red-400">
          <div className="flex items-center">
            <div className="text-red-400 mr-3">⚠️</div>
            <p className="text-red-700 text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Alert Summary */}
      {alertSummary && (
        <div className="px-4 py-3 bg-white border-b">
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {alertSummary.totalAlerts}
              </div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">
                {alertSummary.activeAlerts}
              </div>
              <div className="text-xs text-gray-500">Active</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-600">
                {alertSummary.acknowledgedAlerts}
              </div>
              <div className="text-xs text-gray-500">Acknowledged</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {alertSummary.resolvedAlerts}
              </div>
              <div className="text-xs text-gray-500">Resolved</div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="px-4 py-3 bg-white border-b">
        <div className="flex space-x-1">
          {(
            ['all', 'active', 'acknowledged', 'resolved', 'critical'] as const
          ).map(filterType => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`
                flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-colors
                ${
                  filter === filterType
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
                touch-manipulation
              `}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)} (
              {filterCounts[filterType]})
            </button>
          ))}
        </div>
      </div>

      {/* Sort Options */}
      <div className="px-4 py-2 bg-white border-b">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Sort by:</span>
          <div className="flex space-x-2">
            {(['timestamp', 'severity', 'status'] as const).map(sortType => (
              <button
                key={sortType}
                onClick={() => setSortBy(sortType)}
                className={`
                  px-3 py-1 rounded text-xs font-medium transition-colors
                  ${
                    sortBy === sortType
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                  touch-manipulation
                `}
              >
                {sortType.charAt(0).toUpperCase() + sortType.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alert Cards */}
      <div className="px-4 py-4">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-6xl mb-4">🚨</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Alerts Found
            </h3>
            <p className="text-gray-600">
              {filter === 'all'
                ? 'No alerts have been generated yet.'
                : `No ${filter} alerts found.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAlerts.map(alert => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onAcknowledge={handleAcknowledgeAlert}
                onResolve={handleResolveAlert}
                onEscalate={handleEscalateAlert}
                isLoading={isLoading}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="px-4 pb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          ⚡ Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              // Acknowledge all active alerts
              const activeAlerts = alerts.filter(a => a.status === 'active')
              activeAlerts.forEach(alert => handleAcknowledgeAlert(alert.id))
            }}
            disabled={isLoading}
            className="bg-yellow-600 text-white p-4 rounded-lg hover:bg-yellow-700 active:bg-yellow-800 transition-colors touch-manipulation disabled:opacity-50"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">👁️</div>
              <div className="text-sm font-medium">Acknowledge All</div>
            </div>
          </button>

          <button
            onClick={() => {
              // Resolve all acknowledged alerts
              const acknowledgedAlerts = alerts.filter(
                a => a.status === 'acknowledged'
              )
              acknowledgedAlerts.forEach(alert => handleResolveAlert(alert.id))
            }}
            disabled={isLoading}
            className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors touch-manipulation disabled:opacity-50"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">✅</div>
              <div className="text-sm font-medium">Resolve All</div>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile-specific touch feedback */}
      <div className="fixed bottom-4 right-4">
        <button
          onClick={loadAlerts}
          className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 active:bg-blue-800 transition-colors touch-manipulation"
          aria-label="Refresh alerts"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default AlertCenter
