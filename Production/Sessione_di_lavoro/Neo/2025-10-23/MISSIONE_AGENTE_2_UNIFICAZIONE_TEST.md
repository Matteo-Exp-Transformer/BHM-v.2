# 🎯 MISSIONE AGENTE 2 - UNIFICAZIONE TEST

**Data**: 2025-10-23  
**Agente**: Agente 8 - Documentation Specialist  
**Destinatario**: Agente 2 - Systems Blueprint Architect  
**Obiettivo**: Unificare test esistenti e creare struttura ottimizzata

---

## 📋 MISSIONE COMPLETA

### **🔍 PROBLEMA IDENTIFICATO**
- ✅ **Diagnosi corretta**: Configurazione Playwright OK, utilizzo Agente 2 sbagliato
- ✅ **Soluzione implementata**: Prompt/skill Agente 2 corretti

### **🎯 NUOVA MISSIONE**
1. **Creare struttura cartelle test ottimizzata** in `tests/` (cartella corretta Playwright)
2. **Organizzare test per macrocategorie** → componenti specifici
3. **Unificare test esistenti** da `Production/Test/` e `tests/`
4. **Ripulire test obsoleti** e mantenere solo quelli funzionanti
5. **Permettere ad Agente 2** di capire quali test sono validi

---

## 🏗️ STRUTTURA CARTELLE TEST OTTIMIZZATA

### **📂 STRUTTURA PROPOSTA**
```
tests/
├── auth/                          # Autenticazione
│   ├── login/                     # Login specifico
│   │   ├── LoginPage.spec.ts      # Test pagina login
│   │   ├── LoginForm.spec.ts      # Test form login
│   │   └── useAuth.spec.ts        # Test hook auth
│   ├── register/                  # Registrazione
│   │   ├── RegisterPage.spec.ts   # Test pagina registrazione
│   │   └── RegisterForm.spec.ts   # Test form registrazione
│   ├── forgot-password/           # Password dimenticata
│   │   ├── ForgotPasswordPage.spec.ts
│   │   └── ForgotPasswordForm.spec.ts
│   ├── invite/                    # Inviti
│   │   ├── AcceptInvitePage.spec.ts
│   │   └── AcceptInviteForm.spec.ts
│   └── callback/                  # Callback auth
│       └── AuthCallbackPage.spec.ts
├── onboarding/                    # Onboarding
│   ├── wizard/                    # Wizard completo
│   │   ├── OnboardingWizard.spec.ts
│   │   └── CompleteFlow.spec.ts
│   ├── steps/                     # Step singoli
│   │   ├── BusinessInfoStep.spec.ts
│   │   ├── DepartmentsStep.spec.ts
│   │   ├── StaffStep.spec.ts
│   │   ├── ConservationStep.spec.ts
│   │   ├── TasksStep.spec.ts
│   │   ├── InventoryStep.spec.ts
│   │   └── CalendarConfigStep.spec.ts
│   └── utils/                     # Utility onboarding
│       └── OnboardingUtils.spec.ts
├── calendar/                      # Calendario
│   ├── CalendarPage.spec.ts       # Test pagina calendario
│   ├── EventCreation.spec.ts      # Test creazione eventi
│   ├── EventManagement.spec.ts    # Test gestione eventi
│   ├── Filters.spec.ts            # Test filtri calendario
│   └── DragDrop.spec.ts           # Test drag & drop
├── dashboard/                     # Dashboard
│   ├── DashboardPage.spec.ts      # Test pagina dashboard
│   ├── KPICards.spec.ts           # Test KPI cards
│   └── Statistics.spec.ts         # Test statistiche
├── inventory/                     # Inventario
│   ├── InventoryPage.spec.ts      # Test pagina inventario
│   ├── CategoryForm.spec.ts       # Test form categorie
│   └── ProductForm.spec.ts        # Test form prodotti
├── conservation/                  # Conservazione
│   ├── ConservationPage.spec.ts   # Test pagina conservazione
│   ├── ConservationPointForm.spec.ts
│   └── TemperatureValidation.spec.ts
├── staff/                         # Staff
│   ├── StaffPage.spec.ts          # Test pagina staff
│   └── StaffForm.spec.ts          # Test form staff
├── shopping/                      # Liste spesa
│   ├── ShoppingListPage.spec.ts   # Test pagina liste spesa
│   └── ShoppingListCard.spec.ts   # Test card liste spesa
├── ui-components/                 # Componenti UI
│   ├── Button.spec.ts             # Test button
│   ├── Input.spec.ts              # Test input
│   ├── Form.spec.ts               # Test form
│   ├── Modal.spec.ts              # Test modal
│   ├── Card.spec.ts               # Test card
│   ├── Table.spec.ts              # Test table
│   └── Select.spec.ts             # Test select
├── navigation/                    # Navigazione
│   ├── App.spec.ts                # Test app principale
│   ├── MainLayout.spec.ts         # Test layout principale
│   ├── ProtectedRoute.spec.ts     # Test route protette
│   ├── CompanySwitcher.spec.ts    # Test cambio azienda
│   └── HeaderButtons.spec.ts      # Test bottoni header
├── business-logic/                # Logiche business
│   ├── HACCPRules.spec.ts         # Test regole HACCP
│   ├── MultiTenantLogic.spec.ts   # Test logica multi-tenant
│   ├── PermissionLogic.spec.ts    # Test logica permessi
│   ├── TemperatureValidation.spec.ts
│   └── CategoryConstraints.spec.ts
├── fixtures/                      # Dati di test
│   ├── auth-users.json            # Utenti di test
│   ├── business-data.json         # Dati aziendali
│   └── test-data.json             # Dati generici
├── utils/                         # Utility test
│   ├── test-helpers.ts            # Helper per test
│   ├── mock-data.ts               # Dati mock
│   └── assertions.ts              # Assertions custom
└── README.md                      # Documentazione test
```

