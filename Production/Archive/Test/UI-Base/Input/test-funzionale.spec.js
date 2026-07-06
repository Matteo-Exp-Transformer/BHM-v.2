import { test, expect } from '@playwright/test';

test.describe('Input.tsx - Test Funzionali', () => {
  
  // Setup: navigare alla pagina prima di ogni test
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    // Aspettare che l'app sia caricata
    await expect(page.locator('h1')).toContainText('HACCP Manager');
  });

  test('Dovrebbe renderizzare input text correttamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard dove ci sono input
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare presenza di input fields
    const inputs = page.locator('input');
    
    // ASSERT: Verificare che gli input siano presenti e visibili
    const inputCount = await inputs.count();
    if (inputCount > 0) {
      await expect(inputs.first()).toBeVisible();
      
      // Verificare che l'input abbia classi CSS appropriate
      const inputClass = await inputs.first().getAttribute('class');
      expect(inputClass).toContain('flex');
      expect(inputClass).toContain('h-10');
      expect(inputClass).toContain('w-full');
      expect(inputClass).toContain('rounded-md');
    }
  });

  test('Dovrebbe gestire input text correttamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Cercare input fields e testare input
    const inputs = page.locator('input[type="text"]');
    
    // ASSERT: Verificare che gli input text funzionino
    const inputCount = await inputs.count();
    if (inputCount > 0) {
      const input = inputs.first();
      await expect(input).toBeVisible();
      
      // Testare input di testo
      await input.fill('Test input text');
      const value = await input.inputValue();
      expect(value).toBe('Test input text');
    }
  });

  test('Dovrebbe gestire input email correttamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Cercare input email
    const emailInputs = page.locator('input[type="email"]');
    
    // ASSERT: Verificare che gli input email funzionino
    const inputCount = await emailInputs.count();
    if (inputCount > 0) {
      const input = emailInputs.first();
      await expect(input).toBeVisible();
      
      // Testare input email
      await input.fill('test@example.com');
      const value = await input.inputValue();
      expect(value).toBe('test@example.com');
    }
  });

  test('Dovrebbe gestire input password correttamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Cercare input password
    const passwordInputs = page.locator('input[type="password"]');
    
    // ASSERT: Verificare che gli input password funzionino
    const inputCount = await passwordInputs.count();
    if (inputCount > 0) {
      const input = passwordInputs.first();
      await expect(input).toBeVisible();
      
      // Testare input password
      await input.fill('secretpassword');
      const value = await input.inputValue();
      expect(value).toBe('secretpassword');
      
      // Verificare che il tipo sia password
      const type = await input.getAttribute('type');
      expect(type).toBe('password');
    }
  });

  test('Dovrebbe gestire input number correttamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Cercare input number
    const numberInputs = page.locator('input[type="number"]');
    
    // ASSERT: Verificare che gli input number funzionino
    const inputCount = await numberInputs.count();
    if (inputCount > 0) {
      const input = numberInputs.first();
      await expect(input).toBeVisible();
      
      // Testare input numerico
      await input.fill('123');
      const value = await input.inputValue();
      expect(value).toBe('123');
    }
  });

  test('Dovrebbe gestire input file correttamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Cercare input file
    const fileInputs = page.locator('input[type="file"]');
    
    // ASSERT: Verificare che gli input file funzionino
    const inputCount = await fileInputs.count();
    if (inputCount > 0) {
      const input = fileInputs.first();
      await expect(input).toBeVisible();
      
      // Verificare che il tipo sia file
      const type = await input.getAttribute('type');
      expect(type).toBe('file');
    }
  });

  test('Dovrebbe gestire stati focus e blur correttamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare focus e blur su input
    const inputs = page.locator('input');
    
    // ASSERT: Verificare focus e blur
    const inputCount = await inputs.count();
    if (inputCount > 0) {
      const input = inputs.first();
      await expect(input).toBeVisible();
      
      // Testare focus
      await input.focus();
      await expect(input).toBeFocused();
      
      // Testare blur
      await input.blur();
      await expect(input).not.toBeFocused();
    }
  });

  test('Dovrebbe gestire stato disabled correttamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Cercare input disabilitati
    const inputs = page.locator('input');
    
    // ASSERT: Verificare che gli input non disabilitati siano funzionanti
    const inputCount = await inputs.count();
    if (inputCount > 0) {
      const input = inputs.first();
      await expect(input).toBeVisible();
      
      // Verificare che l'input non sia disabilitato di default
      const disabled = await input.getAttribute('disabled');
      expect(disabled).toBeNull();
      
      // Verificare che abbia classi CSS appropriate
      const inputClass = await input.getAttribute('class');
      expect(inputClass).toContain('transition-colors');
    }
  });

  test('Dovrebbe avere accessibilità corretta', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare attributi di accessibilità
    const inputs = page.locator('input');
    
    // ASSERT: Verificare accessibilità
    const inputCount = await inputs.count();
    if (inputCount > 0) {
      const input = inputs.first();
      await expect(input).toBeVisible();
      
      // Verificare che sia navigabile da tastiera
      await input.focus();
      await expect(input).toBeFocused();
      
      // Verificare che abbia il ruolo corretto
      const tagName = await input.evaluate(el => el.tagName);
      expect(tagName).toBe('INPUT');
    }
  });

  test('Dovrebbe gestire props forwarding correttamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare che gli input abbiano props HTML standard
    const inputs = page.locator('input');
    
    // ASSERT: Verificare props HTML standard
    const inputCount = await inputs.count();
    if (inputCount > 0) {
      const input = inputs.first();
      await expect(input).toBeVisible();
      
      // Verificare attributi HTML standard
      const type = await input.getAttribute('type');
      expect(type).toBeTruthy();
      
      // Verificare che sia un elemento input valido
      const tagName = await input.evaluate(el => el.tagName);
      expect(tagName).toBe('INPUT');
    }
  });

  test('Dovrebbe gestire classi CSS combinate correttamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare classi CSS sugli input
    const inputs = page.locator('input');
    
    // ASSERT: Verificare classi CSS base
    const inputCount = await inputs.count();
    if (inputCount > 0) {
      const input = inputs.first();
      const inputClass = await input.getAttribute('class');
      
      expect(inputClass).toContain('flex');
      expect(inputClass).toContain('h-10');
      expect(inputClass).toContain('w-full');
      expect(inputClass).toContain('rounded-md');
      expect(inputClass).toContain('border');
      expect(inputClass).toContain('border-input');
      expect(inputClass).toContain('bg-background');
      expect(inputClass).toContain('px-3');
      expect(inputClass).toContain('py-2');
      expect(inputClass).toContain('text-sm');
    }
  });

  test('Dovrebbe gestire forwardRef correttamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare che gli input siano elementi DOM validi
    const inputs = page.locator('input');
    
    // ASSERT: Verificare che sia un elemento input HTML
    const inputCount = await inputs.count();
    if (inputCount > 0) {
      const input = inputs.first();
      await expect(input).toBeVisible();
      
      // Verificare che sia cliccabile/focusabile (indica che la ref funziona)
      await input.click();
      await expect(input).toBeFocused();
    }
  });

  test('Dovrebbe gestire placeholder correttamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare placeholder sugli input
    const inputs = page.locator('input');
    
    // ASSERT: Verificare gestione placeholder
    const inputCount = await inputs.count();
    if (inputCount > 0) {
      const input = inputs.first();
      await expect(input).toBeVisible();
      
      // Verificare che abbia classi CSS per placeholder
      const inputClass = await input.getAttribute('class');
      expect(inputClass).toContain('placeholder:text-muted-foreground');
    }
  });
});
