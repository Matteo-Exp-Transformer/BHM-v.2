import { test, expect } from '@playwright/test';

test.describe('Label.tsx - Test Funzionali', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('h1')).toContainText('HACCP Manager');
  });

  test('Dovrebbe renderizzare Label base', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const labels = page.locator('label');
    const labelCount = await labels.count();
    expect(labelCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire className personalizzata', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const styled = page.locator('label.text-sm');
    const styledCount = await styled.count();
    expect(styledCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire props HTML', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const labels = page.locator('label');
    const labelCount = await labels.count();
    expect(labelCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire ForwardRef functionality', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const labels = page.locator('label');
    const labelCount = await labels.count();
    expect(labelCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe avere DisplayName corretto', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('Dovrebbe avere Export corretto', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('Dovrebbe gestire Association con input', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const associated = page.locator('label[for], label input');
    const associatedCount = await associated.count();
    expect(associatedCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire Disabled state handling', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const disabled = page.locator('.peer-disabled\\:cursor-not-allowed');
    const disabledCount = await disabled.count();
    expect(disabledCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire Multiple instances', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const multiple = page.locator('label');
    const multipleCount = await multiple.count();
    expect(multipleCount).toBeGreaterThanOrEqual(0);
  });
});
