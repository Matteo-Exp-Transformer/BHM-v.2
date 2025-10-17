#!/usr/bin/env node
/**
 * 🧹 POST-TEST CLEANUP SCRIPT
 *
 * Cleanup DOPO ogni test run:
 * - Rimuove dati test da DB (preserva dati Precompila)
 * - Rilascia lock attivi
 * - Chiude sessioni Supabase
 * - Pulisce file temporanei
 * - Reset stato app (se necessario)
 *
 * WHITELIST Dati Precompila (NON rimuovere):
 * - Paolo Dettori (staff)
 * - Cucina, Bancone, Sala, Magazzino (departments)
 * - Frigo A, Freezer A (conservation points)
 * - Tutti i dati inseriti con DevButtons "Precompila"
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Config
const SUPABASE_URL = 'https://tucqgcfrlzmwyfadiodo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1Y3FnY2ZybHptd3lmYWRpb2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NTY0ODksImV4cCI6MjA3NTUzMjQ4OX0.7m3bdxW8QMHO6YNQ4cxoxlzzgzq7DjTzufv89YAcHA4';
const TEST_EMAIL = 'matteo.cavallaro.work@gmail.com';
const TEST_PASSWORD = 'cavallaro';

// Whitelist - Nomi da NON rimuovere (dati Precompila)
const WHITELIST = {
  staff: ['Paolo Dettori'],
  departments: ['Cucina', 'Bancone', 'Sala', 'Magazzino'],
  conservationPoints: ['Frigo A', 'Freezer A'],
  // Altri pattern da preservare
  emailPatterns: ['matteo.cavallaro.work@gmail.com']
};

let supabase;
let cleanupResults = {
  removed: [],
  preserved: [],
  errors: []
};

/**
 * Helper per log risultati
 */
function logResult(type, message, details = null) {
  cleanupResults[type].push({ message, details, timestamp: new Date().toISOString() });

  const emoji = {
    removed: '🗑️',
    preserved: '✅',
    errors: '❌'
  }[type];

  console.log(`${emoji} ${message}`);
  if (details) {
    console.log(`   Details: ${JSON.stringify(details)}`);
  }
}

/**
 * 1. Cleanup Database - Rimuove dati test preservando whitelist
 */
async function cleanupDatabase(companyId) {
  console.log('\n🧹 1/5: Cleanup database...');

  try {
    // 1. Temperature readings (rimuovi TUTTI eccetto quelli di conservation points whitelist)
    await cleanupTemperatureReadings(companyId);

    // 2. Maintenance tasks (rimuovi TUTTI eccetto quelli di conservation points whitelist)
    await cleanupMaintenanceTasks(companyId);

    // 3. Generic tasks (rimuovi TUTTI eccetto quelli assegnati a staff whitelist)
    await cleanupGenericTasks(companyId);

    // 4. Events (rimuovi TUTTI - nessun event è precompilato)
    await cleanupEvents(companyId);

    // 5. Products (rimuovi TUTTI - nessun product è precompilato)
    await cleanupProducts(companyId);

    // Note: NON rimuoviamo conservation_points, departments, staff perché sono tutti Precompila

    logResult('preserved', 'Dati Precompila preservati: staff, departments, conservation_points');

  } catch (error) {
    logResult('errors', `Errore cleanup database: ${error.message}`);
  }
}

async function cleanupTemperatureReadings(companyId) {
  try {
    // Get whitelist conservation points IDs
    const { data: whitelistPoints } = await supabase
      .from('conservation_points')
      .select('id')
      .eq('company_id', companyId)
      .in('name', WHITELIST.conservationPoints);

    const whitelistIds = whitelistPoints?.map(p => p.id) || [];

    // Count total readings
    const { count: totalCount } = await supabase
      .from('temperature_readings')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId);

    // Delete readings NOT in whitelist conservation points
    // NOTA: Se conservation points sono TUTTI precompilati, non rimuoviamo nulla
    // Questo preserva lo storico temperature per analisi

    if (whitelistIds.length > 0) {
      // Rimuovi SOLO readings di test points (non whitelist)
      const { error, count } = await supabase
        .from('temperature_readings')
        .delete({ count: 'exact' })
        .eq('company_id', companyId)
        .not('conservation_point_id', 'in', `(${whitelistIds.join(',')})`);

      if (error) {
        logResult('errors', `Errore cleanup temperature_readings: ${error.message}`);
      } else {
        logResult('removed', `Temperature readings rimossi: ${count || 0}/${totalCount}`);
      }
    } else {
      logResult('preserved', `Temperature readings preservati: ${totalCount} (tutti whitelist)`);
    }
  } catch (error) {
    logResult('errors', `Errore cleanup temperature_readings: ${error.message}`);
  }
}

