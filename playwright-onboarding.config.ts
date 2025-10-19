import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright Configuration per Test Onboarding BHM v.2
 *
 * Configurato per:
 * - MCP headless execution (default)
 * - Headed demo mode (per visualizzazione)
 */

export default defineConfig({
  // Directory test onboarding
  testDir: './Production/Test/Onboarding',

  // Timeout per test (onboarding può essere lungo)
  timeout: 120000, // 2 minuti per test completo

  // Timeout per expect assertions
  expect: {
    timeout: 10000, // 10s per assertions
  },

  // Esegui test in sequenza (non parallelo, per evitare conflitti DB)
  fullyParallel: false,
  workers: 1,

  // Reporter
  reporter: [
    ['html', { outputFolder: 'Production/Test/Onboarding/reports', open: 'never' }],
    ['list'],
    ['json', { outputFile: 'Production/Test/Onboarding/reports/results.json' }],
  ],

  // Configurazione globale
  use: {
    // Base URL app
    baseURL: process.env.BASE_URL || 'http://localhost:3000',

    // Trace on first retry
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',

    // Timeout azioni
    actionTimeout: 15000, // 15s per click, fill, etc.

    // Timeout navigazione
    navigationTimeout: 30000, // 30s per page load
  },

  // Projects: headless (MCP) vs headed (demo)
  projects: [
    // ============= HEADLESS (MCP Execution) =============
    {
      name: 'chromium-headless',
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
        viewport: { width: 1920, height: 1080 },
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
      },
    },

    // ============= HEADED (Demo Mode - per mostrarti) =============
    {
      name: 'chromium-headed-demo',
      use: {
        ...devices['Desktop Chrome'],
        headless: false,
        viewport: { width: 1920, height: 1080 },
        slowMo: 500, // Rallenta azioni di 500ms per visibilità
        screenshot: 'on',
        video: 'on',
      },
    },

    // ============= FIREFOX (opzionale) =============
    {
      name: 'firefox-headless',
      use: {
        ...devices['Desktop Firefox'],
        headless: true,
      },
    },
  ],

  // Web server (se app non già running)
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true, // Riusa server già running
    timeout: 120000, // 2 min per startup
  },
})
