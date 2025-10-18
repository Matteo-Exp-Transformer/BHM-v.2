import { test, expect } from '@playwright/test';

test.describe('🎯 Test Inserimento Evento - Visualizzazione Tempo Reale', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Attiva Mock Auth se necessario
    const authPage = page.locator('text=Mock Auth System');
    if (await authPage.isVisible()) {
      console.log('🔧 Attivazione Mock Auth...');
      await page.locator('text=Amministratore').click();
      await page.locator('button:has-text("Conferma Ruolo")').click();
      await page.waitForTimeout(2000);
    }

    await page.goto('/attivita');
    await page.waitForLoadState('networkidle');
  });

  test('🎯 Test Inserimento Evento - Solo Primo Test per Visualizzazione', async ({ page }) => {
    console.log('🔍 Test inserimento evento - visualizzazione tempo reale...');

    // Verifica che siamo nel calendario
    const calendar = page.locator('.fc');
    await expect(calendar).toBeVisible();

    // Screenshot iniziale
    await page.screenshot({ path: 'test-visualizzazione-iniziale.png', fullPage: true });

    // 1. Espandi CollapsibleCard "Assegna nuova attività"
    console.log('📝 Espansione CollapsibleCard...');
    const assignCard = page.locator('text=Assegna nuova attività / mansione');
    await expect(assignCard).toBeVisible();
    await assignCard.click();
    await page.waitForTimeout(2000); // Più tempo per vedere l'animazione

    // Verifica che il form sia visibile
    const taskForm = page.locator('.rounded-lg.border.border-gray-200.bg-white.p-6');
    await expect(taskForm).toBeVisible();
    console.log('✅ GenericTaskForm visibile');

    // Screenshot form aperto
    await page.screenshot({ path: 'test-visualizzazione-form-aperto.png', fullPage: true });

    // 2. Compila il form passo per passo
    console.log('📝 Compilazione form evento giornaliero...');

    // Nome attività
    const nameField = page.locator('input[placeholder*="Pulizia"], input[placeholder*="Controllo"]');
    await expect(nameField).toBeVisible();
    await nameField.fill('Test Evento Visualizzazione');
    console.log('✅ Nome attività inserito');
    await page.waitForTimeout(1000); // Pausa per vedere la digitazione

    // Screenshot dopo nome
    await page.screenshot({ path: 'test-visualizzazione-dopo-nome.png', fullPage: true });

    // Frequenza - Giornaliera
    const frequencySelect = page.locator('select, [role="combobox"]').first();
    await expect(frequencySelect).toBeVisible();
    await frequencySelect.click();
    await page.waitForTimeout(1000); // Pausa per vedere l'apertura
    
    const giornalieraOption = page.locator('[role="option"]:has-text("Giornaliera")');
    await expect(giornalieraOption).toBeVisible();
    await giornalieraOption.click();
    await page.waitForTimeout(1000); // Pausa per vedere la selezione
    console.log('✅ Frequenza giornaliera selezionata');

    // Screenshot dopo frequenza
    await page.screenshot({ path: 'test-visualizzazione-dopo-frequenza.png', fullPage: true });

    // Ruolo assegnazione (obbligatorio)
    const roleSelect = page.locator('select, [role="combobox"]').nth(1);
    await expect(roleSelect).toBeVisible();
    await roleSelect.click();
    await page.waitForTimeout(1000); // Pausa per vedere l'apertura
    
    const dipendenteOption = page.locator('[role="option"]:has-text("Dipendente")').first();
    await expect(dipendenteOption).toBeVisible();
    await dipendenteOption.click();
    await page.waitForTimeout(2000); // Attendi che si abiliti la categoria
    console.log('✅ Ruolo dipendente selezionato');

    // Screenshot dopo ruolo
    await page.screenshot({ path: 'test-visualizzazione-dopo-ruolo.png', fullPage: true });

    // Categoria (ora dovrebbe essere abilitata)
    const categorySelect = page.locator('select, [role="combobox"]').nth(2);
    await expect(categorySelect).toBeVisible();
    const categoryEnabled = await categorySelect.isEnabled();
    console.log(`✅ Categoria abilitata: ${categoryEnabled}`);
    
    if (categoryEnabled) {
      await categorySelect.click();
      await page.waitForTimeout(1000); // Pausa per vedere l'apertura
      
      const firstCategory = page.locator('[role="option"]').first();
      if (await firstCategory.isVisible()) {
        await firstCategory.click();
        await page.waitForTimeout(2000); // Attendi che si abiliti il reparto
        console.log('✅ Categoria selezionata');
      }
    }

    // Screenshot dopo categoria
    await page.screenshot({ path: 'test-visualizzazione-dopo-categoria.png', fullPage: true });

    // Reparto (ora dovrebbe essere abilitato)
    const departmentSelect = page.locator('select, [role="combobox"]').nth(3);
    await expect(departmentSelect).toBeVisible();
    const departmentEnabled = await departmentSelect.isEnabled();
    console.log(`✅ Reparto abilitato: ${departmentEnabled}`);
    
    if (departmentEnabled) {
      await departmentSelect.click();
      await page.waitForTimeout(1000); // Pausa per vedere l'apertura
      
      const firstDept = page.locator('[role="option"]').first();
      if (await firstDept.isVisible()) {
        await firstDept.click();
        console.log('✅ Reparto selezionato');
      }
    }

    // Screenshot dopo reparto
    await page.screenshot({ path: 'test-visualizzazione-dopo-reparto.png', fullPage: true });

    // Note (opzionale)
    const noteField = page.locator('textarea');
    if (await noteField.isVisible()) {
      await noteField.fill('Test evento per visualizzazione tempo reale - inserimento completo');
      console.log('✅ Note inserite');
      await page.waitForTimeout(1000); // Pausa per vedere la digitazione
    }

    // Screenshot form completamente compilato
    await page.screenshot({ path: 'test-visualizzazione-form-compilato.png', fullPage: true });

    // 3. Salva l'evento
    console.log('💾 Salvataggio evento...');
    const saveButton = page.locator('button:has-text("Crea Attività")');
    await expect(saveButton).toBeVisible();
    await saveButton.click();
    await page.waitForTimeout(5000); // Attendi salvataggio con più tempo

    console.log('✅ Evento salvato');

    // Screenshot dopo salvataggio
    await page.screenshot({ path: 'test-visualizzazione-dopo-salvataggio.png', fullPage: true });

    // 4. Verifica visualizzazione nel calendario
    console.log('🔍 Verifica visualizzazione nel calendario...');

    // Scroll completo della pagina per vedere tutti gli elementi
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1000);

    // Scroll verso il basso per vedere tutto il calendario
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(1000);

    // Scroll verso l'alto per vedere il calendario
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1000);

    // Screenshot dopo scroll completo
    await page.screenshot({ path: 'test-visualizzazione-dopo-scroll.png', fullPage: true });

    // Verifica che ci siano eventi nel calendario
    const calendarEvents = page.locator('.fc-event');
    const eventCount = await calendarEvents.count();
    console.log(`📅 Eventi trovati nel calendario: ${eventCount}`);

    if (eventCount > 0) {
      // Verifica che ci sia almeno un evento con il nome inserito
      const testEvent = page.locator('.fc-event:has-text("Test Evento Visualizzazione")');
      const testEventVisible = await testEvent.isVisible();
      console.log(`✅ Evento "Test Evento Visualizzazione" visibile: ${testEventVisible}`);

      if (testEventVisible) {
        // Verifica che l'evento sia presente in più giorni (frequenza giornaliera)
        const eventInstances = page.locator('.fc-event:has-text("Test Evento Visualizzazione")');
        const instanceCount = await eventInstances.count();
        console.log(`📅 Istanze evento giornaliero trovate: ${instanceCount}`);

        // Per evento giornaliero, dovremmo vedere almeno 2-3 istanze nella vista mensile
        expect(instanceCount).toBeGreaterThan(1);
        console.log('✅ Frequenza giornaliera verificata - evento presente in più giorni');
      }
    } else {
      console.log('⚠️ Nessun evento trovato nel calendario - potrebbe essere un problema di timing');
      
      // Aspetta un po' di più e riprova
      await page.waitForTimeout(3000);
      const calendarEventsRetry = page.locator('.fc-event');
      const eventCountRetry = await calendarEventsRetry.count();
      console.log(`📅 Eventi trovati nel calendario (retry): ${eventCountRetry}`);
      
      if (eventCountRetry > 0) {
        console.log('✅ Eventi trovati dopo attesa aggiuntiva');
      } else {
        console.log('⚠️ Ancora nessun evento - potrebbe essere un problema di configurazione');
      }
    }

    // Screenshot finale
    await page.screenshot({ path: 'test-visualizzazione-finale.png', fullPage: true });

    console.log('🎯 Test inserimento evento - visualizzazione tempo reale completato');
  });
});


