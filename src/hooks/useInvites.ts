/**
 * 🪝 useInvites Hook - React Query per Sistema Inviti
 * 
 * Hook per gestire inviti dipendenti con caching e mutations
 * 
 * @author BHM v2 Team
 * @date 2025-01-09
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import {
  createInviteToken,
  validateInviteToken,
  acceptInvite,
  getCompanyInvites,
  getPendingInvites,
  cancelInvite,
  regenerateInvite,
  getInviteStats,
  type CreateInviteInput,
  type AcceptInviteInput,
  type InviteToken,
} from '@/services/auth/inviteService'
import { toast } from 'react-toastify'

// =============================================
// QUERY KEYS
// =============================================

const QUERY_KEYS = {
  invites: (companyId: string) => ['invites', companyId],
  pendingInvites: (companyId: string) => ['invites-pending', companyId],
  inviteStats: (companyId: string) => ['invite-stats', companyId],
  validateToken: (token: string) => ['validate-invite', token],
} as const

// =============================================
// MAIN HOOK
// =============================================

/**
 * Hook principale per gestione inviti
 * 
 * @example
 * const { invites, createInvite, cancelInvite, isCreating } = useInvites()
 */
export const useInvites = () => {
  const { companyId } = useAuth()
  const queryClient = useQueryClient()

  // =============================================
  // QUERIES
  // =============================================

  // Tutti gli inviti dell'azienda
  const {
    data: invites = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.invites(companyId || ''),
    queryFn: () => getCompanyInvites(companyId!),
    enabled: !!companyId,
    staleTime: 2 * 60 * 1000, // 2 minuti
  })

  // Solo inviti pending
  const {
    data: pendingInvites = [],
    isLoading: isPendingLoading,
  } = useQuery({
    queryKey: QUERY_KEYS.pendingInvites(companyId || ''),
    queryFn: () => getPendingInvites(companyId!),
    enabled: !!companyId,
    staleTime: 2 * 60 * 1000,
  })

  // Statistiche inviti
  const {
    data: stats,
    isLoading: isStatsLoading,
  } = useQuery({
    queryKey: QUERY_KEYS.inviteStats(companyId || ''),
    queryFn: () => getInviteStats(companyId!),
    enabled: !!companyId,
    staleTime: 2 * 60 * 1000,
  })

  // =============================================
  // MUTATIONS
  // =============================================

  // Crea nuovo invito
  const createInviteMutation = useMutation({
    mutationFn: (input: CreateInviteInput) => createInviteToken(input),
    onSuccess: (newInvite) => {
      // Invalida cache
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.invites(companyId || ''),
      })
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.pendingInvites(companyId || ''),
      })
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.inviteStats(companyId || ''),
      })
      
      toast.success(`Invito inviato a ${newInvite.email}`)
    },
    onError: (error: Error) => {
      console.error('Errore creazione invito:', error)
      toast.error('Impossibile creare invito')
    },
  })

  // Cancella invito
  const cancelInviteMutation = useMutation({
    mutationFn: (inviteId: string) => cancelInvite(inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.invites(companyId || ''),
      })
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.pendingInvites(companyId || ''),
      })
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.inviteStats(companyId || ''),
      })
    },
    onError: (error: Error) => {
      console.error('Errore cancellazione invito:', error)
      toast.error('Impossibile cancellare invito')
    },
  })

  // Rigenera invito scaduto
  const regenerateInviteMutation = useMutation({
    mutationFn: ({ inviteId, expiresInDays }: { 
      inviteId: string
      expiresInDays?: number 
    }) => regenerateInvite(inviteId, expiresInDays),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.invites(companyId || ''),
      })
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.pendingInvites(companyId || ''),
      })
    },
    onError: (error: Error) => {
      console.error('Errore rigenerazione invito:', error)
      toast.error('Impossibile rigenerare invito')
    },
  })

  return {
    // Data
    invites,
    pendingInvites,
    stats,

    // Loading states
    isLoading,
    isPendingLoading,
    isStatsLoading,
    isCreating: createInviteMutation.isPending,
    isCancelling: cancelInviteMutation.isPending,
    isRegenerating: regenerateInviteMutation.isPending,

    // Errors
    error,
    createError: createInviteMutation.error,
    cancelError: cancelInviteMutation.error,

    // Actions
    createInvite: createInviteMutation.mutate,
    createInviteAsync: createInviteMutation.mutateAsync,
    cancelInvite: cancelInviteMutation.mutate,
    regenerateInvite: regenerateInviteMutation.mutate,
    refetch,

    // Utilities
    getInviteById: (id: string) => invites.find(i => i.id === id),
    getInviteByEmail: (email: string) => invites.find(i => i.email === email),
  }
}

// =============================================
// VALIDATION HOOK (per pagina accettazione)
// =============================================

/**
 * Hook per validare token in pagina accettazione invito
 * 
 * @param token - Token da validare
 * 
 * @example
 * const { isValid, invite, isValidating } = useValidateInvite(token)
 */
export const useValidateInvite = (token: string | null) => {
  return useQuery({
    queryKey: QUERY_KEYS.validateToken(token || ''),
    queryFn: () => validateInviteToken(token!),
    enabled: !!token,
    staleTime: 0, // Sempre rivalidare
    retry: false, // Non ritentare se invalido
  })
}

// =============================================
// ACCEPT INVITE HOOK
// =============================================

/**
 * Hook per accettare invito
 * 
 * @example
 * const { acceptInvite, isAccepting } = useAcceptInvite()
 * acceptInvite({ token, password, first_name, last_name })
 */
export const useAcceptInvite = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: AcceptInviteInput) => acceptInvite(input),
    onSuccess: (user) => {
      console.log('✅ Invito accettato, utente creato:', user.id)
      // Invalida tutte le cache perché ora c'è un nuovo utente
      queryClient.clear()
      
      // Redirect sarà gestito dal componente
    },
    onError: (error: Error) => {
      console.error('❌ Errore accettazione invito:', error)
      // Toast già mostrato in acceptInvite()
    },
  })
}

// =============================================
// EXPORTS
// =============================================

export default useInvites

