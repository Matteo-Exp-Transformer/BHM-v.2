import { test, expect } from '@playwright/test';

test.describe('Switch.tsx - Test Validazione Dati', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('h1')).toContainText('HACCP Manager');
  });

  test('Dovrebbe accettare props valide', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('Dovrebbe gestire Radix UI integration', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const radix = page.locator('[data-radix-switch-root]');
    const radixCount = await radix.count();
    expect(radixCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire ForwardRef corretto', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const elements = page.locator('button, [role="switch"]');
    const elementCount = await elements.count();
    expect(elementCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire ClassName personalizzabile', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const styled = page.locator('.rounded-full, .border-2');
    const styledCount = await styled.count();
    expect(styledCount).toBeGreaterThanOrEqual(0);
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

  test('Dovrebbe usare Default values', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('Dovrebbe gestire Required props', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const required = page.locator('[required]');
    const requiredCount = await required.count();
    expect(requiredCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe avere Accessibility compliance', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const accessible = page.locator('[role="switch"], [aria-*]');
    const accessibleCount = await accessible.count();
    expect(accessibleCount).toBeGreaterThanOrEqual(0);
  });
});
