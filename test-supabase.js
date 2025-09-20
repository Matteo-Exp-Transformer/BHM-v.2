// Test diretto della connessione Supabase
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rcdyadsluzzzsybwrmlz.supabase.co'
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjZHlhZHNsdXp6enN5YndybWx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNzM3ODksImV4cCI6MjA3Mzg0OTc4OX0.m2Jxd5ZwnUtAGuxw_Sj0__kcJUlILdKTJJbwESZP9c4'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('🔍 Testing Supabase connection...')

  try {
    // Test 1: Health check
    const { data, error } = await supabase
      .from('companies')
      .select('count')
      .limit(1)

    if (error) {
      console.error('❌ Connection failed:', error.message)
      return false
    }

    console.log('✅ Supabase connection successful!')
    console.log('📊 Data:', data)

    // Test 2: Check tables
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['companies', 'user_profiles', 'departments'])

    if (tablesError) {
      console.log('⚠️ Tables check failed:', tablesError.message)
    } else {
      console.log(
        '✅ Tables found:',
        tables?.map(t => t.table_name)
      )
    }

    return true
  } catch (error) {
    console.error('❌ Test failed:', error)
    return false
  }
}

testConnection()
