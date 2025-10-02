import { useState, useEffect } from 'react'
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  FileText,
  Calendar,
} from 'lucide-react'
import type {
  BusinessInfoData,
  BusinessInfoStepProps,
} from '@/types/onboarding'

const BUSINESS_TYPES = [
  'ristorante',
  'bar',
  'pizzeria',
  'trattoria',
  'osteria',
  'enoteca',
  'birreria',
  'altro',
]

const BusinessInfoStep = ({
  data,
  onUpdate,
  onValidChange,
}: BusinessInfoStepProps) => {
  const formData: BusinessInfoData = {
    name: '',
    address: '',
    phone: '',
    email: '',
    vat_number: '',
    business_type: '',
    established_date: '',
    license_number: '',
    ...data,
  }

  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateField = (field: keyof BusinessInfoData, value: string) => {
    onUpdate({
      ...formData,
      [field]: value,
    })
  }

  useEffect(() => {
    const dataToValidate = formData
    const newErrors: Record<string, string> = {}

    // Campo obbligatorio: nome azienda
    if (!dataToValidate.name.trim()) {
      newErrors.name = "Il nome dell'azienda è obbligatorio"
    } else if (dataToValidate.name.trim().length < 2) {
      newErrors.name = 'Il nome deve essere di almeno 2 caratteri'
    }

    // Campo obbligatorio: indirizzo
    if (!dataToValidate.address.trim()) {
      newErrors.address = "L'indirizzo è obbligatorio"
    }

    // Validazione email (se presente)
    if (
      dataToValidate.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dataToValidate.email)
    ) {
      newErrors.email = 'Inserisci un indirizzo email valido'
    }

    // Validazione telefono (se presente)
    if (
      dataToValidate.phone &&
      !/^[+]?[0-9\s\-()]+$/.test(dataToValidate.phone)
    ) {
      newErrors.phone = 'Inserisci un numero di telefono valido'
    }

    // Validazione P.IVA (se presente)
    if (
      dataToValidate.vat_number &&
      !/^IT[0-9]{11}$/.test(dataToValidate.vat_number.replace(/\s/g, ''))
    ) {
      newErrors.vat_number =
        'Inserisci una Partita IVA valida (es: IT12345678901)'
    }

    setErrors(newErrors)
    onValidChange(
      Object.keys(newErrors).length === 0 &&
        !!dataToValidate.name.trim() &&
        !!dataToValidate.address.trim()
    )
  }, [formData, onValidChange])

  const handleInputChange = (field: keyof BusinessInfoData, value: string) => {
    updateField(field, value)
  }

  const prefillSampleData = () => {
    onUpdate({
      name: 'Al Ritrovo SRL',
      address: 'Via Roma 123, 40121 Bologna BO',
      phone: '+39 051 1234567',
      email: 'info@alritrovo.it',
      vat_number: 'IT01234567890',
      business_type: 'ristorante',
      established_date: '2020-01-15',
      license_number: 'RIS-2020-001',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Informazioni Aziendali
        </h2>
        <p className="text-gray-600">
          Inserisci i dati principali della tua azienda per configurare il
          sistema HACCP
        </p>
      </div>

      {/* Quick Fill Button */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={prefillSampleData}
          className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          🚀 Compila con dati di esempio
        </button>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nome Azienda */}
        <div className="md:col-span-2">
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <Building2 className="w-4 h-4 mr-2" />
            Nome Azienda *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={e => handleInputChange('name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Inserisci il nome della tua azienda"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Tipo di Attività */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4 mr-2" />
            Tipo di Attività
          </label>
          <select
            value={formData.business_type}
            onChange={e => handleInputChange('business_type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleziona tipo di attività</option>
            {BUSINESS_TYPES.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Data di Apertura */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 mr-2" />
            Data di Apertura
          </label>
          <input
            type="date"
            value={formData.established_date}
            onChange={e =>
              handleInputChange('established_date', e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Indirizzo */}
        <div className="md:col-span-2">
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 mr-2" />
            Indirizzo *
          </label>
          <textarea
            value={formData.address}
            onChange={e => handleInputChange('address', e.target.value)}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.address ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Inserisci l'indirizzo completo dell'azienda"
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address}</p>
          )}
        </div>

        {/* Telefono */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <Phone className="w-4 h-4 mr-2" />
            Telefono
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={e => handleInputChange('phone', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.phone ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="+39 051 1234567"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <Mail className="w-4 h-4 mr-2" />
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={e => handleInputChange('email', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="info@azienda.it"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Partita IVA */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4 mr-2" />
            Partita IVA
          </label>
          <input
            type="text"
            value={formData.vat_number}
            onChange={e => handleInputChange('vat_number', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.vat_number ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="IT12345678901"
          />
          {errors.vat_number && (
            <p className="mt-1 text-sm text-red-600">{errors.vat_number}</p>
          )}
        </div>

        {/* Numero Licenza */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4 mr-2" />
            Numero Licenza
          </label>
          <input
            type="text"
            value={formData.license_number}
            onChange={e => handleInputChange('license_number', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="RIS-2024-001"
          />
        </div>
      </div>

      {/* HACCP Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">ℹ️ Conformità HACCP</h3>
        <p className="text-sm text-blue-700">
          Le informazioni inserite verranno utilizzate per configurare il
          sistema HACCP in conformità alle normative vigenti. I campi
          obbligatori sono necessari per garantire la tracciabilità e la
          compliance.
        </p>
      </div>
    </div>
  )
}

export default BusinessInfoStep
