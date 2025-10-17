import { chromium } from 'playwright';

async function testConservazioneConManutenzioni() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🚀 Test conservazione con manutenzioni obbligatorie...');
    
    // Naviga all'applicazione
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Login
    console.log('🔐 Login...');
    const emailInput = await page.locator('input[type="email"]').first();
    await emailInput.fill('matteo.cavallaro.work@gmail.com');
    
    const passwordInput = await page.locator('input[type="password"]').first();
    await passwordInput.fill('cavallaro');
    
    const loginButton = await page.locator('button[type="submit"]').first();
    await loginButton.click();
    await page.waitForTimeout(5000);
    
    // Naviga alla conservazione
    console.log('🔍 Navigazione conservazione...');
    const conservazioneLink = await page.locator('a:has-text("Conservazione")').first();
    await conservazioneLink.click();
    await page.waitForTimeout(3000);
    
    // Clicca su "Aggiungi Punto"
    console.log('➕ Clicco su Aggiungi Punto...');
    const addButton = await page.locator('button:has-text("Aggiungi Punto")').first();
    await addButton.click();
    
    // Aspetta che il modal/form si carichi completamente
    console.log('⏳ Attesa caricamento form...');
    await page.waitForTimeout(5000);
    await page.waitForSelector('input, select, textarea', { timeout: 10000 });
    
    // Compila i dati base
    console.log('📝 Compilazione dati base...');
    
    // Nome del punto
    const nameInput = await page.locator('input[type="text"]').first();
    await nameInput.fill('cazzo');
    console.log('✅ Nome inserito: cazzo');
    
    // Seleziona tipo frigorifero
    const fridgeButton = await page.locator('button:has-text("Frigorifero")').first();
    await fridgeButton.click();
    console.log('✅ Tipo frigorifero selezionato');
    
    // Temperatura
    const tempInput = await page.locator('input[type="number"]').first();
    await tempInput.fill('3');
    console.log('✅ Temperatura inserita: 3°C');
    
    // Categorie
    const verduraButton = await page.locator('button:has-text("Verdure")').first();
    await verduraButton.click();
    console.log('✅ Categoria Verdure selezionata');
    
    const carneButton = await page.locator('button:has-text("Carne")').first();
    await carneButton.click();
    console.log('✅ Categoria Carne selezionata');
    
    // Screenshot prima delle manutenzioni
    await page.screenshot({ path: 'form-prima-manutenzioni.png' });
    console.log('📸 Screenshot prima manutenzioni salvato');
    
    // Configurazione manutenzioni obbligatorie
    console.log('🔧 Configurazione manutenzioni obbligatorie...');
    
    // Aspetta che la sezione manutenzioni sia visibile
    await page.waitForTimeout(2000);
    
    // Cerca tutti i select per frequenza
    const frequenzaSelects = await page.locator('select').all();
    console.log(`Trovati ${frequenzaSelects.length} select per frequenza`);
    
    // Configura ogni manutenzione
    for (let i = 0; i < Math.min(frequenzaSelects.length, 4); i++) {
      try {
        // Prima select: frequenza
        await frequenzaSelects[i].selectOption({ index: 2 }); // Settimanale
        console.log(`✅ Manutenzione ${i + 1}: Frequenza settimanale`);
        
        // Cerca la select successiva per il ruolo
        const nextSelect = await page.locator('select').nth(i + 1);
        if (await nextSelect.isVisible()) {
          await nextSelect.selectOption({ index: 1 }); // Primo ruolo disponibile
          console.log(`✅ Manutenzione ${i + 1}: Ruolo assegnato`);
        }
        
        await page.waitForTimeout(500);
      } catch (e) {
        console.log(`⚠️ Errore configurazione manutenzione ${i + 1}:`, e.message);
      }
    }
    
    // Se ci sono select per giorni personalizzati (custom frequency)
    try {
      const customSelects = await page.locator('select').all();
      for (const select of customSelects) {
        const options = await select.locator('option').all();
        const optionTexts = await Promise.all(options.map(opt => opt.textContent()));
        
        // Se c'è un'opzione "custom" o "personalizzata"
        if (optionTexts.some(text => text && text.toLowerCase().includes('custom'))) {
          await select.selectOption({ label: /custom/i });
          console.log('✅ Frequenza personalizzata selezionata');
          
          // Cerca i pulsanti per i giorni
          const dayButtons = await page.locator('button').all();
          for (const button of dayButtons) {
            const text = await button.textContent();
            if (text && (text.includes('Lunedì') || text.includes('Martedì'))) {
              await button.click();
              console.log(`✅ Giorno ${text} selezionato`);
              break;
            }
          }
        }
      }
    } catch (e) {
      console.log('⚠️ Errore configurazione giorni personalizzati:', e.message);
    }
    
    // Screenshot dopo manutenzioni
    await page.screenshot({ path: 'form-dopo-manutenzioni.png' });
    console.log('📸 Screenshot dopo manutenzioni salvato');
    
    // Submit del form
    console.log('🚀 Invio form...');
    const submitButton = await page.locator('button:has-text("Crea"), button:has-text("Salva")').first();
    await submitButton.click();
    
    // Aspetta il processing
    await page.waitForTimeout(5000);
    
    // Controlla messaggi di successo
    const successElements = await page.locator('*:has-text("successo"), *:has-text("creato"), *:has-text("aggiunto")').all();
    if (successElements.length > 0) {
      console.log('✅ Messaggi di successo trovati!');
      for (const element of successElements) {
        console.log('  -', await element.textContent());
      }
    } else {
      console.log('⚠️ Nessun messaggio di successo trovato');
    }
    
    // Screenshot finale
    await page.screenshot({ path: 'test-finale-con-manutenzioni.png' });
    console.log('🎉 Test completato con manutenzioni!');
    
  } catch (error) {
    console.error('❌ Errore durante il test:', error);
    await page.screenshot({ path: 'test-error-manutenzioni.png' });
  } finally {
    await browser.close();
  }
}

testConservazioneConManutenzioni();

