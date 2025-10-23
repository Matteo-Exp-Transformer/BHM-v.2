# 📋 BRIEF TO AGENTE 2 - BLINDATURA LOGIN E ONBOARDING

**Data**: 2025-10-23  
**Da**: Agente 1 - Product Strategy Lead  
**A**: Agente 2 - Systems Blueprint Architect  
**Sessione**: Blindatura Completa Login e Onboarding  
**Status**: ✅ **STRATEGIA CORRETTA DEFINITA**

---

## 🚨 AVVISO CRITICO - SALTO DI PRIORITÀ

**❌ PROBLEMA IDENTIFICATO**: Agente 2 ha saltato la **priorità P0 (Login Flow)** e ha implementato direttamente **P1 (Onboarding)**.

**🔴 AZIONE IMMEDIATA RICHIESTA**: Completare **Login Flow P0** PRIMA di procedere con altre priorità.

**📋 COMPONENTI LOGIN FLOW P0 DA COMPLETARE**:
1. **Password Policy** - 12 caratteri, lettere + numeri
2. **CSRF Protection** - Token al page load
3. **Rate Limiting** - Escalation progressiva
4. **Remember Me** - 30 giorni
5. **Multi-Company** - Preferenza utente + ultima usata

---

## 🎯 SCOPO SESSIONE

**Obiettivo**: Blindare completamente i componenti Login e Onboarding per garantire stabilità e funzionalità in produzione.

**Approccio Corretto**: **Testing e validazione** di componenti esistenti, **NON implementazione** di nuovi componenti.

---

## 📊 ANALISI COMPONENTI ESISTENTI

### **🔒 COMPONENTI LOCKED (Già Blindati)**
| Componente | File | Status | Test Coverage | Note |
|------------|------|--------|---------------|------|
| **LoginPage** | `src/features/auth/LoginPage.tsx` | 🔒 LOCKED | 74% (23/31) | LoginForm blindata da Agente 2 |
| **RegisterPage** | `src/features/auth/RegisterPage.tsx` | 🔒 LOCKED | 80% (24/30) | RegisterForm blindata |
| **ForgotPasswordPage** | `src/features/auth/ForgotPasswordPage.tsx` | 🔒 LOCKED | 62% (21/34) | ForgotPasswordForm blindata |
| **useAuth Hook** | `src/hooks/useAuth.ts` | 🔒 LOCKED | 100% (26/26) | PermissionLogic completamente testato |
| **OnboardingGuard** | `src/components/OnboardingGuard.tsx` | 🔒 LOCKED | ✅ Test verificati | Redirect onboarding testato |

### **⚠️ COMPONENTI NON LOCKED (Da Blindare)**
| Componente | File | Status | Test Coverage | Priorità | Azione |
|------------|------|--------|---------------|----------|---------|
| **OnboardingWizard** | `src/components/OnboardingWizard.tsx` | ⚠️ NON LOCKED | ❓ Da valutare | 🔴 P0 | **Testare e blindare** |
| **BusinessInfoStep** | `src/components/onboarding-steps/BusinessInfoStep.tsx` | ⚠️ NON LOCKED | ❓ Da valutare | 🔴 P0 | **Testare e blindare** |
| **StaffStep** | `src/components/onboarding-steps/StaffStep.tsx` | ⚠️ NON LOCKED | ❓ Da valutare | 🔴 P0 | **Testare e blindare** |
| **ConservationStep** | `src/components/onboarding-steps/ConservationStep.tsx` | ⚠️ NON LOCKED | ❓ Da valutare | 🔴 P0 | **Testare e blindare** |
| **DepartmentsStep** | `src/components/onboarding-steps/DepartmentsStep.tsx` | ⚠️ NON LOCKED | ❓ Da valutare | 🟡 P1 | **Testare e blindare** |
| **TasksStep** | `src/components/onboarding-steps/TasksStep.tsx` | ⚠️ NON LOCKED | ❓ Da valutare | 🟡 P1 | **Testare e blindare** |
| **InventoryStep** | `src/components/onboarding-steps/InventoryStep.tsx` | ⚠️ NON LOCKED | ❓ Da valutare | 🟡 P1 | **Testare e blindare** |
| **CalendarConfigStep** | `src/components/onboarding-steps/CalendarConfigStep.tsx` | ⚠️ NON LOCKED | ❓ Da valutare | 🟡 P1 | **Testare e blindare** |

