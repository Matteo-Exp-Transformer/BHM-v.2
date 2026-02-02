import React, { useState, useEffect, useMemo } from 'react'
import {
  ConservationPoint,
  ConservationPointType,
} from '@/types/conservation'
import { X, Thermometer, ShieldCheck, AlertCircle } from 'lucide-react'
import {
  getProfileById,
  getProfilesForAppliance,
  mapCategoryIdsToDbNames,
  APPLIANCE_CATEGORY_LABELS,
  type ApplianceCategory,
  type ConservationProfileId,
} from '@/utils/conservationProfiles'
import { useDepartments } from '@/features/management/hooks/useDepartments'
import { useStaff } from '@/features/management/hooks/useStaff'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectOption,
} from '@/components/ui/Select'
import { MiniCalendar } from '@/components/ui/MiniCalendar'
import {
  CONSERVATION_POINT_TYPES,
  // BUG M1 FIX: Rimosso validateTemperatureForType - non piu' necessario
} from '@/utils/onboarding/conservationUtils'
import {
  getConservationTempRangeString,
  DEFAULT_TEMPERATURES,
} from '@/utils/conservationConstants'
import { DEFAULT_CATEGORIES } from '@/utils/defaultCategories'
import { STAFF_ROLES, STAFF_CATEGORIES } from '@/utils/haccpRules'
import { calculateNextDue, useMaintenanceTasks } from '@/features/conservation/hooks/useMaintenanceTasks'
import type { MaintenanceFrequency as EnglishMaintenanceFrequency, MaintenanceTask as DBMaintenanceTask } from '@/types/conservation'
import { cn } from '@/lib/utils'
import { useCalendarSettings } from '@/hooks/useCalendarSettings'
import { Modal } from '@/components/ui/Modal'
import { OptimizedImage } from '@/components/ui/OptimizedImage'
import { getApplianceImagePathWithProfile, hasApplianceImageAvailable } from '@/config/applianceImages'

// BUG M1 FIX: Costanti rimosse - ora importate da conservationConstants.ts
// Usare getConservationTempRangeString(type) per ottenere il range come stringa
// Usare DEFAULT_TEMPERATURES[type] per ottenere la temperatura default

type StandardMaintenanceType =
  | 'rilevamento_temperatura'
  | 'sanificazione'
  | 'sbrinamento'
  | 'controllo_scadenze'

type MaintenanceFrequency =
  | 'giornaliera'
  | 'settimanale'
  | 'mensile'
  | 'annuale'

type StaffRole = 'admin' | 'responsabile' | 'dipendente' | 'collaboratore'

type Weekday = 'lunedi' | 'martedi' | 'mercoledi' | 'giovedi' | 'venerdi' | 'sabato' | 'domenica'

interface MandatoryMaintenanceTask {
  manutenzione: StandardMaintenanceType
  frequenza: MaintenanceFrequency
  assegnatoARuolo: StaffRole
  assegnatoACategoria?: string
  assegnatoADipendenteSpecifico?: string
  giorniSettimana?: Weekday[] // Configurazione giorni (giornaliera/settimanale)
  giornoMese?: number // Giorno del mese (1-31) per frequenza mensile
  giornoAnno?: number // Giorno dell'anno (1-365) per frequenza annuale
  note?: string
}

interface AddPointModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (
    data: Omit<
      ConservationPoint,
      | 'id'
      | 'company_id'
      | 'created_at'
      | 'updated_at'
      | 'status'
      | 'last_temperature_reading'
    >,
    maintenanceTasks: any[] // Trasformati nel formato atteso da useConservationPoints
  ) => void
  point?: ConservationPoint | null
  isLoading?: boolean
  showMaintenances?: boolean // Se false, nasconde sezione manutenzioni (per onboarding)
  departmentsOverride?: any[] // Per onboarding: usa questi reparti invece di caricarli dal DB
  staffOverride?: any[] // Per onboarding: usa questo staff invece di caricarlo dal DB
}

const MAINTENANCE_TYPES: Record<
  StandardMaintenanceType,
  { label: string; icon: string; description: string }
> = {
  rilevamento_temperatura: {
    label: 'Rilevamento Temperature',
    icon: '🌡️',
    description: 'Controllo periodico delle temperature',
  },
  sanificazione: {
    label: 'Sanificazione',
    icon: '🧼',
    description: 'Pulizia e sanificazione completa',
  },
  sbrinamento: {
    label: 'Sbrinamento',
    icon: '❄️',
    description: 'Sbrinamento e manutenzione',
  },
  controllo_scadenze: {
    label: 'Controllo Scadenze',
    icon: '📅',
    description: 'Verifica scadenze prodotti',
  },
}

const WEEKDAYS_ARRAY: Array<{ value: Weekday; label: string }> = [
  { value: 'lunedi', label: 'Lunedì' },
  { value: 'martedi', label: 'Martedì' },
  { value: 'mercoledi', label: 'Mercoledì' },
  { value: 'giovedi', label: 'Giovedì' },
  { value: 'venerdi', label: 'Venerdì' },
  { value: 'sabato', label: 'Sabato' },
  { value: 'domenica', label: 'Domenica' },
]

const ALL_WEEKDAYS: Weekday[] = ['lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi', 'sabato', 'domenica']

// Mapping tipo manutenzione da italiano a inglese
const MAINTENANCE_TYPE_MAPPING: Record<StandardMaintenanceType, string> = {
  'rilevamento_temperatura': 'temperature',
  'sanificazione': 'sanitization',
  'sbrinamento': 'defrosting',
  'controllo_scadenze': 'expiry_check',
}

// Mapping frequenza da italiano a inglese
const FREQUENCY_MAPPING: Record<MaintenanceFrequency, EnglishMaintenanceFrequency> = {
  'giornaliera': 'daily',
  'settimanale': 'weekly',
  'mensile': 'monthly',
  'annuale': 'annually',
}

