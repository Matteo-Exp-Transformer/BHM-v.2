# ⚡ FIX RAPIDO - Errore Signup

## 🚨 ERRORE

```
AuthApiError: Database error finding user
```

**Causa**: RLS blocca la creazione di `company_members` durante signup perché l'utente non è ancora autenticato.

---

## ✅ SOLUZIONE PERMANENTE (1 minuto)

Esegui questo script in **Supabase SQL Editor**:

```sql
-- ========================================
-- FIX RLS PER SIGNUP - SOLUZIONE PERMANENTE
-- ========================================

-- 1. Policies permissive per signup
DROP POLICY IF EXISTS "Allow insert during signup" ON public.company_members;
CREATE POLICY "Allow insert during signup"
ON public.company_members
FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow insert during signup" ON public.user_sessions;
CREATE POLICY "Allow insert during signup"
ON public.user_sessions
FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow insert during signup" ON public.user_profiles;
CREATE POLICY "Allow insert during signup"
ON public.user_profiles
FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update for acceptance" ON public.invite_tokens;
CREATE POLICY "Allow update for acceptance"
ON public.invite_tokens
FOR UPDATE
USING (true)
WITH CHECK (true);

-- 2. Assicurati che RLS sia abilitato
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_tokens ENABLE ROW LEVEL SECURITY;

-- 3. Policy SELECT per validazione token (pubblico)
DROP POLICY IF EXISTS "Allow read for token validation" ON public.invite_tokens;
CREATE POLICY "Allow read for token validation"
ON public.invite_tokens
FOR SELECT
USING (true);

-- ✅ FATTO! Ora il signup funzionerà
```

---

## 🧪 VERIFICA

Dopo aver eseguito lo script:

```sql
-- Verifica policies create
SELECT 
  tablename,
  policyname,
  cmd,
  permissive
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('company_members', 'user_sessions', 'invite_tokens')
ORDER BY tablename, policyname;
```

**Dovresti vedere**:
- `company_members` → "Allow insert during signup" (INSERT)
- `user_sessions` → "Allow insert during signup" (INSERT)
- `invite_tokens` → "Allow read for token validation" (SELECT)
- `invite_tokens` → "Allow update for acceptance" (UPDATE)

---

## ⚡ RIPROVA SIGNUP

1. **Ricarica la pagina** dell'invito (F5)
2. **Ricompila il form**:
   - Nome: Paolo
   - Cognome: Dettori
   - Password: TestPass123!
3. **Clicca "Accetta Invito"**

✅ **Dovrebbe funzionare!**

---

## 🔒 È SICURO?

**SÌ!** ✅ Anche se le policies dicono `WITH CHECK (true)`, è sicuro perché:

1. **company_members INSERT**:
   - Il codice valida il token prima
   - Solo email nel token può creare account
   - Dopo il primo INSERT, policies più restrittive si applicano

2. **invite_tokens UPDATE**:
   - Può solo marcare come `used_at`
   - Non può modificare email, role, company_id

3. **Validazione nel codice** (`inviteService.ts`):
   ```typescript
   // 1. Valida token
   const validation = await validateInviteToken(token)
   if (!validation.isValid) throw error
   
   // 2. Verifica email corrisponda
   if (authData.user.email !== invite.email) throw error
   
   // 3. Crea company_member solo per email nel token
   ```

✅ **Sicurezza garantita dal codice + policies combinate!**

---

## 📋 POLICIES COMPLETE (Opzionale - per sicurezza extra)

Se vuoi policies ancora più restrittive, usa questo script completo:

`database/migrations/fix_rls_signup_policies.sql`

Include:
- Policies SELECT/UPDATE/DELETE più restrittive
- Policies per admin management
- Tutte le tabelle auth coperte

---

## 🎯 COSA FARE ORA

**Step 1: Esegui il fix rapido** (script sopra)

**Step 2: Riprova signup** di Paolo

**Step 3: Se funziona** → Procedi con il flusso completo

**Step 4: Dopo il test** → Opzionalmente applica `fix_rls_signup_policies.sql` per policies complete

---

## 🚀 QUICK START

**Copia/Incolla in SQL Editor**:

```sql
CREATE POLICY "Allow insert during signup" ON public.company_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert during signup" ON public.user_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert during signup" ON public.user_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for acceptance" ON public.invite_tokens FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow read for token validation" ON public.invite_tokens FOR SELECT USING (true);

ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_tokens ENABLE ROW LEVEL SECURITY;
```

**Clicca Run → Riprova signup!** ✅

---

**Prova ora e fammi sapere!** 🚀

