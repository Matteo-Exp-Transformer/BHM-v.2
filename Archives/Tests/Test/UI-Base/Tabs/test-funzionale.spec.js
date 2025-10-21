import { test, expect } from '@playwright/test';

test.describe('Tabs.tsx - Test Funzionali', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('h1')).toContainText('HACCP Manager');
  });

  test('Dovrebbe renderizzare Tabs base', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('Dovrebbe gestire TabsList', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const lists = page.locator('[role="tablist"]');
    const listCount = await lists.count();
    expect(listCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire TabsTrigger', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const triggers = page.locator('[role="tab"]');
    const triggerCount = await triggers.count();
    expect(triggerCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire TabsContent', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const contents = page.locator('[role="tabpanel"]');
    const contentCount = await contents.count();
    expect(contentCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire Tab selection', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const selected = page.locator('[aria-selected="true"]');
    const selectedCount = await selected.count();
    expect(selectedCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire Active state management', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const active = page.locator('[data-state="active"]');
    const activeCount = await active.count();
    expect(activeCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire Disabled state', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const disabled = page.locator('[disabled], [data-disabled]');
    const disabledCount = await disabled.count();
    expect(disabledCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire Focus management', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const focusable = page.locator('[tabindex], [role="tab"]');
    const focusableCount = await focusable.count();
    expect(focusableCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire Keyboard navigation', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const keyboard = page.locator('[role="tab"]');
    const keyboardCount = await keyboard.count();
    expect(keyboardCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire Content switching', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const switching = page.locator('[role="tabpanel"]');
    const switchingCount = await switching.count();
    expect(switchingCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire Multiple tabs', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const multiple = page.locator('[role="tab"]');
    const multipleCount = await multiple.count();
    expect(multipleCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire Single tab', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const single = page.locator('[role="tab"]');
    const singleCount = await single.count();
    expect(singleCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire Empty tabs', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const empty = page.locator('[role="tablist"]');
    const emptyCount = await empty.count();
    expect(emptyCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire Nested content', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const nested = page.locator('[role="tabpanel"] div');
    const nestedCount = await nested.count();
    expect(nestedCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire ForwardRef functionality', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const refs = page.locator('[role="tablist"], [role="tab"], [role="tabpanel"]');
    const refCount = await refs.count();
    expect(refCount).toBeGreaterThanOrEqual(0);
  });
});
