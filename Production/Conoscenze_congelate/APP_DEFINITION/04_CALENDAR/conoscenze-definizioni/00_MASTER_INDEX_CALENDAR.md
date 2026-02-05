# MASTER INDEX - Calendar/Attività Feature
## Aggiornato: 2026-02-04

---

## LAVORO SVOLTO (04-02-2026)

### Sessione 1 – MacroCategoryModal, refresh, completamento
Report: **[REPORT_SESSIONE_CALENDARIO_MACRO_MODAL.md](../Lavoro/04-02-2026/REPORT_SESSIONE_CALENDARIO_MACRO_MODAL.md)**.

| Intervento | Descrizione |
|------------|-------------|
| **Statistiche** | Rimossa sezione "Eventi da Completare" (Oggi/Settimana/Mese/Anno) da CalendarStatsPanel. |
| **Refresh modal** | MacroCategoryModal si aggiorna dopo completamento senza chiudere: callback `onMacroDataUpdated`, `refreshKey` in useAggregatedEvents, sync eventi con firma id+status. |
| **Completamento mansioni** | Corretto "Task not found": helper `getGenericTaskId` per usare id reale del task (non occurrence id). |
| **Activity logging** | Gestione 404 su RPC `log_user_activity`: fallback non bloccante, nessun errore in console. |
| **Classificazione eventi** | Controlli temperatura (`temperature_reading`) → Manutenzioni (non più Mansioni generiche). |
| **Ancora da Completare** | Pulsante in card espansa mansione completata; visibile solo a chi ha completato o admin; uncomplete con `completionId`/`periodDate` e filtro periodo per overlap (daily/weekly/monthly). |

### Sessione 2 – UI Calendario e pannello Statistiche
Report: **[REPORT_CALENDARIO_UI_E_STATISTICHE.md](../Lavoro/04-02-2026/REPORT_CALENDARIO_UI_E_STATISTICHE.md)**.

| Intervento | Descrizione |
|------------|-------------|
| **Header Calendar** | Rimossa barra "Calendario Aziendale" e pulsante "Nuovo Evento" da `Calendar.tsx`. |
| **Layout e card** | Spaziatura `gap-6` tra sezioni; CollapsibleCard Statistiche con stato controllato; `stopPropagation` su pulsante Aggiorna. |
| **CollapsibleCard** | Nuova prop `hideHeader`; ripristinata card "Assegna nuova attività" con header. |
| **Statistiche temporali** | `eventsForTemporalStats` (anno corrente) per Oggi/Settimana/Mese/Anno; corretto calcolo "Questo Mese" vs "Quest'Anno". |
| **Sottotitolo vista** | Card Statistiche: sottotitolo "Statistiche annuali/mensili/settimanali/giornaliere" da `calendarView`. |
| **Testi ed etichette** | Titolo card "Statistiche" (no emoji); sezione "Eventi da Completare"; box "Attività / Mansioni", "Completate", "In Attesa" (emoji rimosse). |
| **Casella In Attesa** | Conteggio basato su `viewBasedEvents` così cambia con la vista calendario (Anno/Mese/Settimana/Giorno). |

---

## STATO ATTUALE

### VERDETTO: **PRODUCTION-READY**

| Metrica | Valore |
|---------|--------|
| Funzionalità Implementate | **100%** |
| Hooks Estratti | **7** |
| Fonti Evento Aggregate | **6** |
| Views Supportate | **4** (anno/mese/settimana/giorno) |
| Layer Filtri | **2** (permessi + visuale) |
| Auto-Refresh | **3 minuti** |

---

## ARCHITETTURA SISTEMA

### Componente Principale
**CalendarPage.tsx** (1095 righe) - Entry point che orchestra:
- Aggregazione eventi da 6 fonti
- Sistema filtri 2-layer
- Vista macro-categorie
- Statistiche e alert
- Navigazione da Conservation

### Hooks Principali

