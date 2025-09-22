import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import {
  Bell,
  Mail,
  Smartphone,
  Save,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react'

interface NotificationConfig {
  id: string
  company_id: string
  user_id: string
  email_notifications: {
    temperature_violations: boolean
    expiry_alerts: boolean
    maintenance_reminders: boolean
    certification_expiry: boolean
    system_updates: boolean
    daily_summary: boolean
    weekly_report: boolean
  }
  push_notifications: {
    temperature_violations: boolean
    expiry_alerts: boolean
    maintenance_reminders: boolean
    certification_expiry: boolean
    urgent_alerts: boolean
  }
  notification_frequency: {
    email_digest: 'immediate' | 'hourly' | 'daily' | 'weekly'
    push_frequency: 'immediate' | 'batched'
    quiet_hours_start: string
    quiet_hours_end: string
    weekend_notifications: boolean
  }
  alert_preferences: {
    critical_alerts_only: boolean
    include_photos: boolean
    include_location: boolean
    escalation_enabled: boolean
  }
  created_at: string
  updated_at: string
}

const defaultConfig: Partial<NotificationConfig> = {
  email_notifications: {
    temperature_violations: true,
    expiry_alerts: true,
    maintenance_reminders: true,
    certification_expiry: true,
    system_updates: false,
    daily_summary: true,
    weekly_report: true,
  },
  push_notifications: {
    temperature_violations: true,
    expiry_alerts: true,
    maintenance_reminders: false,
    certification_expiry: true,
    urgent_alerts: true,
  },
  notification_frequency: {
    email_digest: 'daily',
    push_frequency: 'immediate',
    quiet_hours_start: '22:00',
    quiet_hours_end: '07:00',
    weekend_notifications: false,
  },
  alert_preferences: {
    critical_alerts_only: false,
    include_photos: true,
    include_location: true,
    escalation_enabled: true,
  },
}

export function NotificationPreferences() {
  const { companyId, userId } = useAuth()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] =
    useState<Partial<NotificationConfig>>(defaultConfig)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch notification configuration
  const {
    data: config,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['notification-config', companyId, userId],
    queryFn: async () => {
      if (!companyId || !userId) return null

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('company_id', companyId)
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data as NotificationConfig
    },
    enabled: !!companyId && !!userId,
  })

  // Create or update notification configuration
  const saveMutation = useMutation({
    mutationFn: async (configData: Partial<NotificationConfig>) => {
      if (!companyId || !userId)
        throw new Error('Company ID or User ID not found')

      const configToSave = {
        ...configData,
        company_id: companyId,
        user_id: userId,
        updated_at: new Date().toISOString(),
      }

      if (config) {
        // Update existing
        const { error } = await supabase
          .from('notification_preferences')
          .update(configToSave)
          .eq('id', config.id)

        if (error) throw error
      } else {
        // Create new
        const { error } = await supabase
          .from('notification_preferences')
          .insert([configToSave])

        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['notification-config', companyId, userId],
      })
      setIsEditing(false)
      setErrors({})
    },
    onError: error => {
      console.error('Error saving notification config:', error)
      setErrors({ general: 'Errore durante il salvataggio delle preferenze' })
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

  const handleInputChange = (path: string, value: boolean | string) => {
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

    // Validate quiet hours
    const quietStart = formData.notification_frequency?.quiet_hours_start
    const quietEnd = formData.notification_frequency?.quiet_hours_end

    if (quietStart && quietEnd) {
      const startTime = new Date(`2000-01-01 ${quietStart}`)
      const endTime = new Date(`2000-01-01 ${quietEnd}`)

      if (startTime >= endTime) {
        newErrors['notification_frequency.quiet_hours'] =
          "L'ora di inizio deve essere precedente all'ora di fine"
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

  const handleResetToDefaults = () => {
    setFormData(defaultConfig)
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
          Non è stato possibile caricare le preferenze di notifica.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Preferenze Notifiche
          </h3>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleResetToDefaults}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Reset
              </button>
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

      {/* Email Notifications */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="w-5 h-5 text-blue-600" />
          <h4 className="font-medium text-gray-900">Notifiche Email</h4>
        </div>

        <div className="space-y-4">
          {[
            {
              key: 'temperature_violations',
              label: 'Violazioni di temperatura',
              description:
                'Ricevi email quando vengono rilevate temperature fuori range',
            },
            {
              key: 'expiry_alerts',
              label: 'Allerte scadenza',
              description: 'Notifiche per prodotti in scadenza',
            },
            {
              key: 'maintenance_reminders',
              label: 'Promemoria manutenzione',
              description: 'Ricordi per task di manutenzione programmati',
            },
            {
              key: 'certification_expiry',
              label: 'Scadenza certificazioni',
              description: 'Avvisi per certificazioni HACCP in scadenza',
            },
            {
              key: 'system_updates',
              label: 'Aggiornamenti sistema',
              description: 'Notifiche per aggiornamenti e nuove funzionalità',
            },
            {
              key: 'daily_summary',
              label: 'Riepilogo giornaliero',
              description: 'Sintesi delle attività della giornata',
            },
            {
              key: 'weekly_report',
              label: 'Report settimanale',
              description: 'Rapporto settimanale delle performance',
            },
          ].map(({ key, label, description }) => (
            <div key={key} className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={
                  formData.email_notifications?.[
                    key as keyof typeof formData.email_notifications
                  ] || false
                }
                onChange={e =>
                  handleInputChange(
                    `email_notifications.${key}`,
                    e.target.checked
                  )
                }
                disabled={!isEditing}
                className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-900">
                  {label}
                </label>
                <p className="text-sm text-gray-500">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Push Notifications */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Smartphone className="w-5 h-5 text-green-600" />
          <h4 className="font-medium text-gray-900">Notifiche Push</h4>
        </div>

        <div className="space-y-4">
          {[
            {
              key: 'temperature_violations',
              label: 'Violazioni di temperatura',
              description: 'Notifiche immediate per temperature critiche',
            },
            {
              key: 'expiry_alerts',
              label: 'Allerte scadenza',
              description: 'Push per prodotti in scadenza',
            },
            {
              key: 'maintenance_reminders',
              label: 'Promemoria manutenzione',
              description: 'Ricordi per task di manutenzione',
            },
            {
              key: 'certification_expiry',
              label: 'Scadenza certificazioni',
              description: 'Avvisi certificazioni HACCP',
            },
            {
              key: 'urgent_alerts',
              label: 'Allerte urgenti',
              description: 'Notifiche per situazioni critiche',
            },
          ].map(({ key, label, description }) => (
            <div key={key} className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={
                  formData.push_notifications?.[
                    key as keyof typeof formData.push_notifications
                  ] || false
                }
                onChange={e =>
                  handleInputChange(
                    `push_notifications.${key}`,
                    e.target.checked
                  )
                }
                disabled={!isEditing}
                className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-900">
                  {label}
                </label>
                <p className="text-sm text-gray-500">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notification Frequency */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-purple-600" />
          <h4 className="font-medium text-gray-900">Frequenza Notifiche</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Digest Email
            </label>
            <select
              value={formData.notification_frequency?.email_digest || 'daily'}
              onChange={e =>
                handleInputChange(
                  'notification_frequency.email_digest',
                  e.target.value
                )
              }
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="immediate">Immediato</option>
              <option value="hourly">Ogni ora</option>
              <option value="daily">Giornaliero</option>
              <option value="weekly">Settimanale</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frequenza Push
            </label>
            <select
              value={
                formData.notification_frequency?.push_frequency || 'immediate'
              }
              onChange={e =>
                handleInputChange(
                  'notification_frequency.push_frequency',
                  e.target.value
                )
              }
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="immediate">Immediato</option>
              <option value="batched">Raggruppato</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inizio ore silenziose
            </label>
            <input
              type="time"
              value={
                formData.notification_frequency?.quiet_hours_start || '22:00'
              }
              onChange={e =>
                handleInputChange(
                  'notification_frequency.quiet_hours_start',
                  e.target.value
                )
              }
              disabled={!isEditing}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors['notification_frequency.quiet_hours']
                  ? 'border-red-300'
                  : 'border-gray-300'
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fine ore silenziose
            </label>
            <input
              type="time"
              value={
                formData.notification_frequency?.quiet_hours_end || '07:00'
              }
              onChange={e =>
                handleInputChange(
                  'notification_frequency.quiet_hours_end',
                  e.target.value
                )
              }
              disabled={!isEditing}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors['notification_frequency.quiet_hours']
                  ? 'border-red-300'
                  : 'border-gray-300'
              }`}
            />
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={
                  formData.notification_frequency?.weekend_notifications ||
                  false
                }
                onChange={e =>
                  handleInputChange(
                    'notification_frequency.weekend_notifications',
                    e.target.checked
                  )
                }
                disabled={!isEditing}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Ricevi notifiche durante il weekend
              </span>
            </label>
          </div>
        </div>

        {errors['notification_frequency.quiet_hours'] && (
          <p className="mt-2 text-sm text-red-600">
            {errors['notification_frequency.quiet_hours']}
          </p>
        )}
      </div>

      {/* Alert Preferences */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          <h4 className="font-medium text-gray-900">Preferenze Allerte</h4>
        </div>

        <div className="space-y-4">
          {[
            {
              key: 'critical_alerts_only',
              label: 'Solo allerte critiche',
              description: 'Ricevi notifiche solo per situazioni critiche',
            },
            {
              key: 'include_photos',
              label: 'Includi foto',
              description: 'Allega foto di evidenza alle notifiche',
            },
            {
              key: 'include_location',
              label: 'Includi posizione',
              description: 'Aggiungi informazioni sulla posizione',
            },
            {
              key: 'escalation_enabled',
              label: 'Escalation abilitata',
              description:
                'Attiva escalation automatica per allerte non gestite',
            },
          ].map(({ key, label, description }) => (
            <div key={key} className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={
                  formData.alert_preferences?.[
                    key as keyof typeof formData.alert_preferences
                  ] || false
                }
                onChange={e =>
                  handleInputChange(
                    `alert_preferences.${key}`,
                    e.target.checked
                  )
                }
                disabled={!isEditing}
                className="mt-1 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-900">
                  {label}
                </label>
                <p className="text-sm text-gray-500">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Success Message */}
      {saveMutation.isSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm text-green-800">
                Preferenze notifiche salvate con successo.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="ml-3">
            <h4 className="font-medium text-blue-900 mb-1">
              Gestione Notifiche
            </h4>
            <p className="text-sm text-blue-800">
              Personalizza le tue preferenze di notifica per ricevere solo le
              informazioni che ti interessano. Le modifiche vengono applicate
              immediatamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
