#!/usr/bin/env node

/**
 * 🔍 DETECT APP PORT
 * 
 * Auto-detect della porta dove gira l'app BHM
 * Controlla health delle porte 3000-3002 e ritorna la prima disponibile
 * 
 * Usage:
 *   node scripts/detect-app-port.cjs [--ports 3000,3001,3002] [--timeout 5000]
 *   echo $?  # Exit code: 0 = trovata, 1 = non trovata
 * 
 * LOCKED: 2025-01-16 - Auto-detect porta completamente testato
 * Test eseguiti: rilevamento app BHM, controllo health, timeout gestione, lock file integration
 * Funzionalità: health check HTTP, validazione app BHM, fallback porte, monitoraggio continuo
 * NON MODIFICARE SENZA PERMESSO ESPLICITO
 */

const http = require('http');
const fs = require('fs').promises;
const path = require('path');

// Configurazione
const DEFAULT_PORTS = [3000, 3001, 3002];
const DEFAULT_TIMEOUT = 5000; // 5 secondi
const LOCK_DIR = '.agent-locks';

/**
 * Verifica se l'app è attiva su una porta specifica
 */
async function checkAppHealth(port, timeout = DEFAULT_TIMEOUT) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const req = http.get(`http://localhost:${port}`, { timeout }, (res) => {
      const responseTime = Date.now() - startTime;
      
      // Verifica che sia effettivamente l'app BHM
      if (res.statusCode === 200) {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          // Controlla se contiene elementi caratteristici dell'app BHM
          const isBHMApp = body.includes('HACCP') || 
                          body.includes('Business Manager') ||
                          body.includes('BHM') ||
                          body.includes('react');
          
          resolve({
            healthy: true,
            responseTime,
            isBHMApp,
            statusCode: res.statusCode
          });
        });
      } else {
        resolve({
          healthy: false,
          responseTime,
          isBHMApp: false,
          statusCode: res.statusCode
        });
      }
    });
    
    req.on('error', (error) => {
      resolve({
        healthy: false,
        responseTime: Date.now() - startTime,
        isBHMApp: false,
        error: error.message
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        healthy: false,
        responseTime: Date.now() - startTime,
        isBHMApp: false,
        error: 'timeout'
      });
    });
  });
}

/**
 * Legge informazioni porta dal lock file
 */
