const { test, expect } = require('@playwright/test');

test.describe('RegisterForm - Test Funzionali', () => {
  
  // Setup: navigare alla pagina prima di ogni test
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3006/sign-up');
    // Aspettare che il form sia caricato
    await expect(page.locator('form')).toBeVisible();
  });

  test('Dovrebbe mostrare tutti gli elementi del form', async ({ page }) => {
    // Verificare presenza elementi principali
    await expect(page.locator('h1')).toContainText('Business Haccp Manager');
    await expect(page.locator('h2')).toContainText('Registrati al Sistema');
    
    // Verificare input fields
    await expect(page.locator('input[name="first_name"]')).toBeVisible();
    await expect(page.locator('input[name="last_name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
    
    // Verificare bottoni e link
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('a[href="/sign-in"]')).toBeVisible();
    await expect(page.locator('button:has-text("Torna alla home")')).toBeVisible();
  });

  test('Dovrebbe permettere inserimento in tutti i campi', async ({ page }) => {
    // Test inserimento nome
    await page.fill('input[name="first_name"]', 'Mario');
    await expect(page.locator('input[name="first_name"]')).toHaveValue('Mario');
    
    // Test inserimento cognome
    await page.fill('input[name="last_name"]', 'Rossi');
    await expect(page.locator('input[name="last_name"]')).toHaveValue('Rossi');
    
    // Test inserimento email
    await page.fill('input[name="email"]', 'mario@example.com');
    await expect(page.locator('input[name="email"]')).toHaveValue('mario@example.com');
    
    // Test inserimento password
    await page.fill('input[name="password"]', 'password123');
    await expect(page.locator('input[name="password"]')).toHaveValue('password123');
    
    // Test inserimento conferma password
    await page.fill('input[name="confirmPassword"]', 'password123');
    await expect(page.locator('input[name="confirmPassword"]')).toHaveValue('password123');
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

  test('Dovrebbe mostrare loading state durante submit', async ({ page }) => {
    // Compilare form con dati validi
    await page.fill('input[name="first_name"]', 'Mario');
    await page.fill('input[name="last_name"]', 'Rossi');
    await page.fill('input[name="email"]', 'mario@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password123');
    
    // Intercettare la chiamata API per simulare delay
    await page.route('**/auth/v1/signup', async route => {
      // Simulare delay di 2 secondi
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.continue();
    });
    
    // Submit form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Verificare loading state
    await expect(submitButton).toBeDisabled();
    await expect(submitButton).toContainText('Registrazione in corso...');
    
    // Verificare presenza spinner
    await expect(page.locator('svg.animate-spin')).toBeVisible();
  });

  test('Dovrebbe avere placeholder corretti negli input', async ({ page }) => {
    // Verificare placeholder nome
    await expect(page.locator('input[name="first_name"]')).toHaveAttribute('placeholder', 'Mario');
    
    // Verificare placeholder cognome
    await expect(page.locator('input[name="last_name"]')).toHaveAttribute('placeholder', 'Rossi');
    
    // Verificare placeholder email
    await expect(page.locator('input[name="email"]')).toHaveAttribute('placeholder', 'mario@esempio.com');
    
    // Verificare placeholder password
    await expect(page.locator('input[name="password"]')).toHaveAttribute('placeholder', 'Minimo 8 caratteri');
    
    // Verificare placeholder conferma password
    await expect(page.locator('input[name="confirmPassword"]')).toHaveAttribute('placeholder', 'Ripeti password');
  });

  test('Dovrebbe avere autocomplete corretti negli input', async ({ page }) => {
    // Verificare autocomplete email
    await expect(page.locator('input[name="email"]')).toHaveAttribute('autocomplete', 'email');
    
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
    
    // Verificare required email
    await expect(page.locator('input[name="email"]')).toHaveAttribute('required');
    
    // Verificare required password
    await expect(page.locator('input[name="password"]')).toHaveAttribute('required');
    
    // Verificare required conferma password
    await expect(page.locator('input[name="confirmPassword"]')).toHaveAttribute('required');
  });

  test('Dovrebbe avere tipo email corretto nel campo email', async ({ page }) => {
    const emailInput = page.locator('input[name="email"]');
    
    // Verificare type email
    await expect(emailInput).toHaveAttribute('type', 'email');
  });

  test('Dovrebbe mostrare hint per password', async ({ page }) => {
    // Verificare presenza hint sotto campo password
    await expect(page.locator('text=Almeno 8 caratteri con lettere e numeri')).toBeVisible();
  });
});
