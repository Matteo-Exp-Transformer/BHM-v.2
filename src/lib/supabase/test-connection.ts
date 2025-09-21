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

    // Test 3: Test key tables accessibility (direct table queries)
    const tablesToTest = ['companies', 'user_profiles', 'departments', 'staff'];
    const accessibleTables = [];

    for (const tableName of tablesToTest) {
      try {
        const { error } = await supabase
          .from(tableName)
          .select('count')
          .limit(1);

        if (!error) {
          accessibleTables.push(tableName);
        }
      } catch (err) {
        // Table might not exist or not accessible
      }
    }

    console.log('✅ Accessible tables:', accessibleTables);

    console.log('🎉 Supabase connection test completed successfully!')
    return {
      success: true,
      data: {
        healthCheck,
        userProfiles,
        accessibleTables
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
