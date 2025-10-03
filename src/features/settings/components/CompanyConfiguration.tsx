import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Building2, MapPin, Phone, Mail, Save, AlertCircle } from 'lucide-react'

interface Company {
  id: string
  name: string
  address: string
  phone: string
  email: string
  vat_number: string
  business_type: string
  established_date: string
  license_number: string
  created_at: string
  updated_at: string
}

export function CompanyConfiguration() {
  const { companyId } = useAuth()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<Company>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch company data
  const {
    data: company,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['company', companyId],
    queryFn: async () => {
      if (!companyId) return null

      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single()

      if (error) throw error
      return data as Company
    },
    enabled: !!companyId,
  })

  // Update company mutation
  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<Company>) => {
      if (!companyId) throw new Error('Company ID not found')

      const { error } = await supabase
        .from('companies')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', companyId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company', companyId] })
      setIsEditing(false)
      setErrors({})
    },
    onError: error => {
      console.error('Error updating company:', error)
      setErrors({ general: 'Errore durante il salvataggio delle modifiche' })
    },
  })

  // Initialize form data when company data loads
  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        address: company.address || '',
        phone: company.phone || '',
        email: company.email || '',
        vat_number: company.vat_number || '',
        business_type: company.business_type || '',
        established_date: company.established_date || '',
        license_number: company.license_number || '',
      })
    }
  }, [company])

  const handleInputChange = (field: keyof Company, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name?.trim()) {
      newErrors.name = "Il nome dell'azienda è obbligatorio"
    }

    if (!formData.address?.trim()) {
      newErrors.address = "L'indirizzo è obbligatorio"
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Inserisci un indirizzo email valido'
    }

    if (formData.phone && !/^[+]?[0-9\s\-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Inserisci un numero di telefono valido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    try {
      await updateMutation.mutateAsync(formData)
    } catch (error) {
      console.error('Save failed:', error)
    }
  }

  const handleCancel = () => {
    if (company) {
      setFormData({
        name: company.name || '',
        address: company.address || '',
        phone: company.phone || '',
        email: company.email || '',
        vat_number: company.vat_number || '',
        business_type: company.business_type || '',
        established_date: company.established_date || '',
        license_number: company.license_number || '',
      })
    }
    setIsEditing(false)
    setErrors({})
  }

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Errore nel caricamento
        </h3>
        <p className="text-gray-600">
          Non è stato possibile caricare i dati dell'azienda.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Informazioni Aziendali
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
                disabled={updateMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {updateMutation.isPending ? (
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
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{errors.general}</p>
            </div>
          </div>
        </div>
      )}

      {/* Form Fields */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Company Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome Azienda *
          </label>
          {isEditing ? (
            <input
              type="text"
              value={formData.name || ''}
              onChange={e => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Inserisci il nome dell'azienda"
            />
          ) : (
            <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
              <Building2 className="w-4 h-4 text-gray-500" />
              <span className="text-gray-900">
                {company?.name || 'Non specificato'}
              </span>
            </div>
          )}
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Business Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo di Attività
          </label>
          {isEditing ? (
            <select
              value={formData.business_type || ''}
              onChange={e => handleInputChange('business_type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleziona tipo di attività</option>
              <option value="ristorante">Ristorante</option>
              <option value="bar">Bar</option>
              <option value="pizzeria">Pizzeria</option>
              <option value="trattoria">Trattoria</option>
              <option value="osteria">Osteria</option>
              <option value="enoteca">Enoteca</option>
              <option value="birreria">Birreria</option>
              <option value="altro">Altro</option>
            </select>
          ) : (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
              <span className="text-gray-900">
                {company?.business_type || 'Non specificato'}
              </span>
            </div>
          )}
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Indirizzo *
          </label>
          {isEditing ? (
            <textarea
              value={formData.address || ''}
              onChange={e => handleInputChange('address', e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.address ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Inserisci l'indirizzo completo"
            />
          ) : (
            <div className="flex items-start gap-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
              <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
              <span className="text-gray-900">
                {company?.address || 'Non specificato'}
              </span>
            </div>
          )}
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Telefono
          </label>
          {isEditing ? (
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={e => handleInputChange('phone', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.phone ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="+39 051 1234567"
            />
          ) : (
            <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
              <Phone className="w-4 h-4 text-gray-500" />
              <span className="text-gray-900">
                {company?.phone || 'Non specificato'}
              </span>
            </div>
          )}
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          {isEditing ? (
            <input
              type="email"
              value={formData.email || ''}
              onChange={e => handleInputChange('email', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="info@azienda.it"
            />
          ) : (
            <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
              <Mail className="w-4 h-4 text-gray-500" />
              <span className="text-gray-900">
                {company?.email || 'Non specificato'}
              </span>
            </div>
          )}
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* VAT Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Partita IVA
          </label>
          {isEditing ? (
            <input
              type="text"
              value={formData.vat_number || ''}
              onChange={e => handleInputChange('vat_number', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="IT12345678901"
            />
          ) : (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
              <span className="text-gray-900">
                {company?.vat_number || 'Non specificato'}
              </span>
            </div>
          )}
        </div>

        {/* License Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Numero Licenza
          </label>
          {isEditing ? (
            <input
              type="text"
              value={formData.license_number || ''}
              onChange={e =>
                handleInputChange('license_number', e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="LIC-2024-001"
            />
          ) : (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
              <span className="text-gray-900">
                {company?.license_number || 'Non specificato'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Success Message */}
      {updateMutation.isSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5 text-green-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-800">
                Informazioni aziendali aggiornate con successo.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
