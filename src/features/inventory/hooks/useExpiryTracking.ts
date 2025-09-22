import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-toastify'
import {
  ExpiryAlert,
  ExpiredProduct,
  ExpiryStats,
  ReinsertExpiredProductRequest,
} from '@/types/inventory'

// Query keys
const QUERY_KEYS = {
  expiryAlerts: (companyId: string, daysAhead?: number) => [
    'expiryAlerts',
    companyId,
    daysAhead,
  ],
  expiredProducts: (companyId: string) => ['expiredProducts', companyId],
  expiryStats: (companyId: string) => ['expiryStats', companyId],
} as const

// Hook for expiry tracking
export const useExpiryTracking = (daysAhead: number = 7) => {
  const { user, companyId } = useAuth()
  const queryClient = useQueryClient()

  // Fetch products expiring soon
  // TEMPORARY: Mock data until database is fixed
  const {
    data: expiryAlerts = [],
    isLoading: isLoadingAlerts,
    error: alertsError,
    refetch: refetchAlerts,
  } = useQuery({
    queryKey: QUERY_KEYS.expiryAlerts(companyId, daysAhead),
    queryFn: async (): Promise<ExpiryAlert[]> => {
      console.log(
        '🔧 Using mock data for expiry alerts - database disabled temporarily'
      )
      return [
        {
          product_id: '1',
          product_name: 'Latte Fresco Intero',
          expiry_date: new Date('2025-09-28'),
          days_until_expiry: 7,
          alert_level: 'warning' as const,
          department: 'Cucina',
        },
      ]
    },
    enabled: !!companyId && !!user,
  })

  // Fetch expired products - DISABLED TEMPORARILY
  const {
    data: expiredProducts = [],
    isLoading: isLoadingExpired,
    error: expiredError,
    refetch: refetchExpired,
  } = useQuery({
    queryKey: QUERY_KEYS.expiredProducts(companyId),
    queryFn: async (): Promise<ExpiredProduct[]> => {
      console.log(
        '🔧 Using mock data for expired products - database disabled temporarily'
      )
      return [
        {
          id: '3',
          name: 'Latte Scaduto',
          expiry_date: new Date('2025-09-19'),
          status: 'expired',
          created_at: new Date(),
          updated_at: new Date(),
          days_expired: 2,
          department: 'Cucina',
        },
      ]
    },
    enabled: !!companyId && !!user,
  })

  // Fetch expiry statistics - DISABLED TEMPORARILY
  const { data: expiryStats } = useQuery({
    queryKey: QUERY_KEYS.expiryStats(companyId),
    queryFn: async (): Promise<ExpiryStats> => {
      console.log(
        '🔧 Using mock data for expiry stats - database disabled temporarily'
      )
      return {
        total_expiring: 1,
        expiring_today: 0,
        expiring_this_week: 1,
        expired_count: 1,
        by_alert_level: {
          critical: 0,
          warning: 1,
          info: 0,
        },
      }
    },
    enabled: !!companyId && !!user,
  })

  // Mark product as expired mutation - DISABLED TEMPORARILY
  const markAsExpiredMutation = useMutation({
    mutationFn: async (productId: string): Promise<void> => {
      console.log(
        '🔧 Mock: marking product as expired - database disabled temporarily',
        productId
      )
      // Mock success - no database operation
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.expiryAlerts(companyId),
      })
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.expiredProducts(companyId),
      })
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.expiryStats(companyId),
      })
      toast.success('Prodotto marcato come scaduto')
    },
    onError: (error: Error) => {
      console.error('Error marking product as expired:', error)
      toast.error('Errore nel marcare il prodotto come scaduto')
    },
  })

  // Reinsert expired product mutation
  const reinsertExpiredProductMutation = useMutation({
    mutationFn: async (
      request: ReinsertExpiredProductRequest
    ): Promise<void> => {
      // Get the expired product
      const { data: expiredProduct, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('id', request.expired_product_id)
        .eq('company_id', companyId)
        .single()

      if (fetchError) {
        console.error('Error fetching expired product:', fetchError)
        throw fetchError
      }

      // Create new product with updated expiry date
      const { error: insertError } = await supabase.from('products').insert({
        ...expiredProduct,
        id: undefined, // Let Supabase generate new ID
        expiry_date: request.new_expiry_date.toISOString().split('T')[0],
        quantity: request.new_quantity || expiredProduct.quantity,
        status: 'active',
        notes: request.notes || expiredProduct.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (insertError) {
        console.error('Error reinserting expired product:', insertError)
        throw insertError
      }

      // Update the original product status
      const { error: updateError } = await supabase
        .from('products')
        .update({
          status: 'consumed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', request.expired_product_id)
        .eq('company_id', companyId)

      if (updateError) {
        console.error('Error updating original product status:', updateError)
        throw updateError
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.expiredProducts(companyId),
      })
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.expiryStats(companyId),
      })
      toast.success('Prodotto reinserito con successo')
    },
    onError: (error: Error) => {
      console.error('Error reinserting expired product:', error)
      toast.error('Errore nel reinserimento del prodotto')
    },
  })

  return {
    // Data
    expiryAlerts,
    expiredProducts,
    expiryStats,
    isLoading: isLoadingAlerts || isLoadingExpired,
    error: alertsError || expiredError,

    // Actions
    markAsExpired: markAsExpiredMutation.mutate,
    reinsertExpiredProduct: reinsertExpiredProductMutation.mutate,

    // Mutation states
    isMarkingAsExpired: markAsExpiredMutation.isPending,
    isReinserting: reinsertExpiredProductMutation.isPending,

    // Utilities
    refetch: () => {
      refetchAlerts()
      refetchExpired()
    },
  }
}
