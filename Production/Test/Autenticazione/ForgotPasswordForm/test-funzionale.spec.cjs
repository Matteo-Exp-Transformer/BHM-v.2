const { test, expect } = require('@playwright/test');

test.describe('ForgotPasswordForm - Test Funzionali', () => {
  
  // Setup: navigare alla pagina prima di ogni test
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3006/forgot-password');
    // Aspettare che il form sia caricato
    await expect(page.locator('form')).toBeVisible();
  });

  test('Dovrebbe mostrare tutti gli elementi del form', async ({ page }) => {
    // Verificare presenza elementi principali
    await expect(page.locator('h1')).toContainText('Business Haccp Manager');
    await expect(page.locator('h2')).toContainText('Password Dimenticata?');
    
    // Verificare input field
    await expect(page.locator('input[name="email"]')).toBeVisible();
    
    // Verificare bottoni e link
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('a[href="/sign-in"]')).toBeVisible();
    await expect(page.locator('button:has-text("Torna alla home")')).toBeVisible();
  });

  test('Dovrebbe permettere inserimento nel campo email', async ({ page }) => {
    // Test inserimento email
    await page.fill('input[name="email"]', 'mario@example.com');
    await expect(page.locator('input[name="email"]')).toHaveValue('mario@example.com');
    
    // Test inserimento email diversa
    await page.fill('input[name="email"]', 'test@domain.com');
    await expect(page.locator('input[name="email"]')).toHaveValue('test@domain.com');
  });

  test('Dovrebbe mostrare loading state durante submit', async ({ page }) => {
    // Compilare form con email valida
    await page.fill('input[name="email"]', 'mario@example.com');
    
    // Intercettare la chiamata API per simulare delay
    await page.route('**/auth/v1/recover', async route => {
      // Simulare delay di 2 secondi
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.continue();
    });
    
    // Submit form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Verificare loading state
    await expect(submitButton).toBeDisabled();
    await expect(submitButton).toContainText('Invio in corso...');
    
    // Verificare presenza spinner
    await expect(page.locator('svg.animate-spin')).toBeVisible();
  });

  test('Dovrebbe navigare a sign-in quando si clicca il link', async ({ page }) => {
    const signInLink = page.locator('a[href="/sign-in"]');
    
    // Click sul link
    await signInLink.click();
    
    // Verificare navigazione
    await expect(page).toHaveURL('http://localhost:3006/sign-in');
  });

  test('Dovrebbe navigare a home quando si clicca il bottone torna alla home', async ({ page }) => {
    const backButton = page.locator('button:has-text("Torna alla home")');
    
    // Click sul bottone
    await backButton.click();
    
    // Verificare navigazione
    await expect(page).toHaveURL('http://localhost:3006/');
  });

  test('Dovrebbe mostrare pagina di conferma dopo submit riuscito', async ({ page }) => {
    // Compilare form con email valida
    await page.fill('input[name="email"]', 'mario@example.com');
    
    // Intercettare la chiamata API per simulare successo
    await page.route('**/auth/v1/recover', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Password reset email sent' })
      });
    });
    
    // Submit form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Aspettare che appaia la pagina di conferma
    await expect(page.locator('text=Email Inviata!')).toBeVisible({ timeout: 10000 });
    
    // Verificare elementi della pagina di conferma
    await expect(page.locator('text=Email Inviata! ✉️')).toBeVisible();
    await expect(page.locator('text=mario@example.com')).toBeVisible();
    await expect(page.locator('text=Controlla la tua email')).toBeVisible();
    await expect(page.locator('text=Il link per resettare la password è valido per 1 ora')).toBeVisible();
    await expect(page.locator('text=Torna al Login')).toBeVisible();
  });

  test('Dovrebbe avere placeholder corretto nel campo email', async ({ page }) => {
    // Verificare placeholder email
    await expect(page.locator('input[name="email"]')).toHaveAttribute('placeholder', 'mario@esempio.com');
  });

  test('Dovrebbe avere autocomplete corretto nel campo email', async ({ page }) => {
    // Verificare autocomplete email
    await expect(page.locator('input[name="email"]')).toHaveAttribute('autocomplete', 'email');
  });

  test('Dovrebbe avere attributo required nel campo email', async ({ page }) => {
    // Verificare required email
    await expect(page.locator('input[name="email"]')).toHaveAttribute('required');
  });

  test('Dovrebbe avere tipo email corretto nel campo email', async ({ page }) => {
    const emailInput = page.locator('input[name="email"]');
    
    // Verificare type email
    await expect(emailInput).toHaveAttribute('type', 'email');
  });

  test('Dovrebbe mostrare testo descrittivo', async ({ page }) => {
    // Verificare presenza testo descrittivo
    await expect(page.locator('text=Inserisci la tua email per ricevere le istruzioni di reset')).toBeVisible();
  });

  test('Dovrebbe gestire link torna al login nella pagina di conferma', async ({ page }) => {
    // Simulare stato emailSent
    await page.evaluate(() => {
      // Simulare che email sia stata inviata
      window.location.href = 'http://localhost:3006/forgot-password?sent=true';
    });
    
    // Navigare di nuovo alla pagina
    await page.goto('http://localhost:3006/forgot-password');
    
    // Compilare e submit per arrivare alla pagina di conferma
    await page.fill('input[name="email"]', 'mario@example.com');
    
    await page.route('**/auth/v1/recover', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Password reset email sent' })
      });
    });
    
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('text=Email Inviata!')).toBeVisible({ timeout: 10000 });
    
    // Click su link torna al login
    const backToLoginLink = page.locator('text=Torna al Login');
    await backToLoginLink.click();
    
    // Verificare navigazione
    await expect(page).toHaveURL('http://localhost:3006/sign-in');
  });
});
