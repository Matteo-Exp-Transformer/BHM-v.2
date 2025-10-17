#!/usr/bin/env node

/**
 * 🚀 START MULTI-INSTANCE
 * 
 * Avvia l'app su più porte simultaneamente per testing multi-agent
 * Gestisce fallback automatico e coordinamento tramite lock files
 * 
 * Usage:
 *   node scripts/start-multi-instance.cjs [--ports 3000,3001,3002] [--max-instances 3]
 * 
 * LOCKED: 2025-01-16 - Sistema multi-istanza completamente testato
 * Test eseguiti: avvio simultaneo 2 istanze, health check, lock coordination, cleanup automatico
 * Funzionalità: avvio parallelo, fallback porte, registrazione lock, gestione errori, SIGINT cleanup
 * NON MODIFICARE SENZA PERMESSO ESPLICITO
 */

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const http = require('http');

// Configurazione
const DEFAULT_PORTS = [3000, 3001, 3002];
const MAX_INSTANCES = 3;
const HEALTH_CHECK_TIMEOUT = 10000; // 10 secondi
const LOCK_DIR = '.agent-locks';

/**
 * Verifica se una porta è già in uso
 */
async function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = http.createServer();
    
    server.listen(port, () => {
      server.close(() => resolve(false)); // Porta libera
    });
    
    server.on('error', () => resolve(true)); // Porta occupata
  });
}

/**
 * Verifica se l'app è già attiva su una porta
 */
