import { UserButton, useUser } from '@clerk/clerk-react'
import { CheckCircle, AlertTriangle, Clock, TrendingUp } from 'lucide-react'
import { useConservationPoints } from '@/features/conservation/hooks/useConservationPoints'
import { useProducts } from '@/features/inventory/hooks/useProducts'
import { useCalendarEvents } from '@/features/calendar/hooks/useCalendarEvents'

const HomePage = () => {
  const { user } = useUser()

  // Load real data from hooks
  const { stats: conservationStats, isLoading: isLoadingConservation } = useConservationPoints()
  const { stats: inventoryStats, isLoading: isLoadingInventory } = useProducts()
  const { getEventStats, isLoading: isLoadingEvents } = useCalendarEvents()

  const eventStats = getEventStats()
  const isLoading = isLoadingConservation || isLoadingInventory || isLoadingEvents

  // Calculate compliance score based on real data
  const complianceScore = isLoading ? 0 : Math.round(
    ((conservationStats?.normal || 0) + (inventoryStats?.active_products || 0)) /
    Math.max((conservationStats?.total || 1) + (inventoryStats?.total_products || 1), 1) * 100
  )

  const stats = [
    {
      label: 'Compliance Score',
      value: isLoading ? '--' : `${complianceScore}%`,
      icon: TrendingUp,
      color: complianceScore >= 90 ? 'text-success-600' : complianceScore >= 70 ? 'text-warning-600' : 'text-error-600',
      bgColor: complianceScore >= 90 ? 'bg-success-50' : complianceScore >= 70 ? 'bg-warning-50' : 'bg-error-50',
    },
    {
      label: 'Punti Conservazione',
      value: isLoading ? '--' : `${conservationStats?.normal || 0}/${conservationStats?.total || 0}`,
      icon: CheckCircle,
      color: 'text-success-600',
      bgColor: 'bg-success-50',
    },
    {
      label: 'In Scadenza',
      value: isLoading ? '--' : `${inventoryStats?.expiring_soon || 0}`,
      icon: Clock,
      color: 'text-warning-600',
      bgColor: 'bg-warning-50',
    },
    {
      label: 'Attività Scadute',
      value: isLoading ? '--' : `${eventStats?.overdue || 0}`,
      icon: AlertTriangle,
      color: 'text-error-600',
      bgColor: 'bg-error-50',
    },
  ]

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Ciao, {user?.firstName || 'Utente'}!
          </h1>
          <p className="text-gray-600">Benvenuto nel tuo HACCP Manager</p>
        </div>
        <UserButton afterSignOutUrl="/login" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="card p-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon size={20} className={stat.color} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Azioni Rapide</h2>

        <div className="space-y-3">
          <button className="w-full card p-4 text-left hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">
                  Registra Temperatura
                </h3>
                <p className="text-sm text-gray-600">
                  Aggiungi una nuova lettura
                </p>
              </div>
              <CheckCircle className="text-gray-400" size={20} />
            </div>
          </button>

          <button className="w-full card p-4 text-left hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Completa Mansione</h3>
                <p className="text-sm text-gray-600">
                  Segna un'attività come completata
                </p>
              </div>
              <CheckCircle className="text-gray-400" size={20} />
            </div>
          </button>

          <button className="w-full card p-4 text-left hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Aggiungi Prodotto</h3>
                <p className="text-sm text-gray-600">
                  Registra un nuovo prodotto
                </p>
              </div>
              <CheckCircle className="text-gray-400" size={20} />
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Attività Recenti
        </h2>

        <div className="space-y-3">
          <div className="card p-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-success-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Pulizia frigorifero principale completata
                </p>
                <p className="text-xs text-gray-500">2 ore fa</p>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-warning-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Temperatura freezer fuori range
                </p>
                <p className="text-xs text-gray-500">4 ore fa</p>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-success-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Controllo scadenze inventario
                </p>
                <p className="text-xs text-gray-500">6 ore fa</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
