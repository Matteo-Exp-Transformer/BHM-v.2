/**
 * 🎬 Playwright Config per Test Osservabili
 * 
 * Configurazione ottimizzata per eseguire test a velocità umana
 * con pause visibili e screenshot automatici
 */

import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './Production/Test/Autenticazione',
  
  // Esegui un test alla volta per osservazione completa
  fullyParallel: false,
  workers: 1,
  
  // Timeout generosi per pause umane
  timeout: 300000, // 5 minuti
  expect: {
    timeout: 10000, // 10 secondi per aspettare elementi
  },
  
  // Retry solo una volta per evitare loop infiniti
  retries: 1,
  
  // Reporter dettagliato per osservazione
  reporter: [
    ['list'],
    ['html', { outputFolder: 'test-results-html' }],
    ['json', { outputFile: 'test-results-json/results.json' }]
  ],
  
  // Configurazione browser per osservazione
  use: {
    // Browser visibile (non headless)
    headless: false,
    
    // Velocità rallentata per osservazione
    actionTimeout: 10000,
    navigationTimeout: 30000,
    
    // Screenshot automatici
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Trace per debugging
    trace: 'on-first-retry',
    
    // Base URL
    baseURL: 'http://localhost:3000',
    
    // Viewport fisso per consistenza
    viewport: { width: 1280, height: 720 },
    
    // Ignora errori HTTPS
    ignoreHTTPSErrors: true,
  },
  
  // Progetti per diversi browser
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Velocità rallentata per osservazione
        launchOptions: {
          slowMo: 1000, // 1 secondo di pausa tra azioni
        }
      },
    },
  ],
  
  // Server di sviluppo
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
})
