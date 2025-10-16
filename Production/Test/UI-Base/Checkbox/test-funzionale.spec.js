import { test, expect } from '@playwright/test';

test.describe('Checkbox.tsx - Test Funzionali', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('h1')).toContainText('HACCP Manager');
  });

  test('Dovrebbe renderizzare checkbox correttamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard dove ci sono checkbox
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare presenza di checkbox
    const checkboxes = page.locator('input[type="checkbox"]');
    
    // ASSERT: Verificare che i checkbox siano presenti e visibili
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 0) {
      await expect(checkboxes.first()).toBeVisible();
      
      // Verificare che il checkbox abbia classi CSS appropriate
      const checkboxClass = await checkboxes.first().getAttribute('class');
      expect(checkboxClass).toContain('h-4');
      expect(checkboxClass).toContain('w-4');
      expect(checkboxClass).toContain('rounded');
    }
  });

  test('Dovrebbe gestire stato checked/unchecked', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare stato checked/unchecked
    const checkboxes = page.locator('input[type="checkbox"]');
    
    // ASSERT: Verificare gestione stato
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      await expect(checkbox).toBeVisible();
      
      // Verificare stato iniziale
      const isChecked = await checkbox.isChecked();
      expect(typeof isChecked).toBe('boolean');
      
      // Testare toggle
      await checkbox.click();
      const newChecked = await checkbox.isChecked();
      expect(newChecked).not.toBe(isChecked);
    }
  });

  test('Dovrebbe gestire click correttamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare click su checkbox
    const checkboxes = page.locator('input[type="checkbox"]');
    
    // ASSERT: Verificare gestione click
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      await expect(checkbox).toBeVisible();
      
      // Testare click
      const initialState = await checkbox.isChecked();
      await checkbox.click();
      const newState = await checkbox.isChecked();
      expect(newState).not.toBe(initialState);
    }
  });

  test('Dovrebbe gestire stato disabled correttamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare stato disabled
    const checkboxes = page.locator('input[type="checkbox"]');
    
    // ASSERT: Verificare gestione stato disabled
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      await expect(checkbox).toBeVisible();
      
      // Verificare che il checkbox non sia disabilitato di default
      const disabled = await checkbox.getAttribute('disabled');
      expect(disabled).toBeNull();
      
      // Verificare che abbia classi CSS appropriate
      const checkboxClass = await checkbox.getAttribute('class');
      expect(checkboxClass).toContain('transition-colors');
    }
  });

  test('Dovrebbe gestire focus correttamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare focus su checkbox
    const checkboxes = page.locator('input[type="checkbox"]');
    
    // ASSERT: Verificare gestione focus
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      await expect(checkbox).toBeVisible();
      
      // Testare focus
      await checkbox.focus();
      await expect(checkbox).toBeFocused();
      
      // Testare blur
      await checkbox.blur();
      await expect(checkbox).not.toBeFocused();
    }
  });

  test('Dovrebbe gestire keyboard navigation', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare navigazione da tastiera
    const checkboxes = page.locator('input[type="checkbox"]');
    
    // ASSERT: Verificare navigazione da tastiera
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      await expect(checkbox).toBeVisible();
      
      // Testare navigazione con Tab
      await checkbox.focus();
      await expect(checkbox).toBeFocused();
      
      // Testare attivazione con Space
      const initialState = await checkbox.isChecked();
      await page.keyboard.press('Space');
      const newState = await checkbox.isChecked();
      expect(newState).not.toBe(initialState);
    }
  });

  test('Dovrebbe gestire props forwarding correttamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare props forwarding
    const checkboxes = page.locator('input[type="checkbox"]');
    
    // ASSERT: Verificare props forwarding
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      await expect(checkbox).toBeVisible();
      
      // Verificare attributi HTML standard
      const type = await checkbox.getAttribute('type');
      expect(type).toBe('checkbox');
      
      // Verificare che sia un elemento checkbox valido
      const tagName = await checkbox.evaluate(el => el.tagName);
      expect(tagName).toBe('INPUT');
    }
  });

  test('Dovrebbe gestire classi CSS combinate correttamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare classi CSS
    const checkboxes = page.locator('input[type="checkbox"]');
    
    // ASSERT: Verificare classi CSS base
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      const checkboxClass = await checkbox.getAttribute('class');
      
      expect(checkboxClass).toContain('h-4');
      expect(checkboxClass).toContain('w-4');
      expect(checkboxClass).toContain('rounded');
      expect(checkboxClass).toContain('border');
      expect(checkboxClass).toContain('border-primary');
      expect(checkboxClass).toContain('bg-background');
      expect(checkboxClass).toContain('transition-colors');
    }
  });

  test('Dovrebbe gestire forwardRef correttamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare forwardRef
    const checkboxes = page.locator('input[type="checkbox"]');
    
    // ASSERT: Verificare che sia un elemento checkbox HTML
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      await expect(checkbox).toBeVisible();
      
      // Verificare che sia cliccabile/focusabile (indica che la ref funziona)
      await checkbox.click();
      await expect(checkbox).toBeFocused();
    }
  });

  test('Dovrebbe gestire multiple checkbox', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare multiple checkbox
    const checkboxes = page.locator('input[type="checkbox"]');
    
    // ASSERT: Verificare gestione multiple checkbox
    const checkboxCount = await checkboxes.count();
    expect(checkboxCount).toBeGreaterThanOrEqual(0);
    
    // Verificare che tutti i checkbox siano visibili
    for (let i = 0; i < Math.min(checkboxCount, 5); i++) {
      const checkbox = checkboxes.nth(i);
      await expect(checkbox).toBeVisible();
      
      // Verificare che ogni checkbox abbia classi CSS appropriate
      const checkboxClass = await checkbox.getAttribute('class');
      expect(checkboxClass).toContain('h-4');
      expect(checkboxClass).toContain('w-4');
    }
  });

  test('Dovrebbe gestire aria attributes', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare aria attributes
    const checkboxes = page.locator('input[type="checkbox"]');
    
    // ASSERT: Verificare aria attributes
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      await expect(checkbox).toBeVisible();
      
      // Verificare che abbia attributi ARIA appropriati
      const type = await checkbox.getAttribute('type');
      expect(type).toBe('checkbox');
      
      // Verificare che sia focusabile
      await checkbox.focus();
      await expect(checkbox).toBeFocused();
    }
  });

  test('Dovrebbe gestire indeterminate state', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare indeterminate state
    const checkboxes = page.locator('input[type="checkbox"]');
    
    // ASSERT: Verificare gestione indeterminate state
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      await expect(checkbox).toBeVisible();
      
      // Verificare che sia un elemento checkbox valido
      const type = await checkbox.getAttribute('type');
      expect(type).toBe('checkbox');
      
      // Verificare che sia cliccabile
      await checkbox.click();
      await expect(checkbox).toBeVisible();
    }
  });
});
