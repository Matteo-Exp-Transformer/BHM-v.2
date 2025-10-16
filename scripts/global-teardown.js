/**
 * 🧹 GLOBAL TEARDOWN - Playwright Multi-Agent
 * 
 * Cleanup globale eseguito dopo tutti i test
 * Gestisce pulizia file temporanei e log operazioni
 */

const fs = require('fs').promises;
const path = require('path');

// Configurazione
const LOCK_DIR = '.agent-locks';

/**
 * Teardown globale per tutti i test
 * @param {Object} config - Configurazione Playwright
 */
async function globalTeardown(config) {
  console.log('🧹 Global Teardown - Multi-Agent Playwright');
  
  const agentId = process.env.AGENT_ID || 'default';
  const port = process.env.AGENT_PORT || '3000';
  
  console.log(`📋 Agent ID: ${agentId}`);
  console.log(`🌐 Port: ${port}`);
  
  try {
    // 1. Log teardown
    await logTeardown(agentId, port, 'STARTED');
    
    // 2. Cleanup file temporanei
    await cleanupTempFiles(agentId);
    
    // 3. Aggiorna heartbeat (ultimo)
    await updateLastHeartbeat(agentId);
    
    // 4. Log completamento
    await logTeardown(agentId, port, 'COMPLETED');
    
    console.log('✅ Global Teardown completato');
    
  } catch (error) {
    console.error('❌ Global Teardown fallito:', error.message);
    await logTeardown(agentId, port, `FAILED: ${error.message}`);
    throw error;
  }
}

/**
 * Cleanup file temporanei
 */
async function cleanupTempFiles(agentId) {
  try {
    const tempFiles = [
      `agent-${agentId}-temp.json`,
      `agent-${agentId}-debug.log`,
      `agent-${agentId}-screenshots`,
    ];
    
    for (const file of tempFiles) {
      const filePath = path.join(LOCK_DIR, file);
      
      try {
        const stats = await fs.stat(filePath);
        if (stats.isDirectory()) {
          await fs.rmdir(filePath, { recursive: true });
          console.log(`🗑️ Directory rimossa: ${file}`);
        } else {
          await fs.unlink(filePath);
          console.log(`🗑️ File rimosso: ${file}`);
        }
      } catch (error) {
        if (error.code !== 'ENOENT') {
          console.warn(`⚠️ Errore rimozione ${file}:`, error.message);
        }
      }
    }
    
    console.log('✅ Cleanup file temporanei completato');
    
  } catch (error) {
    console.error('❌ Errore cleanup:', error.message);
    throw error;
  }
}

/**
 * Aggiorna ultimo heartbeat
 */
async function updateLastHeartbeat(agentId) {
  const heartbeatFile = path.join(LOCK_DIR, `agent-${agentId}.heartbeat`);
  
  try {
    const heartbeatData = {
      agentId,
      timestamp: Date.now(),
      status: 'completed',
      lastTest: 'global-teardown',
    };
    
    await fs.writeFile(heartbeatFile, JSON.stringify(heartbeatData, null, 2));
    console.log(`✅ Ultimo heartbeat aggiornato per ${agentId}`);
    
  } catch (error) {
    console.warn(`⚠️ Errore aggiornamento heartbeat:`, error.message);
  }
}

/**
 * Log teardown operazione
 */
async function logTeardown(agentId, port, result) {
  const logFile = path.join(LOCK_DIR, 'teardown-history.log');
  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp} | GLOBAL_TEARDOWN | ${agentId} | ${port} | ${result}\n`;
  
  try {
    await fs.appendFile(logFile, logEntry);
  } catch (error) {
    console.error('Errore scrittura teardown log:', error.message);
  }
}

module.exports = globalTeardown;
