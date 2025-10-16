import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:3002',
  },
  webServer: {
    command: 'npm run dev -- --port 3002',
    url: 'http://localhost:3002',
    reuseExistingServer: !process.env.CI,
  },
});
