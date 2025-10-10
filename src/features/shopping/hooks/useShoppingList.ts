import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { shoppingListService } from '../../../services/shoppingListService'
import type {
  CreateShoppingListInput,
  UpdateShoppingListInput,
  ShoppingListFilters,
} from '../../../types/shopping'
import { useAuth } from '../../../hooks/useAuth'

export function useShoppingLists(filters?: ShoppingListFilters) {
  const { companyId } = useAuth()

  return useQuery({
    queryKey: ['shopping-lists', companyId, filters],
    queryFn: async () => {
      if (!companyId) throw new Error('Company ID not found')
      const result = await shoppingListService.getShoppingLists(
        companyId,
        filters
      )
      if (!result.success) throw new Error(result.error)
      return result.data || []
    },
    enabled: !!companyId,
  })
}

export function useShoppingListDetail(listId: string | undefined) {
  return useQuery({
    queryKey: ['shopping-list', listId],
    queryFn: async () => {
      if (!listId) throw new Error('List ID not provided')
      const result = await shoppingListService.getShoppingListById(listId)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    enabled: !!listId,
  })
}

export function useCreateShoppingList() {
  const queryClient = useQueryClient()
  const { companyId } = useAuth()

  return useMutation({
    mutationFn: async (input: CreateShoppingListInput) => {
      if (!companyId) throw new Error('Company ID not found')
      const result = await shoppingListService.createShoppingList(
        companyId,
        input
      )
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-lists', companyId] })
    },
  })
}

export function useUpdateShoppingList() {
  const queryClient = useQueryClient()
  const { companyId } = useAuth()

  return useMutation({
    mutationFn: async ({
      listId,
      input,
    }: {
      listId: string
      input: UpdateShoppingListInput
    }) => {
      const result = await shoppingListService.updateShoppingList(listId, input)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['shopping-lists', companyId] })
      queryClient.invalidateQueries({ queryKey: ['shopping-list', variables.listId] })
    },
  })
}

export function useDeleteShoppingList() {
  const queryClient = useQueryClient()
  const { companyId } = useAuth()

  return useMutation({
    mutationFn: async (listId: string) => {
      const result = await shoppingListService.deleteShoppingList(listId)
      if (!result.success) throw new Error(result.error)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-lists', companyId] })
    },
  })
}

export function useCheckItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      itemId,
      checked,
      listId,
    }: {
      itemId: string
      checked: boolean
      listId: string
    }) => {
      const result = await shoppingListService.checkItem(itemId, checked)
      if (!result.success) throw new Error(result.error)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['shopping-list', variables.listId] })
    },
  })
}

export function useCompleteShoppingList() {
  const queryClient = useQueryClient()
  const { companyId } = useAuth()

  return useMutation({
    mutationFn: async (listId: string) => {
      const result = await shoppingListService.completeList(listId)
      if (!result.success) throw new Error(result.error)
    },
    onSuccess: (_, listId) => {
      queryClient.invalidateQueries({ queryKey: ['shopping-lists', companyId] })
      queryClient.invalidateQueries({ queryKey: ['shopping-list', listId] })
    },
  })
}
