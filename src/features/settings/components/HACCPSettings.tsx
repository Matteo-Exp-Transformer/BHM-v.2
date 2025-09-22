import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import {
  Shield,
  Thermometer,
  AlertTriangle,
  Save,
  CheckCircle,
} from 'lucide-react'

interface HACCPConfig {
  id: string
  company_id: string
  temperature_thresholds: {
    fridge_min: number
    fridge_max: number
    freezer_min: number
    freezer_max: number
    ambient_min: number
    ambient_max: number
    blast_min: number
    blast_max: number
  }
  alert_settings: {
    expiry_days: number
    certification_expiry_days: number
    temperature_violation_immediate: boolean
    maintenance_overdue_days: number
  }
  compliance_settings: {
    required_documentation: string[]
    audit_frequency_days: number
    corrective_action_required: boolean
    preventive_action_required: boolean
  }
  created_at: string
  updated_at: string
}

const defaultConfig: Partial<HACCPConfig> = {
  temperature_thresholds: {
    fridge_min: 0,
    fridge_max: 4,
    freezer_min: -18,
    freezer_max: -15,
    ambient_min: 10,
    ambient_max: 25,
    blast_min: -25,
    blast_max: -15,
  },
  alert_settings: {
    expiry_days: 3,
    certification_expiry_days: 30,
    temperature_violation_immediate: true,
    maintenance_overdue_days: 1,
  },
  compliance_settings: {
    required_documentation: [
      'temperature_logs',
      'maintenance_records',
      'staff_certifications',
    ],
    audit_frequency_days: 365,
    corrective_action_required: true,
    preventive_action_required: true,
  },
}

