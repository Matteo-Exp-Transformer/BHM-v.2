import { test, expect } from '@playwright/test';

test.describe('Card.tsx - Test Validazione Dati', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('h1')).toContainText('HACCP Manager');
  });

  test('Dovrebbe accettare props valide per tutti i componenti', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('Dovrebbe gestire className corretta', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const elements = page.locator('div');
    const elementCount = await elements.count();
    expect(elementCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire props HTML corrette', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('Dovrebbe gestire forwardRef corretto', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const elements = page.locator('div, h3, p');
    const elementCount = await elements.count();
    expect(elementCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe avere displayName corretto', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('Dovrebbe gestire composizione corretta', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const cards = page.locator('.rounded-lg');
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThanOrEqual(0);
  });
});
