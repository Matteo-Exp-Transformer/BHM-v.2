import { useAuth } from '@/hooks/useAuth'
import { CollapsibleCard } from '@/components/ui/CollapsibleCard'
import { Settings, Building2, Users, Shield, Bell } from 'lucide-react'
import { CompanyConfiguration } from './components/CompanyConfiguration'
import { UserManagement } from './components/UserManagement'
import { HACCPSettings } from './components/HACCPSettings'
import { NotificationPreferences } from './components/NotificationPreferences'

export default function SettingsPage() {
  const { isLoading, hasRole, displayName } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Only admin can access settings
  if (!hasRole(['admin'])) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Accesso Negato
            </h3>
            <p className="text-gray-600 mb-4">
              Solo gli amministratori possono accedere alle impostazioni del
              sistema.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-red-800">
                <strong>Ruolo richiesto:</strong> Amministratore
              </p>
              <p className="text-sm text-red-800 mt-1">
                <strong>Il tuo ruolo:</strong>{' '}
                {displayName || 'Non determinato'}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              Impostazioni Sistema
            </h1>
          </div>
          <p className="text-gray-600">
            Gestisci la configurazione dell'azienda, utenti, compliance HACCP e
            preferenze.
          </p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Company Configuration */}
          <CollapsibleCard
            title="Configurazione Azienda"
            icon={Building2}
            defaultExpanded={true}
            className="bg-white"
            showEmpty={false}
          >
            <CompanyConfiguration />
          </CollapsibleCard>

          {/* User Management */}
          <CollapsibleCard
            title="Gestione Utenti"
            icon={Users}
            defaultExpanded={false}
            className="bg-white"
            showEmpty={false}
          >
            <UserManagement />
          </CollapsibleCard>

          {/* HACCP Settings */}
          <CollapsibleCard
            title="Impostazioni HACCP"
            icon={Shield}
            defaultExpanded={false}
            className="bg-white"
            showEmpty={false}
          >
            <HACCPSettings />
          </CollapsibleCard>

          {/* Notification Preferences */}
          <CollapsibleCard
            title="Preferenze Notifiche"
            icon={Bell}
            defaultExpanded={false}
            className="bg-white"
            showEmpty={false}
          >
            <NotificationPreferences />
          </CollapsibleCard>
        </div>

        {/* Footer */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">
                Sicurezza e Privacy
              </h4>
              <p className="text-sm text-blue-800">
                Tutte le modifiche vengono registrate nel log di audit per
                garantire la tracciabilità e la conformità alle normative HACCP.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
