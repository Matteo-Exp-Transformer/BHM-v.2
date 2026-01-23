/**
 * Script per verificare e applicare migration 014 - recurrence_config
 * Usa Supabase client direttamente
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Carica .env
dotenv.config({ path: join(__dirname, '..', '.env') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERRORE: VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY non trovati in .env')
  process.exit(1)
}

console.log('🔗 Connessione a Supabase:', supabaseUrl)

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkMigration() {
  console.log('\n🔍 STEP 1: Verifica esistenza colonna recurrence_config...')

  // Query per verificare esistenza colonna
  const { data, error } = await supabase.rpc('check_column_exists', {
    p_schema: 'public',
    p_table: 'tasks',
    p_column: 'recurrence_config'
  }).single()

  if (error) {
    // RPC potrebbe non esistere, proviamo query diretta
    console.log('⚠️ RPC non disponibile, uso query diretta...')

    // Proviamo a fare una query su tasks e vedere se ha la colonna
    const { data: testData, error: testError } = await supabase
      .from('tasks')
      .select('recurrence_config')
      .limit(1)

    if (testError) {
      if (testError.message?.includes('column') && testError.message?.includes('does not exist')) {
        console.log('❌ Colonna recurrence_config NON ESISTE')
        return false
      }
      console.error('❌ Errore verifica:', testError)
      return false
    }

    console.log('✅ Colonna recurrence_config ESISTE')
    return true
  }

  return data
}

async function applyMigration() {
  console.log('\n🔧 STEP 2: Applicazione migration 014...')

  // Leggi file migration
  const migrationPath = join(__dirname, '..', 'database', 'migrations', '014_add_recurrence_config_to_tasks.sql')
  let migrationSQL

  try {
    migrationSQL = readFileSync(migrationPath, 'utf-8')
    console.log('✅ File migration caricato')
  } catch (err) {
    console.error('❌ Errore lettura file migration:', err.message)
    process.exit(1)
  }

  // Estrai solo i comandi SQL eseguibili (rimuovi commenti e DO block)
  const commands = [
    `ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS recurrence_config JSONB DEFAULT NULL;`,
    `CREATE INDEX IF NOT EXISTS idx_tasks_recurrence_config ON public.tasks USING gin(recurrence_config);`
  ]

  console.log('\n📝 Esecuzione comandi SQL...')

  for (const cmd of commands) {
    console.log(`\n   Executing: ${cmd.substring(0, 60)}...`)

    const { error } = await supabase.rpc('exec_sql', { sql_query: cmd })

    if (error) {
      // RPC exec_sql potrebbe non esistere
      console.log('⚠️ RPC exec_sql non disponibile')
      console.log('📋 ESEGUI MANUALMENTE questo SQL su Supabase SQL Editor:')
      console.log('\n' + '='.repeat(60))
      console.log(migrationSQL)
      console.log('='.repeat(60) + '\n')
      return false
    }
  }

  console.log('\n✅ Migration 014 applicata con successo!')
  return true
}

async function verifyMigration() {
  console.log('\n🧪 STEP 3: Verifica finale...')

  // Prova a fare una query con recurrence_config
  const { data, error } = await supabase
    .from('tasks')
    .select('id, name, recurrence_config')
    .limit(5)

  if (error) {
    console.error('❌ Errore verifica finale:', error)
    return false
  }

  console.log(`✅ Query su recurrence_config riuscita (${data?.length || 0} tasks trovati)`)

  if (data && data.length > 0) {
    const withConfig = data.filter(t => t.recurrence_config !== null)
    console.log(`   - Tasks con recurrence_config: ${withConfig.length}/${data.length}`)
  }

  return true
}

async function main() {
  console.log('🚀 Verifica e Applicazione Migration 014 - recurrence_config')
  console.log('=' .repeat(60))

  try {
    const exists = await checkMigration()

    if (exists) {
      console.log('\n✅ Migration 014 già applicata! Nessuna azione necessaria.')
      await verifyMigration()
    } else {
      console.log('\n⚠️ Migration 014 NON applicata, procedo...')
      const applied = await applyMigration()

      if (!applied) {
        console.log('\n❌ Impossibile applicare migration automaticamente.')
        console.log('   Apri Supabase SQL Editor e esegui manualmente la migration.')
        process.exit(1)
      }

      await verifyMigration()
    }

    console.log('\n✅ COMPLETATO')

  } catch (err) {
    console.error('\n❌ ERRORE:', err)
    console.log('\n📋 SOLUZIONE MANUALE:')
    console.log('   1. Apri Supabase Dashboard')
    console.log('   2. Vai in SQL Editor')
    console.log('   3. Esegui: database/migrations/014_add_recurrence_config_to_tasks.sql')
    process.exit(1)
  }
}

main()
