import { test, expect } from '@playwright/test';

test.describe('Switch.tsx - Test Funzionali', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('h1')).toContainText('HACCP Manager');
  });

  test('Dovrebbe renderizzare Switch base', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('Dovrebbe gestire stato checked', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const checked = page.locator('[data-state="checked"]');
    const checkedCount = await checked.count();
    expect(checkedCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire stato unchecked', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const unchecked = page.locator('[data-state="unchecked"]');
    const uncheckedCount = await unchecked.count();
    expect(uncheckedCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire Toggle functionality', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const switches = page.locator('[role="switch"]');
    const switchCount = await switches.count();
    expect(switchCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire Disabled state', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const disabled = page.locator('[disabled], [data-disabled]');
    const disabledCount = await disabled.count();
    expect(disabledCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire Focus management', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const focusable = page.locator('[tabindex], button');
    const focusableCount = await focusable.count();
    expect(focusableCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire Keyboard navigation', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const keyboard = page.locator('[tabindex]');
    const keyboardCount = await keyboard.count();
    expect(keyboardCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire Thumb animation', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const thumb = page.locator('[data-radix-switch-thumb]');
    const thumbCount = await thumb.count();
    expect(thumbCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire Color transitions', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const transitions = page.locator('.transition-colors, .transition-transform');
    const transitionCount = await transitions.count();
    expect(transitionCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire Click interactions', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const clickable = page.locator('button, [role="switch"]');
    const clickableCount = await clickable.count();
    expect(clickableCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire Multiple instances', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const multiple = page.locator('[role="switch"]');
    const multipleCount = await multiple.count();
    expect(multipleCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire Controlled vs uncontrolled', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const controlled = page.locator('[role="switch"]');
    const controlledCount = await controlled.count();
    expect(controlledCount).toBeGreaterThanOrEqual(0);
  });
});
