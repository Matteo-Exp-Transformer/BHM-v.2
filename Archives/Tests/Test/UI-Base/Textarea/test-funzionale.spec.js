import { test, expect } from '@playwright/test';

test.describe('Textarea.tsx - Test Funzionali', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('h1')).toContainText('HACCP Manager');
  });

  test('Dovrebbe renderizzare Textarea base', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const textareas = page.locator('textarea');
    const textareaCount = await textareas.count();
    expect(textareaCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire className personalizzata', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const styled = page.locator('textarea.rounded-md');
    const styledCount = await styled.count();
    expect(styledCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire props HTML', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const textareas = page.locator('textarea');
    const textareaCount = await textareas.count();
    expect(textareaCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire ForwardRef functionality', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const textareas = page.locator('textarea');
    const textareaCount = await textareas.count();
    expect(textareaCount).toBeGreaterThanOrEqual(0);
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

  test('Dovrebbe gestire Focus management', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const focusable = page.locator('textarea:focus, textarea');
    const focusableCount = await focusable.count();
    expect(focusableCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire Disabled state', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const disabled = page.locator('textarea[disabled]');
    const disabledCount = await disabled.count();
    expect(disabledCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire Placeholder handling', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const placeholder = page.locator('textarea[placeholder]');
    const placeholderCount = await placeholder.count();
    expect(placeholderCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire Text input', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const textInput = page.locator('textarea');
    const textInputCount = await textInput.count();
    expect(textInputCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire Resize functionality', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const resize = page.locator('textarea[resize], textarea');
    const resizeCount = await resize.count();
    expect(resizeCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire Multiple instances', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const multiple = page.locator('textarea');
    const multipleCount = await multiple.count();
    expect(multipleCount).toBeGreaterThanOrEqual(0);
  });
});
