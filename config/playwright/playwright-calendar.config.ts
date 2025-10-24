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
  },
})
