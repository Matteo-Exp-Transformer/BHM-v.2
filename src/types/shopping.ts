export type ShoppingListStatus = 'draft' | 'sent' | 'completed' | 'cancelled'

export interface ShoppingList {
  id: string
  company_id: string
  name: string
  description?: string
  notes?: string
  created_by: string
  status: ShoppingListStatus
  is_template: boolean
  is_completed: boolean
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface ShoppingListItem {
  id: string
  shopping_list_id: string
  product_id?: string
  product_name: string
  category_name: string
  quantity: number
  unit?: string
  notes?: string
  is_checked: boolean
  is_completed: boolean
  checked_at?: string
  completed_at?: string
  added_at: string
  created_at: string
  updated_at: string
}

export interface ShoppingListWithStats extends ShoppingList {
  creator_email?: string
  total_items: number
  checked_items: number
  completion_percentage: number
}

export interface ShoppingListWithItems extends ShoppingList {
  items: ShoppingListItem[]
  total_items: number
  checked_items: number
  completion_percentage: number
}

export interface CreateShoppingListInput {
  name: string
  description?: string
  notes?: string
  items: CreateShoppingListItemInput[]
}

export interface CreateShoppingListItemInput {
  product_id?: string
  product_name: string
  category_name: string
  quantity: number
  unit?: string
  notes?: string
}

export interface UpdateShoppingListInput {
  name?: string
  description?: string
  notes?: string
  status?: ShoppingListStatus
}

export interface ShoppingListFilters {
  status?: ShoppingListStatus
  created_by?: string
  is_template?: boolean
  start_date?: string
  end_date?: string
  limit?: number
  offset?: number
}

export interface ProductForSelection {
  id: string
  name: string
  category_id?: string
  category_name?: string
  department_id?: string
  department_name?: string
  conservation_point_id?: string
  conservation_point_name?: string
  quantity?: number
  unit?: string
  expiry_date?: string
  status: string
}

export interface ProductSelectionState {
  selectedProductIds: Set<string>
  products: ProductForSelection[]
}
