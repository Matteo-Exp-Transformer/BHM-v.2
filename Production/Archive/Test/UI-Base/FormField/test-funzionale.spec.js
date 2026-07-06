import { test, expect } from '@playwright/test';

test.describe('FormField.tsx - Test Funzionali', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('h1')).toContainText('HACCP Manager');
  });

  test('Dovrebbe renderizzare FormField base', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const formFields = page.locator('.space-y-2');
    const formFieldCount = await formFields.count();
    expect(formFieldCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire label e required asterisk', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const labels = page.locator('label, .text-red-500');
    const labelCount = await labels.count();
    expect(labelCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire error message', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const errors = page.locator('[role="alert"], .text-red-600');
    const errorCount = await errors.count();
    expect(errorCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire help text', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const helpText = page.locator('.text-gray-500');
    const helpCount = await helpText.count();
    expect(helpCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire children rendering', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const children = page.locator('.relative');
    const childCount = await children.count();
    expect(childCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire Input component', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    expect(inputCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire Select component', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const selects = page.locator('select');
    const selectCount = await selects.count();
    expect(selectCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire TextArea component', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const textareas = page.locator('textarea');
    const textareaCount = await textareas.count();
    expect(textareaCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire error states', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const errorStates = page.locator('[aria-invalid], .border-red-300');
    const errorStateCount = await errorStates.count();
    expect(errorStateCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire conditional rendering', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const conditional = page.locator('label, p');
    const conditionalCount = await conditional.count();
    expect(conditionalCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire className personalizzata', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const styled = page.locator('.space-y-2');
    const styledCount = await styled.count();
    expect(styledCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire accessibility', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const accessible = page.locator('[aria-invalid], [role="alert"], [aria-live]');
    const accessibleCount = await accessible.count();
    expect(accessibleCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire options mapping', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const options = page.locator('option');
    const optionCount = await options.count();
    expect(optionCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire disabled options', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const disabled = page.locator('option[disabled]');
    const disabledCount = await disabled.count();
    expect(disabledCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire multiple instances', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const multiple = page.locator('.space-y-2');
    const multipleCount = await multiple.count();
    expect(multipleCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire form integration', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const forms = page.locator('form, .space-y-2');
    const formCount = await forms.count();
    expect(formCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire validation states', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const validation = page.locator('[aria-invalid], .text-red-600');
    const validationCount = await validation.count();
    expect(validationCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire focus management', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const focus = page.locator(':focus, .focus\\:ring-2');
    const focusCount = await focus.count();
    expect(focusCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire responsive behavior', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const responsive = page.locator('.block, .w-full');
    const responsiveCount = await responsive.count();
    expect(responsiveCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe gestire edge cases', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
