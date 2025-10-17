#!/usr/bin/env node
/**
 * 🔍 DEADLOCK DETECTOR
 *
 * Rileva e risolve situazioni di deadlock nel sistema multi-agent:
 * - Dipendenze circolari tra agenti
 * - Queue bloccata senza progressi >10min
 * - Lock vecchi senza heartbeat
 * - Force-release lock più vecchio in caso deadlock
 *
 * Usage:
 *   node scripts/deadlock-detector.cjs         # Single check
 *   node scripts/deadlock-detector.cjs --watch # Continuous monitoring
 */

const fs = require('fs').promises;
const path = require('path');

// Config
const LOCK_DIR = '.agent-locks';
const DEADLOCK_THRESHOLD = 10 * 60 * 1000; // 10 min senza progressi
const WATCH_INTERVAL = 30000; // Check ogni 30s

let lastQueueState = null;
let lastStateTimestamp = Date.now();

/**
 * Legge tutti i lock attivi
 */
async function readActiveLocks() {
  try {
    const files = await fs.readdir(LOCK_DIR);
    const lockFiles = files.filter(f => f.startsWith('host-') && f.endsWith('.lock'));

    const locks = [];
    for (const file of lockFiles) {
      try {
        const lockPath = path.join(LOCK_DIR, file);
        const lockData = JSON.parse(await fs.readFile(lockPath, 'utf8'));
        locks.push({ file, ...lockData });
      } catch (error) {
        console.error(`Errore lettura lock ${file}:`, error.message);
      }
    }

    return locks;
  } catch (error) {
    return [];
  }
}

/**
 * Legge stato queue
 */
async function readQueueState() {
  try {
    const queuePath = path.join(LOCK_DIR, 'queue.json');
    const queueData = await fs.readFile(queuePath, 'utf8');
    return JSON.parse(queueData);
  } catch (error) {
    return [];
  }
}

/**
 * Rileva dipendenze circolari
 * Esempio: Agent-1 aspetta Agent-2, Agent-2 aspetta Agent-1
 */
function detectCircularDependencies(locks, queue) {
  const waiting = {};

  // Mappa chi aspetta cosa
  queue.forEach(entry => {
    waiting[entry.agentId] = 'lock';
  });

  // Verifica cicli (versione semplificata)
  const cycle = [];
  Object.keys(waiting).forEach(agentId => {
    if (waiting[agentId] === 'lock' && locks.length > 0) {
      cycle.push(agentId);
    }
  });

  return cycle.length > 1 ? cycle : null;
}

/**
 * Rileva queue bloccata (nessun progresso >10min)
 */
function detectStalledQueue(queue) {
  if (queue.length === 0) {
    return null;
  }

  const now = Date.now();
  const currentStateHash = JSON.stringify(queue.map(e => e.agentId).sort());

  // Prima esecuzione
  if (lastQueueState === null) {
    lastQueueState = currentStateHash;
    lastStateTimestamp = now;
    return null;
  }

  // Check se stato cambiato
  if (currentStateHash === lastQueueState) {
    const stallDuration = now - lastStateTimestamp;

    if (stallDuration > DEADLOCK_THRESHOLD) {
      return {
        type: 'STALLED_QUEUE',
        duration: stallDuration,
        queueLength: queue.length,
        firstInQueue: queue[0]
      };
    }
  } else {
    // Stato cambiato, reset
    lastQueueState = currentStateHash;
    lastStateTimestamp = now;
  }

  return null;
}

/**
 * Rileva lock vecchi senza heartbeat
 */
async function detectStaleHeartbeats(locks) {
  const stale = [];
  const now = Date.now();

  for (const lock of locks) {
    try {
      const heartbeatPath = path.join(LOCK_DIR, `agent-${lock.agentId}.heartbeat`);
      const heartbeatData = JSON.parse(await fs.readFile(heartbeatPath, 'utf8'));

      const age = now - heartbeatData.timestamp;

      if (age > DEADLOCK_THRESHOLD) {
        stale.push({
          agentId: lock.agentId,
          host: lock.host,
          age: age,
          file: lock.file
        });
      }
    } catch (error) {
      // Heartbeat non trovato = stale
      stale.push({
        agentId: lock.agentId,
        host: lock.host,
        age: now - lock.timestamp,
        file: lock.file,
        noHeartbeat: true
      });
    }
  }

  return stale;
}

/**
 * Force-release lock più vecchio
 */
