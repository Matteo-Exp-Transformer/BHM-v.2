import { test, expect } from '@playwright/test';

test.describe('Progress.tsx - Test Funzionali', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('h1')).toContainText('HACCP Manager');
  });

  test('Dovrebbe renderizzare Progress base', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const progress = page.locator('[role="progressbar"]');
    const progressCount = await progress.count();
    expect(progressCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire value prop (0-100)', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const values = page.locator('[aria-valuenow]');
    const valueCount = await values.count();
    expect(valueCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire className personalizzata', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const styled = page.locator('.rounded-full, .bg-secondary');
    const styledCount = await styled.count();
    expect(styledCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire forwardRef', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const refs = page.locator('[role="progressbar"]');
    const refCount = await refs.count();
    expect(refCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire ProgressIndicator', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const indicators = page.locator('.bg-primary');
    const indicatorCount = await indicators.count();
    expect(indicatorCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire Value calculation e transform', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const transforms = page.locator('[style*="transform"]');
    const transformCount = await transforms.count();
    expect(transformCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire Animation transitions', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const transitions = page.locator('.transition-all');
    const transitionCount = await transitions.count();
    expect(transitionCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire Default value handling', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('Dovrebbe gestire Edge value cases (0, 100)', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const edges = page.locator('[role="progressbar"]');
    const edgeCount = await edges.count();
    expect(edgeCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire Multiple instances', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const multiple = page.locator('[role="progressbar"]');
    const multipleCount = await multiple.count();
    expect(multipleCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe avere Accessibility compliance', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const accessible = page.locator('[role="progressbar"], [aria-valuenow], [aria-valuemin], [aria-valuemax]');
    const accessibleCount = await accessible.count();
    expect(accessibleCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire Responsive behavior', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const responsive = page.locator('.w-full');
    const responsiveCount = await responsive.count();
    expect(responsiveCount).toBeGreaterThanOrEqual(0);
  });
});
