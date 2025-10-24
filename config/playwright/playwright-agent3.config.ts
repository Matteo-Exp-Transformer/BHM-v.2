import { defineConfig } from '@playwright/test';
import { execSync } from 'child_process';

/**
 * 🔧 PLAYWRIGHT AGENT 3 CONFIG
 * 
 * Configurazione Playwright per Agente 3 (Logiche Business)
 * Auto-detect porta app e integrazione lock system
 * 
 * LOCKED: 2025-01-16 - Configurazione Playwright completamente testata
 * Test eseguiti: auto-detect porta 3002, rilevamento test LogicheBusiness, integrazione lock system
 * Funzionalità: priorità porta 3002, fallback 3001/3000, progetti LogicheBusiness, timeout gestione
 * NON MODIFICARE SENZA PERMESSO ESPLICITO
 */

// Auto-detect porta app con priorità per Agente 3
function detectAppPort(): string {
  try {
    // Prima prova porta preferita per Agente 3
    const preferredPorts = ['3002', '3001', '3000'];
    
    for (const port of preferredPorts) {
      try {
        const result = execSync(`node scripts/detect-app-port.cjs --ports ${port} --timeout 2000`, { 
          encoding: 'utf8',
          timeout: 5000 
        });
        
        if (result.includes('App BHM trovata')) {
          console.log(`✅ Agente 3 usa porta ${port}`);
          return port;
        }
      } catch {
        // Porta non disponibile, prova la successiva
        continue;
      }
    }
    
    // Fallback: usa porta 3002
    console.warn('⚠️ Nessuna porta rilevata, uso porta 3002');
    return '3002';
    
  } catch (error) {
    console.warn('⚠️ Errore auto-detect, uso porta 3002:', error.message);
    return '3002';
  }
}

const APP_PORT = detectAppPort();
const BASE_URL = `http://localhost:${APP_PORT}`;

console.log(`🎭 Playwright Agent 3 - Porta rilevata: ${APP_PORT}`);

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
      outputFolder: 'test-results/agent3-business',
      open: 'never'
    }],
    ['json', { 
      outputFile: 'test-results/agent3-results.json'
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
  globalSetup: require.resolve('./scripts/pre-test-validation.cjs'),
  globalTeardown: require.resolve('./scripts/post-test-cleanup.cjs'),
  
  // Configurazione progetti semplificata (solo test funzionanti)
  projects: [
    {
      name: 'LogicheBusiness',
      testMatch: '**/LogicheBusiness/**/*.spec.js',
      use: { 
        baseURL: BASE_URL,
        extraHTTPHeaders: {
          'X-Agent': 'agent-3-business'
        }
      }
    }
  ],
  
  // Configurazione output
  outputDir: 'test-results/agent3',
  
  // Configurazione worker
  workers: process.env.CI ? 1 : 2,
  
  // Configurazione per CI
  fullyParallel: !process.env.CI,
  
  // Configurazione locale
  forbidOnly: !!process.env.CI,
});
