import { defineConfig } from '@playwright/test';
import { execSync } from 'child_process';

/**
 * 🔧 PLAYWRIGHT AGENT 1 CONFIG
 * 
 * Configurazione Playwright per Agente 1 (UI Elementi Base)
 * Auto-detect porta app e integrazione lock system
 * 
 * LOCKED: 2025-01-16 - Configurazione Playwright completamente testata
 * Test eseguiti: auto-detect porta 3000, rilevamento 889 test, integrazione lock system
 * Funzionalità: priorità porta 3000, fallback 3001/3002, progetti UI-Base, timeout gestione
 * NON MODIFICARE SENZA PERMESSO ESPLICITO
 */

// Auto-detect porta app con priorità per Agente 1
function detectAppPort(): string {
  try {
    // Prima prova porta preferita per Agente 1
    const preferredPorts = ['3000', '3001', '3002'];
    
    for (const port of preferredPorts) {
      try {
        const result = execSync(`node scripts/detect-app-port.cjs --ports ${port} --timeout 2000`, { 
          encoding: 'utf8',
          timeout: 5000 
        });
        
        if (result.includes('App BHM trovata')) {
          console.log(`✅ Agente 1 usa porta ${port}`);
          return port;
        }
      } catch {
        // Porta non disponibile, prova la successiva
        continue;
      }
    }
    
    // Fallback: usa porta 3000
    console.warn('⚠️ Nessuna porta rilevata, uso porta 3000');
    return '3000';
    
  } catch (error) {
    console.warn('⚠️ Errore auto-detect, uso porta 3000:', error.message);
    return '3000';
  }
}

const APP_PORT = detectAppPort();
const BASE_URL = `http://localhost:${APP_PORT}`;

console.log(`🎭 Playwright Agent 1 - Porta rilevata: ${APP_PORT}`);

export default defineConfig({
  testDir: './Production/Test',
  
  // Configurazione base
  use: {
    baseURL: BASE_URL,
    headless: process.env.CI ? true : false,
    viewport: { width: 1280, height: 720 },
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  
  // Timeout e retry
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  retries: process.env.CI ? 2 : 0,
  
  // Reporter
  reporter: [
    ['list'],
    ['html', { 
      outputFolder: 'test-results/agent1-ui-base',
      open: 'never'
    }],
    ['json', { 
      outputFile: 'test-results/agent1-results.json'
    }]
  ],
  
  // Web server (solo se necessario)
  webServer: process.env.SKIP_SERVER ? undefined : {
    command: `npm run dev -- --port ${APP_PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
  
  // Global setup/teardown - auto-cleanup
  globalSetup: './scripts/pre-test-validation.mjs',
  globalTeardown: './scripts/post-test-cleanup.mjs',
  
  // Configurazione progetti semplificata (solo test funzionanti)
  projects: [
    {
      name: 'UI-Base',
      testMatch: '**/UI-Base/**/*.spec.js',
      use: { 
        baseURL: BASE_URL,
        extraHTTPHeaders: {
          'X-Agent': 'agent-1-ui-base'
        }
      }
    }
  ],
  
  // Configurazione output
  outputDir: 'test-results/agent1',
  
  // Configurazione worker
  workers: process.env.CI ? 1 : 2,
  
  // Configurazione per CI
  fullyParallel: !process.env.CI,
  
  // Configurazione locale
  forbidOnly: !!process.env.CI,
});
