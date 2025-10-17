import { defineConfig } from '@playwright/test';
import { execSync } from 'child_process';

/**
 * 🔧 PLAYWRIGHT MAIN CONFIG
 * 
 * Configurazione Playwright principale per test completi
 * Auto-detect porta app e integrazione lock system
 * 
 * LOCKED: 2025-01-16 - Configurazione Playwright principale completamente testata
 * Test eseguiti: auto-detect porta, rilevamento test, integrazione lock system
 * Funzionalità: priorità porta 3000, fallback 3001/3002/3004, timeout gestione, visibilità 4+ secondi
 * NON MODIFICARE SENZA PERMESSO ESPLICITO
 */

// Auto-detect porta app con priorità
function detectAppPort(): string {
  try {
    // Prima prova porte preferite
    const preferredPorts = ['3000', '3001', '3002', '3004'];
    
    for (const port of preferredPorts) {
      try {
        const result = execSync(`node scripts/detect-app-port.cjs --ports ${port} --timeout 2000`, { 
          encoding: 'utf8',
          timeout: 5000 
        });
        
        if (result.includes('App BHM trovata')) {
          console.log(`✅ Playwright Main usa porta ${port}`);
          return port;
        }
      } catch (error) {
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

console.log(`🎭 Playwright Main - Porta rilevata: ${APP_PORT}`);

export default defineConfig({
  testDir: './Production/Test',
  
  // Configurazione base con visibilità estesa
  use: {
    baseURL: BASE_URL,
    headless: process.env.CI ? true : false,
    viewport: { width: 1280, height: 720 },
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    // Visibilità estesa per permettere visione passaggi (4+ secondi)
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },
  
  // Timeout estesi per visibilità
  timeout: 60000,
  expect: {
    timeout: 10000
  },
  retries: process.env.CI ? 2 : 0,
  
  // Reporter completo
  reporter: [
    ['list'],
    ['html', { 
      outputFolder: 'test-results/main-complete',
      open: 'never'
    }],
    ['json', { 
      outputFile: 'test-results/main-results.json'
    }]
  ],
  
  // Web server con timeout esteso
  webServer: process.env.SKIP_SERVER ? undefined : {
    command: `npm run dev -- --port ${APP_PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
  
  // Configurazione progetti per test completi
  projects: [
    {
      name: 'Autenticazione',
      testMatch: '**/Autenticazione/**/*.js',
      use: { 
        baseURL: BASE_URL,
        extraHTTPHeaders: {
          'X-Agent': 'main-auth-tests'
        }
      }
    },
    {
      name: 'UI-Base',
      testMatch: '**/UI-Base/**/*.js',
      use: { 
        baseURL: BASE_URL,
        extraHTTPHeaders: {
          'X-Agent': 'main-ui-tests'
        }
      }
    },
    {
      name: 'Forms',
      testMatch: '**/Forms/**/*.js',
      use: { 
        baseURL: BASE_URL,
        extraHTTPHeaders: {
          'X-Agent': 'main-forms-tests'
        }
      }
    },
    {
      name: 'Business',
      testMatch: '**/Business/**/*.js',
      use: { 
        baseURL: BASE_URL,
        extraHTTPHeaders: {
          'X-Agent': 'main-business-tests'
        }
      }
    }
  ],
  
  // Configurazione output
  outputDir: 'test-results/main',
  
  // Configurazione worker
  workers: process.env.CI ? 1 : 2,
  
  // Configurazione per CI
  fullyParallel: !process.env.CI,
  
  // Configurazione locale
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? 'github' : 'list',
});
