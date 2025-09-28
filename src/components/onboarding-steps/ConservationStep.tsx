import { useState, useEffect } from 'react'
import { Thermometer, Plus, Trash2, Edit2, Info } from 'lucide-react'

interface Department {
  id: string
  name: string
  description: string
  is_active: boolean
}

interface ConservationPoint {
  id: string
  name: string
  location: string
  targetTemp: number | string
  type: 'ambient' | 'fridge' | 'freezer' | 'blast'
  selectedCategories: string[]
  isAbbattitore: boolean
  isAmbiente: boolean
  compliance?: {
    compliant: boolean
    message: string
    type: 'compliant' | 'warning' | 'error'
    color: 'green' | 'yellow' | 'red'
  }
}

interface ConservationStepProps {
  data?: ConservationPoint[]
  departments: Department[]
  onUpdate: (data: ConservationPoint[]) => void
  onValidChange: (isValid: boolean) => void
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
  'Altri'
]

const TEMPERATURE_RANGES = {
  ambient: { min: 15, max: 25, optimal: 20 },
  fridge: { min: 0, max: 8, optimal: 4 },
  freezer: { min: -25, max: -15, optimal: -20 },
  blast: { min: -40, max: 3, optimal: -18 }
}

// HACCP Rules for category compliance (from reference repository)
const CONSERVATION_POINT_RULES = {
  tolerance: 0.5, // Tolleranza di ±0.5°C per validazione HACCP
  categories: [
    { id: 'carni_fresche', name: 'Carni fresche', minTemp: 0, maxTemp: 4 },
    { id: 'carni_trasformate', name: 'Carni trasformate', minTemp: 0, maxTemp: 4 },
    { id: 'pesce_fresco', name: 'Pesce fresco', minTemp: 0, maxTemp: 2 },
    { id: 'pesce_trasformato', name: 'Pesce trasformato', minTemp: 0, maxTemp: 4 },
    { id: 'latticini', name: 'Latticini', minTemp: 2, maxTemp: 6 },
    { id: 'uova', name: 'Uova', minTemp: 0, maxTemp: 4 },
    { id: 'verdure_fresche', name: 'Verdure fresche', minTemp: 0, maxTemp: 8 },
    { id: 'frutta_fresca', name: 'Frutta fresca', minTemp: 0, maxTemp: 10 },
    { id: 'prodotti_forno', name: 'Prodotti da forno', minTemp: 15, maxTemp: 25 },
    { id: 'bevande', name: 'Bevande', minTemp: 2, maxTemp: 8 },
    { id: 'surgelati', name: 'Surgelati', minTemp: -25, maxTemp: -15 },
    { id: 'gelati', name: 'Gelati', minTemp: -20, maxTemp: -15 },
    { id: 'conserve', name: 'Conserve', minTemp: 15, maxTemp: 25 },
    { id: 'condimenti', name: 'Condimenti', minTemp: 15, maxTemp: 25 },
    { id: 'prodotti_secchi', name: 'Prodotti secchi', minTemp: 15, maxTemp: 25 },
    { id: 'altri', name: 'Altri', minTemp: 0, maxTemp: 25 }
  ]
}

