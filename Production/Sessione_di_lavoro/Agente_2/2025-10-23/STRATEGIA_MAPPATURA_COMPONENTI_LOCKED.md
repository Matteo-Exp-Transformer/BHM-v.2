# 🔒 STRATEGIA MAPPATURA COMPONENTI LOCKED - BLINDATURA COMPLETA

**Data**: 2025-10-23  
**Sessione**: Implementazione 22 Decisioni + Mappatura Componenti LOCKED  
**Agente**: Agente 2 - Systems Blueprint Architect  
**Status**: ✅ **STRATEGIA AGGIORNATA**  

---

## 🚨 IMPORTANTE: COMPONENTI LOCKED VANNO MAPPATI DA ZERO

**Obiettivo**: Anche i componenti LOCKED devono essere mappati e testati da zero per garantire blindatura completa e sistematica.

**Motivazione**: 
- I componenti LOCKED potrebbero avere test coverage incompleto
- Potrebbero esserci gap tra documentazione e implementazione reale
- La blindatura richiede validazione completa di tutti i componenti

---

## 📊 COMPONENTI LOCKED IDENTIFICATI (DA REAL_DATA_FOR_SESSION.md)

### **🔐 AUTENTICAZIONE - COMPONENTI LOCKED**
| Componente | File Reale | Status LOCKED | Test Coverage Attuale | Azione Richiesta |
|------------|------------|---------------|----------------------|------------------|
| **LoginPage** | `src/features/auth/LoginPage.tsx` | 🔒 LOCKED (2025-01-16) | 74% (23/31 test) | **Mappare e testare da zero** |
| **RegisterPage** | `src/features/auth/RegisterPage.tsx` | 🔒 LOCKED (2025-01-16) | 80% (24/30 test) | **Mappare e testare da zero** |
| **ForgotPasswordPage** | `src/features/auth/ForgotPasswordPage.tsx` | 🔒 LOCKED (2025-01-16) | 62% (21/34 test) | **Mappare e testare da zero** |
| **useAuth Hook** | `src/hooks/useAuth.ts` | 🔒 LOCKED (2025-01-16) | 100% (26/26 test) | **Mappare e testare da zero** |
| **OnboardingGuard** | `src/components/OnboardingGuard.tsx` | 🔒 LOCKED (2025-01-16) | ✅ Test verificati | **Mappare e testare da zero** |

### **🎯 ONBOARDING - COMPONENTI NON LOCKED (DA MAPPARE)**
| Componente | File Reale | Status | Test Coverage | Azione Richiesta |
|------------|------------|--------|---------------|------------------|
| **OnboardingWizard** | `src/components/OnboardingWizard.tsx` | ⚠️ NON LOCKED | ❓ Da valutare | **Mappare, testare e blindare** |
| **BusinessInfoStep** | `src/components/onboarding-steps/BusinessInfoStep.tsx` | ⚠️ NON LOCKED | ❓ Da valutare | **Mappare, testare e blindare** |
| **DepartmentsStep** | `src/components/onboarding-steps/DepartmentsStep.tsx` | ⚠️ NON LOCKED | ❓ Da valutare | **Mappare, testare e blindare** |
| **StaffStep** | `src/components/onboarding-steps/StaffStep.tsx` | ⚠️ NON LOCKED | ❓ Da valutare | **Mappare, testare e blindare** |
| **ConservationStep** | `src/components/onboarding-steps/ConservationStep.tsx` | ⚠️ NON LOCKED | ❓ Da valutare | **Mappare, testare e blindare** |
| **TasksStep** | `src/components/onboarding-steps/TasksStep.tsx` | ⚠️ NON LOCKED | ❓ Da valutare | **Mappare, testare da zero** |
| **InventoryStep** | `src/components/onboarding-steps/InventoryStep.tsx` | ⚠️ NON LOCKED | ❓ Da valutare | **Mappare, testare e blindare** |
| **CalendarConfigStep** | `src/components/onboarding-steps/CalendarConfigStep.tsx` | ⚠️ NON LOCKED | ❓ Da valutare | **Mappare, testare e blindare** |

---

## 🎯 STRATEGIA MAPPATURA COMPLETA

### **📋 FASE 1: MAPPATURA COMPONENTI LOCKED**
**Obiettivo**: Mappare e testare da zero tutti i componenti LOCKED

#### **🔐 AUTENTICAZIONE - MAPPATURA LOCKED**
1. **LoginPage.tsx** - Mappare da zero
   - Analizzare codice reale
   - Verificare test coverage reale
   - Identificare gap tra documentazione e realtà
   - Testare funzionalità complete
   - Aggiornare documentazione