// Mapping inverso tipo manutenzione da inglese a italiano (per caricamento da DB)
const REVERSE_MAINTENANCE_TYPE_MAPPING: Record<string, StandardMaintenanceType> = {
  'temperature': 'rilevamento_temperatura',
  'sanitization': 'sanificazione',
  'defrosting': 'sbrinamento',
  'expiry_check': 'controllo_scadenze',
}

// Mapping inverso frequenza da inglese a italiano (per caricamento da DB)
const REVERSE_FREQUENCY_MAPPING: Record<string, MaintenanceFrequency> = {
  'daily': 'giornaliera',
  'weekly': 'settimanale',
  'monthly': 'mensile',
  'annually': 'annuale',
  // Mappiamo anche altre frequenze possibili
  'quarterly': 'mensile', // Fallback a mensile
  'biannually': 'annuale', // Fallback a annuale
}

function MaintenanceTaskForm({
  task,
  index,
  staff,
  staffCategories: _staffCategories,
  onUpdate,
  hasError = false,
}: {
  task: MandatoryMaintenanceTask
  index: number
  staff: any[]
  staffCategories: string[]
  onUpdate: (index: number, task: MandatoryMaintenanceTask) => void
  hasError?: boolean
}) {
  const { settings: calendarSettings, isLoading: isLoadingCalendarSettings } = useCalendarSettings()
  
  const updateTask = (field: keyof MandatoryMaintenanceTask, value: any) => {
    onUpdate(index, { ...task, [field]: value })
  }

  const info = MAINTENANCE_TYPES[task.manutenzione]

  // Mappa giorni numerici (0-6, dove 0=domenica) a nomi Weekday
  // open_weekdays nel DB: 0=domenica, 1=lunedì, 2=martedì, 3=mercoledì, 4=giovedì, 5=venerdì, 6=sabato
  // ALL_WEEKDAYS: [lunedi, martedi, mercoledi, giovedi, venerdi, sabato, domenica] (ordine settimanale)
  const availableWeekdays = useMemo(() => {
    if (!calendarSettings?.open_weekdays || calendarSettings.open_weekdays.length === 0) {
      // Fallback: tutti i giorni (compatibilità retroattiva)
      return ALL_WEEKDAYS
    }
    
    // Mappa: DB 0 (domenica) -> 'domenica', DB 1 (lunedì) -> 'lunedi', ecc.
    const numericToWeekday: Weekday[] = ['domenica', 'lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi', 'sabato']
    
    // Mappa i numeri ai weekday e ordina secondo ordine settimanale (lunedì-domenica)
    const mapped = calendarSettings.open_weekdays
      .map(dayNum => numericToWeekday[dayNum])
      .filter((day): day is Weekday => day !== undefined)
    
    // Ordina secondo ALL_WEEKDAYS per mantenere ordine settimanale
    return ALL_WEEKDAYS.filter(day => mapped.includes(day))
  }, [calendarSettings])

  // Default giorni per frequenza giornaliera: tutti i giorni di apertura
  const defaultDailyWeekdays = useMemo(() => {
    return availableWeekdays || ALL_WEEKDAYS
  }, [availableWeekdays])

  // Default giorno per frequenza settimanale: primo giorno di apertura
  const defaultWeeklyWeekday = useMemo(() => {
    return availableWeekdays[0] || 'lunedi'
  }, [availableWeekdays])

  // Imposta default giorni settimana quando cambia frequenza
  useEffect(() => {
    if (task.frequenza === 'giornaliera' && (!task.giorniSettimana || task.giorniSettimana.length === 0)) {
      // Default: tutti i giorni di apertura selezionati
      updateTask('giorniSettimana', defaultDailyWeekdays)
    } else if (task.frequenza === 'settimanale' && (!task.giorniSettimana || task.giorniSettimana.length === 0)) {
      // Default: primo giorno di apertura (array con un solo elemento)
      updateTask('giorniSettimana', [defaultWeeklyWeekday])
    } else if (task.frequenza !== 'giornaliera' && task.frequenza !== 'settimanale' && task.giorniSettimana) {
      // Reset quando cambia a frequenza diversa
      updateTask('giorniSettimana', undefined)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.frequenza, defaultDailyWeekdays, defaultWeeklyWeekday])

  return (
    <div className={cn(
      'border rounded-lg p-4 bg-white space-y-4',
      hasError && 'border-red-500 border-2'
    )}>
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{info.icon}</span>
          <div>
            <h4 className="font-semibold text-gray-900">{info.label}</h4>
            <p className="text-xs text-gray-500">{info.description}</p>
          </div>
        </div>
        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
          Obbligatorio
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Frequenza *
          </label>
          <select
            data-testid={`frequenza-select-${index}`}
            value={task.frequenza}
            onChange={e => {
              const newFrequency = e.target.value as MaintenanceFrequency
              // Quando si seleziona frequenza giornaliera, imposta automaticamente i giorni di apertura
              if (newFrequency === 'giornaliera') {
                onUpdate(index, {
                  ...task,
                  frequenza: newFrequency,
                  giorniSettimana: defaultDailyWeekdays,
                })
              } else {
                updateTask('frequenza', newFrequency)
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Seleziona frequenza...</option>
            <option value="giornaliera">Giornaliera</option>
            <option value="settimanale">Settimanale</option>
            <option value="mensile">Mensile</option>
            <option value="annuale" disabled={task.manutenzione !== 'sbrinamento'}>
              Annuale {task.manutenzione !== 'sbrinamento' && '(solo sbrinamento)'}
            </option>
          </select>
        </div>

        <div>
          <Label htmlFor={`role-select-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
            Assegnato a Ruolo *
          </Label>
          <Select
            value={task.assegnatoARuolo || ''}
            onValueChange={(value) => {
              // FIX BUG C1: Aggiorna tutti i campi in una singola chiamata
              // per evitare che le chiamate successive sovrascrivano il valore
              onUpdate(index, {
                ...task,
                assegnatoARuolo: value as StaffRole,
                assegnatoACategoria: undefined,
                assegnatoADipendenteSpecifico: undefined,
              })
            }}
          >
            <SelectTrigger id={`role-select-${index}`} className="w-full">
              <SelectValue placeholder="Seleziona ruolo..." />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={5} className="z-[10001]">
              {STAFF_ROLES.map(role => (
                <SelectOption key={role.value} value={role.value}>
                  {role.label}
                </SelectOption>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {task.assegnatoARuolo && (
        <div>
          <Label htmlFor={`category-select-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
            Categoria Staff
          </Label>
          <Select
            value={task.assegnatoACategoria || 'all'}
            onValueChange={(value) => {
              // FIX BUG C1-bis: Aggiorna tutti i campi in una singola chiamata
              // per evitare che le chiamate successive sovrascrivano il valore
              onUpdate(index, {
                ...task,
                assegnatoACategoria: value,
                assegnatoADipendenteSpecifico: undefined,
              })
            }}
          >
            <SelectTrigger id={`category-select-${index}`} className="w-full">
              <SelectValue placeholder="Seleziona categoria..." />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={5} className="z-[10001]">
              <SelectOption value="all">Tutte le categorie</SelectOption>
              {STAFF_CATEGORIES.map(cat => (
                <SelectOption key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectOption>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {task.assegnatoARuolo && (
        <div>
          <Label htmlFor={`staff-select-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
            Dipendente Specifico (opzionale)
          </Label>
          <Select
            value={task.assegnatoADipendenteSpecifico || 'none'}
            onValueChange={(value) =>
              updateTask(
                'assegnatoADipendenteSpecifico',
                value === 'none' ? undefined : value
              )
            }
          >
            <SelectTrigger id={`staff-select-${index}`} className="w-full">
              <SelectValue placeholder="Seleziona dipendente..." />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={5} className="z-[10001]">
              <SelectOption value="none">Nessun dipendente specifico</SelectOption>
              {staff
                .filter(person => {
                  if (person.role !== task.assegnatoARuolo) return false
                  if (
                    task.assegnatoACategoria &&
                    task.assegnatoACategoria !== 'all' &&
                    person.categories
                  ) {
                    return person.categories.includes(task.assegnatoACategoria)
                  }
                  return true
                })
                .map(person => (
                  <SelectOption key={person.id} value={person.id}>
                    {person.name} - {person.categories?.join(', ') || 'Nessuna categoria'}
                  </SelectOption>
                ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {task.frequenza === 'giornaliera' && (
        <div className="space-y-2">
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            Giorni della settimana *
          </Label>
          <p className="text-xs text-gray-500">
            Disponibili solo i giorni di apertura dall'onboarding.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
            {availableWeekdays.map(weekdayValue => {
              const weekday = WEEKDAYS_ARRAY.find(w => w.value === weekdayValue)
              if (!weekday) return null
              return (
                <label key={weekday.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={task.giorniSettimana?.includes(weekday.value) || false}
                    onChange={(e) => {
                      const current = task.giorniSettimana || []
                      const updated = e.target.checked
                        ? [...current, weekday.value]
                        : current.filter(d => d !== weekday.value)
                      updateTask('giorniSettimana', updated)
                    }}
                    className="rounded border-gray-300 text-primary"
                    aria-label={weekday.label}
                  />
                  <span className="text-sm">{weekday.label}</span>
                </label>
              )
            })}
          </div>
          {isLoadingCalendarSettings && (
            <p className="text-xs text-gray-400">Caricamento giorni...</p>
          )}
        </div>
      )}

      {task.frequenza === 'settimanale' && (
        <div className="space-y-2">
          <Label htmlFor={`weekday-select-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
            Giorno della settimana *
          </Label>
          <select
            id={`weekday-select-${index}`}
            value={task.giorniSettimana?.[0] || defaultWeeklyWeekday}
            onChange={(e) => {
              updateTask('giorniSettimana', [e.target.value as Weekday])
            }}
            className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
          >
            {availableWeekdays.map(weekdayValue => {
              const weekday = WEEKDAYS_ARRAY.find(w => w.value === weekdayValue)
              if (!weekday) return null
              return (
                <option key={weekday.value} value={weekday.value}>
                  {weekday.label}
                </option>
              )
            })}
          </select>
          <p className="text-xs text-gray-500">
            Disponibili solo i giorni di apertura dall'onboarding.
          </p>
          {isLoadingCalendarSettings && (
            <p className="text-xs text-gray-400">Caricamento giorni...</p>
          )}
        </div>
      )}

      {task.frequenza === 'mensile' && (
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            Giorno del mese *
          </Label>
          <MiniCalendar
            mode="month"
            selectedDay={task.giornoMese}
            onSelect={(day) => updateTask('giornoMese', day)}
            className="mt-2"
          />
        </div>
      )}

      {task.frequenza === 'annuale' && task.manutenzione === 'sbrinamento' && (
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            Giorno dell'anno *
          </Label>
          <MiniCalendar
            mode="year"
            selectedDay={task.giornoAnno}
            onSelect={(day) => updateTask('giornoAnno', day)}
            className="mt-2"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Note
        </label>
        <textarea
          value={task.note || ''}
          onChange={e => updateTask('note', e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Note aggiuntive..."
        />
      </div>

      {hasError && (
        <div className="text-sm text-red-600 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>Completa tutti i campi obbligatori</span>
        </div>
      )}
    </div>
  )
}

export function AddPointModal({
  isOpen,
  onClose,
  onSave,
  point,
  isLoading,
  showMaintenances = true, // Default: mostra manutenzioni (comportamento normale)
  departmentsOverride,
  staffOverride,
}: AddPointModalProps) {
  const { departments: dbDepartments } = useDepartments()
  const { staff: dbStaff } = useStaff()
  // RIMOSSO: useCategories() - usiamo DEFAULT_CATEGORIES per avere sempre tutte le 15 categorie

  // Usa departmentsOverride se fornito (onboarding), altrimenti usa DB
  const departments = departmentsOverride || dbDepartments
  const staff = staffOverride || dbStaff
  
  // Carica manutenzioni esistenti quando point è presente (modalità edit)
  const { maintenanceTasks: existingMaintenances } = useMaintenanceTasks(point?.id)

  // BUG M1 FIX: Rimosso targetTemperature e isManuallyEdited - campo temperatura ora informativo
  const [formData, setFormData] = useState({
    name: '',
    departmentId: '',
    pointType: 'fridge' as ConservationPointType,
    isBlastChiller: false,
    productCategories: [] as string[],
    applianceCategory: '' as ApplianceCategory | '',
    profileId: '',
    isCustomProfile: false,
  })

  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Genera manutenzioni obbligatorie basate sul tipo di punto
  const getRequiredMaintenanceTasks = (pointType: ConservationPointType): MandatoryMaintenanceTask[] => {
    if (pointType === 'blast') {
      // Abbattitore: solo Sanificazione
      return [
        {
          manutenzione: 'sanificazione',
          frequenza: '' as MaintenanceFrequency,
          assegnatoARuolo: '' as StaffRole,
          assegnatoACategoria: undefined,
        },
      ]
    }
    if (pointType === 'ambient') {
      // Ambiente: sanificazione e controllo scadenze
      return [
        {
          manutenzione: 'sanificazione',
          frequenza: '' as MaintenanceFrequency,
          assegnatoARuolo: '' as StaffRole,
          assegnatoACategoria: undefined,
        },
        {
          manutenzione: 'controllo_scadenze',
          frequenza: '' as MaintenanceFrequency,
          assegnatoARuolo: '' as StaffRole,
          assegnatoACategoria: undefined,
        },
      ]
    }
    // Per frigorifero e congelatore: tutte le manutenzioni incluso rilevamento temperatura
    return [
        {
          manutenzione: 'rilevamento_temperatura',
          frequenza: '' as MaintenanceFrequency,
          assegnatoARuolo: '' as StaffRole,
          assegnatoACategoria: undefined,
        },
        {
          manutenzione: 'sanificazione',
          frequenza: '' as MaintenanceFrequency,
          assegnatoARuolo: '' as StaffRole,
          assegnatoACategoria: undefined,
        },
        {
          manutenzione: 'sbrinamento',
          frequenza: '' as MaintenanceFrequency,
          assegnatoARuolo: '' as StaffRole,
          assegnatoACategoria: undefined,
        },
        {
          manutenzione: 'controllo_scadenze',
          frequenza: '' as MaintenanceFrequency,
          assegnatoARuolo: '' as StaffRole,
          assegnatoACategoria: undefined,
        },
      ]
  }

  const [maintenanceTasks, setMaintenanceTasks] = useState<
    MandatoryMaintenanceTask[]
  >(getRequiredMaintenanceTasks(formData.pointType))

  // Funzione per trasformare MaintenanceTask (DB) a MandatoryMaintenanceTask (form)
  const transformMaintenanceTaskToForm = (task: DBMaintenanceTask): MandatoryMaintenanceTask => {
    const standardType = REVERSE_MAINTENANCE_TYPE_MAPPING[task.type] || 'rilevamento_temperatura'
    const frequency = REVERSE_FREQUENCY_MAPPING[task.frequency] || 'giornaliera' as MaintenanceFrequency
    
    return {
      manutenzione: standardType,
      frequenza: frequency,
      assegnatoARuolo: (task.assigned_to_role as StaffRole) || '' as StaffRole,
      assegnatoACategoria: task.assigned_to_category || undefined,
      assegnatoADipendenteSpecifico: task.assigned_to_staff_id || undefined,
      giorniSettimana: undefined, // Non salvato nel DB, lasciato undefined
      giornoMese: undefined, // Non salvato nel DB, lasciato undefined
      giornoAnno: undefined, // Non salvato nel DB, lasciato undefined
      note: task.description || undefined,
    }
  }

  // Aggiorna le manutenzioni quando cambia il tipo di punto (solo in modalità creazione)
  useEffect(() => {
    if (!point) {
      // Solo in modalità creazione: aggiorna quando cambia tipo punto
      setMaintenanceTasks(getRequiredMaintenanceTasks(formData.pointType))
    }
  }, [formData.pointType, point])

  // BUG M1 FIX: Rimosso useEffect che impostava temperatura default
  // Il campo temperatura ora e' sempre disabilitato e mostra solo il range consigliato
  // La temperatura viene usata solo dal DB (setpoint_temp) quando si modifica un punto esistente

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({})
  const [maintenanceErrors, setMaintenanceErrors] = useState<Record<number, string[]>>({})
  // BUG M1 FIX: Rimosso temperatureError - non piu' necessario

  const departmentOptions = useMemo(
    () => departments.filter(department => department.is_active !== false),
    [departments]
  )

  // BUG M1 FIX: Rimosso typeInfo - non piu' necessario

  // TUTTE le 15 categorie predefinite (sempre disponibili)
  const allCategories = useMemo(() => {
    return DEFAULT_CATEGORIES.map(cat => ({
      id: cat.name,
      label: cat.name,
      storageType: cat.temperature_requirements.storage_type,
      range: {
        min: cat.temperature_requirements.min_temp,
        max: cat.temperature_requirements.max_temp
      }
    }))
  }, [])

  // Categorie compatibili con il tipo di punto (auto-assegnate)
  const compatibleCategories = useMemo(() => {
    // Mappa tipo punto -> storage_type
    const storageTypeMap: Record<ConservationPointType, string> = {
      fridge: 'fridge',
      freezer: 'freezer',
      ambient: 'ambient',
      blast: '', // Nessuna categoria compatibile per abbattitore
    }

    const targetStorageType = storageTypeMap[formData.pointType]

    // Filtra categorie con storage_type compatibile
    return allCategories
      .filter(cat => cat.storageType === targetStorageType)
      .map(cat => cat.id)
  }, [formData.pointType, allCategories])

  // State per profilo selezionato (TASK-3.3)
  const selectedProfile = useMemo(() => {
    if (!formData.applianceCategory || !formData.profileId) return null
    return getProfileById(
      formData.profileId as ConservationProfileId,
      formData.applianceCategory as ApplianceCategory
    )
  }, [formData.applianceCategory, formData.profileId])

  // Auto-assegnazione categorie compatibili quando cambia tipo di punto
  useEffect(() => {
    // Assegna automaticamente le categorie compatibili in base al tipo di punto
    setFormData(prev => ({
      ...prev,
      productCategories: compatibleCategories,
    }))
  }, [compatibleCategories])

  // Auto-configurazione quando profilo selezionato (TASK-3.3)
  useEffect(() => {
    if (selectedProfile) {
      // 1. Mappa categorie dal profilo
      const mappedCategories = mapCategoryIdsToDbNames(selectedProfile.allowedCategoryIds)

      setFormData(prev => ({
        ...prev,
        productCategories: mappedCategories,
      }))
    }
  }, [selectedProfile])

  // RIMOSSO: Auto-deseleziona categorie incompatibili - ora gestito da auto-assegnazione

  // BUG M1 FIX: Rimosso useEffect validazione temperatura - non piu' necessario

  useEffect(() => {
    if (point) {
      // BUG M1 FIX: Rimosso targetTemperature e isManuallyEdited
      setFormData({
        name: point.name,
        departmentId: point.department_id || '',
        pointType: point.type,
        isBlastChiller: point.is_blast_chiller,
        productCategories: point.product_categories || [],
        applianceCategory: (point.appliance_category as ApplianceCategory) || '',
        profileId: point.profile_id || '',
        isCustomProfile: point.is_custom_profile || false,
      })
      // Manutenzioni caricate da useMaintenanceTasks (vedi useEffect sotto)
    } else {
      setFormData({
        name: '',
        departmentId: '',
        pointType: 'fridge',
        isBlastChiller: false,
        productCategories: [],
        applianceCategory: '' as ApplianceCategory | '',
        profileId: '',
        isCustomProfile: false,
      })
      setMaintenanceTasks([
        {
          manutenzione: 'rilevamento_temperatura',
          frequenza: '' as MaintenanceFrequency,
          assegnatoARuolo: '' as StaffRole,
          assegnatoACategoria: undefined,
        },
        {
          manutenzione: 'sanificazione',
          frequenza: '' as MaintenanceFrequency,
          assegnatoARuolo: '' as StaffRole,
          assegnatoACategoria: undefined,
        },
        {
          manutenzione: 'sbrinamento',
          frequenza: '' as MaintenanceFrequency,
          assegnatoARuolo: '' as StaffRole,
          assegnatoACategoria: undefined,
        },
        {
          manutenzione: 'controllo_scadenze',
          frequenza: '' as MaintenanceFrequency,
          assegnatoARuolo: '' as StaffRole,
          assegnatoACategoria: undefined,
        },
      ])
      // BUG M1 FIX: Rimosso setIsManuallyEdited
    }
    setValidationErrors({})
    setMaintenanceErrors({})
    // BUG M1 FIX: Rimosso setTemperatureError
  }, [point, isOpen])

  // Carica e trasforma manutenzioni esistenti quando point è presente (modalità edit)
  useEffect(() => {
    if (point && existingMaintenances && existingMaintenances.length > 0) {
      // Trasforma manutenzioni esistenti nel formato MandatoryMaintenanceTask
      // Per Abbattitore: solo Sanificazione (no rilevamento temperatura, no controllo scadenze)
      const transformed = existingMaintenances
        .filter(task => {
          if (!Object.keys(REVERSE_MAINTENANCE_TYPE_MAPPING).includes(task.type)) return false
          if (point.type === 'blast') {
            if (task.type === 'temperature') return false
            if (task.type === 'expiry_check') return false
            return task.type === 'sanitization'
          }
          return true
        })
        .map(task => transformMaintenanceTaskToForm(task))

      // Se ci sono manutenzioni trasformate, usale, altrimenti usa quelle obbligatorie
      if (transformed.length > 0) {
        setMaintenanceTasks(transformed)
      }
    }
  }, [point, existingMaintenances])

  // Reset imageError quando cambia categoria elettrodomestico
  useEffect(() => {
    setImageError(false)
  }, [formData.applianceCategory])

  // BUG M1 FIX: Rimosso useEffect che resettava isManuallyEdited

  // Validazione specifica per manutenzioni (Task 1.3)
  const validateMaintenanceTasks = (tasks: MandatoryMaintenanceTask[]): string[] => {
    const errors: string[] = []
    const pointType = formData.pointType

    // Per abbattitore: solo Sanificazione ammessa
    if (pointType === 'blast') {
      const invalidTasks = tasks.filter(t => t.manutenzione !== 'sanificazione')
      if (invalidTasks.length > 0) {
        errors.push('Per l\'abbattitore è consentita solo la manutenzione Sanificazione.')
      }
      const hasSanificazione = tasks.some(t => t.manutenzione === 'sanificazione')
      if (!hasSanificazione && tasks.length > 0) {
        errors.push('Per l\'abbattitore è obbligatoria la manutenzione Sanificazione.')
      }
    }

    tasks.forEach((task, index) => {
      // 1. Frequenza obbligatoria
      if (!task.frequenza) {
        errors.push(`Task ${index + 1}: Frequenza obbligatoria`)
      }
      
      // 2. Assegnazione obbligatoria (ruolo, categoria o dipendente)
      if (!task.assegnatoARuolo && !task.assegnatoACategoria && !task.assegnatoADipendenteSpecifico) {
        errors.push(`Task ${index + 1}: Assegnazione obbligatoria (ruolo, categoria o dipendente)`)
      }
      
      // 3. Giorni settimana per giornaliera
      if (task.frequenza === 'giornaliera' && (!task.giorniSettimana || task.giorniSettimana.length === 0)) {
        errors.push(`Task ${index + 1}: Seleziona almeno un giorno per frequenza giornaliera`)
      }
      
      // 4. Giorno settimana per settimanale
      if (task.frequenza === 'settimanale' && (!task.giorniSettimana || task.giorniSettimana.length === 0)) {
        errors.push(`Task ${index + 1}: Seleziona giorno per frequenza settimanale`)
      }
      
      // 5. Giorno mese per mensile
      if (task.frequenza === 'mensile' && !task.giornoMese) {
        errors.push(`Task ${index + 1}: Seleziona giorno del mese per frequenza mensile`)
      }
      
      // 6. Giorno anno per annuale
      if (task.frequenza === 'annuale' && !task.giornoAnno) {
        errors.push(`Task ${index + 1}: Seleziona giorno dell'anno per frequenza annuale`)
      }
    })
    return errors
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) {
      errors.name = 'Il nome è obbligatorio'
    }
    if (!formData.departmentId) {
      errors.departmentId = 'Seleziona un reparto'
    }
    // RIMOSSO: Validazione categorie - ora auto-assegnate in base alla temperatura

    // Validazione profilo (solo per frigoriferi) - TASK-3.4
    if (formData.pointType === 'fridge') {
      if (!formData.applianceCategory) {
        errors.applianceCategory = 'Seleziona una categoria elettrodomestico'
      }
      if (!formData.profileId) {
        errors.profileId = 'Seleziona un profilo HACCP'
      }
    }

    // Validazione manutenzioni con errori specifici (solo se showMaintenances è true)
    if (showMaintenances) {
      const maintenanceErrors = validateMaintenanceTasks(maintenanceTasks)
      const maintenanceErrorsMap: Record<number, string[]> = {}

      if (maintenanceErrors.length > 0) {
        errors.maintenances = maintenanceErrors.join(', ')

        // Crea mappa per evidenziare errori per task specifico
        maintenanceTasks.forEach((task, index) => {
          const taskErrors: string[] = []
          if (!task.frequenza) {
            taskErrors.push('seleziona frequenza')
          }
          if (!task.assegnatoARuolo && !task.assegnatoACategoria && !task.assegnatoADipendenteSpecifico) {
            taskErrors.push('seleziona assegnazione')
          }
          if (task.frequenza === 'mensile' && !task.giornoMese) {
            taskErrors.push('seleziona giorno del mese')
          }
          if (task.frequenza === 'annuale' && !task.giornoAnno) {
            taskErrors.push('seleziona giorno dell\'anno')
          }
          if ((task.frequenza === 'giornaliera' || task.frequenza === 'settimanale') &&
              (!task.giorniSettimana || task.giorniSettimana.length === 0)) {
            taskErrors.push('seleziona giorni settimana')
          }
          if (taskErrors.length > 0) {
            maintenanceErrorsMap[index] = taskErrors
          }
        })

        errors.maintenanceTasks = 'Completa tutte le manutenzioni obbligatorie'
      }
      setMaintenanceErrors(maintenanceErrorsMap)
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Transforma MandatoryMaintenanceTask[] nel formato atteso da useConservationPoints
  const transformMaintenanceTasks = (tasks: MandatoryMaintenanceTask[]) => {
    return tasks.map(task => {
      const maintenanceType = MAINTENANCE_TYPE_MAPPING[task.manutenzione]
      const frequency = FREQUENCY_MAPPING[task.frequenza]
      const title = MAINTENANCE_TYPES[task.manutenzione].label
      
      // Calcola next_due basandosi sulla frequenza
      const nextDueDate = new Date(calculateNextDue(frequency as EnglishMaintenanceFrequency))
      
      // Calcola assignment_type: 'staff' se assegnatoADipendenteSpecifico è presente, altrimenti 'role'
      const assignment_type = task.assegnatoADipendenteSpecifico ? 'staff' : 'role'
      
      return {
        type: maintenanceType,
        frequency: frequency,
        title: title,
        assigned_to: task.assegnatoARuolo || 'role', // Fallback
        assignment_type: assignment_type,
        assigned_to_role: task.assegnatoARuolo || null,
        assigned_to_category: task.assegnatoACategoria === 'all' ? null : (task.assegnatoACategoria || null),
        assigned_to_staff_id: task.assegnatoADipendenteSpecifico || null,
        next_due: nextDueDate,
        priority: 'medium' as const,
        estimated_duration: 60, // Default duration
        instructions: [],
      }
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // BUG M1 FIX: Usa temperatura default basata sul tipo di punto
    // In modalita' edit, usa la temperatura esistente dal punto
    // Se c'è un profilo selezionato, usa la temperatura consigliata dal profilo
    let temp = point?.setpoint_temp ?? DEFAULT_TEMPERATURES[formData.pointType] ?? 4
    if (selectedProfile) {
      temp = selectedProfile.recommendedSetPointsC.fridge
    }

    // Trasforma i maintenanceTasks nel formato atteso da useConservationPoints
    // Se showMaintenances è false (onboarding), passa array vuoto
    // Per Abbattitore: salvare solo Sanificazione
    const tasksToSave = formData.pointType === 'blast'
      ? maintenanceTasks.filter(t => t.manutenzione === 'sanificazione')
      : maintenanceTasks
    const transformedMaintenanceTasks = showMaintenances
      ? transformMaintenanceTasks(tasksToSave)
      : []

    onSave(
      {
        name: formData.name,
        department_id: formData.departmentId,
        setpoint_temp: temp,
        type: formData.pointType,
        is_blast_chiller: formData.isBlastChiller,
        product_categories: formData.productCategories,
        appliance_category: formData.applianceCategory || null,
        profile_id: formData.profileId || null,
        is_custom_profile: false, // Sempre false per profili standard
        profile_config: null, // Sempre null per profili standard
      },
      transformedMaintenanceTasks
    )
  }

  const updateMaintenanceTask = (
    index: number,
    updatedTask: MandatoryMaintenanceTask
  ) => {
    const updated = [...maintenanceTasks]
    updated[index] = updatedTask
    setMaintenanceTasks(updated)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999] overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[calc(100vh-100px)] overflow-y-auto my-8">
        <div className="sticky top-0 bg-white border-b z-10 flex items-center justify-between p-6">
          <h2 className="text-xl font-semibold">
            {point
              ? 'Modifica Punto di Conservazione'
              : 'Nuovo Punto di Conservazione'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Summary - TASK 1.3: Show all validation errors at top */}
          {Object.keys(validationErrors).length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-red-800 mb-2">
                Correggi i seguenti errori:
              </p>
              <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                {Object.entries(validationErrors)
                  .filter(([key]) => key.startsWith('maintenance_'))
                  .map(([, error], idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                {Object.entries(validationErrors)
                  .filter(([key]) => !key.startsWith('maintenance_'))
                  .map(([, error], idx) => (
                    <li key={idx}>{error}</li>
                  ))}
              </ul>
            </div>
          )}
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="point-name">Nome *</Label>
              <Input
                id="point-name"
                value={formData.name}
                onChange={e =>
                  setFormData(prev => ({ ...prev, name: e.target.value }))
                }
                placeholder="Frigo principale cucina"
                aria-invalid={Boolean(validationErrors.name)}
              />
              {validationErrors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.name}
                </p>
              )}
            </div>

            <div>
              <Label>Reparto *</Label>
              
              {/* Warning if no departments available */}
              {departmentOptions.length === 0 && (
                <p className="mb-2 text-sm text-amber-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Nessun reparto disponibile. Crea prima un reparto dalla sezione Gestione.
                </p>
              )}
              
              <Select
                value={formData.departmentId || ''}
                onValueChange={value =>
                  setFormData(prev => ({ ...prev, departmentId: value }))
                }
                disabled={departmentOptions.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona un reparto" />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={5} className="z-[10001]">
                  {departmentOptions.length === 0 ? (
                    <div className="p-2 text-sm text-gray-500 text-center">
                      Nessun reparto disponibile
                    </div>
                  ) : (
                    departmentOptions.map(department => (
                      <SelectOption key={department.id} value={department.id}>
                        {department.name}
                      </SelectOption>
                    ))
                  )}
                </SelectContent>
              </Select>
              
              {validationErrors.departmentId && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.departmentId}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* BUG M1 FIX: Campo temperatura sempre disabilitato, mostra range come placeholder */}
            <div>
              <Label htmlFor="point-temperature">
                Range temperatura consigliato
              </Label>
              <Input
                id="point-temperature"
                type="text"
                value={getConservationTempRangeString(formData.pointType) || 'Seleziona tipo'}
                readOnly
                className="bg-gray-100 cursor-not-allowed text-black"
                aria-label={`Range temperatura per ${formData.pointType}: ${getConservationTempRangeString(formData.pointType)}`}
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.pointType === 'ambient'
                  ? 'La temperatura non e\' monitorabile per i punti di tipo Ambiente'
                  : 'Il range indica le temperature consigliate per questo tipo di punto'}
              </p>
            </div>

            <div>
              <Label>Tipologia</Label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(CONSERVATION_POINT_TYPES).map(type => {
                  const isActive = formData.pointType === type.value
                  return (
                    <Button
                      key={type.value}
                      type="button"
                      variant={isActive ? 'default' : 'outline'}
                      className={`justify-start gap-2 transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700'
                      }`}
                      onClick={() =>
                        setFormData(prev => ({
                          ...prev,
                          pointType: type.value,
                          isBlastChiller: type.value === 'blast',
                        }))
                      }
                    >
                      <Thermometer
                        className={`h-4 w-4 ${isActive ? 'text-white' : type.color}`}
                      />
                      <span className="font-medium">{type.label}</span>
                    </Button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Sezione Profilo Punto di Conservazione - Solo per frigoriferi */}
          {formData.pointType === 'fridge' && (
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
                Profilo Punto di Conservazione
              </h3>

              {/* Select Categoria Appliance */}
              <div className="space-y-2">
                <Label htmlFor="appliance-category">Categoria elettrodomestico *</Label>
                <Select
                  value={formData.applianceCategory || ''}
                  onValueChange={(value) => setFormData(prev => ({
                    ...prev,
                    applianceCategory: value as ApplianceCategory,
                    profileId: '' // Reset profilo quando cambia categoria
                  }))}
                >
                  <SelectTrigger id="appliance-category">
                    <SelectValue placeholder="Seleziona categoria..." />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={5} className="z-[10001]">
                    {Object.entries(APPLIANCE_CATEGORY_LABELS).map(([value, label]) => (
                      <SelectOption key={value} value={value}>{label}</SelectOption>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.applianceCategory && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.applianceCategory}
                  </p>
                )}
              </div>

              {/* Select Profilo */}
              {formData.applianceCategory && (
                <div className="space-y-2">
                  <Label htmlFor="profile-select">Profilo HACCP *</Label>
                  <Select
                    value={formData.profileId || ''}
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      profileId: value
                    }))}
                  >
                    <SelectTrigger id="profile-select">
                      <SelectValue placeholder="Seleziona profilo..." />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={5} className="z-[10001]">
                      {getProfilesForAppliance(formData.applianceCategory as ApplianceCategory).map(profile => (
                        <SelectOption key={profile.profileId} value={profile.profileId}>
                          {profile.name}
                        </SelectOption>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.profileId && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.profileId}
                    </p>
                  )}
                </div>
              )}

            </div>
          )}

          {/* Sezione categorie standard - nascosta per frigoriferi e abbattitori */}
          {formData.pointType !== 'fridge' && formData.pointType !== 'blast' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Categorie prodotti</Label>
              </div>
              <p className="mb-3 text-sm text-gray-600">
                Le categorie evidenziate sono state assegnate automaticamente in base alla compatibilità
                con la temperatura del punto di conservazione selezionato.
              </p>
              {/*
                Per i punti di tipo Ambiente mostriamo solo le categorie compatibili,
                per gli altri tipi manteniamo l'elenco completo evidenziando quelle compatibili.
              */}
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 opacity-90 pointer-events-none">
                {(formData.pointType === 'ambient'
                  ? allCategories.filter(cat => compatibleCategories.includes(cat.id))
                  : allCategories
                ).map(category => {
                  const isCompatible = formData.productCategories.includes(category.id)
                  return (
                    <div
                      key={category.id}
                      className={`flex items-center justify-between rounded border p-2 text-sm ${
                        isCompatible
                          ? 'border-green-400 bg-green-50 text-green-900'
                          : 'border-gray-200 bg-gray-50 text-gray-400'
                      }`}
                    >
                      <span>{category.label}</span>
                      {category.range && (
                        <span className="text-xs">
                          {category.range.min}°C - {category.range.max}°C
                        </span>
                      )}
                      {isCompatible && (
                        <ShieldCheck
                          className="h-4 w-4 text-green-600"
                          aria-hidden
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Layout Split: Categorie + Immagine Elettrodomestico - visibile per frigoriferi */}
          {formData.pointType === 'fridge' && (
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
                Configurazione Punto di Conservazione
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Colonna Sinistra: Categorie Profilo */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Categorie prodotti (auto-assegnate)</Label>
                    <span className="text-xs text-blue-600">Dal profilo HACCP</span>
                  </div>
                  <div className="border rounded-lg p-4 bg-gray-50 min-h-[200px] flex items-center justify-center">
                    {selectedProfile ? (
                      <div className="w-full max-h-[350px] overflow-y-auto">
                        <div className="space-y-2">
                          {mapCategoryIdsToDbNames(selectedProfile.allowedCategoryIds).map((categoryName, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 p-2 bg-green-50 rounded border border-green-200"
                            >
                              <ShieldCheck className="h-4 w-4 text-green-600 flex-shrink-0" />
                              <span className="text-sm text-green-900">{categoryName}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-400">
                        <ShieldCheck className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Seleziona un profilo HACCP per visualizzare le categorie auto-assegnate</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Colonna Destra: Immagine Elettrodomestico */}
                <div className="space-y-2">
                  <Label>Immagine Elettrodomestico</Label>
                  {formData.applianceCategory && hasApplianceImageAvailable(
                    formData.applianceCategory as ApplianceCategory,
                    formData.profileId || null
                  ) && !imageError ? (
                    <div
                      className="border rounded-lg p-4 bg-gray-50 cursor-pointer hover:bg-gray-100
                                 transition-colors group relative min-h-[200px] flex items-center justify-center"
                      onClick={() => setIsImageModalOpen(true)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          setIsImageModalOpen(true)
                        }
                      }}
                      aria-label="Clicca per ingrandire l'immagine dell'elettrodomestico"
                    >
                      <OptimizedImage
                        src={getApplianceImagePathWithProfile(
                          formData.applianceCategory as ApplianceCategory,
                          formData.profileId || null
                        )!}
                        alt={APPLIANCE_CATEGORY_LABELS[formData.applianceCategory as ApplianceCategory]}
                        className="max-w-full max-h-[280px] object-contain"
                        onError={() => setImageError(true)}
                      />
                      {/* Overlay hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10
                                     transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity
                                        text-white text-sm font-medium bg-black/50 px-3 py-1 rounded">
                          Clicca per ingrandire
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="border rounded-lg p-4 bg-gray-50 min-h-[200px]
                                   flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <Thermometer className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">
                          {formData.applianceCategory 
                            ? "Immagine non disponibile"
                            : "Seleziona una categoria elettrodomestico per visualizzare l'immagine"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Info Box Note HACCP */}
              {selectedProfile && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                  <h4 className="font-medium text-blue-800 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Note HACCP
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    {selectedProfile.haccpNotes.map((note, i) => (
                      <li key={i}>• {note}</li>
                    ))}
                  </ul>
                  <p className="text-sm text-blue-600 mt-2">
                    Temperatura consigliata: <strong>{selectedProfile.recommendedSetPointsC.fridge}°C</strong>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Sezione Manutenzioni - Nascosta in onboarding */}
          {showMaintenances && (
            <div className="border-t pt-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Manutenzioni Obbligatorie
                </h3>
                <p className="text-sm text-gray-600">
                  {formData.pointType === 'blast'
                    ? 'Configura la manutenzione obbligatoria Sanificazione per l\'abbattitore (HACCP compliance).'
                    : formData.pointType === 'ambient'
                      ? 'Configura le 2 manutenzioni obbligatorie per questo punto di conservazione (HACCP compliance).'
                      : 'Configura le 4 manutenzioni obbligatorie per questo punto di conservazione (HACCP compliance).'}
                </p>
              </div>

              {validationErrors.maintenanceTasks && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {validationErrors.maintenanceTasks}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                {maintenanceTasks.map((task, index) => (
                  <MaintenanceTaskForm
                    key={task.manutenzione}
                    task={task}
                    index={index}
                    staff={staff}
                    staffCategories={STAFF_CATEGORIES.map(cat => cat.value)}
                    onUpdate={updateMaintenanceTask}
                    hasError={!!maintenanceErrors[index]}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-6 border-t sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Salvando...' : point ? 'Aggiorna' : 'Crea'}
            </button>
          </div>

          {/* Modal Lightbox Immagine */}
          <Modal
            isOpen={isImageModalOpen}
            onClose={() => setIsImageModalOpen(false)}
            title={APPLIANCE_CATEGORY_LABELS[formData.applianceCategory as ApplianceCategory] || 'Elettrodomestico'}
            size="xl"
          >
            <div className="flex items-center justify-center p-4 min-h-[400px]">
              {/* IMPORTANTE: Usare <img> standard, NON OptimizedImage */}
              {/* OptimizedImage ha objectFit: 'cover' hardcoded che non può essere sovrascritto */}
              <img
                src={getApplianceImagePathWithProfile(
                  formData.applianceCategory as ApplianceCategory,
                  formData.profileId || null
                )!}
                alt={`${APPLIANCE_CATEGORY_LABELS[formData.applianceCategory as ApplianceCategory]} - Vista ingrandita`}
                className="max-w-full max-h-[80vh] object-contain"
              />
            </div>
          </Modal>
        </form>
      </div>
    </div>
  )
}
