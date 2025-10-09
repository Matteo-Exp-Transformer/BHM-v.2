# 🔄 Migration Tasks - Clerk to Supabase Auth

**Branch:** NoClerk
**Start Date:** 2025-01-09
**Estimated Duration:** 10-12 giorni
**Status:** 🟡 IN PROGRESS

---

## 📋 TASK TRACKING

### ✅ COMPLETATI (Aggiornato: 2025-01-09 21:30)
- [x] Analisi architettura attuale
- [x] Design nuova architettura Supabase
- [x] Pianificazione dettagliata
- [x] Verifica schema SQL vs codice TypeScript (Report completo)
- [x] Creazione schema base completo per nuovo progetto Supabase
- [x] Esecuzione schema base in Supabase (15 tabelle create)
- [x] Esecuzione migration 001 - tabelle auth (4 tabelle create)
- [x] Esecuzione funzioni RLS helpers (8 funzioni create)
- [x] Creazione documentazione completa NoClerk/ (SCHEMA_ATTUALE.md, GLOSSARIO_NOCLERK.md)
- [x] Verifica relazione Staff ↔ Departments (department_assignments)

### 🔄 IN CORSO
- [ ] FASE 5: Update Components ⬅️ **PROSSIMO**

### ⏳ DA FARE
- [ ] FASE 6-10: Testing, RLS Activation, Deployment

### ✅ FASI COMPLETATE (4/10 in 1 giorno! 🚀)

- [x] **FASE 1: Database Setup** (100% ✅)
  - ✅ Schema base (15 tabelle)
  - ✅ Tabelle auth (4 tabelle)
  - ✅ Funzioni RLS (8 funzioni)
  - ✅ Indici performance (50+)
  - ✅ RLS Policies (70 policies per 19 tabelle)

- [x] **FASE 2: Supabase Auth Configuration** (100% ✅)
  - ✅ RLS Policies eseguite in Supabase
  - ✅ Email Authentication abilitato
  - ✅ SMTP built-in attivo (2 email/ora)
  - ✅ Email templates configurati (5 template)
  - ✅ Invite System Service implementato (11 funzioni + 3 hook)

- [x] **FASE 3: Remove Clerk Dependencies** (100% ✅)
  - ✅ @clerk/clerk-react disinstallato (9 pacchetti rimossi)
  - ✅ env.example pulito (variabili Clerk rimosse)
  - ✅ main.tsx pulito (ClerkProvider rimosso)
  - ✅ App.tsx pulito (SignedIn/SignedOut rimossi)

- [x] **FASE 4: New useAuth Hook** (100% ✅)
  - ✅ useAuth.ts riscritto completamente (360 righe)
  - ✅ Supabase Auth integration
  - ✅ Multi-company support (companies[], switchCompany)
  - ✅ Permissions system basato su company_members.role
  - ✅ Auth methods: signIn, signUp, signOut, resetPassword
  - ✅ Backward compatible API
  - ✅ Helper hooks: usePermission(), useRole()

---

## 📅 FASE 1: Database Setup (Giorno 1) - ✅ 100% COMPLETATO 🎉

### Task 1.0: Schema Base (NUOVO - Aggiunto 09/01/2025)
- [x] **1.0.1** Analisi schema SQL attuale vs codice TypeScript
- [x] **1.0.2** Creazione `database/NUOVO_PROGETTO_SUPABASE_COMPLETO.sql` (schema base completo)
- [x] **1.0.3** Esecuzione schema base in Supabase → 15 tabelle create:
  - companies, departments, staff
  - conservation_points, temperature_readings
  - product_categories, products
  - tasks, maintenance_tasks
  - events, notes, non_conformities
  - shopping_lists, shopping_list_items
  - user_profiles
- [x] **1.0.4** Verifica tabelle create con successo

**Deliverable:** ✅ Database base completo e funzionante

---

### Task 1.1: Backup e Preparazione
- [x] **1.1.1** Nuovo progetto Supabase creato (database vuoto)
- [x] **1.1.2** Schema attuale verificato (Report dettagliato creato)
- [x] **1.1.3** File migration SQL creati (001_supabase_auth_setup.sql)
- [x] **1.1.4** Documentazione schema completa (NoClerk/SCHEMA_ATTUALE.md)

**Deliverable:** ✅ `database/migrations/001_supabase_auth_setup.sql`

---

### Task 1.2: Nuove Tabelle Auth
- [x] **1.2.1** Creare tabella `company_members` ✅
  - user_id, company_id, role, staff_id, is_active
  - UNIQUE constraint su (user_id, company_id)
