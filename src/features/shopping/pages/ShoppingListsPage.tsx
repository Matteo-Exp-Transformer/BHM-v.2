import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Trash2, Download, CheckCircle, Clock } from 'lucide-react'
import { useShoppingLists, useDeleteShoppingList } from '../hooks/useShoppingList'
import type { ShoppingListStatus } from '@/types/shopping'

export default function ShoppingListsPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ShoppingListStatus | 'all'>('all')

  const { data: lists = [], isLoading } = useShoppingLists({
    status: statusFilter === 'all' ? undefined : statusFilter,
  })

  const deleteListMutation = useDeleteShoppingList()

  const filteredLists = lists.filter(list => {
    const matchesSearch = list.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const handleDelete = (listId: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questa lista?')) {
      deleteListMutation.mutate(listId)
    }
  }

  const handleExport = (listId: string) => {
    console.log('Export list:', listId)
  }

  const getStatusBadge = (status: ShoppingListStatus) => {
    const statusConfig = {
      pending: { label: 'In sospeso', color: 'bg-yellow-100 text-yellow-800' },
      in_progress: { label: 'In corso', color: 'bg-blue-100 text-blue-800' },
      completed: { label: 'Completata', color: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Annullata', color: 'bg-gray-100 text-gray-800' },
    }
    const config = statusConfig[status]
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${config.color}`}>
        {config.label}
      </span>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Liste della Spesa</h1>
          <p className="text-gray-600">Gestisci le tue liste della spesa</p>
        </div>
        <button
          onClick={() => navigate('/inventario')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuova Lista
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cerca liste..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as ShoppingListStatus | 'all')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tutti gli stati</option>
            <option value="pending">In sospeso</option>
            <option value="in_progress">In corso</option>
            <option value="completed">Completate</option>
            <option value="cancelled">Annullate</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredLists.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500">
            {searchQuery
              ? 'Nessuna lista trovata con questi criteri di ricerca.'
              : 'Nessuna lista della spesa creata. Vai in Inventario per crearne una.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLists.map(list => (
            <div
              key={list.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <button
                    onClick={() => navigate(`/liste-spesa/${list.id}`)}
                    className="text-lg font-semibold text-gray-900 hover:text-blue-600 text-left"
                  >
                    {list.name}
                  </button>
                  <p className="text-sm text-gray-600 mt-1">
                    Creata il {new Date(list.created_at).toLocaleDateString('it-IT')}
                  </p>
                </div>
                {getStatusBadge(list.status)}
              </div>

              {list.description && (
                <p className="text-sm text-gray-600 mb-3">{list.description}</p>
              )}

              <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  <span>
                    {list.checked_items || 0}/{list.total_items || 0}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{list.completion_percentage || 0}%</span>
                </div>
              </div>

              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all"
                  style={{ width: `${list.completion_percentage || 0}%` }}
                />
              </div>

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => navigate(`/liste-spesa/${list.id}`)}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Visualizza
                </button>
                <button
                  onClick={() => handleExport(list.id)}
                  className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                  title="Esporta"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(list.id)}
                  className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                  title="Elimina"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
