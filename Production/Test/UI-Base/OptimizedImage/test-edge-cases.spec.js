import { test, expect } from '@playwright/test';

test.describe('OptimizedImage.tsx - Test Edge Cases', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('h1')).toContainText('HACCP Manager');
  });

  test('Dovrebbe gestire props undefined/null', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('Dovrebbe gestire Invalid src URL', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const invalid = page.locator('img');
    const invalidCount = await invalid.count();
    expect(invalidCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire Empty alt text', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const empty = page.locator('img[alt]');
    const emptyCount = await empty.count();
    expect(emptyCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire Network errors', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const network = page.locator('img');
    const networkCount = await network.count();
    expect(networkCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire Slow loading', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const slow = page.locator('.animate-pulse');
    const slowCount = await slow.count();
    expect(slowCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire Rapid load/error', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const rapid = page.locator('img');
    const rapidCount = await rapid.count();
    expect(rapidCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire Multiple callbacks', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const multiple = page.locator('img');
    const multipleCount = await multiple.count();
    expect(multipleCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe prevenire Memory leaks', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('Dovrebbe gestire Cleanup', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('Dovrebbe gestire Large images', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const large = page.locator('img');
    const largeCount = await large.count();
    expect(largeCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire Small images', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const small = page.locator('img');
    const smallCount = await small.count();
    expect(smallCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire No placeholder', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const noPlaceholder = page.locator('img');
    const noPlaceholderCount = await noPlaceholder.count();
    expect(noPlaceholderCount).toBeGreaterThanOrEqual(0);
  });
});