---

## 📊 MAPPATURA TEST ESISTENTI

### **🔐 AUTENTICAZIONE**
**Da `Production/Test/Autenticazione/`:**
- `LoginPage/test-funzionale.spec.js` → `tests/auth/login/LoginPage.spec.ts`
- `LoginForm/test-funzionale.spec.cjs` → `tests/auth/login/LoginForm.spec.ts`
- `useAuth/test-funzionale.js` → `tests/auth/login/useAuth.spec.ts`
- `RegisterPage/test-funzionale.js` → `tests/auth/register/RegisterPage.spec.ts`
- `RegisterForm/test-funzionale.spec.cjs` → `tests/auth/register/RegisterForm.spec.ts`
- `ForgotPasswordPage/test-funzionale.js` → `tests/auth/forgot-password/ForgotPasswordPage.spec.ts`
- `ForgotPasswordForm/test-funzionale.spec.cjs` → `tests/auth/forgot-password/ForgotPasswordForm.spec.ts`
- `AcceptInvitePage/test-funzionale.js` → `tests/auth/invite/AcceptInvitePage.spec.ts`
- `AcceptInviteForm/test-funzionale.spec.cjs` → `tests/auth/invite/AcceptInviteForm.spec.ts`
- `AuthCallbackPage/test-funzionale.js` → `tests/auth/callback/AuthCallbackPage.spec.ts`

**Da `tests/`:**
- `login-real-credentials-fixed.spec.ts` → `tests/auth/login/LoginRealCredentials.spec.ts`
- `login-auth-hardening-corrected.spec.ts` → `tests/auth/login/LoginHardening.spec.ts`

