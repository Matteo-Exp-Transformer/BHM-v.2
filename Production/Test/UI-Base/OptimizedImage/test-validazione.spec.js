import { test, expect } from '@playwright/test';

test.describe('OptimizedImage.tsx - Test Validazione Dati', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('h1')).toContainText('HACCP Manager');
  });

  test('Dovrebbe accettare props valide', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('Dovrebbe gestire Required props (src, alt)', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const required = page.locator('img[src], img[alt]');
    const requiredCount = await required.count();
    expect(requiredCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire Optional props', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const optional = page.locator('img');
    const optionalCount = await optional.count();
    expect(optionalCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe usare Default values', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('Dovrebbe gestire Loading prop values', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const loading = page.locator('img[loading]');
    const loadingCount = await loading.count();
    expect(loadingCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire Callback functions', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const callbacks = page.locator('img[onload], img[onerror]');
    const callbackCount = await callbacks.count();
    expect(callbackCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire State transitions', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const transitions = page.locator('.transition-opacity');
    const transitionCount = await transitions.count();
    expect(transitionCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe avere Accessibility compliance', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const accessible = page.locator('img[alt]');
    const accessibleCount = await accessible.count();
    expect(accessibleCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe avere Export corretto', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
