import React, { useState, useEffect, useMemo } from 'react'
import {
  ConservationPoint,
  ConservationPointType,
} from '@/types/conservation'
import { X, Thermometer, ShieldCheck, AlertCircle } from 'lucide-react'
import { useDepartments } from '@/features/management/hooks/useDepartments'
import { useStaff } from '@/features/management/hooks/useStaff'
import { useCategories } from '@/features/inventory/hooks/useCategories'
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
  validateTemperatureForType,
} from '@/utils/onboarding/conservationUtils'
import { STAFF_ROLES, STAFF_CATEGORIES } from '@/utils/haccpRules'
import { calculateNextDue, useMaintenanceTasks } from '@/features/conservation/hooks/useMaintenanceTasks'
import type { MaintenanceFrequency as EnglishMaintenanceFrequency, MaintenanceTask as DBMaintenanceTask } from '@/types/conservation'
import { cn } from '@/lib/utils'

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

type CustomFrequencyDays =
  | 'lunedi'
  | 'martedi'
  | 'mercoledi'
  | 'giovedi'
  | 'venerdi'
  | 'sabato'
  | 'domenica'

type Weekday = 'lunedi' | 'martedi' | 'mercoledi' | 'giovedi' | 'venerdi' | 'sabato' | 'domenica'

interface MandatoryMaintenanceTask {
  manutenzione: StandardMaintenanceType
  frequenza: MaintenanceFrequency
  assegnatoARuolo: StaffRole
  assegnatoACategoria?: string
  assegnatoADipendenteSpecifico?: string
  giorniCustom?: CustomFrequencyDays[]
  giorniSettimana?: Weekday[] // Nuovo campo per configurazione giorni (giornaliera/settimanale)
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
  'controllo_scadenze': 'temperature', // Fallback a temperature per controllo scadenze
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
  const updateTask = (field: keyof MandatoryMaintenanceTask, value: any) => {
    onUpdate(index, { ...task, [field]: value })
  }

  const info = MAINTENANCE_TYPES[task.manutenzione]
  // const showCategoryField = task.assegnatoARuolo === 'dipendente'
  // const showSpecificStaffField = task.assegnatoARuolo === 'specifico'
  const showWeekdaysField = task.frequenza === 'giornaliera' || task.frequenza === 'settimanale'

