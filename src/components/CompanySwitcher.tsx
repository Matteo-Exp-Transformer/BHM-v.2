/**
 * 🏢 CompanySwitcher - Selettore Azienda Multi-Tenant
 * 
 * Component per cambiare azienda attiva quando l'utente
 * è membro di più aziende
 * 
 * @date 2025-01-09
 */

// LOCKED: CompanySwitcher.tsx - 3 test passati, cambio azienda verificato
// Data: 2025-01-16
// Responsabile: Agente 5 - Navigazione e Routing
// Modifiche richiedono unlock manuale e re-test completo

import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Building2, ChevronDown, Check } from 'lucide-react'

const CompanySwitcher: React.FC = () => {
  const { companies, activeCompanyId, switchCompany, isSwitchingCompany } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Chiudi dropdown quando clicchi fuori
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Se utente ha una sola azienda, non mostrare switcher
  if (companies.length <= 1) {
    const company = companies[0]
    if (!company) return null

    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
        <Building2 size={16} className="text-blue-600" />
        <span className="text-sm font-medium text-blue-900 truncate max-w-[150px]">
          {company.company_name}
        </span>
      </div>
    )
  }

  // Azienda attiva
  const activeCompany = companies.find(c => c.company_id === activeCompanyId)

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isSwitchingCompany}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Building2 size={16} className="text-gray-600" />
        <span className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
          {activeCompany?.company_name || 'Seleziona azienda'}
        </span>
        <ChevronDown 
          size={14} 
          className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="py-1">
            {/* Header */}
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Le Tue Aziende ({companies.length})
              </p>
            </div>

            {/* Company List */}
            <div className="max-h-[300px] overflow-y-auto">
              {companies.map((company) => {
                const isActive = company.company_id === activeCompanyId
                
                return (
                  <button
                    key={company.company_id}
                    onClick={() => {
                      if (!isActive) {
                        switchCompany(company.company_id)
                        setIsOpen(false)
                      }
                    }}
                    disabled={isSwitchingCompany || isActive}
                    className={`w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors disabled:cursor-not-allowed ${
                      isActive ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        <Building2 
                          size={18} 
                          className={isActive ? 'text-blue-600' : 'text-gray-600'}
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0 text-left">
                        <p className={`text-sm font-medium truncate ${
                          isActive ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          {company.company_name}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {company.role === 'admin' ? 'Amministratore' :
                           company.role === 'responsabile' ? 'Responsabile' :
                           company.role === 'dipendente' ? 'Dipendente' :
                           company.role}
                        </p>
                      </div>
                    </div>

                    {isActive && (
                      <Check size={18} className="text-blue-600 flex-shrink-0" />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-500">
                💡 Cambia azienda per gestire dati di un'altra organizzazione
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isSwitchingCompany && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
          <svg className="animate-spin h-5 w-5 text-blue-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      )}
    </div>
  )
}

export default CompanySwitcher

