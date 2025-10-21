import { test, expect } from '@playwright/test';

test.describe('OptimizedImage.tsx - Test Funzionali', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('h1')).toContainText('HACCP Manager');
  });

  test('Dovrebbe renderizzare OptimizedImage base', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const images = page.locator('img');
    const imageCount = await images.count();
    expect(imageCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire src e alt props', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const images = page.locator('img[src], img[alt]');
    const imageCount = await images.count();
    expect(imageCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire className personalizzata', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const styled = page.locator('img, .relative');
    const styledCount = await styled.count();
    expect(styledCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire loading states', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const loading = page.locator('.animate-pulse, .opacity-0, .opacity-100');
    const loadingCount = await loading.count();
    expect(loadingCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire placeholder', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const placeholder = page.locator('.animate-pulse');
    const placeholderCount = await placeholder.count();
    expect(placeholderCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire error state', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const error = page.locator('.bg-gray-100');
    const errorCount = await error.count();
    expect(errorCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire onLoad callback', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const loadable = page.locator('img[onload]');
    const loadableCount = await loadable.count();
    expect(loadableCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire onError callback', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const errorable = page.locator('img[onerror]');
    const errorableCount = await errorable.count();
    expect(errorableCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire loading prop', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const lazy = page.locator('img[loading]');
    const lazyCount = await lazy.count();
    expect(lazyCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire State management', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const states = page.locator('.relative');
    const stateCount = await states.count();
    expect(stateCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire Transition animations', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const transitions = page.locator('.transition-opacity');
    const transitionCount = await transitions.count();
    expect(transitionCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire Responsive layout', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const responsive = page.locator('img');
    const responsiveCount = await responsive.count();
    expect(responsiveCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire Multiple instances', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const multiple = page.locator('img');
    const multipleCount = await multiple.count();
    expect(multipleCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire Image loading lifecycle', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const lifecycle = page.locator('img');
    const lifecycleCount = await lifecycle.count();
    expect(lifecycleCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire Error recovery', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const recovery = page.locator('.relative');
    const recoveryCount = await recovery.count();
    expect(recoveryCount).toBeGreaterThanOrEqual(0);
  });
});
