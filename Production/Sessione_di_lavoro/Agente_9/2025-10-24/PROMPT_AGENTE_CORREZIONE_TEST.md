# 🚨 PROMPT AGENTE - CORREZIONE TEST FALLITI CRITICI

**Data**: 2025-10-24  
**Agente**: Agente 3 (Testing Strategy) o Agente 4 (Code Quality)  
**Priorità**: 🔴 **P0 CRITICA**  
**Sessione**: Correzione Test Falliti per Blindatura Completa

---

## 🎯 MISSIONE CRITICA

**Obiettivo**: Correggere **12+ test falliti** identificati da Agente 9 per permettere blindatura completa Login e Onboarding.

**Status Attuale**: ❌ **BLINDATURA BLOCCATA** - Test falliti impediscono completamento

---

## 📊 SITUAZIONE VERIFICATA DA AGENTE 9

### ❌ **TEST FALLITI IDENTIFICATI**

#### **1. RememberMeService (8 test falliti)**
- **File**: `src/services/auth/__tests__/RememberMeService.test.ts`
- **Errori**: 
  - `isRememberMeActive` ritorna `true` invece di `false`
  - `getSessionInfo` ritorna dati invece di `null`
  - `shouldRefreshSession` ritorna `true` invece di `false`
  - `getTimeUntilExpiry` calcoli errati
- **Impatto**: Critico - impedisce blindatura useAuth hook

#### **2. IndexedDBManager (4 errori)**
- **File**: `src/services/offline/__tests__/IndexedDBManager.test.ts`
- **Errori**:
  - `Cannot read properties of undefined (reading 'objectStoreNames')`
  - Timeout su test database initialization
  - Errori su sync queue operations
- **Impatto**: Critico - impedisce blindatura offline services

#### **3. Onboarding Incremental (test falliti)**
- **File**: `Archives/Tests/Test/Onboarding/Incremental/mapping_step2.test.tsx`
- **Errori**:
  - `Unable to find an accessible element with the role "combobox" and name /ruolo/i`
  - Elementi UI non trovati nei test
- **Impatto**: Alto - impedisce blindatura onboarding components

---

## 🎯 PRIORITÀ CORREZIONE

### **🔴 PRIORITÀ CRITICA (P0) - IMMEDIATA**

#### **1. RememberMeService Test Fix**
- **Tempo stimato**: 2-3 ore
- **Azioni**:
  - Analizzare logica `isRememberMeActive()`
  - Correggere calcoli `getTimeUntilExpiry()`
  - Fixare `getSessionInfo()` per sessioni scadute
  - Verificare `shouldRefreshSession()` logic

#### **2. IndexedDBManager Test Fix**
- **Tempo stimato**: 2-3 ore
- **Azioni**:
  - Fixare database initialization mock
  - Correggere `objectStoreNames` access
  - Risolvere timeout issues
  - Verificare sync queue operations

### **🟡 PRIORITÀ ALTA (P1) - BREVE TERMINE**

#### **3. Onboarding Incremental Test Fix**
- **Tempo stimato**: 1-2 ore
- **Azioni**:
  - Aggiornare selectors per elementi UI
  - Verificare accessibility roles
  - Correggere test data-testid

---

## 📋 PROCEDURA CORREZIONE

### **STEP 1: ANALISI PRELIMINARE**
```bash
# Esegui test per identificare errori specifici
npm test -- --run --reporter=verbose

# Focus su test specifici
npm test -- --run src/services/auth/__tests__/RememberMeService.test.ts
npm test -- --run src/services/offline/__tests__/IndexedDBManager.test.ts
```

### **STEP 2: CORREZIONE REMEMBERMESERVICE**
1. **Analizza logica business**:
   - Verifica calcoli timestamp
   - Controlla logica scadenza sessioni
   - Verifica gestione localStorage

2. **Correggi test assertions**:
   - Fixare `expect(result).toBe(false)` per sessioni scadute
   - Correggere `expect(result).toBeNull()` per dati non esistenti
   - Aggiustare `expect(result).toBeCloseTo()` per calcoli tempo

