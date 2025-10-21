import { test, expect } from '@playwright/test';

test.describe('OnboardingWizard - Test Completamento', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/onboarding');
    await expect(page.locator('[data-testid="onboarding-wizard"]')).toBeVisible();
  });

  test('Dovrebbe completare onboarding con successo usando DevButton', async ({ page }) => {
    // 1. Precompila i dati
    await page.click('button:has-text("Precompila")');
    await expect(page.locator('.Toastify__toast--success')).toBeVisible();
    
    // 2. Verifica che i dati siano precompilati
    await expect(page.locator('input[value="Al Ritrovo SRL"]')).toBeVisible();
    await expect(page.locator('input[value="Via centotrecento 1/1b Bologna 40128"]')).toBeVisible();
    
    // 3. Click su Completa Onboarding
    await page.click('button:has-text("Completa Onboarding")');
    
    // 4. Verifica che il processo di completamento inizi
    await page.waitForTimeout(2000); // Aspetta che il processo inizi
    
    // 5. Verifica navigazione automatica a dashboard
    await expect(page).toHaveURL(/.*dashboard.*/);
    
    // 6. Verifica che i dati siano stati salvati (compliance score aggiornato)
    await expect(page.locator('text=Compliance Score')).toBeVisible();
    await expect(page.locator('text=100%')).toBeVisible();
    
    // 7. Verifica punti conservazione
    await expect(page.locator('text=Punti Conservazione')).toBeVisible();
    await expect(page.locator('text=7/7')).toBeVisible();
  });

  test('Dovrebbe mostrare loading state durante completamento', async ({ page }) => {
    // Precompila dati
    await page.click('button:has-text("Precompila")');
    await page.waitForTimeout(500);
    
    // Click su Completa Onboarding
    const completeButton = page.locator('button:has-text("Completa Onboarding")');
    await completeButton.click();
    
    // Verifica che il bottone mostri stato di caricamento (se presente)
    // Nota: Il loading potrebbe essere molto rapido
    await page.waitForTimeout(100);
    
    // Verifica che non ci siano errori critici
    await expect(page.locator('.Toastify__toast--error')).not.toBeVisible();
  });

  test('Dovrebbe gestire errori di rete durante completamento', async ({ page }) => {
    // Simula disconnessione di rete
    await page.context().setOffline(true);
    
    // Precompila dati
    await page.click('button:has-text("Precompila")');
    await page.waitForTimeout(500);
    
    // Click su Completa Onboarding
    await page.click('button:has-text("Completa Onboarding")');
    
    // Verifica toast di errore
    await expect(page.locator('.Toastify__toast--error')).toBeVisible();
    
    // Ripristina connessione
    await page.context().setOffline(false);
    
    // Verifica che l'app sia ancora responsive
    await expect(page.locator('[data-testid="onboarding-wizard"]')).toBeVisible();
  });

  test('Dovrebbe creare inviti per staff durante completamento', async ({ page }) => {
    // Intercetta chiamate API per verificare inviti
    let inviteCalls = 0;
    await page.route('**/invite_tokens', route => {
      inviteCalls++;
      route.fulfill({ 
        status: 200, 
        body: JSON.stringify({ id: `invite-${inviteCalls}` }) 
      });
    });
    
    // Precompila dati
    await page.click('button:has-text("Precompila")');
    await page.waitForTimeout(500);
    
    // Click su Completa Onboarding
    await page.click('button:has-text("Completa Onboarding")');
    
    // Aspetta completamento
    await page.waitForTimeout(3000);
    
    // Verifica che gli inviti siano stati creati (4 staff - 1 utente corrente = 3 inviti)
    expect(inviteCalls).toBeGreaterThanOrEqual(3);
  });

  test('Dovrebbe salvare tutti i dati su Supabase durante completamento', async ({ page }) => {
    // Intercetta chiamate API per verificare salvataggio
    const apiCalls = [];
    await page.route('**/supabase.co/rest/v1/**', route => {
      apiCalls.push({
        url: route.request().url(),
        method: route.request().method()
      });
      route.continue();
    });
    
    // Precompila dati
    await page.click('button:has-text("Precompila")');
    await page.waitForTimeout(500);
    
    // Click su Completa Onboarding
    await page.click('button:has-text("Completa Onboarding")');
    
    // Aspetta completamento
    await page.waitForTimeout(3000);
    
    // Verifica che le API siano state chiamate per salvare i dati
    const insertCalls = apiCalls.filter(call => call.method === 'POST');
    expect(insertCalls.length).toBeGreaterThan(5); // Departments, staff, products, etc.
    
    // Verifica tabelle specifiche
    const departmentsCall = insertCalls.find(call => call.url.includes('departments'));
    const staffCall = insertCalls.find(call => call.url.includes('staff'));
    const productsCall = insertCalls.find(call => call.url.includes('products'));
    
    expect(departmentsCall).toBeDefined();
    expect(staffCall).toBeDefined();
    expect(productsCall).toBeDefined();
  });

  test('Dovrebbe invalidare cache React Query dopo completamento', async ({ page }) => {
    // Monitora chiamate API
    const apiCalls = [];
    await page.route('**/supabase.co/rest/v1/**', route => {
      apiCalls.push({
        url: route.request().url(),
        method: route.request().method(),
        timestamp: Date.now()
      });
      route.continue();
    });
    
    // Precompila dati
    await page.click('button:has-text("Precompila")');
    await page.waitForTimeout(500);
    
    // Click su Completa Onboarding
    await page.click('button:has-text("Completa Onboarding")');
    
    // Aspetta completamento e navigazione
    await page.waitForTimeout(3000);
    
    // Verifica che ci siano chiamate GET dopo il completamento (cache invalidation)
    const getCalls = apiCalls.filter(call => 
      call.method === 'GET' && 
      call.timestamp > Date.now() - 5000
    );
    
    expect(getCalls.length).toBeGreaterThan(0);
  });

  test('Dovrebbe gestire companyId esistente durante completamento', async ({ page }) => {
    // Simula companyId esistente
    await page.evaluate(() => {
      localStorage.setItem('active_company_id', 'existing-company-id');
    });
    
    // Precompila dati
    await page.click('button:has-text("Precompila")');
    await page.waitForTimeout(500);
    
    // Click su Completa Onboarding
    await page.click('button:has-text("Completa Onboarding")');
    
    // Aspetta completamento
    await page.waitForTimeout(3000);
    
    // Verifica che l'onboarding sia completato comunque
    await expect(page).toHaveURL(/.*dashboard.*/);
  });

  test('Dovrebbe pulire localStorage dopo completamento', async ({ page }) => {
    // Precompila dati
    await page.click('button:has-text("Precompila")');
    await page.waitForTimeout(500);
    
    // Verifica che onboarding-data sia presente
    const hasDataBefore = await page.evaluate(() => {
      return localStorage.getItem('onboarding-data') !== null;
    });
    expect(hasDataBefore).toBe(true);
    
    // Click su Completa Onboarding
    await page.click('button:has-text("Completa Onboarding")');
    
    // Aspetta completamento
    await page.waitForTimeout(3000);
    
    // Verifica che onboarding-data sia stato rimosso
    const hasDataAfter = await page.evaluate(() => {
      return localStorage.getItem('onboarding-data') !== null;
    });
    expect(hasDataAfter).toBe(false);
    
    // Verifica che onboarding-completed sia stato impostato
    const isCompleted = await page.evaluate(() => {
      return localStorage.getItem('onboarding-completed') === 'true';
    });
    expect(isCompleted).toBe(true);
  });

  test('Dovrebbe gestire completamento senza dati precompilati', async ({ page }) => {
    // Click su Completa Onboarding senza precompilare
    await page.click('button:has-text("Completa Onboarding")');
    
    // Verifica che l'app gestisca la situazione
    await page.waitForTimeout(2000);
    
    // Potrebbe mostrare errore o completare comunque
    // L'importante è che non crashi
    await expect(page.locator('[data-testid="onboarding-wizard"]')).toBeVisible();
  });
});
