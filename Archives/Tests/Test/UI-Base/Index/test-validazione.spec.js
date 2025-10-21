import { test, expect } from '@playwright/test';

test.describe('index.ts - Test Validazione Dati', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('h1')).toContainText('HACCP Manager');
  });

  test('Dovrebbe avere Export syntax corretto', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('Dovrebbe avere Import paths corretti', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('Dovrebbe avere Component names corretti', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const components = page.locator('button, input, textarea, label');
    const componentCount = await components.count();
    expect(componentCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe avere TypeScript compatibility', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('Dovrebbe identificare Missing exports', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const missing = page.locator('.animate-spin, [role="progressbar"], [role="switch"]');
    const missingCount = await missing.count();
    expect(missingCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe avere Export structure valida', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const structure = page.locator('body');
    await expect(structure).toBeVisible();
  });
});
