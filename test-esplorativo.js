import { chromium } from 'playwright';

async function testEsplorativo() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🔍 Test esplorativo per capire la struttura...');
    
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
    
    // Screenshot della pagina conservazione
    await page.screenshot({ path: 'conservazione-page.png' });
    console.log('📸 Screenshot pagina conservazione salvato');
    
    // Cerca tutti i pulsanti
    console.log('🔍 Ricerca pulsanti...');
    const buttons = await page.locator('button').all();
    console.log(`Trovati ${buttons.length} pulsanti:`);
    for (let i = 0; i < Math.min(buttons.length, 10); i++) {
      const text = await buttons[i].textContent();
      console.log(`  ${i + 1}. "${text}"`);
    }
    
    // Cerca il pulsante per aggiungere
    const addButton = await page.locator('button:has-text("Aggiungi"), button:has-text("Nuovo"), button:has-text("+")').first();
    if (await addButton.isVisible()) {
      console.log('✅ Pulsante aggiungi trovato, clicco...');
      await addButton.click();
      await page.waitForTimeout(3000);
      
      // Screenshot del form
      await page.screenshot({ path: 'form-found--conservazione.png' });
      console.log('📸 Screenshot form salvato');
      
      // Cerca tutti gli input nel form
      console.log('🔍 Ricerca input nel form...');
      const inputs = await page.locator('input').all();
      console.log(`Trovati ${inputs.length} input:`);
      for (let i = 0; i < inputs.length; i++) {
        const type = await inputs[i].getAttribute('type');
        const placeholder = await inputs[i].getAttribute('placeholder');
        const name = await inputs[i].getAttribute('name');
        const id = await inputs[i].getAttribute('id');
        console.log(`  ${i + 1}. type="${type}", placeholder="${placeholder}", name="${name}", id="${id}"`);
      }
      
      // Cerca tutti i select
      const selects = await page.locator('select').all();
      console.log(`Trovati ${selects.length} select:`);
      for (let i = 0; i < selects.length; i++) {
        const name = await selects[i].getAttribute('name');
        const id = await selects[i].getAttribute('id');
        console.log(`  ${i + 1}. name="${name}", id="${id}"`);
      }
      
    } else {
      console.log('❌ Pulsante aggiungi non trovato');
    }
    
  } catch (error) {
    console.error('❌ Errore durante il test:', error);
    await page.screenshot({ path: 'test-error-esplorativo.png' });
  } finally {
    await browser.close();
  }
}

testEsplorativo();

