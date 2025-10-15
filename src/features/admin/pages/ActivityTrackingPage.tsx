import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ActivityLogTable } from '../components/ActivityLogTable'
import { ActivityFilters } from '../components/ActivityFilters'
import { ActiveSessionsCard } from '../components/ActiveSessionsCard'
import { ActivityStatisticsChart } from '../components/ActivityStatisticsChart'
import type { ActivityFilters as ActivityFiltersType } from '@/types/activity'
import { Activity, Users, BarChart3 } from 'lucide-react'

export default function ActivityTrackingPage() {
  const { hasPermission, isLoading: authLoading } = useAuth()
  const [filters, setFilters] = useState<ActivityFiltersType>({})
  const [activeTab, setActiveTab] = useState<'sessions' | 'timeline' | 'stats'>(
    'timeline'
  )

  // Permission check
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!hasPermission('canManageSettings')) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">
            ⛔ Accesso negato: solo amministratori
          </p>
          <p className="text-red-600 text-sm mt-1">
            Questa sezione è accessibile solo agli utenti con ruolo
            amministratore.
          </p>
        </div>
      </div>
    )
  }

  const tabs = [
    {
      id: 'sessions' as const,
      label: 'Sessioni Attive',
      icon: Users,
      description: 'Utenti connessi in tempo reale',
    },
    {
      id: 'timeline' as const,
      label: 'Timeline Attività',
      icon: Activity,
      description: 'Cronologia completa delle azioni',
    },
    {
      id: 'stats' as const,
      label: 'Statistiche',
      icon: BarChart3,
      description: 'Analisi e metriche aggregate',
    },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Activity Tracking
          </h1>
          <p className="text-gray-600 mt-1">
            Monitora attività utenti e sessioni attive per compliance HACCP
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  group inline-flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                  ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon
                  className={`h-5 w-5 ${
                    isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'sessions' && (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                ℹ️ Le sessioni attive vengono aggiornate automaticamente ogni 30
                secondi.
              </p>
            </div>
            <ActiveSessionsCard />
          </>
        )}

        {activeTab === 'timeline' && (
          <>
            <ActivityFilters filters={filters} onFiltersChange={setFilters} />
            <ActivityLogTable filters={filters} />
          </>
        )}

        {activeTab === 'stats' && (
          <>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                📊 Le statistiche vengono calcolate in base al periodo
                selezionato nei filtri.
              </p>
            </div>
            <ActivityStatisticsChart filters={filters} />
          </>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
            <div>
              <p className="font-medium text-gray-700">Tracciamento Attivo</p>
              <p>Tutte le attività vengono registrate automaticamente</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
            <div>
              <p className="font-medium text-gray-700">Compliance HACCP</p>
              <p>Log immutabili per audit e verifiche</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5"></div>
            <div>
              <p className="font-medium text-gray-700">Privacy</p>
              <p>Nessun dato sensibile viene tracciato</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

