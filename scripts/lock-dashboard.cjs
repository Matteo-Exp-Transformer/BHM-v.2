#!/usr/bin/env node
/**
 * 📊 LOCK DASHBOARD - Monitoring Real-Time
 *
 * Dashboard terminale per monitoraggio lock system:
 * - Lock attivi (host, agente, durata)
 * - Queue (posizioni, tempi attesa)
 * - Heartbeat agenti (status, last seen)
 * - Alert/Warning automatici
 *
 * Usage:
 *   node scripts/lock-dashboard.cjs
 *   npm run lock:dashboard
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// Config
const LOCK_DIR = '.agent-locks';
const REFRESH_INTERVAL = 2000; // 2s
const ALERT_HEARTBEAT_STALE = 60000; // 1min
const WARNING_QUEUE_LONG = 3; // 3+ agenti in queue

/**
 * Clear terminal
 */
function clearScreen() {
  console.clear();
}

/**
 * Formatta durata in HH:MM:SS
 */
function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Legge lock attivi
 */
async function readLocks() {
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
        // Lock corrotto, skip
      }
    }

    return locks;
  } catch (error) {
    return [];
  }
}

/**
 * Legge queue
 */
async function readQueue() {
  try {
    const queuePath = path.join(LOCK_DIR, 'queue.json');
    const queueData = await fs.readFile(queuePath, 'utf8');
    return JSON.parse(queueData);
  } catch (error) {
    return [];
  }
}

/**
 * Legge heartbeats
 */
async function readHeartbeats() {
  try {
    const files = await fs.readdir(LOCK_DIR);
    const heartbeatFiles = files.filter(f => f.endsWith('.heartbeat'));

    const heartbeats = {};
    for (const file of heartbeatFiles) {
      try {
        const heartbeatPath = path.join(LOCK_DIR, file);
        const heartbeatData = JSON.parse(await fs.readFile(heartbeatPath, 'utf8'));
        const agentId = file.replace('.heartbeat', '');
        heartbeats[agentId] = heartbeatData;
      } catch (error) {
        // Heartbeat corrotto, skip
      }
    }

    return heartbeats;
  } catch (error) {
    return {};
  }
}

/**
 * Legge history logs
 */
async function readHistory() {
  try {
    const historyPath = path.join(LOCK_DIR, 'lock-history.log');
    const historyData = await fs.readFile(historyPath, 'utf8');
    const lines = historyData.trim().split('\n').slice(-10); // Ultimi 10
    return lines;
  } catch (error) {
    return [];
  }
}

/**
 * Render dashboard
 */
