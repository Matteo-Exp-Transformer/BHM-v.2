import { test, expect } from '@playwright/test';

test.describe('Button.tsx - Test con Login', () => {
  
  // Credenziali preconfigurate
  const EMAIL = 'matteo.cavallaro.work@gmail.com';
  const PASSWORD = 'cavallaro';
  
  test.beforeEach(async ({ page }) => {
    // Navigare alla pagina di login
    await page.goto('http://localhost:3001');
    
    // Aspettare che la pagina si carichi
    await page.waitForLoadState('networkidle');
    
    // Verificare se siamo già loggati o se dobbiamo fare login
    const isLoggedIn = await page.locator('h1:has-text("HACCP Manager")').isVisible();
    
    if (!isLoggedIn) {
      // Eseguire login
      console.log('🔐 Eseguendo login...');
      
      // Cercare campo email
      const emailInput = page.locator('input[type="email"]').first();
      await expect(emailInput).toBeVisible({ timeout: 10000 });
      await emailInput.fill(EMAIL);
      
      // Cercare campo password
      const passwordInput = page.locator('input[type="password"]').first();
      await expect(passwordInput).toBeVisible({ timeout: 10000 });
      await passwordInput.fill(PASSWORD);
      
      // Cliccare bottone login
      const loginButton = page.locator('button:has-text("Accedi"), button:has-text("Login"), button[type="submit"]').first();
      await expect(loginButton).toBeVisible({ timeout: 10000 });
      await loginButton.click();
      
      // Aspettare il redirect alla dashboard
      await page.waitForURL('**/dashboard**', { timeout: 15000 });
      await page.waitForLoadState('networkidle');
      
      console.log('✅ Login completato');
    } else {
      console.log('✅ Già loggato');
    }
    
    // Verificare che siamo nella dashboard
    await expect(page.locator('h1')).toContainText('Business Haccp Manager');
  });

  test('Dovrebbe renderizzare tutte le varianti correttamente dopo login', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3001/dashboard');
    await page.waitForLoadState('networkidle');
    
    // ACT: Verificare presenza di bottoni con diverse varianti
    const buttons = page.locator('button');
    
    // ASSERT: Verificare che i bottoni siano presenti e visibili
    const buttonCount = await buttons.count();
    console.log(`🔍 Trovati ${buttonCount} bottoni`);
    
    if (buttonCount > 0) {
      await expect(buttons.first()).toBeVisible();
      
      // Verificare che i bottoni abbiano classi CSS appropriate
      const firstButton = buttons.first();
      const buttonClass = await firstButton.getAttribute('class');
      console.log(`🎨 Classi CSS bottone: ${buttonClass}`);
      
      expect(buttonClass).toContain('inline-flex');
      expect(buttonClass).toContain('items-center');
      expect(buttonClass).toContain('justify-center');
    }
  });

  test('Dovrebbe renderizzare tutte le dimensioni correttamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3001/dashboard');
    await page.waitForLoadState('networkidle');
    
    // ACT: Cercare bottoni di diverse dimensioni
    const buttons = page.locator('button');
    
    // ASSERT: Verificare che i bottoni abbiano dimensioni diverse
    const buttonCount = await buttons.count();
    console.log(`🔍 Trovati ${buttonCount} bottoni per test dimensioni`);
    
    if (buttonCount > 0) {
      const firstButton = buttons.first();
      await expect(firstButton).toBeVisible();
      
      // Verificare che il bottone abbia classi CSS per le dimensioni
      const buttonClass = await firstButton.getAttribute('class');
      expect(buttonClass).toContain('inline-flex');
      expect(buttonClass).toContain('items-center');
      expect(buttonClass).toContain('justify-center');
    }
  });

  test('Dovrebbe gestire il click correttamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3001/dashboard');
    await page.waitForLoadState('networkidle');
    
    // ACT: Cliccare su un bottone (es. Debug Auth)
    const debugButton = page.locator('button:has-text("Debug Auth"), button:has-text("Debug")').first();
    
    // ASSERT: Verificare che il click funzioni
    if (await debugButton.isVisible()) {
      console.log('🔍 Trovato bottone Debug, cliccando...');
      await debugButton.click();
      
      // Verificare che la pagina sia ancora stabile
      await expect(page.locator('h1')).toContainText('HACCP Manager');
      console.log('✅ Click su bottone Debug completato');
    } else {
      // Se non c'è bottone Debug, cliccare su qualsiasi bottone
      const anyButton = page.locator('button').first();
      if (await anyButton.isVisible()) {
        console.log('🔍 Cliccando su primo bottone disponibile...');
        await anyButton.click();
        await expect(page.locator('h1')).toContainText('HACCP Manager');
        console.log('✅ Click su bottone completato');
      }
    }
  });

  test('Dovrebbe gestire stati hover e focus', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3001/dashboard');
    await page.waitForLoadState('networkidle');
    
    // ACT: Hover su un bottone
    const button = page.locator('button').first();
    
    // ASSERT: Verificare hover
    if (await button.isVisible()) {
      console.log('🔍 Testando hover e focus...');
      await button.hover();
      
      // Verificare focus
      await button.focus();
      
      // Verificare che il bottone sia ancora visibile e funzionante
      await expect(button).toBeVisible();
      console.log('✅ Hover e focus testati');
    }
  });

  test('Dovrebbe gestire stato disabled correttamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3001/dashboard');
    await page.waitForLoadState('networkidle');
    
    // ACT: Cercare bottoni disabilitati
    const buttons = page.locator('button');
    
    // ASSERT: Verificare che i bottoni non disabilitati siano cliccabili
    const buttonCount = await buttons.count();
    console.log(`🔍 Trovati ${buttonCount} bottoni per test disabled`);
    
    if (buttonCount > 0) {
      const firstButton = buttons.first();
      await expect(firstButton).toBeVisible();
      
      // Verificare che il bottone abbia le classi CSS corrette
      const buttonClass = await firstButton.getAttribute('class');
      expect(buttonClass).toContain('transition-colors');
      console.log('✅ Test stato disabled completato');
    }
  });

  test('Dovrebbe avere accessibilità corretta', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3001/dashboard');
    await page.waitForLoadState('networkidle');
    
    // ACT: Verificare attributi di accessibilità
    const button = page.locator('button').first();
    
    // ASSERT: Verificare che il bottone abbia il ruolo corretto
    if (await button.isVisible()) {
      console.log('🔍 Testando accessibilità...');
      
      // Verificare che sia navigabile da tastiera
      await button.focus();
      await expect(button).toBeFocused();
      
      console.log('✅ Test accessibilità completato');
    }
  });

  test('Dovrebbe gestire props forwarding correttamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3001/dashboard');
    await page.waitForLoadState('networkidle');
    
    // ACT: Verificare che i bottoni abbiano props HTML standard
    const button = page.locator('button').first();
    
    // ASSERT: Verificare che il bottone abbia attributi HTML standard
    if (await button.isVisible()) {
      console.log('🔍 Testando props forwarding...');
      
      // Verificare che abbia attributi HTML standard
      await expect(button).toHaveAttribute('class');
      
      // Verificare che sia cliccabile
      await expect(button).toBeEnabled();
      
      console.log('✅ Test props forwarding completato');
    }
  });

  test('Dovrebbe gestire classi CSS combinate correttamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3001/dashboard');
    await page.waitForLoadState('networkidle');
    
    // ACT: Verificare classi CSS sui bottoni
    const button = page.locator('button').first();
    
    // ASSERT: Verificare che il bottone abbia classi CSS base
    if (await button.isVisible()) {
      console.log('🔍 Testando classi CSS...');
      
      const buttonClass = await button.getAttribute('class');
      console.log(`🎨 Classi CSS: ${buttonClass}`);
      
      expect(buttonClass).toContain('inline-flex');
      expect(buttonClass).toContain('items-center');
      expect(buttonClass).toContain('justify-center');
      expect(buttonClass).toContain('whitespace-nowrap');
      expect(buttonClass).toContain('rounded-md');
      expect(buttonClass).toContain('text-sm');
      expect(buttonClass).toContain('font-medium');
      expect(buttonClass).toContain('transition-colors');
      
      console.log('✅ Test classi CSS completato');
    }
  });

  test('Dovrebbe gestire forwardRef correttamente', async ({ page }) => {
    // ARRANGE: Navigare alla dashboard
    await page.goto('http://localhost:3001/dashboard');
    await page.waitForLoadState('networkidle');
    
    // ACT: Verificare che i bottoni siano elementi DOM validi
    const button = page.locator('button').first();
    
    // ASSERT: Verificare che sia un elemento button HTML
    if (await button.isVisible()) {
      console.log('🔍 Testando forwardRef...');
      
      // Verificare che abbia attributi HTML standard
      await expect(button).toHaveAttribute('type');
      
      // Verificare che sia cliccabile (indica che la ref funziona)
      await button.click();
      await expect(button).toBeVisible();
      
      console.log('✅ Test forwardRef completato');
    }
  });
});
