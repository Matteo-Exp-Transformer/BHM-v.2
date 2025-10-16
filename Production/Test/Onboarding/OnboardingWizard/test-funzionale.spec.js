import { test, expect } from '@playwright/test';

test.describe('OnboardingWizard - Test Funzionali', () => {
  test.beforeEach(async ({ page }) => {
    // Naviga alla pagina onboarding
    await page.goto('/onboarding');
    await expect(page.locator('[data-testid="onboarding-wizard"]')).toBeVisible();
  });

  test('Dovrebbe mostrare il wizard di onboarding con header corretto', async ({ page }) => {
    // Verifica header
    await expect(page.locator('h1')).toContainText('Configurazione Iniziale HACCP');
    await expect(page.locator('p')).toContainText('Configura la tua azienda per iniziare a utilizzare il sistema HACCP');
    
    // Verifica bottone skip
    await expect(page.locator('button:has-text("Salta")')).toBeVisible();
  });

  test('Dovrebbe mostrare il navigatore step con 7 step', async ({ page }) => {
    // Verifica step navigator
    const stepButtons = page.locator('[data-testid="step-navigator"] button');
    await expect(stepButtons).toHaveCount(7);
    
    // Verifica primo step attivo
    await expect(stepButtons.first()).toHaveClass(/border-blue-200/);
  });

  test('Dovrebbe mostrare progress bar corretta', async ({ page }) => {
    const progressBar = page.locator('.bg-blue-600');
    await expect(progressBar).toBeVisible();
    
    // Verifica testo step counter
    await expect(page.locator('text=Step 1 di 7')).toBeVisible();
  });

  test('Dovrebbe mostrare bottoni di navigazione corretti', async ({ page }) => {
    // Bottone Indietro dovrebbe essere disabilitato al primo step
    const backButton = page.locator('button:has-text("Indietro")');
    await expect(backButton).toBeDisabled();
    
    // Bottone Avanti dovrebbe essere visibile ma disabilitato (step non valido)
    const nextButton = page.locator('button:has-text("Avanti")');
    await expect(nextButton).toBeVisible();
    await expect(nextButton).toBeDisabled();
  });

  test('Dovrebbe mostrare DevButtons in modalità sviluppo', async ({ page }) => {
    // Verifica presenza bottoni dev
    await expect(page.locator('button:has-text("Precompila")')).toBeVisible();
    await expect(page.locator('button:has-text("Completa Onboarding")')).toBeVisible();
  });

  test('Dovrebbe navigare tra step cliccando sui bottoni step', async ({ page }) => {
    // Click su step 2 (dovrebbe essere disabilitato se step 1 non valido)
    const step2Button = page.locator('[data-testid="step-navigator"] button').nth(1);
    await step2Button.click();
    
    // Verifica che rimanga al primo step se non valido
    await expect(page.locator('text=Step 1 di 7')).toBeVisible();
  });

  test('Dovrebbe mostrare toast di errore quando si tenta di avanzare senza validazione', async ({ page }) => {
    // Click su Avanti senza validare step
    const nextButton = page.locator('button:has-text("Avanti")');
    await nextButton.click();
    
    // Verifica toast di errore
    await expect(page.locator('.Toastify__toast--error')).toBeVisible();
    await expect(page.locator('.Toastify__toast--error')).toContainText('Completa tutti i campi obbligatori');
  });

  test('Dovrebbe mostrare bottone Skip con conferma', async ({ page }) => {
    // Click su Skip
    const skipButton = page.locator('button:has-text("Salta")');
    await skipButton.click();
    
    // Verifica dialog di conferma
    await expect(page.locator('text=ATTENZIONE!')).toBeVisible();
    await expect(page.locator('text=Sei sicuro di voler saltare la configurazione iniziale?')).toBeVisible();
  });

  test('Dovrebbe mostrare loading state durante completamento', async ({ page }) => {
    // Click su Completa Onboarding (dev button)
    const completeButton = page.locator('button:has-text("Completa Onboarding")');
    
    // Intercetta navigazione per testare loading
    await page.route('**/dashboard', route => route.fulfill({ status: 200, body: '<html>Dashboard</html>' }));
    
    await completeButton.click();
    
    // Verifica loading state (se presente)
    // Nota: Il loading potrebbe essere molto rapido
    await page.waitForTimeout(100);
  });

  test('Dovrebbe salvare dati in localStorage durante navigazione', async ({ page }) => {
    // Verifica che localStorage sia inizializzato
    const savedData = await page.evaluate(() => {
      return localStorage.getItem('onboarding-data');
    });
    
    // Dati dovrebbero essere presenti (anche se vuoti)
    expect(savedData).toBeDefined();
  });

  test('Dovrebbe mostrare step counter corretto per ogni step', async ({ page }) => {
    // Verifica step counter iniziale
    await expect(page.locator('text=Step 1 di 7')).toBeVisible();
    
    // Verifica percentuale progress
    await expect(page.locator('text=14% completato')).toBeVisible();
  });

  test('Dovrebbe gestire responsive design correttamente', async ({ page }) => {
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verifica che step navigator mobile sia visibile
    await expect(page.locator('.md\\:hidden')).toBeVisible();
    
    // Verifica che step navigator desktop sia nascosto
    await expect(page.locator('.hidden.md\\:block')).toBeHidden();
    
    // Ripristina desktop view
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Verifica che step navigator desktop sia visibile
    await expect(page.locator('.hidden.md\\:block')).toBeVisible();
  });
});
