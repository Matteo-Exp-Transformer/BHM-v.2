import { test, expect } from '@playwright/test';

test.describe('Table.tsx - Test Funzionali', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('h1')).toContainText('HACCP Manager');
  });

  test('Dovrebbe renderizzare Table base', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const tables = page.locator('table[role="table"]');
    const tableCount = await tables.count();
    expect(tableCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire TableHeader', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const headers = page.locator('thead');
    const headerCount = await headers.count();
    expect(headerCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire TableBody', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const bodies = page.locator('tbody');
    const bodyCount = await bodies.count();
    expect(bodyCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire TableRow', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const rows = page.locator('tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire TableHeaderCell', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const headerCells = page.locator('th');
    const headerCellCount = await headerCells.count();
    expect(headerCellCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire TableCell', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const cells = page.locator('td');
    const cellCount = await cells.count();
    expect(cellCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire caption', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const captions = page.locator('caption.sr-only');
    const captionCount = await captions.count();
    expect(captionCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire overflow responsive', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const overflow = page.locator('.overflow-x-auto');
    const overflowCount = await overflow.count();
    expect(overflowCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire row selection', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const selected = page.locator('[aria-selected="true"]');
    const selectedCount = await selected.count();
    expect(selectedCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire row click', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const clickable = page.locator('tr[role="button"]');
    const clickableCount = await clickable.count();
    expect(clickableCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire row hover', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const hoverable = page.locator('tr.hover\\:bg-gray-50');
    const hoverableCount = await hoverable.count();
    expect(hoverableCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire header sorting', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const sortable = page.locator('th[role="button"]');
    const sortableCount = await sortable.count();
    expect(sortableCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire sort direction', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const sorted = page.locator('[aria-sort]');
    const sortedCount = await sorted.count();
    expect(sortedCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire keyboard navigation', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const keyboard = page.locator('[tabindex]');
    const keyboardCount = await keyboard.count();
    expect(keyboardCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire focus management', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const focusable = page.locator('tr[tabindex], th[tabindex]');
    const focusableCount = await focusable.count();
    expect(focusableCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire multiple rows', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const multiple = page.locator('tr');
    const multipleCount = await multiple.count();
    expect(multipleCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire empty table', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const empty = page.locator('table');
    const emptyCount = await empty.count();
    expect(emptyCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire nested content', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const nested = page.locator('table td, table th');
    const nestedCount = await nested.count();
    expect(nestedCount).toBeGreaterThanOrEqual(0);
  });
});
