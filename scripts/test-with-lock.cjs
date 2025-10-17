#!/usr/bin/env node

/**
 * 🔒 TEST WITH LOCK
 * 
 * Wrapper per esecuzione test Playwright con acquisizione lock atomico
 * Gestisce queue, timeout e rilascio automatico del lock
 * 
 * Usage:
 *   node scripts/test-with-lock.cjs <agentId> <component> [playwright-args...]
 * 
 * LOCKED: 2025-01-16 - Wrapper test con lock completamente testato
 * Test eseguiti: acquisizione lock, queue management, timeout gestione, rilascio automatico
 * Funzionalità: coordinamento agenti, fallback porte, integrazione Playwright, cleanup garantito
 * NON MODIFICARE SENZA PERMESSO ESPLICITO
 */

const { spawn } = require('child_process');
const { acquireLock, releaseLock, checkLockStatus, enterQueue } = require('./agent-lock-manager.cjs');
const { detectAppPort } = require('./detect-app-port.cjs');

// Configurazione
const LOCK_TIMEOUT = 300000; // 5 minuti
const QUEUE_POLL_INTERVAL = 30000; // 30 secondi
const MAX_QUEUE_WAIT = 600000; // 10 minuti

/**
 * Trova porta disponibile per l'agente
 */
async function findAgentPort(agentId) {
  try {
    // Prova a trovare porta libera
    const freePort = await detectAppPort([3000, 3001, 3002], 2000);
    if (freePort) {
      return freePort.port;
    }
    
    // Se non trova porta libera, usa porta di default per agente
    const agentPorts = {
      'agent-1': 3000,
      'agent-2': 3001,
      'agent-3': 3002,
      'agent-4': 3003,
      'agent-5': 3004
    };
    
    return agentPorts[agentId] || 3000;
    
  } catch (error) {
    console.warn('⚠️ Errore rilevamento porta, uso 3000:', error.message);
    return 3000;
  }
}

/**
 * Acquisisce lock e esegue test
 */
async function runTestWithLock(agentId, component, playwrightArgs) {
  const startTime = Date.now();
  let lockAcquired = false;
  let host = null;
  
  try {
    console.log(`🔒 Agente ${agentId} richiede lock per ${component}...`);
    
    // Trova porta disponibile
    const port = await findAgentPort(agentId);
    host = `localhost:${port}`;
    
    console.log(`🎯 Tentativo acquisizione lock su ${host}`);
    
    // Tentativo acquisizione lock
    lockAcquired = await acquireLock(host, agentId, component);
    
    if (!lockAcquired) {
      console.log(`⏳ Lock non disponibile su ${host}, entro in queue...`);
      
      // Entra in queue
      const queuePosition = await enterQueue(agentId, component);
      
      if (queuePosition === -1) {
        throw new Error('Errore entrata in queue');
      }
      
      console.log(`📋 Posizione in queue: ${queuePosition}`);
      
      // Polling per disponibilità
      const queueStartTime = Date.now();
      
      while (Date.now() - queueStartTime < MAX_QUEUE_WAIT) {
        await new Promise(resolve => setTimeout(resolve, QUEUE_POLL_INTERVAL));
        
        console.log(`🔄 Controllo disponibilità ${host}...`);
        
        const status = await checkLockStatus(host);
        if (!status) {
          console.log(`✅ Host ${host} disponibile, riprovo acquisizione...`);
          
          lockAcquired = await acquireLock(host, agentId, component);
          if (lockAcquired) {
            break;
          }
        }
      }
      
      if (!lockAcquired) {
        throw new Error(`Timeout attesa queue per ${host}`);
      }
    }
    
    console.log(`✅ Lock acquisito su ${host} per ${component}`);
    
    // Esegui test Playwright
    console.log(`🧪 Esecuzione test Playwright...`);
    console.log(`📝 Comando: playwright test ${playwrightArgs.join(' ')}`);
    
    const testResult = await runPlaywrightTest(playwrightArgs);
    
    const duration = Math.floor((Date.now() - startTime) / 1000);
    console.log(`✅ Test completato in ${duration}s`);
    
    return testResult;
    
  } catch (error) {
    console.error(`❌ Errore durante test:`, error.message);
    throw error;
    
  } finally {
    // Rilascia lock
    if (lockAcquired && host) {
      try {
        await releaseLock(host);
        console.log(`🔓 Lock rilasciato su ${host}`);
      } catch (error) {
        console.error(`❌ Errore rilascio lock:`, error.message);
      }
    }
  }
}

/**
 * Esegue test Playwright
 */
async function runPlaywrightTest(args) {
  return new Promise((resolve, reject) => {
    console.log(`🚀 Avvio Playwright con args: ${args.join(' ')}`);
    
    const playwrightProcess = spawn('npx', ['playwright', 'test', ...args], {
      stdio: 'inherit',
      shell: true
    });
    
    playwrightProcess.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ Test Playwright completati con successo`);
        resolve({ success: true, code });
      } else {
        console.error(`❌ Test Playwright falliti con codice ${code}`);
        resolve({ success: false, code });
      }
    });
    
    playwrightProcess.on('error', (error) => {
      console.error(`❌ Errore esecuzione Playwright:`, error.message);
      reject(error);
    });
  });
}

/**
 * Mostra help
 */
function showHelp() {
  console.log(`
🔒 TEST WITH LOCK

Wrapper per esecuzione test Playwright con acquisizione lock atomico.

Usage:
  node scripts/test-with-lock.cjs <agentId> <component> [playwright-args...]

Arguments:
  agentId              ID dell'agente (es: agent-1, agent-2, agent-3)
  component            Nome componente da testare (es: Button, LoginForm)
  playwright-args      Argomenti da passare a Playwright

Examples:
  node scripts/test-with-lock.cjs agent-1 Button --config=playwright-agent1.config.ts
  node scripts/test-with-lock.cjs agent-2 LoginForm --headed
  node scripts/test-with-lock.cjs agent-3 TemperatureValidation --grep="validazione"

Workflow:
  1. Trova porta disponibile per l'agente
  2. Tenta acquisizione lock atomico
  3. Se fallisce, entra in queue FIFO
  4. Quando ottiene lock, esegue test Playwright
  5. Rilascia lock automaticamente al termine

Lock System:
  - Timeout lock: 5 minuti
  - Polling queue: ogni 30 secondi
  - Max attesa queue: 10 minuti
  - Cleanup automatico lock stale
  `);
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2 || args[0] === '--help') {
    showHelp();
    return;
  }
  
  const agentId = args[0];
  const component = args[1];
  const playwrightArgs = args.slice(2);
  
  console.log(`🔒 TEST WITH LOCK - Agente ${agentId}`);
  console.log('=====================================');
  console.log(`Componente: ${component}`);
  console.log(`Args Playwright: ${playwrightArgs.join(' ')}`);
  console.log('');
  
  try {
    const result = await runTestWithLock(agentId, component, playwrightArgs);
    
    if (result.success) {
      console.log(`\n✅ Test completati con successo`);
      process.exit(0);
    } else {
      console.log(`\n❌ Test falliti`);
      process.exit(result.code || 1);
    }
    
  } catch (error) {
    console.error(`\n❌ Errore:`, error.message);
    process.exit(1);
  }
}

// Esegui se chiamato direttamente
if (require.main === module) {
  main();
}

module.exports = {
  runTestWithLock,
  findAgentPort,
  runPlaywrightTest
};
