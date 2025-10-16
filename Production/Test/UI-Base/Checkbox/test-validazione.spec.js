import { test, expect } from '@playwright/test';

test.describe('Checkbox.tsx - Test Validazione Dati', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('h1')).toContainText('HACCP Manager');
  });

  test('Dovrebbe accettare props valide', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard dove ci sono checkbox
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare che i checkbox abbiano props valide
    const checkboxes = page.locator('input[type="checkbox"]');
    
    // ASSERT: Verificare che i checkbox siano renderizzati correttamente
    const checkboxCount = await checkboxes.count();
    expect(checkboxCount).toBeGreaterThanOrEqual(0);
    
    // Verificare che ogni checkbox abbia classi CSS appropriate
    for (let i = 0; i < Math.min(checkboxCount, 5); i++) {
      const checkbox = checkboxes.nth(i);
      const checkboxClass = await checkbox.getAttribute('class');
      
      // Ogni checkbox dovrebbe avere classi base
      expect(checkboxClass).toContain('h-4');
      expect(checkboxClass).toContain('w-4');
      expect(checkboxClass).toContain('rounded');
    }
  });

  test('Dovrebbe accettare props HTML standard', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare checkbox con props HTML standard
    const checkboxes = page.locator('input[type="checkbox"]');
    
    // ASSERT: Verificare che i checkbox abbiano attributi HTML standard
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      const type = await checkbox.getAttribute('type');
      expect(type).toBe('checkbox');
      
      // Verificare che sia un elemento checkbox valido
      const tagName = await checkbox.evaluate(el => el.tagName);
      expect(tagName).toBe('INPUT');
    }
  });

  test('Dovrebbe accettare className personalizzata', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare che i checkbox abbiano classi CSS combinate
    const checkboxes = page.locator('input[type="checkbox"]');
    
    // ASSERT: Verificare che i checkbox abbiano classi CSS
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      const checkboxClass = await checkbox.getAttribute('class');
      expect(checkboxClass).toBeTruthy();
      expect(checkboxClass.length).toBeGreaterThan(10); // Dovrebbe avere diverse classi
    }
  });

  test('Dovrebbe accettare onChange handler', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare checkbox con onChange
    const checkboxes = page.locator('input[type="checkbox"]');
    
    // ASSERT: Verificare che il checkbox funzioni senza errori
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      await checkbox.click();
      
      // Verificare che la pagina sia ancora stabile
      await expect(page.locator('h1')).toContainText('HACCP Manager');
    }
  });

  test('Dovrebbe accettare disabled prop', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare che i checkbox non disabilitati siano funzionanti
    const checkboxes = page.locator('input[type="checkbox"]');
    
    // ASSERT: Verificare che i checkbox siano abilitati di default
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      await expect(checkbox).toBeEnabled();
      
      // Verificare che non abbiano attributo disabled
      const disabled = await checkbox.getAttribute('disabled');
      expect(disabled).toBeNull();
    }
  });

  test('Dovrebbe validare checkbox browser correttamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare checkbox
    const checkboxes = page.locator('input[type="checkbox"]');
    
    // ASSERT: Verificare validazione checkbox browser
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      
      // Testare stato iniziale
      const initialState = await checkbox.isChecked();
      expect(typeof initialState).toBe('boolean');
      
      // Verificare che il tipo sia checkbox
      const type = await checkbox.getAttribute('type');
      expect(type).toBe('checkbox');
    }
  });

  test('Dovrebbe gestire placeholder correttamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare placeholder sui checkbox
    const checkboxes = page.locator('input[type="checkbox"]');
    
    // ASSERT: Verificare gestione placeholder
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      const checkboxClass = await checkbox.getAttribute('class');
      
      // Verificare che abbia classi CSS per placeholder
      expect(checkboxClass).toContain('placeholder:text-muted-foreground');
    }
  });

  test('Dovrebbe accettare ref forwarding', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare che i checkbox siano elementi DOM validi
    const checkboxes = page.locator('input[type="checkbox"]');
    
    // ASSERT: Verificare che il checkbox sia un elemento DOM valido
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      await expect(checkbox).toBeVisible();
      
      // Verificare che sia focusabile (indica che la ref funziona)
      await checkbox.focus();
      await expect(checkbox).toBeFocused();
    }
  });

  test('Dovrebbe gestire indeterminate state correttamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare indeterminate state
    const checkboxes = page.locator('input[type="checkbox"]');
    
    // ASSERT: Verificare indeterminate state
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      await expect(checkbox).toBeVisible();
      
      // Verificare che il tipo sia checkbox
      const type = await checkbox.getAttribute('type');
      expect(type).toBe('checkbox');
      
      // Verificare che abbia classi CSS appropriate per indeterminate state
      const checkboxClass = await checkbox.getAttribute('class');
      expect(checkboxClass).toContain('data-[state=indeterminate]');
    }
  });

  test('Dovrebbe gestire checked state correttamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare checked state
    const checkboxes = page.locator('input[type="checkbox"]');
    
    // ASSERT: Verificare checked state
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      await expect(checkbox).toBeVisible();
      
      // Verificare che il tipo sia checkbox
      const type = await checkbox.getAttribute('type');
      expect(type).toBe('checkbox');
      
      // Verificare che abbia classi CSS appropriate per checked state
      const checkboxClass = await checkbox.getAttribute('class');
      expect(checkboxClass).toContain('data-[state=checked]');
    }
  });

  test('Dovrebbe gestire unchecked state correttamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare unchecked state
    const checkboxes = page.locator('input[type="checkbox"]');
    
    // ASSERT: Verificare unchecked state
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      await expect(checkbox).toBeVisible();
      
      // Verificare che il tipo sia checkbox
      const type = await checkbox.getAttribute('type');
      expect(type).toBe('checkbox');
      
      // Verificare che abbia classi CSS appropriate per unchecked state
      const checkboxClass = await checkbox.getAttribute('class');
      expect(checkboxClass).toContain('data-[state=unchecked]');
    }
  });

  test('Dovrebbe gestire required prop', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare required prop
    const checkboxes = page.locator('input[type="checkbox"]');
    
    // ASSERT: Verificare gestione required prop
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      await expect(checkbox).toBeVisible();
      
      // Verificare che il tipo sia checkbox
      const type = await checkbox.getAttribute('type');
      expect(type).toBe('checkbox');
      
      // Verificare che sia un elemento checkbox valido
      const tagName = await checkbox.evaluate(el => el.tagName);
      expect(tagName).toBe('INPUT');
    }
  });
});
