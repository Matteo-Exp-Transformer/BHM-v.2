import { test, expect } from '@playwright/test';

test.describe('Onboarding Step 0 e Step 1 - Test Completo', () => {
  test.beforeEach(async ({ page }) => {
    // Vai alla homepage
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(1000);
    
    // Verifica se siamo già loggati o dobbiamo fare login
    const isLoggedIn = await page.locator('button:has-text("Onboarding")').isVisible().catch(() => false);
    
    if (!isLoggedIn) {
      console.log('🔐 Eseguendo login...');
      
      // Verifica che siamo sulla pagina di login
      await expect(page.locator('h1')).toContainText('Accedi');
      
      // Esegui login con credenziali corrette
      await page.fill('input[type="email"]', 'matteo.cavallaro.work@gmail.com');
      await page.fill('input[type="password"]', 'cavallaro');
      await page.click('button:has-text("Accedi")');
      
      // Aspetta che il login sia completato
      await page.waitForTimeout(2000);
    } else {
      console.log('✅ Già loggato');
    }
    
    // Clicca sul pulsante Onboarding nell'header (se presente)
    const onboardingButton = page.locator('button:has-text("Onboarding")');
    if (await onboardingButton.isVisible()) {
      await onboardingButton.click();
      await page.waitForTimeout(1000);
    } else {
      console.log('⚠️ Pulsante Onboarding non trovato, navigando direttamente');
      await page.goto('http://localhost:3000/onboarding');
      await page.waitForTimeout(1000);
    }
  });

  test('Step 0 - Completa informazioni aziendali', async ({ page }) => {
    console.log('🎯 STEP 0: Informazioni Aziendali');
    
    // Verifica che siamo al Step 0
    await expect(page.locator('h2')).toContainText('Informazioni Aziendali');
    
    // Compila i campi obbligatori
    await page.fill('input[placeholder*="nome"]', 'Ristorante Test');
    await page.waitForTimeout(300);
    
    await page.fill('textarea[placeholder*="indirizzo"]', 'Via Milano 456, Roma');
    await page.waitForTimeout(300);
    
    await page.fill('input[placeholder*="email"]', 'info@ristorantetest.it');
    await page.waitForTimeout(300);
    
    await page.fill('input[placeholder*="telefono"]', '+39 06 9876543');
    await page.waitForTimeout(300);
    
    await page.fill('input[placeholder*="partita iva"]', 'IT98765432109');
    await page.waitForTimeout(500);
    
    // Verifica che il pulsante Avanti sia abilitato
    const nextButton = page.locator('button:has-text("Avanti")');
    await expect(nextButton).toBeVisible();
    await expect(nextButton).not.toBeDisabled();
    
    console.log('✅ Step 0 completato - campi compilati correttamente');
    
    // Clicca Avanti per andare a Step 1
    await nextButton.click();
    await page.waitForTimeout(1000);
    
    console.log('✅ Transizione a Step 1 completata');
  });

  test('Step 1 - Aggiungi reparti', async ({ page }) => {
    console.log('🎯 STEP 1: Gestione Reparti');
    
    // Completa Step 0 prima
    await page.fill('input[placeholder*="nome"]', 'Ristorante Test');
    await page.fill('textarea[placeholder*="indirizzo"]', 'Via Milano 456, Roma');
    await page.fill('input[placeholder*="email"]', 'info@ristorantetest.it');
    await page.fill('input[placeholder*="telefono"]', '+39 06 9876543');
    await page.fill('input[placeholder*="partita iva"]', 'IT98765432109');
    
    // Vai a Step 1
    await page.click('button:has-text("Avanti")');
    await page.waitForTimeout(1000);
    
    // Verifica che siamo al Step 1
    await expect(page.locator('h2')).toContainText('Gestione Reparti');
    
    // Aggiungi primo reparto
    await page.click('button:has-text("Aggiungi reparto")');
    await page.waitForTimeout(500);
    
    await page.fill('input[placeholder*="nome del reparto"]', 'Cucina');
    await page.fill('textarea[placeholder*="descrizione del reparto"]', 'Area cucina principale');
    await page.click('button:has-text("Salva reparto")');
    await page.waitForTimeout(1000);
    
    // Aggiungi secondo reparto
    await page.click('button:has-text("Aggiungi reparto")');
    await page.waitForTimeout(500);
    
    await page.fill('input[placeholder*="nome del reparto"]', 'Sala');
    await page.fill('textarea[placeholder*="descrizione del reparto"]', 'Area sala ristorante');
    await page.click('button:has-text("Salva reparto")');
    await page.waitForTimeout(1000);
    
    // Verifica reparti aggiunti
    await expect(page.locator('text=Cucina')).toBeVisible();
    await expect(page.locator('text=Sala')).toBeVisible();
    
    console.log('✅ Step 1 completato - reparti aggiunti (Cucina, Sala)');
    
    // Verifica che il pulsante Avanti sia abilitato per Step 2
    const nextButton = page.locator('button:has-text("Avanti")');
    await expect(nextButton).toBeVisible();
    await expect(nextButton).not.toBeDisabled();
    
    console.log('✅ Pronto per Step 2: Gestione Personale');
  });

  test('Flusso completo Step 0 -> Step 1', async ({ page }) => {
    console.log('🎯 FLUSSO COMPLETO STEP 0 -> STEP 1');
    
    // STEP 0: Compila informazioni aziendali
    console.log('📝 STEP 0: Compilazione informazioni aziendali');
    
    await page.fill('input[placeholder*="nome"]', 'Ristorante Test');
    await page.waitForTimeout(300);
    
    await page.fill('textarea[placeholder*="indirizzo"]', 'Via Milano 456, Roma');
    await page.waitForTimeout(300);
    
    await page.fill('input[placeholder*="email"]', 'info@ristorantetest.it');
    await page.waitForTimeout(300);
    
    await page.fill('input[placeholder*="telefono"]', '+39 06 9876543');
    await page.waitForTimeout(300);
    
    await page.fill('input[placeholder*="partita iva"]', 'IT98765432109');
    await page.waitForTimeout(500);
    
    // Vai a Step 1
    await page.click('button:has-text("Avanti")');
    await page.waitForTimeout(1000);
    
    // STEP 1: Aggiungi reparti
    console.log('🏢 STEP 1: Aggiunta reparti');
    
    // Aggiungi primo reparto
    await page.click('button:has-text("Aggiungi reparto")');
    await page.waitForTimeout(500);
    
    await page.fill('input[placeholder*="nome del reparto"]', 'Cucina');
    await page.fill('textarea[placeholder*="descrizione del reparto"]', 'Area cucina principale');
    await page.click('button:has-text("Salva reparto")');
    await page.waitForTimeout(1000);
    
    // Aggiungi secondo reparto
    await page.click('button:has-text("Aggiungi reparto")');
    await page.waitForTimeout(500);
    
    await page.fill('input[placeholder*="nome del reparto"]', 'Sala');
    await page.fill('textarea[placeholder*="descrizione del reparto"]', 'Area sala ristorante');
    await page.click('button:has-text("Salva reparto")');
    await page.waitForTimeout(1000);
    
    // Verifica reparti aggiunti
    await expect(page.locator('text=Cucina')).toBeVisible();
    await expect(page.locator('text=Sala')).toBeVisible();
    
    console.log('✅ FLUSSO COMPLETO:');
    console.log('   ✅ Step 0: Informazioni aziendali completate');
    console.log('   ✅ Step 1: Reparti aggiunti (Cucina, Sala)');
    console.log('   ✅ Pronto per Step 2: Gestione Personale');
    
    // Mostra il pulsante Avanti per Step 2
    const nextButton = page.locator('button:has-text("Avanti")');
    await expect(nextButton).toBeVisible();
    await expect(nextButton).not.toBeDisabled();
    
    console.log('🎯 Pronto per testare Step 2!');
  });
});
