import { test, expect } from '@playwright/test';

test.describe('🔍 Test Filtri Calendario e Modal', () => {
  test.beforeEach(async ({ page }) => {
    // Login con credenziali reali
    await page.goto('http://localhost:3000/sign-in');
    await page.fill('input[name="email"]', 'matteo.cavallaro.work@gmail.com');
    await page.fill('input[name="password"]', 'cavallaro');
    await page.click('button[type="submit"]');
    
    // Navigazione alla pagina Attività
    await page.goto('http://localhost:3000/attivita');
    await page.waitForLoadState('networkidle');
  });

  test('🔍 Verifica funzionalità filtri calendario principale', async ({ page }) => {
    // 1. Verifica apertura sezione filtri
    await page.click('button:has-text("Filtri Calendario")');
    await expect(page.locator('text=Per Reparto')).toBeVisible();
    await expect(page.locator('text=Per Stato')).toBeVisible();
    await expect(page.locator('text=Per Tipo')).toBeVisible();
    
    // 2. Test filtro per tipo - Mansioni
    await page.click('button:has-text("📋 Mansioni")');
    await expect(page.locator('text=1 filtro')).toBeVisible();
    await expect(page.locator('text=1 selezionati')).toBeVisible();
    await expect(page.locator('button:has-text("📋 Mansioni")')).toHaveClass(/active/);
    
    // Verifica che il calendario mostri solo eventi Mansioni
    const mansioniEvents = page.locator('[data-testid="calendar-event"]:has-text("📋 Mansioni/Attività")');
    await expect(mansioniEvents.first()).toBeVisible();
    
    // 3. Test pulsante Reset
    await page.click('button:has-text("Reset")');
    await expect(page.locator('text=1 filtro')).not.toBeVisible();
    await expect(page.locator('button:has-text("📋 Mansioni")')).not.toHaveClass(/active/);
    
    // Verifica che tutti gli eventi siano ripristinati
    await expect(page.locator('text=138 items')).toBeVisible();
    await expect(page.locator('text=43 Alert')).toBeVisible();
    
    // 4. Test filtro per tipo - Scadenze Prodotti
    await page.click('button:has-text("📦 Scadenze Prodotti")');
    await expect(page.locator('text=1 filtro')).toBeVisible();
    await expect(page.locator('button:has-text("📦 Scadenze Prodotti")')).toHaveClass(/active/);
    
    // Verifica che il calendario mostri solo eventi Scadenze Prodotti
    const scadenzeEvents = page.locator('[data-testid="calendar-event"]:has-text("📦 Scadenze Prodotti")');
    await expect(scadenzeEvents.first()).toBeVisible();
    
    // Verifica statistiche aggiornate
    await expect(page.locator('text=8 items')).toBeVisible();
    await expect(page.locator('text=6 Alert')).toBeVisible();
    
    // 5. Test filtro per stato - Eventi futuri
    await page.click('button:has-text("Eventi futuri")');
    await expect(page.locator('text=2 filtri')).toBeVisible();
    await expect(page.locator('text=1 selezionati')).toBeVisible();
    await expect(page.locator('button:has-text("Eventi futuri")')).toHaveClass(/active/);
    
    // Verifica combinazione filtri
    await expect(page.locator('text=4 items')).toBeVisible();
    await expect(page.locator('text=2 Alert')).toBeVisible();
    
    // 6. Test Reset finale
    await page.click('button:has-text("Reset")');
    await expect(page.locator('text=2 filtri')).not.toBeVisible();
    await expect(page.locator('button:has-text("Eventi futuri")')).not.toHaveClass(/active/);
    await expect(page.locator('button:has-text("📦 Scadenze Prodotti")')).not.toHaveClass(/active/);
    
    // Verifica ripristino completo
    await expect(page.locator('text=138 items')).toBeVisible();
    await expect(page.locator('text=43 Alert')).toBeVisible();
    await expect(page.locator('text=37 eventi oggi')).toBeVisible();
    await expect(page.locator('text=7 eventi domani')).toBeVisible();
    await expect(page.locator('text=4 eventi in ritardo')).toBeVisible();
  });

  test('🔍 Verifica sincronizzazione filtri tra calendario e modal', async ({ page }) => {
    // 1. Applica filtro Mansioni
    await page.click('button:has-text("Filtri Calendario")');
    await page.click('button:has-text("📋 Mansioni")');
    
    // 2. Clicca su un evento per aprire il modal
    await page.click('[data-testid="calendar-event"]:has-text("📋 Mansioni/Attività")');
    await expect(page.locator('text=Eventi del giorno')).toBeVisible();
    
    // 3. Verifica che il modal mostri solo eventi Mansioni
    const modalEvents = page.locator('[data-testid="modal-event"]:has-text("📋")');
    await expect(modalEvents.first()).toBeVisible();
    
    // Verifica che non ci siano eventi di altri tipi nel modal
    await expect(page.locator('[data-testid="modal-event"]:has-text("🔧")')).not.toBeVisible();
    await expect(page.locator('[data-testid="modal-event"]:has-text("📦")')).not.toBeVisible();
    
    // 4. Chiudi modal e verifica persistenza filtro
    await page.keyboard.press('Escape');
    await expect(page.locator('text=1 filtro')).toBeVisible();
    await expect(page.locator('button:has-text("📋 Mansioni")')).toHaveClass(/active/);
  });

  test('🔍 Verifica filtri per stato', async ({ page }) => {
    await page.click('button:has-text("Filtri Calendario")');
    
    // Test filtro "Da completare"
    await page.click('button:has-text("Da completare")');
    await expect(page.locator('text=1 filtro')).toBeVisible();
    await expect(page.locator('button:has-text("Da completare")')).toHaveClass(/active/);
    
    // Test filtro "Completato"
    await page.click('button:has-text("Completato")');
    await expect(page.locator('button:has-text("Completato")')).toHaveClass(/active/);
    
    // Test filtro "In ritardo"
    await page.click('button:has-text("In ritardo")');
    await expect(page.locator('button:has-text("In ritardo")')).toHaveClass(/active/);
    
    // Verifica che gli eventi in ritardo siano visibili
    await expect(page.locator('text=4 eventi in ritardo')).toBeVisible();
    
    // Reset
    await page.click('button:has-text("Reset")');
    await expect(page.locator('text=1 filtro')).not.toBeVisible();
  });

  test('🔍 Verifica filtri per reparto', async ({ page }) => {
    await page.click('button:has-text("Filtri Calendario")');
    
    // Verifica che la sezione reparto sia presente
    await expect(page.locator('text=Per Reparto')).toBeVisible();
    
    // Nota: Attualmente non ci sono reparti configurati
    // Questo test verifica la presenza della funzionalità
    const repartoSection = page.locator('text=Per Reparto').locator('..');
    await expect(repartoSection).toBeVisible();
  });
});
