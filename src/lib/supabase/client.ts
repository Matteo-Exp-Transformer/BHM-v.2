import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://rcdyadsluzzzsybwrmlz.supabase.co'
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjZHlhZHNsdXp6enN5YndybWx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNzM3ODksImV4cCI6MjA3Mzg0OTc4OX0.m2Jxd5ZwnUtAGuxw_Sj0__kcJUlILdKTJJbwESZP9c4'

// Create Supabase client (singleton pattern)
let supabaseInstance: ReturnType<typeof createClient> | null = null
let supabaseAdminInstance: ReturnType<typeof createClient> | null = null

export const supabase = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage:
          typeof window !== 'undefined' ? window.localStorage : undefined,
      },
    })
  }
  return supabaseInstance
})()

// Service role client (for admin operations - server-side only)
const supabaseServiceKey =
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjZHlhZHNsdXp6enN5YndybWx6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODI3Mzc4OSwiZXhwIjoyMDczODQ5Nzg5fQ.QT-P0WDDOD8AsM3LVCpz0LAjr-7O-D8nQhSs8YMBuLY'

export const supabaseAdmin = (() => {
  if (!supabaseAdminInstance) {
    supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }
  return supabaseAdminInstance
})()

// Database types (will be generated from schema)
export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          address: string
          staff_count: number
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address: string
          staff_count: number
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          staff_count?: number
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          clerk_user_id: string
          company_id: string | null
          email: string
          first_name: string | null
          last_name: string | null
          staff_id: string | null
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          clerk_user_id: string
          company_id?: string | null
          email: string
          first_name?: string | null
          last_name?: string | null
          staff_id?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          clerk_user_id?: string
          company_id?: string | null
          email?: string
          first_name?: string | null
          last_name?: string | null
          staff_id?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      staff: {
        Row: {
          id: string
          company_id: string
          name: string
          role: string
          category: string
          email: string | null
          phone: string | null
          hire_date: string | null
          status: string
          notes: string | null
          haccp_certification: Record<string, unknown> | null
          department_assignments: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          role: string
          category: string
          email?: string | null
          phone?: string | null
          hire_date?: string | null
          status?: string
          notes?: string | null
          haccp_certification?: Record<string, unknown> | null
          department_assignments?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          role?: string
          category?: string
          email?: string | null
          phone?: string | null
          hire_date?: string | null
          status?: string
          notes?: string | null
          haccp_certification?: Record<string, unknown> | null
          department_assignments?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      departments: {
        Row: {
          id: string
          company_id: string
          name: string
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      product_categories: {
        Row: {
          id: string
          company_id: string
          name: string
          description: string | null
          temperature_requirements: Record<string, unknown> | null
          default_expiry_days: number | null
          allergen_info: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          description?: string | null
          temperature_requirements?: Record<string, unknown> | null
          default_expiry_days?: number | null
          allergen_info?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          description?: string | null
          temperature_requirements?: Record<string, unknown> | null
          default_expiry_days?: number | null
          allergen_info?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          company_id: string
          name: string
          category_id: string | null
          department_id: string | null
          conservation_point_id: string | null
          barcode: string | null
          sku: string | null
          supplier_name: string | null
          purchase_date: string | null
          expiry_date: string | null
          quantity: number | null
          unit: string | null
          allergens: string[]
          label_photo_url: string | null
          status: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          category_id?: string | null
          department_id?: string | null
          conservation_point_id?: string | null
          barcode?: string | null
          sku?: string | null
          supplier_name?: string | null
          purchase_date?: string | null
          expiry_date?: string | null
          quantity?: number | null
          unit?: string | null
          allergens?: string[]
          label_photo_url?: string | null
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          category_id?: string | null
          department_id?: string | null
          conservation_point_id?: string | null
          barcode?: string | null
          sku?: string | null
          supplier_name?: string | null
          purchase_date?: string | null
          expiry_date?: string | null
          quantity?: number | null
          unit?: string | null
          allergens?: string[]
          label_photo_url?: string | null
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      conservation_points: {
        Row: {
          id: string
          company_id: string
          department_id: string | null
          name: string
          description: string | null
          setpoint_temp: number | null
          temp_min: number | null
          temp_max: number | null
          point_type: string
          is_blast_chiller: boolean
          product_categories: string[] | null
          status: string
          last_maintenance: string | null
          next_maintenance: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          department_id?: string | null
          name: string
          description?: string | null
          setpoint_temp?: number | null
          temp_min?: number | null
          temp_max?: number | null
          point_type: string
          is_blast_chiller?: boolean
          product_categories?: string[] | null
          status?: string
          last_maintenance?: string | null
          next_maintenance?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          department_id?: string | null
          name?: string
          description?: string | null
          setpoint_temp?: number | null
          temp_min?: number | null
          temp_max?: number | null
          point_type?: string
          is_blast_chiller?: boolean
          product_categories?: string[] | null
          status?: string
          last_maintenance?: string | null
          next_maintenance?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      temperature_readings: {
        Row: {
          id: string
          company_id: string
          conservation_point_id: string
          reading_value: number
          target_temp: number
          tolerance_range: number
          reading_time: string
          recorded_by: string
          notes: string | null
          photo_evidence: string[] | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          conservation_point_id: string
          reading_value: number
          target_temp: number
          tolerance_range: number
          reading_time: string
          recorded_by: string
          notes?: string | null
          photo_evidence?: string[] | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          conservation_point_id?: string
          reading_value?: number
          target_temp?: number
          tolerance_range?: number
          reading_time?: string
          recorded_by?: string
          notes?: string | null
          photo_evidence?: string[] | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      maintenance_tasks: {
        Row: {
          id: string
          company_id: string
          conservation_point_id: string
          task_name: string
          description: string | null
          frequency: string
          kind: string
          is_active: boolean
          assigned_to: string
          last_completed: string | null
          next_due: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          conservation_point_id: string
          task_name: string
          description?: string | null
          frequency: string
          kind: string
          is_active?: boolean
          assigned_to: string
          last_completed?: string | null
          next_due?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          conservation_point_id?: string
          task_name?: string
          description?: string | null
          frequency?: string
          kind?: string
          is_active?: boolean
          assigned_to?: string
          last_completed?: string | null
          next_due?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      maintenance_completions: {
        Row: {
          id: string
          company_id: string
          maintenance_task_id: string
          status: string
          notes: string | null
          completed_by: string
          completed_at: string
          photo_evidence: string[] | null
          next_due_date: string | null
          temperature_value: number | null
          checklist_completed: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          maintenance_task_id: string
          status: string
          notes?: string | null
          completed_by: string
          completed_at: string
          photo_evidence?: string[] | null
          next_due_date?: string | null
          temperature_value?: number | null
          checklist_completed: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          maintenance_task_id?: string
          status?: string
          notes?: string | null
          completed_by?: string
          completed_at?: string
          photo_evidence?: string[] | null
          next_due_date?: string | null
          temperature_value?: number | null
          checklist_completed?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      calendar_events: {
        Row: {
          id: string
          company_id: string
          title: string
          description: string | null
          start_date: string
          end_date: string | null
          event_type: string
          department_id: string | null
          assigned_to: string | null
          priority: string
          status: string
          is_recurring: boolean
          recurrence_pattern: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          title: string
          description?: string | null
          start_date: string
          end_date?: string | null
          event_type: string
          department_id?: string | null
          assigned_to?: string | null
          priority?: string
          status?: string
          is_recurring?: boolean
          recurrence_pattern?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          title?: string
          description?: string | null
          start_date?: string
          end_date?: string | null
          event_type?: string
          department_id?: string | null
          assigned_to?: string | null
          priority?: string
          status?: string
          is_recurring?: boolean
          recurrence_pattern?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Helper function to test connection
export const testConnection = async () => {
  try {
    console.log('🔍 Testing Supabase connection...')
    console.log('Supabase URL:', supabaseUrl)
    console.log('Supabase instance:', !!supabase)

    // Test basic connection first
    const { data: healthData, error: healthError } = await supabase
      .from('companies')
      .select('count')
      .limit(1)

    if (healthError) {
      console.error('❌ Health check failed:', healthError)
      return { success: false, error: healthError }
    }

    console.log('✅ Supabase connection successful:', healthData)
    return { success: true, data: healthData }
  } catch (error) {
    console.error('❌ Supabase connection failed:', error)
    return { success: false, error }
  }
}

// Export types for use in components
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
