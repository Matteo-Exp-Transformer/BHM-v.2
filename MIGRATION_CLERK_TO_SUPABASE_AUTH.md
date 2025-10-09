# 🔄 Migrazione da Clerk a Supabase Auth - Analisi Completa

**Data Analisi:** 2025-01-09
**Stato:** Progettazione Architetturale
**Obiettivo:** Sostituire completamente Clerk con Supabase Auth + RLS Multi-Tenant

---

## 📊 **ANALISI STATO ATTUALE**

### 1. **Implementazione Clerk (da rimuovere)**

#### File Dipendenti da Clerk:
```
✅ ANALIZZATI (6 file core):
1. src/main.tsx                    → ClerkProvider wrapper
2. src/App.tsx                     → SignedIn/SignedOut components
3. src/hooks/useAuth.ts            → useUser() da @clerk/clerk-react
4. src/features/auth/HomePage.tsx   → Clerk UI components
5. src/features/auth/LoginPage.tsx  → <SignIn /> component
6. src/features/auth/RegisterPage.tsx → <SignUp /> component

✅ HOOK useAuth USATO IN (35+ file):
- Tutti i feature hooks (calendar, inventory, conservation, management)
- Tutti i componenti protetti
- Layout e navigation
- Settings e dashboard
```

#### Dipendenze da Rimuovere:
```json
{
  "@clerk/clerk-react": "^5.20.0"  // ❌ DA ELIMINARE
}
```

---

### 2. **Database Schema Attuale**

#### Tabella user_profiles (CRITICA):
```sql
CREATE TABLE public.user_profiles (
  id uuid PRIMARY KEY,
  clerk_user_id varchar UNIQUE NOT NULL,  -- ❌ DA SOSTITUIRE
  company_id uuid REFERENCES companies(id),
  email varchar NOT NULL,
  first_name varchar,
  last_name varchar,
  staff_id uuid REFERENCES staff(id),
  role varchar DEFAULT 'guest',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### Problemi Critici:
1. ❌ **clerk_user_id** → deve diventare **auth_user_id** (Supabase Auth UUID)
2. ❌ **Relazione 1:1** con azienda → deve diventare **N:N** (multi-company)
3. ❌ **Nessuna RLS attiva** (documentata ma non implementata)
4. ❌ **Nessuna tabella audit_logs**

#### Tabelle con company_id (18 tabelle):
```
✅ TUTTE LE TABELLE HANNO company_id:
- companies
- conservation_points
- departments
- events
- maintenance_tasks
- non_conformities
- notes
- product_categories
- products
- shopping_lists
- staff
- tasks
- temperature_readings
- user_profiles

❌ MANCANTI company_id:
- shopping_list_items (eredita da shopping_lists)
```

---

## 🎯 **ARCHITETTURA TARGET - SUPABASE AUTH**

### 1. **Nuova Struttura Database**

#### A. Tabella `auth.users` (Supabase Built-in)
```sql
-- ✅ GIÀ FORNITA DA SUPABASE AUTH
-- Non serve crearla, gestita automaticamente

auth.users (
  id uuid PRIMARY KEY,           -- User ID Supabase
  email varchar UNIQUE,
  encrypted_password varchar,
  email_confirmed_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz,
  raw_user_meta_data jsonb,    -- first_name, last_name, etc.
  raw_app_meta_data jsonb       -- ruoli custom
)
```

#### B. Tabella `company_members` (NUOVA - Junction Table)
```sql
CREATE TABLE public.company_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  role varchar NOT NULL CHECK (role IN ('admin', 'responsabile', 'dipendente', 'collaboratore')),
  staff_id uuid REFERENCES staff(id) ON DELETE SET NULL,
  is_active boolean DEFAULT true,
  joined_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(user_id, company_id)  -- Un utente può avere 1 solo ruolo per azienda
);

-- Indici per performance
CREATE INDEX idx_company_members_user_id ON company_members(user_id);
CREATE INDEX idx_company_members_company_id ON company_members(company_id);
CREATE INDEX idx_company_members_active ON company_members(is_active) WHERE is_active = true;
```

#### C. Tabella `user_sessions` (NUOVA - Active Company Tracking)
```sql
CREATE TABLE public.user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  active_company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  last_activity timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(user_id)  -- Un utente ha una sola sessione attiva
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_company_id ON user_sessions(active_company_id);
```

#### D. Tabella `audit_logs` (NUOVA - Compliance HACCP)
```sql
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  company_id uuid NOT NULL REFERENCES companies(id),
  table_name varchar NOT NULL,
  record_id uuid NOT NULL,
  action varchar NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'COMPLETE')),
  old_data jsonb,
  new_data jsonb,
  user_role varchar,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Indici per query audit
