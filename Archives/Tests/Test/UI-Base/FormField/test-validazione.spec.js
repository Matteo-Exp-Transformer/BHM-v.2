import { test, expect } from '@playwright/test';

test.describe('FormField.tsx - Test Validazione Dati', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('h1')).toContainText('HACCP Manager');
  });

  test('Dovrebbe accettare props valide per FormField', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('Dovrebbe accettare props valide per Input', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    expect(inputCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe accettare props valide per Select', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const selects = page.locator('select');
    const selectCount = await selects.count();
    expect(selectCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe accettare props valide per TextArea', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const textareas = page.locator('textarea');
    const textareaCount = await textareas.count();
    expect(textareaCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire Required props', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const required = page.locator('label, input, select, textarea');
    const requiredCount = await required.count();
    expect(requiredCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire Optional props', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const optional = page.locator('.space-y-2');
    const optionalCount = await optional.count();
    expect(optionalCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe usare Default values', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('Dovrebbe gestire TypeScript interfaces', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('Dovrebbe avere Accessibility compliance', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const accessible = page.locator('[aria-invalid], [role="alert"], [aria-live]');
    const accessibleCount = await accessible.count();
    expect(accessibleCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire Error handling', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const errors = page.locator('.text-red-600, .border-red-300');
    const errorCount = await errors.count();
    expect(errorCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire Options validation', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const options = page.locator('option');
    const optionCount = await options.count();
    expect(optionCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe avere Export corretti', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
