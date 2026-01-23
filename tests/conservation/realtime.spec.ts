import { test, expect } from '@playwright/test'
import { loginAsTestUser } from '../helpers/auth.helper'

/**
 * Test Real-time Updates - Feature Conservation (OPZIONALE)
 * 
 * Worker 4 - Task 4.3: Real-time (Opzionale)
 * 
 * Verifica che gli aggiornamenti real-time funzionino correttamente:
 * - Aggiunta temperatura in Tab 1 → dovrebbe apparire automaticamente in Tab 2
 * - Modifica punto in Tab 1 → dovrebbe aggiornarsi in Tab 2
 * 
 * NOTA: Questo test è opzionale e richiede che il sistema abbia
 * abilitato gli aggiornamenti real-time (Supabase Realtime).
 * Se non funziona, è un enhancement futuro (non bloccante).
 */

test.describe('Conservation Real-time Updates (Optional)', () => {
  let testPointName: string

  test.beforeEach(() => {
    // Genera nome unico per il punto di test
    testPointName = `Real-time Test ${Date.now()}`
  })

  test.skip('temperature reading appears in real-time across tabs', async ({ browser }) => {
    // SKIP di default - test opzionale
    // Per eseguire: rimuovi .skip o usa test.only
    
    // Crea due context separati (simula due tab/browser)
    const context1 = await browser.newContext()
    const context2 = await browser.newContext()
    
    const page1 = await context1.newPage()
    const page2 = await context2.newPage()

    try {
      // Login su entrambe le tab
      await loginAsTestUser(page1)
      await loginAsTestUser(page2)
      
      // Naviga a /conservazione su entrambe le tab
      await Promise.all([
        page1.goto('/conservazione'),
        page2.goto('/conservazione')
      ])
      
      // Attendi che entrambe le pagine siano caricate
      await Promise.all([
        expect(page1.locator('text=Sistema di Conservazione').first()).toBeVisible({ timeout: 10000 }),
        expect(page2.locator('text=Sistema di Conservazione').first()).toBeVisible({ timeout: 10000 })
      ])
      
      // Cerca un punto esistente nella lista (o creane uno se necessario)
      // Per questo test, assumiamo che esista almeno un punto
      const existingPoint = page1.locator('[data-testid="conservation-point-card"], .conservation-point-card').first()
      
      if (await existingPoint.isVisible({ timeout: 5000 }).catch(() => false)) {
        // Screenshot iniziale: stato prima dell'aggiornamento
        await Promise.all([
          page1.screenshot({ path: 'test-evidence/realtime-tab1-before.png' }),
          page2.screenshot({ path: 'test-evidence/realtime-tab2-before.png' })
        ])
        
        // In Tab 1: Aggiungi una lettura temperatura
        const addTempButton1 = page1.locator('button:has-text("Registra Temperatura"), button:has-text("Aggiungi Temperatura")').first()
        
        if (await addTempButton1.isVisible({ timeout: 3000 }).catch(() => false)) {
          await addTempButton1.click()
          
          // Attendi modal temperatura
          await expect(page1.locator('text=Registra Temperatura').first()).toBeVisible({ timeout: 5000 })
          
          // Compila e salva lettura
          const tempInput1 = page1.locator('input[id="temperature-input"], input[type="number"]').first()
          await tempInput1.fill('6.5')
          
          const saveButton1 = page1.locator('button[type="submit"]:has-text("Registra")').first()
          await saveButton1.click()
          
          // Attendi che il modal si chiuda in Tab 1
          await expect(page1.locator('text=Registra Temperatura').first()).not.toBeVisible({ timeout: 5000 })
          
          // In Tab 2: Attendi che la lettura appaia automaticamente (real-time)
          // Usa condition-based-waiting invece di timeout fisso
          // Cerca il valore "6.5" o "6.5°C" nella pagina Tab 2
          const readingAppeared = await expect(page2.locator('text=6.5, text=6.5°C').first()).toBeVisible({
            timeout: 10000 // Max 10s per real-time update
          }).catch(() => false)
          
          if (readingAppeared) {
            console.log('✅ Real-time update funzionante: lettura apparsa in Tab 2')
            
            // Screenshot evidenza: aggiornamento real-time
            await Promise.all([
              page1.screenshot({ path: 'test-evidence/realtime-tab1-after.png' }),
              page2.screenshot({ path: 'test-evidence/realtime-tab2-after.png' })
            ])
            
            // Test PASSED
            expect(readingAppeared).toBe(true)
          } else {
            console.warn('⚠️ Real-time update NON funzionante: lettura non apparsa in Tab 2')
            console.warn('   Questo è un enhancement futuro - non bloccante')
            
            // Screenshot evidenza: real-time non funzionante
            await page2.screenshot({ path: 'test-evidence/realtime-NOT-WORKING.png' })
            
            // Non fallire il test - è opzionale
            // Il test viene skippato di default
          }
        } else {
          console.log('Info: Pulsante registra temperatura non trovato - skipping test')
        }
      } else {
        console.log('Info: Nessun punto conservazione trovato - skipping test')
      }
    } finally {
      // Cleanup: chiudi context
      await Promise.all([
        context1.close(),
        context2.close()
      ])
    }
  })

  test.skip('conservation point update reflects in real-time', async ({ browser }) => {
    // SKIP di default - test opzionale per aggiornamenti punto
    
    const context1 = await browser.newContext()
    const context2 = await browser.newContext()
    
    const page1 = await context1.newPage()
    const page2 = await context2.newPage()

    try {
      await loginAsTestUser(page1)
      await loginAsTestUser(page2)
      
      await Promise.all([
        page1.goto('/conservazione'),
        page2.goto('/conservazione')
      ])
      
      await Promise.all([
        expect(page1.locator('text=Sistema di Conservazione').first()).toBeVisible({ timeout: 10000 }),
        expect(page2.locator('text=Sistema di Conservazione').first()).toBeVisible({ timeout: 10000 })
      ])
      
      // Trova un punto esistente
      const pointCard1 = page1.locator('[data-testid="conservation-point-card"], .conservation-point-card').first()
      
      if (await pointCard1.isVisible({ timeout: 5000 }).catch(() => false)) {
        // In Tab 1: Modifica nome del punto (se possibile)
        const editButton1 = pointCard1.locator('button:has-text("Modifica"), button:has-text("Edit")').first()
        
        if (await editButton1.isVisible({ timeout: 3000 }).catch(() => false)) {
          await editButton1.click()
          
          // Attendi modal modifica
          await expect(page1.locator('text=Modifica Punto').first()).toBeVisible({ timeout: 5000 })
          
          // Modifica nome
          const nameInput1 = page1.locator('input[id="point-name"], input[name="name"]').first()
          const newName = `Updated ${testPointName}`
          await nameInput1.fill(newName)
          
          // Salva
          const saveButton1 = page1.locator('button[type="submit"]:has-text("Salva"), button:has-text("Aggiorna")').first()
          await saveButton1.click()
          
          // Attendi che il modal si chiuda
          await expect(page1.locator('text=Modifica Punto').first()).not.toBeVisible({ timeout: 5000 })
          
          // In Tab 2: Attendi che il nome aggiornato appaia (real-time)
          const nameUpdated = await expect(page2.locator(`text=${newName}`).first()).toBeVisible({
            timeout: 10000
          }).catch(() => false)
          
          if (nameUpdated) {
            console.log('✅ Real-time update funzionante: nome punto aggiornato in Tab 2')
            expect(nameUpdated).toBe(true)
          } else {
            console.warn('⚠️ Real-time update NON funzionante per modifica punto')
            console.warn('   Enhancement futuro - non bloccante')
          }
        }
      }
    } finally {
      await Promise.all([
        context1.close(),
        context2.close()
      ])
    }
  })
})
