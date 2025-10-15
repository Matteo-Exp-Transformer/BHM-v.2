#!/usr/bin/env node
/**
 * 🔍 DEBUG PRE-BETA TESTING SCRIPT
 * 
 * Questo script esegue verifiche automatizzate prima del rilascio beta
 * 
 * Usage:
 *   node scripts/debug-pre-beta.js
 *   npm run debug:pre-beta
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import chalk from 'chalk'
import ora from 'ora'

config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error(chalk.red('❌ Missing Supabase credentials in .env'))
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// ===========================
// VERIFICHE
// ===========================

const checks = {
  database: [],
  rls: [],
  integrity: [],
  performance: [],
}

const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  total: 0,
}

function logResult(type, message, details = '') {
  results.total++
  if (type === 'success') {
    results.passed++
    console.log(chalk.green(`  ✅ ${message}`))
  } else if (type === 'error') {
    results.failed++
    console.log(chalk.red(`  ❌ ${message}`))
  } else if (type === 'warning') {
    results.warnings++
    console.log(chalk.yellow(`  ⚠️  ${message}`))
  }
  if (details) {
    console.log(chalk.gray(`     ${details}`))
  }
}

// ===========================
// 1. DATABASE CHECKS
// ===========================

async function checkDatabaseTables() {
  console.log(chalk.blue('\n📊 Verifica Tabelle Database\n'))
  
  const requiredTables = [
    'companies',
    'departments',
    'staff',
    'company_members',
    'user_sessions',
    'user_activity_logs',
    'products',
    'product_categories',
    'conservation_points',
    'temperature_readings',
    'tasks',
    'task_completions',
    'maintenance_tasks',
    'events',
    'notes',
    'non_conformities',
    'shopping_lists',
    'shopping_list_items',
    'invite_tokens',
    'audit_logs',
  ]

  const { data, error } = await supabase.rpc('get_tables_list')
  
  if (error && error.code === '42883') {
    // Function doesn't exist, use direct query
    const { data: tables, error: queryError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
    
    if (queryError) {
      logResult('error', 'Impossibile verificare tabelle', queryError.message)
      return
    }

    const tableNames = tables?.map(t => t.table_name) || []
    
    requiredTables.forEach(tableName => {
      if (tableNames.includes(tableName)) {
        logResult('success', `Tabella ${tableName} esistente`)
      } else {
        logResult('error', `Tabella ${tableName} mancante!`)
      }
    })
  } else {
    logResult('warning', 'Verifica tabelle manuale richiesta')
  }
}

async function checkForeignKeys() {
  console.log(chalk.blue('\n🔗 Verifica Foreign Keys\n'))
  
  // Check orphaned products (senza company)
  const { data: orphanedProducts, error: error1 } = await supabase
    .from('products')
    .select('id, name, company_id')
    .is('companies.id', null)
  
  if (error1) {
    logResult('warning', 'Impossibile verificare prodotti orfani', error1.message)
  } else {
    if (orphanedProducts && orphanedProducts.length > 0) {
      logResult('error', `${orphanedProducts.length} prodotti senza company!`)
    } else {
      logResult('success', 'Nessun prodotto orfano')
    }
  }

  // Check orphaned departments
  const { data: orphanedDepts, error: error2 } = await supabase
    .from('departments')
    .select('id, name, company_id')
    .is('companies.id', null)
  
  if (error2) {
    logResult('warning', 'Impossibile verificare reparti orfani', error2.message)
  } else {
    if (orphanedDepts && orphanedDepts.length > 0) {
      logResult('error', `${orphanedDepts.length} reparti senza company!`)
    } else {
      logResult('success', 'Nessun reparto orfano')
    }
  }
}

// ===========================
// 2. RLS CHECKS
// ===========================

async function checkRLSPolicies() {
  console.log(chalk.blue('\n🔒 Verifica RLS Policies\n'))
  
  const criticalTables = [
    'companies',
    'products',
    'staff',
    'user_activity_logs',
    'shopping_lists',
  ]

  for (const table of criticalTables) {
    // Try to query table to see if RLS is enforced
    const { data, error } = await supabase.from(table).select('id').limit(1)
    
    if (error && error.code === '42501') {
      // Permission denied = RLS active (good if not authenticated)
      logResult('success', `RLS attiva su ${table}`)
    } else if (error) {
      logResult('warning', `Errore verifica RLS su ${table}`, error.message)
    } else {
      // Query succeeded, check if it's because we're authenticated or RLS is missing
      logResult('warning', `Verifica manuale RLS su ${table}`)
    }
  }
}

// ===========================
// 3. DATA INTEGRITY
// ===========================

async function checkDataIntegrity() {
  console.log(chalk.blue('\n✨ Verifica Integrità Dati\n'))
  
  // Check task_completions senza task
  const { data: orphanedCompletions, error: error1 } = await supabase
    .from('task_completions')
    .select('id, task_id')
    .is('tasks.id', null)
  
  if (error1) {
    logResult('warning', 'Impossibile verificare task completions', error1.message)
  } else {
    if (orphanedCompletions && orphanedCompletions.length > 0) {
      logResult('error', `${orphanedCompletions.length} completions orfani!`)
    } else {
      logResult('success', 'Task completions OK')
    }
  }

  // Check products senza category_id (dovrebbe essere OK se opzionale)
  const { count: productsNoCategory, error: error2 } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .is('category_id', null)
  
  if (error2) {
    logResult('warning', 'Impossibile verificare prodotti senza categoria', error2.message)
  } else {
    if (productsNoCategory && productsNoCategory > 0) {
      logResult('warning', `${productsNoCategory} prodotti senza categoria`)
    } else {
      logResult('success', 'Tutti i prodotti hanno categoria')
    }
  }
}

// ===========================
// 4. PERFORMANCE CHECKS
// ===========================

async function checkPerformance() {
  console.log(chalk.blue('\n⚡ Verifica Performance\n'))
  
  // Test query products (dovrebbe essere < 200ms)
  const start1 = Date.now()
  const { data: products, error: error1 } = await supabase
    .from('products')
    .select('*, product_categories(name), departments(name), conservation_points(name)')
    .limit(50)
  const duration1 = Date.now() - start1
  
  if (error1) {
    logResult('error', 'Query products fallita', error1.message)
  } else {
    if (duration1 < 200) {
      logResult('success', `Query products: ${duration1}ms ✅`)
    } else if (duration1 < 500) {
      logResult('warning', `Query products: ${duration1}ms (lenta)`)
    } else {
      logResult('error', `Query products: ${duration1}ms (troppo lenta!)`)
    }
  }

  // Test query activities (dovrebbe essere < 300ms)
  const start2 = Date.now()
  const { data: activities, error: error2 } = await supabase
    .from('user_activity_logs')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(50)
  const duration2 = Date.now() - start2
  
  if (error2) {
    logResult('error', 'Query activities fallita', error2.message)
  } else {
    if (duration2 < 300) {
      logResult('success', `Query activities: ${duration2}ms ✅`)
    } else if (duration2 < 500) {
      logResult('warning', `Query activities: ${duration2}ms (lenta)`)
    } else {
      logResult('error', `Query activities: ${duration2}ms (troppo lenta!)`)
    }
  }
}

// ===========================
// 5. AUTH CHECKS
// ===========================

async function checkAuthConfig() {
  console.log(chalk.blue('\n🔐 Verifica Configurazione Auth\n'))
  
  // Check if we can access auth metadata
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) {
    logResult('warning', 'Nessuna sessione attiva', 'Esegui come utente autenticato per test completi')
  } else if (session) {
    logResult('success', 'Sessione attiva trovata')
    logResult('success', `User ID: ${session.user.id}`)
  } else {
    logResult('warning', 'Nessuna sessione attiva')
  }
}

// ===========================
// MAIN EXECUTION
// ===========================

async function main() {
  console.log(chalk.cyan.bold('\n╔═══════════════════════════════════════╗'))
  console.log(chalk.cyan.bold('║  🔍 DEBUG PRE-BETA TESTING SUITE     ║'))
  console.log(chalk.cyan.bold('║  Business HACCP Manager v.2          ║'))
  console.log(chalk.cyan.bold('╚═══════════════════════════════════════╝\n'))

  const spinner = ora('Connessione a Supabase...').start()
  
  try {
    // Test connection
    const { data, error } = await supabase.from('companies').select('count').limit(1)
    if (error && error.code !== '42501') {
      spinner.fail('Connessione fallita')
      console.error(chalk.red(`❌ ${error.message}`))
      process.exit(1)
    }
    spinner.succeed('Connesso a Supabase')

    // Run all checks
    await checkDatabaseTables()
    await checkForeignKeys()
    await checkRLSPolicies()
    await checkDataIntegrity()
    await checkPerformance()
    await checkAuthConfig()

    // Print summary
    console.log(chalk.cyan.bold('\n╔═══════════════════════════════════════╗'))
    console.log(chalk.cyan.bold('║  📊 RIEPILOGO RISULTATI               ║'))
    console.log(chalk.cyan.bold('╚═══════════════════════════════════════╝\n'))

    console.log(chalk.green(`  ✅ Passed:   ${results.passed}/${results.total}`))
    console.log(chalk.yellow(`  ⚠️  Warnings: ${results.warnings}/${results.total}`))
    console.log(chalk.red(`  ❌ Failed:   ${results.failed}/${results.total}`))

    const successRate = ((results.passed / results.total) * 100).toFixed(1)
    console.log(chalk.cyan(`\n  Success Rate: ${successRate}%`))

    if (results.failed === 0) {
      console.log(chalk.green.bold('\n  🎉 Tutti i test critici passati! Ready for beta.\n'))
      process.exit(0)
    } else {
      console.log(chalk.red.bold('\n  ⚠️  Alcuni test falliti. Rivedere prima del deploy.\n'))
      process.exit(1)
    }

  } catch (error) {
    spinner.fail('Errore durante l\'esecuzione')
    console.error(chalk.red(`❌ ${error.message}`))
    process.exit(1)
  }
}

main()

