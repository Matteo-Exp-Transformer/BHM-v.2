import { useState } from 'react'
import { ShoppingCart, Plus, FileText, Clock, CheckCircle } from 'lucide-react'
import {
  CollapsibleCard,
  CardActionButton,
} from '@/components/ui/CollapsibleCard'
import useShoppingLists, { ShoppingList } from '../hooks/useShoppingLists'
import { ShoppingListCard } from './ShoppingListCard'
import { CreateListModal } from './CreateListModal'
import { ProductSelector } from './ProductSelector'

export const ShoppingListManager = () => {
  const {
    shoppingLists,
    templates,
    stats,
    isLoading,
    createShoppingList,
    createFromTemplate,
    deleteShoppingList,
  } = useShoppingLists()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<ShoppingList | null>(
    null
  )

  const handleCreateNew = () => {
    setSelectedTemplate(null)
    setShowCreateModal(true)
  }

  const handleCreateFromTemplate = (template: ShoppingList) => {
    setSelectedTemplate(template)
    setShowCreateModal(true)
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
    setSelectedTemplate(null)
  }

  const handleSubmit = (input: any) => {
    if (selectedTemplate) {
      createFromTemplate(
        {
          templateId: selectedTemplate.id,
          name: input.name,
          description: input.description,
        },
        {
          onSuccess: () => {
            handleCloseModal()
          },
        }
      )
    } else {
      createShoppingList(input, {
        onSuccess: () => {
          handleCloseModal()
        },
      })
    }
  }

  const handleDelete = (listId: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questa lista?')) {
      deleteShoppingList(listId)
    }
  }

  // Separate active and completed lists
  const activeLists = shoppingLists.filter(list => !list.is_completed)
  const completedLists = shoppingLists.filter(list => list.is_completed)

  // Card actions
  const cardActions = (
    <>
      <CardActionButton
        icon={Plus}
        label="Nuova Lista"
        onClick={handleCreateNew}
        variant="primary"
      />
      <CardActionButton
        icon={FileText}
        label="Da Template"
        onClick={() => setShowCreateModal(true)}
        variant="default"
      />
    </>
  )

  return (
    <>
      <CollapsibleCard
        title="Liste della Spesa"
        icon={ShoppingCart}
        counter={stats.total}
        actions={cardActions}
        loading={isLoading}
        error={null}
        showEmpty={!isLoading && shoppingLists.length === 0}
        emptyMessage="Nessuna lista della spesa creata. Crea la tua prima lista per iniziare."
        className="mb-6"
      >
        {!isLoading && shoppingLists.length > 0 && (
          <div className="p-4">
            {/* Stats */}
            <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </div>
                <div className="text-sm text-gray-500">Totale Liste</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.active}
                </div>
                <div className="text-sm text-gray-500">Attive</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats.completed}
                </div>
                <div className="text-sm text-gray-500">Completate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {stats.templates}
                </div>
                <div className="text-sm text-gray-500">Template</div>
              </div>
            </div>

            {/* Progress Overview */}
            {stats.totalItems > 0 && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Progresso Generale
                </h4>
                <div className="flex items-center space-x-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(stats.completedItems / stats.totalItems) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    {stats.completedItems}/{stats.totalItems} prodotti
                  </span>
                </div>
              </div>
            )}

            {/* Active Lists */}
            {activeLists.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-3">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <h3 className="text-sm font-medium text-gray-700">
                    Liste Attive ({activeLists.length})
                  </h3>
                </div>
                <div className="space-y-3">
                  {activeLists.map(list => (
                    <ShoppingListCard
                      key={list.id}
                      list={list}
                      onEdit={() => {}}
                      onDelete={() => handleDelete(list.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Lists */}
            {completedLists.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-3">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <h3 className="text-sm font-medium text-gray-700">
                    Liste Completate ({completedLists.length})
                  </h3>
                </div>
                <div className="space-y-3">
                  {completedLists.map(list => (
                    <ShoppingListCard
                      key={list.id}
                      list={list}
                      onEdit={() => {}}
                      onDelete={() => handleDelete(list.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Templates */}
            {templates.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-3">
                  <FileText className="h-4 w-4 text-purple-600" />
                  <h3 className="text-sm font-medium text-gray-700">
                    Template ({templates.length})
                  </h3>
                </div>
                <div className="space-y-3">
                  {templates.map(template => (
                    <div
                      key={template.id}
                      className="p-3 bg-purple-50 border border-purple-200 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-purple-900">
                            {template.name}
                          </h4>
                          {template.description && (
                            <p className="text-sm text-purple-600 mt-1">
                              {template.description}
                            </p>
                          )}
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-xs text-purple-500">
                              {template.item_count} prodotti
                            </span>
                            <span className="text-xs text-purple-500">
                              Creata il{' '}
                              {new Date(template.created_at).toLocaleDateString(
                                'it-IT'
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleCreateFromTemplate(template)}
                            className="px-3 py-1 text-xs font-medium text-purple-700 bg-purple-100 rounded-md hover:bg-purple-200 transition-colors"
                          >
                            Usa Template
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2">Azioni rapide:</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleCreateNew}
                  className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Nuova Lista
                </button>
                {templates.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center px-3 py-1 text-xs font-medium text-purple-700 bg-purple-100 rounded-md hover:bg-purple-200 transition-colors"
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    Da Template
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </CollapsibleCard>

      {/* Modals */}
      <CreateListModal
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        onCreate={handleSubmit}
        templates={templates}
      />

      <ProductSelector
        products={[]}
        selectedProducts={[]}
        onToggleProduct={() => {}}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    </>
  )
}

export default ShoppingListManager
