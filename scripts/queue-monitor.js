#!/usr/bin/env node

/**
 * 📊 QUEUE MONITOR
 * 
 * Monitor real-time del sistema multi-agent
 * Dashboard testuale stato host, queue e statistiche
 * 
 * Usage:
 *   node scripts/queue-monitor.js [--watch] [--interval <seconds>]
 */

const fs = require('fs').promises;
const path = require('path');

const LOCK_DIR = '.agent-locks';
const DEFAULT_INTERVAL = 5; // secondi

/**
 * Legge stato di tutti gli host
 */
async function getHostStatus() {
  const hosts = ['localhost:3000', 'localhost:3001', 'localhost:3002'];
  const status = [];
  
  for (const host of hosts) {
    const lockFile = path.join(LOCK_DIR, `host-${host.replace(':', '-')}.lock`);
    
    try {
      const lockData = JSON.parse(await fs.readFile(lockFile, 'utf8'));
      const age = Math.floor((Date.now() - lockData.timestamp) / 1000);
      
      status.push({
        host,
        status: 'locked',
        agentId: lockData.agentId,
        component: lockData.component,
        age,
        timestamp: lockData.timestamp
      });
    } catch (error) {
      if (error.code === 'ENOENT') {
        status.push({
          host,
          status: 'free',
          agentId: null,
          component: null,
          age: 0,
          timestamp: null
        });
      } else {
        throw error;
      }
    }
  }
  
  return status;
}

/**
 * Legge stato della queue
 */
