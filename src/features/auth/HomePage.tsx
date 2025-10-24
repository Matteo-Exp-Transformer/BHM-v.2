import { CheckCircle, AlertTriangle, Clock, TrendingUp, LogOut, GitBranch } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useGitInfo } from '@/hooks/useGitInfo'
import { useConservationPoints } from '@/features/conservation/hooks/useConservationPoints'
import { useProducts } from '@/features/inventory/hooks/useProducts'
import { useCalendarEvents } from '@/features/calendar/hooks/useCalendarEvents'
import { useNavigate } from 'react-router-dom'

const HomePage = () => {
  const { user, displayName, signOut } = useAuth()
  const { branch, isDevelopment } = useGitInfo()
  const navigate = useNavigate()

  // Load real data from hooks
  const { stats: conservationStats, isLoading: isLoadingConservation } =
    useConservationPoints()
  const { stats: inventoryStats, isLoading: isLoadingInventory } = useProducts()
  const { getEventStats, isLoading: isLoadingEvents } = useCalendarEvents()

  const eventStats = getEventStats()
  const isLoading =
    isLoadingConservation || isLoadingInventory || isLoadingEvents

  // Calculate compliance score based on real data
  const totalConservationPoints = conservationStats?.total_points ?? 0
  const compliantConservationPoints = conservationStats?.by_status.normal ?? 0

  const complianceScore = isLoading
    ? 0
    : Math.round(
        ((compliantConservationPoints +
          (inventoryStats?.active_products || 0)) /
          Math.max(
            totalConservationPoints + (inventoryStats?.total_products || 1),
            1
          )) *
          100
      )

  const stats = [
    {
      label: 'Compliance Score',
      value: isLoading ? '--' : `${complianceScore}%`,
      icon: TrendingUp,
      color:
        complianceScore >= 90
          ? 'text-success-600'
          : complianceScore >= 70
            ? 'text-warning-600'
            : 'text-error-600',
      bgColor:
        complianceScore >= 90
          ? 'bg-success-50'
          : complianceScore >= 70
            ? 'bg-warning-50'
            : 'bg-error-50',
    },
    {
      label: 'Punti Conservazione',
      value: isLoading
        ? '--'
        : `${compliantConservationPoints}/${totalConservationPoints}`,
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
            Ciao, {displayName.split(' ')[0] || 'Utente'}!
          </h1>
          <p className="text-gray-600">Benvenuto nel tuo HACCP Manager</p>
        </div>
        
        {/* User Menu (sostituisce UserButton di Clerk) */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{displayName}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
            {/* Branch indicator */}
            <div className="flex items-center gap-1 mt-1">
              <GitBranch className="h-3 w-3 text-blue-500" />
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                isDevelopment 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-green-100 text-green-700'
              }`}>
                {branch}
              </span>
            </div>
          </div>
          <button
            onClick={async () => {
              await signOut()
              navigate('/sign-in')
            }}
            className="p-2 rounded-lg hover:bg-red-50 text-gray-600 hover:text-red-600 transition-colors"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
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

        <div className="card p-8 text-center">
          <p className="text-gray-500">
            Nessuna attività recente da mostrare
          </p>
        </div>
      </div>
    </div>
  )
}

export default HomePage
