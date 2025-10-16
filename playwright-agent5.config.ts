import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './Production/Test/Navigazione',
  use: {
    baseURL: 'http://localhost:3004',
  },
  webServer: {
    command: 'npm run dev -- --port 3004',
    url: 'http://localhost:3004',
    reuseExistingServer: !process.env.CI,
  },
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  retries: 2,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'test-results/agent5' }]
  ],
});
