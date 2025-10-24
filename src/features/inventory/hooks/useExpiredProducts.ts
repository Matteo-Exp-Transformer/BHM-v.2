import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-toastify'
import { ExpiredProduct, WasteStats } from '@/types/inventory'

// Query keys
const QUERY_KEYS = {
  expiredProducts: (companyId: string) => ['expiredProducts', companyId],
  wasteStats: (companyId: string) => ['wasteStats', companyId],
}

export const useExpiredProducts = () => {
  const { companyId } = useAuth()
  const queryClient = useQueryClient()

  // Fetch expired products
  const {
    data: expiredProducts = [],
    isLoading: isLoadingExpired,
    error: expiredError,
    refetch: refetchExpired,
  } = useQuery({
    queryKey: QUERY_KEYS.expiredProducts(companyId || ''),
    queryFn: async (): Promise<ExpiredProduct[]> => {
      if (!companyId) {
        return []
      }

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_categories(id, name),
          departments(id, name),
          conservation_points(id, name)
        `)
        .eq('company_id', companyId)
        .eq('status', 'expired')
        .order('expiry_date', { ascending: true })

      if (error) {
        console.error('Error fetching expired products:', error)
        throw error
      }

      return (data || []).map((product: any) => ({
        id: product.id,
        company_id: product.company_id,
        name: product.name,
        category_id: product.category_id,
        category_name: product.product_categories?.name,
        department_id: product.department_id,
        department_name: product.departments?.name,
        conservation_point_id: product.conservation_point_id,
        conservation_point_name: product.conservation_points?.name,
        barcode: product.barcode,
        supplier_name: product.supplier_name,
        purchase_date: product.purchase_date ? new Date(product.purchase_date) : undefined,
        expiry_date: product.expiry_date ? new Date(product.expiry_date) : new Date(),
        quantity: product.quantity || 0,
        unit: product.unit || '',
        allergens: product.allergens || [],
        temperature_requirements: product.temperature_requirements,
        label_photo_url: product.label_photo_url,
        status: product.status,
        notes: product.notes,
        expired_at: product.expired_at ? new Date(product.expired_at) : new Date(),
        compliance_status: product.compliance_status,
        reinsertion_count: product.reinsertion_count || 0,
        created_at: product.created_at ? new Date(product.created_at) : new Date(),
        updated_at: product.updated_at ? new Date(product.updated_at) : new Date(),
      }))
    },
    enabled: !!companyId,
  })

  // Fetch waste statistics
  const {
    data: wasteStats,
    isLoading: isLoadingWasteStats,
    error: wasteStatsError,
  } = useQuery({
    queryKey: QUERY_KEYS.wasteStats(companyId || ''),
    queryFn: async (): Promise<WasteStats> => {
      if (!companyId) {
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

      const { data: expiredProductsData, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          quantity,
          expiry_date,
          product_categories(name)
        `)
        .eq('company_id', companyId)
        .eq('status', 'expired')

      if (error) {
        console.error('Error fetching waste stats:', error)
        throw error
      }

      const expiredProducts = expiredProductsData || []
      const totalExpired = expiredProducts.length

      if (totalExpired === 0) {
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

      const totalWasteCost = expiredProducts.reduce((total: number, product: any) => {
        return total + (product.quantity || 0) * 2.5 // €2.50 per unit average
      }, 0)

      const today = new Date()
      const totalExpiredDays = expiredProducts.reduce((total: number, product: any) => {
        if (!product.expiry_date) return total
        const expiryDate = new Date(product.expiry_date)
        const diffTime = today.getTime() - expiryDate.getTime()
        const daysExpired = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return total + daysExpired
      }, 0)

      const averageExpiryDays =
        totalExpired > 0 ? totalExpiredDays / totalExpired : 0

      // Find most wasted category
      const categoryCounts = expiredProducts.reduce(
        (acc: Record<string, number>, product: any) => {
          const categoryName = product.product_categories?.name || 'Senza categoria'
          acc[categoryName] = (acc[categoryName] || 0) + 1
          return acc
        },
        {} as Record<string, number>
      )

      const mostWastedCategory = Object.entries(categoryCounts).reduce(
        (max: { category: string; count: number }, [category, count]: [string, unknown]) =>
          (count as number) > max.count ? { category, count: count as number } : max,
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
    enabled: !!companyId,
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
      if (!companyId) throw new Error('User not authenticated')

      // Get the expired product
      const { data: expiredProduct, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('id', expiredProductId)
        .eq('company_id', companyId)
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
        queryKey: QUERY_KEYS.expiredProducts(companyId || ''),
      })
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.wasteStats(companyId || ''),
      })
      queryClient.invalidateQueries({
        queryKey: ['products', companyId],
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
      if (!companyId) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('company_id', companyId)

      if (error) {
        throw error
      }

      return { success: true }
    },
    onSuccess: () => {
      toast.success('Prodotto eliminato definitivamente')
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.expiredProducts(companyId || ''),
      })
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.wasteStats(companyId || ''),
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
      if (!companyId) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('products')
        .delete()
        .in('id', productIds)
        .eq('company_id', companyId)

      if (error) {
        throw error
      }

      return { success: true, deletedCount: productIds.length }
    },
    onSuccess: result => {
      toast.success(`${result.deletedCount} prodotti eliminati definitivamente`)
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.expiredProducts(companyId || ''),
      })
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.wasteStats(companyId || ''),
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
