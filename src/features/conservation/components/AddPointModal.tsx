import React, { useState, useEffect, useMemo } from 'react'
import {
  ConservationPoint,
  ConservationPointType,
} from '@/types/conservation'
import { X, Thermometer, ShieldCheck, AlertCircle } from 'lucide-react'
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
import {
  CONSERVATION_POINT_TYPES,
  CONSERVATION_CATEGORIES,
  getCompatibleCategories,
  validateTemperatureForType,
} from '@/utils/onboarding/conservationUtils'
import { STAFF_ROLES, STAFF_CATEGORIES } from '@/utils/haccpRules'

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
  | 'custom'

type StaffRole = 'admin' | 'responsabile' | 'dipendente' | 'collaboratore'

type CustomFrequencyDays =
  | 'lunedi'
  | 'martedi'
  | 'mercoledi'
  | 'giovedi'
  | 'venerdi'
  | 'sabato'
  | 'domenica'

interface MandatoryMaintenanceTask {
  manutenzione: StandardMaintenanceType
  frequenza: MaintenanceFrequency
  assegnatoARuolo: StaffRole
  assegnatoACategoria?: string
  assegnatoADipendenteSpecifico?: string
  giorniCustom?: CustomFrequencyDays[]
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
    maintenanceTasks: MandatoryMaintenanceTask[]
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

const WEEKDAYS: Record<CustomFrequencyDays, string> = {
  lunedi: 'Lunedì',
  martedi: 'Martedì',
  mercoledi: 'Mercoledì',
  giovedi: 'Giovedì',
  venerdi: 'Venerdì',
  sabato: 'Sabato',
  domenica: 'Domenica',
}


function MaintenanceTaskForm({
  task,
  index,
  staff,
  staffCategories,
  onUpdate,
}: {
  task: MandatoryMaintenanceTask
  index: number
  staff: any[]
  staffCategories: string[]
  onUpdate: (index: number, task: MandatoryMaintenanceTask) => void
}) {
  const updateTask = (field: keyof MandatoryMaintenanceTask, value: any) => {
    onUpdate(index, { ...task, [field]: value })
  }

  const toggleWeekday = (day: CustomFrequencyDays) => {
    const current = task.giorniCustom || []
    const updated = current.includes(day)
      ? current.filter(d => d !== day)
      : [...current, day]
    updateTask('giorniCustom', updated)
  }

  const info = MAINTENANCE_TYPES[task.manutenzione]
  const showCategoryField = task.assegnatoARuolo === 'dipendente'
  const showSpecificStaffField = task.assegnatoARuolo === 'specifico'
  const showCustomDaysField = task.frequenza === 'custom'

  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-white space-y-4">
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
            <option value="annuale">Annuale</option>
            <option value="custom">Personalizzata</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assegnato a Ruolo *
          </label>
          <select
            value={task.assegnatoARuolo}
            onChange={e => {
              updateTask('assegnatoARuolo', e.target.value as StaffRole)
              updateTask('assegnatoACategoria', undefined)
              updateTask('assegnatoADipendenteSpecifico', undefined)
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Seleziona ruolo...</option>
            {STAFF_ROLES.map(role => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {task.assegnatoARuolo && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoria Staff
          </label>
          <select
            value={task.assegnatoACategoria || 'all'}
            onChange={e => {
              updateTask('assegnatoACategoria', e.target.value)
              updateTask('assegnatoADipendenteSpecifico', undefined)
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tutte le categorie</option>
            {STAFF_CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {task.assegnatoARuolo && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dipendente Specifico (opzionale)
          </label>
          <select
            value={task.assegnatoADipendenteSpecifico || 'none'}
            onChange={e =>
              updateTask(
                'assegnatoADipendenteSpecifico',
                e.target.value === 'none' ? undefined : e.target.value
              )
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="none">Nessun dipendente specifico</option>
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
                <option key={person.id} value={person.id}>
                  {person.name} - {person.categories?.join(', ') || 'Nessuna categoria'}
                </option>
              ))}
          </select>
        </div>
      )}

      {showCustomDaysField && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Giorni Personalizzati *
          </label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(WEEKDAYS).map(([value, label]) => {
              const isSelected = task.giorniCustom?.includes(
                value as CustomFrequencyDays
              )
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleWeekday(value as CustomFrequencyDays)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
          {showCustomDaysField &&
            (!task.giorniCustom || task.giorniCustom.length === 0) && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                Seleziona almeno un giorno
              </p>
            )}
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

  const [formData, setFormData] = useState({
    name: '',
    departmentId: '',
    targetTemperature: '',
    pointType: 'fridge' as ConservationPointType,
    isBlastChiller: false,
    productCategories: [] as string[],
  })

  const [maintenanceTasks, setMaintenanceTasks] = useState<
    MandatoryMaintenanceTask[]
  >([
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

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({})
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
    const temperature = formData.targetTemperature
      ? Number(formData.targetTemperature)
      : null
    return getCompatibleCategories(temperature, formData.pointType)
  }, [formData.targetTemperature, formData.pointType])

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
    }
    setValidationErrors({})
    setTemperatureError(null)
  }, [point, isOpen])

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

    for (const task of maintenanceTasks) {
      if (!task.frequenza) {
        errors.maintenanceTasks = 'Completa tutte le manutenzioni obbligatorie'
        break
      }
      if (!task.assegnatoARuolo) {
        errors.maintenanceTasks = 'Completa tutte le manutenzioni obbligatorie'
        break
      }
      if (
        task.frequenza === 'custom' &&
        (!task.giorniCustom || task.giorniCustom.length === 0)
      ) {
        errors.maintenanceTasks =
          'Seleziona almeno un giorno per le frequenze personalizzate'
        break
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
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

    onSave(
      {
        name: formData.name,
        department_id: formData.departmentId,
        setpoint_temp: temp,
        type: formData.pointType,
        is_blast_chiller: formData.isBlastChiller,
        product_categories: formData.productCategories,
      },
      maintenanceTasks
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[95vh] overflow-y-auto my-8">
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
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    targetTemperature: e.target.value,
                  }))
                }
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
                  staffCategories={STAFF_CATEGORIES}
                  onUpdate={updateMaintenanceTask}
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
