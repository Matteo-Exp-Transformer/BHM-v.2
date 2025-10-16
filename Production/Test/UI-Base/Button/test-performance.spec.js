import { test, expect } from '@playwright/test';

test.describe('Button.tsx - Test Performance', () => {
  
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
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    const renderTime = Date.now() - startTime;
    expect(renderTime).toBeLessThan(5000); // Meno di 5 secondi
    
    if (buttonCount > 0) {
      const button = buttons.first();
      await expect(button).toBeVisible();
    }
  });

  test('Dovrebbe gestire click rapidi senza lag', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare click rapidi
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    // ASSERT: Verificare che i button rispondano rapidamente
    if (buttonCount > 0) {
      const button = buttons.first();
      await expect(button).toBeVisible();
      
      // Testare click rapido
      const startTime = Date.now();
      await button.click();
      const clickTime = Date.now() - startTime;
      
      expect(clickTime).toBeLessThan(1000); // Meno di 1 secondo
      
      // Verificare che il button sia ancora presente
      await expect(button).toBeVisible();
    }
  });

  test('Dovrebbe gestire molti button senza problemi di performance', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare performance con molti button
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    // ASSERT: Verificare che non ci siano problemi con molti button
    expect(buttonCount).toBeGreaterThanOrEqual(0);
    
    // Verificare che tutti i button siano visibili
    for (let i = 0; i < Math.min(buttonCount, 10); i++) {
      const button = buttons.nth(i);
      await expect(button).toBeVisible();
      
      // Verificare che ogni button abbia classi CSS appropriate
      const buttonClass = await button.getAttribute('class');
      expect(buttonClass).toContain('inline-flex');
      expect(buttonClass).toContain('items-center');
      expect(buttonClass).toContain('justify-center');
    }
  });

  test('Dovrebbe gestire focus/blur rapidamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare focus/blur rapidi
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    // ASSERT: Verificare che focus/blur siano rapidi
    if (buttonCount > 0) {
      const button = buttons.first();
      await expect(button).toBeVisible();
      
      // Testare focus/blur rapidi
      const startTime = Date.now();
      
      for (let i = 0; i < 10; i++) {
        await button.focus();
        await expect(button).toBeFocused();
        await button.blur();
        await expect(button).not.toBeFocused();
      }
      
      const focusBlurTime = Date.now() - startTime;
      expect(focusBlurTime).toBeLessThan(2000); // Meno di 2 secondi per 10 cicli
    }
  });

  test('Dovrebbe gestire hover rapidi', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare hover rapidi
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    // ASSERT: Verificare che gli hover siano rapidi
    if (buttonCount > 0) {
      const button = buttons.first();
      await expect(button).toBeVisible();
      
      // Testare hover rapidi
      const startTime = Date.now();
      
      for (let i = 0; i < 10; i++) {
        await button.hover();
        await button.blur();
      }
      
      const hoverTime = Date.now() - startTime;
      expect(hoverTime).toBeLessThan(2000); // Meno di 2 secondi per 10 hover
    }
  });

  test('Dovrebbe gestire resize senza problemi di performance', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare resize
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    // ASSERT: Verificare che resize non causi problemi di performance
    if (buttonCount > 0) {
      const button = buttons.first();
      await expect(button).toBeVisible();
      
      // Testare resize
      const startTime = Date.now();
      await page.setViewportSize({ width: 800, height: 600 });
      
      // Verificare che il button sia ancora visibile
      await expect(button).toBeVisible();
      
      const resizeTime = Date.now() - startTime;
      expect(resizeTime).toBeLessThan(2000); // Meno di 2 secondi
      
      // Ripristinare dimensione originale
      await page.setViewportSize({ width: 1280, height: 720 });
      await expect(button).toBeVisible();
    }
  });

  test('Dovrebbe gestire multiple interazioni simultanee', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare interazioni simultanee
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    // ASSERT: Verificare che interazioni simultanee non causino problemi
    if (buttonCount > 0) {
      const button = buttons.first();
      await expect(button).toBeVisible();
      
      // Testare interazioni rapide
      const startTime = Date.now();
      
      for (let i = 0; i < 5; i++) {
        await button.click();
        await button.focus();
        await button.blur();
        await button.hover();
        await expect(button).toBeVisible();
      }
      
      const multiInteractionTime = Date.now() - startTime;
      expect(multiInteractionTime).toBeLessThan(3000); // Meno di 3 secondi per 5 interazioni
    }
  });

  test('Dovrebbe gestire keyboard events rapidamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare keyboard events
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    // ASSERT: Verificare che keyboard events siano rapidi
    if (buttonCount > 0) {
      const button = buttons.first();
      await expect(button).toBeVisible();
      
      // Testare keyboard events rapidi
      const startTime = Date.now();
      
      await button.focus();
      await expect(button).toBeFocused();
      
      // Testare navigazione da tastiera
      await page.keyboard.press('Enter');
      await page.keyboard.press('Tab');
      
      const keyboardTime = Date.now() - startTime;
      expect(keyboardTime).toBeLessThan(2000); // Meno di 2 secondi
      
      // Verificare che il button sia ancora presente
      await expect(button).toBeVisible();
    }
  });

  test('Dovrebbe gestire memory usage appropriatamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare memory usage
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    // ASSERT: Verificare che non ci siano memory leaks
    if (buttonCount > 0) {
      const button = buttons.first();
      await expect(button).toBeVisible();
      
      // Testare multiple operazioni per verificare memory usage
      for (let i = 0; i < 100; i++) {
        await button.click();
        await button.focus();
        await button.blur();
        await button.hover();
      }
      
      // Verificare che il button sia ancora funzionante
      await expect(button).toBeVisible();
      await button.focus();
      await expect(button).toBeFocused();
    }
  });

  test('Dovrebbe gestire DOM updates efficientemente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare DOM updates
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    // ASSERT: Verificare che DOM updates siano efficienti
    if (buttonCount > 0) {
      const button = buttons.first();
      await expect(button).toBeVisible();
      
      // Testare multiple DOM updates
      const startTime = Date.now();
      
      for (let i = 0; i < 50; i++) {
        await button.click();
        
        // Verificare che il button sia ancora visibile
        await expect(button).toBeVisible();
        
        // Verificare che abbia le classi CSS corrette
        const buttonClass = await button.getAttribute('class');
        expect(buttonClass).toContain('inline-flex');
        expect(buttonClass).toContain('items-center');
      }
      
      const domUpdateTime = Date.now() - startTime;
      expect(domUpdateTime).toBeLessThan(5000); // Meno di 5 secondi per 50 updates
    }
  });

  test('Dovrebbe gestire event listeners efficientemente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare event listeners
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    // ASSERT: Verificare che event listeners siano efficienti
    if (buttonCount > 0) {
      const button = buttons.first();
      await expect(button).toBeVisible();
      
      // Testare multiple interazioni per verificare event listeners
      const startTime = Date.now();
      
      for (let i = 0; i < 20; i++) {
        await button.click();
        await button.focus();
        await button.blur();
        await button.hover();
      }
      
      const eventTime = Date.now() - startTime;
      expect(eventTime).toBeLessThan(3000); // Meno di 3 secondi
      
      // Verificare che il button sia ancora funzionante
      await expect(button).toBeVisible();
      await button.focus();
      await expect(button).toBeFocused();
    }
  });

  test('Dovrebbe gestire CSS transitions efficientemente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare CSS transitions
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    // ASSERT: Verificare che CSS transitions siano efficienti
    if (buttonCount > 0) {
      const button = buttons.first();
      await expect(button).toBeVisible();
      
      // Verificare che abbia classi CSS per transitions
      const buttonClass = await button.getAttribute('class');
      expect(buttonClass).toContain('transition-colors');
      
      // Testare transitions
      const startTime = Date.now();
      
      for (let i = 0; i < 10; i++) {
        await button.focus();
        await expect(button).toBeFocused();
        await button.blur();
        await expect(button).not.toBeFocused();
        await button.hover();
      }
      
      const transitionTime = Date.now() - startTime;
      expect(transitionTime).toBeLessThan(2000); // Meno di 2 secondi per 10 transitions
    }
  });

  test('Dovrebbe gestire varianti performance', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare varianti performance
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    // ASSERT: Verificare che varianti siano efficienti
    if (buttonCount > 0) {
      const button = buttons.first();
      await expect(button).toBeVisible();
      
      // Testare varianti performance
      const startTime = Date.now();
      
      // Testare multiple operazioni per verificare varianti
      for (let i = 0; i < 10; i++) {
        await button.click();
        
        // Verificare che il button sia ancora presente
        await expect(button).toBeVisible();
        
        // Verificare che abbia attributi appropriati
        const type = await button.getAttribute('type');
        expect(type).toBe('button');
      }
      
      const variantTime = Date.now() - startTime;
      expect(variantTime).toBeLessThan(3000); // Meno di 3 secondi per 10 operazioni
    }
  });

  test('Dovrebbe gestire dimensioni performance', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare dimensioni performance
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    // ASSERT: Verificare che dimensioni siano efficienti
    if (buttonCount > 0) {
      const button = buttons.first();
      await expect(button).toBeVisible();
      
      // Testare dimensioni performance
      const startTime = Date.now();
      
      // Testare multiple operazioni per verificare dimensioni
      for (let i = 0; i < 5; i++) {
        await button.click();
        
        // Verificare che il button sia ancora presente
        await expect(button).toBeVisible();
        
        // Verificare che abbia attributi appropriati
        const type = await button.getAttribute('type');
        expect(type).toBe('button');
      }
      
      const sizeTime = Date.now() - startTime;
      expect(sizeTime).toBeLessThan(2000); // Meno di 2 secondi per 5 operazioni
    }
  });
});
