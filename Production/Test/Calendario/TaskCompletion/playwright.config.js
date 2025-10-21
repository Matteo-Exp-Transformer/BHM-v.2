// Playwright Configuration per Task Completion Tests
// Configurazione compliance e MCP server playwright

const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './',
  timeout: 30000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'test-results.xml' }]
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },
  projects: [
    {
      name: 'task-completion-chromium',
      use: { 
        ...require('@playwright/test').devices['Desktop Chrome'],
        // Configurazione specifica per test task completion
        viewport: { width: 1280, height: 720 },
        launchOptions: {
          args: [
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--disable-blink-features=AutomationControlled'
          ]
        }
      },
    },
    {
      name: 'task-completion-firefox',
      use: { 
        ...require('@playwright/test').devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 }
      },
    },
    {
      name: 'task-completion-webkit',
      use: { 
        ...require('@playwright/test').devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 }
      },
    },
  ],
  
  // Configurazione per compliance e sicurezza
  globalSetup: require.resolve('./global-setup.js'),
  globalTeardown: require.resolve('./global-teardown.js'),
  
  // Configurazione per MCP server integration
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  
  // Configurazione per database testing
  testMatch: [
    '**/test-*.spec.js',
    '**/test-*.spec.ts'
  ],
  
  // Configurazione per report compliance
  outputDir: 'test-results/',
  
  // Configurazione per retry logic specifica
  retryOptions: {
    maxRetries: 3,
    retryDelay: 2000,
  }
});