async function checkAppHealth(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}`, { timeout: 5000 }, (res) => {
      resolve(res.statusCode === 200);
    });
    
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

/**
 * Avvia istanza Vite su porta specifica
 */
async function startViteInstance(port) {
  return new Promise((resolve, reject) => {
    console.log(`🚀 Avvio istanza Vite su porta ${port}...`);
    
    const viteProcess = spawn('npm', ['run', 'dev', '--', '--port', port.toString()], {
      stdio: 'pipe',
      shell: true,
      env: { ...process.env, VITE_PORT: port.toString() }
    });
    
    let resolved = false;
    let healthCheckAttempts = 0;
    const maxHealthChecks = 20; // 20 tentativi = ~40 secondi
    
    // Log output Vite
    viteProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`[${port}] ${output.trim()}`);
      
      // Verifica se Vite è pronto
      if (output.includes('ready in') && !resolved) {
        console.log(`✅ Vite pronto su porta ${port}`);
        resolved = true;
        resolve({ process: viteProcess, port });
      }
    });
    
    viteProcess.stderr.on('data', (data) => {
      const error = data.toString();
      console.error(`[${port}] ERROR: ${error.trim()}`);
    });
    
    // Health check periodico
    const healthCheckInterval = setInterval(async () => {
      healthCheckAttempts++;
      
      if (healthCheckAttempts > maxHealthChecks) {
        clearInterval(healthCheckInterval);
        if (!resolved) {
          console.error(`❌ Timeout health check per porta ${port}`);
          viteProcess.kill();
          reject(new Error(`Timeout avvio porta ${port}`));
        }
        return;
      }
      
      const isHealthy = await checkAppHealth(port);
      if (isHealthy && !resolved) {
        clearInterval(healthCheckInterval);
        resolved = true;
        console.log(`✅ App verificata su porta ${port}`);
        resolve({ process: viteProcess, port });
      }
    }, 2000);
    
    // Gestione errori processo
    viteProcess.on('error', (error) => {
      clearInterval(healthCheckInterval);
      if (!resolved) {
        console.error(`❌ Errore avvio Vite porta ${port}:`, error.message);
        reject(error);
      }
    });
    
    viteProcess.on('exit', (code) => {
      clearInterval(healthCheckInterval);
      if (!resolved && code !== 0) {
        console.error(`❌ Vite terminato con codice ${code} su porta ${port}`);
        reject(new Error(`Vite terminato con codice ${code}`));
      }
    });
  });
}

/**
 * Scrive informazioni porta nel lock file
 */
async function writePortToLock(port, agentId = 'system') {
  try {
    await fs.mkdir(LOCK_DIR, { recursive: true });
    
    const lockFile = path.join(LOCK_DIR, `port-${port}.info`);
    const portInfo = {
      port,
      agentId,
      timestamp: Date.now(),
      status: 'active',
      pid: process.pid
    };
    
    await fs.writeFile(lockFile, JSON.stringify(portInfo, null, 2));
    console.log(`📝 Porta ${port} registrata nel lock file`);
    
  } catch (error) {
    console.error(`❌ Errore scrittura lock porta ${port}:`, error.message);
  }
}

/**
 * Avvia istanze multiple
 */
async function startMultiInstances(ports = DEFAULT_PORTS, maxInstances = MAX_INSTANCES) {
  console.log('🚀 AVVIO SISTEMA MULTI-ISTANZA');
  console.log('==============================');
  console.log(`Porte target: ${ports.join(', ')}`);
  console.log(`Max istanze: ${maxInstances}`);
  console.log('');
  
  const instances = [];
  const errors = [];
  
  // Verifica porte disponibili
  const availablePorts = [];
  for (const port of ports) {
    const inUse = await isPortInUse(port);
    if (!inUse) {
      availablePorts.push(port);
    } else {
      console.log(`⚠️ Porta ${port} già in uso, saltando...`);
    }
  }
  
  if (availablePorts.length === 0) {
    console.error('❌ Nessuna porta disponibile!');
    process.exit(1);
  }
  
  console.log(`✅ Porte disponibili: ${availablePorts.join(', ')}`);
  console.log('');
  
  // Avvia istanze (max maxInstances)
  const portsToStart = availablePorts.slice(0, maxInstances);
  
  for (const port of portsToStart) {
    try {
      console.log(`🔄 Tentativo avvio porta ${port}...`);
      const instance = await startViteInstance(port);
      instances.push(instance);
      
      // Registra porta nel lock
      await writePortToLock(port, 'multi-instance');
      
      console.log(`✅ Istanza avviata con successo su porta ${port}`);
      console.log('');
      
    } catch (error) {
      console.error(`❌ Errore avvio porta ${port}:`, error.message);
      errors.push({ port, error: error.message });
    }
  }
  
  // Riepilogo finale
  console.log('📊 RIEPILOGO AVVIO');
  console.log('==================');
  console.log(`✅ Istanze avviate: ${instances.length}`);
  console.log(`❌ Errori: ${errors.length}`);
  
  if (instances.length > 0) {
    console.log('\n🌐 URL DISPONIBILI:');
    instances.forEach(instance => {
      console.log(`  http://localhost:${instance.port}`);
    });
  }
  
  if (errors.length > 0) {
    console.log('\n❌ ERRORI:');
    errors.forEach(err => {
      console.log(`  Porta ${err.port}: ${err.error}`);
    });
  }
  
  console.log('\n💡 COMANDI UTILI:');
  console.log('  npm run lock:status    # Stato lock system');
  console.log('  npm run lock:monitor    # Monitor real-time');
  console.log('  Ctrl+C                  # Termina tutte le istanze');
  
  // Gestione SIGINT per cleanup
  process.on('SIGINT', async () => {
    console.log('\n🛑 Terminazione istanze...');
    
    for (const instance of instances) {
      try {
        instance.process.kill('SIGTERM');
        console.log(`✅ Istanza porta ${instance.port} terminata`);
      } catch (error) {
        console.error(`❌ Errore terminazione porta ${instance.port}:`, error.message);
      }
    }
    
    console.log('👋 Sistema multi-istanza terminato');
    process.exit(0);
  });
  
  // Mantieni processo attivo
  if (instances.length > 0) {
    console.log('\n🔄 Sistema attivo - Premi Ctrl+C per terminare');
    
    // Monitoraggio periodico
    setInterval(async () => {
      for (const instance of instances) {
        const isHealthy = await checkAppHealth(instance.port);
        if (!isHealthy) {
          console.error(`⚠️ App non risponde su porta ${instance.port}`);
        }
      }
    }, 30000); // Check ogni 30 secondi
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  
  let ports = DEFAULT_PORTS;
  let maxInstances = MAX_INSTANCES;
  
  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--ports':
        if (i + 1 < args.length) {
          ports = args[i + 1].split(',').map(p => parseInt(p.trim()));
          i++;
        }
        break;
        
      case '--max-instances':
        if (i + 1 < args.length) {
          maxInstances = parseInt(args[i + 1]);
          i++;
        }
        break;
        
      case '--help':
        console.log(`
🚀 START MULTI-INSTANCE

Avvia l'app su più porte simultaneamente per testing multi-agent.

Usage:
  node scripts/start-multi-instance.cjs [options]

Options:
  --ports <list>         Porte da usare (default: 3000,3001,3002)
  --max-instances <num>  Max istanze simultanee (default: 3)
  --help                 Mostra questo help

Examples:
  node scripts/start-multi-instance.cjs
  node scripts/start-multi-instance.cjs --ports 3000,3001,3002,3003
  node scripts/start-multi-instance.cjs --max-instances 2
        `);
        return;
    }
  }
  
  try {
    await startMultiInstances(ports, maxInstances);
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
  startMultiInstances,
  startViteInstance,
  checkAppHealth,
  isPortInUse,
  writePortToLock
};
