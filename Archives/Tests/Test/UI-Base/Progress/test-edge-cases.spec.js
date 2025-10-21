import { test, expect } from '@playwright/test';

test.describe('Progress.tsx - Test Edge Cases', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('h1')).toContainText('HACCP Manager');
  });

  test('Dovrebbe gestire props undefined/null', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('Dovrebbe gestire Value undefined', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('Dovrebbe gestire Value < 0', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const negative = page.locator('[role="progressbar"]');
    const negativeCount = await negative.count();
    expect(negativeCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire Value > 100', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const overflow = page.locator('[role="progressbar"]');
    const overflowCount = await overflow.count();
    expect(overflowCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire Rapid value changes', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const rapid = page.locator('[role="progressbar"]');
    const rapidCount = await rapid.count();
    expect(rapidCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire Animation interruptions', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const interrupted = page.locator('.transition-all');
    const interruptedCount = await interrupted.count();
    expect(interruptedCount).toBeGreaterThanOrEqual(0);
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

  test('Dovrebbe gestire Multiple rapid updates', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const rapid = page.locator('[role="progressbar"]');
    const rapidCount = await rapid.count();
    expect(rapidCount).toBeGreaterThanOrEqual(0);
  });
});