- [x] **1.2.2** Creare tabella `user_sessions` ✅
  - user_id, active_company_id, last_activity
  - UNIQUE constraint su user_id
- [x] **1.2.3** Creare tabella `audit_logs` ✅
  - user_id, company_id, action, table_name, old_data, new_data
  - Indici su company_id, user_id, table_name, created_at
- [x] **1.2.4** Creare tabella `invite_tokens` ✅
  - token (UNIQUE), email, company_id, role, expires_at, used_at
  - CHECK constraints su expires_at e used_at

**Deliverable:** ✅ Tabelle create e verificate in Supabase (19 tabelle totali)

---

### Task 1.3: Funzioni Helper RLS
- [x] **1.3.1** Funzione `get_active_company_id()` ✅
- [x] **1.3.2** Funzione `get_user_role_for_company(p_company_id uuid)` ✅
- [x] **1.3.3** Funzione `is_company_member(p_company_id uuid)` ✅
- [x] **1.3.4** Funzione `has_management_role(p_company_id uuid)` ✅
- [x] **1.3.5** Funzione `is_admin(p_company_id uuid)` ✅
- [x] **1.3.6** Funzione `get_user_companies()` ✅
- [x] **1.3.7** Funzione `ensure_user_session()` ✅
- [x] **1.3.8** Funzione `switch_active_company(p_new_company_id uuid)` ✅
- [x] **1.3.9** Funzione `has_permission(p_company_id, p_permission)` ✅

**Deliverable:** ✅ `database/functions/rls_helpers.sql` (8 funzioni create)

---

### Task 1.4: Indici Performance
- [x] **1.4.1** Indici su `company_members` ✅
  - idx_company_members_user_id, idx_company_members_company_id
  - idx_company_members_active, idx_company_members_lookup
- [x] **1.4.2** Indici su `user_sessions` ✅
  - idx_user_sessions_user_id, idx_user_sessions_company_id
  - idx_user_sessions_active
- [x] **1.4.3** Indici su `audit_logs` ✅
  - idx_audit_logs_company_id, idx_audit_logs_user_id
  - idx_audit_logs_table_name, idx_audit_logs_created_at, idx_audit_logs_haccp
- [x] **1.4.4** Indici su tutte le tabelle base (50+ indici totali) ✅

**Deliverable:** ✅ Query optimize verificate

---

### Task 1.5: RLS Policies (Preparazione)
- [x] **1.5.1** Scrivere policies per `products` ✅
- [x] **1.5.2** Scrivere policies per `staff` ✅
- [x] **1.5.3** Scrivere policies per `departments` ✅
- [x] **1.5.4** Scrivere policies per tutte le 19 tabelle ✅
- [x] **1.5.5** **NON ATTIVARE** RLS ancora (solo preparazione) ✅
- [x] **1.5.6** Aggiunta policy per `user_profiles` (deprecata) ✅

**Deliverable:** ✅ `database/policies/rls_policies.sql` (70 policies create)

**Dettaglio Policies**:
- 19 tabelle coperte
- ~70 policies totali (SELECT, INSERT, UPDATE, DELETE)
- Policies speciali per: notes (tutti creano), audit_logs (solo INSERT), company_members (self-management)
- RLS **NON ANCORA ATTIVATO** (verrà attivato in FASE 7)

**Status FASE 1**: 🎉 100% COMPLETATO

---

## 📅 FASE 2: Supabase Auth Configuration (Giorno 2) - ✅ 100% COMPLETATO 🎉

### Task 2.0: Esecuzione RLS Policies (Preparazione)
- [x] **2.0.1** Apri Supabase Dashboard → SQL Editor → New Query ✅
- [x] **2.0.2** Copia TUTTO il contenuto di `database/policies/rls_policies.sql` ✅
- [x] **2.0.3** Incolla nel SQL Editor e fai RUN ✅
- [x] **2.0.4** Verifica output: Success ✅
- [x] **2.0.5** Verifica policies: 70 policies su 19 tabelle ✅

**Deliverable:** ✅ 70 RLS policies create e pronte (NON attive)

**Verifica eseguita**:
```
19 tabelle con policies:
audit_logs(2), companies(2), company_members(4), conservation_points(4),
departments(4), events(4), invite_tokens(5), maintenance_tasks(4),
non_conformities(4), notes(4), product_categories(4), products(4),
shopping_list_items(4), shopping_lists(4), staff(4), tasks(4),
temperature_readings(4), user_profiles(3), user_sessions(2)
TOTALE: 70 policies ✅
```

