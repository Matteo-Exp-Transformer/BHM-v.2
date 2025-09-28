import { useState, useEffect } from 'react'
import {
  CheckSquare,
  Plus,
  Trash2,
  Edit2,
  Clock,
  AlertTriangle,
} from 'lucide-react'

interface Department {
  id: string
  name: string
  description: string
  is_active: boolean
}

interface ConservationPoint {
  id: string
  name: string
  department_id: string
  setpoint_temp: number
  type: 'ambient' | 'fridge' | 'freezer' | 'blast'
  product_categories: string[]
  is_blast_chiller: boolean
}

interface Task {
  id: string
  name: string
  description: string
  frequency:
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'quarterly'
    | 'annually'
    | 'custom'
  department_id?: string
  conservation_point_id?: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  estimated_duration: number
  checklist: string[]
  required_tools: string[]
  haccp_category:
    | 'temperature'
    | 'hygiene'
    | 'maintenance'
    | 'documentation'
    | 'training'
    | 'other'
}

interface TasksStepProps {
  data?: Task[]
  departments: Department[]
  conservationPoints: ConservationPoint[]
  onUpdate: (data: Task[]) => void
  onValidChange: (isValid: boolean) => void
}

const HACCP_CATEGORIES = [
  { value: 'temperature', label: 'Controllo Temperature', icon: '🌡️' },
  { value: 'hygiene', label: 'Igiene e Sanificazione', icon: '🧽' },
  { value: 'maintenance', label: 'Manutenzione Attrezzature', icon: '🔧' },
  { value: 'documentation', label: 'Documentazione HACCP', icon: '📋' },
  { value: 'training', label: 'Formazione Personale', icon: '🎓' },
  { value: 'other', label: 'Altre Attività', icon: '📝' },
]

const TASK_FREQUENCIES = [
  { value: 'daily', label: 'Giornaliera' },
  { value: 'weekly', label: 'Settimanale' },
  { value: 'monthly', label: 'Mensile' },
  { value: 'quarterly', label: 'Trimestrale' },
  { value: 'annually', label: 'Annuale' },
  { value: 'custom', label: 'Personalizzata' },
]

