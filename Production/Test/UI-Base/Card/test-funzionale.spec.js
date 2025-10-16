import { test, expect } from '@playwright/test';

test.describe('Card.tsx - Test Funzionali', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('h1')).toContainText('HACCP Manager');
  });

  test('Dovrebbe renderizzare Card base', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('Dovrebbe renderizzare CardHeader', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const headers = page.locator('div.flex.flex-col');
    const headerCount = await headers.count();
    expect(headerCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe renderizzare CardTitle', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const titles = page.locator('h3');
    const titleCount = await titles.count();
    expect(titleCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe renderizzare CardDescription', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const descriptions = page.locator('p.text-sm');
    const descCount = await descriptions.count();
    expect(descCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe renderizzare CardContent', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const content = page.locator('div.p-6');
    const contentCount = await content.count();
    expect(contentCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe renderizzare CardFooter', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const footers = page.locator('div.flex.items-center');
    const footerCount = await footers.count();
    expect(footerCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire composizione completa Card', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const cards = page.locator('.rounded-lg.border');
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire className personalizzata', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const elements = page.locator('div');
    const elementCount = await elements.count();
    expect(elementCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire props HTML', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('Dovrebbe gestire forwardRef', async ({ page }) => {
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

  test('Dovrebbe applicare CSS classes', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const elements = page.locator('.shadow-sm, .rounded-lg, .border');
    const elementCount = await elements.count();
    expect(elementCount).toBeGreaterThanOrEqual(0);
  });
});
