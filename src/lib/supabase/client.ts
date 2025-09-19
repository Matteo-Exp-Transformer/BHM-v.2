import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rcdyadsluzzzsybwrmlz.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjZHlhZHNsdXp6enN5YndybWx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNzM3ODksImV4cCI6MjA3Mzg0OTc4OX0.m2Jxd5ZwnUtAGuxw_Sj0__kcJUlILdKTJJbwESZP9c4'

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Service role client (for admin operations - server-side only)
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjZHlhZHNsdXp6enN5YndybWx6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODI3Mzc4OSwiZXhwIjoyMDczODQ5Nzg5fQ.QT-P0WDDOD8AsM3LVCpz0LAjr-7O-D8nQhSs8YMBuLY'

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

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
          created_at?: string
          updated_at?: string
        }
      }
      // Add other tables as needed...
    }
  }
}

// Helper function to test connection
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('companies').select('count')
    if (error) throw error
    console.log('✅ Supabase connection successful:', data)
    return { success: true, data }
  } catch (error) {
    console.error('❌ Supabase connection failed:', error)
    return { success: false, error }
  }
}

// Export types for use in components
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
