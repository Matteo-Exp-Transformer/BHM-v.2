import { createClient } from '@supabase/supabase-js'

// TODO: Generate proper types from database schema
// Run: npx supabase gen types typescript --project-id [PROJECT_ID] > src/types/database.types.ts
// Then import: import type { Database } from '@/types/database.types'
// And type the client: SupabaseClient<Database>

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase configuration. Please check your .env.local file:\n' +
    '- VITE_SUPABASE_URL\n' +
    '- VITE_SUPABASE_ANON_KEY'
  )
}

// Create Supabase client (singleton pattern)
// TODO: Replace 'any' with proper type after generating database.types.ts
// Should be: SupabaseClient<Database> | null
let supabaseInstance: any = null
// let supabaseAdminInstance: any = null

export const supabase = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage:
          typeof window !== 'undefined' ? window.localStorage : undefined,
        storageKey: 'bhm-supabase-auth',
        // ✅ REMEMBER ME: Configurazione per sessioni estese
        flowType: 'pkce',
        debug: import.meta.env.DEV,
      },
      global: {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
    })
  }
  return supabaseInstance
})()

// Note: Service role client should NEVER be used in frontend code
// It's only for server-side operations (Edge Functions, etc.)

// Database types for type safety in components
export interface Company {
  id: string
  name: string
  address?: string
  phone?: string
  email?: string
  vat_number?: string
  business_type?: string
  established_date?: string
  license_number?: string
  created_at: string
  updated_at: string
}

// ⚠️ DEPRECATED: UserProfile table è in fase di deprecazione
// Usa invece company_members + auth.users per multi-tenant
export interface UserProfile {
  id: string
  clerk_user_id?: string // DEPRECATO - vecchio sistema Clerk
  auth_user_id?: string  // NUOVO - Supabase Auth user ID
  email: string
  first_name?: string
  last_name?: string
  company_id?: string // DEPRECATO - usa company_members
  staff_id?: string
  role?: 'admin' | 'responsabile' | 'dipendente' | 'collaboratore' | 'guest' // DEPRECATO - usa company_members
  created_at: string
  updated_at: string
}

export interface Staff {
  id: string
  company_id: string
  name: string
  role: 'admin' | 'responsabile' | 'dipendente' | 'collaboratore'
  category: string
  email?: string
  phone?: string
  haccp_certification?: {
    level: 'base' | 'advanced'
    expiry_date: string
    issuing_authority: string
    certificate_number: string
  }
  department_assignments: string[]
  hire_date: string
  status?: 'active' | 'inactive' | 'suspended'
  notes?: string
  created_at: string
  updated_at: string
}

export interface Department {
  id: string
  company_id: string
  name: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProductCategory {
  id: string
  company_id: string
  name: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  company_id: string
  name: string
  category_id?: string
  department_id?: string
  conservation_point_id?: string
  barcode?: string
  sku?: string
  supplier_name?: string
  allergens: string[]
  purchase_date?: Date
  expiry_date?: Date
  quantity: number
  unit: string
  status: 'active' | 'expired' | 'consumed' | 'waste'
  notes?: string
  created_at: string
  updated_at: string
}

export interface ConservationPoint {
  id: string
  company_id: string
  name: string
  type: 'fridge' | 'freezer' | 'ambient' | 'blast'
  location: string
  temperature_min?: number
  temperature_max?: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TemperatureReading {
  id: string
  company_id: string
  conservation_point_id: string
  temperature: number
  reading_time: string
  recorded_by: string
  notes?: string
  created_at: string
}

export interface MaintenanceTask {
  id: string
  company_id: string
  conservation_point_id: string
  task_type: 'cleaning' | 'calibration' | 'inspection' | 'repair'
  title: string
  description?: string
  due_date: string
  assigned_to?: string
  status: 'pending' | 'in_progress' | 'completed' | 'overdue'
  priority: 'low' | 'medium' | 'high' | 'critical'
  created_at: string
  updated_at: string
}

export interface MaintenanceCompletion {
  id: string
  task_id: string
  completed_by: string
  completed_at: string
  notes?: string
  photos?: string[]
  created_at: string
}

export interface CalendarEvent {
  id: string
  company_id: string
  title: string
  description?: string
  start_date: string
  end_date?: string
  event_type: 'maintenance' | 'training' | 'inspection' | 'meeting' | 'other'
  assigned_to?: string
  is_all_day: boolean
  location?: string
  created_at: string
  updated_at: string
}

export interface ShoppingList {
  id: string
  company_id: string
  name: string
  description?: string
  created_by: string
  is_template: boolean
  is_completed: boolean
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
  is_completed: boolean
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface HACCPConfiguration {
  id: string
  company_id: string
  temperature_thresholds?: {
    fridge_min: number
    fridge_max: number
    freezer_min: number
    freezer_max: number
    ambient_min: number
    ambient_max: number
    blast_min: number
    blast_max: number
  }
  alert_settings?: {
    temperature_violations: boolean
    expiry_alerts: boolean
    maintenance_reminders: boolean
    certification_expiry: boolean
  }
  compliance_requirements?: {
    daily_temperature_checks: boolean
    weekly_maintenance: boolean
    monthly_audits: boolean
    quarterly_training: boolean
  }
  created_at: string
  updated_at: string
}

export interface NotificationPreferences {
  id: string
  company_id: string
  user_id: string
  email_notifications?: {
    temperature_violations: boolean
    expiry_alerts: boolean
    maintenance_reminders: boolean
    certification_expiry: boolean
    system_updates: boolean
    daily_summary: boolean
    weekly_report: boolean
  }
  push_notifications?: {
    temperature_violations: boolean
    expiry_alerts: boolean
    maintenance_reminders: boolean
    certification_expiry: boolean
  }
  sms_notifications?: {
    critical_alerts: boolean
    emergency_contacts: string[]
  }
  created_at: string
  updated_at: string
}
