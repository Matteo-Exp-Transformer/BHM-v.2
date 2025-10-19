import { test, expect } from '@playwright/test';

test.describe('Onboarding Step 0 e Step 1 - Test Completo (Headless)', () => {
  test.beforeEach(async ({ page }) => {
    // Vai alla homepage
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(1000);
    
    // Verifica se siamo già loggati controllando la presenza di elementi specifici
    const isLoggedIn = await page.locator('button:has-text("Onboarding")').isVisible().catch(() => false);
    
    if (!isLoggedIn) {
      console.log('🔐 Eseguendo login...');
      
      // Mappa i campi di login correttamente
      // Cerca input email con placeholder o name specifici
      const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email"], input[placeholder*="Email"]').first();
      const passwordInput = page.locator('input[type="password"], input[name="password"], input[placeholder*="password"], input[placeholder*="Password"]').first();
      const loginButton = page.locator('button:has-text("Accedi"), button[type="submit"], input[type="submit"]').first();
      
      // Compila i campi
      await emailInput.fill('matteo.cavallaro.work@gmail.com');
      await passwordInput.fill('cavallaro');
      await loginButton.click();
      
      // Aspetta che il login sia completato
      await page.waitForTimeout(2000);
    } else {
      console.log('✅ Già loggato');
    }
    
    // Naviga direttamente all'onboarding
    await page.goto('http://localhost:3000/onboarding');
    await page.waitForTimeout(1000);
  });

  test('Step 0 - Completa informazioni aziendali', async ({ page }) => {
    console.log('🎯 STEP 0: Informazioni Aziendali');
    
    // Verifica che siamo al Step 0
    await expect(page.locator('h2')).toContainText('Informazioni Aziendali');
    
    // Mappa i campi del form Step 0
    const nameField = page.locator('input[placeholder*="nome"], input[name*="name"], input[id*="name"]').first();
    const addressField = page.locator('textarea[placeholder*="indirizzo"], textarea[name*="address"], textarea[id*="address"]').first();
    const emailField = page.locator('input[placeholder*="email"], input[name*="email"], input[id*="email"], input[type="email"]').first();
    const phoneField = page.locator('input[placeholder*="telefono"], input[name*="phone"], input[id*="phone"], input[placeholder*="phone"]').first();
    const vatField = page.locator('input[placeholder*="partita"], input[name*="vat"], input[id*="vat"], input[placeholder*="iva"]').first();
    
    // Compila i campi
    await nameField.fill('Ristorante Test');
    await page.waitForTimeout(300);
    
    await addressField.fill('Via Milano 456, Roma');
    await page.waitForTimeout(300);
    
    await emailField.fill('info@ristorantetest.it');
    await page.waitForTimeout(300);
    
    await phoneField.fill('+39 06 9876543');
    await page.waitForTimeout(300);
    
    await vatField.fill('IT98765432109');
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
    const nameField = page.locator('input[placeholder*="nome"], input[name*="name"], input[id*="name"]').first();
    const addressField = page.locator('textarea[placeholder*="indirizzo"], textarea[name*="address"], textarea[id*="address"]').first();
    
    await nameField.fill('Ristorante Test');
    await addressField.fill('Via Milano 456, Roma');
    
    // Vai a Step 1
    await page.click('button:has-text("Avanti")');
    await page.waitForTimeout(1000);
    
    // Verifica che siamo al Step 1
    await expect(page.locator('h2')).toContainText('Configurazione Reparti');
    
    // Mappa i campi del form reparti
    const addDeptButton = page.locator('button:has-text("Aggiungi"), button:has-text("aggiungi")').first();
    await addDeptButton.click();
    await page.waitForTimeout(500);
    
    const deptNameField = page.locator('input[placeholder*="nome del reparto"], input[name*="department"], input[id*="department"]').first();
    const deptDescField = page.locator('textarea[placeholder*="descrizione"], textarea[name*="description"], textarea[id*="description"]').first();
    
    // Aggiungi primo reparto
    await deptNameField.fill('Cucina');
    await deptDescField.fill('Area cucina principale');
    
    const saveButton = page.locator('button:has-text("Salva"), button:has-text("salva"), button[type="submit"]').first();
    await saveButton.click();
    await page.waitForTimeout(1000);
    
    // Aggiungi secondo reparto
    await addDeptButton.click();
    await page.waitForTimeout(500);
    
    await deptNameField.fill('Sala');
    await deptDescField.fill('Area sala ristorante');
    await saveButton.click();
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
    
    const nameField = page.locator('input[placeholder*="nome"], input[name*="name"], input[id*="name"]').first();
    const addressField = page.locator('textarea[placeholder*="indirizzo"], textarea[name*="address"], textarea[id*="address"]').first();
    const emailField = page.locator('input[placeholder*="email"], input[name*="email"], input[id*="email"], input[type="email"]').first();
    const phoneField = page.locator('input[placeholder*="telefono"], input[name*="phone"], input[id*="phone"], input[placeholder*="phone"]').first();
    const vatField = page.locator('input[placeholder*="partita"], input[name*="vat"], input[id*="vat"], input[placeholder*="iva"]').first();
    
    await nameField.fill('Ristorante Test');
    await page.waitForTimeout(300);
    
    await addressField.fill('Via Milano 456, Roma');
    await page.waitForTimeout(300);
    
    await emailField.fill('info@ristorantetest.it');
    await page.waitForTimeout(300);
    
    await phoneField.fill('+39 06 9876543');
    await page.waitForTimeout(300);
    
    await vatField.fill('IT98765432109');
    await page.waitForTimeout(500);
    
    // Vai a Step 1
    await page.click('button:has-text("Avanti")');
    await page.waitForTimeout(1000);
    
    // STEP 1: Aggiungi reparti
    console.log('🏢 STEP 1: Aggiunta reparti');
    
    const addDeptButton = page.locator('button:has-text("Aggiungi"), button:has-text("aggiungi")').first();
    
    // Aggiungi primo reparto
    await addDeptButton.click();
    await page.waitForTimeout(500);
    
    const deptNameField = page.locator('input[placeholder*="nome del reparto"], input[name*="department"], input[id*="department"]').first();
    const deptDescField = page.locator('textarea[placeholder*="descrizione"], textarea[name*="description"], textarea[id*="description"]').first();
    
    await deptNameField.fill('Cucina');
    await deptDescField.fill('Area cucina principale');
    
    const saveButton = page.locator('button:has-text("Salva"), button:has-text("salva"), button[type="submit"]').first();
    await saveButton.click();
    await page.waitForTimeout(1000);
    
    // Aggiungi secondo reparto
    await addDeptButton.click();
    await page.waitForTimeout(500);
    
    await deptNameField.fill('Sala');
    await deptDescField.fill('Area sala ristorante');
    await saveButton.click();
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
