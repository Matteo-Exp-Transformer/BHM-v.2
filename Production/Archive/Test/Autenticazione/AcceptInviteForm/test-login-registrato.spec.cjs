const { test, expect } = require('@playwright/test');

test.describe('AcceptInviteForm - Login Utente Registrato', () => {
  
  test('Dovrebbe fare login con utente appena registrato', async ({ page }) => {
    // Navigare alla pagina di login
    await page.goto('http://localhost:3006/sign-in');
    
    // Verificare che siamo nella pagina di login
    await expect(page.locator('h1')).toContainText('Business Haccp Manager');
    await expect(page.locator('h2')).toContainText('Accedi al Sistema');
    
    // STEP 1: Inserire credenziali dell'utente appena registrato
    await page.fill('input[name="email"]', 'matti169cava@libero.it');
    await page.fill('input[name="password"]', 'password123');
    
    // Verificare che i dati siano stati inseriti
    await expect(page.locator('input[name="email"]')).toHaveValue('matti169cava@libero.it');
    await expect(page.locator('input[name="password"]')).toHaveValue('password123');
    
    // STEP 2: Submit login
    const loginButton = page.locator('button[type="submit"]');
    await expect(loginButton).toBeEnabled();
    await loginButton.click();
    
    // STEP 3: Verificare login riuscito (redirect alla dashboard)
    await expect(page).toHaveURL(/.*\/dashboard.*/, { timeout: 15000 });
    
    // Verificare che siamo autenticati (presenza di elementi della dashboard)
    await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10000 });
    
    // Verificare che l'utente sia loggato (presenza di elementi dell'header)
    await expect(page.locator('text=matti169cava@libero.it')).toBeVisible({ timeout: 5000 });
  });
  
  test('Dovrebbe mostrare errore con password sbagliata', async ({ page }) => {
    // Navigare alla pagina di login
    await page.goto('http://localhost:3006/sign-in');
    
    // Inserire credenziali con password sbagliata
    await page.fill('input[name="email"]', 'matti169cava@libero.it');
    await page.fill('input[name="password"]', 'password456');
    
    // Submit login
    await page.click('button[type="submit"]');
    
    // Verificare toast di errore
    await expect(page.locator('text=Credenziali non valide')).toBeVisible({ timeout: 5000 });
    
    // Verificare che rimaniamo nella pagina di login
    await expect(page).toHaveURL('http://localhost:3006/sign-in');
  });
  
  test('Dovrebbe mostrare errore con email non esistente', async ({ page }) => {
    // Navigare alla pagina di login
    await page.goto('http://localhost:3006/sign-in');
    
    // Inserire credenziali con email non esistente
    await page.fill('input[name="email"]', 'nonexistent@example.com');
    await page.fill('input[name="password"]', 'password123');
    
    // Submit login
    await page.click('button[type="submit"]');
    
    // Verificare toast di errore
    await expect(page.locator('text=Credenziali non valide')).toBeVisible({ timeout: 5000 });
    
    // Verificare che rimaniamo nella pagina di login
    await expect(page).toHaveURL('http://localhost:3006/sign-in');
  });
});
