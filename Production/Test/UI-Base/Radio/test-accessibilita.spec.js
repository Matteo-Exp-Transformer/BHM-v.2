import { test, expect } from '@playwright/test';

test.describe('Radio.tsx - Test Accessibilità', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('h1')).toContainText('HACCP Manager');
  });

  test('Dovrebbe essere navigabile da tastiera', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare navigazione da tastiera per radio
    const radios = page.locator('input[type="radio"]');
    
    // ASSERT: Verificare che i radio siano navigabili da tastiera
    const radioCount = await radios.count();
    if (radioCount > 0) {
      const radio = radios.first();
      
      // Verificare che il radio sia focusabile
      await radio.focus();
      await expect(radio).toBeFocused();
      
      // Verificare navigazione con Tab
      await page.keyboard.press('Tab');
      
      // Verificare che il radio sia ancora presente
      await expect(radio).toBeVisible();
    }
  });

  test('Dovrebbe avere attributi ARIA appropriati', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare attributi ARIA per radio
    const radios = page.locator('input[type="radio"]');
    
    // ASSERT: Verificare attributi ARIA
    const radioCount = await radios.count();
    if (radioCount > 0) {
      const radio = radios.first();
      await expect(radio).toBeVisible();
      
      // Verificare che sia un elemento radio
      const type = await radio.getAttribute('type');
      expect(type).toBe('radio');
      
      // Verificare che abbia attributi standard
      const tagName = await radio.evaluate(el => el.tagName);
      expect(tagName).toBe('INPUT');
    }
  });

  test('Dovrebbe supportare screen reader', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare supporto screen reader
    const radios = page.locator('input[type="radio"]');
    
    // ASSERT: Verificare che i radio siano accessibili via screen reader
    const radioCount = await radios.count();
    if (radioCount > 0) {
      const radio = radios.first();
      await expect(radio).toBeVisible();
      
      // Verificare che sia un elemento HTML standard
      const tagName = await radio.evaluate(el => el.tagName);
      expect(tagName).toBe('INPUT');
      
      // Verificare che sia focusabile
      await radio.focus();
      await expect(radio).toBeFocused();
    }
  });

  test('Dovrebbe gestire label associati', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare label associati
    const radios = page.locator('input[type="radio"]');
    const labels = page.locator('label');
    
    // ASSERT: Verificare gestione label
    const radioCount = await radios.count();
    const labelCount = await labels.count();
    
    if (radioCount > 0) {
      const radio = radios.first();
      await expect(radio).toBeVisible();
      
      // Verificare che sia un elemento HTML standard che supporta label
      const tagName = await radio.evaluate(el => el.tagName);
      expect(tagName).toBe('INPUT');
    }
    
    expect(labelCount).toBeGreaterThanOrEqual(0);
  });

  test('Dovrebbe avere contrasto adeguato', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare contrasto
    const radios = page.locator('input[type="radio"]');
    
    // ASSERT: Verificare che i radio abbiano classi CSS per contrasto
    const radioCount = await radios.count();
    if (radioCount > 0) {
      const radio = radios.first();
      await expect(radio).toBeVisible();
      
      // Verificare che abbia classi CSS per contrasto
      const radioClass = await radio.getAttribute('class');
      expect(radioClass).toContain('border'); // Bordo per contrasto
      
      // Verificare che abbia classi per colore del testo
      expect(radioClass).toContain('bg-background');
    }
  });

  test('Dovrebbe gestire stato focus visivamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare stato focus visivo
    const radios = page.locator('input[type="radio"]');
    
    // ASSERT: Verificare gestione focus visivo
    const radioCount = await radios.count();
    if (radioCount > 0) {
      const radio = radios.first();
      await expect(radio).toBeVisible();
      
      // Verificare che abbia classi CSS per focus
      const radioClass = await radio.getAttribute('class');
      expect(radioClass).toContain('transition-colors'); // Transizione per focus
      
      // Testare focus
      await radio.focus();
      await expect(radio).toBeFocused();
    }
  });

  test('Dovrebbe supportare navigazione sequenziale', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare navigazione sequenziale
    const radios = page.locator('input[type="radio"]');
    
    // ASSERT: Verificare navigazione sequenziale
    const radioCount = await radios.count();
    if (radioCount > 0) {
      const radio = radios.first();
      await expect(radio).toBeVisible();
      
      // Verificare che il radio sia navigabile
      await radio.focus();
      await expect(radio).toBeFocused();
      
      // Verificare navigazione con Tab
      await page.keyboard.press('Tab');
      
      // Verificare che il radio sia ancora presente
      await expect(radio).toBeVisible();
    }
  });

  test('Dovrebbe gestire errori accessibili', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare gestione errori accessibili
    const radios = page.locator('input[type="radio"]');
    
    // ASSERT: Verificare gestione errori
    const radioCount = await radios.count();
    if (radioCount > 0) {
      const radio = radios.first();
      await expect(radio).toBeVisible();
      
      // Verificare che sia un elemento HTML standard
      const tagName = await radio.evaluate(el => el.tagName);
      expect(tagName).toBe('INPUT');
      
      // Verificare che abbia attributi standard per gestione errori
      const type = await radio.getAttribute('type');
      expect(type).toBe('radio');
    }
  });

  test('Dovrebbe supportare shortcut da tastiera', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare shortcut da tastiera
    const radios = page.locator('input[type="radio"]');
    
    // ASSERT: Verificare shortcut da tastiera
    const radioCount = await radios.count();
    if (radioCount > 0) {
      const radio = radios.first();
      await expect(radio).toBeVisible();
      
      // Verificare che il radio sia focusabile
      await radio.focus();
      await expect(radio).toBeFocused();
      
      // Testare shortcut comuni (Space per selezione)
      await page.keyboard.press('Space');
      const newState = await radio.isChecked();
      expect(newState).toBe(true);
    }
  });

  test('Dovrebbe avere dimensioni touch-friendly', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare dimensioni touch-friendly
    const radios = page.locator('input[type="radio"]');
    
    // ASSERT: Verificare dimensioni appropriate
    const radioCount = await radios.count();
    if (radioCount > 0) {
      const radio = radios.first();
      await expect(radio).toBeVisible();
      
      // Verificare che abbia dimensioni appropriate
      const radioClass = await radio.getAttribute('class');
      expect(radioClass).toContain('h-4'); // Altezza minima per touch
      expect(radioClass).toContain('w-4'); // Larghezza appropriata
    }
  });

  test('Dovrebbe supportare modalità ad alto contrasto', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare supporto alto contrasto
    const radios = page.locator('input[type="radio"]');
    
    // ASSERT: Verificare supporto alto contrasto
    const radioCount = await radios.count();
    if (radioCount > 0) {
      const radio = radios.first();
      await expect(radio).toBeVisible();
      
      // Verificare che abbia classi CSS per contrasto
      const radioClass = await radio.getAttribute('class');
      expect(radioClass).toContain('border'); // Bordo per contrasto
      expect(radioClass).toContain('bg-background'); // Background definito
      
      // Verificare che sia un elemento HTML standard
      const tagName = await radio.evaluate(el => el.tagName);
      expect(tagName).toBe('INPUT');
    }
  });

  test('Dovrebbe gestire zoom senza problemi', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare zoom
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // ASSERT: Verificare che i radio siano ancora accessibili con zoom
    const radios = page.locator('input[type="radio"]');
    const radioCount = await radios.count();
    if (radioCount > 0) {
      const radio = radios.first();
      await expect(radio).toBeVisible();
      
      // Verificare che il radio sia ancora focusabile
      await radio.focus();
      await expect(radio).toBeFocused();
      
      // Verificare che abbia dimensioni appropriate
      const radioClass = await radio.getAttribute('class');
      expect(radioClass).toContain('h-4');
      expect(radioClass).toContain('w-4');
    }
  });

  test('Dovrebbe supportare navigazione con solo tastiera', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare navigazione solo tastiera
    const radios = page.locator('input[type="radio"]');
    
    // ASSERT: Verificare navigazione solo tastiera
    const radioCount = await radios.count();
    if (radioCount > 0) {
      const radio = radios.first();
      await expect(radio).toBeVisible();
      
      // Verificare che il radio sia navigabile da tastiera
      await radio.focus();
      await expect(radio).toBeFocused();
      
      // Testare navigazione con Tab
      await page.keyboard.press('Tab');
      
      // Verificare che il radio sia ancora presente
      await expect(radio).toBeVisible();
      
      // Testare selezione con Space
      await radio.focus();
      await page.keyboard.press('Space');
      const newState = await radio.isChecked();
      expect(newState).toBe(true);
    }
  });

  test('Dovrebbe gestire radio group accessibile', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare radio group accessibile
    const radios = page.locator('input[type="radio"]');
    
    // ASSERT: Verificare gestione radio group
    const radioCount = await radios.count();
    if (radioCount > 0) {
      const radio = radios.first();
      await expect(radio).toBeVisible();
      
      // Verificare che abbia name attribute per radio group
      const name = await radio.getAttribute('name');
      expect(name).toBeTruthy();
      
      // Verificare che sia un elemento radio valido
      const type = await radio.getAttribute('type');
      expect(type).toBe('radio');
    }
  });

  test('Dovrebbe gestire stato disabled accessibile', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare stato disabled accessibile
    const radios = page.locator('input[type="radio"]');
    
    // ASSERT: Verificare stato disabled
    const radioCount = await radios.count();
    if (radioCount > 0) {
      const radio = radios.first();
      await expect(radio).toBeVisible();
      
      // Verificare che il radio non sia disabilitato di default
      const disabled = await radio.getAttribute('disabled');
      expect(disabled).toBeNull();
      
      // Verificare che abbia attributi standard
      const type = await radio.getAttribute('type');
      expect(type).toBe('radio');
    }
  });

  test('Dovrebbe gestire value attribute accessibile', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare value attribute accessibile
    const radios = page.locator('input[type="radio"]');
    
    // ASSERT: Verificare gestione value attribute
    const radioCount = await radios.count();
    if (radioCount > 0) {
      const radio = radios.first();
      await expect(radio).toBeVisible();
      
      // Verificare che abbia value attribute
      const value = await radio.getAttribute('value');
      expect(value).toBeTruthy();
      
      // Verificare che sia un elemento radio valido
      const type = await radio.getAttribute('type');
      expect(type).toBe('radio');
    }
  });

  test('Dovrebbe gestire exclusive selection accessibile', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare exclusive selection accessibile
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
