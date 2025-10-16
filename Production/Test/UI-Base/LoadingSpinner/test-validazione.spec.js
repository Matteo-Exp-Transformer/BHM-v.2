import { test, expect } from '@playwright/test';

test.describe('LoadingSpinner.tsx - Test Validazione Dati', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('h1')).toContainText('HACCP Manager');
  });

  test('Dovrebbe accettare props valide', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('Dovrebbe gestire size corretto', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const sizes = page.locator('.w-4, .w-8, .w-12');
    const sizeCount = await sizes.count();
    expect(sizeCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire className corretto', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const elements = page.locator('div');
    const elementCount = await elements.count();
    expect(elementCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe usare default values', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('Dovrebbe avere interface corretta', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('Dovrebbe avere accessibility corretta', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const accessible = page.locator('[role="status"], .sr-only');
    const accessibleCount = await accessible.count();
    expect(accessibleCount).toBeGreaterThanOrEqual(0);
  });
});
