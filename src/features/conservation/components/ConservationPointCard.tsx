import { useState } from 'react'
import {
  ConservationPoint,
  CONSERVATION_COLORS,
  CONSERVATION_TYPE_COLORS,
} from '@/types/conservation'
import {
  Thermometer,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Edit,
  Trash2,
  MapPin,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import {
  PROFILE_LABELS,
  APPLIANCE_CATEGORY_LABELS,
  type ConservationProfileId,
  getProfileById,
  mapCategoryIdsToDbNames,
  CATEGORY_ID_TO_DB_NAME,
  type ApplianceCategory,
} from '@/utils/conservationProfiles'
import {
  getConservationTypeLabel,
  getConservationTypeEmoji,
} from '@/utils/conservationConstants'

interface ConservationPointCardProps {
  point: ConservationPoint
  onEdit: (point: ConservationPoint) => void
  onDelete: (id: string) => void
}

export function ConservationPointCard({
  point,
  onEdit,
  onDelete,
}: ConservationPointCardProps) {
  const [showCategories, setShowCategories] = useState(false)
  const typeColors = CONSERVATION_TYPE_COLORS[point.type] || CONSERVATION_TYPE_COLORS.ambient
  const statusColors = CONSERVATION_COLORS[point.status] || CONSERVATION_COLORS.normal

  // Funzioni rimosse - ora importate da conservationConstants.ts
  // Usare getConservationTypeEmoji(point.type) invece di getTypeIcon()
  // Usare getConservationTypeLabel(point.type) invece di getTypeName()

  const getStatusIcon = () => {
    switch (point.status) {
      case 'normal':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-600" />
    }
  }

  const getStatusText = () => {
    switch (point.status) {
      case 'normal':
        return 'Regolare'
      case 'warning':
        return 'Attenzione'
      case 'critical':
        return 'Critico'
    }
  }

  // Funzione per ottenere le categorie corrette da mostrare
  const getDisplayCategories = (point: ConservationPoint): string[] => {
    // Caso 1: Frigorifero con profilo
    if (point.type === 'fridge' && point.profile_id && point.appliance_category) {
      // Ricostruisci profilo se non presente
      const profile = point.profile_config ||
        getProfileById(point.profile_id, point.appliance_category as ApplianceCategory)

      if (profile?.allowedCategoryIds) {
        return mapCategoryIdsToDbNames(profile.allowedCategoryIds)
      }
    }

    // Caso 2: Altri tipi o frigoriferi senza profilo
    if (point.product_categories && point.product_categories.length > 0) {
      return point.product_categories.map(cat =>
        CATEGORY_ID_TO_DB_NAME[cat] || cat
      )
    }

    return []
  }

  // Raggruppamento per tipologia: carni/ovoprodotti | verdure/latticini | altro
  const CATEGORY_GROUP_LEFT = [
    'Carni crude',
    'Salumi e affettati',
    'Uova - Ovoprodotti',
    'Pesce e frutti di mare crudi',
    'Congelati: carni e pesce',
  ]
  const CATEGORY_GROUP_CENTER = [
    'Verdure e ortofrutta',
    'Erbe aromatiche fresche',
    'Latticini',
    'Congelati: vegetali',
  ]
  const CATEGORY_GROUP_RIGHT = [
    'Preparazioni/Pronti/Cotti (RTE)',
    'Salse/condimenti',
    'Bevande',
    'Conserve/semiconserve',
    'Congelati: preparazioni',
    'Congelati: Dolci',
    'Abbattimento rapido',
  ]

  const groupCategories = (
    categories: string[]
  ): { left: string[]; center: string[]; right: string[] } => {
    const left: string[] = []
    const center: string[] = []
    const right: string[] = []
    for (const c of categories) {
      if (CATEGORY_GROUP_LEFT.includes(c)) {
        left.push(c)
      } else if (CATEGORY_GROUP_CENTER.includes(c)) {
        center.push(c)
      } else if (CATEGORY_GROUP_RIGHT.includes(c)) {
        right.push(c)
      } else {
        right.push(c)
      }
    }
    return { left, center, right }
  }

  return (
    <div
      className={`rounded-lg border-2 ${typeColors.border} ${typeColors.bg} p-4 transition-all duration-200 hover:shadow-md`}
    >
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start space-x-3 flex-1 min-w-0">
            <div className="text-3xl flex-shrink-0">{getConservationTypeEmoji(point.type)}</div>
            <div className="flex-1 min-w-0">
              {/* Nome e Reparto/Tipo sulla stessa riga */}
              <div className="flex items-center justify-between gap-3 mb-2">
                <h3 className={`text-lg font-semibold ${typeColors.text} flex-1 min-w-0`}>{point.name}</h3>
                
                {/* Reparto e Tipo - allineato a destra */}
                <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                  <div className="flex items-center gap-1.5 text-base text-gray-600">
                    <MapPin className="w-5 h-5 flex-shrink-0" />
                    <span className="truncate font-medium">{point.department?.name || 'Reparto non assegnato'}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-sm font-medium ${typeColors.badge}`}>
                    {getConservationTypeLabel(point.type)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Azioni */}
          <div className="flex items-center space-x-2 flex-shrink-0 ml-3">
            {getStatusIcon()}
            <button
              onClick={() => onEdit(point)}
              className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              aria-label={`Modifica punto ${point.name}`}
            >
              <Edit className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              onClick={() => onDelete(point.id)}
              className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              aria-label={`Elimina punto ${point.name}`}
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Temperature Info */}
      <div className={`grid gap-4 mb-3 ${
        point.appliance_category && point.profile_id 
          ? 'grid-cols-4' 
          : point.appliance_category || point.profile_id 
            ? 'grid-cols-3' 
            : 'grid-cols-2'
      }`}>
        {/* Categoria Elettrodomestico */}
        {point.appliance_category && (
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <div>
              <div className="text-sm text-gray-600">Elettrodomestico</div>
              <div className="text-base font-semibold text-gray-700">
                {APPLIANCE_CATEGORY_LABELS[point.appliance_category as ApplianceCategory] || point.appliance_category}
              </div>
            </div>
          </div>
        )}

        {/* Profilo HACCP */}
        {point.profile_id && (
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <div>
              <div className="text-sm text-gray-600">Profilo</div>
              <div className="text-base font-semibold text-gray-700">
                {PROFILE_LABELS[point.profile_id as ConservationProfileId] || point.profile_id}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Thermometer className={`w-4 h-4 ${typeColors.text}`} />
          <div>
            <div className="text-sm text-gray-600">Temperatura target</div>
            <div className={`font-semibold ${typeColors.text}`}>
              {point.setpoint_temp}°C
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div
            className={`w-3 h-3 rounded-full ${point.status === 'normal' ? 'bg-green-400' : point.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'}`}
          />
          <div>
            <div className="text-sm text-gray-600">Stato</div>
            <div className={`font-semibold ${statusColors.text}`}>
              {getStatusText()}
            </div>
          </div>
        </div>
      </div>

      {/* Last Temperature Reading */}
      {point.last_temperature_reading && (
        <div
          className={`rounded-md ${statusColors.bg} border ${statusColors.border} p-3 mb-3`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Ultima lettura</div>
              <div className={`font-semibold ${statusColors.text}`}>
                {point.last_temperature_reading.temperature}°C
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {new Date(
                point.last_temperature_reading.recorded_at
              ).toLocaleDateString('it-IT', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Due */}
      {point.maintenance_due && (
        <div className="flex items-center space-x-2 text-sm">
          <Calendar className="w-4 h-4 text-gray-600" />
          <span className="text-gray-600">
            Prossima manutenzione:{' '}
            {new Date(point.maintenance_due).toLocaleDateString('it-IT')}
          </span>
        </div>
      )}

      {/* Categorie compatibili - estendibile, 3 colonne per tipologia */}
      {(() => {
        const displayCategories = getDisplayCategories(point)
        if (displayCategories.length === 0) return null
        const { left, center, right } = groupCategories(displayCategories)
        const renderColumn = (items: string[]) => (
          <ul className="list-disc list-outside pl-5 space-y-1 text-base text-gray-700">
            {items.map((category, index) => (
              <li key={index}>{category}</li>
            ))}
          </ul>
        )
        return (
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setShowCategories(!showCategories)}
              className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors mb-2"
              aria-expanded={showCategories}
            >
              <span>Categorie compatibili</span>
              {showCategories ? (
                <ChevronUp className="w-4 h-4 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 flex-shrink-0" />
              )}
            </button>
            {showCategories && (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  {left.length > 0 ? renderColumn(left) : (
                    <span className="text-base text-gray-400 italic">—</span>
                  )}
                </div>
                <div>
                  {center.length > 0 ? renderColumn(center) : (
                    <span className="text-base text-gray-400 italic">—</span>
                  )}
                </div>
                <div>
                  {right.length > 0 ? renderColumn(right) : (
                    <span className="text-base text-gray-400 italic">—</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })()}
    </div>
  )
}
