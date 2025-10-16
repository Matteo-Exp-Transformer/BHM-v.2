import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './Production/Test',
  use: {
    baseURL: 'http://localhost:3001',
  },
  webServer: {
    command: 'npm run dev -- --port 3001',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
  },
});
