/**
 * B.10.4 Advanced Mobile & PWA - Mobile Workflow Management
 * Touch-optimized workflow controls and automation rule management
 */

import React, { useState, useEffect, useCallback } from 'react'
import {
  enterpriseAutomationManager,
  type AutomationRule,
  type AutomationExecution,
  type AutomationTrigger,
  type AutomationAction,
} from '../../../services/automation'
import { mobileAutomationService } from '../../../services/mobile/automation/MobileAutomationService'

interface WorkflowCardProps {
  rule: AutomationRule
  onExecute: (ruleId: string) => Promise<void>
  onEdit: (ruleId: string) => void
  onToggle: (ruleId: string) => Promise<void>
  isLoading?: boolean
}

const WorkflowCard: React.FC<WorkflowCardProps> = ({
  rule,
  onExecute,
  onEdit,
  onToggle,
  isLoading = false,
}) => {
  const [isExecuting, setIsExecuting] = useState(false)

  const handleExecute = async () => {
    setIsExecuting(true)
    try {
      await onExecute(rule.id)
    } finally {
      setIsExecuting(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'border-red-200 bg-red-50'
      case 'high':
        return 'border-orange-200 bg-orange-50'
      case 'medium':
        return 'border-blue-200 bg-blue-50'
      case 'low':
        return 'border-gray-200 bg-gray-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  const getTriggerIcon = (trigger: AutomationTrigger) => {
    switch (trigger.type) {
      case 'schedule':
        return '⏰'
      case 'event':
        return '📡'
      case 'threshold':
        return '📊'
      case 'manual':
        return '👆'
      default:
        return '⚙️'
    }
  }

  const getStatusIcon = (enabled: boolean) => {
    return enabled ? '✅' : '⏸️'
  }

  return (
    <div
      className={`p-4 rounded-lg border-2 ${getPriorityColor(rule.priority)}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm">{rule.name}</h3>
          <p className="text-xs text-gray-600 mt-1">{rule.description}</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getTriggerIcon(rule.trigger)}</span>
          <span className="text-lg">{getStatusIcon(rule.enabled)}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between mb-3 text-xs text-gray-600">
        <span>Executions: {rule.executionCount}</span>
        <span>Success: {rule.successRate.toFixed(1)}%</span>
        {rule.lastExecuted && (
          <span>Last: {rule.lastExecuted.toLocaleDateString()}</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <button
          onClick={handleExecute}
          disabled={!rule.enabled || isExecuting || isLoading}
          className={`
            flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors
            ${
              rule.enabled && !isExecuting
                ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
            touch-manipulation
          `}
        >
          {isExecuting ? '⏳ Executing...' : '▶️ Execute'}
        </button>

        <button
          onClick={() => onToggle(rule.id)}
          disabled={isLoading}
          className={`
            px-3 py-2 rounded-lg text-sm font-medium transition-colors
            ${
              rule.enabled
                ? 'bg-orange-600 text-white hover:bg-orange-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            }
            touch-manipulation
          `}
        >
          {rule.enabled ? '⏸️' : '▶️'}
        </button>

        <button
          onClick={() => onEdit(rule.id)}
          disabled={isLoading}
          className="px-3 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 active:bg-gray-800 transition-colors touch-manipulation"
        >
          ✏️
        </button>
      </div>
    </div>
  )
}

const WorkflowManagement: React.FC = () => {
  const [rules, setRules] = useState<AutomationRule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [filter, setFilter] = useState<
    'all' | 'active' | 'inactive' | 'critical'
  >('all')

  // Load automation rules
  const loadRules = useCallback(async () => {
    try {
      setIsLoading(true)
      const mobileRules = mobileAutomationService.getMobileAutomationRules()
      setRules(mobileRules)
      setError(null)
    } catch (err) {
      console.error('Failed to load automation rules:', err)
      setError('Failed to load automation rules')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadRules()
  }, [loadRules])

  // Execute automation rule
  const handleExecuteRule = async (ruleId: string) => {
    try {
      await mobileAutomationService.executeMobileAutomation(ruleId)
      // Refresh rules to update stats
      await loadRules()
    } catch (err) {
      console.error('Failed to execute rule:', err)
      setError('Failed to execute automation rule')
    }
  }

  // Toggle rule enabled/disabled
  const handleToggleRule = async (ruleId: string) => {
    try {
      const rule = rules.find(r => r.id === ruleId)
      if (!rule) return

      await enterpriseAutomationManager.updateAutomationRule(ruleId, {
        enabled: !rule.enabled,
      })

      // Refresh rules
      await loadRules()
    } catch (err) {
      console.error('Failed to toggle rule:', err)
      setError('Failed to toggle automation rule')
    }
  }

  // Edit rule
  const handleEditRule = (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId)
    if (rule) {
      setSelectedRule(rule)
    }
  }

  // Filter rules
  const filteredRules = rules.filter(rule => {
    switch (filter) {
      case 'active':
        return rule.enabled
      case 'inactive':
        return !rule.enabled
      case 'critical':
        return rule.priority === 'critical'
      default:
        return true
    }
  })

  // Get filter counts
  const filterCounts = {
    all: rules.length,
    active: rules.filter(r => r.enabled).length,
    inactive: rules.filter(r => !r.enabled).length,
    critical: rules.filter(r => r.priority === 'critical').length,
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading workflow management...</p>
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
                ⚙️ Workflow Management
              </h1>
              <p className="text-sm text-gray-500">
                {rules.length} automation rules configured
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors touch-manipulation"
            >
              ➕ New Rule
            </button>
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

      {/* Filter Tabs */}
      <div className="px-4 py-3 bg-white border-b">
        <div className="flex space-x-1">
          {(['all', 'active', 'inactive', 'critical'] as const).map(
            filterType => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`
                flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors
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
            )
          )}
        </div>
      </div>

      {/* Workflow Cards */}
      <div className="px-4 py-4">
        {filteredRules.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-6xl mb-4">⚙️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Workflows Found
            </h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all'
                ? 'No automation rules have been configured yet.'
                : `No ${filter} automation rules found.`}
            </p>
            {filter === 'all' && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors touch-manipulation"
              >
                Create First Rule
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRules.map(rule => (
              <WorkflowCard
                key={rule.id}
                rule={rule}
                onExecute={handleExecuteRule}
                onEdit={handleEditRule}
                onToggle={handleToggleRule}
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
              // Execute all active rules
              const activeRules = rules.filter(r => r.enabled)
              activeRules.forEach(rule => handleExecuteRule(rule.id))
            }}
            disabled={isLoading}
            className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors touch-manipulation disabled:opacity-50"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">🚀</div>
              <div className="text-sm font-medium">Execute All Active</div>
            </div>
          </button>

          <button
            onClick={() => {
              // Toggle all rules
              rules.forEach(rule => handleToggleRule(rule.id))
            }}
            disabled={isLoading}
            className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 active:bg-purple-800 transition-colors touch-manipulation disabled:opacity-50"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">🔄</div>
              <div className="text-sm font-medium">Toggle All Rules</div>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile-specific touch feedback */}
      <div className="fixed bottom-4 right-4">
        <button
          onClick={loadRules}
          className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 active:bg-blue-800 transition-colors touch-manipulation"
          aria-label="Refresh workflow rules"
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

export default WorkflowManagement