---

## 🎯 STRATEGIA BLINDATURA

### **🔴 PRIORITÀ CRITICA (P0) - Blindatura Immediata**

#### **1. LOGIN FLOW BLINDATURA (PRIORITÀ CRITICA MANCANTE)**
- **Password Policy**: Implementare 12 caratteri, lettere + numeri
- **CSRF Protection**: Implementare token al page load
- **Rate Limiting**: Implementare escalation progressiva (5min → 15min → 1h → 24h)
- **Remember Me**: Implementare 30 giorni
- **Multi-Company**: Implementare preferenza utente + ultima usata
- **Azione**: Completare blindatura Login Flow P0 PRIMA di procedere con Onboarding

#### **2. ONBOARDING WIZARD**
- **File**: `src/components/OnboardingWizard.tsx`
- **Obiettivo**: Testare e blindare wizard principale
- **Test Esistenti**: 4 file test presenti
- **Azione**: Eseguire test completi, identificare gap, blindare

#### **3. BUSINESS INFO STEP**
- **File**: `src/components/onboarding-steps/BusinessInfoStep.tsx`
- **Obiettivo**: Testare e blindare step critico per dati azienda
- **Test Esistenti**: 3 file test presenti
- **Azione**: Eseguire test completi, identificare gap, blindare

#### **4. STAFF STEP**
- **File**: `src/components/onboarding-steps/StaffStep.tsx`
- **Obiettivo**: Testare e blindare gestione personale
- **Test Esistenti**: 3 file test presenti
- **Azione**: Eseguire test completi, identificare gap, blindare

#### **5. CONSERVATION STEP**
- **File**: `src/components/onboarding-steps/ConservationStep.tsx`
- **Obiettivo**: Testare e blindare logica HACCP
- **Test Esistenti**: 3 file test presenti
- **Azione**: Eseguire test completi, identificare gap, blindare

### **🟡 PRIORITÀ ALTA (P1) - Blindatura Breve Termine**

#### **6. DEPARTMENTS STEP**
- **File**: `src/components/onboarding-steps/DepartmentsStep.tsx`
- **Obiettivo**: Testare e blindare organizzazione aziendale
- **Test Esistenti**: 3 file test presenti
- **Azione**: Eseguire test completi, identificare gap, blindare

#### **7. TASKS STEP**
- **File**: `src/components/onboarding-steps/TasksStep.tsx`
- **Obiettivo**: Testare e blindare gestione attività
- **Test Esistenti**: 3 file test presenti
- **Azione**: Eseguire test completi, identificare gap, blindare

#### **8. INVENTORY STEP**
- **File**: `src/components/onboarding-steps/InventoryStep.tsx`
- **Obiettivo**: Testare e blindare gestione prodotti
- **Test Esistenti**: 3 file test presenti
- **Azione**: Eseguire test completi, identificare gap, blindare

#### **9. CALENDAR CONFIG STEP**
- **File**: `src/components/onboarding-steps/CalendarConfigStep.tsx`
- **Obiettivo**: Testare e blindare configurazione calendario
- **Test Esistenti**: 3 file test presenti
- **Azione**: Eseguire test completi, identificare gap, blindare

---

## 📊 TEST COVERAGE TARGET

