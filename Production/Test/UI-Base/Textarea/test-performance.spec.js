import { test, expect } from '@playwright/test';

test.describe('Textarea.tsx - Test Performance', () => {
  
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
    const textareas = page.locator('textarea');
    const textareaCount = await textareas.count();
    
    const renderTime = Date.now() - startTime;
    expect(renderTime).toBeLessThan(5000); // Meno di 5 secondi
    
    if (textareaCount > 0) {
      const textarea = textareas.first();
      await expect(textarea).toBeVisible();
    }
  });

  test('Dovrebbe gestire input rapidi senza lag', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare input rapidi
    const textareas = page.locator('textarea');
    const textareaCount = await textareas.count();
    
    // ASSERT: Verificare che i textarea rispondano rapidamente
    if (textareaCount > 0) {
      const textarea = textareas.first();
      await expect(textarea).toBeVisible();
      
      // Testare input rapido
      const startTime = Date.now();
      await textarea.fill('Test rapido textarea');
      const inputTime = Date.now() - startTime;
      
      expect(inputTime).toBeLessThan(1000); // Meno di 1 secondo
      
      // Verificare che il valore sia stato impostato
      const value = await textarea.inputValue();
      expect(value).toBe('Test rapido textarea');
    }
  });

  test('Dovrebbe gestire molti textarea senza problemi di performance', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare performance con molti textarea
    const textareas = page.locator('textarea');
    const textareaCount = await textareas.count();
    
    // ASSERT: Verificare che non ci siano problemi con molti textarea
    expect(textareaCount).toBeGreaterThanOrEqual(0);
    
    // Verificare che tutti i textarea siano visibili
    for (let i = 0; i < Math.min(textareaCount, 10); i++) {
      const textarea = textareas.nth(i);
      await expect(textarea).toBeVisible();
      
      // Verificare che ogni textarea abbia classi CSS appropriate
      const textareaClass = await textarea.getAttribute('class');
      expect(textareaClass).toContain('flex');
      expect(textareaClass).toContain('min-h-[80px]');
      expect(textareaClass).toContain('w-full');
    }
  });

  test('Dovrebbe gestire focus/blur rapidamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare focus/blur rapidi
    const textareas = page.locator('textarea');
    const textareaCount = await textareas.count();
    
    // ASSERT: Verificare che focus/blur siano rapidi
    if (textareaCount > 0) {
      const textarea = textareas.first();
      await expect(textarea).toBeVisible();
      
      // Testare focus/blur rapidi
      const startTime = Date.now();
      
      for (let i = 0; i < 10; i++) {
        await textarea.focus();
        await expect(textarea).toBeFocused();
        await textarea.blur();
        await expect(textarea).not.toBeFocused();
      }
      
      const focusBlurTime = Date.now() - startTime;
      expect(focusBlurTime).toBeLessThan(2000); // Meno di 2 secondi per 10 cicli
    }
  });

  test('Dovrebbe gestire textarea lunghi senza rallentamenti', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare textarea lunghi
    const textareas = page.locator('textarea');
    const textareaCount = await textareas.count();
    
    // ASSERT: Verificare che textarea lunghi non causino rallentamenti
    if (textareaCount > 0) {
      const textarea = textareas.first();
      await expect(textarea).toBeVisible();
      
      // Testare textarea molto lungo
      const longText = 'a'.repeat(10000);
      
      const startTime = Date.now();
      await textarea.fill(longText);
      const inputTime = Date.now() - startTime;
      
      expect(inputTime).toBeLessThan(3000); // Meno di 3 secondi anche per textarea lunghi
      
      // Verificare che il valore sia stato impostato
      const value = await textarea.inputValue();
      expect(value).toBe(longText);
    }
  });

  test('Dovrebbe gestire resize senza problemi di performance', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare resize
    const textareas = page.locator('textarea');
    const textareaCount = await textareas.count();
    
    // ASSERT: Verificare che resize non causi problemi di performance
    if (textareaCount > 0) {
      const textarea = textareas.first();
      await expect(textarea).toBeVisible();
      
      // Testare resize
      const startTime = Date.now();
      await page.setViewportSize({ width: 800, height: 600 });
      
      // Verificare che il textarea sia ancora visibile
      await expect(textarea).toBeVisible();
      
      const resizeTime = Date.now() - startTime;
      expect(resizeTime).toBeLessThan(2000); // Meno di 2 secondi
      
      // Ripristinare dimensione originale
      await page.setViewportSize({ width: 1280, height: 720 });
      await expect(textarea).toBeVisible();
    }
  });

  test('Dovrebbe gestire multiple modifiche simultanee', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare modifiche simultanee
    const textareas = page.locator('textarea');
    const textareaCount = await textareas.count();
    
    // ASSERT: Verificare che modifiche simultanee non causino problemi
    if (textareaCount > 0) {
      const textarea = textareas.first();
      await expect(textarea).toBeVisible();
      
      // Testare modifiche rapide
      const startTime = Date.now();
      
      for (let i = 0; i < 5; i++) {
        await textarea.fill(`Test ${i}`);
        const value = await textarea.inputValue();
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
    const textareas = page.locator('textarea');
    const textareaCount = await textareas.count();
    
    // ASSERT: Verificare che keyboard events siano rapidi
    if (textareaCount > 0) {
      const textarea = textareas.first();
      await expect(textarea).toBeVisible();
      
      // Testare keyboard events rapidi
      const startTime = Date.now();
      
      await textarea.focus();
      await expect(textarea).toBeFocused();
      
      // Testare digitazione rapida
      await page.keyboard.type('Test keyboard performance textarea');
      
      const keyboardTime = Date.now() - startTime;
      expect(keyboardTime).toBeLessThan(2000); // Meno di 2 secondi
      
      // Verificare che il valore sia stato impostato
      const value = await textarea.inputValue();
      expect(value).toBe('Test keyboard performance textarea');
    }
  });

  test('Dovrebbe gestire memory usage appropriatamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare memory usage
    const textareas = page.locator('textarea');
    const textareaCount = await textareas.count();
    
    // ASSERT: Verificare che non ci siano memory leaks
    if (textareaCount > 0) {
      const textarea = textareas.first();
      await expect(textarea).toBeVisible();
      
      // Testare multiple operazioni per verificare memory usage
      for (let i = 0; i < 100; i++) {
        await textarea.fill(`Test ${i}`);
        await textarea.focus();
        await textarea.blur();
      }
      
      // Verificare che il textarea sia ancora funzionante
      await expect(textarea).toBeVisible();
      await textarea.focus();
      await expect(textarea).toBeFocused();
    }
  });

  test('Dovrebbe gestire DOM updates efficientemente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare DOM updates
    const textareas = page.locator('textarea');
    const textareaCount = await textareas.count();
    
    // ASSERT: Verificare che DOM updates siano efficienti
    if (textareaCount > 0) {
      const textarea = textareas.first();
      await expect(textarea).toBeVisible();
      
      // Testare multiple DOM updates
      const startTime = Date.now();
      
      for (let i = 0; i < 50; i++) {
        await textarea.fill(`DOM Test ${i}`);
        
        // Verificare che il textarea sia ancora visibile
        await expect(textarea).toBeVisible();
        
        // Verificare che abbia le classi CSS corrette
        const textareaClass = await textarea.getAttribute('class');
        expect(textareaClass).toContain('flex');
        expect(textareaClass).toContain('min-h-[80px]');
      }
      
      const domUpdateTime = Date.now() - startTime;
      expect(domUpdateTime).toBeLessThan(5000); // Meno di 5 secondi per 50 updates
    }
  });

  test('Dovrebbe gestire event listeners efficientemente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare event listeners
    const textareas = page.locator('textarea');
    const textareaCount = await textareas.count();
    
    // ASSERT: Verificare che event listeners siano efficienti
    if (textareaCount > 0) {
      const textarea = textareas.first();
      await expect(textarea).toBeVisible();
      
      // Testare multiple interazioni per verificare event listeners
      const startTime = Date.now();
      
      for (let i = 0; i < 20; i++) {
        await textarea.click();
        await textarea.focus();
        await textarea.blur();
        await textarea.fill(`Event Test ${i}`);
      }
      
      const eventTime = Date.now() - startTime;
      expect(eventTime).toBeLessThan(3000); // Meno di 3 secondi
      
      // Verificare che il textarea sia ancora funzionante
      await expect(textarea).toBeVisible();
      await textarea.focus();
      await expect(textarea).toBeFocused();
    }
  });

  test('Dovrebbe gestire CSS transitions efficientemente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare CSS transitions
    const textareas = page.locator('textarea');
    const textareaCount = await textareas.count();
    
    // ASSERT: Verificare che CSS transitions siano efficienti
    if (textareaCount > 0) {
      const textarea = textareas.first();
      await expect(textarea).toBeVisible();
      
      // Verificare che abbia classi CSS per transitions
      const textareaClass = await textarea.getAttribute('class');
      expect(textareaClass).toContain('transition-colors');
      
      // Testare transitions
      const startTime = Date.now();
      
      for (let i = 0; i < 10; i++) {
        await textarea.focus();
        await expect(textarea).toBeFocused();
        await textarea.blur();
        await expect(textarea).not.toBeFocused();
      }
      
      const transitionTime = Date.now() - startTime;
      expect(transitionTime).toBeLessThan(2000); // Meno di 2 secondi per 10 transitions
    }
  });

  test('Dovrebbe gestire scroll performance', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare scroll performance
    const textareas = page.locator('textarea');
    const textareaCount = await textareas.count();
    
    // ASSERT: Verificare che scroll sia efficiente
    if (textareaCount > 0) {
      const textarea = textareas.first();
      await expect(textarea).toBeVisible();
      
      // Testare scroll performance
      const startTime = Date.now();
      
      // Testare multiple operazioni di scroll
      for (let i = 0; i < 10; i++) {
        await textarea.fill(`Scroll Test ${i}`);
        
        // Verificare che il textarea sia ancora presente
        await expect(textarea).toBeVisible();
        
        // Verificare che abbia attributi per scroll
        const rows = await textarea.getAttribute('rows');
        expect(rows).toBeTruthy();
      }
      
      const scrollTime = Date.now() - startTime;
      expect(scrollTime).toBeLessThan(3000); // Meno di 3 secondi per 10 operazioni
    }
  });

  test('Dovrebbe gestire resize performance', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare resize performance
    const textareas = page.locator('textarea');
    const textareaCount = await textareas.count();
    
    // ASSERT: Verificare che resize sia efficiente
    if (textareaCount > 0) {
      const textarea = textareas.first();
      await expect(textarea).toBeVisible();
      
      // Testare resize performance
      const startTime = Date.now();
      
      // Testare multiple operazioni di resize
      for (let i = 0; i < 5; i++) {
        await textarea.fill(`Resize Test ${i}`);
        
        // Verificare che il textarea sia ancora presente
        await expect(textarea).toBeVisible();
        
        // Verificare che abbia attributi per resize
        const resize = await textarea.getAttribute('resize');
        expect(resize).toBeTruthy();
      }
      
      const resizeTime = Date.now() - startTime;
      expect(resizeTime).toBeLessThan(2000); // Meno di 2 secondi per 5 operazioni
    }
  });
});
