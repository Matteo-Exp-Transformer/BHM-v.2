#!/usr/bin/env node
/**
 * Script di debug per BUG-005: Eventi nei giorni chiusi
 *
 * Esegui con: node scripts/debug-calendar-bug.js
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Carica .env.local
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERRORE: VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY non trovati in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 Debug BUG-005: Eventi nei giorni chiusi\n')
console.log('=' .repeat(80))

// Helper per formattare i risultati
const formatTable = (data, maxRows = 10) => {
  if (!data || data.length === 0) {
    console.log('  (nessun risultato)')
    return
  }

  const rows = data.slice(0, maxRows)
  console.table(rows)

  if (data.length > maxRows) {
    console.log(`  ... e altri ${data.length - maxRows} risultati`)
  }
}

// 1. Verifica Calendar Settings
async function checkCalendarSettings() {
  console.log('\n\n📋 1. CALENDAR SETTINGS')
  console.log('-'.repeat(80))

  const { data, error } = await supabase
    .from('company_calendar_settings')
    .select('*')
    .limit(5)

  if (error) {
    console.error('❌ Errore:', error.message)
    return null
  }

  if (!data || data.length === 0) {
    console.log('⚠️  PROBLEMA: Nessuna configurazione calendario trovata!')
    return null
  }

  data.forEach(settings => {
    console.log(`\n✅ Company ID: ${settings.company_id}`)
    console.log(`   Configurato: ${settings.is_configured ? '✅ SÌ' : '❌ NO'}`)
    console.log(`   Anno fiscale: ${settings.fiscal_year_start} → ${settings.fiscal_year_end}`)
    console.log(`   Giorni apertura: ${settings.open_weekdays?.join(', ') || 'N/A'}`)
    console.log(`   Giorni chiusura: ${settings.closure_dates?.length || 0} date`)

    if (settings.closure_dates && settings.closure_dates.length > 0) {
      console.log(`   Prime 3 date chiusura:`)
      settings.closure_dates.slice(0, 3).forEach(date => {
        console.log(`     - ${date}`)
      })
    }
  })

  return data[0]
}

// 2. Verifica Tasks
async function checkTasks(companyId) {
  console.log('\n\n📋 2. TASKS CREATE')
  console.log('-'.repeat(80))

  const { data, error } = await supabase
    .from('tasks')
    .select('id, name, frequency, next_due, created_at, recurrence_config')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('❌ Errore:', error.message)
    return []
  }

  if (!data || data.length === 0) {
    console.log('⚠️  Nessuna task trovata')
    return []
  }

  console.log(`\n✅ Trovate ${data.length} tasks:\n`)

  data.forEach(task => {
    const nextDue = task.next_due ? new Date(task.next_due) : null
    const dayOfWeek = nextDue ? nextDue.getDay() : null
    const dateStr = nextDue ? nextDue.toISOString().split('T')[0] : 'N/A'

    console.log(`📌 ${task.name}`)
    console.log(`   Frequenza: ${task.frequency}`)
    console.log(`   Next Due: ${dateStr} (giorno settimana: ${dayOfWeek})`)
    console.log(`   Recurrence Config: ${JSON.stringify(task.recurrence_config || {})}`)
    console.log('')
  })

  return data
}

// 3. Verifica conflitti con giorni chiusi
async function checkConflicts(calendarSettings, tasks) {
  console.log('\n\n🔍 3. ANALISI CONFLITTI (Tasks vs Giorni Chiusi)')
  console.log('-'.repeat(80))

  if (!calendarSettings || !calendarSettings.is_configured) {
    console.log('⚠️  Calendario non configurato - nessun filtro applicabile')
    return
  }

  const conflicts = []

  tasks.forEach(task => {
    if (!task.next_due) return

    const nextDue = new Date(task.next_due)
    const dayOfWeek = nextDue.getDay()
    const dateStr = nextDue.toISOString().split('T')[0]

    // Check giorno settimana
    if (!calendarSettings.open_weekdays?.includes(dayOfWeek)) {
      conflicts.push({
        task: task.name,
        issue: 'Giorno NON lavorativo',
        next_due: dateStr,
        day_of_week: dayOfWeek,
        open_weekdays: calendarSettings.open_weekdays
      })
    }

    // Check giorni chiusura
    if (calendarSettings.closure_dates?.includes(dateStr)) {
      conflicts.push({
        task: task.name,
        issue: 'Giorno di CHIUSURA',
        next_due: dateStr,
        closure_dates: calendarSettings.closure_dates.filter(d => d === dateStr)
      })
    }
  })

  if (conflicts.length === 0) {
    console.log('✅ NESSUN CONFLITTO: Tutte le tasks hanno next_due nei giorni aperti!')
  } else {
    console.log(`❌ TROVATI ${conflicts.length} CONFLITTI:\n`)
    conflicts.forEach(conflict => {
      console.log(`⚠️  ${conflict.task}`)
      console.log(`   Problema: ${conflict.issue}`)
      console.log(`   Next Due: ${conflict.next_due} (giorno ${conflict.day_of_week})`)
      if (conflict.open_weekdays) {
        console.log(`   Giorni aperti: ${conflict.open_weekdays.join(', ')}`)
      }
      console.log('')
    })
  }

  return conflicts
}

// 4. Verifica tipo dato closure_dates
async function checkDataTypes(companyId) {
  console.log('\n\n🔬 4. VERIFICA TIPO DATI')
  console.log('-'.repeat(80))

  const { data, error } = await supabase
    .from('company_calendar_settings')
    .select('closure_dates')
    .eq('company_id', companyId)
    .single()

  if (error) {
    console.error('❌ Errore:', error.message)
    return
  }

  console.log(`\nTipo closure_dates: ${typeof data.closure_dates}`)
  console.log(`È array: ${Array.isArray(data.closure_dates)}`)
  console.log(`Contenuto: ${JSON.stringify(data.closure_dates, null, 2)}`)
}

// Main
async function main() {
  try {
    // 1. Check calendar settings
    const calendarSettings = await checkCalendarSettings()

    if (!calendarSettings) {
      console.log('\n❌ IMPOSSIBILE PROCEDERE: Configurazione calendario mancante')
      process.exit(1)
    }

    // 2. Check tasks
    const tasks = await checkTasks(calendarSettings.company_id)

    // 3. Check conflicts
    const conflicts = await checkConflicts(calendarSettings, tasks)

    // 4. Check data types
    await checkDataTypes(calendarSettings.company_id)

    // Summary
    console.log('\n\n' + '='.repeat(80))
    console.log('📊 RIEPILOGO')
    console.log('='.repeat(80))
    console.log(`✅ Calendario configurato: ${calendarSettings.is_configured}`)
    console.log(`✅ Tasks trovate: ${tasks.length}`)
    console.log(`${conflicts?.length > 0 ? '❌' : '✅'} Conflitti trovati: ${conflicts?.length || 0}`)

    if (conflicts && conflicts.length > 0) {
      console.log('\n⚠️  AZIONE RICHIESTA:')
      console.log('   I conflitti indicano che il codice NON sta filtrando correttamente')
      console.log('   Controlla i log console browser per verificare se il filtro viene applicato')
      console.log('   Cerca: "🔧 Calendar settings loaded for event filtering"')
    } else {
      console.log('\n✅ DATI OK: Il problema potrebbe essere nel frontend')
      console.log('   Controlla i log console browser')
    }

    console.log('\n')

  } catch (error) {
    console.error('\n❌ ERRORE GENERALE:', error)
    process.exit(1)
  }
}

main()