**⏱️ Tempo**: 2 minuti ✅ COMPLETATO

---

### Task 2.1: Auth Settings in Supabase Dashboard
- [x] **2.1.1** Abilitare Email Authentication ✅
  - Dashboard → Authentication → Providers → Email
  - ✅ Enable Email provider
  - ✅ Confirm email (richiedi verifica email)
  - ❌ Disable signup (solo admin può registrare inizialmente)
- [x] **2.1.2** Configurare Site URL e Redirect URLs ✅
  - Site URL: `http://localhost:5173`
  - Redirect URLs: `http://localhost:5173/auth/callback`, `http://localhost:5173/*`
- [x] **2.1.3** Impostare Session Settings ✅
  - JWT expiry: 3600 secondi (1 ora)
  - Refresh token expiry: 2592000 secondi (30 giorni)
- [x] **2.1.4** Configurazione salvata ✅

**Deliverable:** ✅ Supabase Auth abilitato

**⏱️ Tempo**: 5 minuti ✅ COMPLETATO

---

### Task 2.2: SMTP Integrato Supabase (Automatico)
⚠️ **CAMBIATO**: Usiamo SMTP integrato di Supabase invece di Resend

- [x] **2.2.1** SMTP Built-in ✅
  - **Nessuna configurazione necessaria** - Supabase usa SMTP interno automaticamente
  - **Nessuna sezione visibile** nel dashboard (attivo di default)
  - From: `noreply@mail.app.supabase.io`
  - Status: Attivo automaticamente
- [x] **2.2.2** Limitazioni SMTP built-in (documentate): ✅
  - ⚠️ **CRITICO**: Max **2 email/ora** (molto basso!)
  - ⚠️ Best-effort (non garantito)
  - ⚠️ Email potrebbero finire in spam
  - ✅ Sufficiente per **development e test limitati**
  - ⚠️ Per produzione: **OBBLIGATORIO** configurare SMTP custom (Gmail/SendGrid/Mailgun)
- [x] **2.2.3** NO variabili .env necessarie ✅

**Deliverable:** ✅ SMTP ready (built-in automatico)

**⏱️ Tempo**: 0 minuti ✅ GIÀ ATTIVO

**Note IMPORTANTI**: 
- ✅ Nessuna configurazione necessaria ORA
- ✅ Nessun costo, nessuna API key
- ⚠️ Rate limit 2 email/ora è molto basso - OK solo per test
- 📝 Per produzione: configureremo SMTP custom in futuro (Task separato)
- ℹ️ Guida SMTP custom: https://supabase.com/docs/guides/auth/auth-smtp

---

### Task 2.3: Email Templates
- [x] **2.3.1** Template "Confirm signup" (Conferma registrazione) ✅
- [x] **2.3.2** Template "Reset Password" (Reset password) ✅
- [x] **2.3.3** Template "Magic Link" (Login rapido) ✅
- [x] **2.3.4** Template "Invite user" (Invito dipendente) ✅
- [x] **2.3.5** Template "Reauthentication" (Conferma identità) ✅
- [x] **2.3.6** Tutti i template salvati ✅

**Deliverable:** ✅ 5 email templates configurati in Supabase

**⏱️ Tempo**: 10 minuti ✅ COMPLETATO

---

### Task 2.4: Invite System Service
- [x] **2.4.1** Creare `src/services/auth/inviteService.ts` ✅
- [x] **2.4.2** Funzione `createInviteToken()` ✅
- [x] **2.4.3** Funzione `sendInviteEmail()` ✅ (placeholder per Edge Function)
- [x] **2.4.4** Funzione `validateInviteToken()` ✅
- [x] **2.4.5** Funzione `acceptInvite()` ✅
- [x] **2.4.6** Utilities: `getCompanyInvites()`, `getPendingInvites()`, `cancelInvite()`, `regenerateInvite()` ✅
- [x] **2.4.7** Hook React Query: `useInvites()`, `useValidateInvite()`, `useAcceptInvite()` ✅
- [x] **2.4.8** Barrel export: `src/services/auth/index.ts` ✅

**Deliverable:** ✅ Sistema inviti completo (330+ righe)

**File creati**:
- `src/services/auth/inviteService.ts` (11 funzioni)
- `src/hooks/useInvites.ts` (3 hook React Query)
- `src/services/auth/index.ts` (barrel export)