### **🚀 ONBOARDING**
**Da `Production/Test/Onboarding/`:**
- `OnboardingWizard/test-funzionale.js` → `tests/onboarding/wizard/OnboardingWizard.spec.ts`
- `BusinessInfoStep/test-funzionale.js` → `tests/onboarding/steps/BusinessInfoStep.spec.ts`
- `DepartmentsStep/test-funzionale.js` → `tests/onboarding/steps/DepartmentsStep.spec.ts`
- `StaffStep/test-funzionale.js` → `tests/onboarding/steps/StaffStep.spec.ts`
- `ConservationStep/test-funzionale.js` → `tests/onboarding/steps/ConservationStep.spec.ts`
- `TasksStep/test-funzionale.js` → `tests/onboarding/steps/TasksStep.spec.ts`
- `InventoryStep/test-funzionale.js` → `tests/onboarding/steps/InventoryStep.spec.ts`
- `CalendarConfigStep/test-funzionale.js` → `tests/onboarding/steps/CalendarConfigStep.spec.ts`

**Da `tests/`:**
- `onboarding-complete.spec.ts` → `tests/onboarding/wizard/CompleteFlow.spec.ts`
- `onboarding-completo-funzionante.spec.ts` → `tests/onboarding/wizard/CompleteFlowWorking.spec.ts`
- `onboarding_full_flow.test.tsx` → `tests/onboarding/wizard/FullFlow.spec.ts`

### **📅 CALENDARIO**
**Da `Production/Test/Calendario/`:**
- `CalendarConfig/test-funzionale.js` → `tests/calendar/CalendarConfig.spec.ts`
- `EventCreation/test-funzionale.js` → `tests/calendar/EventCreation.spec.ts`
- `InserimentoEventi/test-funzionale.js` → `tests/calendar/EventManagement.spec.ts`

**Da `tests/`:**
- `calendar-basic-test.spec.ts` → `tests/calendar/BasicTest.spec.ts`
- `calendar-filters-test.spec.ts` → `tests/calendar/Filters.spec.ts`
- `calendar-final-working-test.spec.ts` → `tests/calendar/WorkingTest.spec.ts`

### **🎛️ UI COMPONENTS**
**Da `Production/Test/UI-Base/`:**
- `Button/test-funzionale.js` → `tests/ui-components/Button.spec.ts`
- `Input/test-funzionale.js` → `tests/ui-components/Input.spec.ts`
- `Form/test-funzionale.js` → `tests/ui-components/Form.spec.ts`
- `Modal/test-funzionale.js` → `tests/ui-components/Modal.spec.ts`
- `Card/test-funzionale.js` → `tests/ui-components/Card.spec.ts`
- `Table/test-funzionale.js` → `tests/ui-components/Table.spec.ts`
- `Select/test-funzionale.js` → `tests/ui-components/Select.spec.ts`

### **🧭 NAVIGAZIONE**
**Da `Production/Test/Navigazione/`:**
- `App/test-funzionale.js` → `tests/navigation/App.spec.ts`
- `MainLayout/test-funzionale.js` → `tests/navigation/MainLayout.spec.ts`
- `ProtectedRoute/test-funzionale.js` → `tests/navigation/ProtectedRoute.spec.ts`
- `CompanySwitcher/test-funzionale.js` → `tests/navigation/CompanySwitcher.spec.ts`
- `HeaderButtons/test-funzionale.js` → `tests/navigation/HeaderButtons.spec.ts`

### **🏢 BUSINESS LOGIC**
**Da `Production/Test/LogicheBusiness/`:**
- `HACCPRules/test-funzionale.js` → `tests/business-logic/HACCPRules.spec.ts`
- `MultiTenantLogic/test-funzionale.js` → `tests/business-logic/MultiTenantLogic.spec.ts`
- `PermissionLogic/test-funzionale.js` → `tests/business-logic/PermissionLogic.spec.ts`
- `TemperatureValidation/test-funzionale.js` → `tests/business-logic/TemperatureValidation.spec.ts`
- `CategoryConstraints/test-funzionale.js` → `tests/business-logic/CategoryConstraints.spec.ts`

---

