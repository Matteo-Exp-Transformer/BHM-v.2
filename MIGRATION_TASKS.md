# 🔄 Migration Tasks - Clerk to Supabase Auth

**Branch:** NoClerk
**Start Date:** 2025-01-09
**Estimated Duration:** 10-12 giorni
**Status:** 🟡 IN PROGRESS

---

## 📋 TASK TRACKING

### ✅ COMPLETATI
- [x] Analisi architettura attuale
- [x] Design nuova architettura Supabase
- [x] Pianificazione dettagliata
- [ ] ...

### 🔄 IN CORSO
- [ ] ...

### ⏳ DA FARE
- [ ] ...

---

## 📅 FASE 1: Database Setup (Giorno 1)

### Task 1.1: Backup e Preparazione
- [ ] **1.1.1** Backup completo database Supabase
- [ ] **1.1.2** Verificare schema attuale (18 tabelle)
- [ ] **1.1.3** Creare file migration SQL
- [ ] **1.1.4** Test restore backup

**Deliverable:** `database/migrations/001_supabase_auth_setup.sql`

---

### Task 1.2: Nuove Tabelle
- [ ] **1.2.1** Creare tabella `company_members`
  ```sql
  -- Junction table user-company (N:N)
  -- Campi: user_id, company_id, role, staff_id, is_active
  ```
- [ ] **1.2.2** Creare tabella `user_sessions`
  ```sql
  -- Active company tracking
  -- Campi: user_id, active_company_id, last_activity
  ```
- [ ] **1.2.3** Creare tabella `audit_logs`
  ```sql
  -- HACCP compliance audit trail
  -- Campi: user_id, company_id, action, table_name, old_data, new_data
  ```
- [ ] **1.2.4** Creare tabella `invite_tokens`
  ```sql
  -- Email invites management
  -- Campi: token, email, company_id, role, expires_at, used_at
  ```

**Deliverable:** Tabelle create e verificate in Supabase

---

### Task 1.3: Funzioni Helper RLS
- [ ] **1.3.1** Funzione `get_active_company_id()`
- [ ] **1.3.2** Funzione `get_user_role_for_company(p_company_id uuid)`
- [ ] **1.3.3** Funzione `is_company_member(p_company_id uuid)`
- [ ] **1.3.4** Funzione `has_management_role(p_company_id uuid)`
- [ ] **1.3.5** Test funzioni in SQL Editor

**Deliverable:** `database/functions/rls_helpers.sql`

---

### Task 1.4: Indici Performance
- [ ] **1.4.1** Indici su `company_members`
- [ ] **1.4.2** Indici su `user_sessions`
- [ ] **1.4.3** Indici su `audit_logs`
- [ ] **1.4.4** Verifica execution plans

**Deliverable:** Query optimize verificate

---

### Task 1.5: RLS Policies (Preparazione)
- [ ] **1.5.1** Scrivere policies per `products`
- [ ] **1.5.2** Scrivere policies per `staff`
- [ ] **1.5.3** Scrivere policies per `departments`
- [ ] **1.5.4** Scrivere policies per tutte le 18 tabelle
- [ ] **1.5.5** **NON ATTIVARE** RLS ancora (solo preparazione)

**Deliverable:** `database/policies/rls_policies.sql`

---

## 📅 FASE 2: Supabase Auth Configuration (Giorno 2)

### Task 2.1: Auth Settings
- [ ] **2.1.1** Disabilitare registrazione pubblica
  ```
  Settings → Authentication → Email Auth
  ☑️ Enable email confirmations
  ☐ Enable sign ups (disattivare)
  ```
- [ ] **2.1.2** Configurare email templates
- [ ] **2.1.3** Configurare redirect URLs
- [ ] **2.1.4** Impostare session timeout (24h)

**Deliverable:** Supabase Auth configurato

---

### Task 2.2: Resend Email Integration
- [ ] **2.2.1** Creare account Resend (fatto da utente)
- [ ] **2.2.2** Configurare dominio email
- [ ] **2.2.3** Verificare DNS records
- [ ] **2.2.4** Ottenere API key Resend
- [ ] **2.2.5** Aggiungere a `.env`:
  ```
  VITE_RESEND_API_KEY=re_xxx
  RESEND_FROM_EMAIL=noreply@tuodominio.com
  ```

