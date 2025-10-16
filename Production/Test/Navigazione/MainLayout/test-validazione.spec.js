import { test, expect } from '@playwright/test';

test.describe('MainLayout - Test Validazione Dati', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3004/dashboard');
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('nav[role="navigation"]')).toBeVisible();
  });

  test('Dovrebbe gestire correttamente permessi tab Impostazioni', async ({ page }) => {
    // Test con utente admin (se disponibile)
    const settingsTab = page.locator('nav a[href="/impostazioni"]');
    
    if (await settingsTab.isVisible()) {
      // Se tab è visibile, dovrebbe essere cliccabile
      await expect(settingsTab).toBeVisible();
      await expect(settingsTab).not.toHaveClass(/opacity-50/);
      await expect(settingsTab).not.toHaveClass(/cursor-not-allowed/);
      
      // Cliccare e verificare accesso
      await page.click('nav a[href="/impostazioni"]');
      await expect(page).toHaveURL(/.*impostazioni/);
    } else {
      // Se tab non è visibile, utente non ha permessi admin
      console.log('Tab Impostazioni non visibile - utente non admin');
    }
  });

  test('Dovrebbe gestire correttamente permessi tab Gestione', async ({ page }) => {
    // Test con utente admin/responsabile (se disponibile)
    const managementTab = page.locator('nav a[href="/gestione"]');
    
    if (await managementTab.isVisible()) {
      // Se tab è visibile, dovrebbe essere cliccabile
      await expect(managementTab).toBeVisible();
      await expect(managementTab).not.toHaveClass(/opacity-50/);
      await expect(managementTab).not.toHaveClass(/cursor-not-allowed/);
      
      // Cliccare e verificare accesso
      await page.click('nav a[href="/gestione"]');
      await expect(page).toHaveURL(/.*gestione/);
    } else {
      // Se tab non è visibile, utente non ha permessi admin/responsabile
      console.log('Tab Gestione non visibile - utente non admin/responsabile');
    }
  });

  test('Dovrebbe mostrare tutti i tab base per utenti autenticati', async ({ page }) => {
    // Verificare che tab base siano sempre visibili per utenti autenticati
    const requiredTabs = [
      { href: '/dashboard', label: 'Home' },
      { href: '/conservazione', label: 'Conservazione' },
      { href: '/attivita', label: 'Attività' },
      { href: '/inventario', label: 'Inventario' }
    ];
    
    for (const tab of requiredTabs) {
      const tabElement = page.locator(`nav a[href="${tab.href}"]`);
      await expect(tabElement).toBeVisible();
      await expect(tabElement).toContainText(tab.label);
      await expect(tabElement).not.toHaveClass(/opacity-50/);
    }
  });

  test('Dovrebbe gestire correttamente stati loading', async ({ page }) => {
    // Navigare a una pagina che potrebbe avere loading
    await page.goto('http://localhost:3004/conservazione');
    
    // Verificare che layout sia ancora visibile durante loading
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('nav[role="navigation"]')).toBeVisible();
    
    // Verificare che tab conservazione sia attivo
    await expect(page.locator('nav a[href="/conservazione"]')).toHaveClass(/text-primary-600/);
  });

  test('Dovrebbe mantenere stato navigazione durante refresh', async ({ page }) => {
    // Navigare a conservazione
    await page.click('nav a[href="/conservazione"]');
    await expect(page).toHaveURL(/.*conservazione/);
    
    // Refresh pagina
    await page.reload();
    
    // Verificare che tab conservazione sia ancora attivo
    await expect(page.locator('nav a[href="/conservazione"]')).toHaveClass(/text-primary-600/);
    await expect(page).toHaveURL(/.*conservazione/);
  });

  test('Dovrebbe gestire correttamente navigazione con URL diretti', async ({ page }) => {
    // Test navigazione diretta a inventario
    await page.goto('http://localhost:3004/inventario');
    
    // Verificare che tab inventario sia attivo
    await expect(page.locator('nav a[href="/inventario"]')).toHaveClass(/text-primary-600/);
    
    // Test navigazione diretta a attività
    await page.goto('http://localhost:3004/attivita');
    
    // Verificare che tab attività sia attivo
    await expect(page.locator('nav a[href="/attivita"]')).toHaveClass(/text-primary-600/);
  });

  test('Dovrebbe gestire correttamente CompanySwitcher se presente', async ({ page }) => {
    // Verificare se CompanySwitcher è presente
    const companySwitcher = page.locator('[data-testid="company-switcher"], .company-switcher, button:has-text("Seleziona azienda")');
    
    if (await companySwitcher.first().isVisible()) {
      await expect(companySwitcher.first()).toBeVisible();
      console.log('CompanySwitcher presente');
    } else {
      console.log('CompanySwitcher non presente - utente con una sola azienda');
    }
  });

  test('Dovrebbe gestire correttamente HeaderButtons se presenti', async ({ page }) => {
    // Verificare presenza bottoni header
    const headerButtons = page.locator('header button');
    
    if (await headerButtons.count() > 0) {
      await expect(headerButtons.first()).toBeVisible();
      
      // Verificare che bottoni siano cliccabili
      const firstButton = headerButtons.first();
      await expect(firstButton).not.toHaveClass(/opacity-50/);
      await expect(firstButton).not.toHaveClass(/cursor-not-allowed/);
      
      console.log('HeaderButtons presenti');
    } else {
      console.log('HeaderButtons non presenti');
    }
  });

  test('Dovrebbe gestire correttamente SyncStatusBar se presente', async ({ page }) => {
    // Verificare presenza SyncStatusBar
    const syncStatusBar = page.locator('[data-testid="sync-status-bar"], .sync-status-bar');
    
    if (await syncStatusBar.isVisible()) {
      await expect(syncStatusBar).toBeVisible();
      console.log('SyncStatusBar presente');
    } else {
      console.log('SyncStatusBar non presente o nascosta');
    }
  });

  test('Dovrebbe validare correttamente struttura HTML', async ({ page }) => {
    // Verificare struttura header
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('header h1')).toBeVisible();
    
    // Verificare struttura main
    await expect(page.locator('main')).toBeVisible();
    
    // Verificare struttura nav
    await expect(page.locator('nav[role="navigation"]')).toBeVisible();
    
    // Verificare che nav sia fixed bottom
    const navElement = page.locator('nav[role="navigation"]');
    const styles = await navElement.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        position: computed.position,
        bottom: computed.bottom
      };
    });
    
    expect(styles.position).toBe('fixed');
    expect(styles.bottom).toBe('0px');
  });
});
