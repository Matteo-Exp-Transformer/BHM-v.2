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
  AllergenType,
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
  // TEMPORARY: Mock data until database is fixed
  const mockProducts: Product[] = [
    {
      id: '1',
      company_id: companyId || '',
      name: 'Latte Fresco Intero',
      category_id: 'cat1',
      department_id: 'dept1',
      conservation_point_id: 'cp1',
      barcode: '1234567890123',
      supplier_name: 'Latteria Centrale',
      purchase_date: new Date('2025-09-15'),
      expiry_date: new Date('2025-09-28'),
      quantity: 10.0,
      unit: 'litri',
      allergens: [AllergenType.LATTOSIO],
      status: 'active',
      notes: 'Prodotto fresco di alta qualità',
      created_at: new Date(),
      updated_at: new Date(),
      category: 'Latticini',
      departments: { name: 'Cucina' },
      conservation_points: { name: 'Frigorifero Principale', type: 'fridge' },
    },
    {
      id: '2',
      company_id: companyId || '',
      name: 'Parmigiano Reggiano 24 mesi',
      category_id: 'cat1',
      department_id: 'dept1',
      conservation_point_id: 'cp1',
      supplier_name: 'Caseificio Emiliano',
      purchase_date: new Date('2025-09-10'),
      expiry_date: new Date('2025-12-15'),
      quantity: 2.5,
      unit: 'kg',
      allergens: [AllergenType.LATTOSIO],
      status: 'active',
      notes: 'Stagionato 24 mesi, qualità DOP',
      created_at: new Date(),
      updated_at: new Date(),
      category: 'Latticini',
      departments: { name: 'Cucina' },
      conservation_points: { name: 'Frigorifero Principale', type: 'fridge' },
    },
    {
      id: '3',
      company_id: companyId || '',
      name: 'Latte Scaduto',
      category_id: 'cat1',
      department_id: 'dept1',
      conservation_point_id: 'cp1',
      supplier_name: 'Latteria Centrale',
      purchase_date: new Date('2025-09-01'),
      expiry_date: new Date('2025-09-19'),
      quantity: 1.0,
      unit: 'litri',
      allergens: [AllergenType.LATTOSIO],
      status: 'expired',
      notes: 'Prodotto scaduto da rimuovere',
      created_at: new Date(),
      updated_at: new Date(),
      category: 'Latticini',
      departments: { name: 'Cucina' },
      conservation_points: { name: 'Frigorifero Principale', type: 'fridge' },
    },
  ]

  const {
    data: products = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.products(companyId, searchParams?.filters),
    queryFn: async () => {
      console.log(
        '🔧 Using mock data for products - database disabled temporarily'
      )
      return mockProducts
    },
    enabled: !!companyId && !!user,
  })

  // Fetch product statistics - DISABLED TEMPORARILY
  const { data: stats } = useQuery({
    queryKey: QUERY_KEYS.productStats(companyId),
    queryFn: async (): Promise<InventoryStats> => {
      console.log(
        '🔧 Using mock stats for products - database disabled temporarily'
      )
      return {
        total_products: 3,
        active_products: 2,
        expiring_soon: 1,
        expired: 1,
        by_category: {
          Latticini: 3,
        },
        by_department: {
          Cucina: 3,
        },
        by_status: {
          active: 2,
          expired: 1,
          consumed: 0,
          waste: 0,
        },
        compliance_rate: 85,
      }
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