export function HACCPSettings() {
  const { companyId } = useAuth()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<HACCPConfig>>(defaultConfig)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch HACCP configuration
  const {
    data: config,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['haccp-config', companyId],
    queryFn: async () => {
      if (!companyId) return null

      const { data, error } = await supabase
        .from('haccp_configurations')
        .select('*')
        .eq('company_id', companyId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data as HACCPConfig
    },
    enabled: !!companyId,
  })

  // Create or update HACCP configuration
  const saveMutation = useMutation({
    mutationFn: async (configData: Partial<HACCPConfig>) => {
      if (!companyId) throw new Error('Company ID not found')

      const configToSave = {
        ...configData,
        company_id: companyId,
        updated_at: new Date().toISOString(),
      }

      if (config) {
        // Update existing
        const { error } = await supabase
          .from('haccp_configurations')
          .update(configToSave)
          .eq('id', config.id)

        if (error) throw error
      } else {
        // Create new
        const { error } = await supabase
          .from('haccp_configurations')
          .insert([configToSave])

        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['haccp-config', companyId] })
      setIsEditing(false)
      setErrors({})
    },
    onError: error => {
      console.error('Error saving HACCP config:', error)
      setErrors({
        general: 'Errore durante il salvataggio della configurazione',
      })
    },
  })

  // Initialize form data when config loads
  useEffect(() => {
    if (config) {
      setFormData(config)
    } else {
      setFormData(defaultConfig)
    }
  }, [config])

  const handleInputChange = (
    path: string,
    value: number | boolean | string[]
  ) => {
    const keys = path.split('.')
    setFormData(prev => {
      const newData = { ...prev }
      let current = newData as any

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {}
        current = current[keys[i]]
      }

      current[keys[keys.length - 1]] = value
      return newData
    })

    // Clear field error when user starts typing
    if (errors[path]) {
      setErrors(prev => ({ ...prev, [path]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validate temperature thresholds
    const thresholds = formData.temperature_thresholds
    if (thresholds) {
      if (thresholds.fridge_min >= thresholds.fridge_max) {
        newErrors['temperature_thresholds.fridge'] =
          'La temperatura minima deve essere inferiore alla massima'
      }
      if (thresholds.freezer_min >= thresholds.freezer_max) {
        newErrors['temperature_thresholds.freezer'] =
          'La temperatura minima deve essere inferiore alla massima'
      }
      if (thresholds.ambient_min >= thresholds.ambient_max) {
        newErrors['temperature_thresholds.ambient'] =
          'La temperatura minima deve essere inferiore alla massima'
      }
      if (thresholds.blast_min >= thresholds.blast_max) {
        newErrors['temperature_thresholds.blast'] =
          'La temperatura minima deve essere inferiore alla massima'
      }
    }

    // Validate alert settings
    const alerts = formData.alert_settings
    if (alerts) {
      if (alerts.expiry_days < 0 || alerts.expiry_days > 30) {
        newErrors['alert_settings.expiry_days'] =
          'I giorni di preavviso scadenza devono essere tra 0 e 30'
      }
      if (
        alerts.certification_expiry_days < 0 ||
        alerts.certification_expiry_days > 90
      ) {
        newErrors['alert_settings.certification_expiry_days'] =
          'I giorni di preavviso certificazione devono essere tra 0 e 90'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    try {
      await saveMutation.mutateAsync(formData)
    } catch (error) {
      console.error('Save failed:', error)
    }
  }

  const handleCancel = () => {
    if (config) {
      setFormData(config)
    } else {
      setFormData(defaultConfig)
    }
    setIsEditing(false)
    setErrors({})
  }

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Errore nel caricamento
        </h3>
        <p className="text-gray-600">
          Non è stato possibile caricare la configurazione HACCP.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Configurazione HACCP
          </h3>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Annulla
              </button>
              <button
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saveMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Salvataggio...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Salva
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Modifica
            </button>
          )}
        </div>
      </div>

      {/* General Error */}
      {errors.general && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{errors.general}</p>
            </div>
          </div>
        </div>
      )}

      {/* Temperature Thresholds */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Thermometer className="w-5 h-5 text-blue-600" />
          <h4 className="font-medium text-gray-900">Soglie di Temperatura</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Fridge */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frigorifero (°C)
            </label>
            <div className="space-y-2">
              <div>
                <input
                  type="number"
                  step="0.1"
                  value={formData.temperature_thresholds?.fridge_min || ''}
                  onChange={e =>
                    handleInputChange(
                      'temperature_thresholds.fridge_min',
                      parseFloat(e.target.value) || 0
                    )
                  }
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors['temperature_thresholds.fridge']
                      ? 'border-red-300'
                      : 'border-gray-300'
                  } ${!isEditing ? 'bg-gray-50' : ''}`}
                  placeholder="Min"
                />
              </div>
              <div>
                <input
                  type="number"
                  step="0.1"
                  value={formData.temperature_thresholds?.fridge_max || ''}
                  onChange={e =>
                    handleInputChange(
                      'temperature_thresholds.fridge_max',
                      parseFloat(e.target.value) || 0
                    )
                  }
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors['temperature_thresholds.fridge']
                      ? 'border-red-300'
                      : 'border-gray-300'
                  } ${!isEditing ? 'bg-gray-50' : ''}`}
                  placeholder="Max"
                />
              </div>
            </div>
            {errors['temperature_thresholds.fridge'] && (
              <p className="mt-1 text-sm text-red-600">
                {errors['temperature_thresholds.fridge']}
              </p>
            )}
          </div>

          {/* Freezer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Congelatore (°C)
            </label>
            <div className="space-y-2">
              <div>
                <input
                  type="number"
                  step="0.1"
                  value={formData.temperature_thresholds?.freezer_min || ''}
                  onChange={e =>
                    handleInputChange(
                      'temperature_thresholds.freezer_min',
                      parseFloat(e.target.value) || 0
                    )
                  }
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors['temperature_thresholds.freezer']
                      ? 'border-red-300'
                      : 'border-gray-300'
                  } ${!isEditing ? 'bg-gray-50' : ''}`}
                  placeholder="Min"
                />
              </div>
              <div>
                <input
                  type="number"
                  step="0.1"
                  value={formData.temperature_thresholds?.freezer_max || ''}
                  onChange={e =>
                    handleInputChange(
                      'temperature_thresholds.freezer_max',
                      parseFloat(e.target.value) || 0
                    )
                  }
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors['temperature_thresholds.freezer']
                      ? 'border-red-300'
                      : 'border-gray-300'
                  } ${!isEditing ? 'bg-gray-50' : ''}`}
                  placeholder="Max"
                />
              </div>
            </div>
            {errors['temperature_thresholds.freezer'] && (
              <p className="mt-1 text-sm text-red-600">
                {errors['temperature_thresholds.freezer']}
              </p>
            )}
          </div>

          {/* Ambient */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ambiente (°C)
            </label>
            <div className="space-y-2">
              <div>
                <input
                  type="number"
                  step="0.1"
                  value={formData.temperature_thresholds?.ambient_min || ''}
                  onChange={e =>
                    handleInputChange(
                      'temperature_thresholds.ambient_min',
                      parseFloat(e.target.value) || 0
                    )
                  }
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors['temperature_thresholds.ambient']
                      ? 'border-red-300'
                      : 'border-gray-300'
                  } ${!isEditing ? 'bg-gray-50' : ''}`}
                  placeholder="Min"
                />
              </div>
              <div>
                <input
                  type="number"
                  step="0.1"
                  value={formData.temperature_thresholds?.ambient_max || ''}
                  onChange={e =>
                    handleInputChange(
                      'temperature_thresholds.ambient_max',
                      parseFloat(e.target.value) || 0
                    )
                  }
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors['temperature_thresholds.ambient']
                      ? 'border-red-300'
                      : 'border-gray-300'
                  } ${!isEditing ? 'bg-gray-50' : ''}`}
                  placeholder="Max"
                />
              </div>
            </div>
            {errors['temperature_thresholds.ambient'] && (
              <p className="mt-1 text-sm text-red-600">
                {errors['temperature_thresholds.ambient']}
              </p>
            )}
          </div>

          {/* Blast Chiller */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Blast Chiller (°C)
            </label>
            <div className="space-y-2">
              <div>
                <input
                  type="number"
                  step="0.1"
                  value={formData.temperature_thresholds?.blast_min || ''}
                  onChange={e =>
                    handleInputChange(
                      'temperature_thresholds.blast_min',
                      parseFloat(e.target.value) || 0
                    )
                  }
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors['temperature_thresholds.blast']
                      ? 'border-red-300'
                      : 'border-gray-300'
                  } ${!isEditing ? 'bg-gray-50' : ''}`}
                  placeholder="Min"
                />
              </div>
              <div>
                <input
                  type="number"
                  step="0.1"
                  value={formData.temperature_thresholds?.blast_max || ''}
                  onChange={e =>
                    handleInputChange(
                      'temperature_thresholds.blast_max',
                      parseFloat(e.target.value) || 0
                    )
                  }
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors['temperature_thresholds.blast']
                      ? 'border-red-300'
                      : 'border-gray-300'
                  } ${!isEditing ? 'bg-gray-50' : ''}`}
                  placeholder="Max"
                />
              </div>
            </div>
            {errors['temperature_thresholds.blast'] && (
              <p className="mt-1 text-sm text-red-600">
                {errors['temperature_thresholds.blast']}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Alert Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          <h4 className="font-medium text-gray-900">Impostazioni Allerte</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giorni preavviso scadenza prodotti
            </label>
            <input
              type="number"
              min="0"
              max="30"
              value={formData.alert_settings?.expiry_days || ''}
              onChange={e =>
                handleInputChange(
                  'alert_settings.expiry_days',
                  parseInt(e.target.value) || 0
                )
              }
              disabled={!isEditing}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors['alert_settings.expiry_days']
                  ? 'border-red-300'
                  : 'border-gray-300'
              } ${!isEditing ? 'bg-gray-50' : ''}`}
            />
            {errors['alert_settings.expiry_days'] && (
              <p className="mt-1 text-sm text-red-600">
                {errors['alert_settings.expiry_days']}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giorni preavviso scadenza certificazioni
            </label>
            <input
              type="number"
              min="0"
              max="90"
              value={formData.alert_settings?.certification_expiry_days || ''}
              onChange={e =>
                handleInputChange(
                  'alert_settings.certification_expiry_days',
                  parseInt(e.target.value) || 0
                )
              }
              disabled={!isEditing}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors['alert_settings.certification_expiry_days']
                  ? 'border-red-300'
                  : 'border-gray-300'
              } ${!isEditing ? 'bg-gray-50' : ''}`}
            />
            {errors['alert_settings.certification_expiry_days'] && (
              <p className="mt-1 text-sm text-red-600">
                {errors['alert_settings.certification_expiry_days']}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={
                  formData.alert_settings?.temperature_violation_immediate ||
                  false
                }
                onChange={e =>
                  handleInputChange(
                    'alert_settings.temperature_violation_immediate',
                    e.target.checked
                  )
                }
                disabled={!isEditing}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Allerta immediata per violazioni di temperatura
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {saveMutation.isSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm text-green-800">
                Configurazione HACCP salvata con successo.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="ml-3">
            <h4 className="font-medium text-blue-900 mb-1">Conformità HACCP</h4>
            <p className="text-sm text-blue-800">
              Queste impostazioni determinano le soglie di allerta e i parametri
              di conformità per il sistema HACCP. Le modifiche vengono applicate
              immediatamente a tutti i controlli di temperatura e alle procedure
              di monitoraggio.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
