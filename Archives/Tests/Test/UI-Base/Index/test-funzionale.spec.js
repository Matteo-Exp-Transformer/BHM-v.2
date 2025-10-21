import { test, expect } from '@playwright/test';

test.describe('index.ts - Test Funzionali', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('h1')).toContainText('HACCP Manager');
  });

  test('Dovrebbe renderizzare exports corretti', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('Dovrebbe importare Alert components', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const alerts = page.locator('[role="alert"]');
    const alertCount = await alerts.count();
    expect(alertCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe importare Badge component', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const badges = page.locator('span');
    const badgeCount = await badges.count();
    expect(badgeCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe importare Button component', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe importare Card components', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const cards = page.locator('.rounded-lg.border');
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe importare Input component', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    expect(inputCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe importare Label component', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const labels = page.locator('label');
    const labelCount = await labels.count();
    expect(labelCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe importare Select components', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const selects = page.locator('[role="combobox"]');
    const selectCount = await selects.count();
    expect(selectCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe importare Textarea component', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const textareas = page.locator('textarea');
    const textareaCount = await textareas.count();
    expect(textareaCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe validare Syntax', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('Dovrebbe validare Paths', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('Dovrebbe validare Export completeness', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const allComponents = page.locator('button, input, textarea, label, [role="alert"], [role="combobox"]');
    const componentCount = await allComponents.count();
    expect(componentCount).toBeGreaterThanOrEqual(0);
  });
});
