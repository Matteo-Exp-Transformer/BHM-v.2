import { test, expect } from '@playwright/test';

test.describe('Mostra Test Step 0 e Step 1 su Chromium', () => {
  test.beforeEach(async ({ page }) => {
    // Vai alla pagina di login
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(1000);
    
    // Verifica che siamo sulla pagina di login
    await expect(page.locator('h1')).toContainText('Accedi');
    
    // Esegui login
    await page.fill('input[type="email"]', 'matteo.cavallaro.work@gmail.com');
    await page.fill('input[type="password"]', 'cavallaro');
    await page.click('button:has-text("Accedi")');
    
    // Aspetta che il login sia completato
    await page.waitForTimeout(2000);
    
    // Clicca sul pulsante Onboarding nell'header
    await page.click('button:has-text("Onboarding")');
    await page.waitForTimeout(1000);
  });

  test('Mostra Step 0 - BusinessInfoStep', async ({ page }) => {
    console.log('🎯 MOSTRO STEP 0 - BusinessInfoStep');
    
    // Verifica che siamo al Step 0
    await expect(page.locator('h2')).toContainText('Informazioni Aziendali');
    
    // Mostra i campi del form
    console.log('📋 Campi del form Step 0:');
    const nameField = page.locator('input[placeholder*="nome"]');
    const addressField = page.locator('textarea[placeholder*="indirizzo"]');
    const emailField = page.locator('input[placeholder*="email"]');
    const phoneField = page.locator('input[placeholder*="telefono"]');
    const vatField = page.locator('input[placeholder*="partita iva"]');
    
    // Compila i campi
    await nameField.fill('Test Restaurant');
    await page.waitForTimeout(500);
    
    await addressField.fill('Via Roma 123, Milano');
    await page.waitForTimeout(500);
    
    await emailField.fill('test@restaurant.it');
    await page.waitForTimeout(500);
    
    await phoneField.fill('+39 02 1234567');
    await page.waitForTimeout(500);
    
    await vatField.fill('IT12345678901');
    await page.waitForTimeout(500);
    
    // Mostra il pulsante Avanti
    const nextButton = page.locator('button:has-text("Avanti")');
    await expect(nextButton).toBeVisible();
    console.log('✅ Pulsante Avanti visibile');
    
    // Clicca Avanti per andare a Step 1
    await nextButton.click();
    await page.waitForTimeout(1000);
    
    console.log('✅ Step 0 completato, passato a Step 1');
  });

  test('Mostra Step 1 - DepartmentsStep', async ({ page }) => {
    console.log('🎯 MOSTRO STEP 1 - DepartmentsStep');
    
    // Completa Step 0 prima
    await page.fill('input[placeholder*="nome"]', 'Test Restaurant');
    await page.fill('textarea[placeholder*="indirizzo"]', 'Via Roma 123, Milano');
    await page.fill('input[placeholder*="email"]', 'test@restaurant.it');
    await page.fill('input[placeholder*="telefono"]', '+39 02 1234567');
    await page.fill('input[placeholder*="partita iva"]', 'IT12345678901');
    
    // Vai a Step 1
    await page.click('button:has-text("Avanti")');
    await page.waitForTimeout(1000);
    
    // Verifica che siamo al Step 1
    await expect(page.locator('h2')).toContainText('Gestione Reparti');
    
    // Mostra i pulsanti disponibili
    const addDeptButton = page.locator('button:has-text("Aggiungi reparto")');
    const prefillButton = page.locator('button:has-text("Carica reparti predefiniti")');
    
    await expect(addDeptButton).toBeVisible();
    await expect(prefillButton).toBeVisible();
    
    console.log('✅ Pulsanti Step 1 visibili:');
    console.log('   - Aggiungi reparto');
    console.log('   - Carica reparti predefiniti');
    
    // Clicca su "Aggiungi reparto"
    await addDeptButton.click();
    await page.waitForTimeout(500);
    
    // Mostra il form per aggiungere reparto
    const deptNameField = page.locator('input[placeholder*="nome del reparto"]');
    const deptDescField = page.locator('textarea[placeholder*="descrizione del reparto"]');
    
    await expect(deptNameField).toBeVisible();
    await expect(deptDescField).toBeVisible();
    
    // Compila il form reparto
    await deptNameField.fill('Cucina');
    await page.waitForTimeout(500);
    
    await deptDescField.fill('Area cucina per preparazione piatti');
    await page.waitForTimeout(500);
    
    // Salva il reparto
    const saveDeptButton = page.locator('button:has-text("Salva reparto")');
    await saveDeptButton.click();
    await page.waitForTimeout(1000);
    
    console.log('✅ Reparto aggiunto: Cucina');
    
    // Verifica che il reparto sia stato aggiunto
    await expect(page.locator('text=Cucina')).toBeVisible();
    
    // Mostra il pulsante Avanti per andare a Step 2
    const nextButton = page.locator('button:has-text("Avanti")');
    await expect(nextButton).toBeVisible();
    
    console.log('✅ Step 1 completato, pronto per Step 2');
  });

  test('Mostra flusso completo Step 0 -> Step 1', async ({ page }) => {
    console.log('🎯 MOSTRO FLUSSO COMPLETO STEP 0 -> STEP 1');
    
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
