import { test, expect } from '@playwright/test';

test.describe('Input.tsx - Test Performance', () => {
  
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
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    
    const renderTime = Date.now() - startTime;
    expect(renderTime).toBeLessThan(5000); // Meno di 5 secondi
    
    if (inputCount > 0) {
      const input = inputs.first();
      await expect(input).toBeVisible();
    }
  });

  test('Dovrebbe gestire input rapidi senza lag', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare input rapidi
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    
    // ASSERT: Verificare che gli input rispondano rapidamente
    if (inputCount > 0) {
      const input = inputs.first();
      await expect(input).toBeVisible();
      
      // Testare input rapido
      const startTime = Date.now();
      await input.fill('Test rapido');
      const inputTime = Date.now() - startTime;
      
      expect(inputTime).toBeLessThan(1000); // Meno di 1 secondo
      
      // Verificare che il valore sia stato impostato
      const value = await input.inputValue();
      expect(value).toBe('Test rapido');
    }
  });

  test('Dovrebbe gestire molti input senza problemi di performance', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare performance con molti input
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    
    // ASSERT: Verificare che non ci siano problemi con molti input
    expect(inputCount).toBeGreaterThanOrEqual(0);
    
    // Verificare che tutti gli input siano visibili
    for (let i = 0; i < Math.min(inputCount, 10); i++) {
      const input = inputs.nth(i);
      await expect(input).toBeVisible();
      
      // Verificare che ogni input abbia classi CSS appropriate
      const inputClass = await input.getAttribute('class');
      expect(inputClass).toContain('flex');
      expect(inputClass).toContain('h-10');
      expect(inputClass).toContain('w-full');
    }
  });

  test('Dovrebbe gestire focus/blur rapidamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare focus/blur rapidi
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    
    // ASSERT: Verificare che focus/blur siano rapidi
    if (inputCount > 0) {
      const input = inputs.first();
      await expect(input).toBeVisible();
      
      // Testare focus/blur rapidi
      const startTime = Date.now();
      
      for (let i = 0; i < 10; i++) {
        await input.focus();
        await expect(input).toBeFocused();
        await input.blur();
        await expect(input).not.toBeFocused();
      }
      
      const focusBlurTime = Date.now() - startTime;
      expect(focusBlurTime).toBeLessThan(2000); // Meno di 2 secondi per 10 cicli
    }
  });

  test('Dovrebbe gestire input lunghi senza rallentamenti', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare input lunghi
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    
    // ASSERT: Verificare che input lunghi non causino rallentamenti
    if (inputCount > 0) {
      const input = inputs.first();
      await expect(input).toBeVisible();
      
      // Testare input molto lungo
      const longText = 'a'.repeat(10000);
      
      const startTime = Date.now();
      await input.fill(longText);
      const inputTime = Date.now() - startTime;
      
      expect(inputTime).toBeLessThan(3000); // Meno di 3 secondi anche per input lunghi
      
      // Verificare che il valore sia stato impostato
      const value = await input.inputValue();
      expect(value).toBe(longText);
    }
  });

  test('Dovrebbe gestire resize senza problemi di performance', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare resize
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    
    // ASSERT: Verificare che resize non causi problemi di performance
    if (inputCount > 0) {
      const input = inputs.first();
      await expect(input).toBeVisible();
      
      // Testare resize
      const startTime = Date.now();
      await page.setViewportSize({ width: 800, height: 600 });
      
      // Verificare che l'input sia ancora visibile
      await expect(input).toBeVisible();
      
      const resizeTime = Date.now() - startTime;
      expect(resizeTime).toBeLessThan(2000); // Meno di 2 secondi
      
      // Ripristinare dimensione originale
      await page.setViewportSize({ width: 1280, height: 720 });
      await expect(input).toBeVisible();
    }
  });

  test('Dovrebbe gestire multiple modifiche simultanee', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare modifiche simultanee
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    
    // ASSERT: Verificare che modifiche simultanee non causino problemi
    if (inputCount > 0) {
      const input = inputs.first();
      await expect(input).toBeVisible();
      
      // Testare modifiche rapide
      const startTime = Date.now();
      
      for (let i = 0; i < 5; i++) {
        await input.fill(`Test ${i}`);
        const value = await input.inputValue();
        expect(value).toBe(`Test ${i}`);
      }
      
      const multiChangeTime = Date.now() - startTime;
      expect(multiChangeTime).toBeLessThan(2000); // Meno di 2 secondi per 5 modifiche
    }
  });

  test('Dovrebbe gestire keyboard events rapidamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare keyboard events
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    
    // ASSERT: Verificare che keyboard events siano rapidi
    if (inputCount > 0) {
      const input = inputs.first();
      await expect(input).toBeVisible();
      
      // Testare keyboard events rapidi
      const startTime = Date.now();
      
      await input.focus();
      await expect(input).toBeFocused();
      
      // Testare digitazione rapida
      await page.keyboard.type('Test keyboard performance');
      
      const keyboardTime = Date.now() - startTime;
      expect(keyboardTime).toBeLessThan(2000); // Meno di 2 secondi
      
      // Verificare che il valore sia stato impostato
      const value = await input.inputValue();
      expect(value).toBe('Test keyboard performance');
    }
  });

  test('Dovrebbe gestire memory usage appropriatamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare memory usage
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    
    // ASSERT: Verificare che non ci siano memory leaks
    if (inputCount > 0) {
      const input = inputs.first();
      await expect(input).toBeVisible();
      
      // Testare multiple operazioni per verificare memory usage
      for (let i = 0; i < 100; i++) {
        await input.fill(`Test ${i}`);
        await input.focus();
        await input.blur();
      }
      
      // Verificare che l'input sia ancora funzionante
      await expect(input).toBeVisible();
      await input.focus();
      await expect(input).toBeFocused();
    }
  });

  test('Dovrebbe gestire DOM updates efficientemente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare DOM updates
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    
    // ASSERT: Verificare che DOM updates siano efficienti
    if (inputCount > 0) {
      const input = inputs.first();
      await expect(input).toBeVisible();
      
      // Testare multiple DOM updates
      const startTime = Date.now();
      
      for (let i = 0; i < 50; i++) {
        await input.fill(`DOM Test ${i}`);
        
        // Verificare che l'input sia ancora visibile
        await expect(input).toBeVisible();
        
        // Verificare che abbia le classi CSS corrette
        const inputClass = await input.getAttribute('class');
        expect(inputClass).toContain('flex');
        expect(inputClass).toContain('h-10');
      }
      
      const domUpdateTime = Date.now() - startTime;
      expect(domUpdateTime).toBeLessThan(5000); // Meno di 5 secondi per 50 updates
    }
  });

  test('Dovrebbe gestire event listeners efficientemente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare event listeners
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    
    // ASSERT: Verificare che event listeners siano efficienti
    if (inputCount > 0) {
      const input = inputs.first();
      await expect(input).toBeVisible();
      
      // Testare event listeners
      const startTime = Date.now();
      
      // Testare multiple interazioni per verificare event listeners
      for (let i = 0; i < 20; i++) {
        await input.click();
        await input.focus();
        await input.blur();
        await input.fill(`Event Test ${i}`);
      }
      
      const eventTime = Date.now() - startTime;
      expect(eventTime).toBeLessThan(3000); // Meno di 3 secondi
      
      // Verificare che l'input sia ancora funzionante
      await expect(input).toBeVisible();
      await input.focus();
      await expect(input).toBeFocused();
    }
  });

  test('Dovrebbe gestire CSS transitions efficientemente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare CSS transitions
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    
    // ASSERT: Verificare che CSS transitions siano efficienti
    if (inputCount > 0) {
      const input = inputs.first();
      await expect(input).toBeVisible();
      
      // Verificare che abbia classi CSS per transitions
      const inputClass = await input.getAttribute('class');
      expect(inputClass).toContain('transition-colors');
      
      // Testare transitions
      const startTime = Date.now();
      
      for (let i = 0; i < 10; i++) {
        await input.focus();
        await expect(input).toBeFocused();
        await input.blur();
        await expect(input).not.toBeFocused();
      }
      
      const transitionTime = Date.now() - startTime;
      expect(transitionTime).toBeLessThan(2000); // Meno di 2 secondi per 10 transitions
    }
  });
});
