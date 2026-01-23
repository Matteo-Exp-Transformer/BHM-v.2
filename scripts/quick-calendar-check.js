#!/usr/bin/env node
/**
 * Script di verifica rapida stato calendario
 * Esegui con: node scripts/quick-calendar-check.js
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

console.log('🔍 Verifica Rapida Configurazione Calendario\n')
console.log('='.repeat(80))

async function quickCheck() {
  // 1. Verifica calendar settings - PRENDI TUTTI I RECORDS
  const { data: allSettings, error: settingsError } = await supabase
    .from('company_calendar_settings')
    .select('*')
    .order('created_at', { ascending: false })

  if (settingsError) {
    console.error('❌ ERRORE: Impossibile leggere calendar settings:', settingsError.message)
    process.exit(1)
  }

  if (!allSettings || allSettings.length === 0) {
    console.log('❌ PROBLEMA CRITICO: Nessuna configurazione calendario trovata!')
    console.log('\n📝 AZIONE RICHIESTA:')
    console.log('   Completa lo step 7 dell\'onboarding (configurazione calendario)')
    process.exit(1)
  }

  // Prendi la configurazione più recente (o l'unica disponibile)
  const settings = allSettings[0]

  if (allSettings.length > 1) {
    console.log(`\n⚠️  Trovate ${allSettings.length} configurazioni calendario`)
    console.log('   Mostro la più recente (ultima creata)')
  }

  console.log('\n✅ CONFIGURAZIONE CALENDARIO TROVATA\n')
  console.log('Company ID:', settings.company_id)
  console.log('Configurato:', settings.is_configured ? '✅ SÌ' : '❌ NO')

  if (!settings.is_configured) {
    console.log('\n❌ PROBLEMA: Calendario NON configurato (is_configured = false)')
    console.log('   Gli eventi NON verranno filtrati per giorni chiusi')
    console.log('\n📝 AZIONE RICHIESTA:')
    console.log('   Vai all\'onboarding step 7 e completa la configurazione calendario')
    process.exit(1)
  }

  console.log('\n📅 Anno Fiscale:')
  console.log(`   Inizio: ${settings.fiscal_year_start}`)
  console.log(`   Fine:   ${settings.fiscal_year_end}`)

  console.log('\n📆 Giorni Apertura:')
  const dayNames = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato']
  if (Array.isArray(settings.open_weekdays) && settings.open_weekdays.length > 0) {
    settings.open_weekdays.forEach(day => {
      console.log(`   ✅ ${day} - ${dayNames[day]}`)
    })
  } else {
    console.log('   ❌ PROBLEMA: Nessun giorno di apertura configurato!')
  }

  console.log('\n🏖️ Giorni Chiusura (Ferie):')
  if (Array.isArray(settings.closure_dates)) {
    console.log(`   Totale: ${settings.closure_dates.length} date`)
    if (settings.closure_dates.length > 0) {
      console.log('   Prime 5 date:')
      settings.closure_dates.slice(0, 5).forEach(date => {
        const d = new Date(date)
        const dayOfWeek = d.getDay()
        console.log(`     🏖️  ${date} (${dayNames[dayOfWeek]})`)
      })
    } else {
      console.log('   ⚠️  Nessuna data di chiusura configurata')
    }
  } else {
    console.log('   ❌ PROBLEMA: closure_dates non è un array!')
    console.log('   Tipo:', typeof settings.closure_dates)
  }

  // 2. Verifica tasks con next_due
  console.log('\n\n📋 VERIFICA TASKS\n')
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('id, name, frequency, next_due')
    .eq('company_id', settings.company_id)
    .not('next_due', 'is', null)
    .order('next_due', { ascending: true })
    .limit(5)

  if (tasksError) {
    console.error('⚠️  Errore lettura tasks:', tasksError.message)
  } else if (tasks && tasks.length > 0) {
    console.log(`Trovate ${tasks.length} tasks con next_due:\n`)
    tasks.forEach(task => {
      const nextDue = new Date(task.next_due)
      const dayOfWeek = nextDue.getDay()
      const dateStr = nextDue.toISOString().split('T')[0]

      // Check se è in un giorno aperto
      const isOpenDay = settings.open_weekdays.includes(dayOfWeek)
      const isClosureDate = settings.closure_dates.includes(dateStr)

      const status = isOpenDay && !isClosureDate ? '✅' : '❌'

      console.log(`${status} ${task.name}`)
      console.log(`   Next Due: ${dateStr} (${dayNames[dayOfWeek]})`)
      if (!isOpenDay) {
        console.log(`   ⚠️  PROBLEMA: Giorno NON lavorativo!`)
      }
      if (isClosureDate) {
        console.log(`   ⚠️  PROBLEMA: Giorno di chiusura!`)
      }
      console.log('')
    })
  } else {
    console.log('Nessuna task trovata con next_due')
  }

  // 3. Summary
  console.log('\n' + '='.repeat(80))
  console.log('📊 RIEPILOGO')
  console.log('='.repeat(80))

  const hasIssues =
    !settings.is_configured ||
    !Array.isArray(settings.open_weekdays) ||
    settings.open_weekdays.length === 0 ||
    !Array.isArray(settings.closure_dates)

  if (!hasIssues) {
    console.log('✅ Configurazione calendario OK')
    console.log('\n📝 PROSSIMI PASSI:')
    console.log('   1. Apri l\'app nel browser')
    console.log('   2. Apri DevTools (F12) → Console')
    console.log('   3. Vai a /calendar')
    console.log('   4. Cerca questi log:')
    console.log('      🔍 expandRecurringTask START')
    console.log('      🔍 Filtro giorno')
    console.log('      🔍 isDateOpenPure check')
    console.log('   5. Condividi gli screenshot dei log')
  } else {
    console.log('❌ PROBLEMI TROVATI:')
    if (!settings.is_configured) {
      console.log('   - Calendario non configurato (is_configured = false)')
    }
    if (!Array.isArray(settings.open_weekdays) || settings.open_weekdays.length === 0) {
      console.log('   - Giorni apertura non configurati')
    }
    if (!Array.isArray(settings.closure_dates)) {
      console.log('   - closure_dates non è un array')
    }
    console.log('\n📝 AZIONE RICHIESTA:')
    console.log('   Riconfigura il calendario nell\'onboarding step 7')
  }

  console.log('\n')
}

quickCheck().catch(err => {
  console.error('❌ ERRORE:', err)
  process.exit(1)
})
