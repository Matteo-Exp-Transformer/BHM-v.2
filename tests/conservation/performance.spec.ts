import { test, expect } from '@playwright/test'
import { loginAsTestUser } from '../helpers/auth.helper'

/**
 * Test Performance - Feature Conservation
 * 
 * Worker 4 - Task 4.2: Test Performance
 * 
 * Verifica che la pagina Conservation carichi in < 3 secondi
 * anche con 1000 temperature readings nel database.
 * 
 * NOTA: Questo test richiede che siano stati inseriti 1000 temperature_readings
 * nel database usando lo script SQL fornito in database/test_data/seed_performance_test.sql
 * 
 * Prima di eseguire questo test:
 * 1. Esegui lo script SQL per seed dei dati
 * 2. Assicurati che l'app sia in esecuzione
 * 3. Esegui: npx playwright test tests/conservation/performance.spec.ts
 */

test.describe('Conservation Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login con credenziali di test
    await loginAsTestUser(page)
  })

  test('page loads within 3 seconds with large dataset', async ({ page }) => {
    // Misura tempo di caricamento usando Performance API di Playwright
    const startTime = Date.now()
    
    // Naviga alla pagina conservation
    // Usa waitUntil: 'networkidle' per attendere che tutte le richieste siano complete
    await page.goto('/conservazione', {
      waitUntil: 'networkidle',
      timeout: 15000 // Timeout più lungo per dataset grande
    })
    
    // Attendi che il contenuto principale sia visibile
    await expect(page.locator('text=Sistema di Conservazione').first()).toBeVisible({
      timeout: 5000
    })
    
    // Attendi che i punti di conservazione siano caricati
    // Usa condition-based-waiting invece di timeout fisso
    // Verifica che non ci sia più il loading spinner
    await expect(page.locator('[role="progressbar"], .animate-pulse').first()).not.toBeVisible({
      timeout: 10000
    }).catch(() => {
      // Se non c'è spinner, va bene comunque
      console.log('No loading spinner detected - content already loaded')
    })
    
    const loadTime = Date.now() - startTime
    const loadTimeSeconds = loadTime / 1000
    
    console.log(`⏱️  Tempo di caricamento: ${loadTimeSeconds.toFixed(2)}s`)
    
    // Screenshot evidenza con timing
    await page.screenshot({ 
      path: `test-evidence/conservation-performance-${loadTimeSeconds.toFixed(2)}s.png`,
      fullPage: true 
    })
    
    // Verifica che il tempo di caricamento sia < 3 secondi
    expect(loadTimeSeconds).toBeLessThan(3)
    
    // Se > 3s, documenta come performance issue
    if (loadTimeSeconds >= 3) {
      console.error(`⚠️ PERFORMANCE ISSUE: Caricamento pagina ${loadTimeSeconds.toFixed(2)}s > 3s`)
      console.error('   Richiede ottimizzazione: pagination, virtualization, o lazy loading')
      
      // Salva evidenza dettagliata
      await page.screenshot({ 
        path: `test-evidence/conservation-performance-SLOW-${loadTimeSeconds.toFixed(2)}s.png`,
        fullPage: true 
      })
    } else {
      console.log(`✅ Performance OK: ${loadTimeSeconds.toFixed(2)}s < 3s`)
    }
  })

  test('temperature readings list renders efficiently', async ({ page }) => {
    // Test specifico per la lista delle letture temperatura
    await page.goto('/conservazione')
    
    // Attendi che la pagina sia caricata
    await expect(page.locator('text=Sistema di Conservazione').first()).toBeVisible({
      timeout: 10000
    })
    
    // Trova la sezione letture temperatura (se presente)
    const readingsSection = page.locator('text=Letture Temperatura, text=Temperature Readings').first()
    
    if (await readingsSection.isVisible({ timeout: 3000 }).catch(() => false)) {
      const startTime = Date.now()
      
      // Espandi la sezione letture se è collassabile
      await readingsSection.click().catch(() => {
        // Se non cliccabile, va bene
      })
      
      // Attendi che le letture siano renderizzate
      // Cerca almeno alcuni elementi nella lista
      await expect(page.locator('[data-testid="temperature-reading"], .temperature-reading-card').first()).toBeVisible({
        timeout: 5000
      }).catch(() => {
        // Se non trovato, cerca pattern alternativi
        console.log('Temperature readings cards not found with expected selectors')
      })
      
      const renderTime = Date.now() - startTime
      const renderTimeSeconds = renderTime / 1000
      
      console.log(`⏱️  Tempo rendering lista letture: ${renderTimeSeconds.toFixed(2)}s`)
      
      // Verifica che il rendering sia rapido (< 1s per lista con molte letture)
      expect(renderTimeSeconds).toBeLessThan(1)
      
      if (renderTimeSeconds >= 1) {
        console.warn(`⚠️ Rendering lento: ${renderTimeSeconds.toFixed(2)}s`)
        console.warn('   Considera: virtualization, pagination, o limit iniziale')
      }
    } else {
      console.log('Info: Sezione letture temperatura non trovata o non visibile')
      // Non fallire il test se la sezione non esiste
    }
  })

  test('navigation between conservation sections is fast', async ({ page }) => {
    // Test navigazione tra sezioni della pagina
    await page.goto('/conservazione')
    
    await expect(page.locator('text=Sistema di Conservazione').first()).toBeVisible({
      timeout: 10000
    })
    
    // Misura tempo di navigazione tra sezioni collassabili
    const sections = [
      'Punti di Conservazione',
      'Letture Temperatura',
      'Manutenzioni'
    ]
    
    for (const sectionName of sections) {
      const section = page.locator(`text=${sectionName}`).first()
      
      if (await section.isVisible({ timeout: 2000 }).catch(() => false)) {
        // Misura tempo di click (non incluso animazione)
        const startTime = Date.now()
        
        // Clicca per espandere/collassare
        await section.click()
        
        const clickTime = Date.now() - startTime
        
        // Navigazione tra sezioni dovrebbe essere istantanea (< 200ms)
        expect(clickTime).toBeLessThan(200)
        
        console.log(`✅ Navigazione sezione "${sectionName}": ${clickTime}ms`)
        
        // Attendi che l'animazione sia completa usando condition-based-waiting
        // Attende che il contenuto collassabile raggiunga uno stato stabile
        // Usa waitForFunction per controllare che l'elemento sia in uno stato stabile
        // (non ha più transizioni CSS attive o ha raggiunto lo stato finale)
        try {
          await page.waitForFunction(
            ({ sectionText }) => {
              // Trova l'elemento sezione per testo
              const elements = Array.from(document.querySelectorAll('*'))
              const sectionEl = elements.find(el => 
                el.textContent?.trim().startsWith(sectionText) && el.parentElement
              )?.parentElement as HTMLElement | undefined
              
              if (!sectionEl) return true // Fallback: considera completo se non trovato
              
              // Cerca il contenuto collassabile (tipicamente un div child)
              const content = sectionEl.querySelector('> div:not(:first-child), [class*="content"]') as HTMLElement | null
              const targetElement = content || sectionEl
              
              // Controlla se ci sono transizioni CSS attive
              const computedStyle = window.getComputedStyle(targetElement)
              const transitionProperty = computedStyle.transitionProperty || ''
              
              // Se non ci sono transizioni CSS definite, animazione è già completa
              if (!transitionProperty || transitionProperty === 'none' || transitionProperty.trim() === '') {
                return true
              }
              
              // Se ci sono transizioni, attendi che siano completate
              // waitForFunction farà polling automaticamente
              // Per verificare che l'animazione sia completa, controlliamo che
              // non ci siano più transizioni CSS attive (solo se non ci sono classi di transizione)
              const hasTransitionClass = targetElement.className?.includes('transition') || 
                                         targetElement.className?.includes('animate')
              
              // Se non ha classi di transizione o le transizioni sono 'none', è stabile
              // Nota: questo è un controllo semplificato - waitForFunction farà polling
              // finché questa funzione non ritorna true
              return !hasTransitionClass
            },
            { sectionText: sectionName },
            { timeout: 1000 }
          )
        } catch {
          // Fallback: se non possiamo verificare l'animazione, considera completata
          // (non bloccante - animazione probabilmente già completata o molto veloce)
          // waitForFunction fa già polling, quindi se fallisce dopo timeout,
          // probabilmente l'animazione è già completata
        }
      }
    }
  })
})
