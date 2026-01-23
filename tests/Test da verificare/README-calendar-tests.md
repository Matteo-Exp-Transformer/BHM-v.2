# 🧪 Test Pagina Attività - CalendarPage e MacroCategoryModal

## 📋 Panoramica

Questo documento descrive i test implementati per la pagina attività (CalendarPage) e il modal MacroCategoryModal, basati sui requisiti identificati nel documento `IDENTIFICAZIONE_TEST_ATTIVITA_2025-01-17.md`.

## 🎯 Test Implementati

### 🔴 **ALTA PRIORITÀ** (5 test critici)

#### E - Allineamento Eventi Calendar ↔ Modal
- **E1**: Verificare che gli eventi nel modal corrispondano esattamente a quelli del calendario
- **E2**: Verificare che il click su un evento apra il modal con gli eventi corretti del giorno

#### F - Completamento Evento nel Modal
- **F1**: Verificare che il completamento di un evento nel modal funzioni correttamente
- **F2**: Verificare che lo stato dell'evento si aggiorni dopo il completamento

#### L - Logica onEventClick
- **L1**: Verificare che il click su evento generic_task apra il modal corretto
- **L2**: Verificare che il click su evento maintenance apra il modal corretto
- **L3**: Verificare che il click su evento product_expiry apra il modal corretto
- **L4**: Verificare che il click su evento sconosciuto gestisca l'errore

#### M - Sincronizzazione Eventi
- **M1**: Verificare che gli eventi passati dal Calendar al Modal siano identici
- **M2**: Verificare che la conversione `convertEventToItem` funzioni correttamente
- **M3**: Verificare che gli eventi RAW e processati siano coerenti

#### N - Filtri MacroCategoryModal
- **N1**: Verificare che il pulsante "Filtri" apra/chiuda la sezione filtri
- **N2**: Verificare che i filtri per Stato funzionino (pending, completed, overdue)
- **N3**: Verificare che i filtri per Tipo funzionino (generic_task, maintenance, product_expiry)
- **N4**: Verificare che i filtri per Reparto funzionino
- **N5**: Verificare che i filtri multipli funzionino insieme

### 🟡 **MEDIA PRIORITÀ** (5 test importanti)

#### A - Filtri Calendario e Modal
- **A1**: Verificare che i filtri del calendario funzionino correttamente
- **A2**: Verificare che i filtri del modal funzionino correttamente
- **A3**: Verificare che i filtri siano sincronizzati tra calendario e modal

#### B - Inserimento Evento
- **B1**: Verificare che l'inserimento di un nuovo evento funzioni correttamente
- **B2**: Verificare che l'evento appaia nel calendario dopo l'inserimento
- **B3**: Verificare che l'evento sia visibile nel modal del giorno

#### C - Statistiche Count
- **C1**: Verificare che le statistiche si aggiornino correttamente in base alla view del calendario
- **C2**: Verificare che i contatori siano accurati per ogni tipologia di evento

#### D - Breakdown Tipologie e Urgenti
- **D1**: Verificare che il breakdown delle tipologie sia corretto
- **D2**: Verificare che la categorizzazione degli eventi urgenti sia accurata

#### G - Visualizzazione Tipi Evento nel Modal
- **G1**: Verificare che i tipi di evento siano visualizzati correttamente nel modal
- **G2**: Verificare che la categorizzazione per tipo sia accurata

### 🟢 **BASSA PRIORITÀ** (6 test di supporto)

#### O - Performance e Rendering
- **O1**: Verificare che il modal si apra rapidamente (<500ms)
- **O2**: Verificare che il calendario si carichi rapidamente (<2s)
- **O3**: Verificare che non ci siano memory leaks durante l'uso

#### P - Error Handling
- **P1**: Verificare che errori di rete siano gestiti correttamente
- **P2**: Verificare che eventi malformati non causino crash
- **P3**: Verificare che filtri invalidi siano gestiti correttamente

#### Q - Accessibilità
- **Q1**: Verificare che il modal sia accessibile via tastiera
- **Q2**: Verificare che i filtri siano accessibili via tastiera
- **Q3**: Verificare che gli screen reader possano leggere il contenuto

#### R - Responsive Design
- **R1**: Verificare che il modal funzioni su dispositivi mobili
- **R2**: Verificare che i filtri siano usabili su schermi piccoli
- **R3**: Verificare che il calendario sia responsive

#### S - Integrazione
- **S1**: Verificare che le modifiche non abbiano rotto altre funzionalità
- **S2**: Verificare che l'integrazione con Supabase funzioni
- **S3**: Verificare che l'autenticazione funzioni correttamente

#### T - Edge Cases
- **T1**: Verificare comportamento con calendario vuoto
- **T2**: Verificare comportamento con molti eventi (100+)
- **T3**: Verificare comportamento con eventi sovrapposti
- **T4**: Verificare comportamento con date limite (inizio/fine anno)

## 📁 Struttura File

```
tests/
├── calendar-page-priority-tests.spec.ts    # Test alta priorità (E,F,L,M,N)
├── calendar-page-medium-priority-tests.spec.ts  # Test media priorità (A,B,C,D,G)
├── calendar-page-low-priority-tests.spec.ts      # Test bassa priorità (O,P,Q,R,S,T)
├── calendar-test-helpers.ts                # Helper e mock condivisi
└── playwright-calendar.config.ts          # Configurazione Playwright
```

## 🚀 Esecuzione Test

### Esecuzione Completa
```bash
# Esegui tutti i test del calendario
npx playwright test --config=playwright-calendar.config.ts

# Esegui solo i test ad alta priorità
npx playwright test tests/calendar-page-priority-tests.spec.ts

# Esegui solo i test di media priorità
npx playwright test tests/calendar-page-medium-priority-tests.spec.ts

# Esegui solo i test di bassa priorità
npx playwright test tests/calendar-page-low-priority-tests.spec.ts
```

### Esecuzione per Browser
```bash
# Test su Chrome
npx playwright test --config=playwright-calendar.config.ts --project=calendar-chromium

# Test su Firefox
npx playwright test --config=playwright-calendar.config.ts --project=calendar-firefox

# Test su Safari
npx playwright test --config=playwright-calendar.config.ts --project=calendar-webkit

# Test su dispositivi mobili
npx playwright test --config=playwright-calendar.config.ts --project=calendar-mobile-chrome
```

### Esecuzione con Debug
```bash
# Esegui con interfaccia grafica
npx playwright test --config=playwright-calendar.config.ts --ui

# Esegui in modalità headed
npx playwright test --config=playwright-calendar.config.ts --headed

# Esegui con trace per debug
npx playwright test --config=playwright-calendar.config.ts --trace=on
```

## 🔧 Configurazione

### Variabili d'Ambiente
```bash
# File .env.test
TEST_USER_EMAIL=test@bhm.local
TEST_USER_PASSWORD=testpassword
SUPABASE_SERVICE_KEY=your_service_key
BASE_URL=http://localhost:3000
```

### Mock Data
I test utilizzano mock data definiti in `calendar-test-helpers.ts`:
- **User**: Utente admin di test
- **Company**: Azienda di test
- **Departments**: Reparti (Cucina, Magazzino, Sala)
- **Staff**: Dipendenti per ogni reparto
- **Products**: Prodotti con date di scadenza
- **Events**: Eventi di manutenzione, mansioni e scadenze

## 📊 Metriche di Successo

### Coverage Target
- **85%+ statements** per componenti critici
- **90%+ branches** per logica di validazione
- **100% critical paths** per edge cases

### Performance Target
- **<500ms** tempo di apertura modal
- **<2s** tempo di caricamento calendario
- **0 errori JavaScript** durante l'uso

### Test Results
- **100% test passati** per test critici
- **0 test flaky** per test stabili
- **<5s** tempo medio per test

## 🐛 Debug e Troubleshooting

### Problemi Comuni

#### Test Falliscono per Timeout
```bash
# Aumenta il timeout
npx playwright test --config=playwright-calendar.config.ts --timeout=60000
```

#### Mock Non Funzionano
```bash
# Verifica che il server di sviluppo sia in esecuzione
npm run dev

# Verifica che le API siano mockate correttamente
npx playwright test --config=playwright-calendar.config.ts --debug
```

#### Test Flaky
```bash
# Esegui con retry
npx playwright test --config=playwright-calendar.config.ts --retries=3

# Esegui con trace per debug
npx playwright test --config=playwright-calendar.config.ts --trace=on
```

### Log e Report
```bash
# Genera report HTML
npx playwright show-report

# Visualizza trace
npx playwright show-trace test-results/trace.zip
```

## 📝 Note per Sviluppatori

### Aggiungere Nuovi Test
1. Identifica la priorità del test (Alta/Media/Bassa)
2. Aggiungi il test nel file appropriato
3. Utilizza i helper in `calendar-test-helpers.ts`
4. Segui il pattern di naming esistente

### Modificare Mock Data
1. Aggiorna `mockData` in `calendar-test-helpers.ts`
2. Verifica che i mock siano coerenti con i dati reali
3. Testa che i mock funzionino con tutti i test

### Configurazione Playwright
1. Modifica `playwright-calendar.config.ts` per nuove configurazioni
2. Aggiungi nuovi progetti per nuovi browser/dispositivi
3. Aggiorna i timeout se necessario

## 🎯 Prossimi Passi

1. **Esecuzione Test**: Eseguire tutti i test per verificare il funzionamento
2. **Fix Bug**: Correggere eventuali test falliti
3. **Ottimizzazione**: Migliorare performance e stabilità
4. **Integrazione CI**: Integrare i test nel pipeline CI/CD
5. **Monitoraggio**: Implementare monitoraggio continuo dei test

---

**Documento generato**: 2025-01-17  
**Status**: ✅ IMPLEMENTAZIONE COMPLETATA  
**Prossimo step**: Esecuzione test e validazione risultati
