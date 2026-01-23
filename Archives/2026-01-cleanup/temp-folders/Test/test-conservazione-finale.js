import { chromium } from 'playwright';

async function testConservazioneFinale() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🚀 Test finale conservazione con gestione React...');
    
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
    
    // Aspetta che gli elementi React siano renderizzati
    await page.waitForSelector('input, select, textarea', { timeout: 10000 });
    
    // Screenshot del form caricato
    await page.screenshot({ path: 'form-caricato-completo.png' });
    console.log('📸 Screenshot form completo salvato');
    
    // Cerca il campo nome con diversi selettori
    console.log('🔍 Ricerca campo nome...');
    let nameInput = null;
    
    try {
      // Prova diversi selettori per il nome
      const selectors = [
        'input[placeholder*="Frigorifero"]',
        'input[placeholder*="Punto"]',
        'input[placeholder*="Nome"]',
        'input[name="name"]',
        'input[id*="name"]',
        'input[type="text"]'
      ];
      
      for (const selector of selectors) {
        try {
          nameInput = await page.locator(selector).first();
          if (await nameInput.isVisible()) {
            console.log(`✅ Campo nome trovato con selettore: ${selector}`);
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      if (nameInput && await nameInput.isVisible()) {
        await nameInput.fill('cazzo');
        console.log('✅ Nome inserito: cazzo');
      } else {
        console.log('❌ Campo nome non trovato');
      }
      
    } catch (e) {
      console.log('❌ Errore nella ricerca del campo nome:', e.message);
    }
    
    // Cerca il tipo frigorifero
    console.log('🔍 Ricerca selezione tipo...');
    try {
      // Prova a cliccare sui pulsanti del tipo
      const typeButtons = await page.locator('button').all();
      for (const button of typeButtons) {
        const text = await button.textContent();
        if (text && (text.includes('Frigorifero') || text.includes('🧊'))) {
          console.log(`✅ Trovato pulsante tipo: ${text}`);
          await button.click();
          break;
        }
      }
    } catch (e) {
      console.log('⚠️ Errore nella selezione del tipo:', e.message);
    }
    
    // Cerca il campo temperatura
    console.log('🔍 Ricerca campo temperatura...');
    try {
      const tempInput = await page.locator('input[type="number"]').first();
      if (await tempInput.isVisible()) {
        await tempInput.fill('3');
        console.log('✅ Temperatura inserita: 3°C');
      }
    } catch (e) {
      console.log('⚠️ Campo temperatura non trovato');
    }
    
    // Cerca le categorie
    console.log('🔍 Ricerca categorie...');
    try {
      const allButtons = await page.locator('button').all();
      for (const button of allButtons) {
        const text = await button.textContent();
        if (text && (text.includes('Verdure') || text.includes('Carne'))) {
          console.log(`✅ Categoria trovata: ${text}`);
          await button.click();
          await page.waitForTimeout(500);
        }
      }
    } catch (e) {
      console.log('⚠️ Errore nella selezione categorie:', e.message);
    }
    
    // Screenshot prima dell'invio
    await page.screenshot({ path: 'form-prima-invio-finale.png' });
    
    // Cerca e clicca il pulsante di submit
    console.log('🚀 Invio form...');
    try {
      const submitButtons = await page.locator('button').all();
      for (const button of submitButtons) {
        const text = await button.textContent();
        if (text && (text.includes('Crea') || text.includes('Salva') || text.includes('Invia'))) {
          console.log(`✅ Pulsante submit trovato: ${text}`);
          await button.click();
          break;
        }
      }
      
      // Aspetta il processing
      await page.waitForTimeout(5000);
      
      // Controlla messaggi di successo
      const successElements = await page.locator('*:has-text("successo"), *:has-text("creato"), *:has-text("aggiunto")').all();
      if (successElements.length > 0) {
        console.log('✅ Messaggi di successo trovati!');
      } else {
        console.log('⚠️ Nessun messaggio di successo trovato');
      }
      
    } catch (e) {
      console.log('❌ Errore nell\'invio del form:', e.message);
    }
    
    // Screenshot finale
    await page.screenshot({ path: 'test-finale-completato.png' });
    console.log('🎉 Test completato!');
    
  } catch (error) {
    console.error('❌ Errore durante il test:', error);
    await page.screenshot({ path: 'test-error-finale.png' });
  } finally {
    await browser.close();
  }
}

testConservazioneFinale();

