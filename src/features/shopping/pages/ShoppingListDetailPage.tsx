import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Circle, Download, Trash2, FileText } from 'lucide-react'
import {
  useShoppingListDetail,
  useCheckItem,
  useCompleteShoppingList,
  useDeleteShoppingList,
} from '../hooks/useShoppingList'
import { exportShoppingListToPDF } from '../utils/exportToPDF'

export default function ShoppingListDetailPage() {
  const { listId } = useParams<{ listId: string }>()
  const navigate = useNavigate()

  const { data: list, isLoading } = useShoppingListDetail(listId)
  const checkItemMutation = useCheckItem()
  const completeListMutation = useCompleteShoppingList()
  const deleteListMutation = useDeleteShoppingList()

  const handleCheckItem = (itemId: string, currentStatus: boolean) => {
    if (!listId) return
    checkItemMutation.mutate({
      itemId,
      checked: !currentStatus,
      listId,
    })
  }

  const handleCompleteList = () => {
    if (!listId) return
    if (window.confirm('Sei sicuro di voler completare questa lista?')) {
      completeListMutation.mutate(listId, {
        onSuccess: () => {
          navigate('/liste-spesa')
        },
      })
    }
  }

  const handleDeleteList = () => {
    if (!listId) return
    if (window.confirm('Sei sicuro di voler eliminare questa lista?')) {
      deleteListMutation.mutate(listId, {
        onSuccess: () => {
          navigate('/liste-spesa')
        },
      })
    }
  }

  const handleExportCSV = () => {
    if (!list) return

    const csvContent = [
      'Prodotto,Categoria,Quantità,Unità,Note,Completato',
      ...list.items.map(item =>
        [
          item.product_name,
          item.category_name,
          item.quantity,
          item.unit || '',
          item.notes || '',
          item.is_checked ? 'Sì' : 'No',
        ].join(',')
      ),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${list.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExportPDF = () => {
    if (!list) return
    exportShoppingListToPDF(list)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!list) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500">Lista non trovata</p>
          <button
            onClick={() => navigate('/liste-spesa')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Torna alle liste
          </button>
        </div>
      </div>
    )
  }

  const groupedItems = list.items.reduce<Record<string, typeof list.items>>((acc, item) => {
    if (!acc[item.category_name]) {
      acc[item.category_name] = []
    }
    acc[item.category_name].push(item)
    return acc
  }, {})

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/liste-spesa')}
          className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{list.name}</h1>
          <p className="text-gray-600">
            Creata il {new Date(list.created_at).toLocaleDateString('it-IT')}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            PDF
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
          <button
            onClick={handleDeleteList}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Elimina
          </button>
        </div>
      </div>

      {list.description && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">{list.description}</p>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-600">Progresso</p>
            <p className="text-2xl font-bold text-gray-900">
              {list.checked_items}/{list.total_items}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Completamento</p>
            <p className="text-2xl font-bold text-blue-600">
              {list.completion_percentage}%
            </p>
          </div>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all"
            style={{ width: `${list.completion_percentage}%` }}
          />
        </div>
      </div>

      {list.notes && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-700 mb-1">Note</p>
          <p className="text-sm text-gray-600">{list.notes}</p>
        </div>
      )}

      <div className="space-y-6">
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{category}</h3>
            <div className="space-y-2">
              {items.map(item => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <button
                    onClick={() => handleCheckItem(item.id, item.is_checked)}
                    className="flex-shrink-0"
                  >
                    {item.is_checked ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  <div className="flex-1">
                    <p
                      className={`font-medium ${
                        item.is_checked ? 'text-gray-400 line-through' : 'text-gray-900'
                      }`}
                    >
                      {item.product_name}
                    </p>
                    {item.notes && (
                      <p className="text-sm text-gray-500">{item.notes}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-700">
                      {item.quantity} {item.unit || 'pz'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {list.status !== 'completed' && (
        <div className="flex justify-end">
          <button
            onClick={handleCompleteList}
            disabled={list.completion_percentage < 100}
            className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 ${
              list.completion_percentage === 100
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <CheckCircle className="w-5 h-5" />
            Completa Lista
          </button>
        </div>
      )}
    </div>
  )
}
