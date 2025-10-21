import { test, expect } from '@playwright/test';

test.describe('🎯 Test Mappatura Completa Onboarding', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Reset completo
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Attiva Mock Auth
    const authPage = page.locator('text=Mock Auth System');
    if (await authPage.isVisible()) {
      await page.locator('text=Amministratore').click();
      await page.locator('button:has-text("Conferma Ruolo")').click();
      await page.waitForTimeout(2000);
    }
  });

  test('🎯 Test Mappatura Completa Onboarding con Scroll', async ({ page }) => {
    console.log('🔍 Test mappatura completa onboarding con scroll...');

    // Screenshot iniziale
    await page.screenshot({ path: 'test-mappatura-onboarding-iniziale.png', fullPage: true });

    // 1. VERIFICA CHE SIAMO NELL'ONBOARDING
    console.log('📋 Verifica onboarding...');
    const onboardingWizard = page.locator('text=Benvenuto in HACCP Business Manager');
    const isOnboarding = await onboardingWizard.isVisible();
    console.log(`✅ Onboarding visibile: ${isOnboarding}`);

    if (!isOnboarding) {
      console.log('❌ Onboarding non visibile - test fallito');
      return;
    }

    // Screenshot onboarding
    await page.screenshot({ path: 'test-mappatura-onboarding-wizard.png', fullPage: true });

    // 2. MAPPA STEP 1 - BENVENUTO
    console.log('📝 Mappatura Step 1 - Benvenuto...');
    
    // Scroll completo dello step
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

    // Screenshot step 1 completo
    await page.screenshot({ path: 'test-mappatura-step1-benvenuto.png', fullPage: true });

    // Verifica elementi step 1
    const step1Elements = [
      { name: 'Titolo Benvenuto', selector: 'text=Benvenuto in HACCP Business Manager' },
      { name: 'Descrizione', selector: 'text=Configura la tua azienda' },
      { name: 'Pulsante Avanti', selector: 'button:has-text("Avanti")' },
      { name: 'Dev Buttons', selector: 'button:has-text("Precompila")' }
    ];

    console.log('🔍 Verifica elementi Step 1:');
    for (const element of step1Elements) {
      const isVisible = await page.locator(element.selector).isVisible();
      console.log(`${isVisible ? '✅' : '❌'} ${element.name}: ${isVisible}`);
    }

    // 3. CLICCA AVANTI PER STEP 2
    console.log('➡️ Passaggio a Step 2...');
    const avantiButton = page.locator('button:has-text("Avanti")');
    await avantiButton.click();
    await page.waitForTimeout(2000);

    // Screenshot step 2
    await page.screenshot({ path: 'test-mappatura-step2-iniziale.png', fullPage: true });

    // Scroll completo step 2
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(1000);

    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1000);

    // Screenshot step 2 completo
    await page.screenshot({ path: 'test-mappatura-step2-completo.png', fullPage: true });

    // Verifica elementi step 2
    const step2Elements = [
      { name: 'Titolo Step 2', selector: 'text=Informazioni Azienda' },
      { name: 'Campo Nome Azienda', selector: 'input[placeholder*="nome"], input[placeholder*="azienda"]' },
      { name: 'Campo Indirizzo', selector: 'input[placeholder*="indirizzo"], input[placeholder*="via"]' },
      { name: 'Campo Telefono', selector: 'input[placeholder*="telefono"], input[type="tel"]' },
      { name: 'Campo Email', selector: 'input[placeholder*="email"], input[type="email"]' },
      { name: 'Pulsante Avanti', selector: 'button:has-text("Avanti")' }
    ];

    console.log('🔍 Verifica elementi Step 2:');
    for (const element of step2Elements) {
      const isVisible = await page.locator(element.selector).isVisible();
      console.log(`${isVisible ? '✅' : '❌'} ${element.name}: ${isVisible}`);
    }

    // 4. CLICCA AVANTI PER STEP 3
    console.log('➡️ Passaggio a Step 3...');
    const avantiButton2 = page.locator('button:has-text("Avanti")');
    await avantiButton2.click();
    await page.waitForTimeout(2000);

    // Screenshot step 3
    await page.screenshot({ path: 'test-mappatura-step3-iniziale.png', fullPage: true });

    // Scroll completo step 3
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(1000);

    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1000);

    // Screenshot step 3 completo
    await page.screenshot({ path: 'test-mappatura-step3-completo.png', fullPage: true });

    // Verifica elementi step 3
    const step3Elements = [
      { name: 'Titolo Step 3', selector: 'text=Reparti' },
      { name: 'Form Reparto', selector: 'form, .form-container' },
      { name: 'Campo Nome Reparto', selector: 'input[placeholder*="reparto"], input[placeholder*="nome"]' },
      { name: 'Pulsante Aggiungi', selector: 'button:has-text("Aggiungi"), button:has-text("Salva")' },
      { name: 'Lista Reparti', selector: 'ul, .list-container' },
      { name: 'Pulsante Avanti', selector: 'button:has-text("Avanti")' }
    ];

    console.log('🔍 Verifica elementi Step 3:');
    for (const element of step3Elements) {
      const isVisible = await page.locator(element.selector).isVisible();
      console.log(`${isVisible ? '✅' : '❌'} ${element.name}: ${isVisible}`);
    }

    // 5. CLICCA AVANTI PER STEP 4
    console.log('➡️ Passaggio a Step 4...');
    const avantiButton3 = page.locator('button:has-text("Avanti")');
    await avantiButton3.click();
    await page.waitForTimeout(2000);

    // Screenshot step 4
    await page.screenshot({ path: 'test-mappatura-step4-iniziale.png', fullPage: true });

    // Scroll completo step 4
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(1000);

    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1000);

    // Screenshot step 4 completo
    await page.screenshot({ path: 'test-mappatura-step4-completo.png', fullPage: true });

    // Verifica elementi step 4
    const step4Elements = [
      { name: 'Titolo Step 4', selector: 'text=Staff' },
      { name: 'Form Staff', selector: 'form, .form-container' },
      { name: 'Campo Nome', selector: 'input[placeholder*="nome"], input[name*="name"]' },
      { name: 'Campo Cognome', selector: 'input[placeholder*="cognome"], input[name*="surname"]' },
      { name: 'Campo Email', selector: 'input[placeholder*="email"], input[type="email"]' },
      { name: 'Campo Telefono', selector: 'input[placeholder*="telefono"], input[type="tel"]' },
      { name: 'Select Ruolo', selector: 'select, [role="combobox"]' },
      { name: 'Pulsante Aggiungi', selector: 'button:has-text("Aggiungi"), button:has-text("Salva")' },
      { name: 'Lista Staff', selector: 'ul, .list-container' },
      { name: 'Pulsante Avanti', selector: 'button:has-text("Avanti")' }
    ];

    console.log('🔍 Verifica elementi Step 4:');
    for (const element of step4Elements) {
      const isVisible = await page.locator(element.selector).isVisible();
      console.log(`${isVisible ? '✅' : '❌'} ${element.name}: ${isVisible}`);
    }

    // 6. CLICCA AVANTI PER STEP 5
    console.log('➡️ Passaggio a Step 5...');
    const avantiButton4 = page.locator('button:has-text("Avanti")');
    await avantiButton4.click();
    await page.waitForTimeout(2000);

    // Screenshot step 5
    await page.screenshot({ path: 'test-mappatura-step5-iniziale.png', fullPage: true });

    // Scroll completo step 5
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(1000);

    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1000);

    // Screenshot step 5 completo
    await page.screenshot({ path: 'test-mappatura-step5-completo.png', fullPage: true });

    // Verifica elementi step 5
    const step5Elements = [
      { name: 'Titolo Step 5', selector: 'text=Conservazione' },
      { name: 'Form Punto Conservazione', selector: 'form, .form-container' },
      { name: 'Campo Nome Punto', selector: 'input[placeholder*="nome"], input[placeholder*="punto"]' },
      { name: 'Campo Tipo', selector: 'select, [role="combobox"]' },
      { name: 'Campo Temperatura', selector: 'input[placeholder*="temperatura"], input[type="number"]' },
      { name: 'Pulsante Aggiungi', selector: 'button:has-text("Aggiungi"), button:has-text("Salva")' },
      { name: 'Lista Punti Conservazione', selector: 'ul, .list-container' },
      { name: 'Pulsante Avanti', selector: 'button:has-text("Avanti")' }
    ];

    console.log('🔍 Verifica elementi Step 5:');
    for (const element of step5Elements) {
      const isVisible = await page.locator(element.selector).isVisible();
      console.log(`${isVisible ? '✅' : '❌'} ${element.name}: ${isVisible}`);
    }

    // 7. CLICCA AVANTI PER STEP 6
    console.log('➡️ Passaggio a Step 6...');
    const avantiButton5 = page.locator('button:has-text("Avanti")');
    await avantiButton5.click();
    await page.waitForTimeout(2000);

    // Screenshot step 6
    await page.screenshot({ path: 'test-mappatura-step6-iniziale.png', fullPage: true });

    // Scroll completo step 6
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(1000);

    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1000);

    // Screenshot step 6 completo
    await page.screenshot({ path: 'test-mappatura-step6-completo.png', fullPage: true });

    // Verifica elementi step 6
    const step6Elements = [
      { name: 'Titolo Step 6', selector: 'text=Inventario' },
      { name: 'Form Categoria', selector: 'form, .form-container' },
      { name: 'Campo Nome Categoria', selector: 'input[placeholder*="categoria"], input[placeholder*="nome"]' },
      { name: 'Pulsante Aggiungi Categoria', selector: 'button:has-text("Aggiungi"), button:has-text("Salva")' },
      { name: 'Form Prodotto', selector: 'form, .form-container' },
      { name: 'Campo Nome Prodotto', selector: 'input[placeholder*="prodotto"], input[placeholder*="nome"]' },
      { name: 'Campo Scadenza', selector: 'input[type="date"], input[placeholder*="scadenza"]' },
      { name: 'Pulsante Aggiungi Prodotto', selector: 'button:has-text("Aggiungi"), button:has-text("Salva")' },
      { name: 'Lista Categorie', selector: 'ul, .list-container' },
      { name: 'Lista Prodotti', selector: 'ul, .list-container' },
      { name: 'Pulsante Avanti', selector: 'button:has-text("Avanti")' }
    ];

    console.log('🔍 Verifica elementi Step 6:');
    for (const element of step6Elements) {
      const isVisible = await page.locator(element.selector).isVisible();
      console.log(`${isVisible ? '✅' : '❌'} ${element.name}: ${isVisible}`);
    }

    // 8. CLICCA AVANTI PER STEP 7
    console.log('➡️ Passaggio a Step 7...');
    const avantiButton6 = page.locator('button:has-text("Avanti")');
    await avantiButton6.click();
    await page.waitForTimeout(2000);

    // Screenshot step 7
    await page.screenshot({ path: 'test-mappatura-step7-iniziale.png', fullPage: true });

    // Scroll completo step 7
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(1000);

    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1000);

    // Screenshot step 7 completo
    await page.screenshot({ path: 'test-mappatura-step7-completo.png', fullPage: true });

    // Verifica elementi step 7
    const step7Elements = [
      { name: 'Titolo Step 7', selector: 'text=Attività' },
      { name: 'Form Attività', selector: 'form, .form-container' },
      { name: 'Campo Nome Attività', selector: 'input[placeholder*="attività"], input[placeholder*="nome"]' },
      { name: 'Campo Frequenza', selector: 'select, [role="combobox"]' },
      { name: 'Campo Ruolo', selector: 'select, [role="combobox"]' },
      { name: 'Campo Reparto', selector: 'select, [role="combobox"]' },
      { name: 'Pulsante Aggiungi', selector: 'button:has-text("Aggiungi"), button:has-text("Salva")' },
      { name: 'Lista Attività', selector: 'ul, .list-container' },
      { name: 'Pulsante Avanti', selector: 'button:has-text("Avanti")' }
    ];

    console.log('🔍 Verifica elementi Step 7:');
    for (const element of step7Elements) {
      const isVisible = await page.locator(element.selector).isVisible();
      console.log(`${isVisible ? '✅' : '❌'} ${element.name}: ${isVisible}`);
    }

    // 9. CLICCA AVANTI PER STEP FINALE
    console.log('➡️ Passaggio a Step Finale...');
    const avantiButton7 = page.locator('button:has-text("Avanti")');
    await avantiButton7.click();
    await page.waitForTimeout(2000);

    // Screenshot step finale
    await page.screenshot({ path: 'test-mappatura-step-finale-iniziale.png', fullPage: true });

    // Scroll completo step finale
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(1000);

    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1000);

    // Screenshot step finale completo
    await page.screenshot({ path: 'test-mappatura-step-finale-completo.png', fullPage: true });

    // Verifica elementi step finale
    const stepFinaleElements = [
      { name: 'Titolo Step Finale', selector: 'text=Completato' },
      { name: 'Messaggio Successo', selector: 'text=Onboarding completato' },
      { name: 'Pulsante Completa', selector: 'button:has-text("Completa"), button:has-text("Finisci")' },
      { name: 'Dev Button Precompila', selector: 'button:has-text("Precompila")' },
      { name: 'Dev Button Completa Onboarding', selector: 'button:has-text("Completa Onboarding")' }
    ];

    console.log('🔍 Verifica elementi Step Finale:');
    for (const element of stepFinaleElements) {
      const isVisible = await page.locator(element.selector).isVisible();
      console.log(`${isVisible ? '✅' : '❌'} ${element.name}: ${isVisible}`);
    }

    // Screenshot finale
    await page.screenshot({ path: 'test-mappatura-onboarding-finale.png', fullPage: true });

    console.log('🎯 Test mappatura completa onboarding con scroll completato');
  });
});


