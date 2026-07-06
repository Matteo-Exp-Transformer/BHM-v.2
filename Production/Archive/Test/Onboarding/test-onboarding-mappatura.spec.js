import { test, expect } from '@playwright/test';

test.describe('Test Onboarding Completo - Mappatura e Compilazione', () => {
  test('Mappa tutti gli elementi e prova a compilarli', async ({ page }) => {
    console.log('🚀 Inizio test: Navigazione a /onboarding');
    
    // Naviga alla pagina onboarding
    await page.goto('http://localhost:3006/onboarding');
    console.log('📍 Navigato a http://localhost:3006/onboarding');
    
    // Aspetta che la pagina si carichi completamente
    await page.waitForTimeout(3000);
    console.log('⏳ Aspettato caricamento completo');
    
    // Verifica che il wizard sia visibile
    await expect(page.locator('[data-testid="onboarding-wizard"]')).toBeVisible();
    console.log('✅ OnboardingWizard trovato');
    
    // SCROLL DOWN per vedere tutto il contenuto
    console.log('📜 Inizio scroll per mappare tutti gli elementi...');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000);
    console.log('✅ Scroll completato');
    
    // MAPPA tutti gli elementi visibili
    console.log('🗺️ Mappatura elementi...');
    
    // 1. Header e titoli
    const headers = await page.locator('h1, h2, h3').all();
    console.log(`📋 Trovati ${headers.length} titoli:`);
    for (let i = 0; i < headers.length; i++) {
      const text = await headers[i].textContent();
      console.log(`   ${i + 1}. "${text}"`);
    }
    
    // 2. Tutti i campi input
    const inputs = await page.locator('input').all();
    console.log(`📝 Trovati ${inputs.length} campi input:`);
    for (let i = 0; i < inputs.length; i++) {
      const name = await inputs[i].getAttribute('name');
      const placeholder = await inputs[i].getAttribute('placeholder');
      const type = await inputs[i].getAttribute('type');
      console.log(`   ${i + 1}. name="${name}" placeholder="${placeholder}" type="${type}"`);
    }
    
    // 3. Tutti i select
    const selects = await page.locator('select').all();
    console.log(`📋 Trovati ${selects.length} select:`);
    for (let i = 0; i < selects.length; i++) {
      const name = await selects[i].getAttribute('name');
      console.log(`   ${i + 1}. name="${name}"`);
    }
    
    // 4. Tutti i bottoni
    const buttons = await page.locator('button').all();
    console.log(`🔘 Trovati ${buttons.length} bottoni:`);
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].textContent();
      const disabled = await buttons[i].isDisabled();
      console.log(`   ${i + 1}. "${text}" (disabled: ${disabled})`);
    }
    
    // PROVA A COMPILARE i campi del primo step
    console.log('✏️ Inizio compilazione campi...');
    
    // Compila Business Name
    const businessNameInput = page.locator('input[name="businessName"]');
    if (await businessNameInput.isVisible()) {
      await businessNameInput.fill('Test Azienda SRL');
      console.log('✅ Compilato businessName');
    }
    
    // Compila Business Address
    const businessAddressInput = page.locator('input[name="businessAddress"]');
    if (await businessAddressInput.isVisible()) {
      await businessAddressInput.fill('Via Test 123, Milano');
      console.log('✅ Compilato businessAddress');
    }
    
    // Compila Business Phone
    const businessPhoneInput = page.locator('input[name="businessPhone"]');
    if (await businessPhoneInput.isVisible()) {
      await businessPhoneInput.fill('02 1234567');
      console.log('✅ Compilato businessPhone');
    }
    
    // Compila Business Email
    const businessEmailInput = page.locator('input[name="businessEmail"]');
    if (await businessEmailInput.isVisible()) {
      await businessEmailInput.fill('test@azienda.it');
      console.log('✅ Compilato businessEmail');
    }
    
    // Compila VAT Number
    const vatNumberInput = page.locator('input[name="vatNumber"]');
    if (await vatNumberInput.isVisible()) {
      await vatNumberInput.fill('IT12345678901');
      console.log('✅ Compilato vatNumber');
    }
    
    // Seleziona Business Type
    const businessTypeSelect = page.locator('select[name="businessType"]');
    if (await businessTypeSelect.isVisible()) {
      await businessTypeSelect.selectOption('ristorante');
      console.log('✅ Selezionato businessType');
    }
    
    // Aspetta un momento per vedere i risultati
    await page.waitForTimeout(2000);
    console.log('⏳ Aspettato per vedere i risultati della compilazione');
    
    // Verifica se il bottone Avanti è ora abilitato
    const nextButton = page.locator('button:has-text("Avanti")');
    const isEnabled = await nextButton.isEnabled();
    console.log(`🔘 Bottone "Avanti" è abilitato: ${isEnabled}`);
    
    // Prova a cliccare su Avanti se è abilitato
    if (isEnabled) {
      console.log('🔄 Tentativo di avanzare al prossimo step...');
      await nextButton.click();
      await page.waitForTimeout(2000);
      console.log('✅ Click su Avanti eseguito');
      
      // Verifica se siamo al secondo step
      const step2Text = page.locator('text=Step 2 di 7');
      if (await step2Text.isVisible()) {
        console.log('✅ Siamo arrivati al Step 2!');
      } else {
        console.log('⚠️ Non siamo ancora al Step 2');
      }
    }
    
    console.log('🎉 Test di mappatura e compilazione completato!');
  });
});
