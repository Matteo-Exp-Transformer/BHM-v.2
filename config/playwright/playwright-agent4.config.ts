import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './Production/Test',
  use: {
    baseURL: 'http://localhost:3005',
  },
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  use: {
    headless: false,
    viewport: { width: 1280, height: 720 }
  }
});