async function getQueueStatus() {
  const queueFile = path.join(LOCK_DIR, 'queue.json');
  
  try {
    const queueData = await fs.readFile(queueFile, 'utf8');
    const queue = JSON.parse(queueData);
    
    return queue.map((entry, index) => ({
      position: index + 1,
      agentId: entry.agentId,
      component: entry.component,
      age: Math.floor((Date.now() - entry.timestamp) / 1000),
      timestamp: entry.timestamp
    }));
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

/**
 * Legge statistiche dal log
 */
async function getStatistics() {
  const logFile = path.join(LOCK_DIR, 'lock-history.log');
  
  try {
    const logData = await fs.readFile(logFile, 'utf8');
    const lines = logData.trim().split('\n').filter(line => line.length > 0);
    
    const stats = {
      totalOperations: lines.length,
      acquisitions: lines.filter(line => line.includes('ACQUIRE')).length,
      releases: lines.filter(line => line.includes('RELEASE')).length,
      cleanups: lines.filter(line => line.includes('CLEANUP')).length,
      queueEntries: lines.filter(line => line.includes('QUEUE')).length
    };
    
    return stats;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {
        totalOperations: 0,
        acquisitions: 0,
        releases: 0,
        cleanups: 0,
        queueEntries: 0
      };
    }
    throw error;
  }
}

/**
 * Mostra dashboard completo
 */
async function showDashboard() {
  console.clear();
  
  const timestamp = new Date().toLocaleString();
  console.log(`📊 QUEUE MONITOR - ${timestamp}`);
  console.log('='.repeat(50));
  
  // Stato host
  console.log('\n🖥️  STATO HOST');
  console.log('-'.repeat(30));
  
  const hostStatus = await getHostStatus();
  hostStatus.forEach(host => {
    if (host.status === 'locked') {
      console.log(`🔒 ${host.host}: ${host.agentId} (${host.component}) - ${host.age}s`);
    } else {
      console.log(`✅ ${host.host}: Libero`);
    }
  });
  
  // Queue
  console.log('\n⏳ CODA AGENTI');
  console.log('-'.repeat(30));
  
  const queue = await getQueueStatus();
  if (queue.length === 0) {
    console.log('📭 Coda vuota');
  } else {
    queue.forEach(entry => {
      console.log(`  ${entry.position}. ${entry.agentId} - ${entry.component} (${entry.age}s)`);
    });
  }
  
  // Statistiche
  console.log('\n📈 STATISTICHE');
  console.log('-'.repeat(30));
  
  const stats = await getStatistics();
  console.log(`Operazioni totali: ${stats.totalOperations}`);
  console.log(`Lock acquisiti: ${stats.acquisitions}`);
  console.log(`Lock rilasciati: ${stats.releases}`);
  console.log(`Cleanup eseguiti: ${stats.cleanups}`);
  console.log(`Entrate in coda: ${stats.queueEntries}`);
  
  // Calcoli aggiuntivi
  const activeLocks = hostStatus.filter(h => h.status === 'locked').length;
  const freeHosts = hostStatus.filter(h => h.status === 'free').length;
  const avgWaitTime = queue.length > 0 ? Math.floor(queue.reduce((sum, q) => sum + q.age, 0) / queue.length) : 0;
  
  console.log('\n📊 METRICHE LIVE');
  console.log('-'.repeat(30));
  console.log(`Host attivi: ${activeLocks}/3`);
  console.log(`Host liberi: ${freeHosts}/3`);
  console.log(`Agenti in coda: ${queue.length}`);
  console.log(`Tempo attesa medio: ${avgWaitTime}s`);
  
  // Alert
  console.log('\n🚨 ALERT');
  console.log('-'.repeat(30));
  
  const alerts = [];
  
  // Lock stale
  hostStatus.forEach(host => {
    if (host.status === 'locked' && host.age > 180) {
      alerts.push(`⚠️ Lock stale su ${host.host} (${host.age}s)`);
    }
  });
  
  // Queue troppo lunga
  if (queue.length > 3) {
    alerts.push(`⚠️ Coda troppo lunga: ${queue.length} agenti`);
  }
  
  // Tempo attesa eccessivo
  if (avgWaitTime > 300) {
    alerts.push(`⚠️ Tempo attesa eccessivo: ${avgWaitTime}s`);
  }
  
  if (alerts.length === 0) {
    console.log('✅ Nessun alert');
  } else {
    alerts.forEach(alert => console.log(alert));
  }
  
  console.log('\n' + '='.repeat(50));
}

/**
 * Modalità watch (aggiornamento continuo)
 */
async function watchMode(interval) {
  console.log(`🔄 Modalità watch attivata (aggiornamento ogni ${interval}s)`);
  console.log('Premi Ctrl+C per uscire\n');
  
  while (true) {
    try {
      await showDashboard();
      await new Promise(resolve => setTimeout(resolve, interval * 1000));
    } catch (error) {
      console.error('❌ Errore durante watch:', error.message);
      await new Promise(resolve => setTimeout(resolve, interval * 1000));
    }
  }
}

/**
 * Mostra help
 */
function showHelp() {
  console.log(`
📊 QUEUE MONITOR

Monitor real-time del sistema multi-agent per coordinamento testing.

Usage:
  node scripts/queue-monitor.js [options]

Options:
  --watch              Modalità watch (aggiornamento continuo)
  --interval <sec>     Intervallo aggiornamento in secondi (default: 5)
  --help               Mostra questo help

Examples:
  node scripts/queue-monitor.js                    # Dashboard singolo
  node scripts/queue-monitor.js --watch            # Watch continuo
  node scripts/queue-monitor.js --watch --interval 10  # Watch ogni 10s

Dashboard mostra:
  🖥️  Stato host (locked/free)
  ⏳ Coda agenti in attesa
  📈 Statistiche operazioni
  📊 Metriche live
  🚨 Alert sistema
  `);
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  
  // Parse arguments
  let watch = false;
  let interval = DEFAULT_INTERVAL;
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--help':
        showHelp();
        return;
        
      case '--watch':
        watch = true;
        break;
        
      case '--interval':
        if (i + 1 < args.length) {
          interval = parseInt(args[i + 1]);
          if (isNaN(interval) || interval < 1) {
            console.error('❌ Intervallo deve essere un numero positivo');
            process.exit(1);
          }
          i++; // Skip next argument
        } else {
          console.error('❌ --interval richiede un valore');
          process.exit(1);
        }
        break;
        
      default:
        console.error(`❌ Opzione sconosciuta: ${args[i]}`);
        console.error('Usa --help per vedere le opzioni disponibili');
        process.exit(1);
    }
  }
  
  try {
    if (watch) {
      await watchMode(interval);
    } else {
      await showDashboard();
    }
  } catch (error) {
    console.error('❌ Errore:', error.message);
    process.exit(1);
  }
}

// Gestione SIGINT per watch mode
process.on('SIGINT', () => {
  console.log('\n👋 Monitor fermato');
  process.exit(0);
});

// Esegui se chiamato direttamente
if (require.main === module) {
  main();
}

module.exports = {
  getHostStatus,
  getQueueStatus,
  getStatistics,
  showDashboard,
  watchMode
};
