import { UserButton, useUser } from '@clerk/clerk-react'
import { CheckCircle, AlertTriangle, Clock, TrendingUp } from 'lucide-react'

const HomePage = () => {
  const { user } = useUser()

  const stats = [
    {
      label: 'Compliance Score',
      value: '95%',
      icon: TrendingUp,
      color: 'text-success-600',
      bgColor: 'bg-success-50',
    },
    {
      label: 'Completate Oggi',
      value: '12/15',
      icon: CheckCircle,
      color: 'text-success-600',
      bgColor: 'bg-success-50',
    },
    {
      label: 'In Scadenza',
      value: '3',
      icon: Clock,
      color: 'text-warning-600',
      bgColor: 'bg-warning-50',
    },
    {
      label: 'Critiche',
      value: '1',
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