2. **RegisterPage.tsx** - Mappare da zero
   - Analizzare codice reale
   - Verificare test coverage reale
   - Identificare gap tra documentazione e realtà
   - Testare funzionalità complete
   - Aggiornare documentazione

3. **ForgotPasswordPage.tsx** - Mappare da zero
   - Analizzare codice reale
   - Verificare test coverage reale
   - Identificare gap tra documentazione e realtà
   - Testare funzionalità complete
   - Aggiornare documentazione

4. **useAuth Hook** - Mappare da zero
   - Analizzare codice reale
   - Verificare test coverage reale
   - Identificare gap tra documentazione e realtà
   - Testare funzionalità complete
   - Aggiornare documentazione

5. **OnboardingGuard.tsx** - Mappare da zero
   - Analizzare codice reale
   - Verificare test coverage reale
   - Identificare gap tra documentazione e realtà
   - Testare funzionalità complete
   - Aggiornare documentazione

### **📋 FASE 2: MAPPATURA COMPONENTI NON LOCKED**
**Obiettivo**: Mappare, testare e blindare tutti i componenti NON LOCKED

#### **🎯 ONBOARDING - MAPPATURA E BLINDATURA**
1. **OnboardingWizard.tsx** - Mappare, testare e blindare
2. **BusinessInfoStep.tsx** - Mappare, testare e blindare
3. **DepartmentsStep.tsx** - Mappare, testare e blindare
4. **StaffStep.tsx** - Mappare, testare e blindare
5. **ConservationStep.tsx** - Mappare, testare e blindare
6. **TasksStep.tsx** - Mappare, testare e blindare
7. **InventoryStep.tsx** - Mappare, testare e blindare
8. **CalendarConfigStep.tsx** - Mappare, testare e blindare

---

## 🔄 AGGIORNAMENTO COORDINAMENTO MULTI-AGENT

### **🔴 AGENTE 2A - PRIORITÀ CRITICHE (AGGIORNATO)**
**Responsabilità**:
- 🎯 **Password Policy**: Aggiornare regex in authSchemas.ts
- 🎯 **CSRF Token**: Modificare useCsrfToken hook per fetch al page load
- 🎯 **Remember Me**: Implementare backend + frontend (30 giorni)
- 🔒 **Mappatura LoginPage**: Mappare e testare da zero
- 🔒 **Mappatura RegisterPage**: Mappare e testare da zero

### **🟡 AGENTE 2B - PRIORITÀ ALTE (AGGIORNATO)**
**Responsabilità**:
- 🎯 **Rate Limiting**: Escalation progressiva backend
- 🎯 **Multi-Company**: Creare tabella user_preferences
- 🎯 **Activity Tracking**: Modificare intervallo a 3 minuti
- 🔒 **Mappatura useAuth Hook**: Mappare e testare da zero
- 🔒 **Mappatura OnboardingGuard**: Mappare e testare da zero

### **🟢 AGENTE 2C - PRIORITÀ MEDIE (AGGIORNATO)**
**Responsabilità**:
- 🎯 **Audit Log Scope**: Estendere eventi loggati
- 🎯 **Token Scadenze**: Configurare scadenze specifiche
- 🎯 **UI Improvements**: Migliorare accessibilità password toggle
- 🔒 **Mappatura ForgotPasswordPage**: Mappare e testare da zero
- 🔒 **Mappatura OnboardingWizard**: Mappare, testare e blindare

### **🟣 AGENTE 2D - MAPPATURA ONBOARDING (NUOVO)**
**Responsabilità**:
- 🔒 **BusinessInfoStep**: Mappare, testare e blindare
- 🔒 **DepartmentsStep**: Mappare, testare e blindare
- 🔒 **StaffStep**: Mappare, testare e blindare
- 🔒 **ConservationStep**: Mappare, testare e blindare
- 🔒 **TasksStep**: Mappare, testare e blindare
- 🔒 **InventoryStep**: Mappare, testare e blindare
- 🔒 **CalendarConfigStep**: Mappare, testare e blindare

---

## 📊 TEMPLATE MAPPATURA COMPONENTI

