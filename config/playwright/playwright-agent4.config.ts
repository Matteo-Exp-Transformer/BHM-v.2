import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './Production/Test',
  use: {
    baseURL: 'http://localhost:3005',
    headless: false,
    viewport: { width: 1280, height: 720 }
  },
  timeout: 30000,
  expect: {
    timeout: 5000
  }
});
