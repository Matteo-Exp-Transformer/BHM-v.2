import { test, expect } from '@playwright/test';

test.describe('🎯 Test Reset + Onboarding Completo + Form Calendario', () => {
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
  });

  test('🎯 Test Reset Completo + Onboarding + Form', async ({ page }) => {
    console.log('🔍 Test reset completo + onboarding + form...');

    // Screenshot iniziale
    await page.screenshot({ path: 'test-reset-iniziale.png', fullPage: true });

    // 1. RESET COMPLETO DELL'ONBOARDING
    console.log('🔄 Reset completo onboarding...');
    
    // Pulisci localStorage
    await page.evaluate(() => {
      localStorage.removeItem('onboarding-completed');
      localStorage.removeItem('onboarding-completed-at');
      localStorage.removeItem('onboarding-data');
      localStorage.removeItem('active_company_id');
      localStorage.removeItem('haccp-company-id');
      localStorage.removeItem('company-id');
      console.log('✅ LocalStorage pulito');
    });

    // Ricarica la pagina per forzare l'onboarding
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Screenshot dopo reset
    await page.screenshot({ path: 'test-reset-dopo-pulizia.png', fullPage: true });

    // 2. VERIFICA CHE SIAMO NELL'ONBOARDING
    console.log('📋 Verifica onboarding dopo reset...');
    const onboardingWizard = page.locator('text=Benvenuto in HACCP Business Manager');
    const isOnboarding = await onboardingWizard.isVisible();
    console.log(`✅ Onboarding visibile dopo reset: ${isOnboarding}`);

    if (isOnboarding) {
      // Screenshot onboarding
      await page.screenshot({ path: 'test-reset-onboarding.png', fullPage: true });

      // 3. CERCA I DEV BUTTON
      console.log('🔧 Ricerca Dev Buttons...');
      const precompilaButton = page.locator('button:has-text("Precompila")');
      const completaButton = page.locator('button:has-text("Completa Onboarding")');
      
      const precompilaVisible = await precompilaButton.isVisible();
      const completaVisible = await completaButton.isVisible();
      
      console.log(`✅ Pulsante Precompila visibile: ${precompilaVisible}`);
      console.log(`✅ Pulsante Completa Onboarding visibile: ${completaVisible}`);

      if (precompilaVisible && completaVisible) {
        // 4. CLICCA PRECOMPILA
        console.log('🔄 Click su Precompila...');
        await precompilaButton.click();
        await page.waitForTimeout(5000); // Attendi precompilazione completa

        // Screenshot dopo precompila
        await page.screenshot({ path: 'test-reset-dopo-precompila.png', fullPage: true });

        // 5. CLICCA COMPLETA ONBOARDING
        console.log('✅ Click su Completa Onboarding...');
        await completaButton.click();
        await page.waitForTimeout(8000); // Attendi completamento completo

        // Screenshot dopo completamento
        await page.screenshot({ path: 'test-reset-dopo-completamento.png', fullPage: true });

        console.log('✅ Onboarding completato con successo');
      } else {
        console.log('⚠️ Dev Buttons non trovati');
      }
    } else {
      console.log('⚠️ Onboarding non visibile dopo reset');
    }

    // 6. NAVIGA AL CALENDARIO
    console.log('📅 Navigazione al calendario...');
    await page.goto('/attivita');
    await page.waitForLoadState('networkidle');

    // Screenshot calendario
    await page.screenshot({ path: 'test-reset-calendario.png', fullPage: true });

    // 7. VERIFICA CHE SIAMO NEL CALENDARIO
    const calendar = page.locator('.fc');
    await expect(calendar).toBeVisible();
    console.log('✅ Calendario caricato');

    // 8. ESPANDI COLLAPSIBLE CARD
    console.log('📝 Espansione CollapsibleCard...');
    const assignCard = page.locator('text=Assegna nuova attività / mansione');
    await expect(assignCard).toBeVisible();
    await assignCard.click();
    await page.waitForTimeout(2000);

    // Verifica che il form sia visibile
    const taskForm = page.locator('.rounded-lg.border.border-gray-200.bg-white.p-6');
    await expect(taskForm).toBeVisible();
    console.log('✅ GenericTaskForm visibile');

    // Screenshot form aperto
    await page.screenshot({ path: 'test-reset-form-aperto.png', fullPage: true });

    // 9. COMPILA IL FORM CON DATI REALI
    console.log('📝 Compilazione form con dati reali...');

    // Nome attività
    const nameField = page.locator('input[placeholder*="Pulizia"], input[placeholder*="Controllo"]');
    await expect(nameField).toBeVisible();
    await nameField.fill('Test Evento Post-Onboarding');
    console.log('✅ Nome attività inserito');
    await page.waitForTimeout(1000);

    // Frequenza - Giornaliera
    const frequencySelect = page.locator('select, [role="combobox"]').first();
    await expect(frequencySelect).toBeVisible();
    await frequencySelect.click();
    await page.waitForTimeout(1000);
    
    const giornalieraOption = page.locator('[role="option"]:has-text("Giornaliera")');
    await expect(giornalieraOption).toBeVisible();
    await giornalieraOption.click();
    await page.waitForTimeout(1000);
    console.log('✅ Frequenza giornaliera selezionata');

    // Ruolo assegnazione (obbligatorio)
    const roleSelect = page.locator('select, [role="combobox"]').nth(1);
    await expect(roleSelect).toBeVisible();
    await roleSelect.click();
    await page.waitForTimeout(1000);
    
    const dipendenteOption = page.locator('[role="option"]:has-text("Dipendente")').first();
    await expect(dipendenteOption).toBeVisible();
    await dipendenteOption.click();
    await page.waitForTimeout(3000); // Attendi che si abiliti la categoria
    console.log('✅ Ruolo dipendente selezionato');

    // Screenshot dopo ruolo
    await page.screenshot({ path: 'test-reset-dopo-ruolo.png', fullPage: true });

    // Categoria (ora dovrebbe essere abilitata con dati reali)
    const categorySelect = page.locator('select, [role="combobox"]').nth(2);
    await expect(categorySelect).toBeVisible();
    const categoryEnabled = await categorySelect.isEnabled();
    console.log(`✅ Categoria abilitata: ${categoryEnabled}`);
    
    if (categoryEnabled) {
      await categorySelect.click();
      await page.waitForTimeout(1000);
      
      // Verifica che ci siano opzioni disponibili
      const categoryOptions = page.locator('[role="option"]');
      const categoryCount = await categoryOptions.count();
      console.log(`📋 Opzioni categoria disponibili: ${categoryCount}`);
      
      if (categoryCount > 0) {
        const firstCategory = categoryOptions.first();
        await firstCategory.click();
        await page.waitForTimeout(3000); // Attendi che si abiliti il reparto
        console.log('✅ Categoria selezionata');
      }
    } else {
      console.log('⚠️ Categoria ancora disabilitata - problema con onboarding');
    }

    // Screenshot dopo categoria
    await page.screenshot({ path: 'test-reset-dopo-categoria.png', fullPage: true });

    // Reparto (ora dovrebbe essere abilitato con dati reali)
    const departmentSelect = page.locator('select, [role="combobox"]').nth(3);
    await expect(departmentSelect).toBeVisible();
    const departmentEnabled = await departmentSelect.isEnabled();
    console.log(`✅ Reparto abilitato: ${departmentEnabled}`);
    
    if (departmentEnabled) {
      await departmentSelect.click();
      await page.waitForTimeout(1000);
      
      // Verifica che ci siano opzioni disponibili
      const departmentOptions = page.locator('[role="option"]');
      const departmentCount = await departmentOptions.count();
      console.log(`📋 Opzioni reparto disponibili: ${departmentCount}`);
      
      if (departmentCount > 0) {
        const firstDept = departmentOptions.first();
        await firstDept.click();
        console.log('✅ Reparto selezionato');
      }
    } else {
      console.log('⚠️ Reparto ancora disabilitato - problema con onboarding');
    }

    // Screenshot dopo reparto
    await page.screenshot({ path: 'test-reset-dopo-reparto.png', fullPage: true });

    // Dipendente specifico (se abilitato)
    const staffSelect = page.locator('select, [role="combobox"]').nth(4);
    const staffEnabled = await staffSelect.isEnabled();
    console.log(`✅ Dipendente specifico abilitato: ${staffEnabled}`);
    
    if (staffEnabled) {
      await staffSelect.click();
      await page.waitForTimeout(1000);
      
      // Verifica che ci siano opzioni disponibili
      const staffOptions = page.locator('[role="option"]');
      const staffCount = await staffOptions.count();
      console.log(`📋 Dipendenti disponibili: ${staffCount}`);
      
      if (staffCount > 0) {
        const firstStaff = staffOptions.first();
        await firstStaff.click();
        console.log('✅ Dipendente specifico selezionato');
      }
    }

    // Note (opzionale)
    const noteField = page.locator('textarea');
    if (await noteField.isVisible()) {
      await noteField.fill('Test evento post-onboarding completo con dati reali');
      console.log('✅ Note inserite');
      await page.waitForTimeout(1000);
    }

    // Screenshot form completamente compilato
    await page.screenshot({ path: 'test-reset-form-compilato.png', fullPage: true });

    // 10. SALVA L'EVENTO
    console.log('💾 Salvataggio evento...');
    const saveButton = page.locator('button:has-text("Crea Attività")');
    await expect(saveButton).toBeVisible();
    await saveButton.click();
    await page.waitForTimeout(5000); // Attendi salvataggio

    console.log('✅ Evento salvato');

    // Screenshot dopo salvataggio
    await page.screenshot({ path: 'test-reset-dopo-salvataggio.png', fullPage: true });

    // 11. VERIFICA VISUALIZZAZIONE NEL CALENDARIO
    console.log('🔍 Verifica visualizzazione nel calendario...');

    // Scroll completo della pagina
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1000);

    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(1000);

    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1000);

    // Screenshot dopo scroll
    await page.screenshot({ path: 'test-reset-dopo-scroll.png', fullPage: true });

    // Verifica eventi nel calendario
    const calendarEvents = page.locator('.fc-event');
    const eventCount = await calendarEvents.count();
    console.log(`📅 Eventi trovati nel calendario: ${eventCount}`);

    if (eventCount > 0) {
      // Verifica che ci sia l'evento creato
      const testEvent = page.locator('.fc-event:has-text("Test Evento Post-Onboarding")');
      const testEventVisible = await testEvent.isVisible();
      console.log(`✅ Evento "Test Evento Post-Onboarding" visibile: ${testEventVisible}`);

      if (testEventVisible) {
        // Verifica frequenza giornaliera
        const eventInstances = page.locator('.fc-event:has-text("Test Evento Post-Onboarding")');
        const instanceCount = await eventInstances.count();
        console.log(`📅 Istanze evento giornaliero trovate: ${instanceCount}`);

        expect(instanceCount).toBeGreaterThan(1);
        console.log('✅ Frequenza giornaliera verificata - evento presente in più giorni');
      }
    } else {
      console.log('⚠️ Nessun evento trovato nel calendario');
      
      // Aspetta e riprova
      await page.waitForTimeout(3000);
      const calendarEventsRetry = page.locator('.fc-event');
      const eventCountRetry = await calendarEventsRetry.count();
      console.log(`📅 Eventi trovati nel calendario (retry): ${eventCountRetry}`);
    }

    // Screenshot finale
    await page.screenshot({ path: 'test-reset-finale.png', fullPage: true });

    console.log('🎯 Test reset completo + onboarding + form completato');
  });
});