## 🎯 PRIORITÀ IMPLEMENTAZIONE

### **🔴 PRIORITÀ CRITICA (P0)**
1. **Autenticazione** - Login Flow P0
   - `tests/auth/login/` - Test login completi
   - `tests/auth/register/` - Test registrazione
   - `tests/auth/forgot-password/` - Test password dimenticata

### **🟡 PRIORITÀ ALTA (P1)**
2. **Onboarding** - Dopo Login Flow P0
   - `tests/onboarding/wizard/` - Test wizard completo
   - `tests/onboarding/steps/` - Test step singoli

### **🟢 PRIORITÀ MEDIA (P2)**
3. **UI Components** - Componenti base
   - `tests/ui-components/` - Test componenti UI

4. **Navigazione** - Routing e layout
   - `tests/navigation/` - Test navigazione

5. **Business Logic** - Logiche HACCP
   - `tests/business-logic/` - Test logiche business

---

## 📋 COMANDI AGENTE 2

### **🔧 CREAZIONE STRUTTURA**
```bash
# Crea struttura cartelle
mkdir -p tests/auth/{login,register,forgot-password,invite,callback}
mkdir -p tests/onboarding/{wizard,steps,utils}
mkdir -p tests/calendar
mkdir -p tests/dashboard
mkdir -p tests/inventory
mkdir -p tests/conservation
mkdir -p tests/staff
mkdir -p tests/shopping
mkdir -p tests/ui-components
mkdir -p tests/navigation
mkdir -p tests/business-logic
mkdir -p tests/fixtures
mkdir -p tests/utils
```

### **📁 SPOSTAMENTO TEST**
```bash
# Sposta test autenticazione
mv Production/Test/Autenticazione/LoginPage/test-funzionale.spec.js tests/auth/login/LoginPage.spec.ts
mv Production/Test/Autenticazione/LoginForm/test-funzionale.spec.cjs tests/auth/login/LoginForm.spec.ts
mv Production/Test/Autenticazione/useAuth/test-funzionale.js tests/auth/login/useAuth.spec.ts

# Sposta test onboarding
mv Production/Test/Onboarding/OnboardingWizard/test-funzionale.js tests/onboarding/wizard/OnboardingWizard.spec.ts
mv Production/Test/Onboarding/BusinessInfoStep/test-funzionale.js tests/onboarding/steps/BusinessInfoStep.spec.ts

# Sposta test UI
mv Production/Test/UI-Base/Button/test-funzionale.js tests/ui-components/Button.spec.ts
mv Production/Test/UI-Base/Input/test-funzionale.js tests/ui-components/Input.spec.ts
```

### **🧪 ESECUZIONE TEST**
```bash
# Test autenticazione
npx playwright test tests/auth/login/

# Test onboarding
npx playwright test tests/onboarding/

# Test UI components
npx playwright test tests/ui-components/

# Test specifico
npx playwright test tests/auth/login/LoginPage.spec.ts
```

---

## 🎯 OBIETTIVI FINALI

### **✅ RISULTATO ATTESO**
1. **Struttura unificata** in `tests/` (cartella corretta Playwright)
2. **Test organizzati** per macrocategorie → componenti specifici
3. **Test obsoleti rimossi** e solo quelli funzionanti mantenuti
4. **Agente 2** può eseguire test con comando standard: `npx playwright test`
5. **Documentazione completa** della struttura test

### **📊 METRICHE SUCCESSO**
- ✅ **100% test** in cartella `tests/` corretta
- ✅ **0 test obsoleti** mantenuti
- ✅ **Struttura chiara** per ogni componente
- ✅ **Comandi standard** Playwright funzionanti
- ✅ **Documentazione aggiornata**

---

**Status**: ✅ **MISSIONE CHIARA E DEFINITA**  
**Prossimo**: Agente 2 implementa struttura e unifica test  
**Firma**: Agente 8 - Documentation Specialist  
**Data**: 2025-10-23
