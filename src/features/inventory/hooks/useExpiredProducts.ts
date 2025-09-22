import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-toastify'
import { ExpiredProduct, WasteStats, AllergenType } from '@/types/inventory'

// Query keys
const QUERY_KEYS = {
  expiredProducts: (companyId: string) => ['expiredProducts', companyId],
  wasteStats: (companyId: string) => ['wasteStats', companyId],
}

export const useExpiredProducts = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Fetch expired products
  const {
    data: expiredProducts = [],
    isLoading: isLoadingExpired,
    error: expiredError,
    refetch: refetchExpired,
  } = useQuery({
    queryKey: QUERY_KEYS.expiredProducts(user?.company_id || ''),
    queryFn: async (): Promise<ExpiredProduct[]> => {
      console.log(
        '🔧 Using mock data for expired products - database disabled temporarily'
      )
      return [
        {
          id: '3',
          company_id: user?.company_id || '',
          name: 'Latte Scaduto',
          category_id: 'cat1',
          category_name: 'Latticini',
          department_id: 'dept1',
          department_name: 'Cucina',
          conservation_point_id: 'cp1',
          conservation_point_name: 'Frigorifero Principale',
          barcode: '1234567890123',
          supplier_name: 'Latteria Centrale',
          purchase_date: new Date('2025-09-01'),
          expiry_date: new Date('2025-09-19'),
          quantity: 1.0,
          unit: 'litri',
          allergens: [AllergenType.LATTE],
          temperature_requirements: { min_temp: 0, max_temp: 4, storage_type: 'fridge' as any },
          label_photo_url: undefined,
          status: 'expired',
          notes: 'Prodotto scaduto da rimuovere',
          expired_at: new Date('2025-09-19'),
          compliance_status: 'non_compliant',
          reinsertion_count: 0,
          created_at: new Date('2025-09-01'),
          updated_at: new Date(),
        },
      ]
    },
    enabled: !!user?.company_id,
  })

  // Fetch waste statistics
  const {
    data: wasteStats,
    isLoading: isLoadingWasteStats,
    error: wasteStatsError,
  } = useQuery({
    queryKey: QUERY_KEYS.wasteStats(user?.company_id || ''),
    queryFn: async (): Promise<WasteStats> => {
      if (!user?.company_id) {
        return {
          total_expired_products: 0,
          total_waste_cost: 0,
          average_expiry_days: 0,
          most_wasted_category: '',
          waste_trend: 'stable',
          monthly_waste_cost: [],
          prevention_savings: 0,
        }
      }

      // TEMPORARY: Mock data until database is fixed
      console.log(
        '🔧 Using mock data for waste stats - database disabled temporarily'
      )
      const expiredProducts = [
        {
          id: '3',
          name: 'Latte Scaduto',
          quantity: 1.0,
          expiry_date: '2025-09-19',
          product_categories: { name: 'Latticini' },
        },
      ]

      const totalExpired = expiredProducts.length
      const totalWasteCost = expiredProducts.reduce((total, product) => {
        return total + product.quantity * 2.5 // €2.50 per unit average
      }, 0)

      const today = new Date()
      const totalExpiredDays = expiredProducts.reduce((total, product) => {
        const expiryDate = new Date(product.expiry_date)
        const diffTime = today.getTime() - expiryDate.getTime()
        const daysExpired = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return total + daysExpired
      }, 0)

      const averageExpiryDays =
        totalExpired > 0 ? totalExpiredDays / totalExpired : 0

      // Find most wasted category
      const categoryCounts = expiredProducts.reduce(
        (acc, product) => {
          const categoryName = product.product_categories.name
          acc[categoryName] = (acc[categoryName] || 0) + 1
          return acc
        },
        {} as Record<string, number>
      )

      const mostWastedCategory = Object.entries(categoryCounts).reduce(
        (max, [category, count]) =>
          count > max.count ? { category, count } : max,
        { category: '', count: 0 }
      ).category

      return {
        total_expired_products: totalExpired,
        total_waste_cost: totalWasteCost,
        average_expiry_days: Math.round(averageExpiryDays),
        most_wasted_category: mostWastedCategory,
        waste_trend: 'stable', // TODO: Implement trend calculation
        monthly_waste_cost: [], // TODO: Implement monthly cost tracking
        prevention_savings: totalWasteCost * 0.3, // 30% savings with better management
      }
    },
    enabled: !!user?.company_id,
  })

  // Reinsert expired product mutation
  const reinsertExpiredProduct = useMutation({
    mutationFn: async ({
      expiredProductId,
      newExpiryDate,
      newQuantity,
      notes,
    }: {
      expiredProductId: string
      newExpiryDate: Date
      newQuantity?: number
      notes?: string
    }) => {
      if (!user?.company_id) throw new Error('User not authenticated')

      // Get the expired product
      const { data: expiredProduct, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('id', expiredProductId)
        .eq('company_id', user.company_id)
        .single()

      if (fetchError || !expiredProduct) {
        throw new Error('Product not found')
      }

      // Create new product with updated expiry date
      const newProduct = {
        ...expiredProduct,
        id: crypto.randomUUID(),
        expiry_date: newExpiryDate.toISOString(),
        quantity: newQuantity || expiredProduct.quantity,
        status: 'active',
        previous_product_id: expiredProductId,
        reinsertion_count: (expiredProduct.reinsertion_count || 0) + 1,
        notes: notes || expiredProduct.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Insert new product
      const { error: insertError } = await supabase
        .from('products')
        .insert(newProduct)

      if (insertError) {
        throw insertError
      }

      // Archive the expired product
      const { error: archiveError } = await supabase
        .from('products')
        .update({
          status: 'archived',
          archived_at: new Date().toISOString(),
        })
        .eq('id', expiredProductId)

      if (archiveError) {
        throw archiveError
      }

      return { success: true }
    },
    onSuccess: () => {
      toast.success('Prodotto reinserito con successo')
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.expiredProducts(user?.company_id || ''),
      })
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.wasteStats(user?.company_id || ''),
      })
      queryClient.invalidateQueries({
        queryKey: ['products', user?.company_id],
      })
    },
    onError: (error: Error) => {
      console.error('Error reinserting product:', error)
      toast.error('Errore nel reinserimento del prodotto')
    },
  })

  // Delete expired product mutation
  const deleteExpiredProduct = useMutation({
    mutationFn: async (productId: string) => {
      if (!user?.company_id) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('company_id', user.company_id)

      if (error) {
        throw error
      }

      return { success: true }
    },
    onSuccess: () => {
      toast.success('Prodotto eliminato definitivamente')
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.expiredProducts(user?.company_id || ''),
      })
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.wasteStats(user?.company_id || ''),
      })
    },
    onError: (error: Error) => {
      console.error('Error deleting expired product:', error)
      toast.error("Errore nell'eliminazione del prodotto")
    },
  })

  // Bulk operations
  const bulkDeleteExpired = useMutation({
    mutationFn: async (productIds: string[]) => {
      if (!user?.company_id) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('products')
        .delete()
        .in('id', productIds)
        .eq('company_id', user.company_id)

      if (error) {
        throw error
      }

      return { success: true, deletedCount: productIds.length }
    },
    onSuccess: result => {
      toast.success(`${result.deletedCount} prodotti eliminati definitivamente`)
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.expiredProducts(user?.company_id || ''),
      })
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.wasteStats(user?.company_id || ''),
      })
    },
    onError: (error: Error) => {
      console.error('Error bulk deleting expired products:', error)
      toast.error("Errore nell'eliminazione dei prodotti")
    },
  })

  return {
    // Data
    expiredProducts,
    wasteStats,

    // Loading states
    isLoadingExpired,
    isLoadingWasteStats,

    // Error states
    expiredError,
    wasteStatsError,

    // Actions
    reinsertExpiredProduct,
    deleteExpiredProduct,
    bulkDeleteExpired,
    refetchExpired,

    // Mutation states
    isReinserting: reinsertExpiredProduct.isPending,
    isDeleting: deleteExpiredProduct.isPending,
    isBulkDeleting: bulkDeleteExpired.isPending,
  }
}
