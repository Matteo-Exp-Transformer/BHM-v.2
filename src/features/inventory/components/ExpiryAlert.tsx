import { AlertTriangle, Clock, Calendar, XCircle } from 'lucide-react'
import { ExpiryAlert as ExpiryAlertType } from '@/types/inventory'

interface ExpiryAlertProps {
  alert: ExpiryAlertType
  onMarkAsExpired: () => void
}

export function ExpiryAlert({ alert, onMarkAsExpired }: ExpiryAlertProps) {
  const getAlertStyles = () => {
    switch (alert.alert_level) {
      case 'expired':
        return {
          container: 'bg-red-50 border-red-200',
          icon: 'text-red-600',
          title: 'text-red-800',
          description: 'text-red-600',
          button: 'bg-red-100 text-red-700 hover:bg-red-200',
        }
      case 'critical':
        return {
          container: 'bg-orange-50 border-orange-200',
          icon: 'text-orange-600',
          title: 'text-orange-800',
          description: 'text-orange-600',
          button: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
        }
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200',
          icon: 'text-yellow-600',
          title: 'text-yellow-800',
          description: 'text-yellow-600',
          button: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
        }
      default:
        return {
          container: 'bg-gray-50 border-gray-200',
          icon: 'text-gray-600',
          title: 'text-gray-800',
          description: 'text-gray-600',
          button: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
        }
    }
  }

  const getAlertIcon = () => {
    switch (alert.alert_level) {
      case 'expired':
        return <XCircle className="w-5 h-5" />
      case 'critical':
        return <AlertTriangle className="w-5 h-5" />
      case 'warning':
        return <Clock className="w-5 h-5" />
      default:
        return <Calendar className="w-5 h-5" />
    }
  }

  const getAlertMessage = () => {
    switch (alert.alert_level) {
      case 'expired':
        return `Scaduto da ${Math.abs(alert.days_until_expiry)} giorni`
      case 'critical':
        return `Scade tra ${alert.days_until_expiry} giorni`
      case 'warning':
        return `Scade tra ${alert.days_until_expiry} giorni`
      default:
        return `Scade tra ${alert.days_until_expiry} giorni`
    }
  }

  const styles = getAlertStyles()

  return (
    <div className={`p-4 rounded-lg border ${styles.container}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className={`${styles.icon} mt-0.5`}>{getAlertIcon()}</div>
          <div className="flex-1 min-w-0">
            <h4 className={`font-medium ${styles.title}`}>
              {alert.product_name}
            </h4>
            <p className={`text-sm ${styles.description}`}>
              {getAlertMessage()}
            </p>
            <p className={`text-xs ${styles.description} mt-1`}>
              Scadenza: {alert.expiry_date.toLocaleDateString('it-IT')}
            </p>
          </div>
        </div>

        {alert.alert_level === 'expired' && (
          <button
            onClick={onMarkAsExpired}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${styles.button}`}
          >
            Marca come Scaduto
          </button>
        )}
      </div>
    </div>
  )
}