### **🎯 OBIETTIVI TEST COVERAGE**
| Componente | Coverage Attuale | Target | Gap |
|------------|------------------|--------|-----|
| **OnboardingWizard** | ❓ Da valutare | 100% | ❓ Da valutare |
| **BusinessInfoStep** | ❓ Da valutare | 100% | ❓ Da valutare |
| **StaffStep** | ❓ Da valutare | 100% | ❓ Da valutare |
| **ConservationStep** | ❓ Da valutare | 100% | ❓ Da valutare |
| **DepartmentsStep** | ❓ Da valutare | 100% | ❓ Da valutare |
| **TasksStep** | ❓ Da valutare | 100% | ❓ Da valutare |
| **InventoryStep** | ❓ Da valutare | 100% | ❓ Da valutare |
| **CalendarConfigStep** | ❓ Da valutare | 100% | ❓ Da valutare |

### **🔒 BLINDATURA TARGET**
- **100% componenti onboarding** LOCKED
- **100% test coverage** per componenti critici
- **0 gap critici** identificati
- **0 gap alti** identificati

---

## 🧪 TEST STRATEGY

### **📋 TEST ESISTENTI DA VALUTARE**
```
Production/Test/Onboarding/
├── OnboardingWizard/
│   ├── test-funzionale.spec.js
│   ├── test-validazione.spec.js
│   ├── test-edge-cases.spec.js
│   └── test-completamento.spec.js
├── BusinessInfoStep/
│   ├── test-funzionale.spec.js
│   ├── test-validazione.spec.js
│   └── test-edge-cases.spec.js
├── StaffStep/
│   ├── test-funzionale.spec.js
│   ├── test-validazione.spec.js
│   └── test-edge-cases.spec.js
├── ConservationStep/
│   ├── test-funzionale.spec.js
│   ├── test-validazione.spec.js
│   └── test-edge-cases.spec.js
├── DepartmentsStep/
│   ├── test-funzionale.spec.js
│   ├── test-validazione.spec.js
│   └── test-edge-cases.spec.js
├── TasksStep/
│   ├── test-funzionale.spec.js
│   ├── test-validazione.spec.js
│   └── test-edge-cases.spec.js
├── InventoryStep/
│   ├── test-funzionale.spec.js
│   ├── test-validazione.spec.js
│   └── test-edge-cases.spec.js
└── CalendarConfigStep/
    ├── test-funzionale.spec.js
    ├── test-validazione.spec.js
    └── test-edge-cases.spec.js
```

### **🔍 TEST PROCESS**
1. **Eseguire test esistenti** per ogni componente
2. **Identificare test falliti** o mancanti
3. **Completare test coverage** per raggiungere 100%
4. **Blindare componente** con status LOCKED
5. **Documentare blindatura** in MASTER_TRACKING.md

---

## 📋 DELIVERABLES RICHIESTI

### **🔴 PRIORITÀ CRITICA (P0)**
1. **Test Report** per OnboardingWizard
2. **Test Report** per BusinessInfoStep
3. **Test Report** per StaffStep
4. **Test Report** per ConservationStep
5. **Blindatura** di tutti i componenti P0

### **🟡 PRIORITÀ ALTA (P1)**
1. **Test Report** per DepartmentsStep
2. **Test Report** per TasksStep
3. **Test Report** per InventoryStep
4. **Test Report** per CalendarConfigStep
5. **Blindatura** di tutti i componenti P1

### **📊 DOCUMENTAZIONE**
1. **Test Coverage Report** completo
2. **Gap Analysis** dettagliato
3. **Blindatura Status** aggiornato
4. **MASTER_TRACKING.md** aggiornato

---

## 🚨 AVVISI IMPORTANTI

### **⚠️ COMPONENTI LOCKED**
- **NON MODIFICARE** file con `// LOCKED:` nel codice
- **SEMPRE CONTROLLARE** MASTER_TRACKING.md prima di modifiche
- **SE COMPONENTE È LOCKED**: chiedere permesso esplicito all'utente

### **🔒 BLINDATURA**
- **Componenti critici** richiedono test coverage 100%
- **File reali** devono essere protetti con LOCKED status
- **Dipendenze** devono essere mappate completamente
- **Test esistenti** devono essere verificati e aggiornati

