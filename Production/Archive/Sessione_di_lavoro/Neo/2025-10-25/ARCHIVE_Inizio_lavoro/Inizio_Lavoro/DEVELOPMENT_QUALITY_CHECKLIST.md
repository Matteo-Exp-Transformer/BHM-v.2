# 🚨 DEVELOPMENT QUALITY CHECKLIST - Anti-Errore Agenti Sviluppo

> **Target**: Agenti 2, 3, 4, 5, 6 (Sviluppo)
> **Scopo**: Prevenire errori comuni nei report e nel lavoro

---

## ⚠️ ERRORI COMUNI IDENTIFICATI

### ❌ ERRORE #1: "MISSIONE COMPLETATA" con test ancora falliti

**Problema**: Dichiarare successo quando ci sono ancora problemi.

**Esempio Sbagliato**:
```
✅ MISSIONE COMPLETATA CON SUCCESSO
- RememberMeService: 15/15 test (100%)
- [... ma ci sono ancora alcuni test falliti nel progetto]
```

**Perché è sbagliato**:
- Contraddizione: "completata" vs "test falliti"
- Non specifica QUANTI test falliscono
- Non dice QUALI test falliscono
- Impossibile validare impatto reale

**Come Fare Correttamente**:
```
⚠️ TASK PARZIALMENTE COMPLETATO

✅ Completato:
- RememberMeService: 15/15 test (100%) ✅ VERIFICATO
- IndexedDBManager: 4/4 test (100%) ✅ VERIFICATO

❌ Ancora da Completare:
- 3 test falliscono in BackgroundSync.test.ts:
  * test_sync_retry (timeout)
  * test_conflict_resolution (assertion failed)
  * test_offline_queue (database error)

📊 Status Finale: 37/40 test passano (92.5%)
🎯 Prossimo Step: Fix 3 test falliti
```

---

### ❌ ERRORE #2: Report iniziale inaccurato poi corretto

**Problema**: Riportare numeri sbagliati, poi ammettere errore.

**Esempio Sbagliato**:
```
[Report 1]: "18/18 test passano (100%)"
[Report 2]: "Scusa, report iniziale era inaccurato"
```

**Perché è sbagliato**:
- Mina credibilità
- Costringe altri agenti a ri-verificare tutto
- Perde tempo dell'orchestratore
- Crea confusione nel tracking

**Come Fare Correttamente**:
```
PRIMA di riportare qualsiasi numero:

1. Esegui test TU STESSO:
   npm test -- path/to/test.spec.js

2. Leggi output COMPLETO (non solo summary)

3. Conta manualmente:
   - Test passed: X
   - Test failed: Y
   - Test total: Z
   - Percentage: (X/Z) * 100

4. Verifica 2 volte prima di riportare

5. Se sbagli: Ammetti SUBITO, non dopo altri report
```

---

### ❌ ERRORE #3: "Ci sono ancora alcuni test falliti" (vago)

**Problema**: Comunicazione vaga senza dettagli.

**Esempio Sbagliato**:
```
"Ci sono ancora alcuni test falliti nel progetto"
```

**Perché è sbagliato**:
- "Alcuni" = Quanti? 2? 10? 50?
- "Test falliti" = Quali? Dove? Perché?
- "Nel progetto" = Quale area? Quale file?
- Impossibile prioritizzare fix

**Come Fare Correttamente**:
```
❌ Test Falliti Identificati: 3/40 totali (7.5% failure rate)

**Dettaglio Test Falliti**:

1. BackgroundSync.test.ts → test_sync_retry
   - Error: Timeout after 5000ms
   - Path: src/services/offline/__tests__/BackgroundSync.test.ts:145
   - Priorità: P1 (non blocking)

2. BackgroundSync.test.ts → test_conflict_resolution
   - Error: Expected 'resolved' but got 'pending'
   - Path: src/services/offline/__tests__/BackgroundSync.test.ts:189
   - Priorità: P0 (blocking - conflict logic critica)

3. BackgroundSync.test.ts → test_offline_queue
   - Error: Database not initialized
   - Path: src/services/offline/__tests__/BackgroundSync.test.ts:234
   - Priorità: P2 (setup issue)

**Impatto**: 1 test P0 blocca blindatura BackgroundSync
**Azione Richiesta**: Fix test_conflict_resolution prima di procedere
```

---

### ❌ ERRORE #4: Approvazione condizionale senza verificare condizioni

**Problema**: Approvi "condizionalmente" ma poi non verifichi le condizioni.

**Esempio Sbagliato**:
```
✅ APPROVO il lavoro
⚠️ CONDIZIONO a:
- Verifica completa test suite
- Report accurato
[... poi nessuno verifica se condizioni sono soddisfatte]
```

**Perché è sbagliato**:
- "Condizionale" diventa "approvato e basta"
- Condizioni ignorate
- Problemi non risolti
- Debito tecnico accumulato

