import { useState } from 'react'
import {
  ConservationPoint,
  CONSERVATION_COLORS,
  CONSERVATION_TYPE_COLORS,
  MAINTENANCE_TASK_TYPES,
} from '@/types/conservation'
import { getPointCheckup } from '@/features/conservation/utils/pointCheckup'
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
  User,
  Clock,
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
import { CONSERVATION_CATEGORIES } from '@/utils/onboarding/conservationUtils'

interface ConservationPointCardProps {
  point: ConservationPoint
  onEdit: (point: ConservationPoint) => void
  onDelete: (id: string) => void
  /** Cliccando il badge Attenzione, porta alla card temperatura nella sezione Letture */
  onFocusTemperatureCard?: (pointId: string) => void
}

export function ConservationPointCard({
  point,
  onEdit,
  onDelete,
  onFocusTemperatureCard,
}: ConservationPointCardProps) {
  const [showCategories, setShowCategories] = useState(false)
  const [showMaintenanceDetails, setShowMaintenanceDetails] = useState(false)

  const typeColors = CONSERVATION_TYPE_COLORS[point.type] || CONSERVATION_TYPE_COLORS.ambient

  // Calcola check-up completo del punto (temperatura + manutenzioni)
  const checkup = getPointCheckup(point, point.maintenance_tasks ?? [])
  const displayedStatus = checkup.overallStatus
  const statusColors = CONSERVATION_COLORS[displayedStatus] || CONSERVATION_COLORS.normal

  // Colori del box "Ultima lettura": solo in base a temperatura conforme / fuori range (verde o critico)
  const temperatureBadgeColors =
    checkup.temperature.inRange ? CONSERVATION_COLORS.normal : CONSERVATION_COLORS.critical

  // Funzioni rimosse - ora importate da conservationConstants.ts
  // Usare getConservationTypeEmoji(point.type) invece di getTypeIcon()
  // Usare getConservationTypeLabel(point.type) invece di getTypeName()

  const getStatusIcon = () => {
    switch (displayedStatus) {
      case 'normal':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-600" />
    }
  }

  const getRecordedByDisplayName = (
    user?: { first_name?: string | null; last_name?: string | null; name?: string } | null
  ): string => {
    if (!user) return ''
    if (user.first_name && user.last_name) return `${user.first_name} ${user.last_name}`
    if (user.first_name) return user.first_name
    if (user.last_name) return user.last_name
    if (user.name) return user.name
    return ''
  }

  const getStatusText = () => {
    switch (displayedStatus) {
      case 'normal':
        return 'Regolare'
      case 'warning':
        return 'Attenzione'
      case 'critical':
        return 'Critico'
    }
  }

  // Funzione unificata per mappare ID categorie a label
  // Gestisce sia ID onboarding (CONSERVATION_CATEGORIES) che ID conservationProfiles (CATEGORY_ID_TO_DB_NAME)
  const mapCategoryToLabel = (category: string): string => {
    // Cerca prima in CONSERVATION_CATEGORIES (ID onboarding: 'fresh_meat', 'fresh_fish', etc.)
    const onboardingCategory = CONSERVATION_CATEGORIES.find(cat => cat.id === category)
    if (onboardingCategory) {
      return onboardingCategory.label
    }

    // Cerca poi in CATEGORY_ID_TO_DB_NAME (ID conservationProfiles: 'raw_meat', 'dairy', etc.)
    const profileCategory = CATEGORY_ID_TO_DB_NAME[category]
    if (profileCategory) {
      return profileCategory
    }

    // Fallback: ritorna il valore originale (già un nome o ID non riconosciuto)
    return category
  }

  // Funzione per ottenere le categorie corrette da mostrare
  const getDisplayCategories = (point: ConservationPoint): string[] => {
    // Caso 1: Frigorifero con profilo
    if (point.type === 'fridge' && point.profile_id && point.appliance_category) {
      // Ricostruisci profilo se non presente
      const profile = point.profile_config ||
        getProfileById(point.profile_id as ConservationProfileId, point.appliance_category as ApplianceCategory)

      if (profile?.allowedCategoryIds) {
        return mapCategoryIdsToDbNames(profile.allowedCategoryIds)
      }
    }

    // Caso 2: Altri tipi o frigoriferi senza profilo
    if (point.product_categories && point.product_categories.length > 0) {
      return point.product_categories.map(cat => mapCategoryToLabel(cat))
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

        {point.type !== 'blast' && (
          <div className="flex items-center space-x-2">
            <Thermometer className={`w-4 h-4 ${typeColors.text}`} />
            <div>
              <div className="text-sm text-gray-600">Temperatura target</div>
              <div className={`font-semibold ${typeColors.text}`}>
                {point.setpoint_temp}°C
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <div
            className={`w-3 h-3 rounded-full ${displayedStatus === 'normal' ? 'bg-green-400' : displayedStatus === 'warning' ? 'bg-yellow-400' : 'bg-red-400'}`}
          />
          <div>
            <div className="text-sm text-gray-600">Stato</div>
            <div className={`font-semibold ${statusColors.text}`}>
              {getStatusText()}
            </div>
          </div>
        </div>
      </div>

      {/* DUE INDICAZIONI SEPARATE quando entrambe hanno problemi */}
      {checkup.messages.priority === 'both' && (displayedStatus === 'warning' || displayedStatus === 'critical') && (
        <div className="space-y-2 mb-3">
          {/* Indicazione 1: Temperatura */}
          {checkup.messages.temperature && point.type !== 'blast' && (
            <button
              type="button"
              onClick={() => onFocusTemperatureCard?.(point.id)}
              className={`w-full text-left rounded-md ${statusColors.bg} border-2 ${statusColors.border} p-3 transition-all hover:shadow-md hover:scale-[1.01] focus:outline-none focus:ring-2 ${displayedStatus === 'critical' ? 'focus:ring-red-500' : 'focus:ring-amber-400'} focus:ring-offset-1 cursor-pointer`}
              aria-label={`${checkup.messages.temperature} Clicca per regolare.`}
            >
              <div className="flex items-start gap-2">
                <Thermometer className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                <div className="flex-1">
                  <p className="font-medium text-sm text-gray-700">Temperatura</p>
                  <p className="text-xs text-gray-600 mt-0.5">{checkup.messages.temperature}</p>
                  {onFocusTemperatureCard && (
                    <span className="text-xs mt-1 block font-medium text-red-600">
                      Clicca per regolare →
                    </span>
                  )}
                </div>
              </div>
            </button>
          )}

          {/* Indicazione 2: Manutenzioni */}
          {checkup.messages.maintenance && (
            <div className={`rounded-md ${statusColors.bg} border-2 ${statusColors.border} p-3`}>
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
                <div className="flex-1">
                  <p className="font-medium text-sm text-gray-700">Manutenzioni</p>
                  <p className="text-xs text-gray-600 mt-0.5">{checkup.messages.maintenance}</p>

                  {/* Pulsante espandibile per dettagli */}
                  {(checkup.todayMaintenance.pending.length > 0 || checkup.overdueMaintenance.count > 0) && (
                    <button
                      onClick={() => setShowMaintenanceDetails(!showMaintenanceDetails)}
                      className="text-xs mt-2 font-medium flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                      type="button"
                    >
                      {showMaintenanceDetails ? 'Nascondi dettagli' : 'Mostra dettagli'}
                      {showMaintenanceDetails ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SINGOLA INDICAZIONE quando solo uno ha problemi */}
      {checkup.messages.priority !== 'both' && (displayedStatus === 'warning' || displayedStatus === 'critical') && (
        <div className="mb-3">
          {/* Solo temperatura */}
          {checkup.messages.temperature && point.type !== 'blast' && (
            <button
              type="button"
              onClick={() => onFocusTemperatureCard?.(point.id)}
              className={`w-full text-left rounded-md ${statusColors.bg} border-2 ${statusColors.border} p-3 transition-all hover:shadow-md hover:scale-[1.01] focus:outline-none focus:ring-2 ${displayedStatus === 'critical' ? 'focus:ring-red-500' : 'focus:ring-amber-400'} focus:ring-offset-1 cursor-pointer`}
              aria-label={`${checkup.messages.temperature} Clicca per regolare.`}
            >
              <p className={`text-sm font-medium ${statusColors.text} flex items-start gap-2`}>
                <Thermometer className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden />
                {checkup.messages.temperature}
              </p>
              {onFocusTemperatureCard && (
                <span className={`text-xs mt-1 block font-medium ${displayedStatus === 'critical' ? 'text-red-600' : 'text-amber-600'}`}>
                  Clicca per andare alla card di rilevamento →
                </span>
              )}
            </button>
          )}

          {/* Solo manutenzioni */}
          {checkup.messages.maintenance && (
            <div className={`rounded-md ${statusColors.bg} border-2 ${statusColors.border} p-3`}>
              <p className={`text-sm font-medium ${statusColors.text} flex items-start gap-2`}>
                <Calendar className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden />
                {checkup.messages.maintenance}
              </p>
              {(checkup.todayMaintenance.pending.length > 0 || checkup.overdueMaintenance.count > 0) && (
                <button
                  onClick={() => setShowMaintenanceDetails(!showMaintenanceDetails)}
                  className={`text-xs mt-2 font-medium flex items-center gap-1 ${displayedStatus === 'critical' ? 'text-red-700' : 'text-amber-700'} hover:underline`}
                  type="button"
                >
                  {showMaintenanceDetails ? 'Nascondi dettagli' : 'Mostra dettagli'}
                  {showMaintenanceDetails ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* DETTAGLI ESPANSI - Arretrati e Oggi */}
      {showMaintenanceDetails && (checkup.overdueMaintenance.count > 0 || checkup.todayMaintenance.pending.length > 0) && (
        <div className="mb-3 space-y-2">
          {/* Arretrati con indicatori gravità */}
          {checkup.overdueMaintenance.count > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <h4 className="text-sm font-semibold text-red-800 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Manutenzioni Arretrate
              </h4>
              <ul className="space-y-1.5">
                {checkup.overdueMaintenance.tasks.map(task => (
                  <li key={task.id} className="text-sm flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          task.severity === 'critical'
                            ? 'bg-red-600'
                            : task.severity === 'high'
                            ? 'bg-orange-500'
                            : task.severity === 'medium'
                            ? 'bg-yellow-500'
                            : 'bg-gray-400'
                        }`}
                        aria-label={`Gravità: ${task.severity}`}
                      />
                      <span className="text-gray-700">
                        {task.title || MAINTENANCE_TASK_TYPES[task.type].label}
                      </span>
                    </span>
                    <span
                      className={`text-xs font-medium flex-shrink-0 ${
                        task.severity === 'critical'
                          ? 'text-red-700'
                          : task.severity === 'high'
                          ? 'text-orange-700'
                          : 'text-yellow-700'
                      }`}
                    >
                      {task.daysOverdue} {task.daysOverdue === 1 ? 'giorno' : 'giorni'} fa
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Task di oggi */}
          {checkup.todayMaintenance.pending.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <h4 className="text-sm font-semibold text-yellow-800 mb-2 flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                Da Completare Oggi
              </h4>
              <ul className="space-y-1">
                {checkup.todayMaintenance.pending.map(task => (
                  <li key={task.id} className="text-sm text-gray-700">
                    • {task.title || MAINTENANCE_TASK_TYPES[task.type].label}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Last Temperature Reading (non mostrata per Abbattitore) — colore solo da conformità temperatura */}
      {point.type !== 'blast' && point.last_temperature_reading && (
        <div
          className={`rounded-md ${temperatureBadgeColors.bg} border ${temperatureBadgeColors.border} p-3 mb-3`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Ultima lettura</div>
              <div className={`font-semibold ${temperatureBadgeColors.text}`}>
                {point.last_temperature_reading.temperature}°C
              </div>
            </div>
            <div className="flex flex-col items-end text-xs text-gray-500 gap-0.5">
              <span>
                {new Date(
                  point.last_temperature_reading.recorded_at
                ).toLocaleDateString('it-IT', {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              {point.last_temperature_reading.recorded_by_user && (() => {
                const name = getRecordedByDisplayName(point.last_temperature_reading.recorded_by_user)
                if (!name) return null
                return (
                  <span className="flex items-center gap-1.5 text-gray-600">
                    <User className="w-3.5 h-3.5 flex-shrink-0" aria-hidden />
                    {name}
                  </span>
                )
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Prossima Manutenzione (quando tutto ok) – cliccabile, espande elenco per tipologia */}
      {displayedStatus === 'normal' && (checkup.nextMaintenanceDue || (checkup.nextMaintenanceByType && checkup.nextMaintenanceByType.length > 0)) && (
        <div className="mb-3">
          <button
            type="button"
            onClick={() => setShowMaintenanceDetails(!showMaintenanceDetails)}
            className="flex items-center gap-2 text-sm text-gray-600 w-full text-left hover:bg-gray-100 rounded-md p-1 -m-1 transition-colors"
            aria-expanded={showMaintenanceDetails}
          >
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">
              Prossima manutenzione: {checkup.nextMaintenanceDue
                ? `${checkup.nextMaintenanceDue.task.title || MAINTENANCE_TASK_TYPES[checkup.nextMaintenanceDue.task.type].label} ${checkup.nextMaintenanceDue.daysUntil === 0 ? 'oggi' : checkup.nextMaintenanceDue.daysUntil === 1 ? 'domani' : `tra ${checkup.nextMaintenanceDue.daysUntil} giorni`}`
                : 'clicca per dettagli'}
            </span>
            {showMaintenanceDetails ? (
              <ChevronUp className="w-4 h-4 flex-shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 flex-shrink-0" />
            )}
          </button>
          {showMaintenanceDetails && checkup.nextMaintenanceByType && checkup.nextMaintenanceByType.length > 0 && (
            <ul className="mt-2 pl-6 space-y-1.5 text-sm text-gray-700 border-l-2 border-gray-200 ml-2">
              {checkup.nextMaintenanceByType.map(({ type, label, daysUntil }) => (
                <li key={type} className="flex items-center justify-between gap-2">
                  <span>{label}</span>
                  <span className="text-gray-500 font-medium">
                    {daysUntil === 0 ? 'oggi' : daysUntil === 1 ? 'domani' : `tra ${daysUntil} giorni`}
                  </span>
                </li>
              ))}
            </ul>
          )}
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
