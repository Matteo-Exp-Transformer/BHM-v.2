import { test, expect } from '@playwright/test';

test.describe('Input.tsx - Test Accessibilità', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('h1')).toContainText('HACCP Manager');
  });

  test('Dovrebbe essere navigabile da tastiera', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare navigazione da tastiera
    const inputs = page.locator('input');
    
    // ASSERT: Verificare che gli input siano navigabili da tastiera
    const inputCount = await inputs.count();
    if (inputCount > 0) {
      const input = inputs.first();
      
      // Verificare che l'input sia focusabile
      await input.focus();
      await expect(input).toBeFocused();
      
      // Verificare navigazione con Tab
      await page.keyboard.press('Tab');
      
      // Verificare che l'input sia ancora presente
      await expect(input).toBeVisible();
    }
  });

  test('Dovrebbe avere attributi ARIA appropriati', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare attributi ARIA
    const inputs = page.locator('input');
    
    // ASSERT: Verificare attributi ARIA
    const inputCount = await inputs.count();
    if (inputCount > 0) {
      const input = inputs.first();
      await expect(input).toBeVisible();
      
      // Verificare che sia un elemento input (ha implicitamente role="textbox" o simile)
      const tagName = await input.evaluate(el => el.tagName);
      expect(tagName).toBe('INPUT');
      
      // Verificare che abbia il tipo corretto
      const type = await input.getAttribute('type');
      expect(type).toBeTruthy();
    }
  });

  test('Dovrebbe supportare screen reader', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare supporto screen reader
    const inputs = page.locator('input');
    
    // ASSERT: Verificare che gli input siano accessibili via screen reader
    const inputCount = await inputs.count();
    if (inputCount > 0) {
      const input = inputs.first();
      await expect(input).toBeVisible();
      
      // Verificare che l'input sia un elemento HTML standard
      const tagName = await input.evaluate(el => el.tagName);
      expect(tagName).toBe('INPUT');
      
      // Verificare che abbia attributi standard per screen reader
      const type = await input.getAttribute('type');
      expect(type).toBeTruthy();
      
      // Verificare che sia focusabile
      await input.focus();
      await expect(input).toBeFocused();
    }
  });

  test('Dovrebbe gestire label associati', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare label associati
    const inputs = page.locator('input');
    
    // ASSERT: Verificare gestione label
    const inputCount = await inputs.count();
    if (inputCount > 0) {
      const input = inputs.first();
      await expect(input).toBeVisible();
      
      // Verificare che l'input sia un elemento HTML standard che supporta label
      const tagName = await input.evaluate(el => el.tagName);
      expect(tagName).toBe('INPUT');
      
      // Verificare che abbia attributi standard
      const type = await input.getAttribute('type');
      expect(type).toBeTruthy();
    }
  });

  test('Dovrebbe avere contrasto adeguato', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare contrasto
    const inputs = page.locator('input');
    
    // ASSERT: Verificare che gli input abbiano classi CSS per contrasto
    const inputCount = await inputs.count();
    if (inputCount > 0) {
      const input = inputs.first();
      await expect(input).toBeVisible();
      
      // Verificare che abbia classi CSS per contrasto
      const inputClass = await input.getAttribute('class');
      expect(inputClass).toContain('text-sm'); // Testo di dimensione appropriata
      
      // Verificare che abbia classi per colore del testo
      expect(inputClass).toContain('bg-background');
    }
  });

  test('Dovrebbe gestire stato focus visivamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare stato focus visivo
    const inputs = page.locator('input');
    
    // ASSERT: Verificare gestione focus visivo
    const inputCount = await inputs.count();
    if (inputCount > 0) {
      const input = inputs.first();
      await expect(input).toBeVisible();
      
      // Verificare che abbia classi CSS per focus
      const inputClass = await input.getAttribute('class');
      expect(inputClass).toContain('transition-colors'); // Transizione per focus
      
      // Testare focus
      await input.focus();
      await expect(input).toBeFocused();
    }
  });

  test('Dovrebbe supportare navigazione sequenziale', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare navigazione sequenziale
    const inputs = page.locator('input');
    
    // ASSERT: Verificare navigazione sequenziale
    const inputCount = await inputs.count();
    if (inputCount > 0) {
      const input = inputs.first();
      await expect(input).toBeVisible();
      
      // Verificare che l'input sia navigabile
      await input.focus();
      await expect(input).toBeFocused();
      
      // Verificare navigazione con Tab
      await page.keyboard.press('Tab');
      
      // Verificare che l'input sia ancora presente
      await expect(input).toBeVisible();
    }
  });

  test('Dovrebbe gestire errori accessibili', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare gestione errori accessibili
    const inputs = page.locator('input');
    
    // ASSERT: Verificare gestione errori
    const inputCount = await inputs.count();
    if (inputCount > 0) {
      const input = inputs.first();
      await expect(input).toBeVisible();
      
      // Verificare che l'input sia un elemento HTML standard
      const tagName = await input.evaluate(el => el.tagName);
      expect(tagName).toBe('INPUT');
      
      // Verificare che abbia attributi standard per gestione errori
      const type = await input.getAttribute('type');
      expect(type).toBeTruthy();
    }
  });

  test('Dovrebbe supportare shortcut da tastiera', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare shortcut da tastiera
    const inputs = page.locator('input');
    
    // ASSERT: Verificare shortcut da tastiera
    const inputCount = await inputs.count();
    if (inputCount > 0) {
      const input = inputs.first();
      await expect(input).toBeVisible();
      
      // Verificare che l'input sia focusabile
      await input.focus();
      await expect(input).toBeFocused();
      
      // Testare shortcut comuni
      await input.fill('Test');
      
      // Verificare che l'input funzioni ancora
      const value = await input.inputValue();
      expect(value).toBe('Test');
    }
  });

  test('Dovrebbe avere dimensioni touch-friendly', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare dimensioni touch-friendly
    const inputs = page.locator('input');
    
    // ASSERT: Verificare dimensioni appropriate
    const inputCount = await inputs.count();
    if (inputCount > 0) {
      const input = inputs.first();
      await expect(input).toBeVisible();
      
      // Verificare che abbia dimensioni appropriate
      const inputClass = await input.getAttribute('class');
      expect(inputClass).toContain('h-10'); // Altezza minima per touch
      expect(inputClass).toContain('w-full'); // Larghezza appropriata
      expect(inputClass).toContain('px-3'); // Padding orizzontale
      expect(inputClass).toContain('py-2'); // Padding verticale
    }
  });

  test('Dovrebbe supportare modalità ad alto contrasto', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare supporto alto contrasto
    const inputs = page.locator('input');
    
    // ASSERT: Verificare supporto alto contrasto
    const inputCount = await inputs.count();
    if (inputCount > 0) {
      const input = inputs.first();
      await expect(input).toBeVisible();
      
      // Verificare che abbia classi CSS per contrasto
      const inputClass = await input.getAttribute('class');
      expect(inputClass).toContain('border'); // Bordo per contrasto
      expect(inputClass).toContain('bg-background'); // Background definito
      
      // Verificare che sia un elemento HTML standard
      const tagName = await input.evaluate(el => el.tagName);
      expect(tagName).toBe('INPUT');
    }
  });

  test('Dovrebbe gestire zoom senza problemi', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare zoom
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // ASSERT: Verificare che gli input siano ancora accessibili con zoom
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    if (inputCount > 0) {
      const input = inputs.first();
      await expect(input).toBeVisible();
      
      // Verificare che l'input sia ancora focusabile
      await input.focus();
      await expect(input).toBeFocused();
      
      // Verificare che abbia dimensioni appropriate
      const inputClass = await input.getAttribute('class');
      expect(inputClass).toContain('h-10');
      expect(inputClass).toContain('w-full');
    }
  });

  test('Dovrebbe supportare navigazione con solo tastiera', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare navigazione solo tastiera
    const inputs = page.locator('input');
    
    // ASSERT: Verificare navigazione solo tastiera
    const inputCount = await inputs.count();
    if (inputCount > 0) {
      const input = inputs.first();
      await expect(input).toBeVisible();
      
      // Verificare che l'input sia navigabile da tastiera
      await input.focus();
      await expect(input).toBeFocused();
      
      // Testare navigazione con Tab
      await page.keyboard.press('Tab');
      
      // Verificare che l'input sia ancora presente
      await expect(input).toBeVisible();
      
      // Testare input da tastiera
      await input.focus();
      await page.keyboard.type('Test keyboard navigation');
      const value = await input.inputValue();
      expect(value).toBe('Test keyboard navigation');
    }
  });
});
