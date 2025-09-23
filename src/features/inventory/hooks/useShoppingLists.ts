import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-toastify'

// Shopping List interfaces
export interface ShoppingListItem {
  id: string
  shopping_list_id: string
  product_id: string
  product_name: string
  category_name: string
  quantity: number
  unit?: string
  notes?: string
  is_completed: boolean
  added_at: string
  completed_at?: string
}

export interface ShoppingList {
  id: string
  company_id: string
  name: string
  description?: string
  created_by: string
  created_at: string
  updated_at: string
  is_template: boolean
  is_completed: boolean
  completed_at?: string
  items: ShoppingListItem[]
  item_count: number
  completed_items: number
}

export interface CreateShoppingListInput {
  name: string
  description?: string
  is_template?: boolean
  items?: Omit<ShoppingListItem, 'id' | 'shopping_list_id' | 'added_at'>[]
}

export interface AddItemInput {
  product_id: string
  product_name: string
  category_name: string
  quantity: number
  unit?: string
  notes?: string
}

// Query keys
const QUERY_KEYS = {
  shoppingLists: (companyId: string) => ['shoppingLists', companyId],
  shoppingList: (id: string) => ['shoppingList', id],
  templates: (companyId: string) => ['shoppingListTemplates', companyId],
} as const

// Hook for shopping lists management
export const useShoppingLists = () => {
  const { userProfile } = useAuth()
  const queryClient = useQueryClient()
  const companyId = userProfile?.company_id

  // Fetch all shopping lists
  const {
    data: shoppingLists = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.shoppingLists(companyId || ''),
    queryFn: async (): Promise<ShoppingList[]> => {
      if (!companyId) throw new Error('Company ID not found')

      // Fetch shopping lists with items count
      const { data, error } = await supabase
        .from('shopping_lists')
        .select(`
          *,
          shopping_list_items (
            id,
            is_completed
          )
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Transform data to include item counts
      return (data || []).map((list: any) => ({
        ...list,
        item_count: list.shopping_list_items?.length || 0,
        completed_items: list.shopping_list_items?.filter((item: any) => item.is_completed).length || 0,
        items: [], // Will be loaded separately when needed
      }))
    },
    enabled: !!companyId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })

  // Fetch shopping list templates
  const {
    data: templates = [],
    isLoading: isLoadingTemplates,
  } = useQuery({
    queryKey: QUERY_KEYS.templates(companyId || ''),
    queryFn: async (): Promise<ShoppingList[]> => {
      if (!companyId) throw new Error('Company ID not found')

      const { data, error } = await supabase
        .from('shopping_lists')
        .select(`
          *,
          shopping_list_items (
            id,
            product_name,
            category_name,
            quantity,
            unit,
            notes,
            is_completed
          )
        `)
        .eq('company_id', companyId)
        .eq('is_template', true)
        .order('name', { ascending: true })

      if (error) throw error

      return (data || []).map((list: any) => ({
        ...list,
        items: list.shopping_list_items || [],
        item_count: list.shopping_list_items?.length || 0,
        completed_items: 0, // Templates don't have completed items
      }))
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Fetch shopping list details with items
  const useShoppingListDetails = (listId: string) => {
    return useQuery({
      queryKey: QUERY_KEYS.shoppingList(listId),
      queryFn: async (): Promise<ShoppingList | null> => {
        if (!listId) return null

        const { data, error } = await supabase
          .from('shopping_lists')
          .select(`
            *,
            shopping_list_items (
              id,
              product_id,
              product_name,
              category_name,
              quantity,
              unit,
              notes,
              is_completed,
              added_at,
              completed_at
            )
          `)
          .eq('id', listId)
          .single()

        if (error) throw error

        return {
          ...data,
          items: data.shopping_list_items || [],
          item_count: data.shopping_list_items?.length || 0,
          completed_items: data.shopping_list_items?.filter((item: any) => item.is_completed).length || 0,
        }
      },
      enabled: !!listId,
    })
  }

  // Create shopping list mutation
  const createShoppingList = useMutation({
    mutationFn: async (input: CreateShoppingListInput): Promise<ShoppingList> => {
      if (!companyId || !userProfile?.id) throw new Error('User not authenticated')

      const { data: listData, error: listError } = await supabase
        .from('shopping_lists')
        .insert({
          company_id: companyId,
          name: input.name,
          description: input.description || null,
          created_by: userProfile.id,
          is_template: input.is_template || false,
          is_completed: false,
        })
        .select()
        .single()

      if (listError) throw listError

      // Add items if provided
      if (input.items && input.items.length > 0) {
        const { error: itemsError } = await supabase
          .from('shopping_list_items')
          .insert(
            input.items.map(item => ({
              shopping_list_id: listData.id,
              product_id: item.product_id,
              product_name: item.product_name,
              category_name: item.category_name,
              quantity: item.quantity,
              unit: item.unit || null,
              notes: item.notes || null,
              is_completed: item.is_completed || false,
            }))
          )

        if (itemsError) throw itemsError
      }

      // Return the complete list with items
      return {
        ...listData,
        items: input.items || [],
        item_count: input.items?.length || 0,
        completed_items: 0,
      }
    },
    onSuccess: newList => {
      queryClient.setQueryData(
        QUERY_KEYS.shoppingLists(companyId || ''),
        (old: ShoppingList[] = []) => [newList, ...old]
      )
      
      if (newList.is_template) {
        queryClient.setQueryData(
          QUERY_KEYS.templates(companyId || ''),
          (old: ShoppingList[] = []) => [newList, ...old]
        )
      }

      const listType = newList.is_template ? 'template' : 'lista della spesa'
      toast.success(`${listType.charAt(0).toUpperCase() + listType.slice(1)} "${newList.name}" creata con successo`)
    },
    onError: (error: Error) => {
      console.error('Error creating shopping list:', error)
      toast.error(`Errore nella creazione della lista: ${error.message}`)
    },
  })

  // Create list from template
  const createFromTemplate = useMutation({
    mutationFn: async ({
      templateId,
      name,
      description,
    }: {
      templateId: string
      name: string
      description?: string
    }): Promise<ShoppingList> => {
      if (!companyId || !userProfile?.id) throw new Error('User not authenticated')

      // Get template with items
      const { data: template, error: templateError } = await supabase
        .from('shopping_lists')
        .select(`
          *,
          shopping_list_items (
            product_id,
            product_name,
            category_name,
            quantity,
            unit,
            notes
          )
        `)
        .eq('id', templateId)
        .single()

      if (templateError) throw templateError

      // Create new list
      const { data: listData, error: listError } = await supabase
        .from('shopping_lists')
        .insert({
          company_id: companyId,
          name,
          description: description || null,
          created_by: userProfile.id,
          is_template: false,
          is_completed: false,
        })
        .select()
        .single()

      if (listError) throw listError

      // Copy items from template
      if (template.shopping_list_items && template.shopping_list_items.length > 0) {
        const { error: itemsError } = await supabase
          .from('shopping_list_items')
          .insert(
            template.shopping_list_items.map((item: any) => ({
              shopping_list_id: listData.id,
              product_id: item.product_id,
              product_name: item.product_name,
              category_name: item.category_name,
              quantity: item.quantity,
              unit: item.unit || null,
              notes: item.notes || null,
              is_completed: false,
            }))
          )

        if (itemsError) throw itemsError
      }

      return {
        ...listData,
        items: template.shopping_list_items || [],
        item_count: template.shopping_list_items?.length || 0,
        completed_items: 0,
      }
    },
    onSuccess: newList => {
      queryClient.setQueryData(
        QUERY_KEYS.shoppingLists(companyId || ''),
        (old: ShoppingList[] = []) => [newList, ...old]
      )
      toast.success(`Lista "${newList.name}" creata dal template con successo`)
    },
    onError: (error: Error) => {
      console.error('Error creating list from template:', error)
      toast.error(`Errore nella creazione della lista: ${error.message}`)
    },
  })

  // Add item to shopping list
  const addItem = useMutation({
    mutationFn: async ({
      listId,
      item,
    }: {
      listId: string
      item: AddItemInput
    }): Promise<ShoppingListItem> => {
      const { data, error } = await supabase
        .from('shopping_list_items')
        .insert({
          shopping_list_id: listId,
          product_id: item.product_id,
          product_name: item.product_name,
          category_name: item.category_name,
          quantity: item.quantity,
          unit: item.unit || null,
          notes: item.notes || null,
          is_completed: false,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (newItem, { listId }) => {
      // Update the specific list's items
      queryClient.setQueryData(
        QUERY_KEYS.shoppingList(listId),
        (old: ShoppingList | null) => {
          if (!old) return old
          return {
            ...old,
            items: [...old.items, newItem],
            item_count: old.item_count + 1,
            updated_at: new Date().toISOString(),
          }
        }
      )

      // Update the lists overview
      queryClient.setQueryData(
        QUERY_KEYS.shoppingLists(companyId || ''),
        (old: ShoppingList[] = []) =>
          old.map(list =>
            list.id === listId
              ? {
                  ...list,
                  item_count: list.item_count + 1,
                  updated_at: new Date().toISOString(),
                }
              : list
          )
      )

      toast.success(`Prodotto aggiunto alla lista`)
    },
    onError: (error: Error) => {
      console.error('Error adding item to list:', error)
      toast.error(`Errore nell'aggiunta del prodotto: ${error.message}`)
    },
  })

  // Toggle item completion
  const toggleItemCompletion = useMutation({
    mutationFn: async ({
      itemId,
      isCompleted,
    }: {
      itemId: string
      isCompleted: boolean
    }): Promise<ShoppingListItem> => {
      const { data, error } = await supabase
        .from('shopping_list_items')
        .update({
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
        })
        .eq('id', itemId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (updatedItem) => {
      // Update the specific list's items
      queryClient.setQueryData(
        QUERY_KEYS.shoppingList(updatedItem.shopping_list_id),
        (old: ShoppingList | null) => {
          if (!old) return old
          const updatedItems = old.items.map(item =>
            item.id === updatedItem.id ? updatedItem : item
          )
          const completedCount = updatedItems.filter(item => item.is_completed).length

          return {
            ...old,
            items: updatedItems,
            completed_items: completedCount,
            updated_at: new Date().toISOString(),
          }
        }
      )

      toast.success(`Prodotto ${updatedItem.is_completed ? 'segnato come completato' : 'rimosso dalla lista'}`)
    },
    onError: (error: Error) => {
      console.error('Error toggling item completion:', error)
      toast.error(`Errore nell'aggiornamento del prodotto: ${error.message}`)
    },
  })

  // Delete shopping list
  const deleteShoppingList = useMutation({
    mutationFn: async (listId: string): Promise<void> => {
      // Delete items first (foreign key constraint)
      const { error: itemsError } = await supabase
        .from('shopping_list_items')
        .delete()
        .eq('shopping_list_id', listId)

      if (itemsError) throw itemsError

      // Delete the list
      const { error } = await supabase
        .from('shopping_lists')
        .delete()
        .eq('id', listId)

      if (error) throw error
    },
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(
        QUERY_KEYS.shoppingLists(companyId || ''),
        (old: ShoppingList[] = []) => old.filter(list => list.id !== deletedId)
      )
      queryClient.removeQueries({ queryKey: QUERY_KEYS.shoppingList(deletedId) })
      toast.success('Lista eliminata con successo')
    },
    onError: (error: Error) => {
      console.error('Error deleting shopping list:', error)
      toast.error(`Errore nell'eliminazione della lista: ${error.message}`)
    },
  })

  // Statistics
  const stats = {
    total: shoppingLists.length,
    active: shoppingLists.filter(list => !list.is_completed).length,
    completed: shoppingLists.filter(list => list.is_completed).length,
    templates: templates.length,
    totalItems: shoppingLists.reduce((sum, list) => sum + list.item_count, 0),
    completedItems: shoppingLists.reduce((sum, list) => sum + list.completed_items, 0),
  }

  return {
    // Data
    shoppingLists,
    templates,
    stats,

    // Loading states
    isLoading,
    isLoadingTemplates,
    isCreating: createShoppingList.isPending,
    isCreatingFromTemplate: createFromTemplate.isPending,
    isAddingItem: addItem.isPending,
    isTogglingItem: toggleItemCompletion.isPending,
    isDeleting: deleteShoppingList.isPending,

    // Error states
    error,
    createError: createShoppingList.error,
    deleteError: deleteShoppingList.error,

    // Actions
    createShoppingList: createShoppingList.mutate,
    createFromTemplate: createFromTemplate.mutate,
    addItem: addItem.mutate,
    toggleItemCompletion: toggleItemCompletion.mutate,
    deleteShoppingList: deleteShoppingList.mutate,
    refetch,

    // Utils
    useShoppingListDetails,
    getShoppingListById: (id: string) => shoppingLists.find(list => list.id === id),
    getActiveLists: () => shoppingLists.filter(list => !list.is_completed),
    getCompletedLists: () => shoppingLists.filter(list => list.is_completed),
    getTemplates: () => templates,
  }
}

export default useShoppingLists
