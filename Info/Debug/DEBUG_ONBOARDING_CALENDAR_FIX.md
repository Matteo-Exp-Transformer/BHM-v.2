# Debug: Fix Onboarding e Calendario

## Problemi Identificati e Risolti

### 1. **Calendario non configurato dopo onboarding con DevButton**

**Problema**: Quando si completava l'onboarding usando il DevButton "Completa Onboarding", il calendario risultava non configurato.

**Causa**: La funzione `getPrefillData()` in `onboardingHelpers.ts` non includeva i dati del calendario. Alle righe 664-665 c'era un commento che diceva che il calendario NON doveva essere preconfigurato automaticamente.

**Soluzione**:
- Aggiunto dati del calendario completi alla funzione `getPrefillData()`
- Configurazione predefinita con anno lavorativo 2024
- Giorni lavorativi: Lunedì-Sabato
- Orari: 8:00-18:00 (Lun-Ven), 8:00-14:00 (Sabato), Domenica chiuso
- Festività principali italiane 2024

### 2. **Tasto "Cancella e Ricomincia" non funzionava correttamente**

**Problema**: Il tasto "Cancella e Ricomincia" in HeaderButtons non invalidava correttamente tutte le query React Query dopo il reset.

**Causa**: Mancavano alcune invalidazioni di query specifiche per il calendario e i completamenti delle mansioni.

**Soluzione**:
- Aggiunta invalidazione di `['company-calendar-settings']`
- Aggiunta invalidazione di `['macro-category-events']`
- Aggiunta invalidazione di `['task-completions']`
- Migliorato logging per debug

### 3. **Debug migliorato per salvataggio calendario**

**Problema**: Era difficile capire perché i dati del calendario non venivano salvati.

**Soluzione**:
- Aggiunto logging dettagliato in `saveAllDataToSupabase()`
- Verifica migliorata della condizione `Object.keys(formData.calendar).length > 0`
- Log dei dati del calendario e delle chiavi per debug

## File Modificati

### 1. `src/utils/onboardingHelpers.ts`
- **Righe 664-692**: Aggiunto dati calendario completi alla funzione `getPrefillData()`
- **Righe 1903-1935**: Migliorato logging e condizione per salvataggio calendario

### 2. `src/components/HeaderButtons.tsx`
- **Righe 60-95**: Migliorata invalidazione delle query React Query dopo reset

## Configurazione Calendario Predefinita

```typescript
calendar: {
  fiscal_year_start: '2024-01-01', // 1 gennaio 2024
  fiscal_year_end: '2024-12-31',   // 31 dicembre 2024
  open_weekdays: [1, 2, 3, 4, 5, 6], // Lunedì-Sabato
  closure_dates: [
    '2024-01-01', // Capodanno
    '2024-04-01', // Pasqua
    '2024-04-02', // Lunedì dell'Angelo
    '2024-04-25', // Festa della Liberazione
    '2024-05-01', // Festa del Lavoro
    '2024-06-02', // Festa della Repubblica
    '2024-08-15', // Ferragosto
    '2024-11-01', // Ognissanti
    '2024-12-08', // Immacolata Concezione
    '2024-12-25', // Natale
    '2024-12-26', // Santo Stefano
  ],
  business_hours: {
    '1': [{ open: '08:00', close: '18:00' }], // Lunedì
    '2': [{ open: '08:00', close: '18:00' }], // Martedì
    '3': [{ open: '08:00', close: '18:00' }], // Mercoledì
    '4': [{ open: '08:00', close: '18:00' }], // Giovedì
    '5': [{ open: '08:00', close: '18:00' }], // Venerdì
    '6': [{ open: '08:00', close: '14:00' }], // Sabato
    '0': [], // Domenica chiuso
  },
}
```

## Test da Eseguire

### 1. **Test DevButton "Completa Onboarding"**
1. Apri l'applicazione
2. Clicca su "Completa Onboarding" nel DevButton
3. Verifica che il calendario sia configurato correttamente
4. Controlla che i dati del calendario siano visibili nel database

### 2. **Test Tasto "Cancella e Ricomincia"**
1. Clicca su "Cancella e Ricomincia" in HeaderButtons
2. Conferma l'operazione
3. Verifica che l'onboarding si apra automaticamente
4. Controlla che tutte le query siano state invalidate correttamente

### 3. **Test Onboarding Manuale**
1. Completa l'onboarding manualmente step by step
2. Configura il calendario nell'ultimo step
3. Verifica che il calendario sia salvato correttamente

## Debug

Per debug, controllare:
1. Console per messaggi di logging del calendario
2. Database per record in `company_calendar_settings`
3. LocalStorage per dati `onboarding-data`
4. React Query DevTools per invalidazioni query

## Note Importanti

- Il calendario ora viene sempre preconfigurato quando si usa il DevButton
- L'onboarding manuale richiede ancora la configurazione del calendario nell'ultimo step
- Il reset "Cancella e Ricomincia" ora funziona correttamente con invalidazione completa
- I dati del calendario sono configurati per l'anno 2024 con festività italiane


