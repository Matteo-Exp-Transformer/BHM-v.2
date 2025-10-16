const { test, expect } = require('@playwright/test');

test.describe('CalendarConfigModal - Test Funzionali', () => {
  
  // Setup: navigare alla pagina calendario prima di ogni test
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3003/attivita');
    // Aspettare che la pagina sia caricata
    await expect(page.locator('h1:has-text("Attività e Mansioni")')).toBeVisible();
  });

  test('Dovrebbe aprire il modal di configurazione calendario', async ({ page }) => {
    // ARRANGE: Cercare il pulsante per aprire la configurazione
    const configButton = page.locator('button:has-text("Configura il tuo anno lavorativo")');
    
    // ACT: Cliccare sul pulsante
    await configButton.click();
    
    // ASSERT: Verificare che il modal si apra
    await expect(page.locator('h2:has-text("Configurazione Calendario")')).toBeVisible();
    await expect(page.locator('text=Anno Lavorativo')).toBeVisible();
  });

  test('Dovrebbe chiudere il modal cliccando sul pulsante X', async ({ page }) => {
    // ARRANGE: Aprire il modal
    await page.locator('button:has-text("Configura il tuo anno lavorativo")').click();
    await expect(page.locator('h2:has-text("Configurazione Calendario")')).toBeVisible();
    
    // ACT: Cliccare sul pulsante X
    await page.locator('button:has([data-lucide="x"])').click();
    
    // ASSERT: Verificare che il modal si chiuda
    await expect(page.locator('h2:has-text("Configurazione Calendario")')).not.toBeVisible();
  });

  test('Dovrebbe chiudere il modal cliccando su Annulla', async ({ page }) => {
    // ARRANGE: Aprire il modal
    await page.locator('button:has-text("Configura il tuo anno lavorativo")').click();
    await expect(page.locator('h2:has-text("Configurazione Calendario")')).toBeVisible();
    
    // ACT: Cliccare su Annulla
    await page.locator('button:has-text("Annulla")').click();
    
    // ASSERT: Verificare che il modal si chiuda
    await expect(page.locator('h2:has-text("Configurazione Calendario")')).not.toBeVisible();
  });

  test('Dovrebbe chiudere il modal cliccando sul backdrop', async ({ page }) => {
    // ARRANGE: Aprire il modal
    await page.locator('button:has-text("Configura il tuo anno lavorativo")').click();
    await expect(page.locator('h2:has-text("Configurazione Calendario")')).toBeVisible();
    
    // ACT: Cliccare sul backdrop (area scura fuori dal modal)
    await page.locator('.fixed.inset-0.bg-black.bg-opacity-50').click();
    
    // ASSERT: Verificare che il modal si chiuda
    await expect(page.locator('h2:has-text("Configurazione Calendario")')).not.toBeVisible();
  });

  test('Dovrebbe mostrare tutti i campi di configurazione', async ({ page }) => {
    // ARRANGE: Aprire il modal
    await page.locator('button:has-text("Configura il tuo anno lavorativo")').click();
    
    // ASSERT: Verificare che tutti i campi siano visibili
    await expect(page.locator('text=Anno Lavorativo')).toBeVisible();
    await expect(page.locator('text=Giorni Apertura Settimanali')).toBeVisible();
    await expect(page.locator('text=Giorni di Chiusura')).toBeVisible();
    await expect(page.locator('text=Orari di Apertura')).toBeVisible();
    
    // Verificare i campi input
    await expect(page.locator('input[type="date"]').first()).toBeVisible();
    await expect(page.locator('input[type="date"]').nth(1)).toBeVisible();
  });

  test('Dovrebbe mostrare i giorni della settimana come pulsanti cliccabili', async ({ page }) => {
    // ARRANGE: Aprire il modal
    await page.locator('button:has-text("Configura il tuo anno lavorativo")').click();
    
    // ASSERT: Verificare che ci siano 7 pulsanti per i giorni della settimana
    const weekdayButtons = page.locator('button:has-text("lun"), button:has-text("mar"), button:has-text("mer"), button:has-text("gio"), button:has-text("ven"), button:has-text("sab"), button:has-text("dom")');
    await expect(weekdayButtons).toHaveCount(7);
    
    // Verificare che siano cliccabili
    await expect(weekdayButtons.first()).toBeEnabled();
  });

  test('Dovrebbe mostrare i pulsanti per tipo di chiusura', async ({ page }) => {
    // ARRANGE: Aprire il modal
    await page.locator('button:has-text("Configura il tuo anno lavorativo")').click();
    
    // ASSERT: Verificare i pulsanti per tipo chiusura
    await expect(page.locator('button:has-text("Giorno Singolo")')).toBeVisible();
    await expect(page.locator('button:has-text("Periodo")')).toBeVisible();
  });

  test('Dovrebbe mostrare il pulsante Salva Configurazione', async ({ page }) => {
    // ARRANGE: Aprire il modal
    await page.locator('button:has-text("Configura il tuo anno lavorativo")').click();
    
    // ASSERT: Verificare il pulsante salva
    const saveButton = page.locator('button:has-text("Salva Configurazione")');
    await expect(saveButton).toBeVisible();
    
    // Il pulsante dovrebbe essere disabilitato inizialmente (form non valido)
    await expect(saveButton).toBeDisabled();
  });
});