CREATE INDEX idx_audit_logs_company_id ON audit_logs(company_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
```

#### E. Modifiche a `user_profiles` (DEPRECATA → company_members)
```sql
-- ❌ OPZIONE 1: Eliminare completamente (CONSIGLIATO)
DROP TABLE user_profiles CASCADE;

-- ✅ OPZIONE 2: Migrare dati e rinominare (RETROCOMPATIBILITÀ)
ALTER TABLE user_profiles RENAME TO user_profiles_old;
-- Poi migrare dati manualmente a company_members
```

---

### 2. **Row-Level Security (RLS) Policies**

#### A. Funzioni Helper
```sql
-- Ottieni company_id attiva dell'utente corrente
CREATE OR REPLACE FUNCTION get_active_company_id()
RETURNS uuid AS $$
  SELECT active_company_id
  FROM user_sessions
  WHERE user_id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;

-- Ottieni ruolo utente per azienda attiva
CREATE OR REPLACE FUNCTION get_user_role_for_company(p_company_id uuid)
RETURNS varchar AS $$
  SELECT role
  FROM company_members
  WHERE user_id = auth.uid()
    AND company_id = p_company_id
    AND is_active = true
$$ LANGUAGE SQL SECURITY DEFINER;

-- Verifica se utente è membro azienda
CREATE OR REPLACE FUNCTION is_company_member(p_company_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS(
    SELECT 1 FROM company_members
    WHERE user_id = auth.uid()
      AND company_id = p_company_id
      AND is_active = true
  )
$$ LANGUAGE SQL SECURITY DEFINER;

-- Verifica se utente ha ruolo admin/responsabile
CREATE OR REPLACE FUNCTION has_management_role(p_company_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS(
    SELECT 1 FROM company_members
    WHERE user_id = auth.uid()
      AND company_id = p_company_id
      AND role IN ('admin', 'responsabile')
      AND is_active = true
  )
$$ LANGUAGE SQL SECURITY DEFINER;
```

#### B. Policy Template (applicare a TUTTE le tabelle con company_id)
```sql
-- ESEMPIO: products table

-- 1. Abilita RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 2. Policy SELECT (tutti i membri vedono dati azienda)
CREATE POLICY "Users can view company products"
  ON products FOR SELECT
  USING (is_company_member(company_id));

-- 3. Policy INSERT (solo admin/responsabile)
CREATE POLICY "Admins can create products"
  ON products FOR INSERT
  WITH CHECK (has_management_role(company_id));

-- 4. Policy UPDATE (solo admin/responsabile)
CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
  USING (has_management_role(company_id))
  WITH CHECK (has_management_role(company_id));

-- 5. Policy DELETE (solo admin/responsabile)
CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  USING (has_management_role(company_id));
```

#### C. Policy Speciali per notes/messaggi
```sql
-- notes: tutti possono creare, solo admin possono modificare/eliminare

CREATE POLICY "Members can create notes"
  ON notes FOR INSERT
  WITH CHECK (is_company_member(company_id));

CREATE POLICY "Members can view notes"
  ON notes FOR SELECT
  USING (is_company_member(company_id));

CREATE POLICY "Only admins can update notes"
  ON notes FOR UPDATE
  USING (has_management_role(company_id));

CREATE POLICY "Only admins can delete notes"
  ON notes FOR DELETE
  USING (has_management_role(company_id));
```

---

### 3. **Nuovo Hook useAuth**

```typescript
// src/hooks/useAuth.ts (RISCRITTO COMPLETAMENTE)

import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export type UserRole = 'admin' | 'responsabile' | 'dipendente' | 'collaboratore'

interface CompanyMembership {
  company_id: string
  company_name: string
  role: UserRole
  staff_id: string | null
  is_active: boolean
}

interface UserSession {
  user_id: string
  active_company_id: string | null
}

export const useAuth = () => {
  const queryClient = useQueryClient()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 1. Auth State Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // 2. Fetch User Companies
  const { data: companies = [], isLoading: companiesLoading } = useQuery({
    queryKey: ['user-companies', user?.id],
    queryFn: async (): Promise<CompanyMembership[]> => {
      if (!user?.id) return []

      const { data, error } = await supabase
        .from('company_members')
        .select(`
          company_id,
          role,
          staff_id,
          is_active,
          companies (
            id,
            name
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)

      if (error) throw error

      return data.map(m => ({
        company_id: m.company_id,
        company_name: m.companies.name,
        role: m.role,
        staff_id: m.staff_id,
        is_active: m.is_active
      }))
    },
    enabled: !!user?.id,
  })

  // 3. Fetch/Create User Session
  const { data: session } = useQuery({
    queryKey: ['user-session', user?.id],
    queryFn: async (): Promise<UserSession | null> => {
      if (!user?.id) return null

      let { data: existing, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      if (!existing) {
        const { data: newSession, error: createError } = await supabase
          .from('user_sessions')
          .insert({
            user_id: user.id,
            active_company_id: companies[0]?.company_id || null
          })
          .select()
          .single()

        if (createError) throw createError
        return newSession
      }

      return existing
    },
    enabled: !!user?.id && companies.length > 0,
  })

  // 4. Switch Active Company
  const switchCompanyMutation = useMutation({
    mutationFn: async (companyId: string) => {
      if (!user?.id) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('user_sessions')
        .update({ active_company_id: companyId, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-session'] })
      queryClient.invalidateQueries() // Invalida tutte le query per ricaricare dati nuova company
    },
  })

  // 5. Get Current Company Membership
  const currentMembership = companies.find(
    c => c.company_id === session?.active_company_id
  )

  // 6. Permissions
  const hasManagementRole = currentMembership?.role === 'admin' ||
                            currentMembership?.role === 'responsabile'

  const permissions = {
    canManageStaff: hasManagementRole,
    canManageDepartments: hasManagementRole,
    canViewAllTasks: hasManagementRole,
    canManageConservation: hasManagementRole,
    canExportData: currentMembership?.role === 'admin',
    canManageSettings: currentMembership?.role === 'admin',
  }

  // 7. Auth Methods
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    queryClient.clear()
  }

  return {
    // Auth State
    user,
    isLoading: isLoading || companiesLoading,
    isAuthenticated: !!user,

    // Company Management
    companies,
    activeCompanyId: session?.active_company_id || null,
    currentMembership,
    switchCompany: switchCompanyMutation.mutate,
    isSwitchingCompany: switchCompanyMutation.isPending,

    // Permissions
    userRole: currentMembership?.role || null,
    permissions,
    hasManagementRole,

    // Auth Methods
    signIn,
    signUp,
    signOut,

    // Legacy compatibility
    companyId: session?.active_company_id || null,
    userId: user?.id || null,
    displayName: user?.user_metadata?.full_name || user?.email || 'User',
  }
}
```

---

## ⚠️ **RISCHI E SFIDE CRITICHE**

### 1. **Rischi Architetturali**

#### 🔴 **CRITICO - Breaking Changes:**
- ❌ **Tutti i 35+ file** che usano `useAuth` devono essere aggiornati
- ❌ **Nessuna retrocompatibilità** con dati Clerk esistenti
- ❌ **user_profiles.clerk_user_id** non ha equivalente Supabase
- ❌ **Migrazione dati utenti esistenti** estremamente complessa

#### 🟡 **MEDIO - Data Migration:**
- ⚠️ Necessità di mappare `clerk_user_id` → Supabase `auth.users.id`
- ⚠️ Perdita cronologia utenti se non migrata correttamente
- ⚠️ Reimpostazione password obbligatoria per tutti gli utenti

#### 🟢 **BASSO - RLS Implementation:**
- ✅ Schema database già ben strutturato con `company_id`
- ✅ Policies RLS documentate (anche se non applicate)
- ✅ Supabase Auth ben integrato con PostgreSQL

---

### 2. **Rischi Funzionali**

#### 🔴 **CRITICO:**
1. **Onboarding Workflow** - Completamente da riscrivere:
   - Clerk gestisce creazione utente + email verification
   - Supabase richiede configurazione SMTP custom
   - Template email da creare manualmente

2. **Session Management** - Nuova logica multi-company:
   - Switcher azienda in topbar (nuovo componente)
   - Invalidazione cache al cambio azienda
   - Gestione stato locale + Supabase realtime

3. **Protected Routes** - Logica completamente diversa:
   - Clerk: `<SignedIn>` / `<SignedOut>`
   - Supabase: Custom `useAuth` + `ProtectedRoute` component

#### 🟡 **MEDIO:**
1. **Email Invites** - Sistema da implementare ex-novo:
   - Attualmente: Clerk invia email automatiche
   - Nuovo: Servizio email custom (Resend/SendGrid) + token management

2. **Role-Based UI** - Adattamento componenti:
   - Dashboard visibility (tab "Gestione" solo admin)
   - Form permissions (create/edit/delete)
   - Buttons conditional rendering

---

### 3. **Rischi Performance**

#### 🟡 **MEDIO:**
- RLS policies aggiungono overhead su ogni query (~5-10ms per policy)
- Junction table `company_members` aggiunge 1 JOIN extra
- Funzioni `get_active_company_id()` chiamate migliaia di volte

#### Mitigazioni:
```sql
-- Indici strategici
CREATE INDEX idx_company_members_lookup ON company_members(user_id, company_id, is_active);
CREATE INDEX idx_user_sessions_active ON user_sessions(user_id, active_company_id);

-- Function caching (PostgreSQL 14+)
CREATE OR REPLACE FUNCTION get_active_company_id()
RETURNS uuid
LANGUAGE sql
STABLE  -- ✅ Permette caching durante transazione
SECURITY DEFINER
AS $$
  SELECT active_company_id FROM user_sessions WHERE user_id = auth.uid()
$$;
```

---

## 🚀 **STRATEGIA DI IMPLEMENTAZIONE**

### Approccio Consigliato: **PHASED MIGRATION** (5 fasi)

#### **FASE 1: Preparazione Database** (⏱️ 1 giorno)
```
✅ AZIONI:
1. Backup completo database produzione
2. Creare tabelle nuove (company_members, user_sessions, audit_logs)
3. Applicare RLS policies (SENZA attivare RLS sulle tabelle)
4. Creare funzioni helper
5. Test policies su database staging

❌ NON FARE:
- Non eliminare user_profiles
- Non attivare RLS
- Non modificare codice frontend
```

#### **FASE 2: Implementazione Supabase Auth** (⏱️ 2 giorni)
```
✅ AZIONI:
1. Configurare Supabase Auth (email provider, templates)
2. Riscrivere useAuth hook (versione 2.0)
3. Creare nuovo LoginPage / RegisterPage (Supabase UI)
4. Implementare CompanySwitcher component
5. Test autenticazione isolata (branch separato)

❌ NON FARE:
- Non rimuovere Clerk ancora
- Non deployare su produzione
```

#### **FASE 3: Migrazione Componenti** (⏱️ 3 giorni)
```
✅ AZIONI:
1. Aggiornare App.tsx (rimuovere ClerkProvider)
2. Aggiornare ProtectedRoute component
3. Aggiornare tutti i 35 file che usano useAuth
4. Aggiornare MainLayout (aggiungere CompanySwitcher)
5. Test funzionalità per funzionalità

PRIORITÀ MIGRAZIONE:
  1️⃣ Auth flow (login/register/logout)
  2️⃣ Dashboard (read-only test)
  3️⃣ Settings (company switcher)
  4️⃣ Management (permissions test)
  5️⃣ Resto features (inventory, calendar, etc.)
```

#### **FASE 4: Attivazione RLS** (⏱️ 1 giorno)
```
✅ AZIONI:
1. Attivare RLS tabella per tabella (su staging)
2. Test completo tutte le funzionalità
3. Verificare performance query
4. Aggiustare policies se necessario
5. Load testing con più aziende

❌ ROLLBACK PLAN:
- Disattivare RLS: ALTER TABLE xxx DISABLE ROW LEVEL SECURITY
- Ripristinare da backup se necessario
```

#### **FASE 5: Production Deployment** (⏱️ 1 giorno)
```
✅ AZIONI:
1. Migrazione dati utenti esistenti (se presenti)
2. Deploy database migrations
3. Deploy frontend
4. Monitoring intensivo prime 24h
5. Comunicazione utenti (reimpostazione password)

⚠️ DOWNTIME PREVISTO: 2-4 ore
```

---

### Approccio Alternativo: **BIG BANG MIGRATION** (NON CONSIGLIATO)

```
❌ SCONSIGLIATO perché:
- Alto rischio di breaking changes
- Difficile rollback
- Testing insufficiente
- Downtime prolungato (6-8 ore)

✅ SOLO SE:
- App non in produzione
- Nessun utente attivo
- Database vuoto o demo
```

---

## 📋 **CHECKLIST PRE-MIGRAZIONE**

### Database
- [ ] Backup completo database produzione
- [ ] Test restore backup su ambiente staging
- [ ] Verificare tutte le tabelle hanno company_id
- [ ] Creare database staging identico a produzione
- [ ] Documentare schema attuale

### Codice
- [ ] Elencare tutti i file che usano Clerk
- [ ] Identificare componenti critici (auth, protected routes)
- [ ] Creare branch `feature/supabase-auth-migration`
- [ ] Setup CI/CD per test automatici
- [ ] Preparare rollback plan

### Supabase
- [ ] Account Supabase configurato
- [ ] Auth providers abilitati (email, Google, etc.)
- [ ] SMTP configurato per email
- [ ] Template email customizzati
- [ ] Rate limiting configurato
- [ ] Monitoring setup (Sentry, LogRocket)

### Testing
- [ ] Piano test unitari (auth, permissions)
- [ ] Piano test integrazione (full user journey)
- [ ] Piano test performance (RLS overhead)
- [ ] Piano test multi-company (data isolation)
- [ ] Piano test sicurezza (penetration test)

---

## 💰 **STIMA COSTI E TEMPI**

### Sviluppo
```
Fase 1 (Database):        8 ore   (1 giorno)
Fase 2 (Auth):           16 ore   (2 giorni)
Fase 3 (Componenti):     24 ore   (3 giorni)
Fase 4 (RLS):             8 ore   (1 giorno)
Fase 5 (Deployment):      8 ore   (1 giorno)
Testing & Bugfix:        16 ore   (2 giorni)
-------------------------------------------
TOTALE:                  80 ore  (10 giorni lavorativi)
```

### Risorse
- 1 Senior Backend Dev (database, RLS, migrations)
- 1 Senior Frontend Dev (React, hooks, components)
- 1 DevOps (deployment, monitoring)

### Rischi Tempo
- ⚠️ +20% buffer per imprevisti → **12 giorni**
- ⚠️ +30% se database produzione ha molti dati → **13 giorni**

---

## ✅ **VANTAGGI POST-MIGRAZIONE**

### Sicurezza
- ✅ RLS a livello database (impossibile bypassare)
- ✅ Audit trail completo (compliance HACCP)
- ✅ Multi-tenant isolation garantita
- ✅ Nessuna dipendenza da servizio esterno (Clerk)

### Funzionalità
- ✅ Multi-company per utente
- ✅ Switcher azienda seamless
- ✅ Permessi granulari per ruolo
- ✅ Scalabilità illimitata

### Costi
- ✅ -$25/mese (Clerk Pro Plan)
- ✅ Supabase Free Tier fino a 500MB + 50.000 MAU
- ✅ Controllo completo su auth flow

---

## 🎯 **RACCOMANDAZIONE FINALE**

### ✅ **FATTIBILE** con le seguenti condizioni:

1. **APPROCCIO:** Phased Migration (5 fasi)
2. **TEMPO:** 12-15 giorni lavorativi
3. **TEAM:** Minimo 2 developer senior
4. **AMBIENTE:** Staging obbligatorio
5. **ROLLBACK:** Piano dettagliato pronto

### ⚠️ **PERICOLI PRINCIPALI:**

1. **Data Loss Risk:** Se migrazione dati utenti fallisce
2. **Downtime:** 2-4 ore inevitabili su produzione
3. **User Friction:** Tutti gli utenti devono reimpostare password
4. **Hidden Dependencies:** Possibili feature Clerk non documentate

### 🚀 **PROSSIMI STEP:**

1. **Decisione:** Conferma migrazione (GO/NO-GO)
2. **Planning:** Sprint planning dettagliato (2-week sprint)
3. **Setup:** Ambiente staging + backup strategy
4. **Kickoff:** Fase 1 - Preparazione Database

---

**Aspetto tue istruzioni per procedere.**
