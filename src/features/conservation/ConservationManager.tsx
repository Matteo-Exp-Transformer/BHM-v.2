import { useState } from 'react'
import {
  Thermometer,
  Plus,
  Filter,
  Settings,
} from 'lucide-react'

export function ConservationManager() {
  const [showFilters, setShowFilters] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Thermometer className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Sistema di Conservazione
            </h1>
            <p className="text-gray-600">
              Monitoraggio temperature e punti di conservazione HACCP
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuovo Punto
          </button>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showFilters
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtri
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <Settings className="w-4 h-4" />
            Impostazioni
          </button>
        </div>
      </div>

      {/* Placeholder Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center">
          <Thermometer className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Sistema di Conservazione
          </h3>
          <p className="text-gray-600 mb-6">
            Il sistema di conservazione è in fase di implementazione. Le
            funzionalità complete saranno disponibili a breve.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900">Punti Conservazione</h4>
              <p className="text-sm text-blue-700">
                Gestione frigoriferi e congelatori
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900">
                Letture Temperature
              </h4>
              <p className="text-sm text-green-700">Monitoraggio automatico</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-yellow-900">Manutenzioni</h4>
              <p className="text-sm text-yellow-700">Scheduling e checklist</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <h4 className="font-medium text-red-900">Avvisi</h4>
              <p className="text-sm text-red-700">Notifiche automatiche</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