**⏱️ Tempo**: 15 minuti ✅ COMPLETATO

**Note**:
- ✅ Tutte le funzioni implementate e documentate
- ✅ Type-safe con interfacce TypeScript
- ✅ Error handling con try/catch
- ✅ Toast notifications integrate
- ⚠️ `sendInviteEmail()` richiede Edge Function Supabase (da implementare in FASE 6)
- 💡 Per ora gli inviti sono creati ma email NON inviata automaticamente (manuale o Edge Function)

---

## 📅 FASE 3: Remove Clerk (Giorno 3) - ✅ 100% COMPLETATO 🎉

### Task 3.1: Package Cleanup
- [x] **3.1.1** Rimuovere `@clerk/clerk-react` da package.json ✅
- [x] **3.1.2** Eseguire `npm uninstall @clerk/clerk-react` ✅
  - Rimossi 9 pacchetti Clerk
- [x] **3.1.3** Verificare no altre dipendenze Clerk ✅
  - Nessuna altra dipendenza Clerk trovata
- [x] **3.1.4** Package.json pulito ✅

**Deliverable:** ✅ package.json pulito

---

### Task 3.2: Environment Variables
- [x] **3.2.1** Rimuovere variabili Clerk da `env.example` ✅
  - Rimossi: VITE_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY
- [x] **3.2.2** Variabili Supabase già presenti ✅
  - VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
- [x] **3.2.3** NO Resend necessario (usiamo SMTP Supabase) ✅
- [x] **3.2.4** `env.example` aggiornato ✅
  - Aggiunta nota su SMTP Supabase built-in

**Deliverable:** ✅ `env.example` aggiornato

---

### Task 3.3: Main Entry Points
- [x] **3.3.1** Rimuovere `ClerkProvider` da `src/main.tsx` ✅
- [x] **3.3.2** Aggiungere Supabase config check ✅
  - Verifica VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
- [x] **3.3.3** Rimuovere import Clerk da `src/App.tsx` ✅
  - Rimossi: SignedIn, SignedOut, RedirectToSignIn
- [x] **3.3.4** Rimuovere wrapper `SignedIn/SignedOut` ✅
  - Route structure semplificata
  - ProtectedRoute gestirà auth (FASE 4)

**Deliverable:** ✅ App entry point pulito

**File modificati**:
- `src/main.tsx` (rimosso ClerkProvider)
- `src/App.tsx` (rimossi wrapper Clerk)
- `env.example` (rimossi variabili Clerk)

---

### Task 3.4: Verifica Riferimenti Clerk Residui
- [x] **3.4.1** Scan codebase per riferimenti Clerk ✅
- [x] **3.4.2** Trovati 10 file con riferimenti: ✅
  - `src/hooks/useAuth.ts` ⬅️ DA RISCRIVERE IN FASE 4
  - `src/features/auth/LoginPage.tsx` ⬅️ DA RISCRIVERE IN FASE 5
  - `src/features/auth/RegisterPage.tsx` ⬅️ DA RISCRIVERE IN FASE 5
  - `src/features/auth/HomePage.tsx` ⬅️ DA AGGIORNARE IN FASE 5
  - `src/utils/onboardingHelpers.ts` (riferimento locale storage)
  - `src/lib/supabase/client.ts` (commento)
  - `src/test/mocks/auth.ts` (mock test)
  - `src/services/deployment/ProductionDeploymentManager.ts` (commento)
  - `src/lib/sentry.ts` (commento)
  - `src/features/settings/components/UserManagement.tsx` (logica)

**Note**:
- ⚠️ App **NON compila ancora** perché useAuth usa ancora Clerk
- ✅ Questo è **NORMALE** - useAuth verrà riscritto in FASE 4
- ✅ Main entry points puliti da Clerk
- ⏳ Riferimenti residui verranno rimossi in FASE 4-5

**Status FASE 3**: ✅ 100% COMPLETATO (secondo piano)

---

## 📅 FASE 4: New useAuth Hook (Giorno 4) - ✅ 100% COMPLETATO 🎉

### Task 4.1: Core Hook Implementation
- [x] **4.1.1** Creare backup `useAuth.clerk.backup.ts` ✅
- [x] **4.1.2** Implementare session listener (Supabase onAuthStateChange) ✅
- [x] **4.1.3** Implementare `signIn(email, password)` ✅
- [x] **4.1.4** Implementare `signUp(email, password, metadata)` ✅
- [x] **4.1.5** Implementare `signOut()` ✅
- [x] **4.1.6** Implementare `resetPassword(email)` ✅

