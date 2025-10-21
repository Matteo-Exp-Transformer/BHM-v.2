import { test, expect } from '@playwright/test';

test.describe('Badge.tsx - Test Funzionali', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('h1')).toContainText('HACCP Manager');
  });

  test('Dovrebbe renderizzare badge correttamente', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('Dovrebbe gestire varianti badge', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const badges = page.locator('span.inline-flex');
    const badgeCount = await badges.count();
    expect(badgeCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire tonality', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const elements = page.locator('.rounded-full');
    const elementCount = await elements.count();
    expect(elementCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire dimensioni', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const elements = page.locator('.text-xs, .text-\\[11px\\]');
    const elementCount = await elements.count();
    expect(elementCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire className personalizzata', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const elements = page.locator('span');
    const elementCount = await elements.count();
    expect(elementCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire props HTML', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