const ConservationStep = ({ data, departments, onUpdate, onValidChange }: ConservationStepProps) => {
  const [points, setPoints] = useState<ConservationPoint[]>(data || [])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    targetTemp: '',
    isAbbattitore: false,
    isAmbiente: false,
    selectedCategories: [] as string[]
  })
  const [predictedType, setPredictedType] = useState<'ambient' | 'fridge' | 'freezer' | 'blast'>('fridge')
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    validateForm()
    onUpdate(points)
  }, [points, onUpdate])

  // Funzione per validazione HACCP (dal repository di riferimento)
  const checkHACCPCompliance = (targetTemp: number | string, selectedCategories: string[]) => {
    if (!targetTemp || selectedCategories.length === 0) {
      return {
        compliant: false,
        message: 'Inserire temperatura e categorie per validazione',
        type: 'error' as const,
        color: 'red' as const
      }
    }

    // Gestione temperatura ambiente
    let temp: number
    let isAmbiente = false

    if (typeof targetTemp === 'string' && targetTemp.includes('Ambiente')) {
      temp = 20 // Valore medio per validazione
      isAmbiente = true
    } else {
      temp = parseFloat(targetTemp.toString())
    }

    if (isNaN(temp)) {
      return {
        compliant: false,
        message: 'Temperatura non valida',
        type: 'error' as const,
        color: 'red' as const
      }
    }

    const tolerance = CONSERVATION_POINT_RULES.tolerance
    let allInRange = true
    let allInToleranceRange = true
    let incompatibleCategories: string[] = []

    for (const categoryName of selectedCategories) {
      const category = CONSERVATION_POINT_RULES.categories.find(c => c.name === categoryName)
      if (category) {
        const inRange = temp >= category.minTemp && temp <= category.maxTemp
        const categoryMin = category.minTemp - tolerance
        const categoryMax = category.maxTemp + tolerance
        const inToleranceRange = temp >= categoryMin && temp <= categoryMax

        if (!inRange) {
          allInRange = false
          if (!inToleranceRange) {
            allInToleranceRange = false
            incompatibleCategories.push(category.name)
          }
        }
      }
    }

    if (allInRange) {
      return {
        compliant: true,
        message: '✅ Temperatura valida per tutte le categorie',
        type: 'compliant' as const,
        color: 'green' as const
      }
    } else if (allInToleranceRange) {
      return {
        compliant: true,
        message: 'Temperatura entro i limiti accettabili (±0.5°C)',
        type: 'warning' as const,
        color: 'yellow' as const
      }
    } else {
      return {
        compliant: false,
        message: `❌ Fuori range HACCP per: ${incompatibleCategories.join(', ')}`,
        type: 'error' as const,
        color: 'red' as const
      }
    }
  }

  useEffect(() => {
    const temp = parseFloat(formData.targetTemp.toString())
    const isBlast = formData.isAbbattitore
    let type: 'ambient' | 'fridge' | 'freezer' | 'blast' = 'fridge'

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
  }, [formData.targetTemp, formData.isAbbattitore])

  const validateForm = () => {
    const isValid = points.length > 0 && points.every(point =>
      point.name.trim().length >= 2 &&
      point.department_id &&
      !points.find(other => other.id !== point.id && other.name.toLowerCase() === point.name.toLowerCase())
    )
    onValidChange(isValid)
  }

  const generateId = () => `point_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const validatePoint = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Il nome del punto è obbligatorio'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Il nome deve essere di almeno 2 caratteri'
    } else if (points.find(p => p.id !== editingId && p.name.toLowerCase() === formData.name.toLowerCase())) {
      newErrors.name = 'Un punto con questo nome esiste già'
    }

    if (!formData.department_id) {
      newErrors.department_id = 'Seleziona un reparto'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const addPoint = () => {
    if (!validatePoint()) return

    const newPoint: ConservationPoint = {
      id: generateId(),
      name: formData.name.trim(),
      department_id: formData.department_id,
      setpoint_temp: formData.setpoint_temp,
      type: predictedType,
      is_blast_chiller: formData.is_blast_chiller,
      product_categories: formData.product_categories
    }

    setPoints([...points, newPoint])
    resetForm()
  }

  const updatePoint = () => {
    if (!validatePoint()) return

    setPoints(points.map(point =>
      point.id === editingId
        ? {
            ...point,
            name: formData.name.trim(),
            department_id: formData.department_id,
            setpoint_temp: formData.setpoint_temp,
            type: predictedType,
            is_blast_chiller: formData.is_blast_chiller,
            product_categories: formData.product_categories
          }
        : point
    ))
    resetForm()
  }

  const deletePoint = (id: string) => {
    setPoints(points.filter(point => point.id !== id))
  }

  const startEdit = (point: ConservationPoint) => {
    setEditingId(point.id)
    setFormData({
      name: point.name,
      department_id: point.department_id,
      setpoint_temp: point.setpoint_temp,
      is_blast_chiller: point.is_blast_chiller,
      product_categories: point.product_categories || []
    })
    setErrors({})
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData({
      name: '',
      department_id: '',
      setpoint_temp: 4,
      is_blast_chiller: false,
      product_categories: []
    })
    setErrors({})
    setShowCategoryDropdown(false)
  }

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      product_categories: prev.product_categories.includes(category)
        ? prev.product_categories.filter(c => c !== category)
        : [...prev.product_categories, category]
    }))
  }

  const prefillSampleData = () => {
    const cucina = departments.find(d => d.name === 'Cucina')
    const magazzino = departments.find(d => d.name === 'Magazzino')
    const sala = departments.find(d => d.name === 'Sala')

    const samplePoints: ConservationPoint[] = [
      {
        id: generateId(),
        name: 'Frigorifero Cucina 1',
        department_id: cucina?.id || departments[0]?.id || '',
        setpoint_temp: 4,
        type: 'fridge',
        is_blast_chiller: false,
        product_categories: ['Carni fresche', 'Latticini', 'Verdure fresche']
      },
      {
        id: generateId(),
        name: 'Congelatore Principale',
        department_id: cucina?.id || departments[0]?.id || '',
        setpoint_temp: -18,
        type: 'freezer',
        is_blast_chiller: false,
        product_categories: ['Surgelati', 'Gelati', 'Carni trasformate']
      },
      {
        id: generateId(),
        name: 'Abbattitore Professionale',
        department_id: cucina?.id || departments[0]?.id || '',
        setpoint_temp: -18,
        type: 'blast',
        is_blast_chiller: true,
        product_categories: ['Carni fresche', 'Pesce fresco', 'Prodotti da forno']
      },
      {
        id: generateId(),
        name: 'Vetrina Refrigerata',
        department_id: sala?.id || departments[1]?.id || '',
        setpoint_temp: 6,
        type: 'fridge',
        is_blast_chiller: false,
        product_categories: ['Bevande', 'Latticini', 'Conserve']
      }
    ]
    setPoints(samplePoints)
  }

  const getTypeInfo = () => {
    const range = TEMPERATURE_RANGES[predictedType]
    const typeNames = {
      ambient: 'Ambiente',
      fridge: 'Frigorifero',
      freezer: 'Congelatore',
      blast: 'Abbattitore'
    }

    return {
      name: typeNames[predictedType],
      range: `${range.min}°C - ${range.max}°C`,
      optimal: `${range.optimal}°C`,
      icon: predictedType === 'ambient' ? '🌡️' : predictedType === 'fridge' ? '❄️' : predictedType === 'freezer' ? '🧊' : '⚡'
    }
  }

  const getPointTypeIcon = (type: string) => {
    const icons = {
      ambient: '🌡️',
      fridge: '❄️',
      freezer: '🧊',
      blast: '⚡'
    }
    return icons[type as keyof typeof icons] || '🌡️'
  }

  const typeInfo = getTypeInfo()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Thermometer className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Punti di Conservazione
        </h2>
        <p className="text-gray-600">
          Configura i punti di controllo temperatura per il monitoraggio HACCP
        </p>
      </div>

      {/* Quick Fill Button */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={prefillSampleData}
          className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          🚀 Carica punti predefiniti
        </button>
      </div>

      {/* Add/Edit Form */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-4">
          {editingId ? 'Modifica Punto di Conservazione' : 'Nuovo Punto di Conservazione'}
        </h3>

        <div className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome punto di conservazione *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="es. Frigorifero Cucina 1"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reparto *
              </label>
              <select
                value={formData.department_id}
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.department_id ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Seleziona reparto</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              {errors.department_id && (
                <p className="mt-1 text-sm text-red-600">{errors.department_id}</p>
              )}
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
                  step="0.1"
                  min="-99"
                  max="30"
                  value={formData.setpoint_temp}
                  onChange={(e) => setFormData({ ...formData, setpoint_temp: parseFloat(e.target.value) })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_blast_chiller"
                checked={formData.is_blast_chiller}
                onChange={(e) => setFormData({ ...formData, is_blast_chiller: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="is_blast_chiller" className="text-sm font-medium text-gray-700">
                Abbattitore di temperatura
              </label>
            </div>

            {/* Auto-classification Preview */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Info className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">Classificazione automatica</span>
              </div>
              <div className="text-sm text-blue-800">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{typeInfo.icon}</span>
                  <span>
                    <strong>{typeInfo.name}</strong> - Range: {typeInfo.range} - Ottimale: {typeInfo.optimal}
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
              onClick={editingId ? updatePoint : addPoint}
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

      {/* Points List */}
      <div>
        <h3 className="font-medium text-gray-900 mb-3">
          Punti di Conservazione Configurati ({points.length})
        </h3>

        {points.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <Thermometer className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">Nessun punto di conservazione configurato</p>
            <p className="text-sm text-gray-400">
              Aggiungi almeno un punto per il controllo temperature
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {points.map((point) => {
              const department = departments.find(d => d.id === point.department_id)
              return (
                <div
                  key={point.id}
                  className="border border-gray-200 rounded-lg p-4 bg-white"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{getPointTypeIcon(point.type)}</span>
                        <h4 className="font-medium text-gray-900">{point.name}</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {department?.name} • {point.setpoint_temp}°C
                      </p>
                      <p className="text-sm text-gray-500 mb-2">
                        Tipo: {point.type === 'ambient' ? 'Ambiente' :
                               point.type === 'fridge' ? 'Frigorifero' :
                               point.type === 'freezer' ? 'Congelatore' : 'Abbattitore'}
                        {point.is_blast_chiller && ' (Abbattitore)'}
                      </p>
                      {point.product_categories.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {point.product_categories.slice(0, 3).map(category => (
                            <span key={category} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              {category}
                            </span>
                          ))}
                          {point.product_categories.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{point.product_categories.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => startEdit(point)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="Modifica punto"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deletePoint(point.id)}
                        className="p-1 text-red-600 hover:text-red-800"
                        title="Elimina punto"
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
          ℹ️ Controllo Temperature HACCP
        </h3>
        <p className="text-sm text-blue-700">
          I punti di conservazione sono utilizzati per il monitoraggio automatico delle temperature
          secondo le normative HACCP. Ogni punto genererà alert automatici in caso di
          temperatura fuori range e richiederà controlli periodici da parte del personale.
        </p>
      </div>
    </div>
  )
}

export default ConservationStep