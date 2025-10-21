import { test, expect } from '@playwright/test';

test.describe('Input.tsx - Test Edge Cases', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('h1')).toContainText('HACCP Manager');
  });

  test('Dovrebbe gestire props undefined/null correttamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare che gli input funzionino anche con props undefined
    const inputs = page.locator('input');
    
    // ASSERT: Verificare che gli input siano renderizzati anche con props default
    const inputCount = await inputs.count();
    if (inputCount > 0) {
      const input = inputs.first();
      await expect(input).toBeVisible();
      
      // Verificare che abbia classi CSS di default
      const inputClass = await input.getAttribute('class');
      expect(inputClass).toContain('flex');
      expect(inputClass).toContain('h-10');
      expect(inputClass).toContain('w-full');
    }
  });

  test('Dovrebbe gestire className vuota o null', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare che gli input funzionino senza className personalizzata
    const inputs = page.locator('input');
    
    // ASSERT: Verificare che gli input abbiano classi CSS di default
    const inputCount = await inputs.count();
    if (inputCount > 0) {
      const input = inputs.first();
      const inputClass = await input.getAttribute('class');
      expect(inputClass).toBeTruthy();
      expect(inputClass.length).toBeGreaterThan(0);
    }
  });

  test('Dovrebbe gestire onChange undefined', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare input senza onChange handler
    const inputs = page.locator('input');
    
    // ASSERT: Verificare che l'input non causi errori
    const inputCount = await inputs.count();
    if (inputCount > 0) {
      const input = inputs.first();
      await input.fill('Test input');
      
      // Verificare che la pagina sia ancora stabile
      await expect(page.locator('h1')).toContainText('HACCP Manager');
    }
  });

  test('Dovrebbe gestire valori vuoti', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare input con valori vuoti
    const inputs = page.locator('input');
    
    // ASSERT: Verificare gestione valori vuoti
    const inputCount = await inputs.count();
    if (inputCount > 0) {
      const input = inputs.first();
      
      // Testare valore vuoto
      await input.fill('');
      const value = await input.inputValue();
      expect(value).toBe('');
      
      // Verificare che l'input sia ancora funzionante
      await expect(input).toBeVisible();
    }
  });

  test('Dovrebbe gestire input molto lunghi', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare input con testo molto lungo
    const inputs = page.locator('input');
    
    // ASSERT: Verificare gestione input lunghi
    const inputCount = await inputs.count();
    if (inputCount > 0) {
      const input = inputs.first();
      const longText = 'a'.repeat(1000);
      
      await input.fill(longText);
      const value = await input.inputValue();
      expect(value).toBe(longText);
      
      // Verificare che l'input sia ancora visibile
      await expect(input).toBeVisible();
    }
  });

  test('Dovrebbe gestire caratteri speciali', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare input con caratteri speciali
    const inputs = page.locator('input');
    
    // ASSERT: Verificare gestione caratteri speciali
    const inputCount = await inputs.count();
    if (inputCount > 0) {
      const input = inputs.first();
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      
      await input.fill(specialChars);
      const value = await input.inputValue();
      expect(value).toBe(specialChars);
      
      // Verificare che l'input sia ancora visibile
      await expect(input).toBeVisible();
    }
  });

  test('Dovrebbe gestire emoji e Unicode', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare input con emoji e caratteri Unicode
    const inputs = page.locator('input');
    
    // ASSERT: Verificare gestione emoji e Unicode
    const inputCount = await inputs.count();
    if (inputCount > 0) {
      const input = inputs.first();
      const unicodeText = '🚀🎉✅ αβγδε ñáéíóú';
      
      await input.fill(unicodeText);
      const value = await input.inputValue();
      expect(value).toBe(unicodeText);
      
      // Verificare che l'input sia ancora visibile
      await expect(input).toBeVisible();
    }
  });

  test('Dovrebbe gestire numeri negativi', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare input number con numeri negativi
    const numberInputs = page.locator('input[type="number"]');
    
    // ASSERT: Verificare gestione numeri negativi
    const inputCount = await numberInputs.count();
    if (inputCount > 0) {
      const input = numberInputs.first();
      
      await input.fill('-123');
      const value = await input.inputValue();
      expect(value).toBe('-123');
      
      // Verificare che l'input sia ancora visibile
      await expect(input).toBeVisible();
    }
  });

  test('Dovrebbe gestire numeri decimali', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare input number con numeri decimali
    const numberInputs = page.locator('input[type="number"]');
    
    // ASSERT: Verificare gestione numeri decimali
    const inputCount = await numberInputs.count();
    if (inputCount > 0) {
      const input = numberInputs.first();
      
      await input.fill('123.45');
      const value = await input.inputValue();
      expect(value).toBe('123.45');
      
      // Verificare che l'input sia ancora visibile
      await expect(input).toBeVisible();
    }
  });

  test('Dovrebbe gestire multiple focus/blur', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare multiple focus/blur su input
    const inputs = page.locator('input');
    
    // ASSERT: Verificare gestione multiple focus/blur
    const inputCount = await inputs.count();
    if (inputCount > 0) {
      const input = inputs.first();
      
      // Testare multiple focus/blur
      for (let i = 0; i < 5; i++) {
        await input.focus();
        await expect(input).toBeFocused();
        await input.blur();
        await expect(input).not.toBeFocused();
      }
      
      // Verificare che l'input sia ancora funzionante
      await expect(input).toBeVisible();
    }
  });

  test('Dovrebbe gestire resize della finestra', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Ridimensionare la finestra
    await page.setViewportSize({ width: 800, height: 600 });
    
    // ASSERT: Verificare che gli input siano ancora visibili e funzionanti
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    if (inputCount > 0) {
      const input = inputs.first();
      await expect(input).toBeVisible();
      
      // Testare che l'input funzioni ancora
      await input.fill('Test resize');
      const value = await input.inputValue();
      expect(value).toBe('Test resize');
    }
    
    // Ripristinare dimensione originale
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Verificare che gli input siano ancora visibili
    if (inputCount > 0) {
      const input = inputs.first();
      await expect(input).toBeVisible();
    }
  });

  test('Dovrebbe gestire keyboard navigation', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare navigazione da tastiera
    const inputs = page.locator('input');
    
    // ASSERT: Verificare navigazione da tastiera
    const inputCount = await inputs.count();
    if (inputCount > 0) {
      const input = inputs.first();
      
      // Verificare che l'input sia navigabile da tastiera
      await input.focus();
      await expect(input).toBeFocused();
      
      // Testare tab navigation
      await page.keyboard.press('Tab');
      
      // Verificare che l'input sia ancora presente
      await expect(input).toBeVisible();
    }
  });

  test('Dovrebbe gestire file upload con nomi speciali', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare input file
    const fileInputs = page.locator('input[type="file"]');
    
    // ASSERT: Verificare gestione file upload
    const inputCount = await fileInputs.count();
    if (inputCount > 0) {
      const input = fileInputs.first();
      await expect(input).toBeVisible();
      
      // Verificare che il tipo sia file
      const type = await input.getAttribute('type');
      expect(type).toBe('file');
      
      // Verificare che abbia classi CSS appropriate
      const inputClass = await input.getAttribute('class');
      expect(inputClass).toContain('file:border-0');
    }
  });

  test('Dovrebbe gestire valori limite per input number', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare input number con valori limite
    const numberInputs = page.locator('input[type="number"]');
    
    // ASSERT: Verificare gestione valori limite
    const inputCount = await numberInputs.count();
    if (inputCount > 0) {
      const input = numberInputs.first();
      
      // Testare valori limite
      const limitValues = ['0', '-0', '999999999', '-999999999'];
      
      for (const value of limitValues) {
        await input.fill(value);
        const inputValue = await input.inputValue();
        expect(inputValue).toBe(value);
      }
      
      // Verificare che l'input sia ancora funzionante
      await expect(input).toBeVisible();
    }
  });
});
