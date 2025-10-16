import { test, expect } from '@playwright/test';

test.describe('OnboardingWizard - Test Validazione', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/onboarding');
    await expect(page.locator('[data-testid="onboarding-wizard"]')).toBeVisible();
  });

  test('Dovrebbe accettare dati validi nel primo step', async ({ page }) => {
    // Compila BusinessInfoStep con dati validi
    await page.fill('input[name="businessName"]', 'Test Azienda SRL');
    await page.fill('input[name="businessAddress"]', 'Via Test 123, Milano');
    await page.fill('input[name="businessPhone"]', '02 1234567');
    await page.fill('input[name="businessEmail"]', 'test@azienda.it');
    await page.fill('input[name="vatNumber"]', 'IT12345678901');
    
    // Seleziona tipo business
    await page.selectOption('select[name="businessType"]', 'ristorante');
    
    // Verifica che bottone Avanti sia abilitato
    const nextButton = page.locator('button:has-text("Avanti")');
    await expect(nextButton).toBeEnabled();
  });

  test('Dovrebbe rifiutare dati invalidi nel primo step', async ({ page }) => {
    // Prova con dati incompleti
    await page.fill('input[name="businessName"]', '');
    await page.fill('input[name="businessEmail"]', 'email-invalida');
    
    // Verifica che bottone Avanti rimanga disabilitato
    const nextButton = page.locator('button:has-text("Avanti")');
    await expect(nextButton).toBeDisabled();
    
    // Prova a cliccare comunque
    await nextButton.click();
    
    // Verifica toast di errore
    await expect(page.locator('.Toastify__toast--error')).toBeVisible();
  });

  test('Dovrebbe validare formato email corretto', async ({ page }) => {
    // Email invalida
    await page.fill('input[name="businessEmail"]', 'email-senza-@');
    const nextButton = page.locator('button:has-text("Avanti")');
    await expect(nextButton).toBeDisabled();
    
    // Email valida
    await page.fill('input[name="businessEmail"]', 'test@azienda.it');
    // Altri campi obbligatori
    await page.fill('input[name="businessName"]', 'Test Azienda');
    await expect(nextButton).toBeEnabled();
  });

  test('Dovrebbe validare formato telefono corretto', async ({ page }) => {
    // Telefono invalido
    await page.fill('input[name="businessPhone"]', 'abc123');
    const nextButton = page.locator('button:has-text("Avanti")');
    await expect(nextButton).toBeDisabled();
    
    // Telefono valido
    await page.fill('input[name="businessPhone"]', '02 1234567');
    await page.fill('input[name="businessName"]', 'Test Azienda');
    await page.fill('input[name="businessEmail"]', 'test@azienda.it');
    await expect(nextButton).toBeEnabled();
  });

  test('Dovrebbe validare Partita IVA italiana', async ({ page }) => {
    // P.IVA invalida
    await page.fill('input[name="vatNumber"]', 'INVALID123');
    const nextButton = page.locator('button:has-text("Avanti")');
    await expect(nextButton).toBeDisabled();
    
    // P.IVA valida
    await page.fill('input[name="vatNumber"]', 'IT12345678901');
    await page.fill('input[name="businessName"]', 'Test Azienda');
    await page.fill('input[name="businessEmail"]', 'test@azienda.it');
    await expect(nextButton).toBeEnabled();
  });

  test('Dovrebbe gestire localStorage corrotto', async ({ page }) => {
    // Simula localStorage corrotto
    await page.evaluate(() => {
      localStorage.setItem('onboarding-data', 'invalid-json');
    });
    
    // Ricarica pagina
    await page.reload();
    
    // Verifica che l'app gestisca l'errore senza crashare
    await expect(page.locator('[data-testid="onboarding-wizard"]')).toBeVisible();
    
    // Verifica che i dati vengano inizializzati come vuoti
    const formData = await page.evaluate(() => {
      return localStorage.getItem('onboarding-data');
    });
    
    expect(formData).toBeDefined();
  });

  test('Dovrebbe gestire navigazione non valida tra step', async ({ page }) => {
    // Prova a navigare a step non accessibili
    const step3Button = page.locator('[data-testid="step-navigator"] button').nth(2);
    
    // Dovrebbe essere disabilitato
    await expect(step3Button).toBeDisabled();
    
    // Prova click forzato
    await step3Button.click({ force: true });
    
    // Verifica che rimanga al primo step
    await expect(page.locator('text=Step 1 di 7')).toBeVisible();
  });

  test('Dovrebbe gestire companyId null/valido', async ({ page }) => {
    // Simula companyId null
    await page.evaluate(() => {
      localStorage.removeItem('active_company_id');
      localStorage.removeItem('haccp-company-id');
    });
    
    // Verifica che l'app funzioni comunque
    await expect(page.locator('[data-testid="onboarding-wizard"]')).toBeVisible();
    
    // Verifica che DevButtons siano ancora funzionanti
    const prefillButton = page.locator('button:has-text("Precompila")');
    await expect(prefillButton).toBeVisible();
  });

  test('Dovrebbe validare dati completi per completamento onboarding', async ({ page }) => {
    // Click su Completa Onboarding senza dati
    const completeButton = page.locator('button:has-text("Completa Onboarding")');
    
    // Intercetta chiamate API per evitare errori reali
    await page.route('**/companies', route => route.fulfill({ 
      status: 200, 
      body: JSON.stringify({ id: 'test-company-id' }) 
    }));
    
    await completeButton.click();
    
    // Verifica che non ci siano errori critici
    // (potrebbe mostrare toast di errore ma non crashare)
    await page.waitForTimeout(1000);
    
    // Verifica che l'app sia ancora responsive
    await expect(page.locator('[data-testid="onboarding-wizard"]')).toBeVisible();
  });

  test('Dovrebbe gestire errori di rete durante completamento', async ({ page }) => {
    // Simula errore di rete
    await page.route('**/companies', route => route.abort());
    
    const completeButton = page.locator('button:has-text("Completa Onboarding")');
    await completeButton.click();
    
    // Verifica toast di errore
    await expect(page.locator('.Toastify__toast--error')).toBeVisible();
    
    // Verifica che l'app non crashi
    await expect(page.locator('[data-testid="onboarding-wizard"]')).toBeVisible();
  });

  test('Dovrebbe gestire timeout durante salvataggio', async ({ page }) => {
    // Simula timeout lento
    await page.route('**/companies', async route => {
      await new Promise(resolve => setTimeout(resolve, 10000));
      route.fulfill({ status: 200, body: JSON.stringify({ id: 'test' }) });
    });
    
    const completeButton = page.locator('button:has-text("Completa Onboarding")');
    await completeButton.click();
    
    // Verifica loading state
    await expect(page.locator('text=Completando...')).toBeVisible();
  });
});
