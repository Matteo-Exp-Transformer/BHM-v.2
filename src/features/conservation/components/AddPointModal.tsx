import React, { useState, useEffect } from 'react'
import {
  ConservationPoint,
  ConservationPointType,
  TEMPERATURE_RANGES,
  MaintenanceType,
  MaintenanceFrequency,
  MAINTENANCE_TASK_TYPES,
} from '@/types/conservation'
import { X, Thermometer, Info, Wrench, Plus, Trash2 } from 'lucide-react'
import { useDepartments } from '@/features/management/hooks/useDepartments'
import { useStaff } from '@/features/management/hooks/useStaff'

interface MaintenanceTaskData {
  id?: string
  title: string
  type: MaintenanceType
  frequency: MaintenanceFrequency
  estimated_duration: number
  assigned_to?: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  next_due: Date
  instructions?: string[]
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
    maintenanceTasks: MaintenanceTaskData[]
  ) => void
  point?: ConservationPoint | null
  isLoading?: boolean
}

const PRODUCT_CATEGORIES = [
  'Carni fresche',
  'Carni trasformate',
  'Pesce fresco',
  'Pesce trasformato',
  'Latticini',
  'Uova',
  'Verdure fresche',
  'Verdure trasformate',
  'Frutta fresca',
  'Frutta trasformata',
  'Prodotti da forno',
  'Bevande',
  'Condimenti',
  'Conserve',
  'Surgelati',
  'Gelati',
  'Prodotti secchi',
  'Altri',
]

interface MaintenanceTaskFormProps {
  task: MaintenanceTaskData
  index: number
  staff: any[]
  onUpdate: (index: number, task: MaintenanceTaskData) => void
  onRemove: (index: number) => void
}

