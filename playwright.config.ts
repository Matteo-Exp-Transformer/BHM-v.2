import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './Production/Test',
  use: {
    baseURL: 'http://localhost:3003',
  },
  // Rimuovo webServer per usare il server esistente
  // webServer: {
  //   command: 'npm run dev -- --port 3003',
  //   url: 'http://localhost:3003',
  //   reuseExistingServer: !process.env.CI,
  // },
});
