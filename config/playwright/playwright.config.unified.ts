import { defineConfig } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local per configurazione Supabase
dotenv.config({ path: '.env.local' });

// Variabili ambiente per multi-agent
const PORT = process.env.AGENT_PORT || '3000';
const AGENT_ID = process.env.AGENT_ID || 'default';
const BASE_URL = `http://localhost:${PORT}`;

// Configurazione Supabase
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://tucqgcfrlzmwyfadiodo.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1Y3FnY2ZybHptd3lmYWRpb2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NTY0ODksImV4cCI6MjA3NTUzMjQ4OX0.7m3bdxW8QMHO6YNQ4cxoxlzzgzq7DjTzufv89YAcHA4';

// Path per auth state
const AUTH_STATE_PATH = path.join('.agent-locks', `agent-${AGENT_ID}-auth.json`);

export default defineConfig({
  // Directory test
  testDir: './Production/Test',
  
  // Configurazione globale
  use: {
    // Base URL dinamica basata su porta agente
    baseURL: BASE_URL,
    
    // Auth state per login automatico
    storageState: AUTH_STATE_PATH,
    
    // Timeout e retry
    actionTimeout: 10000,
    navigationTimeout: 30000,
    
    // Screenshot e video per debug
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Trace per debugging
    trace: 'retain-on-failure',
    
    // Viewport consistente
    viewport: { width: 1280, height: 720 },
    
    // Ignora HTTPS errors per dev
    ignoreHTTPSErrors: true,
  },
  
  // Web server per test
  webServer: {
    command: `npm run dev -- --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // 2 minuti per startup
    env: {
      // Passa variabili Supabase al server
      VITE_SUPABASE_URL: SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: SUPABASE_ANON_KEY,
      VITE_DEBUG_MODE: 'true',
    },
  },
  
  // Timeout configurazione
  timeout: 30000, // 30 secondi per test
  expect: {
    timeout: 5000, // 5 secondi per expect
  },
  
  // Retry configurazione
  retries: process.env.CI ? 2 : 1,
  
  // Workers (un worker per agente per evitare conflitti)
  workers: 1,
  
  // Reporter configurazione
  reporter: [
    // Console output
    ['list'],
    
    // HTML report per agente
    ['html', { 
      outputFolder: `test-results/agent-${AGENT_ID}`,
      open: 'never' // Non aprire automaticamente
    }],
    
    // JSON report per analisi
    ['json', { 
      outputFile: `test-results/agent-${AGENT_ID}/results.json` 
    }],
    
    // JUnit per CI/CD
    ['junit', { 
      outputFile: `test-results/agent-${AGENT_ID}/junit.xml` 
    }],
  ],
  
  // Configurazione progetti per aree diverse
  projects: [
    {
      name: `agent-${AGENT_ID}-ui-base`,
      testMatch: '**/UI-Base/**/*.spec.js',
      use: {
        ...this?.use,
        // Config specifica per UI Base
        extraHTTPHeaders: {
          'X-Agent-Type': 'ui-base',
          'X-Agent-ID': AGENT_ID,
        },
      },
    },
    {
      name: `agent-${AGENT_ID}-auth`,
      testMatch: '**/Autenticazione/**/*.spec.js',
      use: {
        ...this?.use,
        // Config specifica per Auth
        extraHTTPHeaders: {
          'X-Agent-Type': 'auth',
          'X-Agent-ID': AGENT_ID,
        },
      },
    },
    {
      name: `agent-${AGENT_ID}-forms`,
      testMatch: '**/Gestione/**/*.spec.js',
      use: {
        ...this?.use,
        // Config specifica per Forms
        extraHTTPHeaders: {
          'X-Agent-Type': 'forms',
          'X-Agent-ID': AGENT_ID,
        },
      },
    },
    {
      name: `agent-${AGENT_ID}-conservation`,
      testMatch: '**/Conservazione/**/*.spec.js',
      use: {
        ...this?.use,
        // Config specifica per Conservation
        extraHTTPHeaders: {
          'X-Agent-Type': 'conservation',
          'X-Agent-ID': AGENT_ID,
        },
      },
    },
    {
      name: `agent-${AGENT_ID}-calendar`,
      testMatch: '**/Calendario/**/*.spec.js',
      use: {
        ...this?.use,
        // Config specifica per Calendar
        extraHTTPHeaders: {
          'X-Agent-Type': 'calendar',
          'X-Agent-ID': AGENT_ID,
        },
      },
    },
    {
      name: `agent-${AGENT_ID}-navigation`,
      testMatch: '**/Navigazione/**/*.spec.js',
      use: {
        ...this?.use,
        // Config specifica per Navigation
        extraHTTPHeaders: {
          'X-Agent-Type': 'navigation',
          'X-Agent-ID': AGENT_ID,
        },
      },
    },
  ],
  
  // Global setup per autenticazione
  globalSetup: require.resolve('./scripts/global-setup.js'),
  
  // Global teardown per cleanup
  globalTeardown: require.resolve('./scripts/global-teardown.js'),
  
  // Configurazione per test paralleli
  fullyParallel: false, // Disabilitato per evitare conflitti multi-agent
  
  // Forza test in sequenza per agenti
  forbidOnly: !!process.env.CI,
  forbidOnly: !!process.env.CI,
  
  // Configurazione per CI
  ...(process.env.CI && {
    retries: 2,
    workers: 1,
    timeout: 60000,
  }),
  
  // Output directory
  outputDir: `test-results/agent-${AGENT_ID}/artifacts`,
  
  // Configurazione per debugging
  use: {
    ...this?.use,
    // Headless mode configurazione
    headless: process.env.CI ? true : false,
    
    // Browser context options
    launchOptions: {
      args: [
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-dev-shm-usage',
        '--no-sandbox',
      ],
    },
  },
});

// Export configurazione per uso programmatico
export const config = {
  PORT,
  AGENT_ID,
  BASE_URL,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  AUTH_STATE_PATH,
};