### **⚠️ PROBLEMA CRITICO IDENTIFICATO**
- **Onboarding components NON LOCKED**: Rischio modifiche accidentali
- **Test coverage incompleto**: Alcuni componenti sotto 100%
- **Blindatura critica** necessaria per componenti onboarding
- **Validazione completa** richiesta per tutti i componenti

---

## 📊 METRICHE SUCCESSO

### **🎯 ACCEPTANCE CRITERIA**
- [ ] **100% componenti onboarding** LOCKED
- [ ] **100% test coverage** per componenti critici
- [ ] **0 gap critici** identificati
- [ ] **0 gap alti** identificati
- [ ] **Sistema completamente blindato** per produzione

### **📈 KPI TRACKING**
- **Componenti testati**: 8/8 (100%)
- **Componenti blindati**: 8/8 (100%)
- **Test coverage medio**: 100%
- **Gap risolti**: 8/8 (100%)

---

## 🚀 NEXT STEPS

### **1. IMMEDIATE ACTIONS**
1. **Analizzare test esistenti** per ogni componente
2. **Eseguire test** per identificare gap
3. **Completare test coverage** per raggiungere 100%
4. **Blindare componenti** con status LOCKED

### **2. DELIVERABLES**
1. **Test Report** completo per ogni componente
2. **Blindatura Status** aggiornato
3. **MASTER_TRACKING.md** aggiornato
4. **Documentazione** completa

---

**Status**: ✅ **BRIEF COMPLETATO**  
**Prossimo**: Agente 2 procede con blindatura componenti

**Firma**: Agente 1 - Product Strategy Lead (Corretto)  
**Data**: 2025-10-23  
**Status**: Strategia corretta definita per blindatura

---

## 📋 DOMANDE FINALI DI ALLINEAMENTO

### **Scope**: Confermi che lo scope elencato è esattamente ciò che vuoi per la prima iterazione (MUST/SHOULD/COULD)?
- **MUST**: Completare Login Flow P0 (Password Policy, CSRF Protection, Rate Limiting, Remember Me, Multi-Company)
- **MUST**: Blindare 4 componenti P0 (OnboardingWizard, BusinessInfoStep, StaffStep, ConservationStep)
- **SHOULD**: Blindare 4 componenti P1 (DepartmentsStep, TasksStep, InventoryStep, CalendarConfigStep)
- **COULD**: Ottimizzare componenti LOCKED esistenti

### **Criteri di successo**: Confermi le metriche/acceptance criteria proposti (target numerici compresi)?
- **100% componenti onboarding** LOCKED
- **100% test coverage** per componenti critici
- **0 gap critici** identificati

### **Priorità**: Confermi le priorità P0/P1 assegnate? Qualcosa da spostare di livello?
- **P0**: Login Flow (Password Policy, CSRF Protection, Rate Limiting, Remember Me, Multi-Company)
- **P0**: OnboardingWizard, BusinessInfoStep, StaffStep, ConservationStep
- **P1**: DepartmentsStep, TasksStep, InventoryStep, CalendarConfigStep

### **Delta desideri**: C'è qualcosa che vorresti cambiare rispetto a quanto progettato (naming, API, UI, flusso)?
- **Approccio**: Testing e validazione, NON implementazione
- **Focus**: Componenti esistenti, NON nuovi componenti
- **Obiettivo**: Blindatura completa, NON sviluppo

### **Esempio concreto**: Fornisci 1 esempio reale "OK" e 1 "NO" per tarare test/UX.
- **OK**: Login Flow P0 completato con Password Policy, CSRF Protection, Rate Limiting, Remember Me, Multi-Company tutti testati e blindati
- **NO**: Saltare Login Flow P0 e implementare direttamente Onboarding P1

### **Blocco successivo**: Confermi che possiamo passare allo step successivo sulla micro‑area proposta? (Sì/No)
- **Sì**: Procedere con Login Flow P0 PRIMA di Onboarding P1
- **No**: Rivedere strategia e approccio per evitare salti di priorità
