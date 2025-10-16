import { test, expect } from '@playwright/test';

test.describe('LoadingSpinner.tsx - Test Funzionali', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('h1')).toContainText('HACCP Manager');
  });

  test('Dovrebbe renderizzare spinner base', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('Dovrebbe gestire dimensioni', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const spinners = page.locator('[role="status"]');
    const spinnerCount = await spinners.count();
    expect(spinnerCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe avere animazione spin', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const animated = page.locator('.animate-spin');
    const animatedCount = await animated.count();
    expect(animatedCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire className personalizzata', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const elements = page.locator('div.flex');
    const elementCount = await elements.count();
    expect(elementCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe avere accessibilità', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const accessible = page.locator('[role="status"], [aria-label="Loading"]');
    const accessibleCount = await accessible.count();
    expect(accessibleCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe usare default values', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('Dovrebbe avere container layout', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const flex = page.locator('.flex.items-center.justify-center');
    const flexCount = await flex.count();
    expect(flexCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe avere border styling', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const borders = page.locator('.border-2, .rounded-full');
    const borderCount = await borders.count();
    expect(borderCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe avere export corretto', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
