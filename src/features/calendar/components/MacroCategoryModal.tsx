import React, { useState } from 'react'
import { X, Wrench, ClipboardList, Package, ChevronRight, Calendar, User, Clock, AlertCircle, Check } from 'lucide-react'
import type { MacroCategory, MacroCategoryItem } from '../hooks/useMacroCategoryEvents'
import { useGenericTasks } from '../hooks/useGenericTasks'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-toastify'

interface MacroCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  category: MacroCategory
  items: MacroCategoryItem[]
  date: Date
}

const categoryConfig = {
  maintenance: {
    icon: Wrench,
    label: 'Manutenzioni',
    color: 'blue',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    iconBgColor: 'bg-blue-100',
  },
  generic_tasks: {
    icon: ClipboardList,
    label: 'Mansioni/Attività Generiche',
    color: 'green',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-700',
    iconBgColor: 'bg-green-100',
  },
  product_expiry: {
    icon: Package,
    label: 'Scadenze Prodotti',
    color: 'orange',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-700',
    iconBgColor: 'bg-orange-100',
  },
}

const statusConfig = {
  pending: { label: 'In Attesa', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
  completed: { label: 'Completato', color: 'bg-green-100 text-green-800', icon: '✅' },
  overdue: { label: 'In Ritardo', color: 'bg-red-100 text-red-800', icon: '⚠️' },
}

const priorityConfig = {
  low: { label: 'Bassa', color: 'bg-gray-100 text-gray-800', icon: '🔵' },
  medium: { label: 'Media', color: 'bg-blue-100 text-blue-800', icon: '🟡' },
  high: { label: 'Alta', color: 'bg-orange-100 text-orange-800', icon: '🟠' },
  critical: { label: 'Critica', color: 'bg-red-100 text-red-800', icon: '🔴' },
}

export const MacroCategoryModal: React.FC<MacroCategoryModalProps> = ({
  isOpen,
  onClose,
  category,
  items,
  date,
}) => {
  const [selectedItem, setSelectedItem] = useState<MacroCategoryItem | null>(null)
  const { completeTask, isCompleting } = useGenericTasks()
  const queryClient = useQueryClient()
  const { companyId, user } = useAuth()
  const [isCompletingMaintenance, setIsCompletingMaintenance] = useState(false)

  const handleCompleteMaintenance = async (maintenanceId: string) => {
    if (!companyId || !user) {
      toast.error('Utente non autenticato')
      return
    }

    setIsCompletingMaintenance(true)
    try {
      // Aggiorna lo stato della manutenzione a 'completed'
      const { error } = await supabase
        .from('maintenance_tasks')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', maintenanceId)
        .eq('company_id', companyId)

      if (error) throw error

      // Invalida le query per ricaricare
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
      queryClient.invalidateQueries({ queryKey: ['maintenance-tasks'] })

      toast.success('Manutenzione completata')
      setSelectedItem(null)
    } catch (error) {
      console.error('Error completing maintenance:', error)
      toast.error('Errore nel completamento della manutenzione')
    } finally {
      setIsCompletingMaintenance(false)
    }
  }
  const config = categoryConfig[category]
  const Icon = config.icon

  if (!isOpen) return null

  const handleItemClick = (item: MacroCategoryItem) => {
    setSelectedItem(selectedItem?.id === item.id ? null : item)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      <div className="absolute right-0 top-0 bottom-0 w-full max-w-3xl bg-white shadow-2xl overflow-hidden flex flex-col">
        <div className={`${config.bgColor} border-b ${config.borderColor} p-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`p-3 ${config.iconBgColor} rounded-lg`}>
                <Icon className={`h-6 w-6 ${config.textColor}`} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{config.label}</h2>
                <p className="text-sm text-gray-600">
                  {date.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <div className={`px-4 py-2 ${config.iconBgColor} rounded-lg`}>
              <span className="text-sm font-medium text-gray-700">
                Totale: <span className={`font-bold ${config.textColor}`}>{items.length}</span>
              </span>
            </div>
            <div className="px-4 py-2 bg-red-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">
                In Ritardo: <span className="font-bold text-red-700">
                  {items.filter(i => i.status === 'overdue').length}
                </span>
              </span>
            </div>
            <div className="px-4 py-2 bg-yellow-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">
                In Attesa: <span className="font-bold text-yellow-700">
                  {items.filter(i => i.status === 'pending').length}
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <Icon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nessuna attività per questa data</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                  <div
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {item.title}
                          </h3>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig[item.status].color}`}>
                            {statusConfig[item.status].icon} {statusConfig[item.status].label}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityConfig[item.priority].color}`}>
                            {priorityConfig[item.priority].icon} {priorityConfig[item.priority].label}
                          </span>
                        </div>

                        {item.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {item.description}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          {item.frequency && (
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span className="font-medium">Frequenza:</span>
                              <span className="capitalize">{item.frequency}</span>
                            </div>
                          )}

                          {(item.assignedTo || item.assignedToRole || item.assignedToCategory) && (
                            <div className="flex items-center space-x-1">
                              <User className="h-4 w-4" />
                              <span className="font-medium">Assegnato a:</span>
                              <span>
                                {item.assignedToStaffId ? 'Dipendente specifico' :
                                 item.assignedToRole ? item.assignedToRole :
                                 item.assignedToCategory ? item.assignedToCategory :
                                 item.assignedTo || 'Non assegnato'}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span className="font-medium">Scadenza:</span>
                            <span>
                              {item.dueDate.toLocaleDateString('it-IT', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <ChevronRight
                        className={`h-5 w-5 text-gray-400 transition-transform flex-shrink-0 ml-4 ${
                          selectedItem?.id === item.id ? 'rotate-90' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {selectedItem?.id === item.id && (
                    <div className="border-t border-gray-200 bg-gray-50 p-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Dettagli Completi
                      </h4>

                      <div className="space-y-3 text-sm">
                        {item.metadata.notes && (
                          <div>
                            <span className="font-medium text-gray-700">Note:</span>
                            <p className="text-gray-600 mt-1 whitespace-pre-wrap">
                              {item.metadata.notes}
                            </p>
                          </div>
                        )}

                        {item.metadata.estimatedDuration && (
                          <div>
                            <span className="font-medium text-gray-700">Durata Stimata:</span>
                            <p className="text-gray-600 mt-1">
                              {item.metadata.estimatedDuration} minuti
                            </p>
                          </div>
                        )}

                        {category === 'maintenance' && item.metadata.conservationPointId && (
                          <div>
                            <span className="font-medium text-gray-700">Punto di Conservazione:</span>
                            <p className="text-gray-600 mt-1">
                              ID: {item.metadata.conservationPointId}
                            </p>
                          </div>
                        )}

                        {category === 'maintenance' && item.metadata.instructions && Array.isArray(item.metadata.instructions) && (
                          <div>
                            <span className="font-medium text-gray-700">Istruzioni:</span>
                            <ul className="list-disc list-inside text-gray-600 mt-1 space-y-1">
                              {item.metadata.instructions.map((instruction, idx) => (
                                <li key={idx}>{instruction}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {category === 'product_expiry' && (
                          <>
                            {item.metadata.quantity && (
                              <div>
                                <span className="font-medium text-gray-700">Quantità:</span>
                                <p className="text-gray-600 mt-1">
                                  {item.metadata.quantity} {item.metadata.unit || ''}
                                </p>
                              </div>
                            )}

                            {item.metadata.supplierName && (
                              <div>
                                <span className="font-medium text-gray-700">Fornitore:</span>
                                <p className="text-gray-600 mt-1">
                                  {item.metadata.supplierName}
                                </p>
                              </div>
                            )}

                            {item.metadata.barcode && (
                              <div>
                                <span className="font-medium text-gray-700">Barcode:</span>
                                <p className="text-gray-600 mt-1 font-mono">
                                  {item.metadata.barcode}
                                </p>
                              </div>
                            )}

                            {item.metadata.sku && (
                              <div>
                                <span className="font-medium text-gray-700">SKU:</span>
                                <p className="text-gray-600 mt-1 font-mono">
                                  {item.metadata.sku}
                                </p>
                              </div>
                            )}
                          </>
                        )}

                        <div className="pt-3 border-t border-gray-200">
                          <span className="font-medium text-gray-700">ID Attività:</span>
                          <p className="text-gray-600 mt-1 font-mono text-xs">
                            {item.id}
                          </p>
                        </div>

                        {/* Pulsante Completa per mansioni e manutenzioni */}
                        {(category === 'generic_tasks' || category === 'maintenance') && (
                          <div className="pt-4 border-t border-gray-200 mt-4">
                            <button
                              onClick={() => {
                                if (category === 'maintenance') {
                                  handleCompleteMaintenance(item.id)
                                } else {
                                  completeTask(
                                    { taskId: item.id },
                                    {
                                      onSuccess: () => {
                                        // Invalida tutte le query per ricaricare i dati
                                        queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
                                        queryClient.invalidateQueries({ queryKey: ['generic-tasks'] })
                                        queryClient.invalidateQueries({ queryKey: ['task-completions'] })

                                        // Chiudi il dettaglio dopo il completamento
                                        setSelectedItem(null)
                                      },
                                    }
                                  )
                                }
                              }}
                              disabled={isCompleting || isCompletingMaintenance}
                              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Check className="w-5 h-5" />
                              {(isCompleting || isCompletingMaintenance) ? 'Completando...' : category === 'maintenance' ? 'Completa Manutenzione' : 'Completa Mansione'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MacroCategoryModal
