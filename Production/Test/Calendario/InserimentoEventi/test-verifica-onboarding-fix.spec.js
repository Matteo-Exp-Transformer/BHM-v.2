import { test, expect } from '@playwright/test';

test.describe('🎯 Test Verifica Onboarding Fix', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('🎯 Test Verifica Onboarding Fix', async ({ page }) => {
    console.log('🔍 Test verifica onboarding fix...');

    // Screenshot iniziale
    await page.screenshot({ path: 'test-verifica-fix-iniziale.png', fullPage: true });

    // 1. RESET COMPLETO
    console.log('🔄 Reset completo...');
    
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
      console.log('✅ Storage completamente pulito');
    });

    // Ricarica la pagina
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Screenshot dopo reset
    await page.screenshot({ path: 'test-verifica-fix-dopo-reset.png', fullPage: true });

    // 2. VERIFICA ROLE SELECTOR
    console.log('🔧 Verifica Role Selector...');
    const roleSelector = page.locator('text=Mock Auth System');
    const isRoleSelector = await roleSelector.isVisible();
    console.log(`✅ Role Selector visibile: ${isRoleSelector}`);

    if (isRoleSelector) {
      // Screenshot role selector
      await page.screenshot({ path: 'test-verifica-fix-role-selector.png', fullPage: true });

      // 3. SELEZIONA RUOLO ADMIN
      console.log('👑 Selezione ruolo Admin...');
      await page.locator('text=Amministratore').click();
      await page.locator('button:has-text("Conferma Ruolo")').click();
      await page.waitForTimeout(3000);

      // Screenshot dopo selezione ruolo
      await page.screenshot({ path: 'test-verifica-fix-dopo-ruolo.png', fullPage: true });
    }

    // 4. VERIFICA ONBOARDING
    console.log('📋 Verifica onboarding...');
    const onboardingWizard = page.locator('text=Benvenuto in HACCP Business Manager');
    const isOnboarding = await onboardingWizard.isVisible();
    console.log(`✅ Onboarding visibile: ${isOnboarding}`);

    if (isOnboarding) {
      // Screenshot onboarding
      await page.screenshot({ path: 'test-verifica-fix-onboarding.png', fullPage: true });

      // 5. VERIFICA DEV BUTTONS
      console.log('🔧 Verifica Dev Buttons...');
      const precompilaButton = page.locator('button:has-text("Precompila")');
      const completaButton = page.locator('button:has-text("Completa Onboarding")');
      
      const precompilaVisible = await precompilaButton.isVisible();
      const completaVisible = await completaButton.isVisible();
      
      console.log(`✅ Pulsante Precompila visibile: ${precompilaVisible}`);
      console.log(`✅ Pulsante Completa Onboarding visibile: ${completaVisible}`);

      if (precompilaVisible && completaVisible) {
        // 6. CLICCA PRECOMPILA
        console.log('🔄 Click su Precompila...');
        await precompilaButton.click();
        await page.waitForTimeout(5000);

        // Screenshot dopo precompila
        await page.screenshot({ path: 'test-verifica-fix-dopo-precompila.png', fullPage: true });

        // 7. CLICCA COMPLETA ONBOARDING
        console.log('✅ Click su Completa Onboarding...');
        await completaButton.click();
        await page.waitForTimeout(8000);

        // Screenshot dopo completamento
        await page.screenshot({ path: 'test-verifica-fix-dopo-completamento.png', fullPage: true });

        console.log('✅ Onboarding completato con successo');
      } else {
        console.log('⚠️ Dev Buttons non trovati');
      }
    } else {
      console.log('⚠️ Onboarding non visibile - problema con fix');
      
      // Verifica se siamo già nel calendario
      const calendar = page.locator('.fc');
      const isCalendar = await calendar.isVisible();
      console.log(`📅 Calendario visibile: ${isCalendar}`);
      
      if (isCalendar) {
        console.log('✅ Siamo già nel calendario - onboarding potrebbe essere già completato');
        await page.screenshot({ path: 'test-verifica-fix-calendario-gia-visibile.png', fullPage: true });
      } else {
        console.log('❌ Non siamo né in onboarding né nel calendario - problema');
        await page.screenshot({ path: 'test-verifica-fix-problema.png', fullPage: true });
      }
    }

    // 8. NAVIGA AL CALENDARIO
    console.log('📅 Navigazione al calendario...');
    await page.goto('/attivita');
    await page.waitForLoadState('networkidle');

    // Screenshot calendario
    await page.screenshot({ path: 'test-verifica-fix-calendario.png', fullPage: true });

    // 9. VERIFICA CALENDARIO
    const calendar = page.locator('.fc');
    const isCalendarVisible = await calendar.isVisible();
    console.log(`✅ Calendario visibile: ${isCalendarVisible}`);

    if (isCalendarVisible) {
      console.log('✅ Calendario caricato correttamente');
      
      // 10. VERIFICA FORM
      console.log('📝 Verifica form...');
      const assignCard = page.locator('text=Assegna nuova attività / mansione');
      const isAssignCard = await assignCard.isVisible();
      console.log(`✅ CollapsibleCard visibile: ${isAssignCard}`);
      
      if (isAssignCard) {
        await assignCard.click();
        await page.waitForTimeout(2000);
        
        const taskForm = page.locator('.rounded-lg.border.border-gray-200.bg-white.p-6');
        const isTaskForm = await taskForm.isVisible();
        console.log(`✅ GenericTaskForm visibile: ${isTaskForm}`);
        
        if (isTaskForm) {
          // Screenshot form
          await page.screenshot({ path: 'test-verifica-fix-form.png', fullPage: true });
          
          // Verifica campi
          const nameField = page.locator('input[placeholder*="Pulizia"], input[placeholder*="Controllo"]');
          const isNameField = await nameField.isVisible();
          console.log(`✅ Campo nome visibile: ${isNameField}`);
          
          const roleSelect = page.locator('select, [role="combobox"]').nth(1);
          const isRoleSelect = await roleSelect.isVisible();
          console.log(`✅ Campo ruolo visibile: ${isRoleSelect}`);
          
          const categorySelect = page.locator('select, [role="combobox"]').nth(2);
          const isCategorySelect = await categorySelect.isVisible();
          const isCategoryEnabled = await categorySelect.isEnabled();
          console.log(`✅ Campo categoria visibile: ${isCategorySelect}, abilitato: ${isCategoryEnabled}`);
          
          const departmentSelect = page.locator('select, [role="combobox"]').nth(3);
          const isDepartmentSelect = await departmentSelect.isVisible();
          const isDepartmentEnabled = await departmentSelect.isEnabled();
          console.log(`✅ Campo reparto visibile: ${isDepartmentSelect}, abilitato: ${isDepartmentEnabled}`);
        }
      }
    } else {
      console.log('❌ Calendario non visibile - problema');
    }

    // Screenshot finale
    await page.screenshot({ path: 'test-verifica-fix-finale.png', fullPage: true });

    console.log('🎯 Test verifica onboarding fix completato');
  });
});