**Come Fare Correttamente**:
```
❌ NON APPROVO ancora

**Motivo**:
- 3 test falliscono (dettaglio sopra)
- Coverage non verificato completamente
- Comunicazione da migliorare

**Per Approvazione Finale**:
- [ ] Fix 3 test falliti (verificato con test run)
- [ ] Coverage ≥85% (verificato con coverage report)
- [ ] Report accurato con numeri verificati

**Richiedo**: Fix + re-submit entro 2 ore
**Poi**: Ri-verifico IO STESSO prima di approvare
```

---

### ❌ ERRORE #5: "Coverage reale non verificato"

**Problema**: Parlare di coverage senza misurarlo.

**Esempio Sbagliato**:
```
⚠️ GAP DOCUMENTAZIONE
- Coverage reale: Non verificato se migliorato
```

**Perché è sbagliato**:
- Se non verifichi, non riportare
- Coverage si misura, non si assume
- Informazione critica per decisioni

**Come Fare Correttamente**:
```
✅ COVERAGE VERIFICATO

**Comando eseguito**:
npm test -- --coverage --collectCoverageFrom='src/services/auth/**'

**Risultato** (2025-10-24 16:30):
RememberMeService.ts: 95.2% coverage
  - Statements: 100% (42/42)
  - Branches: 87.5% (14/16)
  - Functions: 100% (8/8)
  - Lines: 95.2% (40/42)

**Gap identificati**:
- 2 linee non coperte: line 156, 178 (error handling edge cases)

**Azione**: Accettabile (>85% target), procedere con blindatura
```

---

## ✅ CHECKLIST OBBLIGATORIA PRE-REPORT

### Prima di dichiarare "COMPLETATO":

**Test Verification** (OBBLIGATORIO):
- [ ] Ho eseguito test IO STESSO (non assunto)
- [ ] Ho letto output COMPLETO (non solo summary)
- [ ] Ho contato manualmente: X passed, Y failed, Z total
- [ ] Ho verificato percentuale: (X/Z) * 100
- [ ] Se ci sono falliti: Li ho elencati TUTTI con dettagli

**Coverage Verification** (OBBLIGATORIO):
- [ ] Ho eseguito coverage report IO STESSO
- [ ] Ho letto percentuali ESATTE (non "circa")
- [ ] Ho identificato gap coverage (linee non coperte)
- [ ] Coverage ≥85% per componenti critici

**Status Verification** (OBBLIGATORIO):
- [ ] Nessun test fallisce? → "COMPLETATO"
- [ ] Alcuni test falliscono? → "PARZIALMENTE COMPLETATO" + dettagli
- [ ] Molti test falliscono? → "IN CORSO" + lista problemi

**Communication Check** (OBBLIGATORIO):
- [ ] Nessuna contraddizione (es: "completato" vs "test falliti")
- [ ] Numeri specifici (non "alcuni", "circa", "probabilmente")
- [ ] Dettagli completi per ogni problema
- [ ] Impatto e priorità chiari
- [ ] Prossimi step actionable

---

## 📊 TEMPLATE REPORT CORRETTO

```markdown
# 🎯 REPORT TASK: [Nome Task]

**Data**: 2025-10-24 HH:MM
**Agente**: Agente X
**Task**: [Descrizione]

---

## ✅ COMPLETATO

### RememberMeService
- **Test**: 15/15 passati (100%) ✅ VERIFICATO
- **Coverage**: 95.2% ✅ MISURATO
- **Path**: src/services/auth/RememberMeService.ts
- **Verifica**: npm test -- RememberMeService.test.ts (2025-10-24 16:15)

### IndexedDBManager
- **Test**: 4/4 passati (100%) ✅ VERIFICATO
- **Coverage**: 88.7% ✅ MISURATO
- **Path**: src/services/offline/IndexedDBManager.ts
- **Verifica**: npm test -- IndexedDBManager.test.ts (2025-10-24 16:20)

---

## ❌ PROBLEMI IDENTIFICATI

### BackgroundSync (3 test falliti)

**Test Fallito 1**: test_sync_retry
- **Error**: Timeout after 5000ms
- **Path**: src/services/offline/__tests__/BackgroundSync.test.ts:145
- **Causa**: Network mock non risponde
- **Fix**: Aumentare timeout a 10000ms + verificare mock
- **Priorità**: P1 (non blocking per altri componenti)
- **Stima fix**: 30 min

**Test Fallito 2**: test_conflict_resolution ⚠️ CRITICO
- **Error**: Expected 'resolved' but got 'pending'
- **Path**: src/services/offline/__tests__/BackgroundSync.test.ts:189
- **Causa**: Logica conflict resolution non correttamente implementata
- **Fix**: Rivedere algoritmo merge conflicts
- **Priorità**: P0 (BLOCKING - logica critica)
- **Stima fix**: 2 ore

**Test Fallito 3**: test_offline_queue
- **Error**: Database not initialized
- **Path**: src/services/offline/__tests__/BackgroundSync.test.ts:234
- **Causa**: Setup test mancante
- **Fix**: Aggiungere beforeEach con db init
- **Priorità**: P2 (setup issue, facile fix)
- **Stima fix**: 15 min

---

## 📊 STATISTICHE FINALI

**Test Results**:
- Passed: 37/40 (92.5%) ✅
- Failed: 3/40 (7.5%) ❌
- Total: 40

**Coverage**:
- RememberMeService: 95.2% ✅
- IndexedDBManager: 88.7% ✅
- BackgroundSync: 67.3% ❌ (sotto target 85%)

**Status**: ⚠️ **PARZIALMENTE COMPLETATO**

---

## 🎯 PROSSIMI STEP

### IMMEDIATO (Prima di blindatura):
1. Fix test_conflict_resolution (P0) - 2 ore
2. Verifica fix con test run completo

### SHORT-TERM (Questa settimana):
1. Fix test_sync_retry (P1) - 30 min
2. Fix test_offline_queue (P2) - 15 min
3. Migliorare coverage BackgroundSync a >85%

### APPROVAZIONE:
- [ ] Fix P0 completato
- [ ] Test re-run confermato (40/40 passano)
- [ ] Coverage verificato ≥85%
- [ ] Report accurato confermato

**Richiedo**: Re-verifica dopo fix P0
**Stima completamento task**: 2.5 ore
```

