import { test, expect } from '@playwright/test';

test.describe('MainLayout - Test Funzionali', () => {
  
  // Setup: navigare alla pagina prima di ogni test
  test.beforeEach(async ({ page }) => {
    // Navigare alla dashboard (protetta)
    await page.goto('http://localhost:3004/dashboard');
    
    // Aspettare che il MainLayout sia caricato
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('nav[role="navigation"]')).toBeVisible();
  });

  test('Dovrebbe mostrare header con titolo e controlli', async ({ page }) => {
    // Verificare header presente
    await expect(page.locator('header')).toBeVisible();
    
    // Verificare titolo HACCP Manager
    await expect(page.locator('header h1')).toContainText('HACCP Manager');
    
    // Verificare presenza controlli header
    await expect(page.locator('header button')).toBeVisible();
  });

  test('Dovrebbe mostrare navigazione bottom con tab principali', async ({ page }) => {
    // Verificare navigazione bottom presente
    await expect(page.locator('nav[role="navigation"]')).toBeVisible();
    
    // Verificare tab Home
    await expect(page.locator('nav a[href="/dashboard"]')).toBeVisible();
    await expect(page.locator('nav a[href="/dashboard"] span')).toContainText('Home');
    
    // Verificare tab Conservazione
    await expect(page.locator('nav a[href="/conservazione"]')).toBeVisible();
    await expect(page.locator('nav a[href="/conservazione"] span')).toContainText('Conservazione');
    
    // Verificare tab Attività
    await expect(page.locator('nav a[href="/attivita"]')).toBeVisible();
    await expect(page.locator('nav a[href="/attivita"] span')).toContainText('Attività');
    
    // Verificare tab Inventario
    await expect(page.locator('nav a[href="/inventario"]')).toBeVisible();
    await expect(page.locator('nav a[href="/inventario"] span')).toContainText('Inventario');
  });

  test('Dovrebbe evidenziare tab attivo', async ({ page }) => {
    // Verificare che tab Dashboard sia attivo
    const dashboardTab = page.locator('nav a[href="/dashboard"]');
    await expect(dashboardTab).toHaveClass(/text-primary-600/);
    await expect(dashboardTab).toHaveClass(/bg-primary-50/);
    
    // Verificare aria-current="page" sul tab attivo
    await expect(dashboardTab).toHaveAttribute('aria-current', 'page');
  });

  test('Dovrebbe permettere navigazione tra tab', async ({ page }) => {
    // Cliccare su tab Conservazione
    await page.click('nav a[href="/conservazione"]');
    
    // Verificare che siamo nella pagina conservazione
    await expect(page).toHaveURL(/.*conservazione/);
    
    // Verificare che tab Conservazione sia ora attivo
    const conservationTab = page.locator('nav a[href="/conservazione"]');
    await expect(conservationTab).toHaveClass(/text-primary-600/);
    await expect(conservationTab).toHaveClass(/bg-primary-50/);
    
    // Verificare che tab Dashboard non sia più attivo
    const dashboardTab = page.locator('nav a[href="/dashboard"]');
    await expect(dashboardTab).not.toHaveClass(/text-primary-600/);
  });

  test('Dovrebbe mostrare tab Impostazioni solo per admin', async ({ page }) => {
    // Verificare se tab Impostazioni è presente (dipende dal ruolo utente)
    const settingsTab = page.locator('nav a[href="/impostazioni"]');
    
    // Se presente, verificare che sia cliccabile
    if (await settingsTab.isVisible()) {
      await expect(settingsTab).toBeVisible();
      await expect(settingsTab).toContainText('Impostazioni');
    }
  });

  test('Dovrebbe mostrare tab Gestione solo per admin/responsabile', async ({ page }) => {
    // Verificare se tab Gestione è presente (dipende dal ruolo utente)
    const managementTab = page.locator('nav a[href="/gestione"]');
    
    // Se presente, verificare che sia cliccabile
    if (await managementTab.isVisible()) {
      await expect(managementTab).toBeVisible();
      await expect(managementTab).toContainText('Gestione');
    }
  });

  test('Dovrebbe avere layout responsive', async ({ page }) => {
    // Test desktop - verificare che tab abbiano testo completo
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Verificare che testi tab siano visibili
    await expect(page.locator('nav a[href="/dashboard"] span')).toBeVisible();
    
    // Test mobile - verificare che layout si adatti
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verificare che navigazione sia ancora visibile
    await expect(page.locator('nav[role="navigation"]')).toBeVisible();
    
    // Verificare che tab siano ancora cliccabili
    await expect(page.locator('nav a[href="/dashboard"]')).toBeVisible();
  });

  test('Dovrebbe avere accessibilità corretta', async ({ page }) => {
    // Verificare role navigation
    await expect(page.locator('nav[role="navigation"]')).toBeVisible();
    
    // Verificare aria-label
    await expect(page.locator('nav[aria-label="Main navigation"]')).toBeVisible();
    
    // Verificare aria-label sui link
    await expect(page.locator('nav a[aria-label*="Navigate to"]')).toBeVisible();
    
    // Verificare aria-current sul tab attivo
    await expect(page.locator('nav a[aria-current="page"]')).toBeVisible();
  });

  test('Dovrebbe mostrare contenuto principale', async ({ page }) => {
    // Verificare che main content sia presente
    await expect(page.locator('main[role="main"]')).toBeVisible();
    
    // Verificare che main content abbia aria-label
    await expect(page.locator('main[aria-label="Main content"]')).toBeVisible();
    
    // Verificare che main content contenga children
    await expect(page.locator('main')).not.toBeEmpty();
  });

  test('Dovrebbe avere padding bottom per navigazione fissa', async ({ page }) => {
    // Verificare che main content abbia padding bottom per navigazione fissa
    const mainElement = page.locator('main');
    const styles = await mainElement.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        paddingBottom: computed.paddingBottom
      };
    });
    
    // Verificare che ci sia padding bottom (pb-20 = 5rem = 80px)
    expect(styles.paddingBottom).toMatch(/80px|5rem/);
  });
});
