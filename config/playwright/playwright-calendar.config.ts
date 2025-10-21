import { defineConfig, devices } from '@playwright/test'

/**
 * Configurazione Playwright per i test della pagina calendario
 * Ottimizzata per testare le funzionalità di CalendarPage e MacroCategoryModal
 */
export default defineConfig({
  testDir: './tests',
  
  // Esegui i test in parallelo per velocizzare l'esecuzione
  fullyParallel: true,
  
  // Fallisce il build se ci sono test falliti
  forbidOnly: !!process.env.CI,
  
  // Retry solo su CI
  retries: process.env.CI ? 2 : 0,
  
  // Workers per CI
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/calendar-tests-results.json' }],
    ['junit', { outputFile: 'test-results/calendar-tests-results.xml' }]
  ],
  
  // Configurazione globale
  use: {
    // Base URL per i test
    baseURL: 'http://localhost:3000',
    
    // Trace per debug
    trace: 'on-first-retry',
    
    // Screenshot per test falliti
    screenshot: 'only-on-failure',
    
    // Video per test falliti
    video: 'retain-on-failure',
    
    // Timeout per le azioni
    actionTimeout: 10000,
    
    // Timeout per la navigazione
    navigationTimeout: 30000,
  },
  
  // Configurazione per diversi progetti/browser
  projects: [
    {
      name: 'calendar-chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Configurazioni specifiche per Chrome
        viewport: { width: 1280, height: 720 },
        // Mock delle API per i test
        extraHTTPHeaders: {
          'Accept': 'application/json',
        },
      },
    },
    
    {
      name: 'calendar-firefox',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 },
      },
    },
    
    {
      name: 'calendar-webkit',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 },
      },
    },
    
    // Test per dispositivi mobili
    {
      name: 'calendar-mobile-chrome',
      use: { 
        ...devices['Pixel 5'],
        // Configurazioni specifiche per mobile
        viewport: { width: 375, height: 667 },
      },
    },
    
    {
      name: 'calendar-mobile-safari',
      use: { 
        ...devices['iPhone 12'],
        viewport: { width: 390, height: 844 },
      },
    },
  ],
  
  // Configurazione del server di sviluppo
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minuti
  },
  
  // Configurazione per i test specifici del calendario
  testMatch: [
    '**/calendar-page-*.spec.ts',
    '**/calendar-*.spec.ts'
  ],
  
  // Timeout per i test
  timeout: 30 * 1000, // 30 secondi
  
  // Expect timeout
  expect: {
    timeout: 5000, // 5 secondi
  },
  
  // Configurazione per i test di accessibilità
  use: {
    // Abilita test di accessibilità
    accessibility: {
      enabled: true,
      rules: [
        'color-contrast',
        'keyboard-navigation',
        'aria-labels',
        'focus-management'
      ]
    }
  }
})
