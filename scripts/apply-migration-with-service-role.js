/**
 * Applica migration 014 usando Service Role Key
 * Questo script usa le credenziali admin per eseguire DDL
 */

import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '..', '.env') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  console.error('❌ VITE_SUPABASE_URL non trovato')
  process.exit(1)
}

if (!serviceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY non trovato in .env')
  console.log('\n📋 Aggiungi al file .env:')
  console.log('SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...')
  console.log('\nTrova la chiave su: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api')
  process.exit(1)
}

console.log('🔗 Connessione a:', supabaseUrl)
console.log('🔑 Uso Service Role Key\n')

// Leggi migration SQL
const migrationPath = join(__dirname, '..', 'database', 'migrations', '014_add_recurrence_config_to_tasks.sql')
const migrationSQL = readFileSync(migrationPath, 'utf-8')

// Esegui SQL via REST API di Supabase
const apiUrl = `${supabaseUrl}/rest/v1/rpc/exec_sql`

async function executeMigration() {
  console.log('🚀 Esecuzione migration 014...\n')

  // Dividi in comandi separati
  const commands = [
    `ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS recurrence_config JSONB DEFAULT NULL;`,
    `COMMENT ON COLUMN public.tasks.recurrence_config IS 'Configurazione ricorrenza';`,
    `CREATE INDEX IF NOT EXISTS idx_tasks_recurrence_config ON public.tasks USING gin(recurrence_config);`
  ]

  for (let i = 0; i < commands.length; i++) {
    const cmd = commands[i]
    console.log(`📝 Comando ${i + 1}/${commands.length}:`)
    console.log(`   ${cmd.substring(0, 60)}...`)

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`
        },
        body: JSON.stringify({ query: cmd })
      })

      if (!response.ok) {
        const error = await response.text()
        console.log(`   ⚠️ Errore API: ${error}`)
        continue
      }

      console.log('   ✅ Eseguito')

    } catch (err) {
      console.log(`   ❌ Errore: ${err.message}`)
    }
  }

  console.log('\n🧪 Verifica finale...')

  // Verifica con query diretta
  const checkUrl = `${supabaseUrl}/rest/v1/tasks?select=id,recurrence_config&limit=1`

  try {
    const response = await fetch(checkUrl, {
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`
      }
    })

    if (response.ok) {
      console.log('✅ Colonna recurrence_config verificata!')
      console.log('\n✅ MIGRATION 014 COMPLETATA CON SUCCESSO\n')
      return true
    } else {
      console.log('❌ Verifica fallita')
      return false
    }

  } catch (err) {
    console.log('❌ Errore verifica:', err.message)
    return false
  }
}

executeMigration().then(success => {
  if (!success) {
    console.log('\n⚠️ FALLBACK: Esegui manualmente su Supabase SQL Editor')
    console.log('=' .repeat(60))
    console.log(migrationSQL)
    console.log('=' .repeat(60))
    process.exit(1)
  }
})
