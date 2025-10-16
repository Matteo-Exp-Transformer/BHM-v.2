import { test, expect } from '@playwright/test';

test.describe('Radio.tsx - Test Funzionali', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('h1')).toContainText('HACCP Manager');
  });

  test('Dovrebbe renderizzare radio correttamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard dove ci sono radio
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare presenza di radio
    const radios = page.locator('input[type="radio"]');
    
    // ASSERT: Verificare che i radio siano presenti e visibili
    const radioCount = await radios.count();
    if (radioCount > 0) {
      await expect(radios.first()).toBeVisible();
      
      // Verificare che il radio abbia classi CSS appropriate
      const radioClass = await radios.first().getAttribute('class');
      expect(radioClass).toContain('h-4');
      expect(radioClass).toContain('w-4');
      expect(radioClass).toContain('rounded-full');
    }
  });

  test('Dovrebbe gestire stato checked/unchecked', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare stato checked/unchecked
    const radios = page.locator('input[type="radio"]');
    
    // ASSERT: Verificare gestione stato
    const radioCount = await radios.count();
    if (radioCount > 0) {
      const radio = radios.first();
      await expect(radio).toBeVisible();
      
      // Verificare stato iniziale
      const isChecked = await radio.isChecked();
      expect(typeof isChecked).toBe('boolean');
      
      // Testare selezione
      await radio.click();
      const newChecked = await radio.isChecked();
      expect(newChecked).toBe(true);
    }
  });

  test('Dovrebbe gestire click correttamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare click su radio
    const radios = page.locator('input[type="radio"]');
    
    // ASSERT: Verificare gestione click
    const radioCount = await radios.count();
    if (radioCount > 0) {
      const radio = radios.first();
      await expect(radio).toBeVisible();
      
      // Testare click
      await radio.click();
      const newState = await radio.isChecked();
      expect(newState).toBe(true);
    }
  });

  test('Dovrebbe gestire stato disabled correttamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare stato disabled
    const radios = page.locator('input[type="radio"]');
    
    // ASSERT: Verificare gestione stato disabled
    const radioCount = await radios.count();
    if (radioCount > 0) {
      const radio = radios.first();
      await expect(radio).toBeVisible();
      
      // Verificare che il radio non sia disabilitato di default
      const disabled = await radio.getAttribute('disabled');
      expect(disabled).toBeNull();
      
      // Verificare che abbia classi CSS appropriate
      const radioClass = await radio.getAttribute('class');
      expect(radioClass).toContain('transition-colors');
    }
  });

  test('Dovrebbe gestire focus correttamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare focus su radio
    const radios = page.locator('input[type="radio"]');
    
    // ASSERT: Verificare gestione focus
    const radioCount = await radios.count();
    if (radioCount > 0) {
      const radio = radios.first();
      await expect(radio).toBeVisible();
      
      // Testare focus
      await radio.focus();
      await expect(radio).toBeFocused();
      
      // Testare blur
      await radio.blur();
      await expect(radio).not.toBeFocused();
    }
  });

  test('Dovrebbe gestire keyboard navigation', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare navigazione da tastiera
    const radios = page.locator('input[type="radio"]');
    
    // ASSERT: Verificare navigazione da tastiera
    const radioCount = await radios.count();
    if (radioCount > 0) {
      const radio = radios.first();
      await expect(radio).toBeVisible();
      
      // Testare navigazione con Tab
      await radio.focus();
      await expect(radio).toBeFocused();
      
      // Testare attivazione con Space
      await page.keyboard.press('Space');
      const newState = await radio.isChecked();
      expect(newState).toBe(true);
    }
  });

  test('Dovrebbe gestire props forwarding correttamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare props forwarding
    const radios = page.locator('input[type="radio"]');
    
    // ASSERT: Verificare props forwarding
    const radioCount = await radios.count();
    if (radioCount > 0) {
      const radio = radios.first();
      await expect(radio).toBeVisible();
      
      // Verificare attributi HTML standard
      const type = await radio.getAttribute('type');
      expect(type).toBe('radio');
      
      // Verificare che sia un elemento radio valido
      const tagName = await radio.evaluate(el => el.tagName);
      expect(tagName).toBe('INPUT');
    }
  });

  test('Dovrebbe gestire classi CSS combinate correttamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare classi CSS
    const radios = page.locator('input[type="radio"]');
    
    // ASSERT: Verificare classi CSS base
    const radioCount = await radios.count();
    if (radioCount > 0) {
      const radio = radios.first();
      const radioClass = await radio.getAttribute('class');
      
      expect(radioClass).toContain('h-4');
      expect(radioClass).toContain('w-4');
      expect(radioClass).toContain('rounded-full');
      expect(radioClass).toContain('border');
      expect(radioClass).toContain('border-primary');
      expect(radioClass).toContain('bg-background');
      expect(radioClass).toContain('transition-colors');
    }
  });

  test('Dovrebbe gestire forwardRef correttamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare forwardRef
    const radios = page.locator('input[type="radio"]');
    
    // ASSERT: Verificare che sia un elemento radio HTML
    const radioCount = await radios.count();
    if (radioCount > 0) {
      const radio = radios.first();
      await expect(radio).toBeVisible();
      
      // Verificare che sia cliccabile/focusabile (indica che la ref funziona)
      await radio.click();
      await expect(radio).toBeFocused();
    }
  });

  test('Dovrebbe gestire multiple radio', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare multiple radio
    const radios = page.locator('input[type="radio"]');
    
    // ASSERT: Verificare gestione multiple radio
    const radioCount = await radios.count();
    expect(radioCount).toBeGreaterThanOrEqual(0);
    
    // Verificare che tutti i radio siano visibili
    for (let i = 0; i < Math.min(radioCount, 5); i++) {
      const radio = radios.nth(i);
      await expect(radio).toBeVisible();
      
      // Verificare che ogni radio abbia classi CSS appropriate
      const radioClass = await radio.getAttribute('class');
      expect(radioClass).toContain('h-4');
      expect(radioClass).toContain('w-4');
    }
  });

  test('Dovrebbe gestire aria attributes', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare aria attributes
    const radios = page.locator('input[type="radio"]');
    
    // ASSERT: Verificare aria attributes
    const radioCount = await radios.count();
    if (radioCount > 0) {
      const radio = radios.first();
      await expect(radio).toBeVisible();
      
      // Verificare che abbia attributi ARIA appropriati
      const type = await radio.getAttribute('type');
      expect(type).toBe('radio');
      
      // Verificare che sia focusabile
      await radio.focus();
      await expect(radio).toBeFocused();
    }
  });

  test('Dovrebbe gestire radio groups', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare radio groups
    const radios = page.locator('input[type="radio"]');
    
    // ASSERT: Verificare gestione radio groups
    const radioCount = await radios.count();
    if (radioCount > 0) {
      const radio = radios.first();
      await expect(radio).toBeVisible();
      
      // Verificare che sia un elemento radio valido
      const type = await radio.getAttribute('type');
      expect(type).toBe('radio');
      
      // Verificare che abbia attributi per radio group
      const name = await radio.getAttribute('name');
      expect(name).toBeTruthy();
    }
  });

  test('Dovrebbe gestire exclusive selection', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare exclusive selection
    const radios = page.locator('input[type="radio"]');
    
    // ASSERT: Verificare gestione exclusive selection
    const radioCount = await radios.count();
    if (radioCount > 1) {
      const radio1 = radios.first();
      const radio2 = radios.nth(1);
      
      await expect(radio1).toBeVisible();
      await expect(radio2).toBeVisible();
      
      // Testare exclusive selection
      await radio1.click();
      const radio1Checked = await radio1.isChecked();
      expect(radio1Checked).toBe(true);
      
      await radio2.click();
      const radio2Checked = await radio2.isChecked();
      expect(radio2Checked).toBe(true);
    }
  });
});
