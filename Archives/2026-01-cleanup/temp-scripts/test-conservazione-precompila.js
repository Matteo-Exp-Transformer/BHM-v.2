import { chromium } from 'playwright';

async function testConservazionePrecompila() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🚀 Test conservazione con precompilazione...');
    
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
    
    // Cerca il pulsante "Precompila" (DevButton)
    console.log('🔍 Ricerca pulsante Precompila...');
    const precompilaButton = await page.locator('button:has-text("Precompila")').first();
    
    if (await precompilaButton.isVisible()) {
      console.log('✅ Pulsante Precompila trovato, clicco...');
      await precompilaButton.click();
      await page.waitForTimeout(3000);
      
      // Cerca il pulsante "Completa Onboarding"
      const completaButton = await page.locator('button:has-text("Completa Onboarding"), button:has-text("Completa")').first();
      if (await completaButton.isVisible()) {
        console.log('✅ Pulsante Completa Onboarding trovato, clicco...');
        await completaButton.click();
        await page.waitForTimeout(5000);
      }
    }
    
    // Naviga alla conservazione
    console.log('🔍 Navigazione conservazione...');
    const conservazioneLink = await page.locator('a:has-text("Conservazione")').first();
    await conservazioneLink.click();
    await page.waitForTimeout(3000);
    
    // Screenshot della pagina conservazione
    await page.screenshot({ path: 'conservazione-dopo-precompila.png' });
    console.log('📸 Screenshot conservazione salvato');
    
    // Verifica se ci sono punti di conservazione precompilati
    const conservationPoints = await page.locator('[data-testid*="conservation"], .conservation-point, .point-card').all();
    console.log(`Trovati ${conservationPoints.length} punti di conservazione`);
    
    // Se ci sono punti, prova ad aggiungerne uno nuovo
    console.log('➕ Provo ad aggiungere nuovo punto...');
    const addButton = await page.locator('button:has-text("Aggiungi"), button:has-text("Nuovo"), button:has-text("+")').first();
    
    if (await addButton.isVisible()) {
      console.log('✅ Pulsante aggiungi trovato, clicco...');
      await addButton.click();
      await page.waitForTimeout(3000);
      
      // Screenshot del form
      await page.screenshot({ path: 'form-dopo-precompila.png' });
      console.log('📸 Screenshot form salvato');
      
      // Cerca tutti gli elementi del form
      const inputs = await page.locator('input').all();
      const selects = await page.locator('select').all();
      const buttons = await page.locator('button').all();
      
      console.log(`Form trovato: ${inputs.length} input, ${selects.length} select, ${buttons.length} button`);
      
      // Prova a compilare il form se possibile
      try {
        // Cerca il campo nome
        for (const input of inputs) {
          const placeholder = await input.getAttribute('placeholder');
          const name = await input.getAttribute('name');
          const id = await input.getAttribute('id');
          
          if (placeholder && placeholder.toLowerCase().includes('nome')) {
            await input.fill('cazzo');
            console.log('✅ Nome inserito: cazzo');
            break;
          }
        }
        
        // Cerca pulsanti per il tipo
        for (const button of buttons) {
          const text = await button.textContent();
          if (text && text.includes('Frigorifero')) {
            await button.click();
            console.log('✅ Tipo frigorifero selezionato');
            break;
          }
        }
        
        // Cerca campo temperatura
        for (const input of inputs) {
          const type = await input.getAttribute('type');
          if (type === 'number') {
            await input.fill('3');
            console.log('✅ Temperatura inserita: 3°C');
            break;
          }
        }
        
        // Cerca categorie
        for (const button of buttons) {
          const text = await button.textContent();
          if (text && (text.includes('Verdure') || text.includes('Carne'))) {
            await button.click();
            console.log(`✅ Categoria ${text} selezionata`);
            await page.waitForTimeout(500);
          }
        }
        
        // Configura manutenzioni se ci sono select
        for (let i = 0; i < Math.min(selects.length, 8); i += 2) {
          try {
            // Frequenza
            await selects[i].selectOption({ index: 2 });
            console.log(`✅ Manutenzione ${Math.floor(i/2) + 1}: Frequenza configurata`);
            
            // Ruolo
            if (selects[i + 1]) {
              await selects[i + 1].selectOption({ index: 1 });
              console.log(`✅ Manutenzione ${Math.floor(i/2) + 1}: Ruolo configurato`);
            }
            
            await page.waitForTimeout(500);
          } catch (e) {
            console.log(`⚠️ Errore configurazione manutenzione ${Math.floor(i/2) + 1}`);
          }
        }
        
        // Screenshot prima dell'invio
        await page.screenshot({ path: 'form-pronto-per-invio.png' });
        
        // Cerca pulsante submit
        for (const button of buttons) {
          const text = await button.textContent();
          if (text && (text.includes('Crea') || text.includes('Salva'))) {
            await button.click();
            console.log(`✅ Form inviato con pulsante: ${text}`);
            break;
          }
        }
        
        await page.waitForTimeout(5000);
        
        // Screenshot finale
        await page.screenshot({ path: 'test-finale-precompila.png' });
        console.log('🎉 Test completato!');
        
      } catch (e) {
        console.log('⚠️ Errore nella compilazione del form:', e.message);
      }
      
    } else {
      console.log('❌ Pulsante aggiungi non trovato');
    }
    
  } catch (error) {
    console.error('❌ Errore durante il test:', error);
    await page.screenshot({ path: 'test-error-precompila.png' });
  } finally {
    await browser.close();
  }
}

testConservazionePrecompila();