const TasksStep = ({
  data,
  departments,
  conservationPoints,
  onUpdate,
  onValidChange,
}: TasksStepProps) => {
  const [tasks, setTasks] = useState<Task[]>(data || [])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    frequency: 'weekly' as const,
    department_id: '',
    conservation_point_id: '',
    priority: 'medium' as const,
    estimated_duration: 30,
    checklist: [] as string[],
    required_tools: [] as string[],
    haccp_category: 'other' as const,
    checklistInput: '',
    toolInput: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    onUpdate(tasks)

    const isValid =
      tasks.length > 0 &&
      tasks.every(
        task =>
          task.name.trim().length >= 2 &&
          !tasks.find(
            other =>
              other.id !== task.id &&
              other.name.toLowerCase() === task.name.toLowerCase()
          )
      )

    onValidChange(isValid)
  }, [tasks, onUpdate, onValidChange])

  const generateId = () =>
    `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const validateTask = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Il nome del task è obbligatorio'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Il nome deve essere di almeno 2 caratteri'
    } else if (
      tasks.find(
        t =>
          t.id !== editingId &&
          t.name.toLowerCase() === formData.name.toLowerCase()
      )
    ) {
      newErrors.name = 'Un task con questo nome esiste già'
    }

    if (formData.estimated_duration < 5) {
      newErrors.estimated_duration = 'La durata minima è 5 minuti'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const addTask = () => {
    if (!validateTask()) return

    const newTask: Task = {
      id: generateId(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      frequency: formData.frequency,
      department_id: formData.department_id || undefined,
      conservation_point_id: formData.conservation_point_id || undefined,
      priority: formData.priority,
      estimated_duration: formData.estimated_duration,
      checklist: formData.checklist,
      required_tools: formData.required_tools,
      haccp_category: formData.haccp_category,
    }

    setTasks([...tasks, newTask])
    resetForm()
  }

  const updateTask = () => {
    if (!validateTask()) return

    setTasks(
      tasks.map(task =>
        task.id === editingId
          ? {
              ...task,
              name: formData.name.trim(),
              description: formData.description.trim(),
              frequency: formData.frequency,
              department_id: formData.department_id || undefined,
              conservation_point_id:
                formData.conservation_point_id || undefined,
              priority: formData.priority,
              estimated_duration: formData.estimated_duration,
              checklist: formData.checklist,
              required_tools: formData.required_tools,
              haccp_category: formData.haccp_category,
            }
          : task
      )
    )
    resetForm()
  }

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id))
  }

  const startEdit = (task: Task) => {
    setEditingId(task.id)
    setFormData({
      name: task.name,
      description: task.description,
      frequency: task.frequency,
      department_id: task.department_id || '',
      conservation_point_id: task.conservation_point_id || '',
      priority: task.priority,
      estimated_duration: task.estimated_duration,
      checklist: task.checklist || [],
      required_tools: task.required_tools || [],
      haccp_category: task.haccp_category,
      checklistInput: '',
      toolInput: '',
    })
    setErrors({})
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData({
      name: '',
      description: '',
      frequency: 'weekly',
      department_id: '',
      conservation_point_id: '',
      priority: 'medium',
      estimated_duration: 30,
      checklist: [],
      required_tools: [],
      haccp_category: 'other',
      checklistInput: '',
      toolInput: '',
    })
    setErrors({})
  }

  const addChecklistItem = () => {
    if (formData.checklistInput.trim()) {
      setFormData({
        ...formData,
        checklist: [...formData.checklist, formData.checklistInput.trim()],
        checklistInput: '',
      })
    }
  }

  const removeChecklistItem = (index: number) => {
    setFormData({
      ...formData,
      checklist: formData.checklist.filter((_, i) => i !== index),
    })
  }

  const addTool = () => {
    if (formData.toolInput.trim()) {
      setFormData({
        ...formData,
        required_tools: [...formData.required_tools, formData.toolInput.trim()],
        toolInput: '',
      })
    }
  }

  const removeTool = (index: number) => {
    setFormData({
      ...formData,
      required_tools: formData.required_tools.filter((_, i) => i !== index),
    })
  }

  const prefillSampleData = () => {
    const cucina = departments.find(d => d.name === 'Cucina')
    const frigorifero = conservationPoints.find(p =>
      p.name.includes('Frigorifero')
    )

    const sampleTasks: Task[] = [
      {
        id: generateId(),
        name: 'Controllo Temperature Frigoriferi',
        description:
          'Verifica e registrazione temperature di tutti i frigoriferi',
        frequency: 'daily',
        department_id: cucina?.id,
        conservation_point_id: frigorifero?.id,
        priority: 'high',
        estimated_duration: 15,
        haccp_category: 'temperature',
        checklist: [
          'Verificare temperatura display frigorifero',
          'Controllare temperatura con termometro di controllo',
          'Registrare temperatura su modulo HACCP',
          'Verificare corretta chiusura porta',
          'Controllare pulizia guarnizioni',
        ],
        required_tools: [
          'Termometro digitale',
          'Modulo registrazione temperature',
        ],
      },
      {
        id: generateId(),
        name: 'Sanificazione Superfici Lavoro',
        description: 'Pulizia e sanificazione di tutte le superfici di lavoro',
        frequency: 'daily',
        department_id: cucina?.id,
        priority: 'critical',
        estimated_duration: 45,
        haccp_category: 'hygiene',
        checklist: [
          'Rimuovere tutti i residui alimentari',
          'Lavare con detergente specifico',
          'Risciacquare accuratamente',
          'Applicare disinfettante alimentare',
          'Lasciare agire per tempo indicato',
          'Risciacquare se necessario',
        ],
        required_tools: [
          'Detergente professionale',
          'Disinfettante alimentare',
          'Panni monouso',
          'Spugne dedicate',
        ],
      },
      {
        id: generateId(),
        name: 'Verifica Scadenze Prodotti',
        description: 'Controllo e rimozione prodotti scaduti o in scadenza',
        frequency: 'daily',
        department_id: cucina?.id,
        priority: 'high',
        estimated_duration: 20,
        haccp_category: 'documentation',
        checklist: [
          'Controllare date di scadenza in frigorifero',
          'Controllare date di scadenza in dispensa',
          'Rimuovere prodotti scaduti',
          'Segnalare prodotti in scadenza entro 2 giorni',
          'Aggiornare inventario',
        ],
        required_tools: ['Etichette', 'Pennarello', 'Registro scadenze'],
      },
      {
        id: generateId(),
        name: 'Pulizia Profonda Abbattitore',
        description: "Sanificazione completa dell'abbattitore di temperatura",
        frequency: 'weekly',
        department_id: cucina?.id,
        priority: 'medium',
        estimated_duration: 60,
        haccp_category: 'maintenance',
        checklist: [
          'Spegnere e svuotare apparecchio',
          'Rimuovere vassoi e accessori',
          'Lavare vassoi con detergente',
          'Pulire camera interna',
          'Disinfettare tutte le superfici',
          'Controllare stato guarnizioni',
          'Riaccendere e verificare funzionamento',
        ],
        required_tools: [
          'Detergente per acciaio',
          'Disinfettante',
          'Spugne non abrasive',
          'Panni in microfibra',
        ],
      },
      {
        id: generateId(),
        name: 'Formazione HACCP Mensile',
        description:
          'Sessione di aggiornamento formativo per tutto il personale',
        frequency: 'monthly',
        priority: 'medium',
        estimated_duration: 120,
        haccp_category: 'training',
        checklist: [
          'Preparare materiale formativo',
          'Verificare presenze tutto il personale',
          'Illustrare procedure HACCP aggiornate',
          'Discutere casi pratici',
          'Verificare comprensione concetti',
          'Registrare partecipazione su registro',
        ],
        required_tools: [
          'Materiale didattico',
          'Registro formazione',
          'Attestati partecipazione',
        ],
      },
      {
        id: generateId(),
        name: 'Audit Interno HACCP',
        description: 'Verifica compliance interna del sistema HACCP',
        frequency: 'quarterly',
        priority: 'critical',
        estimated_duration: 180,
        haccp_category: 'documentation',
        checklist: [
          'Verificare registri temperature',
          'Controllare registri pulizie',
          'Verificare documentazione fornitori',
          'Controllare scadenze certificazioni',
          'Verificare procedure operative',
          'Redigere report audit',
          'Pianificare azioni correttive',
        ],
        required_tools: [
          'Checklist audit',
          'Moduli non conformità',
          'Macchina fotografica',
          'Computer/tablet',
        ],
      },
      {
        id: generateId(),
        name: 'Taratura Termometri',
        description: 'Verifica e taratura di tutti i termometri di controllo',
        frequency: 'monthly',
        department_id: cucina?.id,
        priority: 'high',
        estimated_duration: 30,
        haccp_category: 'maintenance',
        checklist: [
          'Raccogliere tutti i termometri',
          'Preparare bagno di ghiaccio (0°C)',
          'Immergere termometri per 2 minuti',
          'Verificare lettura 0°C ±1°C',
          'Registrare risultati taratura',
          'Sostituire termometri non conformi',
          'Etichettare termometri tarati',
        ],
        required_tools: [
          'Ghiaccio',
          'Contenitore per bagno',
          'Etichette',
          'Registro tarature',
        ],
      },
      {
        id: generateId(),
        name: 'Controllo Infestanti',
        description: 'Verifica presenza tracce di infestanti e stato esche',
        frequency: 'weekly',
        priority: 'medium',
        estimated_duration: 25,
        haccp_category: 'hygiene',
        checklist: [
          'Ispezionare tutte le esche topicide',
          'Verificare presenza escrementi',
          'Controllare rosicchiature su contenitori',
          'Verificare presenza insetti volanti',
          'Controllare pulizia griglie scarichi',
          'Registrare osservazioni',
          'Contattare ditta disinfestazione se necessario',
        ],
        required_tools: [
          'Torcia',
          'Registro controlli',
          'Guanti',
          'Telefono ditta disinfestazione',
        ],
      },
    ]
    setTasks(sampleTasks)
  }

  const getCategoryInfo = (category: string) => {
    return (
      HACCP_CATEGORIES.find(c => c.value === category) || HACCP_CATEGORIES[5]
    )
  }

  const getFrequencyLabel = (frequency: string) => {
    return TASK_FREQUENCIES.find(f => f.value === frequency)?.label || frequency
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    }
    return (
      colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800'
    )
  }

  const getPriorityLabel = (priority: string) => {
    const labels = {
      low: 'Bassa',
      medium: 'Media',
      high: 'Alta',
      critical: 'Critica',
    }
    return labels[priority as keyof typeof labels] || priority
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckSquare className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Attività e Controlli HACCP
        </h2>
        <p className="text-gray-600">
          Configura le attività periodiche per garantire la conformità HACCP
        </p>
      </div>

      {/* Quick Fill Button */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={prefillSampleData}
          className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          🚀 Carica attività predefinite
        </button>
      </div>

      {/* Add/Edit Form */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-4">
          {editingId ? 'Modifica Attività' : 'Nuova Attività HACCP'}
        </h3>

        <div className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Attività *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="es. Controllo Temperature"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria HACCP *
              </label>
              <select
                value={formData.haccp_category}
                onChange={e =>
                  setFormData({
                    ...formData,
                    haccp_category: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {HACCP_CATEGORIES.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.icon} {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrizione
            </label>
            <textarea
              value={formData.description}
              onChange={e =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descrizione dettagliata dell'attività..."
            />
          </div>

          {/* Frequency and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frequenza *
              </label>
              <select
                value={formData.frequency}
                onChange={e =>
                  setFormData({ ...formData, frequency: e.target.value as any })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {TASK_FREQUENCIES.map(freq => (
                  <option key={freq.value} value={freq.value}>
                    {freq.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priorità *
              </label>
              <select
                value={formData.priority}
                onChange={e =>
                  setFormData({ ...formData, priority: e.target.value as any })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Bassa</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="critical">Critica</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Durata (minuti) *
              </label>
              <input
                type="number"
                min="5"
                step="5"
                value={formData.estimated_duration}
                onChange={e =>
                  setFormData({
                    ...formData,
                    estimated_duration: parseInt(e.target.value) || 30,
                  })
                }
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.estimated_duration
                    ? 'border-red-300'
                    : 'border-gray-300'
                }`}
              />
              {errors.estimated_duration && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.estimated_duration}
                </p>
              )}
            </div>
          </div>

          {/* Assignments */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reparto
              </label>
              <select
                value={formData.department_id}
                onChange={e =>
                  setFormData({ ...formData, department_id: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tutti i reparti</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Punto di Conservazione
              </label>
              <select
                value={formData.conservation_point_id}
                onChange={e =>
                  setFormData({
                    ...formData,
                    conservation_point_id: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Nessuno specifico</option>
                {conservationPoints.map(point => (
                  <option key={point.id} value={point.id}>
                    {point.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Checklist */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Checklist Operativa
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={formData.checklistInput}
                onChange={e =>
                  setFormData({ ...formData, checklistInput: e.target.value })
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Aggiungi elemento alla checklist..."
                onKeyDown={e =>
                  e.key === 'Enter' && (e.preventDefault(), addChecklistItem())
                }
              />
              <button
                type="button"
                onClick={addChecklistItem}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {formData.checklist.length > 0 && (
              <div className="space-y-1">
                {formData.checklist.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded"
                  >
                    <CheckSquare className="w-4 h-4 text-green-600" />
                    <span className="flex-1 text-sm">{item}</span>
                    <button
                      type="button"
                      onClick={() => removeChecklistItem(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Required Tools */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Strumenti Necessari
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={formData.toolInput}
                onChange={e =>
                  setFormData({ ...formData, toolInput: e.target.value })
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Aggiungi strumento necessario..."
                onKeyDown={e =>
                  e.key === 'Enter' && (e.preventDefault(), addTool())
                }
              />
              <button
                type="button"
                onClick={addTool}
                className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {formData.required_tools.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.required_tools.map((tool, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    <span>{tool}</span>
                    <button
                      type="button"
                      onClick={() => removeTool(index)}
                      className="text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-3 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Annulla
              </button>
            )}
            <button
              type="button"
              onClick={editingId ? updateTask : addTask}
              className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              {editingId ? (
                <>
                  <Edit2 className="w-4 h-4" />
                  Aggiorna
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Aggiungi
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div>
        <h3 className="font-medium text-gray-900 mb-3">
          Attività Configurate ({tasks.length})
        </h3>

        {tasks.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <CheckSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">Nessuna attività configurata</p>
            <p className="text-sm text-gray-400">
              Aggiungi attività per automatizzare i controlli HACCP
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {tasks.map(task => {
              const department = departments.find(
                d => d.id === task.department_id
              )
              const conservationPoint = conservationPoints.find(
                p => p.id === task.conservation_point_id
              )
              const categoryInfo = getCategoryInfo(task.haccp_category)

              return (
                <div
                  key={task.id}
                  className="border border-gray-200 rounded-lg p-4 bg-white"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{categoryInfo.icon}</span>
                        <h4 className="font-medium text-gray-900">
                          {task.name}
                        </h4>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}
                        >
                          {getPriorityLabel(task.priority)}
                        </span>
                      </div>

                      {task.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {task.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2 text-sm text-gray-500 mb-2">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {getFrequencyLabel(task.frequency)}
                        </span>
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" />
                          {task.estimated_duration} min
                        </span>
                        {department && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {department.name}
                          </span>
                        )}
                        {conservationPoint && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            {conservationPoint.name}
                          </span>
                        )}
                      </div>

                      {task.checklist.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs font-medium text-gray-700 mb-1">
                            Checklist ({task.checklist.length} elementi)
                          </p>
                          <div className="text-xs text-gray-500">
                            {task.checklist.slice(0, 2).map((item, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-1"
                              >
                                <CheckSquare className="w-3 h-3" />
                                <span>{item}</span>
                              </div>
                            ))}
                            {task.checklist.length > 2 && (
                              <span className="text-gray-400">
                                ... e altri {task.checklist.length - 2}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {task.required_tools.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {task.required_tools
                            .slice(0, 3)
                            .map((tool, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                              >
                                {tool}
                              </span>
                            ))}
                          {task.required_tools.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{task.required_tools.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => startEdit(task)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="Modifica attività"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1 text-red-600 hover:text-red-800"
                        title="Elimina attività"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* HACCP Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">
          ℹ️ Automazione Controlli HACCP
        </h3>
        <p className="text-sm text-blue-700">
          Le attività configurate verranno automaticamente assegnate al
          personale secondo la frequenza impostata. Il sistema genererà
          promemoria e monitererà il completamento per garantire la conformità
          alle procedure HACCP.
        </p>
      </div>
    </div>
  )
}

export default TasksStep
