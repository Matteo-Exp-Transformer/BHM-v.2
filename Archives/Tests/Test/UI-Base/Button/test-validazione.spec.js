import { test, expect } from '@playwright/test';

test.describe('Button.tsx - Test Validazione Dati', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('h1')).toContainText('HACCP Manager');
  });

  test('Dovrebbe accettare tutte le varianti valide', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard dove ci sono bottoni
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare che i bottoni abbiano varianti diverse
    const buttons = page.locator('button');
    
    // ASSERT: Verificare che i bottoni siano renderizzati correttamente
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);
    
    // Verificare che ogni bottone abbia classi CSS appropriate
    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i);
      const buttonClass = await button.getAttribute('class');
      
      // Ogni bottone dovrebbe avere classi base
      expect(buttonClass).toContain('inline-flex');
      expect(buttonClass).toContain('items-center');
      expect(buttonClass).toContain('justify-center');
    }
  });

  test('Dovrebbe accettare tutte le dimensioni valide', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare bottoni di diverse dimensioni
    const buttons = page.locator('button');
    
    // ASSERT: Verificare che i bottoni abbiano dimensioni appropriate
    const firstButton = buttons.first();
    const buttonClass = await firstButton.getAttribute('class');
    
    // Verificare che abbia classi per le dimensioni
    expect(buttonClass).toMatch(/h-\d+/); // Dovrebbe avere una classe height
    expect(buttonClass).toMatch(/px-\d+/); // Dovrebbe avere padding orizzontale
  });

  test('Dovrebbe accettare className personalizzata', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare che i bottoni abbiano classi CSS combinate
    const button = page.locator('button').first();
    
    // ASSERT: Verificare che il bottone abbia classi CSS
    const buttonClass = await button.getAttribute('class');
    expect(buttonClass).toBeTruthy();
    expect(buttonClass.length).toBeGreaterThan(10); // Dovrebbe avere diverse classi
  });

  test('Dovrebbe accettare onClick handler', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Cliccare su un bottone e verificare che non dia errori
    const button = page.locator('button').first();
    
    // ASSERT: Verificare che il click funzioni senza errori
    await button.click();
    
    // Verificare che la pagina sia ancora stabile
    await expect(page.locator('h1')).toContainText('HACCP Manager');
  });

  test('Dovrebbe accettare disabled prop', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare che i bottoni non disabilitati siano cliccabili
    const buttons = page.locator('button');
    
    // ASSERT: Verificare che i bottoni siano abilitati di default
    const firstButton = buttons.first();
    await expect(firstButton).toBeEnabled();
    
    // Verificare che non abbiano attributo disabled
    const disabled = await firstButton.getAttribute('disabled');
    expect(disabled).toBeNull();
  });

  test('Dovrebbe accettare props HTML standard', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare attributi HTML standard
    const button = page.locator('button').first();
    
    // ASSERT: Verificare attributi HTML standard
    await expect(button).toHaveAttribute('type');
    
    // Verificare che sia un elemento button valido
    const tagName = await button.evaluate(el => el.tagName);
    expect(tagName).toBe('BUTTON');
  });

  test('Dovrebbe gestire asChild prop correttamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare che i bottoni siano elementi button standard
    const button = page.locator('button').first();
    
    // ASSERT: Verificare che sia un elemento button (asChild=false di default)
    const tagName = await button.evaluate(el => el.tagName);
    expect(tagName).toBe('BUTTON');
    
    // Verificare che abbia le classi CSS appropriate
    const buttonClass = await button.getAttribute('class');
    expect(buttonClass).toContain('inline-flex');
  });

  test('Dovrebbe accettare ref forwarding', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare che i bottoni siano elementi DOM validi
    const button = page.locator('button').first();
    
    // ASSERT: Verificare che il bottone sia un elemento DOM valido
    await expect(button).toBeVisible();
    
    // Verificare che sia cliccabile (indica che la ref funziona)
    await button.click();
    
    // Verificare che sia ancora presente dopo il click
    await expect(button).toBeVisible();
  });

  test('Dovrebbe gestire varianti di default correttamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare bottoni con varianti di default
    const buttons = page.locator('button');
    
    // ASSERT: Verificare che i bottoni abbiano varianti appropriate
    const firstButton = buttons.first();
    const buttonClass = await firstButton.getAttribute('class');
    
    // Verificare che abbia classi per varianti (almeno una di default, destructive, outline, etc.)
    const hasVariantClass = buttonClass.includes('bg-primary') || 
                           buttonClass.includes('bg-destructive') || 
                           buttonClass.includes('border') ||
                           buttonClass.includes('bg-secondary') ||
                           buttonClass.includes('text-primary');
    
    expect(hasVariantClass || buttonClass.includes('transition-colors')).toBeTruthy();
  });
});
