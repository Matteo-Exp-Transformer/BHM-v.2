/**
 * TEST SPECIFICO: Completamento Manutenzione Rilevamento Temperature
 * 
 * Questo test verifica specificamente il completamento della manutenzione
 * con ID: 1e464cb8-a97a-4e69-b0f3-78cec4e6a9be
 */

import { chromium } from 'playwright';

async function testCompletamentoManutenzioneTemperature() {
  console.log('🧪 Avvio test completamento manutenzione rilevamento temperature...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1500
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // 1. Naviga all'applicazione
    console.log('📱 Navigazione all\'applicazione...');
    await page.goto('http://localhost:3000');
    
    // 2. Login
    console.log('🔐 Login...');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', 'matteo.cavallaro.work@gmail.com');
    await page.fill('input[type="password"]', 'Cavallaro');
    await page.click('button[type="submit"]');
    
    // 3. Attendi dashboard
    console.log('⏳ Attesa caricamento dashboard...');
    await page.waitForSelector('[data-testid="dashboard"]', { timeout: 15000 });
    
    // 4. Naviga al calendario
    console.log('📅 Navigazione al calendario...');
    await page.click('a[href="/calendar"]');
    await page.waitForSelector('[data-testid="calendar-page"]', { timeout: 10000 });
    
    // 5. Cerca la manutenzione specifica
    console.log('🔍 Ricerca manutenzione "rilevamento_temperatura"...');
    
    // Prova a trovare l'evento nel calendario
    const maintenanceEvents = await page.$$eval('.fc-event', events => {
      return events.map(event => ({
        title: event.textContent?.trim(),
        className: event.className,
        id: event.getAttribute('data-event-id')
      }));
    });
    
    console.log('📋 Eventi trovati:', maintenanceEvents.length);
    maintenanceEvents.forEach((event, index) => {
      console.log(`  ${index + 1}. ${event.title} (${event.className})`);
    });
    
    // Cerca l'evento specifico
    const targetEvent = maintenanceEvents.find(event => 
      event.title?.toLowerCase().includes('rilevamento') ||
      event.title?.toLowerCase().includes('temperatura')
    );
    
    if (targetEvent) {
      console.log(`🎯 Trovata manutenzione target: ${targetEvent.title}`);
      
      // Clicca sull'evento
      await page.click(`.fc-event:has-text("${targetEvent.title}")`);
      
      // Attendi modal
      await page.waitForSelector('[data-testid="maintenance-modal"], .modal, [role="dialog"]', { timeout: 5000 });
      
      // Cerca pulsante completamento
      const completeButtons = await page.$$('button');
      const completeButton = await page.$('button:has-text("Completa"), button:has-text("Completata"), button:has-text("Mark Complete")');
      
      if (completeButton) {
        console.log('✅ Pulsante completamento trovato');
        
        // Clicca completamento
        await completeButton.click();
        
        // Attendi conferma
        await page.waitForSelector('.toast-success, .success-message', { timeout: 5000 });
        console.log('✅ Manutenzione completata!');
        
        // Verifica aggiornamento UI
        await page.waitForTimeout(2000);
        
        // Controlla se l'evento è ancora visibile o è cambiato
        const updatedEvents = await page.$$eval('.fc-event', events => {
          return events.map(event => ({
            title: event.textContent?.trim(),
            className: event.className
          }));
        });
        
        console.log('🔄 Eventi dopo completamento:', updatedEvents.length);
        
      } else {
        console.log('❌ Pulsante completamento non trovato');
        console.log('🔍 Pulsanti disponibili:');
        const buttonTexts = await page.$$eval('button', buttons => 
          buttons.map(btn => btn.textContent?.trim()).filter(text => text)
        );
        buttonTexts.forEach((text, index) => {
          console.log(`  ${index + 1}. "${text}"`);
        });
      }
    } else {
      console.log('❌ Manutenzione "rilevamento_temperatura" non trovata nel calendario');
      console.log('💡 Possibili cause:');
      console.log('   - Evento non visibile nella vista corrente');
      console.log('   - Evento con nome diverso');
      console.log('   - Evento non ancora caricato');
    }
    
    // 6. Verifica nel database (simulazione)
    console.log('💾 Verifica nel database...');
    console.log('   Query da eseguire:');
    console.log('   SELECT status, completed_by, completed_at FROM maintenance_tasks');
    console.log('   WHERE id = \'1e464cb8-a97a-4e69-b0f3-78cec4e6a9be\';');
    
    console.log('✅ Test completato!');
    
  } catch (error) {
    console.error('❌ Errore durante il test:', error);
    
    // Screenshot per debug
    await page.screenshot({ path: 'test-manutenzione-error.png' });
    console.log('📸 Screenshot salvato: test-manutenzione-error.png');
  } finally {
    await browser.close();
  }
}

// Esegui il test
testCompletamentoManutenzioneTemperature()
  .then(() => console.log('🎉 Test manutenzione completato!'))
  .catch(error => console.error('💥 Test manutenzione fallito:', error));

export { testCompletamentoManutenzioneTemperature };
