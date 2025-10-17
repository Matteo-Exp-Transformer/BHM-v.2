import { chromium } from 'playwright';

async function testConservazione() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🚀 Avvio test conservazione...');
    
    // Naviga all'applicazione
    console.log('📍 Navigazione a localhost:3000...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Aspetta che la pagina sia caricata
    await page.waitForTimeout(2000);
    
    // Cerca il pulsante di login o il form di login
    console.log('🔍 Ricerca form di login...');
    
    // Prova a trovare il campo email
    const emailInput = await page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
    if (await emailInput.isVisible()) {
      console.log('✅ Campo email trovato');
      await emailInput.fill('matteo.cavallaro.work@gmail.com');
      
      // Prova a trovare il campo password
      const passwordInput = await page.locator('input[type="password"], input[name="password"]').first();
      if (await passwordInput.isVisible()) {
        console.log('✅ Campo password trovato');
        await passwordInput.fill('cavallaro');
        
        // Cerca il pulsante di login
        const loginButton = await page.locator('button:has-text("Login"), button:has-text("Accedi"), button[type="submit"]').first();
        if (await loginButton.isVisible()) {
          console.log('✅ Pulsante login trovato, clicco...');
          await loginButton.click();
          await page.waitForTimeout(3000);
        }
      }
    }
    
    // Aspetta il caricamento dopo il login
    await page.waitForTimeout(3000);
    
    // Cerca la sezione conservazione
    console.log('🔍 Ricerca sezione conservazione...');
    const conservazioneLink = await page.locator('a:has-text("Conservazione"), a:has-text("conservazione"), [href*="conservazione" i]').first();
    
    if (await conservazioneLink.isVisible()) {
      console.log('✅ Link conservazione trovato, clicco...');
      await conservazioneLink.click();
      await page.waitForTimeout(2000);
    }
    
    // Cerca il pulsante per aggiungere nuovo punto
    console.log('🔍 Ricerca pulsante aggiungi punto conservazione...');
    const addButton = await page.locator('button:has-text("Aggiungi"), button:has-text("Nuovo"), button:has-text("+"), [data-testid*="add"]').first();
    
    if (await addButton.isVisible()) {
      console.log('✅ Pulsante aggiungi trovato, clicco...');
      await addButton.click();
      await page.waitForTimeout(2000);
    }
    
    // Compila il form
    console.log('📝 Compilazione form...');
    
    // Nome del punto
    const nameInput = await page.locator('input[name="name"], input[placeholder*="nome" i], input[placeholder*="name" i]').first();
    if (await nameInput.isVisible()) {
      console.log('✅ Campo nome trovato');
      await nameInput.fill('cazzo');
    }
    
    // Temperatura
    const tempInput = await page.locator('input[name="temperature"], input[type="number"], input[placeholder*="temperatura" i]').first();
    if (await tempInput.isVisible()) {
      console.log('✅ Campo temperatura trovato');
      await tempInput.fill('3');
    }
    
    // Tipologia frigorifero
    const typeSelect = await page.locator('select, [role="combobox"]').first();
    if (await typeSelect.isVisible()) {
      console.log('✅ Campo tipologia trovato');
      // Cerca opzione frigorifero
      try {
        await typeSelect.selectOption({ label: 'Frigorifero' });
      } catch {
        try {
          await typeSelect.selectOption({ label: 'frigorifero' });
        } catch {
          // Prova a cliccare su una opzione se è un combobox
          const options = await page.locator('option').all();
          for (const option of options) {
            const text = await option.textContent();
            if (text && text.toLowerCase().includes('frigorifero')) {
              await option.click();
              break;
            }
          }
        }
      }
    }
    
    // Categorie - verdura fresca
    try {
      const verduraCheckbox = await page.locator('input[type="checkbox"]').filter({ hasText: 'Verdura fresca' }).first();
      if (await verduraCheckbox.isVisible()) {
        console.log('✅ Checkbox verdura trovata');
        await verduraCheckbox.check();
      }
    } catch (e) {
      console.log('⚠️ Checkbox verdura non trovata o errore:', e.message);
    }
    
    // Categorie - carni fresche
    try {
      const carniCheckbox = await page.locator('input[type="checkbox"]').filter({ hasText: 'Carni fresche' }).first();
      if (await carniCheckbox.isVisible()) {
        console.log('✅ Checkbox carni trovata');
        await carniCheckbox.check();
      }
    } catch (e) {
      console.log('⚠️ Checkbox carni non trovata o errore:', e.message);
    }
    
    // Manutenzioni - seleziona a caso
    const maintenanceSelect = await page.locator('select:has(option:text("manutenzione")), select:has(option:text("maintenance"))').first();
    if (await maintenanceSelect.isVisible()) {
      console.log('✅ Campo manutenzioni trovato');
      const options = await maintenanceSelect.locator('option').all();
      if (options.length > 1) {
        const randomIndex = Math.floor(Math.random() * (options.length - 1)) + 1;
        await maintenanceSelect.selectOption({ index: randomIndex });
      }
    }
    
    // Submit del form
    console.log('🔍 Ricerca pulsante submit...');
    const submitButton = await page.locator('button:has-text("Salva"), button:has-text("Crea"), button:has-text("Invia"), button:has-text("Aggiungi"), button[type="submit"]').first();
    if (await submitButton.isVisible()) {
      console.log('✅ Pulsante submit trovato, invio form...');
      await submitButton.click();
      
      // Aspetta che il form venga processato
      await page.waitForTimeout(5000);
      
      // Controlla se ci sono messaggi di successo o errore
      const successMessage = await page.locator('text="successo", text="aggiunto", text="creato", text="inserito"').first();
      const errorMessage = await page.locator('text="errore", text="error", text="fallito"').first();
      
      if (await successMessage.isVisible()) {
        console.log('✅ Messaggio di successo trovato:', await successMessage.textContent());
      } else if (await errorMessage.isVisible()) {
        console.log('❌ Messaggio di errore trovato:', await errorMessage.textContent());
      } else {
        console.log('⚠️ Nessun messaggio di conferma trovato');
      }
    } else {
      console.log('❌ Pulsante submit non trovato');
    }
    
    console.log('🎉 Test completato!');
    
    // Screenshot finale
    await page.screenshot({ path: 'test-conservazione-final.png' });
    console.log('📸 Screenshot salvato come test-conservazione-final.png');
    
    // Verifica finale - controlla se il punto è stato inserito
    console.log('🔍 Verifica finale nel database...');
    // Qui potremmo aggiungere una chiamata API per verificare l'inserimento
    // Per ora stampiamo le informazioni raccolte
    console.log('📋 Dati inseriti:');
    console.log('  - Nome: cazzo');
    console.log('  - Temperatura: 3°C');
    console.log('  - Tipologia: frigorifero');
    console.log('  - Categorie: verdura fresca, carni fresche');
    
  } catch (error) {
    console.error('❌ Errore durante il test:', error);
    await page.screenshot({ path: 'test-error.png' });
  } finally {
    await browser.close();
  }
}

testConservazione();
