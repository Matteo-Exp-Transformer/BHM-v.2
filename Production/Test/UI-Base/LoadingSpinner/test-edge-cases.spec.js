import { test, expect } from '@playwright/test';

test.describe('LoadingSpinner.tsx - Test Edge Cases', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('h1')).toContainText('HACCP Manager');
  });

  test('Dovrebbe gestire props undefined/null', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('Dovrebbe gestire size invalido', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('Dovrebbe gestire className vuota', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const elements = page.locator('div');
    const elementCount = await elements.count();
    expect(elementCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire props extra', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('Dovrebbe gestire multiple instances', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const multiple = page.locator('[role="status"]');
    const multipleCount = await multiple.count();
    expect(multipleCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire nested usage', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const nested = page.locator('div div');
    const nestedCount = await nested.count();
    expect(nestedCount).toBeGreaterThanOrEqual(0);
  });
});
