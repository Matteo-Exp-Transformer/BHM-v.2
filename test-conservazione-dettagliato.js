import { chromium } from 'playwright';

async function testConservazioneDettagliato() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🚀 Avvio test conservazione dettagliato...');
    
    // Naviga all'applicazione
    console.log('📍 Navigazione a localhost:3000...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Login
    console.log('🔐 Eseguo login...');
    const emailInput = await page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
    await emailInput.fill('matteo.cavallaro.work@gmail.com');
    
    const passwordInput = await page.locator('input[type="password"], input[name="password"]').first();
    await passwordInput.fill('cavallaro');
    
    const loginButton = await page.locator('button:has-text("Login"), button:has-text("Accedi"), button[type="submit"]').first();
    await loginButton.click();
    await page.waitForTimeout(5000);
    
    // Naviga alla conservazione
    console.log('🔍 Navigazione alla sezione conservazione...');
    const conservazioneLink = await page.locator('a:has-text("Conservazione"), a:has-text("conservazione"), [href*="conservazione" i]').first();
    await conservazioneLink.click();
    await page.waitForTimeout(3000);
    
    // Apri il form per aggiungere nuovo punto
    console.log('➕ Apertura form nuovo punto...');
    const addButton = await page.locator('button:has-text("Aggiungi"), button:has-text("Nuovo"), button:has-text("+"), [data-testid*="add"]').first();
    await addButton.click();
    await page.waitForTimeout(2000);
    
    // Compila il form
    console.log('📝 Compilazione form dettagliata...');
    
    // Nome del punto
    const nameInput = await page.locator('input[placeholder*="Frigorifero"], input[placeholder*="Punto"], input[type="text"]').first();
    await nameInput.fill('cazzo');
    console.log('✅ Nome inserito: cazzo');
    
    // Seleziona tipo frigorifero (clicca sul pulsante)
    const fridgeButton = await page.locator('button:has-text("Frigorifero"), button:has-text("🧊")').first();
    await fridgeButton.click();
    console.log('✅ Tipo frigorifero selezionato');
    
    // Temperatura
    const tempInput = await page.locator('input[type="number"], input[placeholder*="Temperatura"]').first();
    await tempInput.fill('3');
    console.log('✅ Temperatura impostata: 3°C');
    
    // Categorie - verifica se ci sono bottoni per le categorie
    console.log('🔍 Ricerca categorie prodotti...');
    
    // Prova a cliccare su "Verdure" se presente
    try {
      const verduraButton = await page.locator('button:has-text("Verdure"), button:has-text("Verdura")').first();
      if (await verduraButton.isVisible()) {
        await verduraButton.click();
        console.log('✅ Categoria Verdure selezionata');
      }
    } catch (e) {
      console.log('⚠️ Categoria Verdure non trovata');
    }
    
    // Prova a cliccare su "Carne Fresca" se presente
    try {
      const carneButton = await page.locator('button:has-text("Carne"), button:has-text("Carne Fresca")').first();
      if (await carneButton.isVisible()) {
        await carneButton.click();
        console.log('✅ Categoria Carne selezionata');
      }
    } catch (e) {
      console.log('⚠️ Categoria Carne non trovata');
    }
    
    // Dipartimento (se presente)
    try {
      const departmentSelect = await page.locator('select, [role="combobox"]').first();
      if (await departmentSelect.isVisible()) {
        // Seleziona la prima opzione disponibile (non vuota)
        const options = await departmentSelect.locator('option').all();
        if (options.length > 1) {
          await departmentSelect.selectOption({ index: 1 });
          console.log('✅ Dipartimento selezionato');
        }
      }
    } catch (e) {
      console.log('⚠️ Campo dipartimento non trovato');
    }
    
    // Screenshot prima dell'invio
    await page.screenshot({ path: 'test-form-prima-invio.png' });
    console.log('📸 Screenshot form salvato');
    
    // Submit del form
    console.log('🚀 Invio del form...');
    const submitButton = await page.locator('button:has-text("Crea"), button:has-text("Salva"), button:has-text("Invia"), button[type="submit"]').first();
    await submitButton.click();
    
    // Aspetta il processing
    await page.waitForTimeout(5000);
    
    // Controlla messaggi di successo/errore
    const successMessages = await page.locator('text="successo", text="aggiunto", text="creato", text="inserito", text="punto creato"').all();
    const errorMessages = await page.locator('text="errore", text="error", text="fallito"').all();
    
    if (successMessages.length > 0) {
      console.log('✅ Messaggi di successo trovati:');
      for (const msg of successMessages) {
        console.log('  -', await msg.textContent());
      }
    } else if (errorMessages.length > 0) {
      console.log('❌ Messaggi di errore trovati:');
      for (const msg of errorMessages) {
        console.log('  -', await msg.textContent());
      }
    } else {
      console.log('⚠️ Nessun messaggio di conferma trovato');
    }
    
    // Screenshot finale
    await page.screenshot({ path: 'test-conservazione-final-dettagliato.png' });
    console.log('📸 Screenshot finale salvato');
    
    console.log('🎉 Test completato!');
    
  } catch (error) {
    console.error('❌ Errore durante il test:', error);
    await page.screenshot({ path: 'test-error-dettagliato.png' });
  } finally {
    await browser.close();
  }
}

testConservazioneDettagliato();

