#!/usr/bin/env node
/**
 * 🔍 PRE-TEST VALIDATION SCRIPT (Playwright Module)
 *
 * Verifica PRIMA di ogni test run che tutto sia pronto:
 * - Connessione Supabase
 * - User autenticato
 * - Company disponibile (dev o onboarding)
 * - Schema DB aggiornato
 * - Porta app disponibile
 * - Lock system operativo
 *
 * Se validation fallisce → BLOCCA test con exit code 1
 */

import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';
import fs from 'fs';

// Config
const SUPABASE_URL = 'https://tucqgcfrlzmwyfadiodo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1Y3FnY2ZybHptd3lmYWRpb2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NTY0ODksImV4cCI6MjA3NTUzMjQ4OX0.7m3bdxW8QMHO6YNQ4cxoxlzzgzq7DjTzufv89YAcHA4';
const TEST_EMAIL = 'matteo.cavallaro.work@gmail.com';
const TEST_PASSWORD = 'cavallaro';

// Porte da verificare
const APP_PORTS = [3000, 3001, 3002];

// Tabelle critiche da verificare
const CRITICAL_TABLES = [
  'companies',
  'company_members',
  'staff',
  'departments',
  'conservation_points',
  'products',
  'tasks',
  'maintenance_tasks',
  'temperature_readings',
  'events'
];

let supabase;
let validationResults = {
  passed: [],
  warnings: [],
  failed: []
};

/**
 * Helper per aggiungere risultato validation
 */
function addResult(type, message) {
  validationResults[type].push(message);

  const emoji = {
    passed: '✅',
    warnings: '⚠️',
    failed: '❌'
  }[type];

  console.log(`${emoji} ${message}`);
}

/**
 * 1. Verifica connessione Supabase
 */
async function validateSupabaseConnection() {
  console.log('\n🔌 1/6: Verifica connessione Supabase...');

  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Test query semplice
    const { error } = await supabase.from('companies').select('id').limit(1);

    if (error) {
      addResult('failed', `Connessione Supabase fallita: ${error.message}`);
      return false;
    }

    addResult('passed', 'Connessione Supabase OK');
    return true;
  } catch (error) {
    addResult('failed', `Errore connessione Supabase: ${error.message}`);
    return false;
  }
}

/**
 * 2. Verifica autenticazione user
 */
async function validateUserAuth() {
  console.log('\n👤 2/6: Verifica autenticazione user...');

  try {
    const { data: { user }, error } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });

    if (error) {
      addResult('failed', `Autenticazione fallita: ${error.message}`);
      return { success: false, userId: null };
    }

    if (!user) {
      addResult('failed', 'User non trovato dopo login');
      return { success: false, userId: null };
    }

    addResult('passed', `User autenticato: ${user.email}`);
    return { success: true, userId: user.id };
  } catch (error) {
    addResult('failed', `Errore autenticazione: ${error.message}`);
    return { success: false, userId: null };
  }
}

/**
 * 3. Verifica Company disponibile (dev mode o onboarding)
 */
async function validateCompany(userId) {
  console.log('\n🏢 3/6: Verifica Company disponibile...');

  try {
    // Query company_members per trovare company dell'utente
    const { data: member, error } = await supabase
      .from('company_members')
      .select('company_id, companies(id, name, email)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      addResult('failed', `Errore query company_members: ${error.message}`);
      return { success: false, companyId: null };
    }

    if (!member || member.length === 0) {
      addResult('failed', 'User non ha Company associata - esegui onboarding o imposta dev company');
      addResult('warnings', 'Suggerimento: Apri app e usa devCompanyHelper.setDevCompanyFromCurrentUser()');
      return { success: false, companyId: null };
    }

    const companyData = member[0];
    const companyId = companyData.company_id;
    const companyInfo = companyData.companies;

    addResult('passed', `Company trovata: ${companyInfo.name} (${companyId})`);
    return { success: true, companyId };
  } catch (error) {
    addResult('failed', `Errore verifica company: ${error.message}`);
    return { success: false, companyId: null };
  }
}

/**
 * 4. Verifica schema DB aggiornato
 */
async function validateDBSchema() {
  console.log('\n🗄️ 4/6: Verifica schema DB aggiornato...');

  try {
    let allTablesExist = true;

    for (const table of CRITICAL_TABLES) {
      const { error } = await supabase
        .from(table)
        .select('id')
        .limit(1);

      if (error) {
        addResult('failed', `Tabella "${table}" non trovata o errore: ${error.message}`);
        allTablesExist = false;
      }
    }

    if (allTablesExist) {
      addResult('passed', `Schema DB OK - tutte le ${CRITICAL_TABLES.length} tabelle critiche esistono`);
      return true;
    }

    return false;
  } catch (error) {
    addResult('failed', `Errore verifica schema DB: ${error.message}`);
    return false;
  }
}

