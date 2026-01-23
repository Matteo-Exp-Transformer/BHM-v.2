# 🧪 Testing Report - Fix BUG-005 & BUG-008

**Data**: 2026-01-09
**Agente**: Claude Sonnet 4.5
**Branch**: NoClerk

---

## 📋 Sommario Fix Applicate

### ✅ BUG-005: Eventi nei giorni chiusi (HIGH)
**Problema**: Eventi visualizzati anche nei giorni chiusura/festivi
**Causa**: Race condition - `calendarSettings` non caricati al primo render
**Fix**: Aggiunto `useMemo` con check `calendarLoading` + debug logs

### ✅ BUG-008: Form /Attività non allineato (LOW)
**Problema**: Mancano campi `dataInizio` e `dataFine` in GenericTaskForm
**Fix**: Aggiunti campi UI + validazione + backend handling

---

## 🚀 Come Testare

### Opzione 1: Test Automatici (RACCOMANDATO)

```bash
# 1. Installa dipendenze (se non fatto)
npm install

# 2. Test BUG-005 (verifica database)
node scripts/debug-calendar-bug.js

# 3. Test BUG-008 (verifica form alignment)
node scripts/test-form-alignment.js
```

**Output atteso**:
- ✅ BUG-005: Nessun conflitto tra tasks e giorni chiusi
- ✅ BUG-008: Form completamente allineati

---

### Opzione 2: Test Manuali

#### Test 1: BUG-005 - Calendario

1. **Apri DevTools Console** (F12)
2. **Vai a** `/calendar`
3. **Cerca log**:
   ```
   🔧 Calendar settings loaded for event filtering: { ... }
   ```
4. **Verifica visivamente**:
   - Eventi NON devono apparire nei giorni con icona ombrellone
   - Eventi NON devono apparire nei giorni festivi configurati

**Se vedi ancora eventi nei giorni chiusi**:
- Screenshot calendario
- Log console (copia tutto)
- Esegui `node scripts/debug-calendar-bug.js` e condividi output

#### Test 2: BUG-008 - Form Alignment

1. **Vai a** `/attivita` (o la pagina Attività)
2. **Click** "Aggiungi Attività"
3. **Verifica presenza campi**:
   - ✅ Nome attività
   - ✅ Frequenza
   - ✅ Ruolo
   - ✅ Reparto (con opzione "Tutti")
   - ✅ Giorni della settimana (per settimanale/custom)
   - ✅ Giorno del mese (per mensile)
   - ✅ **Data Inizio (Opzionale)** 🆕
   - ✅ **Data Fine (Opzionale)** 🆕
   - ✅ Gestione Orario Attività (collapsabile)

4. **Test validazione**:
   - Inserisci `Data Fine` < `Data Inizio`
   - Deve mostrare errore: "Data fine deve essere successiva alla data di inizio"

---

## 📊 Files Modificati

### BUG-005 Fix
```
src/features/calendar/hooks/useAggregatedEvents.ts
  ├─ Linea 72-96: useMemo per settingsForExpand con check loading
  ├─ Linea 82-87: Debug log settings caricati
  ├─ Linea 390: Log skip giorni chiusi
  └─ Linea 415: Warning settings non configurati
```

### BUG-008 Fix
```
src/features/calendar/components/GenericTaskForm.tsx
  ├─ Linea 510-522: Campo Data Inizio UI
  ├─ Linea 524-536: Campo Data Fine UI
  └─ Linea 187-193: Validazione dataFine > dataInizio

src/features/calendar/hooks/useGenericTasks.ts
  └─ Linea 235-243: Gestione end_date in description

src/features/calendar/CalendarPage.tsx
  └─ Linea 319-320: Passaggio start_date/end_date
```

---

## 🔍 Debug Tools Disponibili

### Script Node.js

1. **debug-calendar-bug.js**
   Verifica stato database per BUG-005
   - Calendar settings
   - Tasks create
   - Conflitti giorni chiusi

2. **test-form-alignment.js**
   Verifica allineamento form onboarding vs /Attività
   - Presenza campi
   - Validazioni
   - Backend handling

### Script SQL

1. **debug-calendar-settings-simple.sql**
   Query semplificate per Supabase SQL Editor
   - Tipo dato closure_dates
   - Count tasks
   - Verifiche formato date

---

## 📝 Checklist Testing

### BUG-005: Eventi Calendario
- [ ] Script `debug-calendar-bug.js` eseguito senza errori
- [ ] Console browser mostra log `🔧 Calendar settings loaded`
- [ ] Eventi NON visibili nei giorni con icona ombrellone
- [ ] Eventi NON visibili nei giorni festivi configurati
- [ ] Log `⏭️ Skipping closed date` appare quando dovrebbe

### BUG-008: Form Alignment
- [ ] Script `test-form-alignment.js` eseguito con successo (exit code 0)
- [ ] Campi `dataInizio` e `dataFine` visibili in /Attività
- [ ] Validazione `dataFine > dataInizio` funziona
- [ ] Attività create in /Attività salvano correttamente le date
- [ ] Attività create in onboarding salvano correttamente le date

---

## 🐛 Se i Test Falliscono

### BUG-005 persiste

**Causa possibile 1: Settings non caricati**
```
Console log atteso: "🔧 Calendar settings loaded for event filtering"
Se NON vedi questo log → settings non arrivano dal DB
```

**Debug steps**:
1. Esegui `node scripts/debug-calendar-bug.js`
2. Verifica che `is_configured = true`
3. Verifica che `closure_dates` non sia vuoto
4. Condividi output completo

**Causa possibile 2: Formato date sbagliato**
```
closure_dates deve essere: ["2026-01-15", "2026-01-16"]
NON: ["15/01/2026", "2026-1-15"]
```

### BUG-008 persiste

**Sintomo**: Campi non visibili in /Attività

**Debug steps**:
1. Esegui `node scripts/test-form-alignment.js`
2. Verifica output tabella alignment
3. Se fallisce, controlla che file siano stati salvati correttamente
4. Ricompila: `npm run build` (se necessario)

---

## ✅ Acceptance Criteria

### BUG-005 - RISOLTO se:
- ✅ Script Node.js non trova conflitti
- ✅ Console browser mostra log filtro applicato
- ✅ Eventi non appaiono in giorni chiusi (verifica visiva)

### BUG-008 - RISOLTO se:
- ✅ Script test-form-alignment exit code = 0
- ✅ Campi dataInizio/dataFine visibili in /Attività
- ✅ Validazione date funziona
- ✅ Salvataggio tasks funziona con le nuove date

---

## 📞 Support

**Se hai problemi**:
1. Esegui entrambi gli script Node.js
2. Copia output completo
3. Screenshot console browser (se BUG-005)
4. Screenshot form /Attività (se BUG-008)
5. Condividi tutto

---

**Testing completato**: [ ]
**BUG-005 risolto**: [ ]
**BUG-008 risolto**: [ ]
**Data testing**: ___________
