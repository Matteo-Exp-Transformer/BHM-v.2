const { test, expect } = require('@playwright/test');

test.describe('AcceptInviteForm - Test Funzionali', () => {
  
  // Setup: navigare alla pagina prima di ogni test
  test.beforeEach(async ({ page }) => {
    // Simulare token valido per i test
    await page.goto('http://localhost:3006/accept-invite?token=282f8738-27ac-4249-bad3-991203801df9');
    // Aspettare che il form sia caricato
    await expect(page.locator('form')).toBeVisible();
  });

  test('Dovrebbe mostrare tutti gli elementi del form', async ({ page }) => {
    // Verificare presenza elementi principali
    await expect(page.locator('h1')).toContainText('Business Haccp Manager');
    await expect(page.locator('h2')).toContainText('Crea il Tuo Account');
    
    // Verificare badge invito
    await expect(page.locator('text=Sei stato invitato come')).toBeVisible();
    
    // Verificare input fields
    await expect(page.locator('input[name="first_name"]')).toBeVisible();
    await expect(page.locator('input[name="last_name"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
    
    // Verificare bottone submit
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('Dovrebbe permettere inserimento in tutti i campi', async ({ page }) => {
    // Test inserimento nome
    await page.fill('input[name="first_name"]', 'Mario');
    await expect(page.locator('input[name="first_name"]')).toHaveValue('Mario');
    
    // Test inserimento cognome
    await page.fill('input[name="last_name"]', 'Rossi');
    await expect(page.locator('input[name="last_name"]')).toHaveValue('Rossi');
    
    // Test inserimento password
    await page.fill('input[name="password"]', 'password123');
    await expect(page.locator('input[name="password"]')).toHaveValue('password123');
    
    // Test inserimento conferma password
    await page.fill('input[name="confirmPassword"]', 'password123');
    await expect(page.locator('input[name="confirmPassword"]')).toHaveValue('password123');
    
    // Verificare che email sia readonly
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeDisabled();
  });

  test('Dovrebbe mostrare/nascondere password con toggle', async ({ page }) => {
    const passwordInput = page.locator('input[name="password"]');
    const confirmPasswordInput = page.locator('input[name="confirmPassword"]');
    const toggleButton = page.locator('button[type="button"]');
    
    // Inserire password
    await passwordInput.fill('password123');
    await confirmPasswordInput.fill('password123');
    
    // Verificare che inizialmente siano type="password"
    await expect(passwordInput).toHaveAttribute('type', 'password');
    await expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    
    // Click toggle button (icona emoji)
    await toggleButton.click();
    
    // Verificare che ora siano type="text"
    await expect(passwordInput).toHaveAttribute('type', 'text');
    await expect(confirmPasswordInput).toHaveAttribute('type', 'text');
    
    // Click di nuovo per nascondere
    await toggleButton.click();
    
    // Verificare che tornino type="password"
    await expect(passwordInput).toHaveAttribute('type', 'password');
    await expect(confirmPasswordInput).toHaveAttribute('type', 'password');
  });

  test('Dovrebbe mostrare loading state durante validazione invito', async ({ page }) => {
    // Navigare senza token per vedere loading state
    await page.goto('http://localhost:3006/accept-invite');
    
    // Verificare presenza spinner
    await expect(page.locator('svg.animate-spin')).toBeVisible();
    await expect(page.locator('text=Verifica invito in corso...')).toBeVisible();
  });

  test('Dovrebbe mostrare loading state durante submit', async ({ page }) => {
    // Compilare form con dati validi
    await page.fill('input[name="first_name"]', 'Mario');
    await page.fill('input[name="last_name"]', 'Rossi');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password123');
    
    // Intercettare la chiamata API per simulare delay
    await page.route('**/invites/accept', async route => {
      // Simulare delay di 2 secondi
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.continue();
    });
    
    // Submit form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Verificare loading state
    await expect(submitButton).toBeDisabled();
    await expect(submitButton).toContainText('Creazione account...');
    
    // Verificare presenza spinner
    await expect(page.locator('svg.animate-spin')).toBeVisible();
  });

  test('Dovrebbe mostrare pagina di successo dopo accettazione', async ({ page }) => {
    // Compilare form con dati validi
    await page.fill('input[name="first_name"]', 'Mario');
    await page.fill('input[name="last_name"]', 'Rossi');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password123');
    
    // Intercettare la chiamata API per simulare successo
    await page.route('**/invites/accept', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });
    
    // Submit form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Aspettare che appaia la pagina di successo
    await expect(page.locator('text=Account Creato!')).toBeVisible({ timeout: 10000 });
    
    // Verificare elementi della pagina di successo
    await expect(page.locator('text=Il tuo account è stato creato con successo')).toBeVisible();
    await expect(page.locator('text=Reindirizzamento in corso...')).toBeVisible();
  });

  test('Dovrebbe mostrare pagina di errore con token invalido', async ({ page }) => {
    // Navigare con token invalido
    await page.goto('http://localhost:3006/accept-invite?token=invalid-token-12345');
    
    // Aspettare che appaia la pagina di errore
    await expect(page.locator('text=Link Invito Non Valido')).toBeVisible({ timeout: 10000 });
    
    // Verificare elementi della pagina di errore
    await expect(page.locator('text=Il link di invito non è valido o è scaduto')).toBeVisible();
    await expect(page.locator('text=Contatta il tuo amministratore')).toBeVisible();
    await expect(page.locator('text=Vai al Login')).toBeVisible();
  });

  test('Dovrebbe mostrare informazioni invito corrette', async ({ page }) => {
    // Verificare badge invito
    await expect(page.locator('text=Sei stato invitato come')).toBeVisible();
    
    // Verificare che email sia mostrata
    await expect(page.locator('input[type="email"]')).toBeVisible();
    
    // Verificare che email sia readonly
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeDisabled();
  });

  test('Dovrebbe avere placeholder corretti negli input', async ({ page }) => {
    // Verificare placeholder nome
    await expect(page.locator('input[name="first_name"]')).toHaveAttribute('placeholder', 'Mario');
    
    // Verificare placeholder cognome
    await expect(page.locator('input[name="last_name"]')).toHaveAttribute('placeholder', 'Rossi');
    
    // Verificare placeholder password
    await expect(page.locator('input[name="password"]')).toHaveAttribute('placeholder', 'Minimo 8 caratteri');
    
    // Verificare placeholder conferma password
    await expect(page.locator('input[name="confirmPassword"]')).toHaveAttribute('placeholder', 'Ripeti password');
  });

  test('Dovrebbe avere autocomplete corretti negli input', async ({ page }) => {
    // Verificare autocomplete password
    await expect(page.locator('input[name="password"]')).toHaveAttribute('autocomplete', 'new-password');
    
    // Verificare autocomplete conferma password
    await expect(page.locator('input[name="confirmPassword"]')).toHaveAttribute('autocomplete', 'new-password');
  });

  test('Dovrebbe avere attributi required negli input', async ({ page }) => {
    // Verificare required nome
    await expect(page.locator('input[name="first_name"]')).toHaveAttribute('required');
    
    // Verificare required cognome
    await expect(page.locator('input[name="last_name"]')).toHaveAttribute('required');
    
    // Verificare required password
    await expect(page.locator('input[name="password"]')).toHaveAttribute('required');
    
    // Verificare required conferma password
    await expect(page.locator('input[name="confirmPassword"]')).toHaveAttribute('required');
  });

  test('Dovrebbe navigare a sign-in dopo successo', async ({ page }) => {
    // Compilare form con dati validi
    await page.fill('input[name="first_name"]', 'Mario');
    await page.fill('input[name="last_name"]', 'Rossi');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password123');
    
    // Intercettare la chiamata API per simulare successo
    await page.route('**/invites/accept', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });
    
    // Submit form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Aspettare pagina di successo
    await expect(page.locator('text=Account Creato!')).toBeVisible({ timeout: 10000 });
    
    // Aspettare redirect a sign-in
    await expect(page).toHaveURL('http://localhost:3006/sign-in', { timeout: 5000 });
  });
});