### **🔒 TEMPLATE MAPPATURA COMPONENTE LOCKED**
```markdown
# MAPPATURA COMPONENTE LOCKED - [NOME_COMPONENTE]

**Componente**: [Nome componente]
**File**: [Percorso file]
**Status**: 🔒 LOCKED
**Data Lock**: [Data lock]
**Agente**: [2A/2B/2C/2D]

## 📋 ANALISI CODICE REALE
- **Linee di codice**: [Numero linee]
- **Funzioni**: [Lista funzioni]
- **Props**: [Lista props]
- **Hooks utilizzati**: [Lista hooks]
- **Dipendenze**: [Lista dipendenze]

## 🧪 ANALISI TEST COVERAGE REALE
- **Test esistenti**: [Numero test]
- **Test passati**: [Numero test passati]
- **Test falliti**: [Numero test falliti]
- **Coverage reale**: [Percentuale coverage]
- **Gap identificati**: [Lista gap]

## 🔍 VERIFICA GAP DOCUMENTAZIONE vs REALTÀ
- **Documentazione esistente**: [Status documentazione]
- **Gap identificati**: [Lista gap]
- **Discrepanze**: [Lista discrepanze]
- **Azioni correttive**: [Lista azioni]

## ✅ TEST FUNZIONALITÀ COMPLETE
- **Test funzionali**: [Risultati test]
- **Test edge cases**: [Risultati test]
- **Test integrazione**: [Risultati test]
- **Test performance**: [Risultati test]

## 📚 AGGIORNAMENTO DOCUMENTAZIONE
- **File aggiornati**: [Lista file]
- **Contenuto aggiornato**: [Descrizione aggiornamenti]
- **Test coverage aggiornato**: [Nuova percentuale]
- **Status finale**: [LOCKED/UNLOCKED/DA_VALUTARE]
```

---

## 🎯 PRIORITÀ MAPPATURA AGGIORNATA

### **🔴 PRIORITÀ CRITICA (Mappatura Immediata)**
1. **LoginPage.tsx** - Componente critico per autenticazione
2. **useAuth Hook** - Hook critico per gestione autenticazione
3. **OnboardingWizard.tsx** - Wizard principale onboarding

### **🟡 PRIORITÀ ALTA (Mappatura Breve Termine)**
1. **RegisterPage.tsx** - Registrazione utenti
2. **ForgotPasswordPage.tsx** - Recupero password
3. **OnboardingGuard.tsx** - Guard per onboarding
4. **BusinessInfoStep.tsx** - Step critico onboarding
5. **StaffStep.tsx** - Gestione personale

### **🟢 PRIORITÀ MEDIA (Mappatura Prossimo Sprint)**
1. **DepartmentsStep.tsx** - Organizzazione aziendale
2. **ConservationStep.tsx** - Logica HACCP
3. **TasksStep.tsx** - Gestione attività
4. **InventoryStep.tsx** - Gestione prodotti
5. **CalendarConfigStep.tsx** - Configurazione calendario

---

## 📋 CHECKLIST MAPPATURA COMPLETA

### **✅ PRE-MAPPATURA**
- [ ] Componente identificato
- [ ] File reale localizzato
- [ ] Test esistenti identificati
- [ ] Documentazione esistente verificata
- [ ] Piano mappatura preparato

### **✅ DURANTE MAPPATURA**
- [ ] Codice reale analizzato
- [ ] Test coverage verificato
- [ ] Gap identificati
- [ ] Test funzionalità eseguiti
- [ ] Documentazione aggiornata

### **✅ POST-MAPPATURA**
- [ ] Mappatura completata
- [ ] Test coverage aggiornato
- [ ] Documentazione finalizzata
- [ ] Status componente aggiornato
- [ ] Handoff preparato

---

## 🚀 PROSSIMI STEP AGGIORNATI

### **🚀 IMMEDIATI**
1. **Aggiornare coordinamento** con mappatura componenti LOCKED
2. **Attivare Agente 2A** per priorità critiche + mappatura LoginPage/RegisterPage
3. **Attivare Agente 2B** per priorità alte + mappatura useAuth/OnboardingGuard
4. **Attivare Agente 2C** per priorità medie + mappatura ForgotPasswordPage/OnboardingWizard
5. **Attivare Agente 2D** per mappatura componenti onboarding

### **📋 BREVE TERMINE**
1. **Mappare tutti i componenti LOCKED** da zero
2. **Testare tutti i componenti** per verificare coverage reale
3. **Aggiornare documentazione** con mappatura completa
4. **Blindare componenti** non LOCKED identificati

---

**Status**: ✅ **STRATEGIA MAPPATURA AGGIORNATA**  
**Prossimo**: Aggiornamento coordinamento multi-agent con mappatura componenti LOCKED

**Firma**: Agente 2 - Systems Blueprint Architect  
**Data**: 2025-10-23  
**Status**: Strategia mappatura componenti LOCKED aggiornata