/**
 * 5. Verifica porta app disponibile
 */
async function validateAppPort() {
  console.log('\n🌐 5/6: Verifica porta app disponibile...');

  try {
    let availablePorts = [];

    for (const port of APP_PORTS) {
      try {
        // Try to fetch homepage
        execSync(`curl -s http://localhost:${port} -o /dev/null -w "%{http_code}"`, {
          timeout: 3000,
          stdio: 'pipe'
        });

        availablePorts.push(port);
        addResult('passed', `Porta ${port} disponibile`);
      } catch (error) {
        addResult('warnings', `Porta ${port} non disponibile (app non avviata)`);
      }
    }

    if (availablePorts.length === 0) {
      addResult('warnings', 'Nessuna porta app disponibile - avvia app con npm run dev:client');
    }

    return true; // Non bloccare test per porta
  } catch (error) {
    addResult('warnings', `Errore verifica porte (saltato): ${error.message}`);
    return true; // Non bloccare per questo
  }
}

/**
 * 6. Verifica lock system operativo
 */
async function validateLockSystem() {
  console.log('\n🔒 6/6: Verifica lock system operativo...');

  try {
    const lockDir = './locks';

    // Verifica che la directory locks esista
    if (!fs.existsSync(lockDir)) {
      fs.mkdirSync(lockDir, { recursive: true });
      addResult('passed', 'Directory locks creata');
    } else {
      addResult('passed', 'Directory locks OK');
    }

    // Check stale locks (lock più vecchi di 10 minuti)
    const files = fs.readdirSync(lockDir);
    const now = Date.now();
    let staleLocks = 0;

    for (const file of files) {
      if (file.endsWith('.lock')) {
        const lockPath = `${lockDir}/${file}`;
        const stats = fs.statSync(lockPath);
        const age = now - stats.mtime.getTime();

        if (age > 10 * 60 * 1000) { // 10 minuti
          addResult('warnings', `Lock stale trovato: ${file} (${Math.floor(age / 60000)} minuti)`);
          staleLocks++;
        }
      }
    }

    if (staleLocks > 0) {
      addResult('warnings', `Trovati ${staleLocks} lock stale - esegui npm run lock:cleanup`);
    }

    return true;
  } catch (error) {
    addResult('warnings', `Errore verifica lock system (saltato): ${error.message}`);
    return true; // Non bloccare per questo
  }
}

/**
 * Print risultati finali
 */
function printResults() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 RISULTATI VALIDATION:');
  console.log('='.repeat(60));

  console.log(`\n✅ Passati: ${validationResults.passed.length}`);
  validationResults.passed.forEach(msg => console.log(`  - ${msg}`));

  if (validationResults.warnings.length > 0) {
    console.log(`\n⚠️  Warning: ${validationResults.warnings.length}`);
    validationResults.warnings.forEach(msg => console.log(`  - ${msg}`));
  }

  if (validationResults.failed.length > 0) {
    console.log(`\n❌ Falliti: ${validationResults.failed.length}`);
    validationResults.failed.forEach(msg => console.log(`  - ${msg}`));
  }

  console.log('\n' + '='.repeat(60));
}

/**
 * Playwright Global Setup Function
 */
export default async function globalSetup() {
  console.log('🔍 PRE-TEST VALIDATION - Verifica setup prima dei test\n');
  console.log('=' .repeat(60));

  // 1. Supabase connection
  const supabaseOk = await validateSupabaseConnection();
  if (!supabaseOk) {
    printResults();
    throw new Error('Supabase connection failed');
  }

  // 2. User auth
  const { success: authOk, userId } = await validateUserAuth();
  if (!authOk) {
    printResults();
    throw new Error('User authentication failed');
  }

  // 3. Company
  const { success: companyOk, companyId } = await validateCompany(userId);
  if (!companyOk) {
    printResults();
    throw new Error('Company validation failed');
  }

  // 4. DB Schema
  const schemaOk = await validateDBSchema();
  if (!schemaOk) {
    printResults();
    throw new Error('Database schema validation failed');
  }

  // 5. App port (warning only)
  await validateAppPort();

  // 6. Lock system (warning only)
  await validateLockSystem();

  // Print final results
  printResults();

  // Exit with appropriate code
  if (validationResults.failed.length > 0) {
    console.log('\n❌ VALIDATION FALLITA - Test bloccati\n');
    throw new Error('Validation failed');
  }

  console.log('\n✅ VALIDATION COMPLETATA - Test possono procedere\n');
}
