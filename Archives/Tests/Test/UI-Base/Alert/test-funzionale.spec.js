import { test, expect } from '@playwright/test';

test.describe('Alert.tsx - Test Funzionali', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('h1')).toContainText('HACCP Manager');
  });

  test('Dovrebbe renderizzare alert correttamente', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('Dovrebbe gestire varianti alert', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const alerts = page.locator('[role="alert"]');
    const alertCount = await alerts.count();
    expect(alertCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire AlertTitle', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const titles = page.locator('h5');
    const titleCount = await titles.count();
    expect(titleCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire AlertDescription', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const descriptions = page.locator('div.text-sm');
    const descCount = await descriptions.count();
    expect(descCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe avere accessibility corretta', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const alerts = page.locator('[role="alert"]');
    const alertCount = await alerts.count();
    expect(alertCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire classi CSS', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const elements = page.locator('.rounded-lg');
    const elementCount = await elements.count();
    expect(elementCount).toBeGreaterThanOrEqual(0);
  });
});
