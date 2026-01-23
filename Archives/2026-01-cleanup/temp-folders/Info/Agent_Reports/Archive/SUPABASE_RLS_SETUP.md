# 🔒 Supabase Row-Level Security (RLS) Setup Guide

## 📋 Panoramica

Questo documento spiega come configurare le Row-Level Security (RLS) policies su Supabase per garantire che ogni azienda possa accedere SOLO ai propri dati.

---

## 🎯 Obiettivi delle RLS Policies

1. **Isolamento Multi-Tenant**: Ogni azienda vede solo i propri dati
2. **Controllo Accessi Basato su Ruoli**: Admin, Responsabile, Dipendente hanno permessi diversi
3. **Sicurezza a Livello Database**: Le regole sono applicate da PostgreSQL, non dal frontend
4. **Audit Trail**: Tutte le operazioni sono tracciate automaticamente

---

## 🚀 Come Applicare le Policies

### Passo 1: Accedi a Supabase Dashboard

1. Vai su https://supabase.com/dashboard
2. Seleziona il tuo progetto
3. Vai su **SQL Editor** nel menu laterale

### Passo 2: Esegui lo Script RLS

1. Apri il file `supabase/rls-policies.sql`
2. Copia TUTTO il contenuto
3. Incolla nel SQL Editor di Supabase
4. Clicca **Run** (o premi `Ctrl+Enter`)

### Passo 3: Verifica le Policies Create

Esegui questa query per verificare:

```sql
SELECT
  tablename,
  policyname,
  cmd as operation,
  CASE
    WHEN cmd = 'SELECT' THEN '👁️ Read'
    WHEN cmd = 'INSERT' THEN '➕ Create'
    WHEN cmd = 'UPDATE' THEN '✏️ Update'
    WHEN cmd = 'DELETE' THEN '🗑️ Delete'
  END as action
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;
```

Dovresti vedere circa **60+ policies** create.

---

## 🔑 Helper Functions Create

Lo script crea 3 funzioni helper utilizzate dalle policies:

### 1. `auth.user_company_id()`
Restituisce il `company_id` dell'utente autenticato.

```sql
SELECT auth.user_company_id();
-- Output: c47b8b25-7257-4db3-a94c-d1693ff53cc5
```

### 2. `auth.user_role()`
Restituisce il ruolo dell'utente (`admin`, `responsabile`, `dipendente`, `collaboratore`, `guest`).

```sql
SELECT auth.user_role();
-- Output: 'admin'
```

### 3. `auth.is_admin_or_manager()`
Verifica se l'utente è Admin o Responsabile.

```sql
SELECT auth.is_admin_or_manager();
-- Output: true
```

---

## 📊 Policies per Tabella

### Tabelle Principali

| Tabella | SELECT | INSERT | UPDATE | DELETE |
|---------|--------|--------|--------|--------|
| **companies** | ✅ Tutti | ❌ No | ✅ Admin | ❌ No |
| **departments** | ✅ Tutti | ✅ Manager+ | ✅ Manager+ | ✅ Admin |
| **staff** | ✅ Tutti | ✅ Manager+ | ✅ Manager+ | ✅ Admin |
| **conservation_points** | ✅ Tutti | ✅ Manager+ | ✅ Manager+ | ✅ Admin |
| **maintenance_tasks** | ✅ Tutti | ✅ Tutti | ✅ Tutti | ✅ Manager+ |
| **tasks** | ✅ Tutti | ✅ Tutti | ✅ Tutti | ✅ Manager+ |
| **product_categories** | ✅ Tutti | ✅ Tutti | ✅ Tutti | ✅ Manager+ |
| **products** | ✅ Tutti | ✅ Tutti | ✅ Tutti | ✅ Tutti |
| **temperature_readings** | ✅ Tutti | ✅ Tutti | ✅ Manager+ | ✅ Admin |
| **shopping_lists** | ✅ Tutti | ✅ Tutti | ✅ Tutti | ✅ Tutti |
| **events** | ✅ Tutti | ✅ Tutti | ✅ Tutti | ✅ Tutti |
| **notes** | ✅ Tutti | ✅ Tutti | ✅ Tutti | ✅ Tutti |
| **non_conformities** | ✅ Tutti | ✅ Manager+ | ✅ Manager+ | ✅ Admin |