### **STEP 3: CORREZIONE INDEXEDDBMANAGER**
1. **Fixare mock database**:
   - Correggere `db.objectStoreNames` access
   - Implementare proper mock per IndexedDB
   - Risolvere timeout issues

2. **Verificare sync operations**:
   - Controllare `addToSyncQueue` calls
   - Verificare `retrieveSyncQueue` operations
   - Testare `saveOfflineData` functionality

### **STEP 4: CORREZIONE ONBOARDING**
1. **Aggiornare selectors**:
   - Verificare `data-testid` attributes
   - Controllare accessibility roles
   - Aggiornare test queries

---

## 🧪 COMANDI TEST SPECIFICI

### **Test RememberMeService**
```bash
# Test specifico con debug
npm test -- --run src/services/auth/__tests__/RememberMeService.test.ts --reporter=verbose

# Test con coverage
npm test -- --run src/services/auth/__tests__/RememberMeService.test.ts --coverage
```

### **Test IndexedDBManager**
```bash
# Test specifico con timeout aumentato
npm test -- --run src/services/offline/__tests__/IndexedDBManager.test.ts --timeout=10000

# Test con debug
npm test -- --run src/services/offline/__tests__/IndexedDBManager.test.ts --reporter=verbose
```

### **Test Onboarding**
```bash
# Test onboarding completo
npm test -- --run tests/onboarding-complete.spec.ts

# Test incremental specifico
npm test -- --run Archives/Tests/Test/Onboarding/Incremental/mapping_step2.test.tsx
```

---

## 📊 METRICHE SUCCESSO

### **🎯 TARGET CORREZIONE**
- **RememberMeService**: 8/8 test passati (100%)
- **IndexedDBManager**: 4/4 test passati (100%)
- **Onboarding**: 0 test falliti
- **Coverage LoginPage**: Da ~60% a 80%+

### **✅ ACCEPTANCE CRITERIA**
- [ ] Tutti i test RememberMeService passano
- [ ] Tutti i test IndexedDBManager passano
- [ ] Onboarding test non falliscono più
- [ ] Coverage LoginPage migliorato
- [ ] Blindatura può procedere

---

## 🚨 AVVISI IMPORTANTI

### **⚠️ NON MODIFICARE**
- File con `// LOCKED:` nel codice
- Componenti già blindati senza permesso
- Logica business senza verifica

### **✅ PROCEDURE SICURE**
- Testare ogni modifica prima di commit
- Verificare che fix non rompa altri test
- Documentare modifiche nel changelog
- Aggiornare MASTER_TRACKING.md

---

## 📋 DELIVERABLES RICHIESTI

### **📊 REPORT CORREZIONE**
1. **Analisi errori** per ogni test fallito
2. **Soluzioni implementate** con spiegazione
3. **Test results** prima e dopo correzione
4. **Coverage report** aggiornato

### **📝 DOCUMENTAZIONE**
1. **Changelog** modifiche apportate
2. **Aggiornamento MASTER_TRACKING.md**
3. **Note** per future sessioni
4. **Raccomandazioni** per prevenire regressioni

---

## 🎯 HANDOFF DOPO CORREZIONE

Una volta completata la correzione:

1. **Notifica Agente 9** per verifica finale
2. **Aggiorna documentazione** condivisa
3. **Riesegui test completi** per conferma
4. **Prepara handoff** per blindatura finale

---

**Status**: 🔴 **CRITICO - BLINDATURA BLOCCATA**  
**Prossimo**: Correzione test falliti per sbloccare blindatura  
**Tempo stimato**: 4-6 ore totali  
**Deadline**: Fine giornata per sbloccare blindatura domani

---

**Firma Agente 9**: ✅ **PROMPT CORREZIONE GENERATO**  
**Data**: 2025-10-24  
**Status**: Pronto per esecuzione da Agente competente
