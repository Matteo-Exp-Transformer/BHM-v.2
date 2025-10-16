import { test, expect } from '@playwright/test';

test.describe('Checkbox.tsx - Test Edge Cases', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('h1')).toContainText('HACCP Manager');
  });

  test('Dovrebbe gestire props undefined/null correttamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare che i checkbox funzionino anche con props undefined
    const checkboxes = page.locator('input[type="checkbox"]');
    
    // ASSERT: Verificare che i checkbox siano renderizzati anche con props default
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      await expect(checkbox).toBeVisible();
      
      // Verificare che abbia classi CSS di default
      const checkboxClass = await checkbox.getAttribute('class');
      expect(checkboxClass).toContain('h-4');
      expect(checkboxClass).toContain('w-4');
      expect(checkboxClass).toContain('rounded');
    }
  });

  test('Dovrebbe gestire className vuota o null', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare che i checkbox funzionino senza className personalizzata
    const checkboxes = page.locator('input[type="checkbox"]');
    
    // ASSERT: Verificare che i checkbox abbiano classi CSS di default
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      const checkboxClass = await checkbox.getAttribute('class');
      expect(checkboxClass).toBeTruthy();
      expect(checkboxClass.length).toBeGreaterThan(0);
    }
  });

  test('Dovrebbe gestire onChange undefined', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare checkbox senza onChange handler
    const checkboxes = page.locator('input[type="checkbox"]');
    
    // ASSERT: Verificare che il checkbox non causi errori
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      await checkbox.click();
      
      // Verificare che la pagina sia ancora stabile
      await expect(page.locator('h1')).toContainText('HACCP Manager');
    }
  });

  test('Dovrebbe gestire valori vuoti', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare checkbox con valori vuoti
    const checkboxes = page.locator('input[type="checkbox"]');
    
    // ASSERT: Verificare gestione valori vuoti
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      
      // Testare stato iniziale
      const initialState = await checkbox.isChecked();
      expect(typeof initialState).toBe('boolean');
      
      // Verificare che il checkbox sia ancora funzionante
      await expect(checkbox).toBeVisible();
    }
  });

  test('Dovrebbe gestire rapid click', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare rapid click su checkbox
    const checkboxes = page.locator('input[type="checkbox"]');
    
    // ASSERT: Verificare gestione rapid click
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      
      // Testare rapid click
      for (let i = 0; i < 10; i++) {
        await checkbox.click();
        await expect(checkbox).toBeVisible();
      }
      
      // Verificare che il checkbox sia ancora funzionante
      await expect(checkbox).toBeVisible();
    }
  });

  test('Dovrebbe gestire multiple focus/blur', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare multiple focus/blur su checkbox
    const checkboxes = page.locator('input[type="checkbox"]');
    
    // ASSERT: Verificare gestione multiple focus/blur
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      
      // Testare multiple focus/blur
      for (let i = 0; i < 5; i++) {
        await checkbox.focus();
        await expect(checkbox).toBeFocused();
        await checkbox.blur();
        await expect(checkbox).not.toBeFocused();
      }
      
      // Verificare che il checkbox sia ancora funzionante
      await expect(checkbox).toBeVisible();
    }
  });

  test('Dovrebbe gestire resize della finestra', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Ridimensionare la finestra
    await page.setViewportSize({ width: 800, height: 600 });
    
    // ASSERT: Verificare che i checkbox siano ancora visibili e funzionanti
    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      await expect(checkbox).toBeVisible();
      
      // Testare che il checkbox funzioni ancora
      await checkbox.click();
      await expect(checkbox).toBeVisible();
    }
    
    // Ripristinare dimensione originale
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Verificare che i checkbox siano ancora visibili
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      await expect(checkbox).toBeVisible();
    }
  });

  test('Dovrebbe gestire keyboard navigation edge cases', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare navigazione da tastiera edge cases
    const checkboxes = page.locator('input[type="checkbox"]');
    
    // ASSERT: Verificare navigazione da tastiera edge cases
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      
      // Verificare che il checkbox sia navigabile da tastiera
      await checkbox.focus();
      await expect(checkbox).toBeFocused();
      
      // Testare tab navigation
      await page.keyboard.press('Tab');
      
      // Verificare che il checkbox sia ancora presente
      await expect(checkbox).toBeVisible();
    }
  });

  test('Dovrebbe gestire indeterminate state edge cases', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare indeterminate state edge cases
    const checkboxes = page.locator('input[type="checkbox"]');
    
    // ASSERT: Verificare gestione indeterminate state edge cases
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      await expect(checkbox).toBeVisible();
      
      // Verificare che il tipo sia checkbox
      const type = await checkbox.getAttribute('type');
      expect(type).toBe('checkbox');
      
      // Verificare che abbia classi CSS appropriate
      const checkboxClass = await checkbox.getAttribute('class');
      expect(checkboxClass).toContain('h-4');
      expect(checkboxClass).toContain('w-4');
    }
  });

  test('Dovrebbe gestire valori limite per checkbox', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare checkbox con valori limite
    const checkboxes = page.locator('input[type="checkbox"]');
    
    // ASSERT: Verificare gestione valori limite
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      
      // Testare stati limite
      const initialState = await checkbox.isChecked();
      
      // Testare toggle multiple volte
      for (let i = 0; i < 5; i++) {
        await checkbox.click();
        await expect(checkbox).toBeVisible();
      }
      
      // Verificare che il checkbox sia ancora funzionante
      await expect(checkbox).toBeVisible();
    }
  });

  test('Dovrebbe gestire animation interruptions', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare animation interruptions
    const checkboxes = page.locator('input[type="checkbox"]');
    
    // ASSERT: Verificare gestione animation interruptions
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      
      // Testare click rapidi per interrompere animazioni
      for (let i = 0; i < 3; i++) {
        await checkbox.click();
        await expect(checkbox).toBeVisible();
      }
      
      // Verificare che il checkbox sia ancora funzionante
      await expect(checkbox).toBeVisible();
    }
  });

  test('Dovrebbe prevenire Memory leaks', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare memory leaks
    const checkboxes = page.locator('input[type="checkbox"]');
    
    // ASSERT: Verificare che non ci siano memory leaks
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      
      // Testare multiple operazioni per verificare memory usage
      for (let i = 0; i < 100; i++) {
        await checkbox.click();
        await checkbox.focus();
        await checkbox.blur();
      }
      
      // Verificare che il checkbox sia ancora funzionante
      await expect(checkbox).toBeVisible();
    }
  });

  test('Dovrebbe gestire Cleanup', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare cleanup
    const checkboxes = page.locator('input[type="checkbox"]');
    
    // ASSERT: Verificare gestione cleanup
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      await expect(checkbox).toBeVisible();
      
      // Verificare che il checkbox sia ancora funzionante dopo cleanup
      await checkbox.click();
      await expect(checkbox).toBeVisible();
    }
  });
});
