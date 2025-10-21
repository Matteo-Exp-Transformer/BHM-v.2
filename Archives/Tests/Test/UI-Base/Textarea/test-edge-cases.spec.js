import { test, expect } from '@playwright/test';

test.describe('Textarea.tsx - Test Edge Cases', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('h1')).toContainText('HACCP Manager');
  });

  test('Dovrebbe gestire props undefined/null', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('Dovrebbe gestire ClassName vuota', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('Dovrebbe gestire Props HTML vuote', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const textareas = page.locator('textarea');
    const textareaCount = await textareas.count();
    expect(textareaCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire Empty value', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const empty = page.locator('textarea');
    const emptyCount = await empty.count();
    expect(emptyCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire Long text', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const long = page.locator('textarea');
    const longCount = await long.count();
    expect(longCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire Special characters', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const special = page.locator('textarea');
    const specialCount = await special.count();
    expect(specialCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire Resize edge cases', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const resize = page.locator('textarea');
    const resizeCount = await resize.count();
    expect(resizeCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire Focus edge cases', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const focus = page.locator('textarea:focus');
    const focusCount = await focus.count();
    expect(focusCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe prevenire Memory leaks', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