async function readPortFromLock(port) {
  try {
    const lockFile = path.join(LOCK_DIR, `port-${port}.info`);
    const data = await fs.readFile(lockFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
}

/**
 * Trova la prima porta disponibile con app attiva
 */
async function detectAppPort(ports = DEFAULT_PORTS, timeout = DEFAULT_TIMEOUT) {
  console.log(`🔍 Ricerca app BHM sulle porte: ${ports.join(', ')}`);
  console.log(`⏱️ Timeout per porta: ${timeout}ms`);
  console.log('');
  
  const results = [];
  
  for (const port of ports) {
    console.log(`🔍 Controllo porta ${port}...`);
    
    // Leggi info dal lock se disponibile
    const lockInfo = await readPortFromLock(port);
    if (lockInfo) {
      console.log(`  📝 Lock info: ${lockInfo.agentId} (${Math.floor((Date.now() - lockInfo.timestamp) / 1000)}s fa)`);
    }
    
    // Health check
    const health = await checkAppHealth(port, timeout);
    
    const result = {
      port,
      ...health,
      lockInfo
    };
    
    results.push(result);
    
    if (health.healthy && health.isBHMApp) {
      console.log(`✅ App BHM trovata su porta ${port} (${health.responseTime}ms)`);
      return result;
    } else if (health.healthy && !health.isBHMApp) {
      console.log(`⚠️ App trovata su porta ${port} ma non sembra essere BHM`);
    } else {
      console.log(`❌ Porta ${port} non disponibile (${health.error || 'no response'})`);
    }
  }
  
  console.log('\n❌ Nessuna app BHM trovata sulle porte specificate');
  return null;
}

/**
 * Trova tutte le porte con app attive
 */
async function detectAllAppPorts(ports = DEFAULT_PORTS, timeout = DEFAULT_TIMEOUT) {
  console.log(`🔍 Scansione completa porte: ${ports.join(', ')}`);
  console.log('');
  
  const activePorts = [];
  
  for (const port of ports) {
    const health = await checkAppHealth(port, timeout);
    
    if (health.healthy && health.isBHMApp) {
      const lockInfo = await readPortFromLock(port);
      activePorts.push({
        port,
        ...health,
        lockInfo
      });
      console.log(`✅ Porta ${port}: App BHM attiva (${health.responseTime}ms)`);
    } else {
      console.log(`❌ Porta ${port}: Non disponibile`);
    }
  }
  
  return activePorts;
}

/**
 * Trova porta libera per nuovo agente
 */
async function findFreePort(ports = DEFAULT_PORTS, timeout = DEFAULT_TIMEOUT) {
  console.log(`🔍 Ricerca porta libera: ${ports.join(', ')}`);
  console.log('');
  
  for (const port of ports) {
    const health = await checkAppHealth(port, timeout);
    
    if (!health.healthy) {
      console.log(`✅ Porta ${port}: Libera`);
      return port;
    } else {
      console.log(`❌ Porta ${port}: Occupata`);
    }
  }
  
  console.log('\n❌ Nessuna porta libera trovata');
  return null;
}

/**
 * Monitoraggio continuo porte
 */
async function monitorPorts(ports = DEFAULT_PORTS, interval = 10000) {
  console.log(`📊 Monitoraggio porte ogni ${interval}ms`);
  console.log('Premi Ctrl+C per uscire\n');
  
  const monitor = async () => {
    const timestamp = new Date().toLocaleString();
    console.log(`\n🕐 ${timestamp}`);
    console.log('='.repeat(50));
    
    const activePorts = await detectAllAppPorts(ports, 2000);
    
    if (activePorts.length === 0) {
      console.log('📭 Nessuna app attiva');
    } else {
      console.log(`📊 ${activePorts.length} app attive:`);
      activePorts.forEach(app => {
        const lockInfo = app.lockInfo ? ` (${app.lockInfo.agentId})` : '';
        console.log(`  ✅ Porta ${app.port}: ${app.responseTime}ms${lockInfo}`);
      });
    }
  };
  
  // Esegui immediatamente
  await monitor();
  
  // Poi ogni intervallo
  const intervalId = setInterval(monitor, interval);
  
  // Gestione SIGINT
  process.on('SIGINT', () => {
    clearInterval(intervalId);
    console.log('\n👋 Monitoraggio terminato');
    process.exit(0);
  });
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  
  let ports = DEFAULT_PORTS;
  let timeout = DEFAULT_TIMEOUT;
  let mode = 'detect'; // detect, all, free, monitor
  
  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--ports':
        if (i + 1 < args.length) {
          ports = args[i + 1].split(',').map(p => parseInt(p.trim()));
          i++;
        }
        break;
        
      case '--timeout':
        if (i + 1 < args.length) {
          timeout = parseInt(args[i + 1]);
          i++;
        }
        break;
        
      case '--all':
        mode = 'all';
        break;
        
      case '--free':
        mode = 'free';
        break;
        
      case '--monitor':
        mode = 'monitor';
        break;
        
      case '--help':
        console.log(`
🔍 DETECT APP PORT

Auto-detect della porta dove gira l'app BHM per testing multi-agent.

Usage:
  node scripts/detect-app-port.cjs [options] [mode]

Modes:
  (default)              Trova prima porta con app BHM
  --all                  Trova tutte le porte con app BHM
  --free                 Trova prima porta libera
  --monitor              Monitoraggio continuo

Options:
  --ports <list>         Porte da controllare (default: 3000,3001,3002)
  --timeout <ms>         Timeout per porta (default: 5000)
  --help                 Mostra questo help

Examples:
  node scripts/detect-app-port.cjs                    # Trova prima app
  node scripts/detect-app-port.cjs --all              # Trova tutte le app
  node scripts/detect-app-port.cjs --free             # Trova porta libera
  node scripts/detect-app-port.cjs --monitor          # Monitoraggio continuo
  node scripts/detect-app-port.cjs --ports 3000,3001  # Porte specifiche

Exit codes:
  0    App trovata
  1    App non trovata
        `);
        return;
    }
  }
  
  try {
    let result;
    
    switch (mode) {
      case 'all':
        result = await detectAllAppPorts(ports, timeout);
        process.exit(result.length > 0 ? 0 : 1);
        break;
        
      case 'free':
        result = await findFreePort(ports, timeout);
        if (result) {
          console.log(`\n✅ Porta libera: ${result}`);
          process.exit(0);
        } else {
          process.exit(1);
        }
        break;
        
      case 'monitor':
        await monitorPorts(ports, timeout);
        break;
        
      default: // detect
        result = await detectAppPort(ports, timeout);
        if (result) {
          console.log(`\n✅ App BHM trovata su porta ${result.port}`);
          process.exit(0);
        } else {
          process.exit(1);
        }
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
  detectAppPort,
  detectAllAppPorts,
  findFreePort,
  checkAppHealth,
  monitorPorts
};