async function renderDashboard() {
  const now = Date.now();
  const locks = await readLocks();
  const queue = await readQueue();
  const heartbeats = await readHeartbeats();
  const history = await readHistory();

  clearScreen();

  // Header
  console.log('╔' + '═'.repeat(78) + '╗');
  console.log('║' + ' 📊 LOCK DASHBOARD - Real-Time Monitoring'.padEnd(78) + '║');
  console.log('╠' + '═'.repeat(78) + '╣');
  console.log('║' + ` 🕐 ${new Date().toLocaleTimeString()} | Refresh: ${REFRESH_INTERVAL / 1000}s`.padEnd(78) + '║');
  console.log('╚' + '═'.repeat(78) + '╝');

  console.log('');

  // Section 1: Lock Attivi
  console.log('┌─ 🔒 LOCK ATTIVI ─────────────────────────────────────────────────┐');

  if (locks.length === 0) {
    console.log('│ ✅ Nessun lock attivo - tutti i pool sono liberi               │');
  } else {
    locks.forEach((lock, index) => {
      const age = formatDuration(now - lock.timestamp);
      const status = '🔒 LOCKED';
      const line = `│ ${index + 1}. ${lock.host.padEnd(20)} │ ${lock.agentId.padEnd(10)} │ ${age.padEnd(10)} │`;
      console.log(line.padEnd(67) + '│');
      console.log(`│    Component: ${lock.component.padEnd(45)} │`.padEnd(67) + '│');

      // Check heartbeat
      const heartbeat = heartbeats[`agent-${lock.agentId}`];
      if (heartbeat) {
        const heartbeatAge = now - heartbeat.timestamp;
        const heartbeatStatus = heartbeatAge > ALERT_HEARTBEAT_STALE ? '🔴 STALE' : '🟢 OK';
        console.log(`│    Heartbeat: ${heartbeatStatus} (${formatDuration(heartbeatAge)} ago)`.padEnd(67) + '│');
      } else {
        console.log('│    Heartbeat: ❌ MISSING'.padEnd(67) + '│');
      }

      console.log('│'.padEnd(67) + '│');
    });
  }

  console.log('└───────────────────────────────────────────────────────────────────┘');
  console.log('');

  // Section 2: Queue
  console.log('┌─ ⏳ QUEUE AGENTI ────────────────────────────────────────────────┐');

  if (queue.length === 0) {
    console.log('│ ✅ Nessun agente in attesa                                      │');
  } else {
    // Warning se queue lunga
    if (queue.length >= WARNING_QUEUE_LONG) {
      console.log('│ ⚠️  WARNING: Queue lunga, possibile bottleneck                  │');
      console.log('│'.padEnd(67) + '│');
    }

    queue.forEach((entry, index) => {
      const age = formatDuration(now - entry.timestamp);
      const estimatedWait = formatDuration((queue.length - index) * 5 * 60 * 1000); // 5min per agente (stima)
      console.log(`│ #${(index + 1).toString().padEnd(2)} ${entry.agentId.padEnd(12)} │ ${entry.component.padEnd(20)} │ Wait: ${age.padEnd(8)} │`.padEnd(67) + '│');
      console.log(`│     Estimated time: ${estimatedWait.padEnd(40)} │`.padEnd(67) + '│');
    });
  }

  console.log('└───────────────────────────────────────────────────────────────────┘');
  console.log('');

  // Section 3: Heartbeats
  console.log('┌─ 💓 HEARTBEATS AGENTI ───────────────────────────────────────────┐');

  const heartbeatKeys = Object.keys(heartbeats);
  if (heartbeatKeys.length === 0) {
    console.log('│ ⚪ Nessun heartbeat attivo                                       │');
  } else {
    heartbeatKeys.forEach(agentKey => {
      const hb = heartbeats[agentKey];
      const age = now - hb.timestamp;
      const status = age > ALERT_HEARTBEAT_STALE ? '🔴 STALE' : '🟢 ACTIVE';
      const agentId = agentKey.replace('agent-', '');

      console.log(`│ ${status} ${agentId.padEnd(12)} │ Last: ${formatDuration(age).padEnd(10)} ago │ ${hb.host || 'N/A'}`.padEnd(67) + '│');
    });
  }

  console.log('└───────────────────────────────────────────────────────────────────┘');
  console.log('');

  // Section 4: Alerts
  const alerts = [];

  // Alert: Lock con heartbeat stale
  locks.forEach(lock => {
    const heartbeat = heartbeats[`agent-${lock.agentId}`];
    if (!heartbeat || (now - heartbeat.timestamp) > ALERT_HEARTBEAT_STALE) {
      alerts.push(`🚨 Lock ${lock.host} ha heartbeat stale (${lock.agentId})`);
    }
  });

  // Alert: Queue lunga
  if (queue.length >= WARNING_QUEUE_LONG) {
    alerts.push(`⚠️  Queue lunga: ${queue.length} agenti in attesa`);
  }

  // Alert: Nessun lock ma queue piena
  if (locks.length === 0 && queue.length > 0) {
    alerts.push('🔔 Queue non vuota ma nessun lock attivo - possibile deadlock');
  }

  if (alerts.length > 0) {
    console.log('┌─ 🚨 ALERTS ──────────────────────────────────────────────────────┐');
    alerts.forEach(alert => {
      console.log(`│ ${alert}`.padEnd(67) + '│');
    });
    console.log('└───────────────────────────────────────────────────────────────────┘');
    console.log('');
  }

  // Section 5: Recent History (ultimi 5)
  console.log('┌─ 📜 RECENT HISTORY (Last 5) ────────────────────────────────────┐');

  if (history.length === 0) {
    console.log('│ ⚪ Nessuna operazione recente                                    │');
  } else {
    history.slice(-5).forEach(line => {
      const parts = line.split('|').map(p => p.trim());
      if (parts.length >= 4) {
        const [timestamp, operation, agentId, host] = parts;
        const time = new Date(timestamp).toLocaleTimeString();
        console.log(`│ ${time} │ ${operation.padEnd(15)} │ ${agentId.padEnd(10)} │ ${host.padEnd(12)}`.padEnd(67) + '│');
      }
    });
  }

  console.log('└───────────────────────────────────────────────────────────────────┘');
  console.log('');

  // Footer
  console.log('Press Ctrl+C to exit | Auto-refresh every 2s');
  console.log('');
}

/**
 * Main loop
 */
async function main() {
  console.log('🚀 Starting Lock Dashboard...\n');

  // Verifica LOCK_DIR esiste
  try {
    await fs.access(LOCK_DIR);
  } catch (error) {
    console.log(`📁 Creating lock directory: ${LOCK_DIR}`);
    await fs.mkdir(LOCK_DIR, { recursive: true });
  }

  // Loop infinito con refresh
  while (true) {
    await renderDashboard();
    await new Promise(resolve => setTimeout(resolve, REFRESH_INTERVAL));
  }
}

// Gestione ctrl+c
process.on('SIGINT', () => {
  console.log('\n\n👋 Dashboard chiusa\n');
  process.exit(0);
});

// Run
main().catch(error => {
  console.error('\n💥 ERRORE:', error);
  process.exit(1);
});
