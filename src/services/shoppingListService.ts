import { supabase } from '@/lib/supabase/client'
import type {
  ShoppingList,
  ShoppingListItem,
  ShoppingListWithStats,
  ShoppingListWithItems,
  CreateShoppingListInput,
  UpdateShoppingListInput,
  ShoppingListFilters,
} from '../types/shopping'

export const shoppingListService = {
  async createShoppingList(
    companyId: string,
    input: CreateShoppingListInput
  ): Promise<{
    success: boolean
    data?: ShoppingList
    error?: string
  }> {
    try {
      const itemsJson = input.items.map((item) => ({
        product_id: item.product_id || null,
        product_name: item.product_name,
        category_name: item.category_name,
        quantity: item.quantity,
        unit: item.unit || null,
        notes: item.notes || null,
      }))

      const { data, error } = await supabase.rpc(
        'create_shopping_list_with_items',
        {
          p_company_id: companyId,
          p_list_name: input.name,
          p_description: input.description || null,
          p_notes: input.notes || null,
          p_items: itemsJson,
        }
      )

      if (error) {
        console.error('Error creating shopping list:', error)
        return { success: false, error: error.message }
      }

      const { data: createdList, error: fetchError } = await supabase
        .from('shopping_lists')
        .select('*')
        .eq('id', data)
        .single()

      if (fetchError) {
        return { success: false, error: fetchError.message }
      }

      return { success: true, data: createdList }
    } catch (err) {
      console.error('Exception creating shopping list:', err)
      return { success: false, error: String(err) }
    }
  },

  async getShoppingLists(
    companyId: string,
    filters?: ShoppingListFilters
  ): Promise<{
    success: boolean
    data?: ShoppingListWithStats[]
    error?: string
  }> {
    try {
      const { data, error } = await supabase.rpc(
        'get_shopping_lists_with_stats',
        {
          p_company_id: companyId,
          p_status: filters?.status || null,
          p_limit: filters?.limit || 50,
          p_offset: filters?.offset || 0,
        }
      )

      if (error) {
        console.error('Error fetching shopping lists:', error)
        return { success: false, error: error.message }
      }

      return { success: true, data: data || [] }
    } catch (err) {
      console.error('Exception fetching shopping lists:', err)
      return { success: false, error: String(err) }
    }
  },

  async getShoppingListById(
    listId: string
  ): Promise<{
    success: boolean
    data?: ShoppingListWithItems
    error?: string
  }> {
    try {
      const { data: list, error: listError } = await supabase
        .from('shopping_lists')
        .select('*')
        .eq('id', listId)
        .single()

      if (listError) {
        console.error('Error fetching shopping list:', listError)
        return { success: false, error: listError.message }
      }

      const { data: items, error: itemsError } = await supabase
        .from('shopping_list_items')
        .select('*')
        .eq('shopping_list_id', listId)
        .order('added_at', { ascending: true })

      if (itemsError) {
        console.error('Error fetching shopping list items:', itemsError)
        return { success: false, error: itemsError.message }
      }

      const totalItems = items?.length || 0
      const checkedItems = items?.filter((item) => item.is_checked).length || 0
      const completionPercentage =
        totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0

      return {
        success: true,
        data: {
          ...list,
          items: items || [],
          total_items: totalItems,
          checked_items: checkedItems,
          completion_percentage: completionPercentage,
        },
      }
    } catch (err) {
      console.error('Exception fetching shopping list:', err)
      return { success: false, error: String(err) }
    }
  },

  async updateShoppingList(
    listId: string,
    input: UpdateShoppingListInput
  ): Promise<{
    success: boolean
    data?: ShoppingList
    error?: string
  }> {
    try {
      const { data, error } = await supabase
        .from('shopping_lists')
        .update({
          name: input.name,
          description: input.description,
          notes: input.notes,
          status: input.status,
        })
        .eq('id', listId)
        .select()
        .single()

      if (error) {
        console.error('Error updating shopping list:', error)
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (err) {
      console.error('Exception updating shopping list:', err)
      return { success: false, error: String(err) }
    }
  },

  async deleteShoppingList(listId: string): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      const { error } = await supabase
        .from('shopping_lists')
        .delete()
        .eq('id', listId)

      if (error) {
        console.error('Error deleting shopping list:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (err) {
      console.error('Exception deleting shopping list:', err)
      return { success: false, error: String(err) }
    }
  },

  async addItemToList(
    listId: string,
    item: {
      product_id?: string
      product_name: string
      category_name: string
      quantity: number
      unit?: string
      notes?: string
    }
  ): Promise<{
    success: boolean
    data?: ShoppingListItem
    error?: string
  }> {
    try {
      const { data, error } = await supabase
        .from('shopping_list_items')
        .insert({
          shopping_list_id: listId,
          product_id: item.product_id,
          product_name: item.product_name,
          category_name: item.category_name,
          quantity: item.quantity,
          unit: item.unit,
          notes: item.notes,
        })
        .select()
        .single()

      if (error) {
        console.error('Error adding item to list:', error)
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (err) {
      console.error('Exception adding item to list:', err)
      return { success: false, error: String(err) }
    }
  },

  async checkItem(
    itemId: string,
    checked: boolean
  ): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      const { error } = await supabase.rpc('toggle_shopping_list_item', {
        p_item_id: itemId,
        p_checked: checked,
      })

      if (error) {
        console.error('Error checking item:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (err) {
      console.error('Exception checking item:', err)
      return { success: false, error: String(err) }
    }
  },

  async completeList(listId: string): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      const { error } = await supabase.rpc('complete_shopping_list', {
        p_list_id: listId,
      })

      if (error) {
        console.error('Error completing shopping list:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (err) {
      console.error('Exception completing shopping list:', err)
      return { success: false, error: String(err) }
    }
  },
}