| Hook | Scopo | File |
|------|-------|------|
| `useAggregatedEvents` | Aggrega 6 fonti evento | 690 righe |
| `useFilteredEvents` | Filtra per permessi (Layer 1) | 209 righe |
| `useMacroCategoryEvents` | Aggrega per data+categoria | 627 righe |
| `useCalendarStats` | Calcola statistiche | 99 righe |
| `useCalendarAlerts` | Genera alert urgenze | 177 righe |
| `useCalendarRefresh` | Auto-refresh 3 min | 90 righe |
| `useGenericTasks` | CRUD mansioni | 300+ righe |

### Componenti UI

| Componente | Scopo |
|------------|-------|
| `Calendar.tsx` | Wrapper FullCalendar (996 righe) |
| `MacroCategoryModal.tsx` | Lista eventi per data+categoria |
| `GenericTaskForm.tsx` | Form creazione mansioni |
| `NewCalendarFilters.tsx` | Filtri Reparto/Stato/Tipo |
| `CalendarStatsPanel.tsx` | Pannello statistiche |
| `AlertModal.tsx` | Mostra alert urgenti |

---

## 6 FONTI EVENTO AGGREGATE

```
useAggregatedEvents() aggrega:

1. 🔧 MAINTENANCE TASKS
   - Manutenzioni punti conservazione
   - Controlli temperatura, sanificazione, sbrinamento
   - Espanso per ricorrenza

2. 📋 GENERIC TASKS (Mansioni)
   - Attività ricorrenti assegnate
   - Template che generano eventi
   - Verifica completamenti per periodo

3. 📦 PRODUCT EXPIRY
   - Scadenze prodotti attivi
   - Filtra expiry_date > 7 giorni fa

4. 👤 HACCP EXPIRY
   - Scadenze certificazioni dipendenti
   - Una occorrenza per dipendente

5. 🌡️ TEMPERATURE CHECKS
   - Auto-generati da conservation points
   - Controlli giornalieri

6. 📜 HACCP DEADLINES
   - Training HACCP
   - Scadenze formazione
```

---

## SISTEMA FILTRI 2-LAYER

### Layer 1 - Permessi (useFilteredEvents)
Filtra per **ruolo/assegnazione** dell'utente:
- **Admin/Responsabile** → vedono TUTTI gli eventi
- **Dipendente** → solo eventi assegnati a loro (staff_id, role, category, department)

### Layer 2 - Visuale (NewCalendarFilters)
Filtra per **preferenza visiva**:
- **Reparto**: OR tra reparti selezionati
- **Stato**: to_complete | completed | overdue | future
- **Tipo**: generic_task | maintenance | product_expiry

---

## SISTEMA MACROCATEGORY

Una **MacroCategory** aggrega eventi per:
- **Data** (YYYY-MM-DD)
- **Categoria** (maintenance | generic_tasks | product_expiry)

Sul calendario viene mostrata come **1 badge** con conteggio (es: "🔧 Manutenzioni (3)").

Al click apre **MacroCategoryModal** con lista dettagliata.

---

## INTEGRAZIONE CONSERVATION

### Navigazione da Conservation → Calendar
Il pulsante "Visualizza nel Calendario" in ScheduledMaintenanceCard naviga a:
```
/attivita?state={
  openMacroCategory: 'maintenance',
  date: '2026-01-30',
  highlightMaintenanceTaskId: 'uuid-task'
}
```

CalendarPage:
1. Riceve state dalla navigazione
2. Filtra eventi per data + maintenance
3. Apre MacroCategoryModal
4. Evidenzia la manutenzione specifica

---

## STRUTTURA DIRECTORY

```
src/features/calendar/
├── CalendarPage.tsx              # Entry point (1095 righe)
├── Calendar.tsx                  # Wrapper FullCalendar (996 righe)
├── hooks/
│   ├── useAggregatedEvents.ts    # Aggregazione 6 fonti
│   ├── useFilteredEvents.ts      # Filtri permessi
│   ├── useMacroCategoryEvents.ts # Aggregazione data+categoria
│   ├── useCalendarStats.ts       # Statistiche
│   ├── useCalendarAlerts.ts      # Sistema alert
│   ├── useCalendarRefresh.ts     # Auto-refresh
│   └── useGenericTasks.ts        # CRUD mansioni
├── components/
│   ├── MacroCategoryModal.tsx    # Modal categoria+data
│   ├── GenericTaskForm.tsx       # Form mansioni
│   ├── NewCalendarFilters.tsx    # Filtri UI
│   ├── CalendarStatsPanel.tsx    # Statistiche
│   └── AlertModal.tsx            # Alert urgenti
├── utils/
│   ├── eventTransform.ts         # Trasformazione eventi
│   ├── colorUtils.ts             # Colori eventi
│   └── recurrenceScheduler.ts    # Logica ricorrenza
└── calendar-custom.css           # Stili FullCalendar
```

