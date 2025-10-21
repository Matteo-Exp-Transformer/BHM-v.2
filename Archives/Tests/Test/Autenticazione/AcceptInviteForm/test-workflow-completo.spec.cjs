const { test, expect } = require('@playwright/test');

test.describe('AcceptInviteForm - Workflow Completo', () => {
  
  test('Workflow completo: Invito -> Registrazione -> Login', async ({ page }) => {
    // STEP 1: Navigare al link invito con token valido
    await page.goto('http://localhost:3006/accept-invite?token=282f8738-27ac-4249-bad3-991203801df9');
    
    // Verificare che la pagina si carichi correttamente
    await expect(page.locator('h1')).toContainText('Business Haccp Manager');
    await expect(page.locator('h2')).toContainText('Crea il Tuo Account');
    
    // Verificare che l'email sia mostrata e readonly
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toBeDisabled();
    await expect(emailInput).toHaveValue('matti169cava@libero.it');
    
    // Verificare badge ruolo
    await expect(page.locator('text=Sei stato invitato come')).toBeVisible();
    await expect(page.locator('text=RESPONSABILE')).toBeVisible();
    
    // STEP 2: Compilare form con dati validi (UNA SOLA VOLTA)
    await page.fill('input[name="first_name"]', 'Mario');
    await page.fill('input[name="last_name"]', 'Rossi');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password123');
    
    // Verificare che i dati siano stati inseriti correttamente
    await expect(page.locator('input[name="first_name"]')).toHaveValue('Mario');
    await expect(page.locator('input[name="last_name"]')).toHaveValue('Rossi');
    await expect(page.locator('input[name="password"]')).toHaveValue('password123');
    await expect(page.locator('input[name="confirmPassword"]')).toHaveValue('password123');
    
    // STEP 3: Submit form (UNA SOLA VOLTA)
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeEnabled();
    await submitButton.click();
    
    // STEP 4: Verificare loading state
    await expect(submitButton).toBeDisabled();
    await expect(submitButton).toContainText('Creazione account...');
    
    // STEP 5: Aspettare pagina di successo
    await expect(page.locator('text=Account Creato!')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Il tuo account è stato creato con successo')).toBeVisible();
    await expect(page.locator('text=Reindirizzamento in corso...')).toBeVisible();
    
    // STEP 6: Aspettare redirect a sign-in
    await expect(page).toHaveURL('http://localhost:3006/sign-in', { timeout: 10000 });
    
    // STEP 7: Verificare che siamo nella pagina di login
    await expect(page.locator('h1')).toContainText('Business Haccp Manager');
    await expect(page.locator('h2')).toContainText('Accedi al Sistema');
    
    // STEP 8: Login con le credenziali appena create
    await page.fill('input[name="email"]', 'matti169cava@libero.it');
    await page.fill('input[name="password"]', 'password123');
    
    // Verificare che i dati siano stati inseriti
    await expect(page.locator('input[name="email"]')).toHaveValue('matti169cava@libero.it');
    await expect(page.locator('input[name="password"]')).toHaveValue('password123');
    
    // STEP 9: Submit login
    const loginButton = page.locator('button[type="submit"]');
    await expect(loginButton).toBeEnabled();
    await loginButton.click();
    
    // STEP 10: Verificare login riuscito (redirect alla dashboard)
    await expect(page).toHaveURL(/.*\/dashboard.*/, { timeout: 15000 });
    
    // Verificare che siamo autenticati (presenza di elementi della dashboard)
    await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10000 });
  });
  
  test('Dovrebbe mostrare errore con token invalido', async ({ page }) => {
    // Navigare con token invalido
    await page.goto('http://localhost:3006/accept-invite?token=invalid-token-12345');
    
    // Aspettare che appaia la pagina di errore
    await expect(page.locator('text=Link Invito Non Valido')).toBeVisible({ timeout: 10000 });
    
    // Verificare elementi della pagina di errore
    await expect(page.locator('text=Il link di invito non è valido o è scaduto')).toBeVisible();
    await expect(page.locator('text=Contatta il tuo amministratore')).toBeVisible();
    await expect(page.locator('text=Vai al Login')).toBeVisible();
    
    // Verificare che il link "Vai al Login" funzioni
    await page.click('text=Vai al Login');
    await expect(page).toHaveURL('http://localhost:3006/sign-in');
  });
  
  test('Dovrebbe mostrare errore senza token', async ({ page }) => {
    // Navigare senza token
    await page.goto('http://localhost:3006/accept-invite');
    
    // Aspettare toast di errore (primo elemento)
    await expect(page.locator('text=Token di invito mancante').first()).toBeVisible({ timeout: 5000 });
    
    // Verificare redirect a sign-in
    await expect(page).toHaveURL('http://localhost:3006/sign-in', { timeout: 5000 });
  });
  
  test('Dovrebbe validare password non coincidenti', async ({ page }) => {
    // Navigare al link invito
    await page.goto('http://localhost:3006/accept-invite?token=75143c7b-02a7-44a5-9d7f-84e1855a47de');
    
    // Compilare form con password diverse
    await page.fill('input[name="first_name"]', 'Mario');
    await page.fill('input[name="last_name"]', 'Rossi');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password456');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Verificare toast di errore
    await expect(page.locator('text=Le password non coincidono')).toBeVisible({ timeout: 5000 });
    
    // Verificare che il form sia ancora visibile (non redirect)
    await expect(page.locator('form')).toBeVisible();
  });
  
  test('Dovrebbe validare password troppo corta', async ({ page }) => {
    // Navigare al link invito
    await page.goto('http://localhost:3006/accept-invite?token=5c2a3bdb-fa1b-4f8c-a8fd-7d99d401e088');
    
    // Compilare form con password corta
    await page.fill('input[name="first_name"]', 'Mario');
    await page.fill('input[name="last_name"]', 'Rossi');
    await page.fill('input[name="password"]', '123');
    await page.fill('input[name="confirmPassword"]', '123');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Verificare toast di errore
    await expect(page.locator('text=La password deve essere almeno 8 caratteri')).toBeVisible({ timeout: 5000 });
    
    // Verificare che il form sia ancora visibile (non redirect)
    await expect(page.locator('form')).toBeVisible();
  });
});
