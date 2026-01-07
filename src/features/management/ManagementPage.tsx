import { Users, Building2, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import DepartmentManagement from './components/DepartmentManagement'
import StaffManagement from './components/StaffManagement'
import useDepartments from './hooks/useDepartments'
import useStaff from './hooks/useStaff'

export const ManagementPage = () => {
  const { isLoading, hasRole, displayName } = useAuth()
  const { stats: departmentStats } = useDepartments()
  const { stats: staffStats, staff } = useStaff()

  // Show loading state while authentication is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento...</p>
        </div>
      </div>
    )
  }

  // Check if user has required permissions (admin or responsabile)
  if (!hasRole(['admin', 'responsabile'])) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Accesso Non Autorizzato
          </h2>
          <p className="text-gray-600 mb-4">
            Solo gli amministratori e i responsabili possono accedere alla
            gestione.
          </p>
          <div className="bg-gray-100 rounded-lg p-3">
            <p className="text-sm text-gray-500">
              Se pensi che questo sia un errore, contatta il tuo amministratore.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestione</h1>
              <p className="text-sm text-gray-600">
                Gestisci staff e reparti della tua attività
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                Benvenuto, {displayName}
              </h2>
              <p className="text-blue-100 text-sm">
                Gestisci la struttura organizzativa della tua attività
              </p>
            </div>
          </div>
        </div>

        {/* Management Sections */}
        <div className="space-y-6">
          {/* Department Management */}
          <DepartmentManagement />

          {/* Staff Management */}
          <StaffManagement />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Reparti Attivi</p>
                <p className="text-xl font-semibold text-gray-900">
                  {departmentStats.active}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Staff Attivo</p>
                <p className="text-xl font-semibold text-gray-900">
                  {staffStats.active}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Certificazioni HACCP</p>
                <p className="text-xl font-semibold text-gray-900">
                  {staff.filter(s => s.haccp_certification).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Guida alla Gestione
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Reparti</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Organizza la tua attività in aree funzionali</li>
                <li>• Usa i reparti predefiniti per iniziare velocemente</li>
                <li>• Attiva/disattiva reparti secondo necessità</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Staff</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Aggiungi dipendenti e collaboratori</li>
                <li>• Assegna ruoli (admin, responsabile, dipendente)</li>
                <li>• Gestisci certificazioni HACCP con scadenze</li>
                <li>• Collega staff all'autenticazione tramite email</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManagementPage
