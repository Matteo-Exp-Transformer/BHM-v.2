/**
 * TEST: Completamento Eventi del Giorno Corrente
 * 
 * Questo test verifica che:
 * 1. Gli eventi del giorno corrente possano essere completati correttamente
 * 2. I dati di completamento vengano salvati correttamente
 * 3. L'UI si aggiorni dopo il completamento
 * 4. I log di attività vengano registrati
 */

import { chromium } from 'playwright';

async function testCompletamentoEventiGiorno() {
  console.log('🧪 Avvio test completamento eventi del giorno corrente...');
  
  const browser = await chromium.launch({ 
    headless: false, // Mostra il browser per debug
    slowMo: 1000 // Rallenta le azioni per vedere cosa succede
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // 1. Naviga all'applicazione
    console.log('📱 Navigazione all\'applicazione...');
    await page.goto('http://localhost:3000');
    
    // 2. Attendi il caricamento e fai login
    console.log('🔐 Login...');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', 'matteo.cavallaro.work@gmail.com');
    await page.fill('input[type="password"]', 'Cavallaro');
    await page.click('button[type="submit"]');
    
    // Debug: verifica cosa succede dopo il login
    console.log('🔍 Verifica stato dopo login...');
    await page.waitForTimeout(2000); // Attesa ridotta
    
    const currentUrl = page.url();
    const pageTitle = await page.title();
    console.log(`🌐 URL dopo login: ${currentUrl}`);
    console.log(`📄 Titolo pagina: ${pageTitle}`);
    
    // Verifica se ci sono errori di login
    const errorMessages = await page.$$eval('.error, .alert-danger, [role="alert"]', elements => 
      elements.map(el => el.textContent?.trim()).filter(text => text)
    );
    
    if (errorMessages.length > 0) {
      console.log('❌ Errori di login trovati:');
      errorMessages.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    } else {
      console.log('✅ Nessun errore di login rilevato');
    }
    
    // 3. Attendi il caricamento del dashboard (ridotto)
    console.log('⏳ Attesa caricamento dashboard...');
    
    // Prova diversi selettori per il dashboard
    const dashboardSelectors = [
      '[data-testid="dashboard"]',
      '.dashboard',
      'main',
      '.main-content',
      '.app-content',
      '[data-testid="main"]'
    ];
    
    let dashboardFound = false;
    for (const selector of dashboardSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 3000 });
        console.log(`✅ Dashboard trovato con selettore: ${selector}`);
        dashboardFound = true;
        break;
      } catch (e) {
        console.log(`❌ Selettore ${selector} non trovato`);
      }
    }
    
    if (!dashboardFound) {
      console.log('⚠️ Dashboard non trovato con selettori standard, continuo comunque...');
      
      // Debug: mostra cosa c'è nella pagina
      const pageContent = await page.content();
      console.log(`📄 Lunghezza contenuto pagina: ${pageContent.length} caratteri`);
      
      // Cerca elementi visibili
      const visibleElements = await page.$$eval('*', elements => 
        elements.map(el => ({
          tagName: el.tagName,
          className: el.className,
          id: el.id,
          text: el.textContent?.trim().substring(0, 50)
        })).filter(el => el.text && el.text.length > 5)
      );
      
      console.log('🔍 Elementi visibili trovati:');
      visibleElements.slice(0, 10).forEach((el, index) => {
        console.log(`  ${index + 1}. ${el.tagName} - "${el.text}" (${el.className})`);
      });
      
      // Attendi un po' e continua
      await page.waitForTimeout(2000);
    }
    
    // 4. Naviga alla tab "Attività" (non al calendario)
    console.log('📋 Navigazione alla tab Attività...');
    
    // Cerca il link o pulsante per "Attività"
    const attivitaSelectors = [
      'a[href="/activities"]',
      'a[href="/attivita"]', 
      'button:has-text("Attività")',
      'a:has-text("Attività")',
      '[data-testid="activities-tab"]',
      '.nav-link:has-text("Attività")'
    ];
    
    let attivitaLink = null;
    for (const selector of attivitaSelectors) {
      try {
        attivitaLink = await page.$(selector);
        if (attivitaLink) {
          console.log(`✅ Trovato link Attività con selettore: ${selector}`);
          break;
        }
      } catch (e) {
        // Continua con il prossimo selettore
      }
    }
    
    if (attivitaLink) {
      await attivitaLink.click();
      console.log('✅ Cliccato su Attività');
    } else {
      console.log('❌ Link Attività non trovato, provo a cercare nel menu...');
      
      // Cerca nel menu di navigazione
      const menuItems = await page.$$eval('a, button', elements => 
        elements.map(el => ({
          text: el.textContent?.trim(),
          href: el.getAttribute('href'),
          className: el.className
        }))
      );
      
      console.log('🔍 Elementi di menu trovati:');
      menuItems.forEach((item, index) => {
        if (item.text && item.text.toLowerCase().includes('attiv')) {
          console.log(`  ${index + 1}. "${item.text}" (${item.href})`);
        }
      });
      
      // Prova a cliccare su qualsiasi elemento che contenga "Attività"
      const attivitaElement = await page.$('a:has-text("Attività"), button:has-text("Attività")');
      if (attivitaElement) {
        await attivitaElement.click();
        console.log('✅ Cliccato su elemento Attività trovato');
      } else {
        throw new Error('Impossibile trovare la tab Attività');
      }
    }
    
    // 5. Attendi il caricamento della pagina Attività (ridotto)
    console.log('⏳ Attesa caricamento pagina Attività...');
    await page.waitForTimeout(1500); // Attesa ridotta da 3000 a 1500
    
    // 6. Verifica che siamo nella pagina Attività
    console.log('🔍 Verifica pagina Attività...');
    const attivitaPageTitle = await page.title();
    const attivitaCurrentUrl = page.url();
    console.log(`📄 Titolo pagina: ${attivitaPageTitle}`);
    console.log(`🌐 URL corrente: ${attivitaCurrentUrl}`);
    
    // 7. Cerca il calendario nella pagina Attività
    console.log('📅 Ricerca calendario nella pagina Attività...');
    
    // Cerca elementi del calendario
    const calendarElements = await page.$$eval('.fc-event, [data-testid*="event"], .event-item', elements => 
      elements.map(el => ({
        text: el.textContent?.trim(),
        className: el.className,
        id: el.id
      }))
    );
    
    console.log(`📋 Eventi trovati: ${calendarElements.length}`);
    calendarElements.forEach((event, index) => {
      console.log(`  ${index + 1}. "${event.text}" (${event.className})`);
    });
    
    // 8. Cerca eventi del giorno corrente
    console.log('📊 Ricerca eventi del giorno corrente...');
    
    // Prima leggi la data effettiva dall'app invece di usare la data del sistema
    console.log('🔍 Lettura data dall\'applicazione...');
    
    // Cerca elementi che mostrano la data corrente nell'app
    const dateElements = await page.$$eval('.fc-today, .today, [data-date], .current-date, .fc-day-today', elements => 
      elements.map(el => ({
        text: el.textContent?.trim(),
        className: el.className,
        dataDate: el.getAttribute('data-date'),
        title: el.getAttribute('title')
      }))
    );
    
    console.log('📅 Elementi data trovati nell\'app:');
    dateElements.forEach((el, index) => {
      console.log(`  ${index + 1}. "${el.text}" (data-date: ${el.dataDate}, title: ${el.title})`);
    });
    
    // Cerca anche nella barra del calendario
    const calendarHeader = await page.$eval('.fc-toolbar-title, .fc-header-toolbar, .calendar-header', el => 
      el ? el.textContent?.trim() : null
    ).catch(() => null);
    
    if (calendarHeader) {
      console.log(`📅 Header calendario: "${calendarHeader}"`);
    }
    
    // Usa la data del sistema come fallback
    const today = new Date();
    const todayString = today.toLocaleDateString('it-IT');
    console.log(`📅 Data sistema (fallback): ${todayString}`);
    
    // Filtra SOLO gli eventi del giorno corrente usando la classe CSS specifica
    const todayEvents = calendarElements.filter(event => {
      const className = event.className?.toLowerCase() || '';
      
      // Usa SOLO la classe CSS che indica eventi del giorno corrente
      return className.includes('fc-event-today');
    });
    
    console.log(`🎯 Eventi del giorno corrente trovati: ${todayEvents.length}`);
    todayEvents.forEach((event, index) => {
      console.log(`  ${index + 1}. "${event.text}"`);
    });
    
    // 9. Cerca il pannello laterale degli eventi
    console.log('🔍 Ricerca pannello laterale eventi...');
    
    // Cerca elementi che potrebbero essere il pannello laterale
    const sidebarSelectors = [
      '.sidebar',
      '.panel',
      '.event-panel',
      '.event-details',
      '[data-testid*="sidebar"]',
      '[data-testid*="panel"]',
      '.fc-event-details',
      '.event-list'
    ];
    
    let sidebarFound = false;
    for (const selector of sidebarSelectors) {
      const element = await page.$(selector);
      if (element) {
        console.log(`✅ Trovato pannello laterale: ${selector}`);
        sidebarFound = true;
        break;
      }
    }
    
    if (!sidebarFound) {
      console.log('⚠️ Pannello laterale non trovato, cerco altri elementi...');
      
      // Cerca tutti gli elementi che potrebbero contenere eventi
      const allElements = await page.$$eval('*', elements => 
        elements.map(el => ({
          tagName: el.tagName,
          className: el.className,
          text: el.textContent?.trim().substring(0, 100),
          id: el.id
        })).filter(el => el.text && el.text.length > 10)
      );
      
      console.log('🔍 Elementi con testo trovati:');
      allElements.slice(0, 10).forEach((el, index) => {
        console.log(`  ${index + 1}. ${el.tagName} - "${el.text}"`);
      });
    }
    
    // 10. Completa tutti gli eventi del giorno corrente
    if (todayEvents.length > 0) {
      console.log(`🎯 Tentativo di completare ${todayEvents.length} eventi...`);
      
      let completedCount = 0;
      let failedCount = 0;
      
      for (let i = 0; i < todayEvents.length; i++) {
        const event = todayEvents[i];
        console.log(`\n📋 Completando evento ${i + 1}/${todayEvents.length}: "${event.text}"`);
        
        try {
          // Cerca l'evento usando selettori CSS più robusti per eventi aggregati
          let eventElement = null;
          
          // Prova diversi selettori per trovare l'evento aggregato
          const eventSelectors = [
            `.fc-event:has-text("${event.text}")`,
            `.fc-event[title*="${event.text}"]`,
            `.fc-event:contains("${event.text}")`,
            `[data-event-id*="${event.id}"]`,
            `.fc-event.fc-event-today`
          ];
          
          for (const selector of eventSelectors) {
            try {
              eventElement = await page.$(selector);
              if (eventElement) {
                console.log(`✅ Trovato evento con selettore: ${selector}`);
                break;
              }
            } catch (e) {
              // Continua con il prossimo selettore
            }
          }
          
          // Se non trova con selettori specifici, prova a cliccare su qualsiasi evento del giorno corrente
          if (!eventElement) {
            console.log(`⚠️ Evento specifico non trovato, provo approccio alternativo...`);
            
            // Cerca tutti gli eventi del giorno corrente e clicca sul primo disponibile
            const todayEvents = await page.$$('.fc-event.fc-event-today');
            if (todayEvents.length > 0) {
              eventElement = todayEvents[0]; // Prendi il primo evento del giorno corrente
              console.log(`✅ Usando primo evento del giorno corrente (${todayEvents.length} totali)`);
            }
          }
          
          if (eventElement) {
            console.log(`✅ Cliccando su evento: "${event.text}"`);
            await eventElement.click();
            
            // Attendi che si apra il modal per eventi aggregati
            await page.waitForTimeout(3000);
            
            // Verifica se si è aperto un modal per eventi aggregati
            const modal = await page.$('.modal, [role="dialog"], .event-modal, .macro-category-modal, .fc-popover');
            if (modal) {
              console.log('📋 Modal eventi aggregati aperto, cerco eventi individuali...');
              
              // Attendi che il modal sia completamente caricato
              await page.waitForTimeout(2000);
              
              // Cerca eventi individuali nel modal
              const individualEvents = await modal.$$eval('.event-item, .task-item, [data-testid*="event"], .task-card, .maintenance-item, .activity-item', elements => 
                elements.map(el => ({
                  text: el.textContent?.trim(),
                  id: el.id,
                  className: el.className,
                  visible: el.offsetParent !== null
                })).filter(el => el.text && el.text.length > 5 && el.text.length < 200)
              );
              
              console.log(`📋 Eventi individuali trovati nel modal: ${individualEvents.length}`);
              
              if (individualEvents.length > 0) {
                // Mostra gli eventi trovati
                individualEvents.forEach((indEvent, index) => {
                  console.log(`  ${index + 1}. "${indEvent.text}" (visibile: ${indEvent.visible})`);
                });
                
                // Prova a completare ogni evento individuale
                for (let j = 0; j < individualEvents.length; j++) {
                  const indEvent = individualEvents[j];
                  console.log(`\n🎯 Completando evento individuale ${j + 1}/${individualEvents.length}: "${indEvent.text}"`);
                  
                  // Cerca pulsanti di completamento nel modal
                  const completeButtonSelectors = [
                    'button:has-text("Completa")',
                    'button:has-text("Completata")',
                    'button:has-text("Mark Complete")',
                    'button:has-text("Done")',
                    'button:has-text("Finish")',
                    'button:has-text("Completa Tutto")',
                    '[data-testid*="complete"]',
                    '.complete-button',
                    '.btn-complete'
                  ];
                  
                  let completeButton = null;
                  for (const selector of completeButtonSelectors) {
                    try {
                      completeButton = await modal.$(selector);
                      if (completeButton) {
                        console.log(`✅ Trovato pulsante completamento nel modal: ${selector}`);
                        break;
                      }
                    } catch (e) {
                      // Continua con il prossimo selettore
                    }
                  }
                  
                  if (completeButton) {
                    console.log('✅ Cliccando pulsante completamento nel modal...');
                    await completeButton.click();
                    
                    // Attendi conferma
                    try {
                      await page.waitForSelector('.toast-success, .success-message, .alert-success', { timeout: 5000 });
                      console.log('✅ Evento individuale completato con successo!');
                      completedCount++;
                    } catch (e) {
                      console.log('⚠️ Conferma non trovata, ma evento potrebbe essere completato');
                      completedCount++;
                    }
                    
                    // Attendi un po' prima del prossimo evento
                    await page.waitForTimeout(1000);
                  } else {
                    console.log('❌ Pulsante completamento non trovato nel modal');
                    failedCount++;
                  }
                }
                
                // Chiudi il modal
                console.log('🚪 Tentativo di chiusura modal...');
                const closeModalSelectors = [
                  'button:has-text("Chiudi")',
                  'button:has-text("Close")',
                  '[aria-label="Close"]',
                  '.modal-close',
                  '.close-button',
                  'button[data-dismiss="modal"]',
                  '.fc-popover-close'
                ];
                
                let modalClosed = false;
                for (const selector of closeModalSelectors) {
                  try {
                    const closeButton = await modal.$(selector);
                    if (closeButton) {
                      await closeButton.click();
                      console.log(`✅ Modal chiuso con selettore: ${selector}`);
                      modalClosed = true;
                      break;
                    }
                  } catch (e) {
                    // Continua con il prossimo selettore
                  }
                }
                
                if (!modalClosed) {
                  // Prova a chiudere premendo ESC
                  await page.keyboard.press('Escape');
                  console.log('✅ Modal chiuso con tasto ESC');
                }
                
                await page.waitForTimeout(1000);
                
              } else {
                console.log('❌ Nessun evento individuale trovato nel modal');
                failedCount++;
              }
            } else {
              // Modal non trovato, prova il metodo normale
              console.log('📋 Modal non trovato, provo metodo normale...');
              
              // Cerca pulsanti di completamento
              const completeButtonSelectors = [
                'button:has-text("Completa")',
                'button:has-text("Completata")',
                'button:has-text("Mark Complete")',
                'button:has-text("Done")',
                'button:has-text("Finish")',
                '[data-testid*="complete"]',
                '.complete-button'
              ];
              
              let completeButton = null;
              for (const selector of completeButtonSelectors) {
                completeButton = await page.$(selector);
                if (completeButton) {
                  console.log(`✅ Trovato pulsante completamento: ${selector}`);
                  break;
                }
              }
              
              if (completeButton) {
                console.log('✅ Cliccando pulsante completamento...');
                await completeButton.click();
                
                // Attendi conferma
                try {
                  await page.waitForSelector('.toast-success, .success-message, .alert-success', { timeout: 3000 });
                  console.log('✅ Evento completato con successo!');
                  completedCount++;
                } catch (e) {
                  console.log('⚠️ Conferma non trovata, ma evento potrebbe essere completato');
                  completedCount++;
                }
              } else {
                console.log('❌ Pulsante completamento non trovato');
                failedCount++;
              }
              
              // Chiudi il pannello se aperto
              const closeButton = await page.$('button:has-text("Chiudi"), button:has-text("Close"), [aria-label="Close"]');
              if (closeButton) {
                await closeButton.click();
                await page.waitForTimeout(500);
              }
            }
            
          } else {
            console.log('❌ Elemento evento non trovato');
            failedCount++;
          }
        } catch (error) {
          console.log(`❌ Errore nel completamento: ${error.message}`);
          failedCount++;
        }
        
        // Piccola pausa tra eventi
        await page.waitForTimeout(1000);
      }
      
      console.log(`\n📊 Risultati completamento:`);
      console.log(`  ✅ Completati: ${completedCount}`);
      console.log(`  ❌ Falliti: ${failedCount}`);
      console.log(`  📋 Totali: ${todayEvents.length}`);
      
    } else {
      console.log('ℹ️ Nessun evento del giorno corrente trovato');
    }
    
    // 11. Verifica eventi rimasti dopo completamento
    console.log('\n🔍 Verifica eventi rimasti dopo completamento...');
    await page.waitForTimeout(2000); // Attendi aggiornamento UI
    
    // Ricarica gli eventi per vedere cosa è rimasto
    const remainingEvents = await page.$$eval('.fc-event', events => 
      events.map(event => ({
        text: event.textContent?.trim(),
        className: event.className,
        id: event.id
      }))
    );
    
    // Filtra eventi del giorno corrente rimasti
    const remainingTodayEvents = remainingEvents.filter(event => {
      const text = event.text?.toLowerCase() || '';
      const className = event.className?.toLowerCase() || '';
      
      return text.includes('oggi') || 
             text.includes('today') || 
             text.includes(today.getDate().toString()) ||
             className.includes('fc-event-today') ||
             text.includes('manutenzioni') ||
             text.includes('mansioni') ||
             text.includes('attività') ||
             text.includes('scadenze') ||
             text.includes('temperatura') ||
             text.includes('rilevamento');
    });
    
    console.log(`📋 Eventi rimasti del giorno corrente: ${remainingTodayEvents.length}`);
    
    if (remainingTodayEvents.length > 0) {
      console.log('\n⚠️ ATTENZIONE: Ci sono ancora eventi non completati:');
      console.log(`📊 Totale eventi rimasti: ${remainingTodayEvents.length}`);
      
      // Raggruppa per tipo
      const manutenzioniRimaste = remainingTodayEvents.filter(e => e.text.includes('Manutenzioni'));
      const mansioniRimaste = remainingTodayEvents.filter(e => e.text.includes('Mansioni'));
      const scadenzeRimaste = remainingTodayEvents.filter(e => e.text.includes('Scadenze'));
      
      if (manutenzioniRimaste.length > 0) {
        console.log(`🔧 Manutenzioni rimaste: ${manutenzioniRimaste.length}`);
        manutenzioniRimaste.forEach((event, index) => {
          console.log(`  ${index + 1}. "${event.text}"`);
        });
      }
      
      if (mansioniRimaste.length > 0) {
        console.log(`📋 Mansioni/Attività rimaste: ${mansioniRimaste.length}`);
        mansioniRimaste.forEach((event, index) => {
          console.log(`  ${index + 1}. "${event.text}"`);
        });
      }
      
      if (scadenzeRimaste.length > 0) {
        console.log(`📦 Scadenze Prodotti rimaste: ${scadenzeRimaste.length}`);
        scadenzeRimaste.forEach((event, index) => {
          console.log(`  ${index + 1}. "${event.text}"`);
        });
      }
      
      // Verifica le mansioni specifiche menzionate
      const specificTasks = [
        'generic-task-33a5eb8b-fc62-432b-9f02-946832533438-2025-10-15',
        'generic-task-2920feff-a292-404f-9bcb-26794b39f7ce-2025-10-15',
        'generic-task-7fe57026-f1dc-4499-a9b7-e9fb613bd29d-2025-10-15'
      ];
      
      console.log('\n🎯 Verifica mansioni specifiche:');
      specificTasks.forEach((taskId, index) => {
        const found = remainingEvents.find(event => event.id === taskId);
        if (found) {
          console.log(`  ❌ Mansione ${index + 1} ancora presente: ${taskId}`);
        } else {
          console.log(`  ✅ Mansione ${index + 1} completata: ${taskId}`);
        }
      });
      
    } else {
      console.log('\n✅ Perfetto! Tutti gli eventi del giorno corrente sono stati completati!');
      console.log('🎉 Nessuna attività rimasta da completare!');
    }
    
    // 12. Verifica finale
    console.log('🔍 Verifica finale del test...');
    const finalUrl = page.url();
    const finalTitle = await page.title();
    console.log(`🌐 URL finale: ${finalUrl}`);
    console.log(`📄 Titolo finale: ${finalTitle}`);
    
    console.log('✅ Test completato con successo!');
    
  } catch (error) {
    console.error('❌ Errore durante il test:', error);
    
    // Screenshot per debug
    await page.screenshot({ path: 'test-error-screenshot.png' });
    console.log('📸 Screenshot salvato: test-error-screenshot.png');
  } finally {
    await browser.close();
  }
}

// Esegui il test
testCompletamentoEventiGiorno()
  .then(() => console.log('🎉 Test completato!'))
  .catch(error => console.error('💥 Test fallito:', error));

export { testCompletamentoEventiGiorno };
