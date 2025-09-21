// Test delle tabelle del nostro schema
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rcdyadsluzzzsybwrmlz.supabase.co'
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjZHlhZHNsdXp6enN5YndybWx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNzM3ODksImV4cCI6MjA3Mzg0OTc4OX0.m2Jxd5ZwnUtAGuxw_Sj0__kcJUlILdKTJJbwESZP9c4'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testTables() {
  console.log('🔍 Testing database tables...')

  const tables = [
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
    'non_conformities',
  ]

  let successCount = 0

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1)

      if (error) {
        console.log(`❌ ${table}: ${error.message}`)
      } else {
        console.log(`✅ ${table}: OK (${data?.[0]?.count || 0} records)`)
        successCount++
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`)
    }
  }

  console.log(
    `\n📊 Results: ${successCount}/${tables.length} tables accessible`
  )

  if (successCount === tables.length) {
    console.log('🎉 All tables are working correctly!')
  } else {
    console.log('⚠️ Some tables may not be created yet')
  }
}

testTables()
