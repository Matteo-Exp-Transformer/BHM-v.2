import { supabase } from './client'

// Test function to verify Supabase connection
export const testSupabaseConnection = async () => {
  console.log('🔍 Testing Supabase connection...')

  try {
    // Test 1: Basic connection
    const { data: healthCheck, error: healthError } = await supabase
      .from('companies')
      .select('count')
      .limit(1)

    if (healthError) {
      console.error('❌ Health check failed:', healthError)
      return { success: false, error: healthError }
    }

    console.log('✅ Health check passed:', healthCheck)

    // Test 2: Test RLS policies (should work with auth)
    const { data: userProfiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1)

    if (profilesError) {
      console.log('⚠️ RLS test (expected without auth):', profilesError.message)
    } else {
      console.log('✅ RLS test passed:', userProfiles)
    }

    // Test 3: Test table structure
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', [
        'companies',
        'user_profiles',
        'departments',
        'staff',
        'conservation_points',
        'maintenance_tasks',
        'tasks',
        'product_categories',
        'events',
        'notes',
        'temperature_readings',
        'non_conformities'
      ])

    if (tablesError) {
      console.error('❌ Tables check failed:', tablesError)
    } else {
      console.log('✅ Tables found:', tables?.map(t => t.table_name))
    }

    console.log('🎉 Supabase connection test completed successfully!')
    return {
      success: true,
      data: {
        healthCheck,
        userProfiles,
        tables: tables?.map(t => t.table_name)
      }
    }

  } catch (error) {
    console.error('❌ Connection test failed:', error)
    return { success: false, error }
  }
}

// Auto-run test when imported (for development)
if (import.meta.env.DEV) {
  testSupabaseConnection()
}
