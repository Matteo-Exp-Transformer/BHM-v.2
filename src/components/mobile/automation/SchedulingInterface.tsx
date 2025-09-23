/**
 * B.10.4 Advanced Mobile & PWA - Mobile Scheduling Interface
 * Touch-optimized scheduling controls and automation timing management
 */

import React, { useState, useEffect, useCallback } from 'react'
import {
  smartSchedulingService,
  type ScheduledTask,
  type TaskScheduleRequest,
  type TimeSlot,
  type SchedulingConstraint,
} from '../../../services/automation'
import { mobileAutomationService } from '../../../services/mobile/automation/MobileAutomationService'

interface ScheduleCardProps {
  task: ScheduledTask
  onEdit: (taskId: string) => void
  onCancel: (taskId: string) => Promise<void>
  onReschedule: (taskId: string) => void
  isLoading?: boolean
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({
  task,
  onEdit,
  onCancel,
  onReschedule,
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'border-blue-200 bg-blue-50'
      case 'running':
        return 'border-green-200 bg-green-50'
      case 'completed':
        return 'border-gray-200 bg-gray-50'
      case 'cancelled':
        return 'border-red-200 bg-red-50'
      case 'overdue':
        return 'border-orange-200 bg-orange-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return '⏰'
      case 'running':
        return '🔄'
      case 'completed':
        return '✅'
      case 'cancelled':
        return '❌'
      case 'overdue':
        return '⚠️'
      default:
        return '❓'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600'
      case 'high':
        return 'text-orange-600'
      case 'medium':
        return 'text-blue-600'
      case 'low':
        return 'text-gray-600'
      default:
        return 'text-gray-600'
    }
  }

