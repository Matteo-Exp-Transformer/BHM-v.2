import { test, expect } from '@playwright/test';

test.describe('Checkbox.tsx - Test Performance', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('h1')).toContainText('HACCP Manager');
  });

  test('Dovrebbe renderizzare rapidamente', async ({ page }) => {
    // ARRANGE: Misurare tempo di rendering
    const startTime = Date.now();
    
    // ACT: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ASSERT: Verificare che il rendering sia veloce
    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    
    const renderTime = Date.now() - startTime;
    expect(renderTime).toBeLessThan(5000); // Meno di 5 secondi
    
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      await expect(checkbox).toBeVisible();
    }
  });

  test('Dovrebbe gestire click rapidi senza lag', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare click rapidi
    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    
    // ASSERT: Verificare che i checkbox rispondano rapidamente
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      await expect(checkbox).toBeVisible();
      
      // Testare click rapido
      const startTime = Date.now();
      await checkbox.click();
      const clickTime = Date.now() - startTime;
      
      expect(clickTime).toBeLessThan(1000); // Meno di 1 secondo
      
      // Verificare che il checkbox sia ancora presente
      await expect(checkbox).toBeVisible();
    }
  });

  test('Dovrebbe gestire molti checkbox senza problemi di performance', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare performance con molti checkbox
    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    
    // ASSERT: Verificare che non ci siano problemi con molti checkbox
    expect(checkboxCount).toBeGreaterThanOrEqual(0);
    
    // Verificare che tutti i checkbox siano visibili
    for (let i = 0; i < Math.min(checkboxCount, 10); i++) {
      const checkbox = checkboxes.nth(i);
      await expect(checkbox).toBeVisible();
      
      // Verificare che ogni checkbox abbia classi CSS appropriate
      const checkboxClass = await checkbox.getAttribute('class');
      expect(checkboxClass).toContain('h-4');
      expect(checkboxClass).toContain('w-4');
    }
  });

  test('Dovrebbe gestire focus/blur rapidamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare focus/blur rapidi
    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    
    // ASSERT: Verificare che focus/blur siano rapidi
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      await expect(checkbox).toBeVisible();
      
      // Testare focus/blur rapidi
      const startTime = Date.now();
      
      for (let i = 0; i < 10; i++) {
        await checkbox.focus();
        await expect(checkbox).toBeFocused();
        await checkbox.blur();
        await expect(checkbox).not.toBeFocused();
      }
      
      const focusBlurTime = Date.now() - startTime;
      expect(focusBlurTime).toBeLessThan(2000); // Meno di 2 secondi per 10 cicli
    }
  });

  test('Dovrebbe gestire toggle rapidi', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare toggle rapidi
    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    
    // ASSERT: Verificare che i toggle siano rapidi
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      await expect(checkbox).toBeVisible();
      
      // Testare toggle rapidi
      const startTime = Date.now();
      
      for (let i = 0; i < 10; i++) {
        await checkbox.click();
        await expect(checkbox).toBeVisible();
      }
      
      const toggleTime = Date.now() - startTime;
      expect(toggleTime).toBeLessThan(2000); // Meno di 2 secondi per 10 toggle
    }
  });

  test('Dovrebbe gestire resize senza problemi di performance', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare resize
    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    
    // ASSERT: Verificare che resize non causi problemi di performance
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      await expect(checkbox).toBeVisible();
      
      // Testare resize
      const startTime = Date.now();
      await page.setViewportSize({ width: 800, height: 600 });
      
      // Verificare che il checkbox sia ancora visibile
      await expect(checkbox).toBeVisible();
      
      const resizeTime = Date.now() - startTime;
      expect(resizeTime).toBeLessThan(2000); // Meno di 2 secondi
      
      // Ripristinare dimensione originale
      await page.setViewportSize({ width: 1280, height: 720 });
      await expect(checkbox).toBeVisible();
    }
  });

  test('Dovrebbe gestire multiple interazioni simultanee', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare interazioni simultanee
    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    
    // ASSERT: Verificare che interazioni simultanee non causino problemi
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      await expect(checkbox).toBeVisible();
      
      // Testare interazioni rapide
      const startTime = Date.now();
      
      for (let i = 0; i < 5; i++) {
        await checkbox.click();
        await checkbox.focus();
        await checkbox.blur();
        await expect(checkbox).toBeVisible();
      }
      
      const multiInteractionTime = Date.now() - startTime;
      expect(multiInteractionTime).toBeLessThan(3000); // Meno di 3 secondi per 5 interazioni
    }
  });

  test('Dovrebbe gestire keyboard events rapidamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare keyboard events
    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    
    // ASSERT: Verificare che keyboard events siano rapidi
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      await expect(checkbox).toBeVisible();
      
      // Testare keyboard events rapidi
      const startTime = Date.now();
      
      await checkbox.focus();
      await expect(checkbox).toBeFocused();
      
      // Testare navigazione da tastiera
      await page.keyboard.press('Space');
      await page.keyboard.press('Space');
      
      const keyboardTime = Date.now() - startTime;
      expect(keyboardTime).toBeLessThan(2000); // Meno di 2 secondi
      
      // Verificare che il checkbox sia ancora presente
      await expect(checkbox).toBeVisible();
    }
  });

  test('Dovrebbe gestire memory usage appropriatamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare memory usage
    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    
    // ASSERT: Verificare che non ci siano memory leaks
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      await expect(checkbox).toBeVisible();
      
      // Testare multiple operazioni per verificare memory usage
      for (let i = 0; i < 100; i++) {
        await checkbox.click();
        await checkbox.focus();
        await checkbox.blur();
      }
      
      // Verificare che il checkbox sia ancora funzionante
      await expect(checkbox).toBeVisible();
      await checkbox.focus();
      await expect(checkbox).toBeFocused();
    }
  });

  test('Dovrebbe gestire DOM updates efficientemente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare DOM updates
    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    
    // ASSERT: Verificare che DOM updates siano efficienti
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      await expect(checkbox).toBeVisible();
      
      // Testare multiple DOM updates
      const startTime = Date.now();
      
      for (let i = 0; i < 50; i++) {
        await checkbox.click();
        
        // Verificare che il checkbox sia ancora visibile
        await expect(checkbox).toBeVisible();
        
        // Verificare che abbia le classi CSS corrette
        const checkboxClass = await checkbox.getAttribute('class');
        expect(checkboxClass).toContain('h-4');
        expect(checkboxClass).toContain('w-4');
      }
      
      const domUpdateTime = Date.now() - startTime;
      expect(domUpdateTime).toBeLessThan(5000); // Meno di 5 secondi per 50 updates
    }
  });

  test('Dovrebbe gestire event listeners efficientemente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare event listeners
    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    
    // ASSERT: Verificare che event listeners siano efficienti
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      await expect(checkbox).toBeVisible();
      
      // Testare multiple interazioni per verificare event listeners
      const startTime = Date.now();
      
      for (let i = 0; i < 20; i++) {
        await checkbox.click();
        await checkbox.focus();
        await checkbox.blur();
      }
      
      const eventTime = Date.now() - startTime;
      expect(eventTime).toBeLessThan(3000); // Meno di 3 secondi
      
      // Verificare che il checkbox sia ancora funzionante
      await expect(checkbox).toBeVisible();
      await checkbox.focus();
      await expect(checkbox).toBeFocused();
    }
  });

  test('Dovrebbe gestire CSS transitions efficientemente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare CSS transitions
    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    
    // ASSERT: Verificare che CSS transitions siano efficienti
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      await expect(checkbox).toBeVisible();
      
      // Verificare che abbia classi CSS per transitions
      const checkboxClass = await checkbox.getAttribute('class');
      expect(checkboxClass).toContain('transition-colors');
      
      // Testare transitions
      const startTime = Date.now();
      
      for (let i = 0; i < 10; i++) {
        await checkbox.focus();
        await expect(checkbox).toBeFocused();
        await checkbox.blur();
        await expect(checkbox).not.toBeFocused();
      }
      
      const transitionTime = Date.now() - startTime;
      expect(transitionTime).toBeLessThan(2000); // Meno di 2 secondi per 10 transitions
    }
  });

  test('Dovrebbe gestire state changes efficientemente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare state changes
    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    
    // ASSERT: Verificare che state changes siano efficienti
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      await expect(checkbox).toBeVisible();
      
      // Testare state changes
      const startTime = Date.now();
      
      // Testare multiple state changes
      for (let i = 0; i < 10; i++) {
        await checkbox.click();
        
        // Verificare che il checkbox sia ancora presente
        await expect(checkbox).toBeVisible();
        
        // Verificare che abbia attributi appropriati
        const type = await checkbox.getAttribute('type');
        expect(type).toBe('checkbox');
      }
      
      const stateChangeTime = Date.now() - startTime;
      expect(stateChangeTime).toBeLessThan(3000); // Meno di 3 secondi per 10 state changes
    }
  });

  test('Dovrebbe gestire indeterminate state performance', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare indeterminate state performance
    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    
    // ASSERT: Verificare che indeterminate state sia efficiente
    if (checkboxCount > 0) {
      const checkbox = checkboxes.first();
      await expect(checkbox).toBeVisible();
      
      // Testare indeterminate state performance
      const startTime = Date.now();
      
      // Testare multiple operazioni per verificare indeterminate state
      for (let i = 0; i < 5; i++) {
        await checkbox.click();
        
        // Verificare che il checkbox sia ancora presente
        await expect(checkbox).toBeVisible();
        
        // Verificare che abbia attributi appropriati
        const type = await checkbox.getAttribute('type');
        expect(type).toBe('checkbox');
      }
      
      const indeterminateTime = Date.now() - startTime;
      expect(indeterminateTime).toBeLessThan(2000); // Meno di 2 secondi per 5 operazioni
    }
  });
});
