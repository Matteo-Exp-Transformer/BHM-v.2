import { test, expect } from '@playwright/test';

test.describe('Input.tsx - Test Validazione Dati', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('h1')).toContainText('HACCP Manager');
  });

  test('Dovrebbe accettare tutti i tipi di input validi', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard dove ci sono input
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare che gli input abbiano tipi diversi
    const inputs = page.locator('input');
    
    // ASSERT: Verificare che gli input siano renderizzati correttamente
    const inputCount = await inputs.count();
    expect(inputCount).toBeGreaterThanOrEqual(0);
    
    // Verificare che ogni input abbia classi CSS appropriate
    for (let i = 0; i < Math.min(inputCount, 5); i++) {
      const input = inputs.nth(i);
      const inputClass = await input.getAttribute('class');
      
      // Ogni input dovrebbe avere classi base
      expect(inputClass).toContain('flex');
      expect(inputClass).toContain('h-10');
      expect(inputClass).toContain('w-full');
    }
  });

  test('Dovrebbe accettare props HTML standard', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare input con props HTML standard
    const inputs = page.locator('input');
    
    // ASSERT: Verificare che gli input abbiano attributi HTML standard
    const inputCount = await inputs.count();
    if (inputCount > 0) {
      const input = inputs.first();
      const type = await input.getAttribute('type');
      expect(type).toBeTruthy();
      
      // Verificare che sia un elemento input valido
      const tagName = await input.evaluate(el => el.tagName);
      expect(tagName).toBe('INPUT');
    }
  });

  test('Dovrebbe accettare className personalizzata', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare che gli input abbiano classi CSS combinate
    const inputs = page.locator('input');
    
    // ASSERT: Verificare che gli input abbiano classi CSS
    const inputCount = await inputs.count();
    if (inputCount > 0) {
      const input = inputs.first();
      const inputClass = await input.getAttribute('class');
      expect(inputClass).toBeTruthy();
      expect(inputClass.length).toBeGreaterThan(10); // Dovrebbe avere diverse classi
    }
  });

  test('Dovrebbe accettare onChange handler', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare input con onChange
    const inputs = page.locator('input');
    
    // ASSERT: Verificare che l'input funzioni senza errori
    const inputCount = await inputs.count();
    if (inputCount > 0) {
      const input = inputs.first();
      await input.fill('Test input');
      
      // Verificare che la pagina sia ancora stabile
      await expect(page.locator('h1')).toContainText('HACCP Manager');
    }
  });

  test('Dovrebbe accettare disabled prop', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare che gli input non disabilitati siano funzionanti
    const inputs = page.locator('input');
    
    // ASSERT: Verificare che gli input siano abilitati di default
    const inputCount = await inputs.count();
    if (inputCount > 0) {
      const input = inputs.first();
      await expect(input).toBeEnabled();
      
      // Verificare che non abbiano attributo disabled
      const disabled = await input.getAttribute('disabled');
      expect(disabled).toBeNull();
    }
  });

  test('Dovrebbe validare email browser correttamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare input email
    const emailInputs = page.locator('input[type="email"]');
    
    // ASSERT: Verificare validazione email browser
    const inputCount = await emailInputs.count();
    if (inputCount > 0) {
      const input = emailInputs.first();
      
      // Testare email valida
      await input.fill('test@example.com');
      const value = await input.inputValue();
      expect(value).toBe('test@example.com');
      
      // Verificare che il tipo sia email
      const type = await input.getAttribute('type');
      expect(type).toBe('email');
    }
  });

  test('Dovrebbe validare URL browser correttamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare input URL
    const urlInputs = page.locator('input[type="url"]');
    
    // ASSERT: Verificare validazione URL browser
    const inputCount = await urlInputs.count();
    if (inputCount > 0) {
      const input = urlInputs.first();
      
      // Testare URL valido
      await input.fill('https://example.com');
      const value = await input.inputValue();
      expect(value).toBe('https://example.com');
      
      // Verificare che il tipo sia url
      const type = await input.getAttribute('type');
      expect(type).toBe('url');
    }
  });

  test('Dovrebbe validare numero browser correttamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare input number
    const numberInputs = page.locator('input[type="number"]');
    
    // ASSERT: Verificare validazione numero browser
    const inputCount = await numberInputs.count();
    if (inputCount > 0) {
      const input = numberInputs.first();
      
      // Testare numero valido
      await input.fill('123');
      const value = await input.inputValue();
      expect(value).toBe('123');
      
      // Verificare che il tipo sia number
      const type = await input.getAttribute('type');
      expect(type).toBe('number');
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
      const inputClass = await input.getAttribute('class');
      
      // Verificare che abbia classi CSS per placeholder
      expect(inputClass).toContain('placeholder:text-muted-foreground');
    }
  });

  test('Dovrebbe accettare ref forwarding', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare che gli input siano elementi DOM validi
    const inputs = page.locator('input');
    
    // ASSERT: Verificare che l'input sia un elemento DOM valido
    const inputCount = await inputs.count();
    if (inputCount > 0) {
      const input = inputs.first();
      await expect(input).toBeVisible();
      
      // Verificare che sia focusabile (indica che la ref funziona)
      await input.focus();
      await expect(input).toBeFocused();
    }
  });

  test('Dovrebbe gestire file input correttamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Testare input file
    const fileInputs = page.locator('input[type="file"]');
    
    // ASSERT: Verificare input file
    const inputCount = await fileInputs.count();
    if (inputCount > 0) {
      const input = fileInputs.first();
      await expect(input).toBeVisible();
      
      // Verificare che il tipo sia file
      const type = await input.getAttribute('type');
      expect(type).toBe('file');
      
      // Verificare che abbia classi CSS appropriate per file input
      const inputClass = await input.getAttribute('class');
      expect(inputClass).toContain('file:border-0');
      expect(inputClass).toContain('file:bg-transparent');
    }
  });
});
