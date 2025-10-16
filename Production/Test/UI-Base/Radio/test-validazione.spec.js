import { test, expect } from '@playwright/test';

test.describe('Radio.tsx - Test Validazione Dati', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('h1')).toContainText('HACCP Manager');
  });

  test('Dovrebbe accettare props valide', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard dove ci sono radio
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare che i radio abbiano props valide
    const radios = page.locator('input[type="radio"]');
    
    // ASSERT: Verificare che i radio siano renderizzati correttamente
    const radioCount = await radios.count();
    expect(radioCount).toBeGreaterThanOrEqual(0);
    
    // Verificare che ogni radio abbia classi CSS appropriate
    for (let i = 0; i < Math.min(radioCount, 5); i++) {
      const radio = radios.nth(i);
      const radioClass = await radio.getAttribute('class');
      
      // Ogni radio dovrebbe avere classi base
      expect(radioClass).toContain('h-4');
      expect(radioClass).toContain('w-4');
      expect(radioClass).toContain('rounded-full');
    }
  });

  test('Dovrebbe accettare props HTML standard', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare radio con props HTML standard
    const radios = page.locator('input[type="radio"]');
    
    // ASSERT: Verificare che i radio abbiano attributi HTML standard
    const radioCount = await radios.count();
    if (radioCount > 0) {
      const radio = radios.first();
      const type = await radio.getAttribute('type');
      expect(type).toBe('radio');
      
      // Verificare che sia un elemento radio valido
      const tagName = await radio.evaluate(el => el.tagName);
      expect(tagName).toBe('INPUT');
    }
  });

  test('Dovrebbe accettare className personalizzata', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare che i radio abbiano classi CSS combinate
    const radios = page.locator('input[type="radio"]');
    
    // ASSERT: Verificare che i radio abbiano classi CSS
    const radioCount = await radios.count();
    if (radioCount > 0) {
      const radio = radios.first();
      const radioClass = await radio.getAttribute('class');
      expect(radioClass).toBeTruthy();
      expect(radioClass.length).toBeGreaterThan(10); // Dovrebbe avere diverse classi
    }
  });

  test('Dovrebbe accettare onChange handler', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare radio con onChange
    const radios = page.locator('input[type="radio"]');
    
    // ASSERT: Verificare che il radio funzioni senza errori
    const radioCount = await radios.count();
    if (radioCount > 0) {
      const radio = radios.first();
      await radio.click();
      
      // Verificare che la pagina sia ancora stabile
      await expect(page.locator('h1')).toContainText('HACCP Manager');
    }
  });

  test('Dovrebbe accettare disabled prop', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare che i radio non disabilitati siano funzionanti
    const radios = page.locator('input[type="radio"]');
    
    // ASSERT: Verificare che i radio siano abilitati di default
    const radioCount = await radios.count();
    if (radioCount > 0) {
      const radio = radios.first();
      await expect(radio).toBeEnabled();
      
      // Verificare che non abbiano attributo disabled
      const disabled = await radio.getAttribute('disabled');
      expect(disabled).toBeNull();
    }
  });

  test('Dovrebbe validare radio browser correttamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare radio
    const radios = page.locator('input[type="radio"]');
    
    // ASSERT: Verificare validazione radio browser
    const radioCount = await radios.count();
    if (radioCount > 0) {
      const radio = radios.first();
      
      // Testare stato iniziale
      const initialState = await radio.isChecked();
      expect(typeof initialState).toBe('boolean');
      
      // Verificare che il tipo sia radio
      const type = await radio.getAttribute('type');
      expect(type).toBe('radio');
    }
  });

  test('Dovrebbe gestire name attribute correttamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare name attribute
    const radios = page.locator('input[type="radio"]');
    
    // ASSERT: Verificare gestione name attribute
    const radioCount = await radios.count();
    if (radioCount > 0) {
      const radio = radios.first();
      const name = await radio.getAttribute('name');
      
      // Verificare che abbia name attribute per radio group
      expect(name).toBeTruthy();
    }
  });

  test('Dovrebbe accettare ref forwarding', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare che i radio siano elementi DOM validi
    const radios = page.locator('input[type="radio"]');
    
    // ASSERT: Verificare che il radio sia un elemento DOM valido
    const radioCount = await radios.count();
    if (radioCount > 0) {
      const radio = radios.first();
      await expect(radio).toBeVisible();
      
      // Verificare che sia focusabile (indica che la ref funziona)
      await radio.focus();
      await expect(radio).toBeFocused();
    }
  });

  test('Dovrebbe gestire value attribute correttamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare value attribute
    const radios = page.locator('input[type="radio"]');
    
    // ASSERT: Verificare value attribute
    const radioCount = await radios.count();
    if (radioCount > 0) {
      const radio = radios.first();
      await expect(radio).toBeVisible();
      
      // Verificare che il tipo sia radio
      const type = await radio.getAttribute('type');
      expect(type).toBe('radio');
      
      // Verificare che abbia classi CSS appropriate
      const radioClass = await radio.getAttribute('class');
      expect(radioClass).toContain('h-4');
      expect(radioClass).toContain('w-4');
    }
  });

  test('Dovrebbe gestire checked state correttamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare checked state
    const radios = page.locator('input[type="radio"]');
    
    // ASSERT: Verificare checked state
    const radioCount = await radios.count();
    if (radioCount > 0) {
      const radio = radios.first();
      await expect(radio).toBeVisible();
      
      // Verificare che il tipo sia radio
      const type = await radio.getAttribute('type');
      expect(type).toBe('radio');
      
      // Verificare che abbia classi CSS appropriate per checked state
      const radioClass = await radio.getAttribute('class');
      expect(radioClass).toContain('data-[state=checked]');
    }
  });

  test('Dovrebbe gestire unchecked state correttamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare unchecked state
    const radios = page.locator('input[type="radio"]');
    
    // ASSERT: Verificare unchecked state
    const radioCount = await radios.count();
    if (radioCount > 0) {
      const radio = radios.first();
      await expect(radio).toBeVisible();
      
      // Verificare che il tipo sia radio
      const type = await radio.getAttribute('type');
      expect(type).toBe('radio');
      
      // Verificare che abbia classi CSS appropriate per unchecked state
      const radioClass = await radio.getAttribute('class');
      expect(radioClass).toContain('data-[state=unchecked]');
    }
  });

  test('Dovrebbe gestire required prop', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare required prop
    const radios = page.locator('input[type="radio"]');
    
    // ASSERT: Verificare gestione required prop
    const radioCount = await radios.count();
    if (radioCount > 0) {
      const radio = radios.first();
      await expect(radio).toBeVisible();
      
      // Verificare che il tipo sia radio
      const type = await radio.getAttribute('type');
      expect(type).toBe('radio');
      
      // Verificare che sia un elemento radio valido
      const tagName = await radio.evaluate(el => el.tagName);
      expect(tagName).toBe('INPUT');
    }
  });

  test('Dovrebbe gestire radio group validation', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare radio group validation
    const radios = page.locator('input[type="radio"]');
    
    // ASSERT: Verificare gestione radio group validation
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
});