**Deliverable:** Resend configurato e testato

---

### Task 2.3: Email Templates
- [ ] **2.3.1** Template invito dipendente
  ```
  Subject: Sei stato invitato in [Nome Azienda]
  Body: Link magic link + istruzioni
  ```
- [ ] **2.3.2** Template conferma email admin
- [ ] **2.3.3** Template reset password
- [ ] **2.3.4** Template benvenuto
- [ ] **2.3.5** Test invio email

**Deliverable:** `src/services/email/templates/`

---

### Task 2.4: Invite System Service
- [ ] **2.4.1** Creare `src/services/invites/inviteService.ts`
- [ ] **2.4.2** Funzione `createInviteToken()`
- [ ] **2.4.3** Funzione `sendInviteEmail()`
- [ ] **2.4.4** Funzione `validateInviteToken()`
- [ ] **2.4.5** Funzione `acceptInvite()`

**Deliverable:** Sistema inviti completo

---

## 📅 FASE 3: Remove Clerk (Giorno 3)

### Task 3.1: Package Cleanup
- [ ] **3.1.1** Rimuovere `@clerk/clerk-react` da package.json
- [ ] **3.1.2** Eseguire `npm uninstall @clerk/clerk-react`
- [ ] **3.1.3** Verificare no altre dipendenze Clerk
- [ ] **3.1.4** Eseguire `npm install`

**Deliverable:** package.json pulito

---

### Task 3.2: Environment Variables
- [ ] **3.2.1** Rimuovere variabili Clerk da `.env`
- [ ] **3.2.2** Aggiungere variabili Supabase (già presenti)
- [ ] **3.2.3** Aggiungere variabili Resend
- [ ] **3.2.4** Aggiornare `.env.example`

**Deliverable:** `.env` aggiornato

---

### Task 3.3: Main Entry Points
- [ ] **3.3.1** Rimuovere `ClerkProvider` da `src/main.tsx`
- [ ] **3.3.2** Aggiungere Supabase session check
- [ ] **3.3.3** Rimuovere import Clerk da `src/App.tsx`
- [ ] **3.3.4** Rimuovere `SignedIn/SignedOut` components

**Deliverable:** App entry point pulito

---

## 📅 FASE 4: New useAuth Hook (Giorno 4)

### Task 4.1: Core Hook Implementation
- [ ] **4.1.1** Creare `src/hooks/useAuth.v2.ts` (temporaneo)
- [ ] **4.1.2** Implementare session listener
- [ ] **4.1.3** Implementare `signIn(email, password)`
- [ ] **4.1.4** Implementare `signUp(email, password, metadata)`
- [ ] **4.1.5** Implementare `signOut()`
- [ ] **4.1.6** Test funzioni auth base

**Deliverable:** useAuth v2 funzionante

---

### Task 4.2: Multi-Company Logic
- [ ] **4.2.1** Query `company_members` per utente
- [ ] **4.2.2** Query `user_sessions` per active company
- [ ] **4.2.3** Implementare `switchCompany(companyId)`
- [ ] **4.2.4** Gestire caso 0 companies (access denied)
- [ ] **4.2.5** Gestire caso 1 company (auto-select)
- [ ] **4.2.6** Gestire caso N companies (switcher)

**Deliverable:** Multi-company funzionante

---

### Task 4.3: Permissions System
- [ ] **4.3.1** Implementare `hasManagementRole()`
- [ ] **4.3.2** Implementare oggetto `permissions`
- [ ] **4.3.3** Implementare `canManageStaff`, `canExportData`, etc.
- [ ] **4.3.4** Test permissions per ruolo

**Deliverable:** Sistema permessi completo

---

### Task 4.4: Replace Old Hook
- [ ] **4.4.1** Rinominare `useAuth.ts` → `useAuth.clerk.backup.ts`
- [ ] **4.4.2** Rinominare `useAuth.v2.ts` → `useAuth.ts`
- [ ] **4.4.3** Verificare export compatibile
- [ ] **4.4.4** Test import in un componente

**Deliverable:** Hook sostituito

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

**Last Updated:** 2025-01-09
**Next Review:** Daily durante sviluppo