  const formatDateTime = (date: Date) => {
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    const isTomorrow =
      date.toDateString() ===
      new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString()

    if (isToday) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    } else if (isTomorrow) {
      return `Tomorrow at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    } else {
      return (
        date.toLocaleDateString() +
        ' ' +
        date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      )
    }
  }

  const getTimeUntilExecution = (scheduledTime: Date) => {
    const now = new Date()
    const diff = scheduledTime.getTime() - now.getTime()

    if (diff <= 0) return 'Overdue'

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  return (
    <div className={`p-4 rounded-lg border-2 ${getStatusColor(task.status)}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-lg">{getStatusIcon(task.status)}</span>
            <span
              className={`text-xs font-medium uppercase tracking-wide ${getPriorityColor(task.priority)}`}
            >
              {task.priority}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 text-sm">{task.title}</h3>
          <p className="text-xs text-gray-600 mt-1">{task.description}</p>
        </div>
      </div>

      {/* Schedule Info */}
      <div className="mb-3">
        <div className="text-sm text-gray-900">
          <span className="font-medium">Scheduled:</span>{' '}
          {formatDateTime(task.scheduledTime)}
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-medium">Time until execution:</span>{' '}
          {getTimeUntilExecution(task.scheduledTime)}
        </div>
        {task.assignedResources && task.assignedResources.length > 0 && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Resources:</span>{' '}
            {task.assignedResources.map(r => r.name).join(', ')}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        {task.status === 'scheduled' && (
          <>
            <button
              onClick={() => onEdit(task.id)}
              disabled={isLoading}
              className="flex-1 py-2 px-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors touch-manipulation disabled:opacity-50"
            >
              ✏️ Edit
            </button>

            <button
              onClick={() => handleAction(() => onReschedule(task.id))}
              disabled={isLoading}
              className="flex-1 py-2 px-3 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 active:bg-purple-800 transition-colors touch-manipulation disabled:opacity-50"
            >
              🔄 Reschedule
            </button>

            <button
              onClick={() => handleAction(() => onCancel(task.id))}
              disabled={isLoading}
              className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 active:bg-red-800 transition-colors touch-manipulation disabled:opacity-50"
            >
              ❌ Cancel
            </button>
          </>
        )}

        {task.status === 'running' && (
          <div className="flex-1 py-2 px-3 bg-green-100 text-green-800 rounded-lg text-sm font-medium text-center">
            🔄 Running...
          </div>
        )}

        {task.status === 'completed' && (
          <div className="flex-1 py-2 px-3 bg-gray-100 text-gray-800 rounded-lg text-sm font-medium text-center">
            ✅ Completed
          </div>
        )}

        {task.status === 'cancelled' && (
          <div className="flex-1 py-2 px-3 bg-red-100 text-red-800 rounded-lg text-sm font-medium text-center">
            ❌ Cancelled
          </div>
        )}
      </div>
    </div>
  )
}

const SchedulingInterface: React.FC = () => {
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<
    'all' | 'scheduled' | 'running' | 'completed' | 'overdue'
  >('all')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  // Load scheduled tasks
  const loadScheduledTasks = useCallback(async () => {
    try {
      setIsLoading(true)

      // Mock scheduled tasks - in real implementation, this would come from SmartSchedulingService
      const mockTasks: ScheduledTask[] = [
        {
          id: '1',
          title: 'Daily Temperature Check',
          description:
            'Automated temperature monitoring for all refrigeration units',
          scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
          status: 'scheduled',
          priority: 'high',
          duration: 30, // minutes
          assignedResources: [
            { id: 'r1', name: 'Temperature Sensor #1', type: 'sensor' },
            { id: 'r2', name: 'Temperature Sensor #2', type: 'sensor' },
          ],
          constraints: [],
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          createdBy: 'system',
        },
        {
          id: '2',
          title: 'Weekly Compliance Report',
          description: 'Generate comprehensive compliance report for the week',
          scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
          status: 'scheduled',
          priority: 'medium',
          duration: 60, // minutes
          assignedResources: [
            { id: 'r3', name: 'Report Generator', type: 'system' },
          ],
          constraints: [],
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          createdBy: 'admin',
        },
        {
          id: '3',
          title: 'Inventory Audit',
          description: 'Monthly inventory audit and reconciliation',
          scheduledTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago (overdue)
          status: 'overdue',
          priority: 'critical',
          duration: 120, // minutes
          assignedResources: [
            { id: 'r4', name: 'Inventory Scanner', type: 'device' },
          ],
          constraints: [],
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          createdBy: 'manager',
        },
        {
          id: '4',
          title: 'Equipment Maintenance',
          description: 'Scheduled maintenance for production equipment',
          scheduledTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
          status: 'running',
          priority: 'medium',
          duration: 90, // minutes
          assignedResources: [
            { id: 'r5', name: 'Maintenance Team', type: 'personnel' },
          ],
          constraints: [],
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          createdBy: 'technician',
        },
      ]

      setScheduledTasks(mockTasks)
      setError(null)
    } catch (err) {
      console.error('Failed to load scheduled tasks:', err)
      setError('Failed to load scheduled tasks')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadScheduledTasks()
  }, [loadScheduledTasks])

  // Cancel scheduled task
  const handleCancelTask = async (taskId: string) => {
    try {
      // In real implementation, this would call smartSchedulingService.cancelTask()
      console.log(`Cancelling task: ${taskId}`)
      await loadScheduledTasks() // Refresh tasks
    } catch (err) {
      console.error('Failed to cancel task:', err)
      setError('Failed to cancel scheduled task')
    }
  }

  // Reschedule task
  const handleRescheduleTask = (taskId: string) => {
    console.log(`Opening reschedule dialog for task: ${taskId}`)
    // In real implementation, this would open a reschedule dialog
  }

  // Edit task
  const handleEditTask = (taskId: string) => {
    console.log(`Opening edit dialog for task: ${taskId}`)
    // In real implementation, this would open an edit dialog
  }

  // Filter tasks
  const filteredTasks = scheduledTasks.filter(task => {
    switch (filter) {
      case 'scheduled':
        return task.status === 'scheduled'
      case 'running':
        return task.status === 'running'
      case 'completed':
        return task.status === 'completed'
      case 'overdue':
        return task.status === 'overdue'
      default:
        return true
    }
  })

  // Get filter counts
  const filterCounts = {
    all: scheduledTasks.length,
    scheduled: scheduledTasks.filter(t => t.status === 'scheduled').length,
    running: scheduledTasks.filter(t => t.status === 'running').length,
    completed: scheduledTasks.filter(t => t.status === 'completed').length,
    overdue: scheduledTasks.filter(t => t.status === 'overdue').length,
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading scheduling interface...</p>
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
                ⏰ Scheduling Interface
              </h1>
              <p className="text-sm text-gray-500">
                {scheduledTasks.length} scheduled tasks
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors touch-manipulation"
            >
              ➕ Schedule Task
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
          {(
            ['all', 'scheduled', 'running', 'completed', 'overdue'] as const
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

      {/* Schedule Cards */}
      <div className="px-4 py-4">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-6xl mb-4">⏰</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Scheduled Tasks
            </h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all'
                ? 'No tasks have been scheduled yet.'
                : `No ${filter} tasks found.`}
            </p>
            {filter === 'all' && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors touch-manipulation"
              >
                Schedule First Task
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map(task => (
              <ScheduleCard
                key={task.id}
                task={task}
                onEdit={handleEditTask}
                onCancel={handleCancelTask}
                onReschedule={handleRescheduleTask}
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
              // Schedule a quick task
              setShowCreateForm(true)
            }}
            disabled={isLoading}
            className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors touch-manipulation disabled:opacity-50"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">⚡</div>
              <div className="text-sm font-medium">Quick Schedule</div>
            </div>
          </button>

          <button
            onClick={() => {
              // Optimize all schedules
              console.log('Optimizing all schedules...')
            }}
            disabled={isLoading}
            className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 active:bg-purple-800 transition-colors touch-manipulation disabled:opacity-50"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">🧠</div>
              <div className="text-sm font-medium">Optimize All</div>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile-specific touch feedback */}
      <div className="fixed bottom-4 right-4">
        <button
          onClick={loadScheduledTasks}
          className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 active:bg-blue-800 transition-colors touch-manipulation"
          aria-label="Refresh scheduled tasks"
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

export default SchedulingInterface