function MaintenanceTaskForm({
  task,
  index,
  staff,
  onUpdate,
  onRemove,
}: MaintenanceTaskFormProps) {
  const [expanded, setExpanded] = useState(true)

  const updateTask = (field: keyof MaintenanceTaskData, value: any) => {
    onUpdate(index, { ...task, [field]: value })
  }

  const getTaskTypeInfo = () => {
    return (
      MAINTENANCE_TASK_TYPES[task.type] || {
        label: 'Altro',
        icon: 'tool',
        color: 'gray',
        defaultDuration: 60,
        defaultChecklist: [],
      }
    )
  }

  const typeInfo = getTaskTypeInfo()

  return (
    <div className="border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between p-4 bg-gray-50">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-gray-400 hover:text-gray-600"
          >
            {expanded ? '▼' : '▶'}
          </button>
          <div>
            <h4 className="font-medium text-gray-900">{task.title}</h4>
            <p className="text-sm text-gray-500">
              {typeInfo.label} • {task.frequency} • {task.estimated_duration}min
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="text-red-500 hover:text-red-700"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {expanded && (
        <div className="p-4 space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titolo *
              </label>
              <input
                type="text"
                value={task.title}
                onChange={e => updateTask('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nome della manutenzione"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo *
              </label>
              <select
                value={task.type}
                onChange={e =>
                  updateTask('type', e.target.value as MaintenanceType)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(MAINTENANCE_TASK_TYPES).map(([key, info]) => (
                  <option key={key} value={key}>
                    {info.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Frequency and Timing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frequenza *
              </label>
              <select
                value={task.frequency}
                onChange={e =>
                  updateTask(
                    'frequency',
                    e.target.value as MaintenanceFrequency
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">Giornaliera</option>
                <option value="weekly">Settimanale</option>
                <option value="monthly">Mensile</option>
                <option value="quarterly">Trimestrale</option>
                <option value="annually">Annuale</option>
                <option value="custom">Personalizzata</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Durata (min) *
              </label>
              <input
                type="number"
                min="5"
                step="5"
                value={task.estimated_duration}
                onChange={e =>
                  updateTask(
                    'estimated_duration',
                    parseInt(e.target.value) || 30
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priorità *
              </label>
              <select
                value={task.priority}
                onChange={e =>
                  updateTask(
                    'priority',
                    e.target.value as 'low' | 'medium' | 'high' | 'critical'
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Bassa</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="critical">Critica</option>
              </select>
            </div>
          </div>

          {/* Assignment and Due Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assegnato a
              </label>
              <select
                value={task.assigned_to || ''}
                onChange={e =>
                  updateTask('assigned_to', e.target.value || undefined)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Assegnazione automatica</option>
                {staff.map(person => (
                  <option key={person.id} value={person.id}>
                    {person.name} ({person.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prima scadenza *
              </label>
              <input
                type="datetime-local"
                value={task.next_due.toISOString().slice(0, 16)}
                onChange={e => updateTask('next_due', new Date(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                updateTask('instructions', typeInfo.defaultChecklist)
              }
              className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Carica checklist standard
            </button>
          </div>
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
  const [formData, setFormData] = useState({
    name: '',
    department_id: '',
    setpoint_temp: 4,
    is_blast_chiller: false,
    product_categories: [] as string[],
    maintenance_due: '',
  })

  const [maintenanceTasks, setMaintenanceTasks] = useState<
    MaintenanceTaskData[]
  >([])

  const [predictedType, setPredictedType] =
    useState<ConservationPointType>('fridge')
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)

  useEffect(() => {
    if (point) {
      setFormData({
        name: point.name,
        department_id: point.department_id || '',
        setpoint_temp: point.setpoint_temp,
        is_blast_chiller: point.is_blast_chiller,
        product_categories: point.product_categories || [],
        maintenance_due: point.maintenance_due
          ? new Date(point.maintenance_due).toISOString().split('T')[0]
          : '',
      })
      setMaintenanceTasks(
        point.maintenance_tasks?.map(task => ({
          id: task.id,
          title: task.title,
          type: task.type,
          frequency: task.frequency,
          estimated_duration: task.estimated_duration,
          assigned_to: task.assigned_to,
          priority: task.priority,
          next_due: new Date(task.next_due),
          instructions: task.checklist,
        })) || []
      )
    } else {
      setFormData({
        name: '',
        department_id: '',
        setpoint_temp: 4,
        is_blast_chiller: false,
        product_categories: [],
        maintenance_due: '',
      })
      setMaintenanceTasks([])
    }
  }, [point, isOpen])

  useEffect(() => {
    const temp = formData.setpoint_temp
    const isBlast = formData.is_blast_chiller
    let type: ConservationPointType = 'fridge' // default

    if (isBlast) {
      type = 'blast'
    } else {
      if (temp >= 15 && temp <= 25) {
        type = 'ambient'
      } else if (temp >= 0 && temp <= 8) {
        type = 'fridge'
      } else if (temp >= -25 && temp <= -15) {
        type = 'freezer'
      }
    }
    setPredictedType(type)
  }, [formData.setpoint_temp, formData.is_blast_chiller])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    onSave(
      {
        name: formData.name,
        department_id: formData.department_id,
        setpoint_temp: formData.setpoint_temp,
        type: predictedType,
        is_blast_chiller: formData.is_blast_chiller,
        product_categories: formData.product_categories,
        maintenance_due: formData.maintenance_due
          ? new Date(formData.maintenance_due)
          : undefined,
      },
      maintenanceTasks
    )
  }

  const addMaintenanceTask = () => {
    const newTask: MaintenanceTaskData = {
      title: 'Nuova Manutenzione',
      type: 'general_inspection',
      frequency: 'weekly',
      estimated_duration: 30,
      priority: 'medium',
      next_due: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      instructions: [],
    }
    setMaintenanceTasks([...maintenanceTasks, newTask])
  }

  const updateMaintenanceTask = (
    index: number,
    updatedTask: MaintenanceTaskData
  ) => {
    const updated = [...maintenanceTasks]
    updated[index] = updatedTask
    setMaintenanceTasks(updated)
  }

  const removeMaintenanceTask = (index: number) => {
    setMaintenanceTasks(maintenanceTasks.filter((_, i) => i !== index))
  }

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      product_categories: prev.product_categories.includes(category)
        ? prev.product_categories.filter(c => c !== category)
        : [...prev.product_categories, category],
    }))
  }

  const getTypeInfo = () => {
    const range = TEMPERATURE_RANGES[predictedType] || TEMPERATURE_RANGES.fridge
    const typeNames = {
      ambient: 'Ambiente',
      fridge: 'Frigorifero',
      freezer: 'Freezer',
      blast: 'Abbattitore',
    }

    return {
      name: typeNames[predictedType] || 'Frigorifero',
      range: `${range.min}°C - ${range.max}°C`,
      optimal: `${range.optimal}°C`,
      icon:
        predictedType === 'ambient'
          ? '🌡️'
          : predictedType === 'fridge'
            ? '❄️'
            : predictedType === 'freezer'
              ? '🧊'
              : '⚡',
    }
  }

  if (!isOpen) return null

  const typeInfo = getTypeInfo()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
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
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome punto di conservazione *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e =>
                  setFormData(prev => ({ ...prev, name: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="es. Frigorifero Cucina 1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reparto *
              </label>
              <select
                required
                value={formData.department_id}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    department_id: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleziona reparto</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Temperature Configuration */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperatura target (°C) *
              </label>
              <div className="flex items-center space-x-2">
                <Thermometer className="w-5 h-5 text-blue-600" />
                <input
                  type="number"
                  required
                  step="0.1"
                  min="-99"
                  max="30"
                  value={formData.setpoint_temp}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      setpoint_temp: parseFloat(e.target.value),
                    }))
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_blast_chiller"
                checked={formData.is_blast_chiller}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    is_blast_chiller: e.target.checked,
                  }))
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="is_blast_chiller"
                className="text-sm font-medium text-gray-700"
              >
                Abbattitore di temperatura
              </label>
            </div>

            {/* Auto-classification Preview */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Info className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">
                  Classificazione automatica
                </span>
              </div>
              <div className="text-sm text-blue-800">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{typeInfo.icon}</span>
                  <span>
                    <strong>{typeInfo.name}</strong> - Range: {typeInfo.range} -
                    Ottimale: {typeInfo.optimal}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Categories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categorie prodotti conservati
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {formData.product_categories.length === 0
                  ? 'Seleziona categorie prodotti...'
                  : `${formData.product_categories.length} categorie selezionate`}
              </button>

              {showCategoryDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {PRODUCT_CATEGORIES.map(category => (
                    <label
                      key={category}
                      className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.product_categories.includes(category)}
                        onChange={() => handleCategoryToggle(category)}
                        className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">{category}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {formData.product_categories.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {formData.product_categories.map(category => (
                  <span
                    key={category}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {category}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Maintenance Tasks */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Manutenzioni Programmate
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Configura le manutenzioni per questo punto di conservazione
                </p>
              </div>
              <button
                type="button"
                onClick={addMaintenanceTask}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
                Aggiungi
              </button>
            </div>

            {maintenanceTasks.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <Wrench className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  Nessuna manutenzione configurata
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Aggiungi manutenzioni per automatizzare il controllo
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {maintenanceTasks.map((task, index) => (
                  <MaintenanceTaskForm
                    key={index}
                    task={task}
                    index={index}
                    staff={staff}
                    onUpdate={updateMaintenanceTask}
                    onRemove={removeMaintenanceTask}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t">
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
