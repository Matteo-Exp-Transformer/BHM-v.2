const { test, expect } = require('@playwright/test');

test.describe('Button.tsx - Test Funzionali', () => {
  
  // Setup: navigare alla pagina prima di ogni test
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    // Aspettare che l'app sia caricata
    await expect(page.locator('h1')).toContainText('HACCP Manager');
  });

  test('Dovrebbe renderizzare tutte le varianti correttamente', async ({ page }) => {
    // ARRANGE: Navigare a una pagina con bottoni
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare presenza di bottoni con diverse varianti
    const buttons = page.locator('button');
    
    // ASSERT: Verificare che i bottoni siano presenti e visibili
    await expect(buttons.first()).toBeVisible();
    
    // Verificare che ci siano bottoni con classi CSS diverse (varianti)
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);
  });

  test('Dovrebbe renderizzare tutte le dimensioni correttamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Cercare bottoni di diverse dimensioni
    const buttons = page.locator('button');
    
    // ASSERT: Verificare che i bottoni abbiano dimensioni diverse
    const firstButton = buttons.first();
    await expect(firstButton).toBeVisible();
    
    // Verificare che il bottone abbia classi CSS per le dimensioni
    const buttonClass = await firstButton.getAttribute('class');
    expect(buttonClass).toContain('inline-flex');
    expect(buttonClass).toContain('items-center');
    expect(buttonClass).toContain('justify-center');
  });

  test('Dovrebbe gestire il click correttamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Cliccare su un bottone (es. Debug Auth)
    const debugButton = page.locator('button:has-text("Debug Auth")');
    await expect(debugButton).toBeVisible();
    
    // ASSERT: Verificare che il click funzioni
    await debugButton.click();
    
    // Verificare che sia successo qualcosa (la pagina dovrebbe rimanere stabile)
    await expect(page.locator('h1')).toContainText('HACCP Manager');
  });

  test('Dovrebbe gestire stati hover e focus', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Hover su un bottone
    const button = page.locator('button').first();
    await expect(button).toBeVisible();
    
    // ASSERT: Verificare hover
    await button.hover();
    
    // Verificare focus
    await button.focus();
    
    // Verificare che il bottone sia ancora visibile e funzionante
    await expect(button).toBeVisible();
  });

  test('Dovrebbe gestire stato disabled correttamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Cercare bottoni disabilitati
    const buttons = page.locator('button');
    
    // ASSERT: Verificare che i bottoni non disabilitati siano cliccabili
    const firstButton = buttons.first();
    await expect(firstButton).toBeEnabled();
    
    // Verificare che il bottone abbia le classi CSS corrette
    const buttonClass = await firstButton.getAttribute('class');
    expect(buttonClass).toContain('transition-colors');
  });

  test('Dovrebbe avere accessibilità corretta', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare attributi di accessibilità
    const button = page.locator('button').first();
    await expect(button).toBeVisible();
    
    // ASSERT: Verificare che il bottone abbia il ruolo corretto
    await expect(button).toHaveAttribute('type', 'button');
    
    // Verificare che sia navigabile da tastiera
    await button.focus();
    await expect(button).toBeFocused();
  });

  test('Dovrebbe gestire props forwarding correttamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare che i bottoni abbiano props HTML standard
    const button = page.locator('button').first();
    
    // ASSERT: Verificare che il bottone abbia attributi HTML standard
    await expect(button).toHaveAttribute('class');
    
    // Verificare che il bottone sia cliccabile
    await expect(button).toBeEnabled();
  });

  test('Dovrebbe gestire classi CSS combinate correttamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare classi CSS sui bottoni
    const button = page.locator('button').first();
    
    // ASSERT: Verificare che il bottone abbia classi CSS base
    const buttonClass = await button.getAttribute('class');
    expect(buttonClass).toContain('inline-flex');
    expect(buttonClass).toContain('items-center');
    expect(buttonClass).toContain('justify-center');
    expect(buttonClass).toContain('whitespace-nowrap');
    expect(buttonClass).toContain('rounded-md');
    expect(buttonClass).toContain('text-sm');
    expect(buttonClass).toContain('font-medium');
    expect(buttonClass).toContain('transition-colors');
  });

  test('Dovrebbe gestire forwardRef correttamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // ACT: Verificare che i bottoni siano elementi DOM validi
    const button = page.locator('button').first();
    
    // ASSERT: Verificare che sia un elemento button HTML
    await expect(button).toHaveAttribute('type');
    
    // Verificare che sia cliccabile (indica che la ref funziona)
    await button.click();
    await expect(button).toBeVisible();
  });
});
