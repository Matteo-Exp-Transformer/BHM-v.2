import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './Production/Test/Calendario/EventAlignment',
  use: {
    baseURL: 'http://localhost:3000',
    headless: false,
    viewport: { width: 1280, height: 720 },
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },
  timeout: 60000,
  expect: {
    timeout: 10000
  },
  retries: 0,
  reporter: [['list']],
  outputDir: 'test-results/event-alignment',
});
