#!/usr/bin/env node

/**
 * 🔐 AGENT LOCK MANAGER
 * 
 * Sistema di lock atomici per coordinamento multi-agent
 * Gestisce acquisizione, rilascio, heartbeat e cleanup automatico
 * 
 * Usage:
 *   node scripts/agent-lock-manager.js acquire <host> <agentId> <component>
 *   node scripts/agent-lock-manager.js release <host>
 *   node scripts/agent-lock-manager.js status <host>
 *   node scripts/agent-lock-manager.js heartbeat <agentId>
 *   node scripts/agent-lock-manager.js cleanup
 *   node scripts/agent-lock-manager.js queue <agentId> <component>
 */

const fs = require('fs').promises;
const path = require('path');

// Configurazione
const LOCK_DIR = '.agent-locks';
const HEARTBEAT_INTERVAL = 60000; // 60 secondi
const LOCK_TIMEOUT = 180000; // 3 minuti
const CLEANUP_INTERVAL = 120000; // 2 minuti

/**
 * Inizializza directory lock se non esiste
 */
async function initLockDir() {
  try {
    await fs.mkdir(LOCK_DIR, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
}

/**
 * Acquisisce lock atomico per un host
 * @param {string} host - Host da bloccare (es: "localhost:3000")
 * @param {string} agentId - ID dell'agente
 * @param {string} component - Componente da testare
 * @param {number} port - Porta effettiva dell'app (opzionale)
 * @returns {boolean} - true se lock acquisito, false se già occupato
 */
async function acquireLock(host, agentId, component, port = null) {
  await initLockDir();
  
  const lockFile = path.join(LOCK_DIR, `host-${host.replace(':', '-')}.lock`);
  const heartbeatFile = path.join(LOCK_DIR, `agent-${agentId}.heartbeat`);
  
  try {
    // Tentativo lock atomico con flag 'wx' (write + exclusive)
    const lockData = {
      agentId,
      component,
      timestamp: Date.now(),
      host,
      port: port || extractPortFromHost(host),
      status: 'locked',
      pid: process.pid
    };
    
    await fs.writeFile(lockFile, JSON.stringify(lockData, null, 2), { flag: 'wx' });
    
    // Crea heartbeat file
    const heartbeatData = {
      agentId,
      timestamp: Date.now(),
      status: 'active',
      host,
      port: lockData.port,
      component
    };
    
    await fs.writeFile(heartbeatFile, JSON.stringify(heartbeatData, null, 2));
    
    // Log operazione
    await logOperation('ACQUIRE', agentId, host, component, 'SUCCESS');
    
    console.log(`✅ Lock acquisito: ${agentId} su ${host} (porta ${lockData.port}) per ${component}`);
    return true;
    
  } catch (error) {
    if (error.code === 'EEXIST') {
      // Lock già esistente
      await logOperation('ACQUIRE', agentId, host, component, 'FAILED - Already locked');
      console.log(`❌ Lock già esistente su ${host}`);
      return false;
    }
    throw error;
  }
}

/**
 * Estrae porta da host string
 * @param {string} host - Host string (es: "localhost:3000")
 * @returns {number} - Porta estratta
 */
function extractPortFromHost(host) {
  const portMatch = host.match(/:(\d+)$/);
  return portMatch ? parseInt(portMatch[1]) : 3000;
}

/**
 * Rilascia lock per un host
 * @param {string} host - Host da sbloccare
 */
async function releaseLock(host) {
  const lockFile = path.join(LOCK_DIR, `host-${host.replace(':', '-')}.lock`);
  
  try {
    // Leggi dati lock prima di rimuovere
    const lockData = JSON.parse(await fs.readFile(lockFile, 'utf8'));
    
    // Rimuovi lock file
    await fs.unlink(lockFile);
    
    // Log operazione
    await logOperation('RELEASE', lockData.agentId, host, lockData.component, 'SUCCESS');
    
    console.log(`🔓 Lock rilasciato: ${lockData.agentId} da ${host}`);
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(`⚠️ Lock file non trovato per ${host}`);
      return;
    }
    throw error;
  }
}

/**
 * Verifica stato di un host
 * @param {string} host - Host da verificare
 * @returns {Object|null} - Dati lock o null se libero
 */
async function checkLockStatus(host) {
  const lockFile = path.join(LOCK_DIR, `host-${host.replace(':', '-')}.lock`);
  
  try {
    const lockData = JSON.parse(await fs.readFile(lockFile, 'utf8'));
    
    // Verifica se lock è scaduto
    const now = Date.now();
    if (now - lockData.timestamp > LOCK_TIMEOUT) {
      console.log(`⚠️ Lock scaduto per ${host}, rimuovendo...`);
      await releaseLock(host);
      return null;
    }
    
    return lockData;
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null; // Host libero
    }
    throw error;
  }
}

/**
 * Aggiorna heartbeat per un agente
 * @param {string} agentId - ID dell'agente
 */
