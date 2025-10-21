const { test, expect } = require('@playwright/test');

test.describe('LoginForm - Test Funzionali', () => {
  
  // Setup: navigare alla pagina prima di ogni test
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3006/sign-in');
    // Aspettare che il form sia caricato
    await expect(page.locator('form')).toBeVisible();
  });

  test('Dovrebbe mostrare tutti gli elementi del form', async ({ page }) => {
    // Verificare presenza elementi principali
    await expect(page.locator('h1')).toContainText('Business Haccp Manager');
    await expect(page.locator('h2')).toContainText('Accedi al Sistema');
    
    // Verificare input fields
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    
    // Verificare bottoni e link
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('a[href="/forgot-password"]')).toBeVisible();
    await expect(page.locator('a[href="/sign-up"]')).toBeVisible();
    await expect(page.locator('button:has-text("Torna alla home")')).toBeVisible();
  });

  test('Dovrebbe permettere inserimento email e password', async ({ page }) => {
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    
    // Test inserimento email
    await emailInput.fill('test@example.com');
    await expect(emailInput).toHaveValue('test@example.com');
    
    // Test inserimento password
    await passwordInput.fill('password123');
    await expect(passwordInput).toHaveValue('password123');
  });

  test('Dovrebbe mostrare/nascondere password con toggle', async ({ page }) => {
    const passwordInput = page.locator('input[name="password"]');
    const toggleButton = page.locator('button[type="button"]').filter({ hasText: '' });
    
    // Inserire password
    await passwordInput.fill('password123');
    
    // Verificare che inizialmente sia type="password"
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click toggle button (icona occhio)
    await toggleButton.click();
    
    // Verificare che ora sia type="text"
    await expect(passwordInput).toHaveAttribute('type', 'text');
    
    // Click di nuovo per nascondere
    await toggleButton.click();
    
    // Verificare che torni type="password"
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('Dovrebbe navigare a forgot-password quando si clicca il link', async ({ page }) => {
    const forgotPasswordLink = page.locator('a[href="/forgot-password"]');
    
    // Click sul link
    await forgotPasswordLink.click();
    
    // Verificare navigazione
    await expect(page).toHaveURL('http://localhost:3006/forgot-password');
  });

  test('Dovrebbe navigare a sign-up quando si clicca il link', async ({ page }) => {
    const signUpLink = page.locator('a[href="/sign-up"]');
    
    // Click sul link
    await signUpLink.click();
    
    // Verificare navigazione
    await expect(page).toHaveURL('http://localhost:3006/sign-up');
  });

  test('Dovrebbe navigare a home quando si clicca il bottone torna alla home', async ({ page }) => {
    const backButton = page.locator('button:has-text("Torna alla home")');
    
    // Click sul bottone
    await backButton.click();
    
    // Verificare navigazione
    await expect(page).toHaveURL('http://localhost:3006/');
  });

  test('Dovrebbe mostrare loading state durante submit', async ({ page }) => {
    // Compilare form con credenziali valide
    await page.fill('input[name="email"]', 'matteo.cavallaro.work@gmail.com');
    await page.fill('input[name="password"]', 'Cavallaro');
    
    // Intercettare la chiamata API per simulare delay
    await page.route('**/auth/v1/token', async route => {
      // Simulare delay di 2 secondi
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.continue();
    });
    
    // Submit form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Verificare loading state
    await expect(submitButton).toBeDisabled();
    await expect(submitButton).toContainText('Accesso in corso...');
    
    // Verificare presenza spinner
    await expect(page.locator('svg.animate-spin')).toBeVisible();
  });

  test('Dovrebbe avere placeholder corretti negli input', async ({ page }) => {
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    
    // Verificare placeholder email
    await expect(emailInput).toHaveAttribute('placeholder', 'mario@esempio.com');
    
    // Verificare placeholder password
    await expect(passwordInput).toHaveAttribute('placeholder', '••••••••');
  });

  test('Dovrebbe avere autocomplete corretti negli input', async ({ page }) => {
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    
    // Verificare autocomplete email
    await expect(emailInput).toHaveAttribute('autocomplete', 'email');
    
    // Verificare autocomplete password
    await expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
  });

  test('Dovrebbe avere attributi required negli input', async ({ page }) => {
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    
    // Verificare required email
    await expect(emailInput).toHaveAttribute('required');
    
    // Verificare required password
    await expect(passwordInput).toHaveAttribute('required');
  });

  test('Dovrebbe avere tipo email corretto nel campo email', async ({ page }) => {
    const emailInput = page.locator('input[name="email"]');
    
    // Verificare type email
    await expect(emailInput).toHaveAttribute('type', 'email');
  });
});