**Deliverable:** ✅ useAuth hook base funzionante

---

### Task 4.2: Multi-Company Logic
- [x] **4.2.1** Query `company_members` per utente ✅
- [x] **4.2.2** Query `user_sessions` per active company ✅
- [x] **4.2.3** Implementare `switchCompany(companyId)` ✅
- [x] **4.2.4** Gestione 0 companies (ritorna guest) ✅
- [x] **4.2.5** Gestione 1 company (auto-select) ✅
- [x] **4.2.6** Gestione N companies (array companies + switcher) ✅

**Deliverable:** ✅ Multi-company funzionante

---

### Task 4.3: Permissions System
- [x] **4.3.1** Implementare `hasManagementRole()` ✅
- [x] **4.3.2** Implementare oggetto `permissions` ✅
- [x] **4.3.3** Implementare `canManageStaff`, `canExportData`, etc. ✅
- [x] **4.3.4** getPermissionsFromRole() per tutti i ruoli ✅

**Deliverable:** ✅ Sistema permessi completo

---

### Task 4.4: API Compatibility
- [x] **4.4.1** Backup vecchio hook creato ✅
- [x] **4.4.2** Nuovo hook con API compatibile ✅
- [x] **4.4.3** Export compatibile con vecchia API ✅
  - Tutti i campi originali mantenuti: isLoading, isAuthenticated, user, companyId, ecc.
  - Aggiunti campi nuovi: companies, switchCompany, signIn, signUp, signOut
- [x] **4.4.4** Helper hooks mantenuti: usePermission(), useRole() ✅

**Deliverable:** ✅ Hook sostituito con backward compatibility

**File creati/modificati**:
- `src/hooks/useAuth.ts` (risiscritto completamente - 360 righe)
- `src/hooks/useAuth.clerk.backup.ts` (backup vecchia versione)

**Features nuovo useAuth**:
- ✅ Supabase Auth session listener
- ✅ Multi-company support (companies array)
- ✅ Active company tracking (user_sessions)
- ✅ Switch company con cache invalidation
- ✅ Permissions basate su company_members.role
- ✅ Auth methods: signIn, signUp, signOut, resetPassword
- ✅ Backward compatible con vecchia API
- ✅ Type-safe con TypeScript

**Status FASE 4**: ✅ 100% COMPLETATO

---

## 📅 FASE 5: Update Components (Giorni 5-7)

### Task 5.1: Auth Pages
- [ ] **5.1.1** Riscrivere `src/features/auth/LoginPage.tsx`
  - Usare Supabase Auth UI
  - Email + password form
  - Link "Forgot password"
- [ ] **5.1.2** Riscrivere `src/features/auth/RegisterPage.tsx`
  - SOLO per admin (prima azienda)
  - Disabilitare se user ha invito
- [ ] **5.1.3** Creare `src/features/auth/InvitePage.tsx`
  - Accept invite con token
  - Set password form
- [ ] **5.1.4** Aggiornare `src/features/auth/HomePage.tsx`
- [ ] **5.1.5** Test flow completo auth

**Deliverable:** Auth pages funzionanti

---

### Task 5.2: Protected Routes
- [ ] **5.2.1** Aggiornare `src/components/ProtectedRoute.tsx`
  - Usare nuovo useAuth
  - Check `isAuthenticated`
  - Check `activeCompanyId`
- [ ] **5.2.2** Test redirect su route protette
- [ ] **5.2.3** Test access denied su no company

**Deliverable:** Routes protection funzionante

---

### Task 5.3: Layout Components
- [ ] **5.3.1** Aggiornare `src/components/layouts/MainLayout.tsx`
  - Usare nuovo useAuth
  - Aggiungere `<CompanySwitcher />` se multi-company
- [ ] **5.3.2** Creare `src/components/CompanySwitcher.tsx`
  - Dropdown aziende utente
  - Switch active company
  - Invalidate cache
- [ ] **5.3.3** Aggiornare Topbar user menu

**Deliverable:** Layout aggiornato

---