async function cleanupMaintenanceTasks(companyId) {
  try {
    // Get whitelist conservation points IDs
    const { data: whitelistPoints } = await supabase
      .from('conservation_points')
      .select('id')
      .eq('company_id', companyId)
      .in('name', WHITELIST.conservationPoints);

    const whitelistIds = whitelistPoints?.map(p => p.id) || [];

    const { count: totalCount } = await supabase
      .from('maintenance_tasks')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId);

    if (whitelistIds.length > 0) {
      const { error, count } = await supabase
        .from('maintenance_tasks')
        .delete({ count: 'exact' })
        .eq('company_id', companyId)
        .not('conservation_point_id', 'in', `(${whitelistIds.join(',')})`);

      if (error) {
        logResult('errors', `Errore cleanup maintenance_tasks: ${error.message}`);
      } else {
        logResult('removed', `Maintenance tasks rimossi: ${count || 0}/${totalCount}`);
      }
    } else {
      logResult('preserved', `Maintenance tasks preservati: ${totalCount} (tutti whitelist)`);
    }
  } catch (error) {
    logResult('errors', `Errore cleanup maintenance_tasks: ${error.message}`);
  }
}

async function cleanupGenericTasks(companyId) {
  try {
    // Get whitelist staff IDs
    const { data: whitelistStaff } = await supabase
      .from('staff')
      .select('id')
      .eq('company_id', companyId)
      .in('name', WHITELIST.staff);

    const whitelistIds = whitelistStaff?.map(s => s.id) || [];

    const { count: totalCount } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId);

    if (whitelistIds.length > 0) {
      const { error, count } = await supabase
        .from('tasks')
        .delete({ count: 'exact' })
        .eq('company_id', companyId)
        .not('assigned_to_staff_id', 'in', `(${whitelistIds.join(',')})`);

      if (error) {
        logResult('errors', `Errore cleanup tasks: ${error.message}`);
      } else {
        logResult('removed', `Generic tasks rimossi: ${count || 0}/${totalCount}`);
      }
    } else {
      logResult('preserved', `Generic tasks preservati: ${totalCount} (tutti whitelist)`);
    }
  } catch (error) {
    logResult('errors', `Errore cleanup tasks: ${error.message}`);
  }
}

async function cleanupEvents(companyId) {
  try {
    const { error, count } = await supabase
      .from('events')
      .delete({ count: 'exact' })
      .eq('company_id', companyId);

    if (error) {
      logResult('errors', `Errore cleanup events: ${error.message}`);
    } else {
      logResult('removed', `Events rimossi: ${count || 0}`);
    }
  } catch (error) {
    logResult('errors', `Errore cleanup events: ${error.message}`);
  }
}

async function cleanupProducts(companyId) {
  try {
    const { error, count } = await supabase
      .from('products')
      .delete({ count: 'exact' })
      .eq('company_id', companyId);

    if (error) {
      logResult('errors', `Errore cleanup products: ${error.message}`);
    } else {
      logResult('removed', `Products rimossi: ${count || 0}`);
    }
  } catch (error) {
    logResult('errors', `Errore cleanup products: ${error.message}`);
  }
}

/**
 * 2. Release Lock System
 */
