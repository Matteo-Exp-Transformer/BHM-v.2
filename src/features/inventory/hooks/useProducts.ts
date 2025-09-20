import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-toastify'
import {
  Product,
  CreateProductForm,
  ProductSearchParams,
  InventoryStats,
  ProductFilters,
} from '@/types/inventory'

// Query keys
const QUERY_KEYS = {
  products: (companyId: string, filters?: ProductFilters) => [
    'products',
    companyId,
    filters,
  ],
  product: (id: string) => ['product', id],
  productStats: (companyId: string) => ['productStats', companyId],
  expiringProducts: (companyId: string) => ['expiringProducts', companyId],
  expiredProducts: (companyId: string) => ['expiredProducts', companyId],
} as const

// Hook for products management
export const useProducts = (searchParams?: ProductSearchParams) => {
  const { user, companyId } = useAuth()
  const queryClient = useQueryClient()

  // Fetch products with filters
  const {
    data: products = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.products(companyId, searchParams?.filters),
    queryFn: async () => {
      if (!companyId) return []

      let query = supabase
        .from('products')
        .select(
          `
          *,
          product_categories(name),
          departments(name),
          conservation_points(name, type)
        `
        )
        .eq('company_id', companyId)

      // Apply filters
      if (searchParams?.filters) {
        const { filters } = searchParams
        if (filters.category_id)
          query = query.eq('category_id', filters.category_id)
        if (filters.department_id)
          query = query.eq('department_id', filters.department_id)
        if (filters.conservation_point_id)
          query = query.eq(
            'conservation_point_id',
            filters.conservation_point_id
          )
        if (filters.status) query = query.eq('status', filters.status)
        if (filters.compliance_status)
          query = query.eq('compliance_status', filters.compliance_status)
      }

      // Apply search query
      if (searchParams?.query) {
        query = query.or(
          `name.ilike.%${searchParams.query}%,sku.ilike.%${searchParams.query}%,barcode.ilike.%${searchParams.query}%`
        )
      }

      // Apply sorting
      if (searchParams?.sort_by) {
        const ascending = searchParams.sort_order === 'asc'
        query = query.order(searchParams.sort_by, { ascending })
      } else {
        query = query.order('created_at', { ascending: false })
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching products:', error)
        throw error
      }

      return data as Product[]
    },
    enabled: !!companyId && !!user,
  })

  // Fetch product statistics
  const { data: stats } = useQuery({
    queryKey: QUERY_KEYS.productStats(companyId),
    queryFn: async (): Promise<InventoryStats> => {
      if (!companyId) return getEmptyStats()

      const [productsResult, categoriesResult, departmentsResult] =
        await Promise.all([
          supabase
            .from('products')
            .select('status, category_id, department_id')
            .eq('company_id', companyId),
          supabase
            .from('product_categories')
            .select('id, name')
            .eq('company_id', companyId),
          supabase
            .from('departments')
            .select('id, name')
            .eq('company_id', companyId),
        ])

      if (productsResult.error) throw productsResult.error

      const products = productsResult.data || []
      const categories = categoriesResult.data || []
      const departments = departmentsResult.data || []

      // Calculate statistics
      const stats: InventoryStats = {
        total_products: products.length,
        active_products: products.filter(p => p.status === 'active').length,
        expiring_soon: 0, // Will be calculated separately
        expired: products.filter(p => p.status === 'expired').length,
        by_category: {},
        by_department: {},
        by_status: {
          active: 0,
          expired: 0,
          consumed: 0,
          waste: 0,
        },
        compliance_rate: 0, // Will be calculated separately
      }

      // Count by category
      categories.forEach(category => {
        stats.by_category[category.name] = products.filter(
          p => p.category_id === category.id
        ).length
      })

      // Count by department
      departments.forEach(department => {
        stats.by_department[department.name] = products.filter(
          p => p.department_id === department.id
        ).length
      })

      // Count by status
      products.forEach(product => {
        stats.by_status[product.status as keyof typeof stats.by_status]++
      })

      return stats
    },
    enabled: !!companyId && !!user,
  })

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (productData: CreateProductForm): Promise<Product> => {
      const { data, error } = await supabase
        .from('products')
        .insert({
          ...productData,
          company_id: companyId,
          allergens: productData.allergens || [],
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating product:', error)
        throw error
      }

      return data as Product
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.products(companyId),
      })
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.productStats(companyId),
      })
      toast.success('Prodotto creato con successo')
    },
    onError: (error: Error) => {
      console.error('Error creating product:', error)
      toast.error('Errore nella creazione del prodotto')
    },
  })

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async ({
      id,
      ...productData
    }: CreateProductForm & { id: string }): Promise<Product> => {
      const { data, error } = await supabase
        .from('products')
        .update({
          ...productData,
          allergens: productData.allergens || [],
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('company_id', companyId)
        .select()
        .single()

      if (error) {
        console.error('Error updating product:', error)
        throw error
      }

      return data as Product
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.products(companyId),
      })
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.productStats(companyId),
      })
      toast.success('Prodotto aggiornato con successo')
    },
    onError: (error: Error) => {
      console.error('Error updating product:', error)
      toast.error("Errore nell'aggiornamento del prodotto")
    },
  })

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string): Promise<void> => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('company_id', companyId)

      if (error) {
        console.error('Error deleting product:', error)
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.products(companyId),
      })
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.productStats(companyId),
      })
      toast.success('Prodotto eliminato con successo')
    },
    onError: (error: Error) => {
      console.error('Error deleting product:', error)
      toast.error("Errore nell'eliminazione del prodotto")
    },
  })

  // Update product status mutation
  const updateProductStatusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string
      status: Product['status']
    }): Promise<Product> => {
      const { data, error } = await supabase
        .from('products')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('company_id', companyId)
        .select()
        .single()

      if (error) {
        console.error('Error updating product status:', error)
        throw error
      }

      return data as Product
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.products(companyId),
      })
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.productStats(companyId),
      })
      toast.success('Stato prodotto aggiornato')
    },
    onError: (error: Error) => {
      console.error('Error updating product status:', error)
      toast.error("Errore nell'aggiornamento dello stato")
    },
  })

  return {
    // Data
    products,
    stats,
    isLoading,
    error,

    // Actions
    createProduct: createProductMutation.mutate,
    updateProduct: updateProductMutation.mutate,
    deleteProduct: deleteProductMutation.mutate,
    updateProductStatus: updateProductStatusMutation.mutate,

    // Mutation states
    isCreating: createProductMutation.isPending,
    isUpdating: updateProductMutation.isPending,
    isDeleting: deleteProductMutation.isPending,
    isUpdatingStatus: updateProductStatusMutation.isPending,

    // Utilities
    refetch,
  }
}

// Helper function for empty stats
const getEmptyStats = (): InventoryStats => ({
  total_products: 0,
  active_products: 0,
  expiring_soon: 0,
  expired: 0,
  by_category: {},
  by_department: {},
  by_status: {
    active: 0,
    expired: 0,
    consumed: 0,
    waste: 0,
  },
  compliance_rate: 0,
})