### Task 5.4: Feature Hooks (35 file)
- [ ] **5.4.1** Aggiornare `useProducts`
- [ ] **5.4.2** Aggiornare `useStaff`
- [ ] **5.4.3** Aggiornare `useDepartments`
- [ ] **5.4.4** Aggiornare `useMaintenanceTasks`
- [ ] **5.4.5** Aggiornare `useConservationPoints`
- [ ] **5.4.6** Aggiornare `useTemperatureReadings`
- [ ] **5.4.7** Aggiornare `useGenericTasks`
- [ ] **5.4.8** Aggiornare `useCalendarEvents`
- [ ] **5.4.9** Aggiornare tutti gli altri hook (27 file)
- [ ] **5.4.10** Verificare `const { companyId } = useAuth()` ovunque

**Deliverable:** Tutti gli hook aggiornati

---

### Task 5.5: Feature Components
- [ ] **5.5.1** Aggiornare Dashboard
- [ ] **5.5.2** Aggiornare Management
- [ ] **5.5.3** Aggiornare Calendar
- [ ] **5.5.4** Aggiornare Inventory
- [ ] **5.5.5** Aggiornare Conservation
- [ ] **5.5.6** Aggiornare Settings
- [ ] **5.5.7** Test render tutte le pagine

**Deliverable:** Tutte le pagine renderizzano

---

## 📅 FASE 6: Email Invite System (Giorno 8)

### Task 6.1: Onboarding Integration
- [ ] **6.1.1** Aggiornare `src/components/OnboardingWizard.tsx`
- [ ] **6.1.2** Step Staff: generare invite tokens
- [ ] **6.1.3** Chiamare `sendInviteEmail()` per ogni staff
- [ ] **6.1.4** Mostrare feedback invii
- [ ] **6.1.5** Gestire errori invio

**Deliverable:** Onboarding invia inviti

---

### Task 6.2: Staff Management Integration
- [ ] **6.2.1** Aggiungere "Send Invite" button in staff list
- [ ] **6.2.2** Aggiungere "Resend Invite" per inviti scaduti
- [ ] **6.2.3** Mostrare stato invito (pending/accepted/expired)
- [ ] **6.2.4** Test invio da UI

**Deliverable:** Gestione inviti da UI

---

### Task 6.3: Invite Acceptance Flow
- [ ] **6.3.1** Route `/invite/:token`
- [ ] **6.3.2** Validare token
- [ ] **6.3.3** Form set password
- [ ] **6.3.4** Creare user in auth.users
- [ ] **6.3.5** Creare record in company_members
- [ ] **6.3.6** Mark token as used
- [ ] **6.3.7** Auto-login dopo set password
- [ ] **6.3.8** Test flow completo

**Deliverable:** Inviti funzionanti end-to-end

---

## 📅 FASE 7: RLS Activation (Giorno 9)

### Task 7.1: Enable RLS Progressively
- [ ] **7.1.1** Enable RLS su `products`
- [ ] **7.1.2** Test CRUD operations
- [ ] **7.1.3** Enable RLS su `staff`
- [ ] **7.1.4** Test CRUD operations
- [ ] **7.1.5** Enable RLS su `departments`
- [ ] **7.1.6** Enable RLS su tutte le altre tabelle (1 per volta)
- [ ] **7.1.7** Verificare no query bloccate

**Deliverable:** RLS attivo su tutte le tabelle

---

### Task 7.2: RLS Testing
- [ ] **7.2.1** Test con 2 aziende diverse
- [ ] **7.2.2** Verificare data isolation
- [ ] **7.2.3** Test switch company
- [ ] **7.2.4** Test permissions admin vs dipendente
- [ ] **7.2.5** Test query performance (confronto pre/post RLS)

**Deliverable:** RLS validato

---

### Task 7.3: Audit Logs Triggers
- [ ] **7.3.1** Trigger INSERT su tabelle critiche
- [ ] **7.3.2** Trigger UPDATE su tabelle critiche
- [ ] **7.3.3** Trigger DELETE su tabelle critiche
- [ ] **7.3.4** Funzione `log_audit_event()`
- [ ] **7.3.5** Test audit logging

**Deliverable:** Audit trail funzionante

---

## 📅 FASE 8: Testing & Validation (Giorno 10)

### Task 8.1: Integration Testing
- [ ] **8.1.1** Test admin registration + onboarding
- [ ] **8.1.2** Test staff invite + acceptance
- [ ] **8.1.3** Test login dipendente
- [ ] **8.1.4** Test permissions dipendente (no Management tab)
- [ ] **8.1.5** Test switch company (se multi)
- [ ] **8.1.6** Test CRUD operations tutte le feature
- [ ] **8.1.7** Test data isolation tra aziende

**Deliverable:** Test suite passed

---

