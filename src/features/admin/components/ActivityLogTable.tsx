import { useCompanyActivities } from '@/hooks/useActivityTracking'
import type { ActivityFilters, UserActivityLog } from '@/types/activity'
import { formatDistanceToNow } from 'date-fns'
import { it } from 'date-fns/locale'
import {
  Activity,
  Package,
  CheckSquare,
  ShoppingCart,
  Users,
  LogIn,
  LogOut,
  FileText,
  AlertTriangle,
  Thermometer,
  Loader2,
} from 'lucide-react'

interface ActivityLogTableProps {
  filters?: ActivityFilters
}

export function ActivityLogTable({ filters }: ActivityLogTableProps) {
  const { data: activities = [], isLoading, error } = useCompanyActivities(filters)

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'session_start':
        return <LogIn className="h-4 w-4 text-green-600" />
      case 'session_end':
        return <LogOut className="h-4 w-4 text-gray-600" />
      case 'task_completed':
        return <CheckSquare className="h-4 w-4 text-blue-600" />
      case 'product_added':
      case 'product_updated':
      case 'product_deleted':
      case 'product_transferred':
        return <Package className="h-4 w-4 text-purple-600" />
      case 'shopping_list_created':
      case 'shopping_list_completed':
        return <ShoppingCart className="h-4 w-4 text-orange-600" />
      case 'staff_added':
        return <Users className="h-4 w-4 text-indigo-600" />
      case 'temperature_reading_added':
        return <Thermometer className="h-4 w-4 text-cyan-600" />
      case 'non_conformity_reported':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'note_created':
        return <FileText className="h-4 w-4 text-gray-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-400" />
    }
  }

  const getActivityLabel = (activityType: string) => {
    const labels: Record<string, string> = {
      session_start: 'Sessione Iniziata',
      session_end: 'Sessione Terminata',
      task_completed: 'Task Completato',
      product_added: 'Prodotto Aggiunto',
      product_updated: 'Prodotto Modificato',
      product_deleted: 'Prodotto Eliminato',
      product_transferred: 'Prodotto Trasferito',
      shopping_list_created: 'Lista Spesa Creata',
      shopping_list_updated: 'Lista Spesa Modificata',
      shopping_list_completed: 'Lista Spesa Completata',
      department_created: 'Reparto Creato',
      staff_added: 'Staff Aggiunto',
      conservation_point_created: 'Punto Conservazione Creato',
      maintenance_task_created: 'Manutenzione Creata',
      temperature_reading_added: 'Temperatura Registrata',
      note_created: 'Nota Creata',
      non_conformity_reported: 'Non Conformità Segnalata',
      page_view: 'Pagina Visualizzata',
      export_data: 'Dati Esportati',
    }
    return labels[activityType] || activityType
  }

  const formatActivityDetails = (activity: UserActivityLog) => {
    const data = activity.activity_data

    switch (activity.activity_type) {
      case 'product_added':
      case 'product_updated':
      case 'product_deleted':
        return data.product_name
          ? `${data.product_name}${data.category ? ` - ${data.category}` : ''}`
          : 'N/A'

      case 'product_transferred':
        return data.product_name && data.from_conservation_point_name && data.to_conservation_point_name
          ? `${data.product_name}: ${data.from_conservation_point_name} → ${data.to_conservation_point_name}`
          : 'Trasferimento prodotto'

      case 'task_completed':
        return data.task_name || 'Task completato'

      case 'shopping_list_created':
      case 'shopping_list_completed':
        return data.list_name
          ? `${data.list_name}${data.items_count ? ` (${data.items_count} items)` : ''}`
          : 'N/A'

      case 'temperature_reading_added':
        return data.conservation_point_name && data.temperature !== undefined
          ? `${data.conservation_point_name}: ${data.temperature}°C`
          : 'Temperatura registrata'

      case 'session_start':
        return data.device_type
          ? `Login da ${data.device_type}`
          : 'Sessione iniziata'

      case 'session_end':
        return data.duration_minutes
          ? `Durata: ${data.duration_minutes} min`
          : 'Sessione terminata'

      default:
        return 'Dettagli non disponibili'
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          <p className="text-gray-600">Caricamento attività...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">
            Errore nel caricamento delle attività
          </p>
          <p className="text-red-600 text-sm mt-1">
            {error instanceof Error ? error.message : 'Errore sconosciuto'}
          </p>
        </div>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-8">
        <div className="text-center">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nessuna attività trovata
          </h3>
          <p className="text-gray-600">
            Non ci sono attività registrate con i filtri selezionati.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Timeline Attività
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {activities.length} attività{' '}
          {filters?.start_date || filters?.end_date ? 'nel periodo selezionato' : 'totali'}
        </p>
      </div>

      <div className="divide-y divide-gray-200">
        {activities.map(activity => (
          <div
            key={activity.id}
            className="px-6 py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="flex-shrink-0 mt-1">
                {getActivityIcon(activity.activity_type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {getActivityLabel(activity.activity_type)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatActivityDetails(activity)}
                    </p>
                    {activity.entity_type && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                          {activity.entity_type}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Timestamp */}
                  <div className="flex-shrink-0 text-right">
                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(activity.timestamp), {
                        addSuffix: true,
                        locale: it,
                      })}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(activity.timestamp).toLocaleString('it-IT', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                {/* Additional Info */}
                {activity.ip_address && (
                  <p className="text-xs text-gray-400 mt-2">
                    IP: {activity.ip_address}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Info */}
      {activities.length >= 50 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            Mostrando le ultime 50 attività. Usa i filtri per affinare la
            ricerca.
          </p>
        </div>
      )}
    </div>
  )
}


