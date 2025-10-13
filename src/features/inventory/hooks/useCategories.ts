import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-toastify'
import { ProductCategory, CreateCategoryForm } from '@/types/inventory'

// Query keys
const QUERY_KEYS = {
  categories: (companyId: string) => ['productCategories', companyId],
  category: (id: string) => ['productCategory', id],
} as const

// Hook for product categories management
export const useCategories = () => {
  const { user, companyId } = useAuth()
  const queryClient = useQueryClient()

  // Fetch categories
  const {
    data: categories = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.categories(companyId || ''),
    queryFn: async () => {
      if (!companyId) return []

      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('company_id', companyId)
        .order('name')

      if (error) {
        console.error('Error fetching categories:', error)
        throw error
      }

      return data as ProductCategory[]
    },
    enabled: !!companyId && !!user,
  })

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (
      categoryData: CreateCategoryForm
    ): Promise<ProductCategory> => {
      const { data, error } = await supabase
        .from('product_categories')
        .insert({
          ...categoryData,
          company_id: companyId,
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating category:', error)
        throw error
      }

      return data as ProductCategory
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.categories(companyId || ''),
      })
      toast.success('Categoria creata con successo')
    },
    onError: (error: Error) => {
      console.error('Error creating category:', error)
      toast.error('Errore nella creazione della categoria')
    },
  })

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async ({
      id,
      ...categoryData
    }: CreateCategoryForm & { id: string }): Promise<ProductCategory> => {
      const { data, error } = await supabase
        .from('product_categories')
        .update({
          ...categoryData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('company_id', companyId)
        .select()
        .single()

      if (error) {
        console.error('Error updating category:', error)
        throw error
      }

      return data as ProductCategory
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.categories(companyId || ''),
      })
      toast.success('Categoria aggiornata con successo')
    },
    onError: (error: Error) => {
      console.error('Error updating category:', error)
      toast.error("Errore nell'aggiornamento della categoria")
    },
  })

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: string): Promise<void> => {
      // First check if category is used by any products
      const { data: productsUsingCategory } = await supabase
        .from('products')
        .select('id')
        .eq('category_id', categoryId)
        .eq('company_id', companyId)
        .limit(1)

      if (productsUsingCategory && productsUsingCategory.length > 0) {
        throw new Error(
          'Impossibile eliminare la categoria: è utilizzata da alcuni prodotti'
        )
      }

      const { error } = await supabase
        .from('product_categories')
        .delete()
        .eq('id', categoryId)
        .eq('company_id', companyId)

      if (error) {
        console.error('Error deleting category:', error)
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.categories(companyId || ''),
      })
      toast.success('Categoria eliminata con successo')
    },
    onError: (error: Error) => {
      console.error('Error deleting category:', error)
      toast.error(error.message || "Errore nell'eliminazione della categoria")
    },
  })

  return {
    // Data
    categories,
    isLoading,
    error,

    // Actions
    createCategory: createCategoryMutation.mutate,
    updateCategory: updateCategoryMutation.mutate,
    deleteCategory: deleteCategoryMutation.mutate,

    // Mutation states
    isCreating: createCategoryMutation.isPending,
    isUpdating: updateCategoryMutation.isPending,
    isDeleting: deleteCategoryMutation.isPending,

    // Utilities
    refetch,
  }
}
