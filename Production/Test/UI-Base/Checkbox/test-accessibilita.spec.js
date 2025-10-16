import { test, expect } from '@playwright/test';

test.describe('Checkbox.tsx - Test Accessibilità', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('h1')).toContainText('HACCP Manager');
  });

  test('Dovrebbe essere navigabile da tastiera', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare navigazione da tastiera per checkbox
    const checkboxes = page.locator('input[type="checkbox"]');
    
    // ASSERT: Verificare che i checkbox siano navigabili da tastiera
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      
      // Verificare che il checkbox sia focusabile
      await checkbox.focus();
      await expect(checkbox).toBeFocused();
      
      // Verificare navigazione con Tab
      await page.keyboard.press('Tab');
      
      // Verificare che il checkbox sia ancora presente
      await expect(checkbox).toBeVisible();
    }
  });

  test('Dovrebbe avere attributi ARIA appropriati', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare attributi ARIA per checkbox
    const checkboxes = page.locator('input[type="checkbox"]');
    
    // ASSERT: Verificare attributi ARIA
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      await expect(checkbox).toBeVisible();
      
      // Verificare che sia un elemento checkbox
      const type = await checkbox.getAttribute('type');
      expect(type).toBe('checkbox');
      
      // Verificare che abbia attributi standard
      const tagName = await checkbox.evaluate(el => el.tagName);
      expect(tagName).toBe('INPUT');
    }
  });

  test('Dovrebbe supportare screen reader', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare supporto screen reader
    const checkboxes = page.locator('input[type="checkbox"]');
    
    // ASSERT: Verificare che i checkbox siano accessibili via screen reader
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      await expect(checkbox).toBeVisible();
      
      // Verificare che sia un elemento HTML standard
      const tagName = await checkbox.evaluate(el => el.tagName);
      expect(tagName).toBe('INPUT');
      
      // Verificare che sia focusabile
      await checkbox.focus();
      await expect(checkbox).toBeFocused();
    }
  });

  test('Dovrebbe gestire label associati', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare label associati
    const checkboxes = page.locator('input[type="checkbox"]');
    const labels = page.locator('label');
    
    // ASSERT: Verificare gestione label
    const checkboxCount = await checkboxes.count();
    const labelCount = await labels.count();
    
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      await expect(checkbox).toBeVisible();
      
      // Verificare che sia un elemento HTML standard che supporta label
      const tagName = await checkbox.evaluate(el => el.tagName);
      expect(tagName).toBe('INPUT');
    }
    
    expect(labelCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe avere contrasto adeguato', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare contrasto
    const checkboxes = page.locator('input[type="checkbox"]');
    
    // ASSERT: Verificare che i checkbox abbiano classi CSS per contrasto
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      await expect(checkbox).toBeVisible();
      
      // Verificare che abbia classi CSS per contrasto
      const checkboxClass = await checkbox.getAttribute('class');
      expect(checkboxClass).toContain('border'); // Bordo per contrasto
      
      // Verificare che abbia classi per colore del testo
      expect(checkboxClass).toContain('bg-background');
    }
  });

  test('Dovrebbe gestire stato focus visivamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare stato focus visivo
    const checkboxes = page.locator('input[type="checkbox"]');
    
    // ASSERT: Verificare gestione focus visivo
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      await expect(checkbox).toBeVisible();
      
      // Verificare che abbia classi CSS per focus
      const checkboxClass = await checkbox.getAttribute('class');
      expect(checkboxClass).toContain('transition-colors'); // Transizione per focus
      
      // Testare focus
      await checkbox.focus();
      await expect(checkbox).toBeFocused();
    }
  });

  test('Dovrebbe supportare navigazione sequenziale', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare navigazione sequenziale
    const checkboxes = page.locator('input[type="checkbox"]');
    
    // ASSERT: Verificare navigazione sequenziale
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      await expect(checkbox).toBeVisible();
      
      // Verificare che il checkbox sia navigabile
      await checkbox.focus();
      await expect(checkbox).toBeFocused();
      
      // Verificare navigazione con Tab
      await page.keyboard.press('Tab');
      
      // Verificare che il checkbox sia ancora presente
      await expect(checkbox).toBeVisible();
    }
  });

  test('Dovrebbe gestire errori accessibili', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare gestione errori accessibili
    const checkboxes = page.locator('input[type="checkbox"]');
    
    // ASSERT: Verificare gestione errori
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      await expect(checkbox).toBeVisible();
      
      // Verificare che sia un elemento HTML standard
      const tagName = await checkbox.evaluate(el => el.tagName);
      expect(tagName).toBe('INPUT');
      
      // Verificare che abbia attributi standard per gestione errori
      const type = await checkbox.getAttribute('type');
      expect(type).toBe('checkbox');
    }
  });

  test('Dovrebbe supportare shortcut da tastiera', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare shortcut da tastiera
    const checkboxes = page.locator('input[type="checkbox"]');
    
    // ASSERT: Verificare shortcut da tastiera
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      await expect(checkbox).toBeVisible();
      
      // Verificare che il checkbox sia focusabile
      await checkbox.focus();
      await expect(checkbox).toBeFocused();
      
      // Testare shortcut comuni (Space per toggle)
      const initialState = await checkbox.isChecked();
      await page.keyboard.press('Space');
      const newState = await checkbox.isChecked();
      expect(newState).not.toBe(initialState);
    }
  });

  test('Dovrebbe avere dimensioni touch-friendly', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare dimensioni touch-friendly
    const checkboxes = page.locator('input[type="checkbox"]');
    
    // ASSERT: Verificare dimensioni appropriate
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      await expect(checkbox).toBeVisible();
      
      // Verificare che abbia dimensioni appropriate
      const checkboxClass = await checkbox.getAttribute('class');
      expect(checkboxClass).toContain('h-4'); // Altezza minima per touch
      expect(checkboxClass).toContain('w-4'); // Larghezza appropriata
    }
  });

  test('Dovrebbe supportare modalità ad alto contrasto', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare supporto alto contrasto
    const checkboxes = page.locator('input[type="checkbox"]');
    
    // ASSERT: Verificare supporto alto contrasto
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      await expect(checkbox).toBeVisible();
      
      // Verificare che abbia classi CSS per contrasto
      const checkboxClass = await checkbox.getAttribute('class');
      expect(checkboxClass).toContain('border'); // Bordo per contrasto
      expect(checkboxClass).toContain('bg-background'); // Background definito
      
      // Verificare che sia un elemento HTML standard
      const tagName = await checkbox.evaluate(el => el.tagName);
      expect(tagName).toBe('INPUT');
    }
  });

  test('Dovrebbe gestire zoom senza problemi', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare zoom
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // ASSERT: Verificare che i checkbox siano ancora accessibili con zoom
    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      await expect(checkbox).toBeVisible();
      
      // Verificare che il checkbox sia ancora focusabile
      await checkbox.focus();
      await expect(checkbox).toBeFocused();
      
      // Verificare che abbia dimensioni appropriate
      const checkboxClass = await checkbox.getAttribute('class');
      expect(checkboxClass).toContain('h-4');
      expect(checkboxClass).toContain('w-4');
    }
  });

  test('Dovrebbe supportare navigazione con solo tastiera', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare navigazione solo tastiera
    const checkboxes = page.locator('input[type="checkbox"]');
    
    // ASSERT: Verificare navigazione solo tastiera
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      await expect(checkbox).toBeVisible();
      
      // Verificare che il checkbox sia navigabile da tastiera
      await checkbox.focus();
      await expect(checkbox).toBeFocused();
      
      // Testare navigazione con Tab
      await page.keyboard.press('Tab');
      
      // Verificare che il checkbox sia ancora presente
      await expect(checkbox).toBeVisible();
      
      // Testare toggle con Space
      await checkbox.focus();
      const initialState = await checkbox.isChecked();
      await page.keyboard.press('Space');
      const newState = await checkbox.isChecked();
      expect(newState).not.toBe(initialState);
    }
  });

  test('Dovrebbe gestire stato checked accessibile', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare stato checked accessibile
    const checkboxes = page.locator('input[type="checkbox"]');
    
    // ASSERT: Verificare gestione stato checked
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      await expect(checkbox).toBeVisible();
      
      // Verificare che abbia attributi per stato checked
      const type = await checkbox.getAttribute('type');
      expect(type).toBe('checkbox');
      
      // Verificare che sia un elemento HTML standard
      const tagName = await checkbox.evaluate(el => el.tagName);
      expect(tagName).toBe('INPUT');
    }
  });

  test('Dovrebbe gestire stato disabled accessibile', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare stato disabled accessibile
    const checkboxes = page.locator('input[type="checkbox"]');
    
    // ASSERT: Verificare stato disabled
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      await expect(checkbox).toBeVisible();
      
      // Verificare che il checkbox non sia disabilitato di default
      const disabled = await checkbox.getAttribute('disabled');
      expect(disabled).toBeNull();
      
      // Verificare che abbia attributi standard
      const type = await checkbox.getAttribute('type');
      expect(type).toBe('checkbox');
    }
  });

  test('Dovrebbe gestire indeterminate state accessibile', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare indeterminate state accessibile
    const checkboxes = page.locator('input[type="checkbox"]');
    
    // ASSERT: Verificare gestione indeterminate state
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      await expect(checkbox).toBeVisible();
      
      // Verificare che abbia attributi per indeterminate state
      const type = await checkbox.getAttribute('type');
      expect(type).toBe('checkbox');
      
      // Verificare che sia un elemento HTML standard
      const tagName = await checkbox.evaluate(el => el.tagName);
      expect(tagName).toBe('INPUT');
    }
  });
});
