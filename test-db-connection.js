import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fszfphkhthyfwnfqwqjy.supabase.co'
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzemZwaGtodGh5ZnduZnF3cWp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY4MzQyODAsImV4cCI6MjA0MjQxMDI4MH0.hJSKdXmQo04_Qsj0f4j9GHOOTVmPXyMhYnzW1KBj3Yo'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('Testing database connection...')

    // Test companies table
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .limit(1)

    if (companiesError) {
      console.error('Error querying companies:', companiesError)
    } else {
      console.log(
        '✅ Companies table accessible:',
        companies?.length > 0 ? 'with data' : 'empty'
      )
    }

    // Test user_profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1)

    if (profilesError) {
      console.error('Error querying user_profiles:', profilesError)
    } else {
      console.log(
        '✅ User profiles table accessible:',
        profiles?.length > 0 ? 'with data' : 'empty'
      )
    }

    // Test staff table
    const { data: staff, error: staffError } = await supabase
      .from('staff')
      .select('*')
      .limit(1)

    if (staffError) {
      console.error('Error querying staff:', staffError)
    } else {
      console.log(
        '✅ Staff table accessible:',
        staff?.length > 0 ? 'with data' : 'empty'
      )
    }

    console.log('Database connection test completed!')
  } catch (error) {
    console.error('Connection test failed:', error)
  }
}

testConnection()