async function releaseLocks() {
  console.log('\n🔓 2/5: Rilascio lock attivi...');

  try {
    const lockDir = './locks';

    if (!fs.existsSync(lockDir)) {
      logResult('preserved', 'Nessun lock da rilasciare');
      return;
    }

    const files = fs.readdirSync(lockDir);
    let releasedCount = 0;

    for (const file of files) {
      if (file.endsWith('.lock')) {
        const lockPath = path.join(lockDir, file);
        try {
          fs.unlinkSync(lockPath);
          releasedCount++;
        } catch (error) {
          logResult('errors', `Errore rilascio lock ${file}: ${error.message}`);
        }
      }
    }

    if (releasedCount > 0) {
      logResult('removed', `Lock rilasciati: ${releasedCount}`);
    } else {
      logResult('preserved', 'Nessun lock attivo da rilasciare');
    }
  } catch (error) {
    logResult('errors', `Errore rilascio lock: ${error.message}`);
  }
}

/**
 * 3. Close Supabase Sessions
 */
async function closeSupabaseSessions() {
  console.log('\n🚪 3/5: Chiusura sessioni Supabase...');

  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      logResult('errors', `Errore sign out: ${error.message}`);
    } else {
      logResult('removed', 'Sessioni Supabase chiuse');
    }
  } catch (error) {
    logResult('errors', `Errore chiusura sessioni: ${error.message}`);
  }
}

/**
 * 4. Cleanup Temporary Files
 */
async function cleanupTempFiles() {
  console.log('\n🗂️  4/5: Pulizia file temporanei...');

  try {
    const tempDirs = [
      './test-results',
      './playwright-report',
      './.cache'
    ];

    let removedFiles = 0;

    for (const dir of tempDirs) {
      if (fs.existsSync(dir)) {
        try {
          fs.rmSync(dir, { recursive: true, force: true });
          removedFiles++;
        } catch (error) {
          logResult('errors', `Errore rimozione ${dir}: ${error.message}`);
        }
      }
    }

    if (removedFiles > 0) {
      logResult('removed', `Directory temporanee rimosse: ${removedFiles}`);
    } else {
      logResult('preserved', 'Nessuna directory temporanea da rimuovere');
    }
  } catch (error) {
    logResult('errors', `Errore cleanup file temporanei: ${error.message}`);
  }
}

/**
 * 5. Reset App State (optional)
 */
async function resetAppState() {
  console.log('\n🔄 5/5: Reset stato app...');

  try {
    // Nessun reset necessario per ora
    // In futuro: reset cache, localStorage (se testabile), etc.

    logResult('preserved', 'Nessun reset stato app necessario');
  } catch (error) {
    logResult('errors', `Errore reset stato app: ${error.message}`);
  }
}

/**
 * Main cleanup
 */
async function runCleanup() {
  console.log('🧹 POST-TEST CLEANUP - Pulizia dopo test\n');
  console.log('=' .repeat(60));

  try {
    // 1. Connessione Supabase
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // 2. Auth
    const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });

    if (authError || !user) {
      console.log('⚠️ Cleanup saltato - user non autenticato');
      process.exit(0);
    }

    // 3. Get Company
    const { data: member } = await supabase
      .from('company_members')
      .select('company_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (!member || member.length === 0) {
      console.log('⚠️ Cleanup saltato - company non trovata');
      process.exit(0);
    }

    const companyId = member[0].company_id;
    console.log(`🏢 Company ID: ${companyId}\n`);

    // Run cleanup steps
    await cleanupDatabase(companyId);
    await releaseLocks();
    await closeSupabaseSessions();
    await cleanupTempFiles();
    await resetAppState();

    // Print results
    printResults();

    console.log('\n✅ CLEANUP COMPLETATO\n');
    process.exit(0);

  } catch (error) {
    console.error('\n💥 ERRORE CRITICO CLEANUP:', error);
    process.exit(1);
  }
}

/**
 * Print risultati finali
 */
function printResults() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 RISULTATI CLEANUP:');
  console.log('='.repeat(60));

  console.log(`\n🗑️  Rimossi: ${cleanupResults.removed.length}`);
  cleanupResults.removed.forEach(r => console.log(`  - ${r.message}`));

  console.log(`\n✅ Preservati: ${cleanupResults.preserved.length}`);
  cleanupResults.preserved.forEach(r => console.log(`  - ${r.message}`));

  if (cleanupResults.errors.length > 0) {
    console.log(`\n❌ Errori: ${cleanupResults.errors.length}`);
    cleanupResults.errors.forEach(r => console.log(`  - ${r.message}`));
  }

  console.log('\n' + '='.repeat(60));
}

// Run cleanup
runCleanup();
