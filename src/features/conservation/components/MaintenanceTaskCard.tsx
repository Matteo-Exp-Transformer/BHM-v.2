import {
  MaintenanceTask,
  MAINTENANCE_TASK_TYPES,
  MAINTENANCE_COLORS,
} from '@/types/conservation'
import {
  Clock,
  User,
  Calendar,
  CheckCircle,
  Play,
  Edit,
  Trash2,
  AlertTriangle,
} from 'lucide-react'

interface MaintenanceTaskCardProps {
  task: MaintenanceTask
  status: 'overdue' | 'pending' | 'scheduled'
  onComplete: (task: MaintenanceTask) => void
  onEdit: (task: MaintenanceTask) => void
  onDelete: (id: string) => void
  showActions?: boolean
}

export function MaintenanceTaskCard({
  task,
  status,
  onComplete,
  onEdit,
  onDelete,
  showActions = true,
}: MaintenanceTaskCardProps) {
  const taskType = MAINTENANCE_TASK_TYPES[task.kind]
  const colors = MAINTENANCE_COLORS[status]

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getFrequencyText = () => {
    switch (task.frequency) {
      case 'daily':
        return 'Giornaliera'
      case 'weekly':
        return 'Settimanale'
      case 'monthly':
        return 'Mensile'
      case 'custom':
        return 'Personalizzata'
      default:
        return task.frequency
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'overdue':
        return <AlertTriangle className="w-5 h-5 text-red-600" />
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />
      case 'scheduled':
        return <Calendar className="w-5 h-5 text-green-600" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'overdue':
        return 'In Ritardo'
      case 'pending':
        return 'Urgente'
      case 'scheduled':
        return 'Programmata'
    }
  }

  const isOverdue = status === 'overdue'
  const isPending = status === 'pending'

  return (
    <div
      className={`rounded-lg border-2 p-4 transition-all duration-200 hover:shadow-md ${colors.bg} ${colors.border}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{taskType.icon}</div>
          <div>
            <h3 className={`font-semibold ${colors.text}`}>{taskType.name}</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Frequenza: {getFrequencyText()}</span>
              <span className="mx-1">•</span>
              <span>{task.estimated_duration} min</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          {showActions && (
            <div className="flex items-center space-x-1">
              {!isOverdue && (
                <button
                  onClick={() => onComplete(task)}
                  className="p-1 text-gray-600 hover:text-green-600 transition-colors"
                  title="Completa manutenzione"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => onEdit(task)}
                className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                title="Modifica task"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                title="Elimina task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Status Info */}
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <div className="text-xs text-gray-600">Stato</div>
          <div
            className={`font-semibold flex items-center space-x-1 ${colors.text}`}
          >
            {getStatusIcon()}
            <span>{getStatusText()}</span>
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-600">Prossima scadenza</div>
          <div
            className={`font-semibold ${isOverdue || isPending ? 'text-red-600' : 'text-gray-900'}`}
          >
            {formatDateTime(task.next_due_date)}
          </div>
        </div>
      </div>

      {/* Assignment Info */}
      <div className="flex items-center space-x-2 text-sm mb-3">
        <User className="w-4 h-4 text-gray-600" />
        <span className="text-gray-600">
          Assegnato a:{' '}
          <strong>{task.assigned_staff?.name || 'Non assegnato'}</strong>
        </span>
        {task.assigned_staff?.role && (
          <>
            <span className="mx-1 text-gray-400">•</span>
            <span className="text-gray-500 capitalize">
              {task.assigned_staff.role}
            </span>
          </>
        )}
      </div>

      {/* Checklist Preview */}
      {task.checklist && task.checklist.length > 0 && (
        <div className="mt-3">
          <div className="text-sm font-medium text-gray-700 mb-2">
            Checklist ({task.checklist.length} elementi):
          </div>
          <div className="space-y-1">
            {task.checklist.slice(0, 3).map((item, index) => (
              <div key={index} className="flex items-start space-x-2 text-sm">
                <div className="w-4 h-4 mt-0.5 rounded border border-gray-300 flex-shrink-0"></div>
                <span className="text-gray-600 line-clamp-1">{item}</span>
              </div>
            ))}
            {task.checklist.length > 3 && (
              <div className="text-xs text-gray-500 pl-6">
                +{task.checklist.length - 3} altri elementi...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Urgent/Overdue Alert */}
      {(isOverdue || isPending) && (
        <div
          className={`mt-3 p-2 rounded border ${isOverdue ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}
        >
          <div className="flex items-center space-x-2">
            <AlertTriangle
              className={`w-4 h-4 ${isOverdue ? 'text-red-600' : 'text-yellow-600'}`}
            />
            <span
              className={`text-sm font-medium ${isOverdue ? 'text-red-800' : 'text-yellow-800'}`}
            >
              {isOverdue
                ? 'Manutenzione in ritardo - Intervento immediato richiesto'
                : 'Manutenzione urgente - Scadenza imminente'}
            </span>
          </div>
        </div>
      )}

      {/* Quick Complete Button for Overdue */}
      {isOverdue && (
        <button
          onClick={() => onComplete(task)}
          className="w-full mt-3 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Play className="w-4 h-4" />
          <span>Completa Ora</span>
        </button>
      )}
    </div>
  )
}
