import { test, expect } from '@playwright/test';

test.describe('🎯 Test Debug Onboarding State', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('🎯 Test Debug Onboarding State', async ({ page }) => {
    console.log('🔍 Test debug onboarding state...');

    // Screenshot iniziale
    await page.screenshot({ path: 'test-debug-onboarding-iniziale.png', fullPage: true });

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
    await page.screenshot({ path: 'test-debug-onboarding-dopo-reset.png', fullPage: true });

    // 2. VERIFICA ROLE SELECTOR
    console.log('🔧 Verifica Role Selector...');
    const roleSelector = page.locator('text=Mock Auth System');
    const isRoleSelector = await roleSelector.isVisible();
    console.log(`✅ Role Selector visibile: ${isRoleSelector}`);

    if (isRoleSelector) {
      // Screenshot role selector
      await page.screenshot({ path: 'test-debug-onboarding-role-selector.png', fullPage: true });

      // 3. SELEZIONA RUOLO ADMIN
      console.log('👑 Selezione ruolo Admin...');
      await page.locator('text=Amministratore').click();
      await page.locator('button:has-text("Conferma Ruolo")').click();
      await page.waitForTimeout(3000);

      // Screenshot dopo selezione ruolo
      await page.screenshot({ path: 'test-debug-onboarding-dopo-ruolo.png', fullPage: true });
    }

    // 4. VERIFICA STATO ATTUALE
    console.log('🔍 Verifica stato attuale...');
    
    // Verifica se siamo nell'onboarding
    const onboardingWizard = page.locator('text=Benvenuto in HACCP Business Manager');
    const isOnboarding = await onboardingWizard.isVisible();
    console.log(`✅ Onboarding visibile: ${isOnboarding}`);

    // Verifica se siamo nel calendario
    const calendar = page.locator('.fc');
    const isCalendar = await calendar.isVisible();
    console.log(`📅 Calendario visibile: ${isCalendar}`);

    // Verifica se siamo nella dashboard
    const dashboard = page.locator('text=Dashboard');
    const isDashboard = await dashboard.isVisible();
    console.log(`📊 Dashboard visibile: ${isDashboard}`);

    // Verifica URL attuale
    const currentUrl = page.url();
    console.log(`🌐 URL attuale: ${currentUrl}`);

    // Screenshot stato attuale
    await page.screenshot({ path: 'test-debug-onboarding-stato-attuale.png', fullPage: true });

    // 5. DEBUG INFORMAZIONI
    console.log('🔍 Debug informazioni...');
    
    const debugInfo = await page.evaluate(() => {
      return {
        localStorage: {
          'onboarding-completed': localStorage.getItem('onboarding-completed'),
          'onboarding-completed-at': localStorage.getItem('onboarding-completed-at'),
          'active_company_id': localStorage.getItem('active_company_id'),
          'haccp-company-id': localStorage.getItem('haccp-company-id'),
          'bhm_mock_auth_role': localStorage.getItem('bhm_mock_auth_role'),
          'bhm_mock_auth_user': localStorage.getItem('bhm_mock_auth_user'),
          'bhm_mock_auth_company': localStorage.getItem('bhm_mock_auth_company')
        },
        sessionStorage: Object.fromEntries(Object.entries(sessionStorage)),
        userAgent: navigator.userAgent,
        location: {
          href: window.location.href,
          pathname: window.location.pathname,
          search: window.location.search,
          hash: window.location.hash
        }
      };
    });

    console.log('📊 Debug Info:', JSON.stringify(debugInfo, null, 2));

    // 6. PROVA NAVIGAZIONE DIRETTA ALL'ONBOARDING
    console.log('🔄 Prova navigazione diretta all\'onboarding...');
    await page.goto('/onboarding');
    await page.waitForLoadState('networkidle');

    // Screenshot onboarding diretto
    await page.screenshot({ path: 'test-debug-onboarding-diretto.png', fullPage: true });

    // Verifica se ora siamo nell'onboarding
    const onboardingDirect = page.locator('text=Benvenuto in HACCP Business Manager');
    const isOnboardingDirect = await onboardingDirect.isVisible();
    console.log(`✅ Onboarding visibile dopo navigazione diretta: ${isOnboardingDirect}`);

    if (isOnboardingDirect) {
      console.log('✅ Onboarding accessibile tramite navigazione diretta');
      
      // Scroll completo dell'onboarding
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      await page.waitForTimeout(1000);

      await page.evaluate(() => {
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(1000);

      // Screenshot onboarding completo
      await page.screenshot({ path: 'test-debug-onboarding-completo.png', fullPage: true });

      // Verifica dev buttons
      const precompilaButton = page.locator('button:has-text("Precompila")');
      const completaButton = page.locator('button:has-text("Completa Onboarding")');
      
      const precompilaVisible = await precompilaButton.isVisible();
      const completaVisible = await completaButton.isVisible();
      
      console.log(`✅ Pulsante Precompila visibile: ${precompilaVisible}`);
      console.log(`✅ Pulsante Completa Onboarding visibile: ${completaVisible}`);

      if (precompilaVisible && completaVisible) {
        console.log('✅ Dev Buttons trovati - possiamo procedere con il test completo');
      } else {
        console.log('⚠️ Dev Buttons non trovati');
      }
    } else {
      console.log('❌ Onboarding non accessibile nemmeno tramite navigazione diretta');
    }

    // Screenshot finale
    await page.screenshot({ path: 'test-debug-onboarding-finale.png', fullPage: true });

    console.log('🎯 Test debug onboarding state completato');
  });
});