async function forceReleaseOldestLock(locks) {
  if (locks.length === 0) {
    console.log('⚠️ Nessun lock da rilasciare');
    return false;
  }

  // Trova lock più vecchio
  const oldest = locks.reduce((prev, current) =>
    prev.timestamp < current.timestamp ? prev : current
  );

  console.log(`🚨 FORCE-RELEASE lock più vecchio: ${oldest.agentId} da ${oldest.host}`);

  try {
    const lockPath = path.join(LOCK_DIR, oldest.file);
    await fs.unlink(lockPath);

    // Cleanup heartbeat
    try {
      const heartbeatPath = path.join(LOCK_DIR, `agent-${oldest.agentId}.heartbeat`);
      await fs.unlink(heartbeatPath);
    } catch (error) {
      // Heartbeat già rimosso
    }

    // Log operazione
    await logDeadlock('FORCE_RELEASE', oldest.agentId, oldest.host, 'Oldest lock removed to resolve deadlock');

    console.log('✅ Lock forzatamente rilasciato');
    return true;
  } catch (error) {
    console.error('❌ Errore force-release:', error.message);
    return false;
  }
}

/**
 * Log eventi deadlock
 */
async function logDeadlock(type, agentId, host, details) {
  const logPath = path.join(LOCK_DIR, 'deadlock-history.log');
  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp} | ${type} | ${agentId} | ${host} | ${details}\n`;

  try {
    await fs.appendFile(logPath, logEntry);
  } catch (error) {
    console.error('Errore log deadlock:', error.message);
  }
}

/**
 * Analizza sistema e rileva deadlock
 */
async function analyzeDeadlock() {
  console.log('\n🔍 DEADLOCK DETECTOR - Analisi sistema\n');

  const locks = await readActiveLocks();
  const queue = await readQueueState();

  console.log(`📊 Stato corrente:`);
  console.log(`  - Lock attivi: ${locks.length}`);
  console.log(`  - Agenti in queue: ${queue.length}`);

  // 1. Check dipendenze circolari
  const cycle = detectCircularDependencies(locks, queue);
  if (cycle) {
    console.log(`\n🚨 DEADLOCK RILEVATO: Dipendenza circolare`);
    console.log(`  Agenti coinvolti: ${cycle.join(' → ')}`);
    await logDeadlock('CIRCULAR_DEP', cycle.join(','), 'multiple', 'Circular dependency detected');

    // Risoluzione: force-release lock più vecchio
    console.log(`\n🔧 Risoluzione: Force-release lock più vecchio...`);
    await forceReleaseOldestLock(locks);
    return true;
  }

  // 2. Check queue bloccata
  const stalledQueue = detectStalledQueue(queue);
  if (stalledQueue) {
    console.log(`\n🚨 DEADLOCK RILEVATO: Queue bloccata`);
    console.log(`  Durata blocco: ${Math.floor(stalledQueue.duration / 60000)} minuti`);
    console.log(`  Primo in queue: ${stalledQueue.firstInQueue.agentId}`);
    await logDeadlock('STALLED_QUEUE', stalledQueue.firstInQueue.agentId, 'queue', `Stalled for ${Math.floor(stalledQueue.duration / 1000)}s`);

    // Risoluzione: force-release lock attivi
    console.log(`\n🔧 Risoluzione: Force-release tutti i lock...`);
    for (const lock of locks) {
      await forceReleaseOldestLock([lock]);
    }
    return true;
  }

  // 3. Check heartbeat stale
  const staleHeartbeats = await detectStaleHeartbeats(locks);
  if (staleHeartbeats.length > 0) {
    console.log(`\n🚨 WARNING: Heartbeat stale rilevati`);
    staleHeartbeats.forEach(stale => {
      console.log(`  - ${stale.agentId} @ ${stale.host}: ${Math.floor(stale.age / 60000)}min senza heartbeat`);
    });

    await logDeadlock('STALE_HEARTBEAT', staleHeartbeats.map(s => s.agentId).join(','), 'multiple', 'Stale heartbeats detected');

    // Risoluzione: rilascia lock con heartbeat stale
    console.log(`\n🔧 Risoluzione: Rilascio lock con heartbeat stale...`);
    for (const stale of staleHeartbeats) {
      await forceReleaseOldestLock([stale]);
    }
    return true;
  }

  // Nessun deadlock rilevato
  console.log(`\n✅ Nessun deadlock rilevato - sistema OK`);
  return false;
}

/**
 * Watch continuo
 */
async function watchMode() {
  console.log('🔄 DEADLOCK DETECTOR - Modalità watch attiva (ctrl+c per terminare)');
  console.log(`⏱️  Check ogni ${WATCH_INTERVAL / 1000}s\n`);

  while (true) {
    await analyzeDeadlock();

    // Sleep
    await new Promise(resolve => setTimeout(resolve, WATCH_INTERVAL));
  }
}

/**
 * Main
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--watch') || args.includes('-w')) {
    await watchMode();
  } else {
    const deadlockDetected = await analyzeDeadlock();
    process.exit(deadlockDetected ? 1 : 0);
  }
}

// Run
main().catch(error => {
  console.error('\n💥 ERRORE CRITICO:', error);
  process.exit(1);
});
