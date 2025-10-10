import { useMemo } from 'react'
import type { Product } from '../../../types/inventory'
import { useCategories } from '../../inventory/hooks/useCategories'
import { useDepartments } from '../../management/hooks/useDepartments'

interface ProductFiltersProps {
  products: Product[]
  filters: {
    category: string
    department: string
    expiry: 'all' | 'expired' | 'expiring_soon'
  }
  onFiltersChange: (filters: {
    category: string
    department: string
    expiry: 'all' | 'expired' | 'expiring_soon'
  }) => void
}

export function ProductFilters({
  products,
  filters,
  onFiltersChange,
}: ProductFiltersProps) {
  const { data: categories = [] } = useCategories()
  const { data: departments = [] } = useDepartments()

  const departmentOptions = useMemo(() => {
    const uniqueDepartmentIds = new Set(
      products
        .map((p) => p.department_id)
        .filter((id): id is string => id !== undefined && id !== null)
    )

    return departments.filter((dept) => uniqueDepartmentIds.has(dept.id))
  }, [products, departments])

  const categoryOptions = useMemo(() => {
    const uniqueCategoryIds = new Set(
      products
        .map((p) => p.category_id)
        .filter((id): id is string => id !== undefined && id !== null)
    )

    return categories.filter((cat) => uniqueCategoryIds.has(cat.id))
  }, [products, categories])

  const handleReset = () => {
    onFiltersChange({
      category: '',
      department: '',
      expiry: 'all',
    })
  }

  const hasActiveFilters =
    filters.category !== '' ||
    filters.department !== '' ||
    filters.expiry !== 'all'

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Filtri</h3>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Reset
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Categoria
          </label>
          <select
            value={filters.category}
            onChange={(e) =>
              onFiltersChange({ ...filters, category: e.target.value })
            }
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tutte le categorie</option>
            {categoryOptions.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Reparto
          </label>
          <select
            value={filters.department}
            onChange={(e) =>
              onFiltersChange({ ...filters, department: e.target.value })
            }
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tutti i reparti</option>
            {departmentOptions.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Scadenza
          </label>
          <select
            value={filters.expiry}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                expiry: e.target.value as 'all' | 'expired' | 'expiring_soon',
              })
            }
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tutti</option>
            <option value="expiring_soon">In scadenza (7 giorni)</option>
            <option value="expired">Scaduti</option>
          </select>
        </div>
      </div>
    </div>
  )
}
