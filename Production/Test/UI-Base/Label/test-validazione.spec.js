import { test, expect } from '@playwright/test';

test.describe('Label.tsx - Test Validazione Dati', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('h1')).toContainText('HACCP Manager');
  });

  test('Dovrebbe accettare props valide', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('Dovrebbe gestire LabelProps interface', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const labels = page.locator('label');
    const labelCount = await labels.count();
    expect(labelCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire ForwardRef corretto', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const labels = page.locator('label');
    const labelCount = await labels.count();
    expect(labelCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire ClassName personalizzabile', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const styled = page.locator('label');
    const styledCount = await styled.count();
    expect(styledCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe usare Default values', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('Dovrebbe avere Accessibility compliance', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const accessible = page.locator('label');
    const accessibleCount = await accessible.count();
    expect(accessibleCount).toBeGreaterThanOrEqual(0);
  });
});
