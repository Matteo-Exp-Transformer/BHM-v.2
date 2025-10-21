import { test, expect } from '@playwright/test';

test.describe('🎯 Test Debug OnboardingWizard Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('🎯 Test Debug OnboardingWizard Component', async ({ page }) => {
    console.log('🔍 Test debug OnboardingWizard component...');

    // Screenshot iniziale
    await page.screenshot({ path: 'test-debug-onboardingwizard-iniziale.png', fullPage: true });

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
    await page.screenshot({ path: 'test-debug-onboardingwizard-dopo-reset.png', fullPage: true });

    // 2. ATTIVA MOCK AUTH
    console.log('🔧 Attivazione Mock Auth...');
    const roleSelector = page.locator('text=Mock Auth System');
    if (await roleSelector.isVisible()) {
      await page.locator('text=Amministratore').click();
      await page.locator('button:has-text("Conferma Ruolo")').click();
      await page.waitForTimeout(3000);
    }

    // Screenshot dopo Mock Auth
    await page.screenshot({ path: 'test-debug-onboardingwizard-dopo-mock-auth.png', fullPage: true });

    // 3. NAVIGAZIONE DIRETTA ALL'ONBOARDING
    console.log('🔄 Navigazione diretta all\'onboarding...');
    await page.goto('/onboarding');
    await page.waitForLoadState('networkidle');

    // Screenshot onboarding diretto
    await page.screenshot({ path: 'test-debug-onboardingwizard-diretto.png', fullPage: true });

    // 4. VERIFICA ELEMENTI ONBOARDING
    console.log('🔍 Verifica elementi onboarding...');
    
    // Verifica se ci sono elementi di onboarding
    const onboardingElements = [
      { name: 'Titolo Benvenuto', selector: 'text=Benvenuto in HACCP Business Manager' },
      { name: 'Titolo Onboarding', selector: 'text=Onboarding' },
      { name: 'Wizard Container', selector: '.wizard-container, .onboarding-wizard' },
      { name: 'Step Container', selector: '.step-container, .onboarding-step' },
      { name: 'Pulsante Avanti', selector: 'button:has-text("Avanti")' },
      { name: 'Pulsante Indietro', selector: 'button:has-text("Indietro")' },
      { name: 'Progress Bar', selector: '.progress-bar, .step-progress' },
      { name: 'Dev Buttons', selector: 'button:has-text("Precompila")' }
    ];

    console.log('🔍 Verifica elementi onboarding:');
    for (const element of onboardingElements) {
      const isVisible = await page.locator(element.selector).isVisible();
      console.log(`${isVisible ? '✅' : '❌'} ${element.name}: ${isVisible}`);
    }

    // 5. VERIFICA CONTENUTO PAGINA
    console.log('🔍 Verifica contenuto pagina...');
    
    const pageContent = await page.evaluate(() => {
      return {
        title: document.title,
        bodyText: document.body.innerText.substring(0, 500),
        hasOnboardingWizard: document.querySelector('.onboarding-wizard, .wizard-container') !== null,
        hasStepContainer: document.querySelector('.step-container, .onboarding-step') !== null,
        hasDevButtons: document.querySelector('button:has-text("Precompila")') !== null,
        allButtons: Array.from(document.querySelectorAll('button')).map(btn => btn.textContent),
        allHeadings: Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => h.textContent),
        allDivs: Array.from(document.querySelectorAll('div')).length,
        allForms: Array.from(document.querySelectorAll('form')).length
      };
    });

    console.log('📊 Contenuto pagina:', JSON.stringify(pageContent, null, 2));

    // 6. VERIFICA CONSOLE ERRORS
    console.log('🔍 Verifica console errors...');
    
    const consoleErrors = await page.evaluate(() => {
      return window.consoleErrors || [];
    });

    if (consoleErrors.length > 0) {
      console.log('❌ Console errors trovati:', consoleErrors);
    } else {
      console.log('✅ Nessun console error');
    }

    // 7. PROVA SCROLL COMPLETO
    console.log('🔄 Prova scroll completo...');
    
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
    await page.screenshot({ path: 'test-debug-onboardingwizard-dopo-scroll.png', fullPage: true });

    // 8. VERIFICA SE CI SONO ELEMENTI NASCOSTI
    console.log('🔍 Verifica elementi nascosti...');
    
    const hiddenElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const hidden = [];
      for (const el of elements) {
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
          if (el.textContent && el.textContent.trim().length > 0) {
            hidden.push({
              tagName: el.tagName,
              textContent: el.textContent.substring(0, 100),
              className: el.className,
              id: el.id
            });
          }
        }
      }
      return hidden;
    });

    if (hiddenElements.length > 0) {
      console.log('🔍 Elementi nascosti trovati:', hiddenElements.slice(0, 5));
    } else {
      console.log('✅ Nessun elemento nascosto rilevante');
    }

    // Screenshot finale
    await page.screenshot({ path: 'test-debug-onboardingwizard-finale.png', fullPage: true });

    console.log('🎯 Test debug OnboardingWizard component completato');
  });
});