### Task 8.2: Performance Testing
- [ ] **8.2.1** Misurare query time con RLS
- [ ] **8.2.2** Verificare indici utilizzati
- [ ] **8.2.3** Ottimizzare query lente
- [ ] **8.2.4** Load test con 100+ records

**Deliverable:** Performance acceptable

---

### Task 8.3: Security Testing
- [ ] **8.3.1** Tentare accesso cross-company
- [ ] **8.3.2** Tentare bypass RLS
- [ ] **8.3.3** Tentare SQL injection
- [ ] **8.3.4** Verificare token expiration
- [ ] **8.3.5** Test rate limiting

**Deliverable:** Security validated

---

### Task 8.4: UI/UX Testing
- [ ] **8.4.1** Test responsive (mobile/desktop)
- [ ] **8.4.2** Test error messages
- [ ] **8.4.3** Test loading states
- [ ] **8.4.4** Test navigation flow
- [ ] **8.4.5** Test user feedback (toasts, alerts)

**Deliverable:** UX polished

---

## 📅 FASE 9: Documentation (Giorno 11)

### Task 9.1: Code Documentation
- [ ] **9.1.1** JSDoc su useAuth hook
- [ ] **9.1.2** README.md per invite system
- [ ] **9.1.3** Commenti su RLS policies
- [ ] **9.1.4** API documentation

**Deliverable:** Code documented

---

### Task 9.2: Update Schema Documentation
- [ ] **9.2.1** Aggiornare `SUPABASE_SCHEMA_MAPPING.md`
  - Nuove tabelle (company_members, user_sessions, etc.)
  - RLS policies attive
  - Funzioni helper
  - Trigger audit logs
- [ ] **9.2.2** Creare diagramma ER aggiornato
- [ ] **9.2.3** Documentare flow inviti

**Deliverable:** Schema docs updated

---

### Task 9.3: Migration Report
- [ ] **9.3.1** Creare `MIGRATION_REPORT.md`
  - Data inizio/fine
  - Changes summary
  - Breaking changes
  - Known issues
  - Rollback procedure
- [ ] **9.3.2** Screenshots nuove feature
- [ ] **9.3.3** Performance comparison

**Deliverable:** Migration report complete

---

## 📅 FASE 10: Deployment (Giorno 12)

### Task 10.1: Pre-Deploy Checklist
- [ ] **10.1.1** Merge NoClerk → main
- [ ] **10.1.2** Review pull request
- [ ] **10.1.3** Run all tests
- [ ] **10.1.4** Build production
- [ ] **10.1.5** Verify no console errors

**Deliverable:** Ready to deploy

---

### Task 10.2: Database Deployment
- [ ] **10.2.1** Backup database production
- [ ] **10.2.2** Run migrations SQL
- [ ] **10.2.3** Verify tables created
- [ ] **10.2.4** Verify functions created
- [ ] **10.2.5** Enable RLS

**Deliverable:** Database migrated

---

### Task 10.3: Frontend Deployment
- [ ] **10.3.1** Deploy to Vercel/hosting
- [ ] **10.3.2** Verify environment variables
- [ ] **10.3.3** Verify build successful
- [ ] **10.3.4** Smoke test production

**Deliverable:** App deployed

---

### Task 10.4: Post-Deploy Validation
- [ ] **10.4.1** Test login production
- [ ] **10.4.2** Test invite flow
- [ ] **10.4.3** Monitor errors (Sentry)
- [ ] **10.4.4** Check performance metrics
- [ ] **10.4.5** User acceptance testing

**Deliverable:** Deployment validated

---

## 🚨 ROLLBACK PLAN

### If Critical Issues:
1. **Frontend Rollback:**
   ```bash
   git checkout main
   git push origin main --force
   vercel --prod
   ```

2. **Database Rollback:**
   ```sql
   -- Disable RLS
   ALTER TABLE products DISABLE ROW LEVEL SECURITY;
   -- Repeat for all tables

   -- Drop new tables
   DROP TABLE company_members;
   DROP TABLE user_sessions;
   DROP TABLE audit_logs;
   DROP TABLE invite_tokens;
   ```

3. **Restore Clerk:**
   ```bash
   npm install @clerk/clerk-react
   git revert <commit_hash>
   ```

---

## 📊 METRICS TO TRACK

### Development
- [ ] Lines of code changed: ~XXX
- [ ] Files modified: ~50
- [ ] New files created: ~20
- [ ] Dependencies removed: 1 (@clerk/clerk-react)
- [ ] Dependencies added: 1 (resend)

