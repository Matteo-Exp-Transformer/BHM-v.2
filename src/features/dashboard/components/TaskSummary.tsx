import React from 'react'
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  Users,
  Calendar,
} from 'lucide-react'

interface TaskSummaryData {
  period: 'today' | 'week' | 'month'
  total: number
  completed: number
  pending: number
  overdue: number
  completion_rate: number
  by_type: Record<string, number>
  by_assigned_to: Record<string, number>
  upcoming: Array<{
    id: string
    title: string
    due_date: string
    assigned_to: string
    priority: 'low' | 'medium' | 'high' | 'critical'
    type: string
  }>
}

interface TaskSummaryProps {
  data: TaskSummaryData
  title?: string
  className?: string
}

export const TaskSummary: React.FC<TaskSummaryProps> = ({
  data,
  title = 'Task Summary',
  className = '',
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600 bg-red-100'
      case 'high':
        return 'text-orange-600 bg-orange-100'
      case 'medium':
        return 'text-yellow-600 bg-yellow-100'
      case 'low':
        return 'text-green-600 bg-green-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <AlertTriangle className="w-3 h-3" />
      case 'high':
        return <AlertTriangle className="w-3 h-3" />
      case 'medium':
        return <Clock className="w-3 h-3" />
      case 'low':
        return <CheckSquare className="w-3 h-3" />
      default:
        return <Clock className="w-3 h-3" />
    }
  }

  const getCompletionColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600'
    if (rate >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getCompletionStatus = (rate: number) => {
    if (rate >= 90) return 'Excellent'
    if (rate >= 70) return 'Good'
    if (rate >= 50) return 'Needs Improvement'
    return 'Critical'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays > 1) return `In ${diffDays} days`
    if (diffDays === -1) return 'Yesterday'
    return `${Math.abs(diffDays)} days ago`
  }

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <CheckSquare className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="text-sm text-gray-500 capitalize">
          {data.period} overview
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{data.total}</div>
          <div className="text-sm text-gray-500">Total Tasks</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {data.completed}
          </div>
          <div className="text-sm text-gray-500">Completed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {data.pending}
          </div>
          <div className="text-sm text-gray-500">Pending</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{data.overdue}</div>
          <div className="text-sm text-gray-500">Overdue</div>
        </div>
      </div>

      {/* Completion Rate */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Completion Rate
          </span>
          <span
            className={`text-sm font-bold ${getCompletionColor(data.completion_rate)}`}
          >
            {data.completion_rate}% -{' '}
            {getCompletionStatus(data.completion_rate)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              data.completion_rate >= 90
                ? 'bg-green-500'
                : data.completion_rate >= 70
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(data.completion_rate, 100)}%` }}
          />
        </div>
      </div>

      {/* Tasks by Type */}
      {Object.keys(data.by_type).length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Tasks by Type
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(data.by_type).map(([type, count]) => (
              <div
                key={type}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-sm text-gray-600 capitalize">{type}</span>
                <span className="text-sm font-bold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tasks by Assigned To */}
      {Object.keys(data.by_assigned_to).length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Tasks by Assignee
          </h4>
          <div className="space-y-2">
            {Object.entries(data.by_assigned_to)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([assignee, count]) => (
                <div
                  key={assignee}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{assignee}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {count}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Upcoming Tasks */}
      {data.upcoming.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Upcoming Tasks
          </h4>
          <div className="space-y-2">
            {data.upcoming.slice(0, 5).map(task => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {task.title}
                    </span>
                    <div
                      className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}
                    >
                      {getPriorityIcon(task.priority)}
                      <span className="capitalize">{task.priority}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(task.due_date)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>{task.assigned_to}</span>
                    </div>
                    <span className="capitalize">{task.type}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.total === 0 && (
        <div className="text-center py-8">
          <CheckSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No tasks available for this period</p>
        </div>
      )}
    </div>
  )
}

export default TaskSummary
