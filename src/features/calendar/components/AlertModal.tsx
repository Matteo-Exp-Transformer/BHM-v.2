import React, { useState } from 'react'
import { X, Wrench, ClipboardList, Package, ChevronRight, Calendar, User, Clock, AlertCircle, Thermometer } from 'lucide-react'
import type { CalendarAlert } from '../hooks/useCalendarAlerts'

interface AlertModalProps {
  isOpen: boolean
  onClose: () => void
  alerts: CalendarAlert[]
}

const categoryConfig = {
  maintenance: {
    icon: Wrench,
    label: 'Manutenzioni',
    color: 'blue',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    iconBgColor: 'bg-blue-100',
  },
  general_task: {
    icon: ClipboardList,
    label: 'Mansioni/Attività Generiche',
    color: 'green',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-700',
    iconBgColor: 'bg-green-100',
  },
  product_expiry: {
    icon: Package,
    label: 'Scadenze Prodotti',
    color: 'orange',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-700',
    iconBgColor: 'bg-orange-100',
  },
  temperature_reading: {
    icon: Thermometer,
    label: 'Controlli Temperatura',
    color: 'cyan',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    textColor: 'text-cyan-700',
    iconBgColor: 'bg-cyan-100',
  },
  custom: {
    icon: AlertCircle,
    label: 'Certificazioni HACCP',
    color: 'purple',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700',
    iconBgColor: 'bg-purple-100',
  },
}

const severityConfig = {
  critical: { label: 'Critico', color: 'bg-red-100 text-red-800', icon: '🔴' },
  high: { label: 'Alta', color: 'bg-orange-100 text-orange-800', icon: '🟠' },
  medium: { label: 'Media', color: 'bg-yellow-100 text-yellow-800', icon: '🟡' },
}

const statusConfig = {
  pending: { label: 'In Attesa', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
  completed: { label: 'Completato', color: 'bg-green-100 text-green-800', icon: '✅' },
  overdue: { label: 'In Ritardo', color: 'bg-red-100 text-red-800', icon: '⚠️' },
}

function getEventCategory(event: CalendarAlert['event']): keyof typeof categoryConfig {
  if (event.type === 'maintenance') return 'maintenance'
  if (event.type === 'general_task') return 'general_task'
  if (event.type === 'temperature_reading') return 'temperature_reading'
  if (event.source === 'custom' && event.title.includes('HACCP')) return 'custom'
  if (event.title.includes('Scadenza:')) return 'product_expiry'
  return 'custom'
}

function groupAlertsByCategory(alerts: CalendarAlert[]) {
  const grouped = alerts.reduce((acc, alert) => {
    const category = getEventCategory(alert.event)
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(alert)
    return acc
  }, {} as Record<string, CalendarAlert[]>)

  // Ordina per severità (critical prima)
  Object.keys(grouped).forEach(category => {
    grouped[category].sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2 }
      return severityOrder[a.severity] - severityOrder[b.severity]
    })
  })

  return grouped
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  alerts,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const groupedAlerts = groupAlertsByCategory(alerts)

  if (!isOpen) return null

  const categories = Object.keys(groupedAlerts) as Array<keyof typeof categoryConfig>
  const selectedAlerts = selectedCategory ? groupedAlerts[selectedCategory] : []

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Alert Attività Urgenti
                </h2>
                <p className="text-sm text-gray-600">
                  {alerts.length} attività richiedono attenzione immediata
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex h-[calc(90vh-120px)]">
            {/* Sidebar Categories */}
            <div className="w-1/3 border-r border-gray-200 bg-gray-50 overflow-y-auto">
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Categorie Alert</h3>
                <div className="space-y-2">
                  {categories.map(category => {
                    const config = categoryConfig[category]
                    const categoryAlerts = groupedAlerts[category]
                    const criticalCount = categoryAlerts.filter(a => a.severity === 'critical').length
                    const Icon = config.icon

                    return (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                          selectedCategory === category
                            ? `${config.bgColor} ${config.borderColor} border`
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${config.iconBgColor}`}>
                          <Icon className={`h-4 w-4 ${config.textColor}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-medium ${config.textColor}`}>
                            {config.label}
                          </div>
                          <div className="text-xs text-gray-500">
                            {categoryAlerts.length} attività
                            {criticalCount > 0 && ` • ${criticalCount} critiche`}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {selectedCategory ? (
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`p-2 rounded-lg ${categoryConfig[selectedCategory].iconBgColor}`}>
                      {React.createElement(categoryConfig[selectedCategory].icon, {
                        className: `h-5 w-5 ${categoryConfig[selectedCategory].textColor}`
                      })}
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold ${categoryConfig[selectedCategory].textColor}`}>
                        {categoryConfig[selectedCategory].label}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {selectedAlerts.length} attività richiedono attenzione
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {selectedAlerts.map((alert, index) => {
                      const severity = severityConfig[alert.severity]
                      const status = statusConfig[alert.event.status] || statusConfig.pending
                      const eventDate = new Date(alert.event.start)

                      return (
                        <div
                          key={alert.id}
                          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 mb-1">
                                {alert.event.title}
                              </h4>
                              <p className="text-sm text-gray-600 mb-2">
                                {alert.event.description}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${severity.color}`}>
                                {severity.icon} {severity.label}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                {status.icon} {status.label}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{eventDate.toLocaleDateString('it-IT')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{eventDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            {alert.event.assigned_to && alert.event.assigned_to.length > 0 && (
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                <span>{alert.event.assigned_to.length} assegnato/i</span>
                              </div>
                            )}
                          </div>

                          {alert.message && (
                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                              <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-red-600" />
                                <span className="text-sm font-medium text-red-800">
                                  {alert.message}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Seleziona una categoria
                    </h3>
                    <p className="text-gray-600">
                      Scegli una categoria dalla sidebar per visualizzare gli alert
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