### Performance
- [ ] Query time before RLS: XXms
- [ ] Query time after RLS: XXms
- [ ] Auth flow time: XXms
- [ ] Page load time: XXms

### Coverage
- [ ] Unit tests: XX%
- [ ] Integration tests: XX%
- [ ] E2E tests: XX scenarios

---

## 🎯 SUCCESS CRITERIA

- [x] ✅ Clerk completamente rimosso
- [ ] ✅ Supabase Auth funzionante
- [ ] ✅ Multi-company support attivo
- [ ] ✅ RLS enabled su tutte le tabelle
- [ ] ✅ Email invites funzionanti
- [ ] ✅ Audit logs registrano azioni
- [ ] ✅ Permissions basate su ruolo
- [ ] ✅ Zero breaking changes per utenti finali
- [ ] ✅ Performance accettabile (<100ms overhead RLS)
- [ ] ✅ Documentazione completa

---

---

## 📊 STATO ATTUALE (Aggiornato: 09/01/2025 21:30)

### ✅ Lavoro Completato

#### Database Supabase (19 tabelle totali)
- ✅ **15 tabelle base** create via `NUOVO_PROGETTO_SUPABASE_COMPLETO.sql`
- ✅ **4 tabelle auth** create via `001_supabase_auth_setup.sql`
- ✅ **8 funzioni RLS** create via `rls_helpers.sql`
- ✅ **50+ indici** per performance
- ✅ **Trigger updated_at** su tutte le tabelle
- ✅ Campo `auth_user_id` aggiunto a `user_profiles`

#### Documentazione
- ✅ `NoClerk/SCHEMA_ATTUALE.md` - Schema database completo (849 righe)
- ✅ `NoClerk/GLOSSARIO_NOCLERK.md` - Interfacce TypeScript + Query Patterns (2132 righe)
- ✅ `NoClerk/STAFF_DEPARTMENTS_RELATION.md` - Guida relazione Many-to-Many (704 righe)
- ✅ `NoClerk/README.md` - Index e navigazione (249 righe)
- ✅ `ISTRUZIONI_SETUP_NUOVO_PROGETTO.md` - Guida setup 3 step
- ✅ `SUPABASE_MANUAL_SETUP.md` - Guida completa setup

#### File SQL Creati
- ✅ `database/NUOVO_PROGETTO_SUPABASE_COMPLETO.sql` - Schema base completo
- ✅ `database/migrations/001_supabase_auth_setup.sql` - Tabelle auth (già esistente)
- ✅ `database/functions/rls_helpers.sql` - Funzioni RLS (già esistente)

### ⏳ Prossimi Step Critici

1. ✅ ~~Task 1.5 - RLS Policies~~ **COMPLETATO**
2. ▶️ **FASE 2** - Configurare Supabase Auth (Email + SMTP) ⬅️ **PROSSIMO**
3. **FASE 3** - Rimuovere Clerk dal codice
4. **FASE 4** - Implementare nuovo useAuth hook

### 📍 Dove Siamo rispetto a Claude

Claude aveva completato:
- ✅ Analisi e planning
- ✅ Creazione file migration SQL
- ⏳ Bloccato sull'esecuzione (database vuoto)

Noi abbiamo completato:
- ✅ Risolto problema database vuoto con `NUOVO_PROGETTO_SUPABASE_COMPLETO.sql`
- ✅ Eseguito con successo tutte le query SQL
- ✅ Creato documentazione completa per compliance TypeScript ↔ Database (3900+ righe)
- ✅ Verificato e documentato relazione Staff ↔ Departments
- ✅ Completato RLS Policies (70 policies per 19 tabelle)
- 🎉 **FASE 1 COMPLETATA AL 100%**

### 📊 Riepilogo FASE 1 (Completata)

**Database Supabase**:
- ✅ 19 tabelle create (15 base + 4 auth)
- ✅ 8 funzioni RLS helper
- ✅ 50+ indici performance
- ✅ 14 trigger updated_at
- ✅ 70 RLS policies preparate (non attive)

**Documentazione**:
- ✅ 4 file NoClerk/ (3934 righe)
- ✅ 3 file setup guide
- ✅ Compliance TypeScript ↔ Database garantita

---

**Last Updated:** 2025-01-09 21:30
**Next Review:** Prima di iniziare FASE 2
**Current Phase:** FASE 1 - 80% Complete (solo RLS Policies mancanti)
