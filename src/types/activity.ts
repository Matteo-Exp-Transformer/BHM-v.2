export type ActivityType =
  | 'session_start'
  | 'session_end'
  | 'task_completed'
  | 'product_added'
  | 'product_updated'
  | 'product_deleted'
  | 'product_transferred'
  | 'shopping_list_created'
  | 'shopping_list_updated'
  | 'shopping_list_completed'
  | 'department_created'
  | 'staff_added'
  | 'conservation_point_created'
  | 'maintenance_task_created'
  | 'temperature_reading_added'
  | 'note_created'
  | 'non_conformity_reported'
  | 'page_view'
  | 'export_data'

export type EntityType =
  | 'maintenance_task'
  | 'generic_task'
  | 'product'
  | 'shopping_list'
  | 'department'
  | 'staff'
  | 'conservation_point'
  | 'temperature_reading'
  | 'note'
  | 'non_conformity'

export interface UserActivityLog {
  id: string
  user_id: string
  company_id: string
  session_id?: string
  activity_type: ActivityType
  activity_data: Record<string, any>
  entity_type?: EntityType
  entity_id?: string
  timestamp: string
  ip_address?: string
  user_agent?: string
  created_at: string
}

export interface SessionActivityData {
  login_method?: 'email' | 'magic_link'
  device_type?: 'desktop' | 'mobile' | 'tablet'
  duration_minutes?: number
  logout_type?: 'manual' | 'timeout' | 'auto'
}

export interface TaskCompletedActivityData {
  task_name: string
  task_type: 'temperature' | 'sanitization' | 'defrosting' | 'generic'
  department_name?: string
  conservation_point_name?: string
  completed_value?: number
  notes?: string
}

export interface ProductActivityData {
  product_name: string
  category?: string
  department?: string
  conservation_point?: string
  quantity?: number
  unit?: string
}

export interface ShoppingListActivityData {
  list_name: string
  items_count: number
  total_products?: number
  categories?: string[]
}

export interface ActivityFilters {
  activity_type?: ActivityType
  user_id?: string
  start_date?: string
  end_date?: string
  limit?: number
  offset?: number
}

export interface ActivityWithUser extends UserActivityLog {
  user_email?: string
}

export interface ActivityStatistics {
  activity_type: ActivityType
  activity_count: number
  unique_users: number
  last_activity: string
}

export interface UserSession {
  id: string
  user_id: string
  active_company_id: string
  session_start: string
  session_end?: string
  last_activity: string
  is_active: boolean
  ip_address?: string
  user_agent?: string
  created_at: string
  updated_at: string
}

export interface ActiveSessionInfo {
  session_id: string
  user_id: string
  user_email: string
  session_start: string
  last_activity: string
  duration_minutes: number
  ip_address?: string
  user_agent?: string
}
