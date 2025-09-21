import { ChevronDown, X } from 'lucide-react'
import { ProductCategory } from '@/types/inventory'

interface CategoryFilterProps {
  categories: ProductCategory[]
  selectedCategory: string | null
  onCategoryChange: (categoryId: string | null) => void
  isLoading?: boolean
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
  isLoading = false,
}: CategoryFilterProps) {
  const selectedCategoryName = categories.find(
    c => c.id === selectedCategory
  )?.name

  return (
    <div className="relative">
      <select
        value={selectedCategory || ''}
        onChange={e => onCategoryChange(e.target.value || null)}
        disabled={isLoading}
        className="appearance-none w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
      >
        <option value="">Tutte le categorie</option>
        {categories.map(category => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>

      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        {isLoading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </div>

      {/* Selected category badge */}
      {selectedCategoryName && (
        <div className="absolute -top-2 -right-2">
          <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
            {selectedCategoryName}
            <button
              onClick={() => onCategoryChange(null)}
              className="hover:bg-blue-200 rounded-full p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