async function updateHeartbeat(agentId) {
  const heartbeatFile = path.join(LOCK_DIR, `agent-${agentId}.heartbeat`);
  
  try {
    // Leggi dati esistenti
    const existingData = JSON.parse(await fs.readFile(heartbeatFile, 'utf8'));
    
    // Aggiorna timestamp
    const heartbeatData = {
      ...existingData,
      timestamp: Date.now(),
      status: 'active'
    };
    
    await fs.writeFile(heartbeatFile, JSON.stringify(heartbeatData, null, 2));
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(`⚠️ Heartbeat file non trovato per ${agentId}`);
      return;
    }
    throw error;
  }
}

/**
 * Pulisce lock stale (scaduti)
 */
async function cleanStaleLocks() {
  await initLockDir();
  
  try {
    const files = await fs.readdir(LOCK_DIR);
    const lockFiles = files.filter(f => f.startsWith('host-') && f.endsWith('.lock'));
    
    let cleaned = 0;
    
    for (const file of lockFiles) {
      const lockFile = path.join(LOCK_DIR, file);
      
      try {
        const lockData = JSON.parse(await fs.readFile(lockFile, 'utf8'));
        const now = Date.now();
        
        // Verifica se lock è scaduto
        if (now - lockData.timestamp > LOCK_TIMEOUT) {
          await fs.unlink(lockFile);
          await logOperation('CLEANUP', lockData.agentId, lockData.host, lockData.component, 'STALE LOCK REMOVED');
          console.log(`🧹 Lock stale rimosso: ${lockData.agentId} da ${lockData.host}`);
          cleaned++;
        }
        
      } catch (error) {
        console.error(`Errore pulizia lock ${file}:`, error.message);
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 Pulizia completata: ${cleaned} lock stale rimossi`);
    }
    
  } catch (error) {
    console.error('Errore durante pulizia:', error.message);
  }
}

/**
 * AUTO-RECOVERY: Verifica se processo è ancora vivo
 * @param {number} pid - Process ID
 * @returns {boolean} - true se processo vivo, false se morto
 */
function isProcessAlive(pid) {
  try {
    // process.kill(pid, 0) non killa ma verifica esistenza
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error.code === 'EPERM'; // Processo esiste ma non abbiamo permessi
  }
}

/**
 * AUTO-RECOVERY: Rilascia lock se processo morto
 * @param {string} lockFile - Path al file lock
 * @returns {boolean} - true se recovery eseguito, false se non necessario
 */
async function autoRecover(lockFile) {
  try {
    const lockData = JSON.parse(await fs.readFile(lockFile, 'utf8'));
    const pid = lockData.pid;

    // Check se PID processo ancora vivo
    if (!isProcessAlive(pid)) {
      console.log(`🔧 AUTO-RECOVERY: Processo ${pid} morto, rilascio lock ${lockData.host}`);

      await fs.unlink(lockFile);
      await logOperation('AUTO_RECOVERY', lockData.agentId, lockData.host, lockData.component, `Dead PID ${pid}`);

      // Cleanup heartbeat se esiste
      const heartbeatFile = path.join(LOCK_DIR, `agent-${lockData.agentId}.heartbeat`);
      try {
        await fs.unlink(heartbeatFile);
      } catch (error) {
        // Heartbeat già rimosso, OK
      }

      return true;
    }

    return false;
  } catch (error) {
    console.error('Errore auto-recovery:', error.message);
    return false;
  }
}

/**
 * AUTO-RECOVERY: Cleanup automatico con verifica processo
 */
async function autoRecoveryCleanup() {
  try {
    await initLockDir();
    const files = await fs.readdir(LOCK_DIR);
    const lockFiles = files.filter(f => f.startsWith('host-') && f.endsWith('.lock'));

    let recovered = 0;

    for (const file of lockFiles) {
      const lockFile = path.join(LOCK_DIR, file);

      // Esegui auto-recovery se processo morto
      if (await autoRecover(lockFile)) {
        recovered++;
      }
    }

    if (recovered > 0) {
      console.log(`🔧 AUTO-RECOVERY completato: ${recovered} lock rilasciati`);
    }
  } catch (error) {
    console.error('Errore auto-recovery cleanup:', error.message);
  }
}

/**
 * Gestisce queue per agenti in attesa
 * @param {string} agentId - ID dell'agente
 * @param {string} component - Componente da testare
 * @returns {number} - Posizione in coda
 */
async function enterQueue(agentId, component) {
  await initLockDir();
  
  const queueFile = path.join(LOCK_DIR, 'queue.json');
  
  try {
    // Leggi queue esistente
    let queue = [];
    try {
      const queueData = await fs.readFile(queueFile, 'utf8');
      queue = JSON.parse(queueData);
    } catch (error) {
      // File non esiste, crea queue vuota
    }
    
    // Aggiungi agente alla coda
    const queueEntry = {
      agentId,
      component,
      timestamp: Date.now(),
      status: 'waiting'
    };
    
    queue.push(queueEntry);
    
    // Salva queue aggiornata
    await fs.writeFile(queueFile, JSON.stringify(queue, null, 2));
    
    const position = queue.length;
    await logOperation('QUEUE', agentId, 'queue', component, `Position: ${position}`);
    
    console.log(`⏳ Agente ${agentId} in coda per ${component} (posizione: ${position})`);
    return position;
    
  } catch (error) {
    console.error('Errore gestione queue:', error.message);
    return -1;
  }
}

/**
 * Log operazioni in file di storia
 * @param {string} operation - Tipo operazione
 * @param {string} agentId - ID agente
 * @param {string} host - Host
 * @param {string} component - Componente
 * @param {string} result - Risultato
 */
async function logOperation(operation, agentId, host, component, result) {
  const logFile = path.join(LOCK_DIR, 'lock-history.log');
  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp} | ${operation} | ${agentId} | ${host} | ${component} | ${result}\n`;
  
  try {
    await fs.appendFile(logFile, logEntry);
  } catch (error) {
    console.error('Errore scrittura log:', error.message);
  }
}

/**
 * Mostra stato di tutti gli host
 */
async function showStatus() {
  console.log('\n🔍 STATO SISTEMA LOCK');
  console.log('====================');
  
  const hosts = ['localhost:3000', 'localhost:3001', 'localhost:3002'];
  
  for (const host of hosts) {
    const status = await checkLockStatus(host);
    if (status) {
      const age = Math.floor((Date.now() - status.timestamp) / 1000);
      console.log(`🔒 ${host}: Occupato da ${status.agentId} (${status.component}) - ${age}s`);
    } else {
      console.log(`✅ ${host}: Libero`);
    }
  }
  
  // Mostra queue
  try {
    const queueFile = path.join(LOCK_DIR, 'queue.json');
    const queueData = await fs.readFile(queueFile, 'utf8');
    const queue = JSON.parse(queueData);
    
    if (queue.length > 0) {
      console.log('\n⏳ AGENTI IN CODA:');
      queue.forEach((entry, index) => {
        const age = Math.floor((Date.now() - entry.timestamp) / 1000);
        console.log(`  ${index + 1}. ${entry.agentId} - ${entry.component} (${age}s)`);
      });
    }
  } catch (error) {
    // Queue vuota o non esiste
  }
  
  console.log('');
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  try {
    switch (command) {
      case 'acquire':
        if (args.length !== 4) {
          console.error('Usage: acquire <host> <agentId> <component>');
          process.exit(1);
        }
        const success = await acquireLock(args[1], args[2], args[3]);
        process.exit(success ? 0 : 1);
        break;
        
      case 'release':
        if (args.length !== 2) {
          console.error('Usage: release <host>');
          process.exit(1);
        }
        await releaseLock(args[1]);
        break;
        
      case 'status':
        if (args.length === 2) {
          const status = await checkLockStatus(args[1]);
          console.log(status ? JSON.stringify(status, null, 2) : 'Host libero');
        } else {
          await showStatus();
        }
        break;
        
      case 'heartbeat':
        if (args.length !== 2) {
          console.error('Usage: heartbeat <agentId>');
          process.exit(1);
        }
        await updateHeartbeat(args[1]);
        break;
        
      case 'cleanup':
        await cleanStaleLocks();
        await autoRecoveryCleanup(); // Auto-recovery integrato
        break;

      case 'auto-recovery':
        await autoRecoveryCleanup();
        break;
        
      case 'queue':
        if (args.length !== 3) {
          console.error('Usage: queue <agentId> <component>');
          process.exit(1);
        }
        const position = await enterQueue(args[1], args[2]);
        process.exit(position > 0 ? 0 : 1);
        break;
        
      default:
        console.log(`
🔐 AGENT LOCK MANAGER (v2.0 with Auto-Recovery)

Usage:
  node scripts/agent-lock-manager.js acquire <host> <agentId> <component>
  node scripts/agent-lock-manager.js release <host>
  node scripts/agent-lock-manager.js status [host]
  node scripts/agent-lock-manager.js heartbeat <agentId>
  node scripts/agent-lock-manager.js cleanup
  node scripts/agent-lock-manager.js auto-recovery
  node scripts/agent-lock-manager.js queue <agentId> <component>

Examples:
  node scripts/agent-lock-manager.js acquire localhost:3000 agent-1 Button
  node scripts/agent-lock-manager.js release localhost:3000
  node scripts/agent-lock-manager.js status
  node scripts/agent-lock-manager.js auto-recovery
        `);
        break;
    }
    
  } catch (error) {
    console.error('❌ Errore:', error.message);
    process.exit(1);
  }
}

// Esegui se chiamato direttamente
if (require.main === module) {
  main();
}

module.exports = {
  acquireLock,
  releaseLock,
  checkLockStatus,
  updateHeartbeat,
  cleanStaleLocks,
  autoRecoveryCleanup,
  enterQueue,
  showStatus,
  extractPortFromHost
};
