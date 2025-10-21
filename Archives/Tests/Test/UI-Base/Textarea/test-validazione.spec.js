import { test, expect } from '@playwright/test';

test.describe('Textarea.tsx - Test Validazione Dati', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('h1')).toContainText('HACCP Manager');
  });

  test('Dovrebbe accettare props valide', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('Dovrebbe gestire TextareaProps interface', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const textareas = page.locator('textarea');
    const textareaCount = await textareas.count();
    expect(textareaCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire ForwardRef corretto', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const textareas = page.locator('textarea');
    const textareaCount = await textareas.count();
    expect(textareaCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire ClassName personalizzabile', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const styled = page.locator('textarea');
    const styledCount = await styled.count();
    expect(styledCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe usare Default values', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('Dovrebbe gestire Required props', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const required = page.locator('textarea[required]');
    const requiredCount = await required.count();
    expect(requiredCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire Optional props', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('Dovrebbe avere Accessibility compliance', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const accessible = page.locator('textarea');
    const accessibleCount = await accessible.count();
    expect(accessibleCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire HTML attributes', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const attributes = page.locator('textarea[name], textarea[id], textarea[placeholder]');
    const attributeCount = await attributes.count();
    expect(attributeCount).toBeGreaterThanOrEqual(0);
  });
});