  // Imposta default giorni settimana quando cambia frequenza
  useEffect(() => {
    if (task.frequenza === 'giornaliera' && (!task.giorniSettimana || task.giorniSettimana.length === 0)) {
      // Default: tutte selezionate
      updateTask('giorniSettimana', ALL_WEEKDAYS)
    } else if (task.frequenza === 'settimanale' && (!task.giorniSettimana || task.giorniSettimana.length === 0)) {
      // Default: solo lunedì
      updateTask('giorniSettimana', ['lunedi'])
    } else if (task.frequenza !== 'giornaliera' && task.frequenza !== 'settimanale' && task.giorniSettimana) {
      // Reset quando cambia a frequenza diversa
      updateTask('giorniSettimana', undefined)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.frequenza])

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
            value={task.frequenza}
            onChange={e =>
              updateTask('frequenza', e.target.value as MaintenanceFrequency)
            }
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
              updateTask('assegnatoARuolo', value as StaffRole)
              updateTask('assegnatoACategoria', undefined)
              updateTask('assegnatoADipendenteSpecifico', undefined)
            }}
          >
            <SelectTrigger id={`role-select-${index}`} className="w-full">
              <SelectValue placeholder="Seleziona ruolo..." />
            </SelectTrigger>
            <SelectContent>
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
              updateTask('assegnatoACategoria', value)
              updateTask('assegnatoADipendenteSpecifico', undefined)
            }}
          >
            <SelectTrigger id={`category-select-${index}`} className="w-full">
              <SelectValue placeholder="Seleziona categoria..." />
            </SelectTrigger>
            <SelectContent>
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
            <SelectContent>
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

      {showWeekdaysField && (
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            Giorni settimana *
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
            {WEEKDAYS_ARRAY.map(weekday => (
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
                  className="rounded border-gray-300"
                  aria-label={weekday.label}
                />
                <span className="text-sm">{weekday.label}</span>
              </label>
            ))}
          </div>
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
}: AddPointModalProps) {
  const { departments } = useDepartments()
  const { staff } = useStaff()
  const { categories: productCategories } = useCategories()
  
  // Carica manutenzioni esistenti quando point è presente (modalità edit)
  const { maintenanceTasks: existingMaintenances } = useMaintenanceTasks(point?.id)

  const [formData, setFormData] = useState({
    name: '',
    departmentId: '',
    targetTemperature: '',
    pointType: 'fridge' as ConservationPointType,
    isBlastChiller: false,
    productCategories: [] as string[],
  })

  const [isManuallyEdited, setIsManuallyEdited] = useState(false)

  // Genera manutenzioni obbligatorie basate sul tipo di punto
  const getRequiredMaintenanceTasks = (pointType: ConservationPointType): MandatoryMaintenanceTask[] => {
    if (pointType === 'ambient') {
      // Per punti di tipo "ambiente", solo sanificazione e controllo scadenze
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
    } else {
      // Per altri tipi (refrigerated, frozen), tutte le manutenzioni
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

  // Aggiorna temperatura target automaticamente quando cambia il tipo di punto
  // Solo se l'utente non ha modificato manualmente la temperatura
  useEffect(() => {
    if (isManuallyEdited) return // Non sovrascrivere se modificata manualmente
    
    if (formData.pointType === 'ambient') {
      // Per ambiente, temperatura non impostabile
      setFormData(prev => ({ ...prev, targetTemperature: '' }))
    } else {
      // Calcola temperatura ottimale: (min + max) / 2
      const typeInfo = CONSERVATION_POINT_TYPES[formData.pointType]
      if (typeInfo.temperatureRange.min !== null && typeInfo.temperatureRange.max !== null) {
        const optimal = ((typeInfo.temperatureRange.min + typeInfo.temperatureRange.max) / 2).toFixed(1)
        setFormData(prev => ({ ...prev, targetTemperature: optimal }))
      }
    }
  }, [formData.pointType, isManuallyEdited])

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({})
  const [maintenanceErrors, setMaintenanceErrors] = useState<Record<number, string[]>>({})
  const [temperatureError, setTemperatureError] = useState<string | null>(null)

  const departmentOptions = useMemo(
    () => departments.filter(department => department.is_active !== false),
    [departments]
  )

  const typeInfo = useMemo(
    () => CONSERVATION_POINT_TYPES[formData.pointType],
    [formData.pointType]
  )

  const compatibleCategories = useMemo(() => {
    if (!productCategories || productCategories.length === 0) return []

    const temperature = formData.targetTemperature
      ? Number(formData.targetTemperature)
      : null

    return productCategories
      .filter(cat => {
        if (!cat.temperature_requirements) return true

        const tempReq = cat.temperature_requirements
        if (!temperature) return true

        return temperature >= tempReq.min_temp && temperature <= tempReq.max_temp
      })
      .map(cat => ({
        id: cat.name,
        label: cat.name,
        range: cat.temperature_requirements ? {
          min: cat.temperature_requirements.min_temp,
          max: cat.temperature_requirements.max_temp
        } : null
      }))
  }, [formData.targetTemperature, formData.pointType, productCategories])

  useEffect(() => {
    if (formData.targetTemperature && formData.pointType !== 'ambient') {
      const temperature = Number(formData.targetTemperature)
      if (!isNaN(temperature)) {
        const validation = validateTemperatureForType(
          temperature,
          formData.pointType
        )
        setTemperatureError(validation.valid ? null : validation.message || null)
      } else {
        setTemperatureError(null)
      }
    } else {
      setTemperatureError(null)
    }
  }, [formData.targetTemperature, formData.pointType])

  useEffect(() => {
    if (point) {
      setFormData({
        name: point.name,
        departmentId: point.department_id || '',
        targetTemperature: point.setpoint_temp.toString(),
        pointType: point.type,
        isBlastChiller: point.is_blast_chiller,
        productCategories: point.product_categories || [],
      })
      setIsManuallyEdited(true) // Quando si modifica un punto esistente, considera la temperatura come già modificata
      // Manutenzioni caricate da useMaintenanceTasks (vedi useEffect sotto)
    } else {
      setFormData({
        name: '',
        departmentId: '',
        targetTemperature: '',
        pointType: 'fridge',
        isBlastChiller: false,
        productCategories: [],
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
      setIsManuallyEdited(false) // Reset quando si crea un nuovo punto
    }
    setValidationErrors({})
    setMaintenanceErrors({})
    setTemperatureError(null)
  }, [point, isOpen])

  // Carica e trasforma manutenzioni esistenti quando point è presente (modalità edit)
  useEffect(() => {
    if (point && existingMaintenances && existingMaintenances.length > 0) {
      // Trasforma manutenzioni esistenti nel formato MandatoryMaintenanceTask
      const transformed = existingMaintenances
        .filter(task => Object.keys(REVERSE_MAINTENANCE_TYPE_MAPPING).includes(task.type))
        .map(task => transformMaintenanceTaskToForm(task))
      
      // Se ci sono manutenzioni trasformate, usale, altrimenti usa quelle obbligatorie
      if (transformed.length > 0) {
        setMaintenanceTasks(transformed)
      }
    }
  }, [point, existingMaintenances])

  // Reset del flag quando si chiude il modal
  useEffect(() => {
    if (!isOpen) {
      setIsManuallyEdited(false)
    }
  }, [isOpen])

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) {
      errors.name = 'Il nome è obbligatorio'
    }
    if (!formData.departmentId) {
      errors.departmentId = 'Seleziona un reparto'
    }
    if (
      formData.pointType !== 'ambient' &&
      (!formData.targetTemperature || isNaN(Number(formData.targetTemperature)))
    ) {
      errors.targetTemperature = 'Inserisci una temperatura valida'
    }
    if (formData.productCategories.length === 0) {
      errors.productCategories = 'Seleziona almeno una categoria'
    }

    if (temperatureError) {
      errors.targetTemperature = temperatureError
    }

    // Validazione manutenzioni con errori specifici
    const maintenanceErrorsMap: Record<number, string[]> = {}
    maintenanceTasks.forEach((task, index) => {
      const taskErrors: string[] = []
      const taskName = MAINTENANCE_TYPES[task.manutenzione]?.label || `Manutenzione ${index + 1}`

      if (!task.frequenza) {
        taskErrors.push('seleziona frequenza')
      }
      if (!task.assegnatoARuolo) {
        taskErrors.push('seleziona ruolo')
      }
      if (task.frequenza === 'mensile' && !task.giornoMese) {
        taskErrors.push('seleziona giorno del mese')
      }
      if (task.frequenza === 'annuale' && !task.giornoAnno) {
        taskErrors.push('seleziona giorno dell\'anno')
      }
      if ((task.frequenza === 'giornaliera' || task.frequenza === 'settimanale') && 
          (!task.giorniSettimana || task.giorniSettimana.length === 0)) {
        taskErrors.push('seleziona almeno un giorno settimana')
      }

      if (taskErrors.length > 0) {
        maintenanceErrorsMap[index] = taskErrors
        errors[`maintenance_${index}`] = `${taskName}: ${taskErrors.join(', ')}`
      }
    })

    if (Object.keys(maintenanceErrorsMap).length > 0) {
      errors.maintenanceTasks = 'Completa tutte le manutenzioni obbligatorie'
    }

    setValidationErrors(errors)
    setMaintenanceErrors(maintenanceErrorsMap)
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

    const temp =
      formData.pointType === 'ambient'
        ? 20
        : Number(formData.targetTemperature)

    // Trasforma i maintenanceTasks nel formato atteso da useConservationPoints
    const transformedMaintenanceTasks = transformMaintenanceTasks(maintenanceTasks)

    onSave(
      {
        name: formData.name,
        department_id: formData.departmentId,
        setpoint_temp: temp,
        type: formData.pointType,
        is_blast_chiller: formData.isBlastChiller,
        product_categories: formData.productCategories,
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
                <SelectContent>
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
            <div>
              <Label htmlFor="point-temperature">
                Temperatura target {formData.pointType === 'ambient' ? '' : '*'}
              </Label>
              <Input
                id="point-temperature"
                type="number"
                step="0.1"
                min="-99"
                max="30"
                value={formData.targetTemperature}
                onChange={e => {
                  setIsManuallyEdited(true)
                  setFormData(prev => ({
                    ...prev,
                    targetTemperature: e.target.value,
                  }))
                }}
                placeholder={
                  formData.pointType === 'ambient'
                    ? 'Non impostabile'
                    : String(typeInfo.temperatureRange.min)
                }
                disabled={formData.pointType === 'ambient'}
                className={
                  formData.pointType === 'ambient'
                    ? 'bg-gray-100 cursor-not-allowed'
                    : ''
                }
                aria-invalid={Boolean(
                  validationErrors.targetTemperature || temperatureError
                )}
              />
              {formData.pointType !== 'ambient' ? (
                <p className="mt-1 text-xs text-gray-500">
                  Range consigliato {typeInfo.temperatureRange.min}°C -{' '}
                  {typeInfo.temperatureRange.max}°C
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  La temperatura non è impostabile per i punti di tipo Ambiente
                </p>
              )}
              {validationErrors.targetTemperature && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.targetTemperature}
                </p>
              )}
              {temperatureError && (
                <p className="mt-1 text-sm text-red-600">{temperatureError}</p>
              )}
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

          <div>
            <Label>Categorie prodotti *</Label>
            <p className="mb-3 text-sm text-gray-600">
              Seleziona le categorie di prodotti che verranno conservate in questo
              punto di conservazione. Solo le categorie compatibili con la
              temperatura impostata sono disponibili.
            </p>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {compatibleCategories.map(category => {
                const isSelected = formData.productCategories.includes(
                  category.id
                )
                return (
                  <button
                    key={category.id}
                    type="button"
                    className={`flex items-center justify-between rounded border p-2 text-sm transition-colors ${
                      isSelected
                        ? 'border-blue-400 bg-blue-50 text-blue-900'
                        : 'border-gray-200 bg-white hover:border-blue-200'
                    }`}
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        productCategories: isSelected
                          ? prev.productCategories.filter(id => id !== category.id)
                          : [...prev.productCategories, category.id],
                      }))
                    }}
                  >
                    <span>{category.label}</span>
                    {category.range && (
                      <span className="text-xs text-gray-500">
                        {category.range.min}°C - {category.range.max}°C
                      </span>
                    )}
                    {isSelected && (
                      <ShieldCheck
                        className="h-4 w-4 text-blue-600"
                        aria-hidden
                      />
                    )}
                  </button>
                )
              })}
            </div>
            {compatibleCategories.length === 0 && formData.targetTemperature && (
              <p className="mt-1 text-sm text-amber-600">
                Nessuna categoria compatibile con la temperatura{' '}
                {formData.targetTemperature}°C
              </p>
            )}
            {validationErrors.productCategories && (
              <p className="mt-1 text-sm text-red-600">
                {validationErrors.productCategories}
              </p>
            )}
          </div>

          <div className="border-t pt-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Manutenzioni Obbligatorie
              </h3>
              <p className="text-sm text-gray-600">
                Configura le 4 manutenzioni obbligatorie per questo punto di
                conservazione (HACCP compliance)
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
        </form>
      </div>
    </div>
  )
}
