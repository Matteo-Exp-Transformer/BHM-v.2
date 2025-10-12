import React, { useState } from 'react'
import { X, Wrench, ClipboardList, Package, ChevronRight, Calendar, User, Clock, AlertCircle, Check, RotateCcw, AlertTriangle } from 'lucide-react'
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
  const [selectedItems, setSelectedItems] = useState<string[]>([]) // Array di ID per toggle indipendente
  const { completeTask, uncompleteTask, isCompleting, isUncompleting } = useGenericTasks()
  const queryClient = useQueryClient()
  const { companyId, user } = useAuth()
  const [isCompletingMaintenance, setIsCompletingMaintenance] = useState(false)
  
  // Helper per verificare se un item è selezionato
  const isItemSelected = (itemId: string) => selectedItems.includes(itemId)


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
      await queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
      await queryClient.invalidateQueries({ queryKey: ['maintenance-tasks', companyId] })
      await queryClient.invalidateQueries({ queryKey: ['macro-category-events'] })

      toast.success('Manutenzione completata')
      setSelectedItems([]) // Chiudi tutti gli item aperti
      // Non serve più window.location.reload() - React Query gestisce l'aggiornamento
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
    // Toggle indipendente: se è già aperto lo chiude, altrimenti lo apre
    setSelectedItems(prev => 
      prev.includes(item.id) 
        ? prev.filter(id => id !== item.id) // Rimuovi se già presente
        : [...prev, item.id] // Aggiungi se non presente
    )
  }

  // Separa gli items in attivi e completati
  const activeItems = items.filter(i => i.status !== 'completed')
  const completedItems = items.filter(i => i.status === 'completed')

  // Calcola le date per determinare "in ritardo"
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const selectedDate = new Date(date)
  selectedDate.setHours(0, 0, 0, 0)
  
  // Data 1 settimana fa (7 giorni prima di oggi)
  const oneWeekAgo = new Date(now)
  oneWeekAgo.setDate(now.getDate() - 7)
  
  // Ieri (1 giorno prima di oggi)
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)

  // Attività in ritardo: non completate, da 1 settimana fa fino a ieri (escluso oggi)
  const overdueItems = items.filter(i => {
    if (i.status === 'completed') return false
    const itemDate = new Date(i.dueDate)
    itemDate.setHours(0, 0, 0, 0)
    // In ritardo se: data >= 1 settimana fa E data <= ieri (quindi < oggi)
    return itemDate >= oneWeekAgo && itemDate < now
  })
  
  const shouldShowOverdue = overdueItems.length > 0

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
                Attive: <span className={`font-bold ${config.textColor}`}>{activeItems.length}</span>
              </span>
            </div>
            {shouldShowOverdue && (
              <div className="px-4 py-2 bg-red-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">
                  In Ritardo: <span className="font-bold text-red-700">
                    {overdueItems.length}
                  </span>
                </span>
              </div>
            )}
            <div className="px-4 py-2 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">
                Completate: <span className="font-bold text-green-700">
                  {completedItems.length}
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
            <>
              {/* Sezione Attività Attive */}
              {activeItems.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center px-4">
                    <Clock className="h-5 w-5 mr-2" />
                    {category === 'maintenance' ? 'Manutenzioni Attive' : 'Mansioni/Attività Attive'}
                  </h3>
                  <div className="space-y-4">
                    {activeItems.map((item) => (
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
                          isItemSelected(item.id) ? 'rotate-90' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {isItemSelected(item.id) && (
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
                          <div className="pt-4 border-t-2 border-green-400 mt-4 bg-green-50 p-4 rounded-lg">
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()

                                if (category === 'maintenance') {
                                  handleCompleteMaintenance(item.id)
                                } else {
                                  // Permetti completamento fino a 1 giorno prima della scadenza
                                  const today = new Date()
                                  today.setHours(0, 0, 0, 0)
                                  
                                  const taskDate = new Date(item.dueDate)
                                  taskDate.setHours(0, 0, 0, 0)

                                  // Blocca solo se la mansione è più di 1 giorno nel futuro
                                  const daysDiff = Math.floor((taskDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                                  
                                  if (daysDiff > 1) {
                                    const taskDateStr = taskDate.toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })
                                    toast.warning(`⚠️ Puoi completare mansioni fino a 1 giorno prima!\nQuesta mansione è del ${taskDateStr}.`, {
                                      autoClose: 5000
                                    })
                                    return
                                  }

                                  const taskId = item.metadata.taskId || item.id
                                  completeTask(
                                    { taskId: taskId },
                                    {
                                      onSuccess: async () => {
                                        await queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
                                        await queryClient.invalidateQueries({ queryKey: ['generic-tasks'] })
                                        await queryClient.invalidateQueries({ queryKey: ['task-completions', companyId] })
                                        await queryClient.invalidateQueries({ queryKey: ['macro-category-events'] })

                                        toast.success('Mansione completata!')
                                        setSelectedItems([]) // Chiudi tutti gli item aperti
                                        
                                        // Chiudi e riapri il pannello per mostrare le modifiche
                                        onClose()
                                      },
                                      onError: (error) => {
                                        console.error('Error completing task:', error)
                                        toast.error('Errore nel completamento')
                                      }
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
                </div>
              )}

              {/* Sezione Attività in Ritardo */}
              {overdueItems.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center px-4">
                    <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                    {category === 'maintenance' ? 'Manutenzioni in Ritardo' : 'Mansioni/Attività in Ritardo'}
                    <span className="ml-2 text-sm text-red-600">
                      (da 1 settimana fa fino a ieri)
                    </span>
                  </h3>
                  <div className="space-y-4">
                    {overdueItems.map((item) => (
                      <div key={item.id} className="bg-red-50 border-2 border-red-300 rounded-lg shadow-md overflow-hidden">
                        <div
                          className="p-4 hover:bg-red-100 cursor-pointer transition-colors"
                          onClick={() => handleItemClick(item)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                  ⚠️ {item.title}
                                </h3>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-200 text-red-800">
                                  IN RITARDO
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
                                  <span className="text-red-700 font-semibold">
                                    {item.dueDate.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${isItemSelected(item.id) ? 'rotate-90' : ''}`} />
                          </div>
                        </div>

                        {isItemSelected(item.id) && (
                          <div className="border-t-2 border-red-300 bg-red-50 p-4">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                              <AlertCircle className="h-4 w-4 mr-2" />
                              Dettagli
                            </h4>
                            <div className="space-y-3 text-sm">
                              <div>
                                <span className="font-medium text-gray-700">Descrizione completa:</span>
                                <p className="text-gray-600 mt-1 whitespace-pre-wrap">
                                  {item.description || 'Nessuna descrizione'}
                                </p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">ID Attività:</span>
                                <p className="text-gray-600 mt-1 font-mono text-xs">
                                  {item.id}
                                </p>
                              </div>
                            </div>

                            {/* Pulsante Completa per mansioni in ritardo */}
                            {(category === 'generic_tasks' || category === 'maintenance') && (
                              <div className="pt-4 border-t-2 border-red-400 mt-4 bg-red-100 p-4 rounded-lg">
                                <p className="text-xs text-red-800 mb-3 text-center font-medium">
                                  ⚠️ Questa attività è in ritardo. Completala al più presto!
                                </p>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()

                                    if (category === 'maintenance') {
                                      handleCompleteMaintenance(item.id)
                                    } else {
                                      // Permetti completamento fino a 1 giorno prima della scadenza
                                      const today = new Date()
                                      today.setHours(0, 0, 0, 0)
                                      
                                      const taskDate = new Date(item.dueDate)
                                      taskDate.setHours(0, 0, 0, 0)

                                      // Blocca solo se la mansione è più di 1 giorno nel futuro
                                      const daysDiff = Math.floor((taskDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                                      
                                      if (daysDiff > 1) {
                                        const taskDateStr = taskDate.toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })
                                        toast.warning(`⚠️ Puoi completare mansioni fino a 1 giorno prima!\nQuesta mansione è del ${taskDateStr}.`, {
                                          autoClose: 5000
                                        })
                                        return
                                      }

                                      const taskId = item.metadata.taskId || item.id
                                      completeTask(
                                        { taskId: taskId },
                                        {
                                          onSuccess: async () => {
                                            await queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
                                            await queryClient.invalidateQueries({ queryKey: ['generic-tasks'] })
                                            await queryClient.invalidateQueries({ queryKey: ['task-completions', companyId] })
                                            await queryClient.invalidateQueries({ queryKey: ['macro-category-events'] })

                                            toast.success('Mansione completata!')
                                            setSelectedItems([]) // Chiudi tutti gli item aperti
                                            
                                            // Chiudi e riapri il pannello per mostrare le modifiche
                                            onClose()
                                          },
                                          onError: (error) => {
                                            console.error('Error completing task:', error)
                                            toast.error('Errore nel completamento')
                                          }
                                        }
                                      )
                                    }
                                  }}
                                  disabled={isCompleting || isCompletingMaintenance}
                                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Check className="w-5 h-5" />
                                  {(isCompleting || isCompletingMaintenance) ? 'Completando...' : category === 'maintenance' ? 'Completa Manutenzione' : 'Completa Mansione in Ritardo'}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sezione Attività Completate */}
              {completedItems.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center px-4">
                    <Check className="h-5 w-5 mr-2 text-green-600" />
                    {category === 'maintenance' ? 'Manutenzioni Completate' : 'Mansioni/Attività Completate'}
                  </h3>
                  <div className="space-y-4">
                    {completedItems.map((item) => (
                      <div key={item.id} className="bg-green-50 border border-green-200 rounded-lg shadow-sm overflow-hidden opacity-75">
                        <div
                          className="p-4 hover:bg-green-100 cursor-pointer transition-colors"
                          onClick={() => handleItemClick(item)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                ✅ {item.title}
                              </h3>
                            </div>
                          </div>
                        </div>

                        {isItemSelected(item.id) && (
                          <div className="border-t border-green-200 bg-green-50 p-4">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                              <AlertCircle className="h-4 w-4 mr-2" />
                              Dettagli
                            </h4>
                            <div className="space-y-3 text-sm">
                              {/* Informazioni di completamento */}
                              {item.metadata.completedAt && (
                                <div className="bg-green-100 p-3 rounded-lg border border-green-300">
                                  <h5 className="font-semibold text-green-900 mb-2 flex items-center">
                                    <Check className="h-4 w-4 mr-2" />
                                    Log Completamento
                                  </h5>
                                  <div className="space-y-1 text-xs text-green-800">
                                    <div className="flex items-center">
                                      <Clock className="h-3 w-3 mr-1" />
                                      <span className="font-medium">Completata il:</span>
                                      <span className="ml-1">
                                        {new Date(item.metadata.completedAt).toLocaleString('it-IT', {
                                          day: '2-digit',
                                          month: 'long',
                                          year: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </span>
                                    </div>
                                    {(item.metadata.completedBy || item.metadata.completedByName) && (
                                      <div className="flex items-center">
                                        <User className="h-3 w-3 mr-1" />
                                        <span className="font-medium">Completata da:</span>
                                        <span className="ml-1">
                                          {item.metadata.completedByName || 
                                           (item.metadata.completedBy ? `ID: ${item.metadata.completedBy.substring(0, 8)}...` : 'Sconosciuto')}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Note completamento */}
                              {item.metadata.completionNotes && (
                                <div>
                                  <span className="font-medium text-gray-700">Note completamento:</span>
                                  <p className="text-gray-600 mt-1 whitespace-pre-wrap bg-gray-50 p-2 rounded">
                                    {item.metadata.completionNotes}
                                  </p>
                                </div>
                              )}

                              {/* Note task */}
                              {item.metadata.notes && (
                                <div>
                                  <span className="font-medium text-gray-700">Descrizione task:</span>
                                  <p className="text-gray-600 mt-1 whitespace-pre-wrap">
                                    {item.metadata.notes}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Pulsante Ripristina per mansioni completate - SOLO per chi ha completato */}
                            {category === 'generic_tasks' && (() => {
                              const canUncomplete = item.metadata.completedBy === user?.id
                              
                              // Mostra la sezione SOLO se l'utente può ripristinare
                              if (!canUncomplete) {
                                return null
                              }
                              
                              return (
                                <div className="pt-4 border-t-2 border-yellow-400 mt-4 bg-yellow-50 p-4 rounded-lg">
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()

                                      const taskId = item.metadata.taskId || item.id
                                      uncompleteTask(
                                        { taskId: taskId },
                                        {
                                          onSuccess: async () => {
                                            await queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
                                            await queryClient.invalidateQueries({ queryKey: ['generic-tasks'] })
                                            await queryClient.invalidateQueries({ queryKey: ['task-completions', companyId] })
                                            await queryClient.invalidateQueries({ queryKey: ['macro-category-events'] })
                                            setSelectedItems([]) // Chiudi tutti gli item aperti
                                            
                                            // Chiudi e riapri il pannello per mostrare le modifiche
                                            onClose()
                                          },
                                          onError: (error) => {
                                            console.error('Error uncompleting task:', error)
                                          }
                                        }
                                      )
                                    }}
                                    disabled={isUncompleting}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <RotateCcw className="w-5 h-5" />
                                    {isUncompleting ? 'Ripristinando...' : 'Ripristina come "Da Completare"'}
                                  </button>
                                  <p className="text-xs text-gray-600 mt-2 text-center">
                                    ⚠️ Questo annullerà il completamento della mansione
                                  </p>
                                </div>
                              )
                            })()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default MacroCategoryModal
