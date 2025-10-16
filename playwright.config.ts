import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './Production/Test',
  use: {
    baseURL: 'http://localhost:3006',
  },
  webServer: {
    command: 'npm run dev -- --port 3006',
    url: 'http://localhost:3006',
    reuseExistingServer: !process.env.CI,
  },
});
