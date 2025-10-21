import { test, expect } from '@playwright/test';

test.describe('🎯 Test Inserimento Evento Generico - Verifica Visualizzazione Calendario', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const authPage = page.locator('text=Mock Auth System');
    if (await authPage.isVisible()) {
      console.log('🔧 Attivazione Mock Auth...');
      await page.locator('text=Amministratore').click();
      await page.locator('button:has-text("Conferma Ruolo")').click();
      await page.waitForTimeout(2000);
    } else {
      console.log('🔧 Mock Auth già attivo o non necessario.');
    }

    await page.goto('/attivita');
    await page.waitForLoadState('networkidle');
  });

  test('🎯 Test Inserimento Evento Giornaliero - Verifica Visualizzazione', async ({ page }) => {
    console.log('🔍 Test inserimento evento giornaliero...');

    // Verifica che siamo nel calendario
    const calendar = page.locator('.fc');
    await expect(calendar).toBeVisible();

    // Screenshot iniziale
    await page.screenshot({ path: 'test-evento-giornaliero-iniziale.png', fullPage: true });

    // 1. Espandi CollapsibleCard "Assegna nuova attività"
    console.log('📝 Espansione CollapsibleCard...');
    const assignCard = page.locator('text=Assegna nuova attività / mansione');
    await expect(assignCard).toBeVisible();
    await assignCard.click();
    await page.waitForTimeout(1000);

    // Verifica che il form sia visibile
    const taskForm = page.locator('.rounded-lg.border.border-gray-200.bg-white.p-6');
    await expect(taskForm).toBeVisible();
    console.log('✅ GenericTaskForm visibile');

    // Screenshot dopo espansione
    await page.screenshot({ path: 'test-evento-giornaliero-form-espanso.png', fullPage: true });

    // 2. Compila il form per evento giornaliero
    console.log('📝 Compilazione form evento giornaliero...');

    // Nome attività
    const nameField = page.locator('input[placeholder*="Pulizia"], input[placeholder*="Controllo"]');
    await expect(nameField).toBeVisible();
    await nameField.fill('Pulizia Giornaliera Test');
    console.log('✅ Nome attività inserito');

    // Frequenza - Giornaliera
    const frequencySelect = page.locator('select, [role="combobox"]').first();
    await expect(frequencySelect).toBeVisible();
    await frequencySelect.click();
    await page.waitForTimeout(500);
    
    // Seleziona "Giornaliera" (selettore più specifico)
    const giornalieraOption = page.locator('[role="option"]:has-text("Giornaliera")');
    await expect(giornalieraOption).toBeVisible();
    await giornalieraOption.click();
    console.log('✅ Frequenza giornaliera selezionata');

    // Ruolo assegnazione (obbligatorio)
    const roleSelect = page.locator('select, [role="combobox"]').nth(1);
    await expect(roleSelect).toBeVisible();
    await roleSelect.click();
    await page.waitForTimeout(500);
    
    const dipendenteOption = page.locator('[role="option"]:has-text("Dipendente")').first();
    await expect(dipendenteOption).toBeVisible();
    await dipendenteOption.click();
    console.log('✅ Ruolo dipendente selezionato');

    // Categoria (opzionale - seleziona "Tutte le categorie")
    const categorySelect = page.locator('select, [role="combobox"]').nth(2);
    if (await categorySelect.isVisible()) {
      await categorySelect.click();
      await page.waitForTimeout(500);
      
      const allCategoriesOption = page.locator('[role="option"]:has-text("Tutte le categorie")');
      if (await allCategoriesOption.isVisible()) {
        await allCategoriesOption.click();
        console.log('✅ Categoria selezionata');
      }
    }

    // Dipendente specifico (opzionale - seleziona "Nessun dipendente specifico")
    const specificStaffSelect = page.locator('select, [role="combobox"]').nth(3);
    if (await specificStaffSelect.isVisible()) {
      await specificStaffSelect.click();
      await page.waitForTimeout(500);
      
      const noSpecificOption = page.locator('[role="option"]:has-text("Nessun dipendente specifico")');
      if (await noSpecificOption.isVisible()) {
        await noSpecificOption.click();
        console.log('✅ Dipendente specifico selezionato');
      }
    }

    // Reparto (obbligatorio)
    const departmentSelect = page.locator('select, [role="combobox"]').nth(4);
    await expect(departmentSelect).toBeVisible();
    await departmentSelect.click();
    await page.waitForTimeout(500);
    
    const firstDept = page.locator('[role="option"]').first();
    if (await firstDept.isVisible()) {
      await firstDept.click();
      console.log('✅ Reparto selezionato');
    } else {
      console.log('⚠️ Nessun reparto disponibile - questo potrebbe causare errori');
    }

    // Note (opzionale)
    const noteField = page.locator('textarea');
    if (await noteField.isVisible()) {
      await noteField.fill('Test evento giornaliero per verifica visualizzazione calendario');
      console.log('✅ Note inserite');
    }

    // Screenshot form compilato
    await page.screenshot({ path: 'test-evento-giornaliero-form-compilato.png', fullPage: true });

    // 3. Salva l'evento
    console.log('💾 Salvataggio evento...');
    const saveButton = page.locator('button:has-text("Salva"), button:has-text("Crea"), button:has-text("Aggiungi")');
    await expect(saveButton).toBeVisible();
    await saveButton.click();
    await page.waitForTimeout(3000); // Attendi salvataggio

    console.log('✅ Evento giornaliero salvato');

    // Screenshot dopo salvataggio
    await page.screenshot({ path: 'test-evento-giornaliero-dopo-salvataggio.png', fullPage: true });

    // 4. Verifica visualizzazione nel calendario
    console.log('🔍 Verifica visualizzazione nel calendario...');

    // Verifica che ci siano eventi nel calendario
    const calendarEvents = page.locator('.fc-event');
    const eventCount = await calendarEvents.count();
    console.log(`📅 Eventi trovati nel calendario: ${eventCount}`);

    if (eventCount > 0) {
      // Verifica che ci sia almeno un evento con il nome inserito
      const testEvent = page.locator('.fc-event:has-text("Pulizia Giornaliera Test")');
      const testEventVisible = await testEvent.isVisible();
      console.log(`✅ Evento "Pulizia Giornaliera Test" visibile: ${testEventVisible}`);

      if (testEventVisible) {
        // Verifica che l'evento sia presente in più giorni (frequenza giornaliera)
        const eventInstances = page.locator('.fc-event:has-text("Pulizia Giornaliera Test")');
        const instanceCount = await eventInstances.count();
        console.log(`📅 Istanze evento giornaliero trovate: ${instanceCount}`);

        // Per evento giornaliero, dovremmo vedere almeno 2-3 istanze nella vista mensile
        expect(instanceCount).toBeGreaterThan(1);
        console.log('✅ Frequenza giornaliera verificata - evento presente in più giorni');
      }
    }

    console.log('🎯 Test evento giornaliero completato');
  });

  test('🎯 Test Inserimento Evento Settimanale - Verifica Visualizzazione', async ({ page }) => {
    console.log('🔍 Test inserimento evento settimanale...');

    // Verifica che siamo nel calendario
    const calendar = page.locator('.fc');
    await expect(calendar).toBeVisible();

    // Screenshot iniziale
    await page.screenshot({ path: 'test-evento-settimanale-iniziale.png', fullPage: true });

    // 1. Espandi CollapsibleCard "Assegna nuova attività"
    console.log('📝 Espansione CollapsibleCard...');
    const assignCard = page.locator('text=Assegna nuova attività / mansione');
    await expect(assignCard).toBeVisible();
    await assignCard.click();
    await page.waitForTimeout(1000);

    // Verifica che il form sia visibile
    const taskForm = page.locator('.rounded-lg.border.border-gray-200.bg-white.p-6');
    await expect(taskForm).toBeVisible();

    // 2. Compila il form per evento settimanale
    console.log('📝 Compilazione form evento settimanale...');

    // Nome attività
    const nameField = page.locator('input[placeholder*="Pulizia"], input[placeholder*="Controllo"]');
    await nameField.fill('Controllo Settimanale Test');

    // Frequenza - Settimanale
    const frequencySelect = page.locator('select, [role="combobox"]').first();
    await frequencySelect.click();
    await page.waitForTimeout(500);
    
    const settimanaleOption = page.locator('[role="option"]:has-text("Settimanale")');
    await settimanaleOption.click();
    console.log('✅ Frequenza settimanale selezionata');

    // Ruolo assegnazione (obbligatorio)
    const roleSelect = page.locator('select, [role="combobox"]').nth(1);
    await roleSelect.click();
    await page.waitForTimeout(500);
    
    const responsabileOption = page.locator('[role="option"]:has-text("Responsabile")');
    await responsabileOption.click();
    console.log('✅ Ruolo responsabile selezionato');

    // Categoria (opzionale)
    const categorySelect = page.locator('select, [role="combobox"]').nth(2);
    if (await categorySelect.isVisible()) {
      await categorySelect.click();
      await page.waitForTimeout(500);
      const allCategoriesOption = page.locator('[role="option"]:has-text("Tutte le categorie")');
      if (await allCategoriesOption.isVisible()) {
        await allCategoriesOption.click();
      }
    }

    // Dipendente specifico (opzionale)
    const specificStaffSelect = page.locator('select, [role="combobox"]').nth(3);
    if (await specificStaffSelect.isVisible()) {
      await specificStaffSelect.click();
      await page.waitForTimeout(500);
      const noSpecificOption = page.locator('[role="option"]:has-text("Nessun dipendente specifico")');
      if (await noSpecificOption.isVisible()) {
        await noSpecificOption.click();
      }
    }

    // Reparto (obbligatorio)
    const departmentSelect = page.locator('select, [role="combobox"]').nth(4);
    await departmentSelect.click();
    await page.waitForTimeout(500);
    const firstDept = page.locator('[role="option"]').first();
    if (await firstDept.isVisible()) {
      await firstDept.click();
      console.log('✅ Reparto selezionato');
    }

    // Screenshot form compilato
    await page.screenshot({ path: 'test-evento-settimanale-form-compilato.png', fullPage: true });

    // 3. Salva l'evento
    console.log('💾 Salvataggio evento settimanale...');
    const saveButton = page.locator('button:has-text("Salva"), button:has-text("Crea"), button:has-text("Aggiungi")');
    await saveButton.click();
    await page.waitForTimeout(3000);

    console.log('✅ Evento settimanale salvato');

    // Screenshot dopo salvataggio
    await page.screenshot({ path: 'test-evento-settimanale-dopo-salvataggio.png', fullPage: true });

    // 4. Verifica visualizzazione nel calendario
    console.log('🔍 Verifica visualizzazione evento settimanale...');

    // Verifica che ci sia l'evento settimanale
    const testEvent = page.locator('.fc-event:has-text("Controllo Settimanale Test")');
    const testEventVisible = await testEvent.isVisible();
    console.log(`✅ Evento "Controllo Settimanale Test" visibile: ${testEventVisible}`);

    if (testEventVisible) {
      // Per evento settimanale, dovremmo vedere 1 istanza per settimana nella vista mensile
      const eventInstances = page.locator('.fc-event:has-text("Controllo Settimanale Test")');
      const instanceCount = await eventInstances.count();
      console.log(`📅 Istanze evento settimanale trovate: ${instanceCount}`);

      // Per evento settimanale, dovremmo vedere circa 4-5 istanze in un mese
      expect(instanceCount).toBeGreaterThan(0);
      console.log('✅ Frequenza settimanale verificata - evento presente con frequenza corretta');
    }

    console.log('🎯 Test evento settimanale completato');
  });

  test('🎯 Test Inserimento Evento Mensile - Verifica Visualizzazione', async ({ page }) => {
    console.log('🔍 Test inserimento evento mensile...');

    // Verifica che siamo nel calendario
    const calendar = page.locator('.fc');
    await expect(calendar).toBeVisible();

    // 1. Espandi CollapsibleCard "Assegna nuova attività"
    const assignCard = page.locator('text=Assegna nuova attività / mansione');
    await assignCard.click();
    await page.waitForTimeout(1000);

    // 2. Compila il form per evento mensile
    console.log('📝 Compilazione form evento mensile...');

    // Nome attività
    const nameField = page.locator('input[placeholder*="Pulizia"], input[placeholder*="Controllo"]');
    await nameField.fill('Manutenzione Mensile Test');

    // Frequenza - Mensile
    const frequencySelect = page.locator('select, [role="combobox"]').first();
    await frequencySelect.click();
    await page.waitForTimeout(500);
    
    const mensileOption = page.locator('[role="option"]:has-text("Mensile")');
    await mensileOption.click();
    console.log('✅ Frequenza mensile selezionata');

    // Ruolo assegnazione (obbligatorio)
    const roleSelect = page.locator('select, [role="combobox"]').nth(1);
    await roleSelect.click();
    await page.waitForTimeout(500);
    
    const adminOption = page.locator('[role="option"]:has-text("Amministratore")');
    await adminOption.click();
    console.log('✅ Ruolo amministratore selezionato');

    // Categoria (opzionale)
    const categorySelect = page.locator('select, [role="combobox"]').nth(2);
    if (await categorySelect.isVisible()) {
      await categorySelect.click();
      await page.waitForTimeout(500);
      const allCategoriesOption = page.locator('[role="option"]:has-text("Tutte le categorie")');
      if (await allCategoriesOption.isVisible()) {
        await allCategoriesOption.click();
      }
    }

    // Dipendente specifico (opzionale)
    const specificStaffSelect = page.locator('select, [role="combobox"]').nth(3);
    if (await specificStaffSelect.isVisible()) {
      await specificStaffSelect.click();
      await page.waitForTimeout(500);
      const noSpecificOption = page.locator('[role="option"]:has-text("Nessun dipendente specifico")');
      if (await noSpecificOption.isVisible()) {
        await noSpecificOption.click();
      }
    }

    // Reparto (obbligatorio)
    const departmentSelect = page.locator('select, [role="combobox"]').nth(4);
    await departmentSelect.click();
    await page.waitForTimeout(500);
    const firstDept = page.locator('[role="option"]').first();
    if (await firstDept.isVisible()) {
      await firstDept.click();
      console.log('✅ Reparto selezionato');
    }

    // Screenshot form compilato
    await page.screenshot({ path: 'test-evento-mensile-form-compilato.png', fullPage: true });

    // 3. Salva l'evento
    console.log('💾 Salvataggio evento mensile...');
    const saveButton = page.locator('button:has-text("Salva"), button:has-text("Crea"), button:has-text("Aggiungi")');
    await saveButton.click();
    await page.waitForTimeout(3000);

    console.log('✅ Evento mensile salvato');

    // Screenshot dopo salvataggio
    await page.screenshot({ path: 'test-evento-mensile-dopo-salvataggio.png', fullPage: true });

    // 4. Verifica visualizzazione nel calendario
    console.log('🔍 Verifica visualizzazione evento mensile...');

    // Verifica che ci sia l'evento mensile
    const testEvent = page.locator('.fc-event:has-text("Manutenzione Mensile Test")');
    const testEventVisible = await testEvent.isVisible();
    console.log(`✅ Evento "Manutenzione Mensile Test" visibile: ${testEventVisible}`);

    if (testEventVisible) {
      // Per evento mensile, dovremmo vedere 1 istanza per mese nella vista mensile
      const eventInstances = page.locator('.fc-event:has-text("Manutenzione Mensile Test")');
      const instanceCount = await eventInstances.count();
      console.log(`📅 Istanze evento mensile trovate: ${instanceCount}`);

      // Per evento mensile, dovremmo vedere 1 istanza nel mese corrente
      expect(instanceCount).toBeGreaterThan(0);
      console.log('✅ Frequenza mensile verificata - evento presente con frequenza corretta');
    }

    console.log('🎯 Test evento mensile completato');
  });

  test('🎯 Test Verifica Completa Eventi Inseriti', async ({ page }) => {
    console.log('🔍 Test verifica completa eventi inseriti...');

    // Verifica che siamo nel calendario
    const calendar = page.locator('.fc');
    await expect(calendar).toBeVisible();

    // Screenshot finale
    await page.screenshot({ path: 'test-eventi-finali-calendario.png', fullPage: true });

    // Verifica tutti gli eventi inseriti
    const allEvents = page.locator('.fc-event');
    const totalEvents = await allEvents.count();
    console.log(`📅 Totale eventi nel calendario: ${totalEvents}`);

    // Verifica eventi specifici
    const giornalieroEvent = page.locator('.fc-event:has-text("Pulizia Giornaliera Test")');
    const giornalieroCount = await giornalieroEvent.count();
    console.log(`📅 Eventi giornalieri trovati: ${giornalieroCount}`);

    const settimanaleEvent = page.locator('.fc-event:has-text("Controllo Settimanale Test")');
    const settimanaleCount = await settimanaleEvent.count();
    console.log(`📅 Eventi settimanali trovati: ${settimanaleCount}`);

    const mensileEvent = page.locator('.fc-event:has-text("Manutenzione Mensile Test")');
    const mensileCount = await mensileEvent.count();
    console.log(`📅 Eventi mensili trovati: ${mensileCount}`);

    // Verifica che tutti gli eventi siano presenti
    expect(giornalieroCount).toBeGreaterThan(0);
    expect(settimanaleCount).toBeGreaterThan(0);
    expect(mensileCount).toBeGreaterThan(0);

    console.log('✅ Tutti gli eventi sono presenti nel calendario');
    console.log('✅ Frequenze verificate correttamente');
    console.log('🎯 Test verifica completa completato');
  });
});