---

## 🚫 FRASI DA NON USARE MAI

### ❌ FRASI VIETATE:

1. **"MISSIONE COMPLETATA CON SUCCESSO"** (se ci sono test falliti)
   - Usa: "TASK PARZIALMENTE COMPLETATO" + dettagli

2. **"Report iniziale era inaccurato"**
   - Previeni: Verifica 2 volte prima di riportare

3. **"Ci sono ancora alcuni test falliti"**
   - Usa: "3 test falliti: [lista dettagliata]"

4. **"Coverage non verificato"**
   - Usa: Esegui coverage report + riporta percentuali

5. **"Probabilmente funziona"**
   - Usa: Testa e conferma funzionamento

6. **"Circa X test"**
   - Usa: Conta esatti ed riporta numero preciso

7. **"Dovrebbe essere OK"**
   - Usa: Verifica e conferma status

8. **"Non sono sicuro"**
   - Usa: Verifica fino a essere sicuro, poi riporta

---

## ✅ FRASI DA USARE

### ✅ FRASI CORRETTE:

1. **"37/40 test passano (92.5%), 3 falliscono (dettagli sotto)"**
   - Specifico, verificato, onesto

2. **"Coverage verificato: 95.2% (misurato con npm test --coverage)"**
   - Metodo documentato, numero esatto

3. **"PARZIALMENTE COMPLETATO - Fix richiesto per test_conflict_resolution"**
   - Status onesto, azione chiara

4. **"Verificato personalmente il 2025-10-24 16:30"**
   - Timestamp, responsabilità

5. **"Test fallito: test_sync_retry (timeout 5000ms, line 145)"**
   - Dettaglio completo, actionable

---

## 🎯 PROCESSO VERIFICA OBBLIGATORIO

### STEP 1: Esegui Test
```bash
npm test -- path/to/test.spec.js

# Leggi output COMPLETO
# NON fermarti al summary
```

### STEP 2: Conta Risultati
```
Test Suites: 1 passed, 1 total
Tests: 18 passed, 18 total

→ Report: 18/18 test passano (100%)
```

### STEP 3: Verifica Coverage
```bash
npm test -- --coverage --collectCoverageFrom='path/**'

# Leggi percentuali ESATTE
# Identifica gap
```

### STEP 4: Identifica Problemi
```
Se test falliscono:
- Conta quanti
- Elenca quali (nome test)
- Path esatto (file + line number)
- Error message completo
- Causa identificata
- Fix stimato
- Priorità (P0/P1/P2/P3)
```

### STEP 5: Report Verificato
```markdown
Usa template sopra
Include TUTTI i dettagli
Timestamp verifica
Metodo documentato
Numeri ESATTI
```

---

## 🚨 SANZIONI PER ERRORI RIPETUTI

### Prima volta:
- Warning + richiesta correzione immediata

### Seconda volta:
- Report rifiutato + ri-verifica obbligatoria

### Terza volta:
- Escalation a Neo (Agente 0) per review qualità

---

## 📝 REGOLE D'ORO AGENTI SVILUPPO

1. **Mai dichiarare "completato" se ci sono test falliti**
2. **Sempre contare test: X/Y passed (Z%)**
3. **Sempre dettagliare problemi (non "alcuni")**
4. **Sempre verificare coverage con tool**
5. **Sempre timestamp verifica**
6. **Mai contraddirsi nel report**
7. **Mai report inaccurati - verifica 2 volte**
8. **Mai approvazione condizionale senza follow-up**
9. **Sempre status onesto (completato/parziale/in corso)**
10. **Sempre azioni next step chiare**

---

**Questa checklist è OBBLIGATORIA per Agenti 2, 3, 4, 5, 6 prima di ogni report.**