---

## FILE CONOSCENZE-DEFINIZIONI

| File | Descrizione |
|------|-------------|
| **00_MASTER_INDEX_CALENDAR.md** | Questo file - overview generale |
| **CALENDAR_PAGE.md** | Documentazione CalendarPage |
| **MACRO_CATEGORY_SYSTEM.md** | Sistema MacroCategory |
| **FILTERS_AND_PERMISSIONS.md** | Sistema filtri 2-layer |
| **EVENT_AGGREGATION.md** | Aggregazione 6 fonti |
| **../Lavoro/04-02-2026/REPORT_SESSIONE_CALENDARIO_MACRO_MODAL.md** | Report lavoro 04-02-2026 (statistiche, refresh modal, completamento/uncomplete, temperature_reading) |
| **../Generic-Task-creation_assignation/** | Documentazione GenericTaskForm |

---

## FLUSSI UTENTE PRINCIPALI

### 1. Visualizzare eventi del giorno
1. Utente apre pagina Attività
2. CalendarPage carica eventi aggregati
3. Applica filtri permessi (Layer 1)
4. Mostra calendario con macro-categorie
5. Utente clicca su giorno → vede eventi

### 2. Completare una manutenzione / mansione
1. Utente clicca macro-categoria (Manutenzioni o Mansioni/Attività)
2. MacroCategoryModal mostra lista
3. Utente clicca "Completa" su voce
4. Sistema aggiorna status → 'completed'
5. Modal si aggiorna senza chiudere (refresh dati in pagina)
6. Per mansioni completate: utente (o admin) può cliccare "Ancora da Completare" nella card espansa per annullare

### 3. Creare nuova mansione
1. Utente espande sezione "Nuova Attività"
2. Compila GenericTaskForm (nome, frequenza, assegnazione, ecc.)
3. Salva → mansione creata
4. Eventi generati per tutto l'anno lavorativo

### 4. Navigare da Conservation
1. Utente è in pagina Conservazione
2. Clicca "Vedi nel Calendario" su manutenzione
3. Navigate a /attivita con state
4. CalendarPage apre MacroCategoryModal
5. Manutenzione specifica evidenziata

---

## QUICK START

### Per debug:
```bash
# Dev server
npm run dev

# Apri pagina Attività
# Verifica:
# 1. Eventi aggregati da tutte le fonti
# 2. Filtri funzionanti
# 3. MacroCategory click
# 4. Completamento eventi
```

### File chiave da leggere:
1. `src/features/calendar/CalendarPage.tsx` - Entry point
2. `src/features/calendar/hooks/useAggregatedEvents.ts` - Aggregazione
3. `src/features/calendar/hooks/useMacroCategoryEvents.ts` - MacroCategory
4. `src/features/calendar/components/MacroCategoryModal.tsx` - Modal

---

## COLORI EVENTO

| Tipo | Background | Border | Text |
|------|------------|--------|------|
| Maintenance | #FEF3C7 | #F59E0B | #92400E |
| Generic Task | #DBEAFE | #3B82F6 | #1E40AF |
| Product Expiry | #FEE2E2 | #EF4444 | #991B1B |
| Completed | #DCFCE7 | #10B981 | #065F46 |
| Overdue | #FEE2E2 | #EF4444 | #991B1B |

---

**Ultimo aggiornamento**: 2026-02-04
**Status**: PRODUCTION-READY - Sistema calendario completo con 6 fonti aggregate. Refresh modal, uncomplete mansioni, classificazione temperature_reading → Manutenzioni.