**Legenda:**
- ✅ **Tutti**: Tutti gli utenti autenticati della stessa azienda
- ✅ **Manager+**: Admin e Responsabile
- ✅ **Admin**: Solo Admin

---

## 🧪 Test delle Policies

### Test 1: Verificare Isolamento Aziende

```sql
-- Come utente dell'azienda A
SELECT * FROM products;
-- ✅ Vede solo prodotti dell'azienda A

-- Come utente dell'azienda B (diverso login)
SELECT * FROM products;
-- ✅ Vede solo prodotti dell'azienda B
```

### Test 2: Verificare Permessi Ruolo

```sql
-- Come Dipendente
DELETE FROM departments WHERE id = 'xxx';
-- ❌ Errore: new row violates row-level security policy

-- Come Admin
DELETE FROM departments WHERE id = 'xxx';
-- ✅ Successo
```

### Test 3: Test Completo via App

1. Login come Admin
2. Vai su Gestione → Reparti
3. Crea un nuovo reparto → ✅ Dovrebbe funzionare
4. Elimina un reparto → ✅ Dovrebbe funzionare

5. Login come Dipendente (stesso account, cambia ruolo in user_profiles)
6. Vai su Gestione → Reparti
7. Prova a eliminare un reparto → ❌ Dovrebbe fallire

---

## 🔧 Troubleshooting

### Errore: "new row violates row-level security policy"

**Causa:** La policy blocca l'operazione perché:
- L'utente non ha il ruolo richiesto
- Il `company_id` non corrisponde
- La policy non esiste

**Soluzione:**
1. Verifica che le policies siano state create:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'nome_tabella';
   ```

2. Verifica il `company_id` dell'utente:
   ```sql
   SELECT auth.user_company_id();
   ```

3. Verifica il ruolo dell'utente:
   ```sql
   SELECT auth.user_role();
   ```

### Errore: "function auth.user_company_id() does not exist"

**Causa:** Le helper functions non sono state create.

**Soluzione:**
1. Verifica che lo script sia stato eseguito completamente
2. Ri-esegui la sezione "Helper Functions" dello script

### Errore: "permission denied for schema auth"

**Causa:** L'utente non ha permessi per creare funzioni nello schema `auth`.

**Soluzione:**
1. Esegui come superuser (Supabase Dashboard usa già il superuser)
2. Assicurati di essere loggato con l'account owner del progetto

---

## 🔄 Aggiornare le Policies

Se devi modificare una policy:

```sql
-- 1. Elimina la policy esistente
DROP POLICY IF EXISTS "nome_policy" ON nome_tabella;

-- 2. Crea la nuova policy
CREATE POLICY "nome_policy"
ON nome_tabella FOR SELECT
USING (company_id = auth.user_company_id());
```

---

## 🎓 Best Practices

### 1. Usa Helper Functions
✅ **DO:**
```sql
USING (company_id = auth.user_company_id())
```

❌ **DON'T:**
```sql
USING (company_id IN (SELECT company_id FROM user_profiles WHERE ...))
```

### 2. Nomina le Policy in Modo Chiaro
✅ **DO:**
```sql
"Users can view products from their company"
```

❌ **DON'T:**
```sql
"policy_1"
```

### 3. Testa Sempre le Policies
- Test con utenti di aziende diverse
- Test con ruoli diversi
- Test delle operazioni CRUD

### 4. Documenta le Modifiche
- Mantieni questo file aggiornato
- Commenta le policies complesse
- Traccia le modifiche nel changelog

---

## 📚 Risorse Aggiuntive

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers)

---

## ✅ Checklist Post-Setup

Dopo aver applicato le policies, verifica:

- [ ] Tutte le 15 tabelle hanno RLS abilitato
- [ ] Le 3 helper functions sono state create
- [ ] Circa 60+ policies sono state create
- [ ] La query di verifica mostra tutte le policies
- [ ] L'onboarding funziona correttamente
- [ ] Gli utenti vedono solo i dati della loro azienda
- [ ] I permessi basati su ruolo funzionano

---

**Versione:** 1.0
**Ultimo Aggiornamento:** 2025-10-06
**Autore:** Claude Code
**Status:** ✅ Pronto per Produzione
