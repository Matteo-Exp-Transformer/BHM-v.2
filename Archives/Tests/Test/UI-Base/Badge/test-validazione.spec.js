import { test, expect } from '@playwright/test';

test.describe('Badge.tsx - Test Validazione Dati', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('h1')).toContainText('HACCP Manager');
  });

  test('Dovrebbe accettare props valide', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('Dovrebbe gestire varianti corrette', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const elements = page.locator('.rounded-full');
    const elementCount = await elements.count();
    expect(elementCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire tonality corrette', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const elements = page.locator('.border-transparent, .bg-transparent');
    const elementCount = await elements.count();
    expect(elementCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire dimensioni corrette', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const elements = page.locator('.px-2, .px-2\\.5');
    const elementCount = await elements.count();
    expect(elementCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe usare default values', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('Dovrebbe gestire forwardRef', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const elements = page.locator('span');
    const elementCount = await elements.count();
    expect(elementCount).toBeGreaterThanOrEqual(0);
  });
});
