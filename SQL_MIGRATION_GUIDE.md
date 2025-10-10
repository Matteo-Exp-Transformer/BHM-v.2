# 📊 SQL Migration Guide - User Activity Tracking & Shopping Lists

**Data:** 2025-01-10
**Branch:** NoClerk
**Feature:** User Activity Tracking + Shopping List System

---

## 🎯 OVERVIEW

Questa guida ti aiuta a eseguire le migration SQL su Supabase per abilitare:
1. **User Activity Tracking** - Log completo di tutte le attività utente
2. **Shopping List System** - Sistema liste della spesa integrato

---

## 📋 MIGRATION CHECKLIST

Esegui questi script **IN ORDINE** nel SQL Editor di Supabase:

- [ ] **Step 1**: Migration 005 - user_activity_logs table
- [ ] **Step 2**: Migration 006 - user_sessions update
- [ ] **Step 3**: Migration 007 - shopping_lists verification
- [ ] **Step 4**: RLS Policies - user_activity_logs
- [ ] **Step 5**: RLS Policies - shopping_lists

---

## 🚀 STEP-BY-STEP EXECUTION

### Step 1: Create user_activity_logs Table

**File:** `database/migrations/005_user_activity_logs.sql`

**Cosa fa:**
- Crea tabella `user_activity_logs` per tracciare tutte le attività
- Aggiunge indici per performance
- Definisce check constraints per activity_type

**Esegui:**
```sql
-- Copia e incolla TUTTO il contenuto di:
-- database/migrations/005_user_activity_logs.sql
```

**Verifica:**
```sql
-- Verifica che la tabella esista
SELECT EXISTS (
  SELECT FROM pg_tables
  WHERE schemaname = 'public'
  AND tablename = 'user_activity_logs'
);
-- Deve ritornare: true

-- Verifica indici
SELECT indexname FROM pg_indexes
WHERE tablename = 'user_activity_logs';
-- Deve ritornare: 7 indici
```

---

### Step 2: Update user_sessions Table

**File:** `database/migrations/006_update_user_sessions.sql`

**Cosa fa:**
- Aggiunge campi per session tracking: session_start, session_end, last_activity
- Crea funzioni: end_user_session(), get_active_sessions(), cleanup_inactive_sessions()
- Aggiunge trigger per auto-update last_activity

**Esegui:**
```sql
-- Copia e incolla TUTTO il contenuto di:
-- database/migrations/006_update_user_sessions.sql
```

**Verifica:**
```sql
-- Verifica nuove colonne
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_sessions'
AND column_name IN ('session_start', 'session_end', 'last_activity', 'is_active');
-- Deve ritornare: 4 righe

-- Verifica funzioni
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('end_user_session', 'get_active_sessions', 'cleanup_inactive_sessions');
-- Deve ritornare: 3 funzioni
```

---

### Step 3: Verify shopping_lists Tables

**File:** `database/migrations/007_shopping_lists_verification.sql`

**Cosa fa:**
- Verifica esistenza tabelle shopping_lists e shopping_list_items
- Crea tabelle se non esistono
- Aggiunge colonne mancanti (status, notes, is_checked, checked_at)
- Crea trigger e helper functions

**Esegui:**
```sql
-- Copia e incolla TUTTO il contenuto di:
-- database/migrations/007_shopping_lists_verification.sql
```

**Verifica:**
```sql
-- Verifica tabelle
SELECT EXISTS (
  SELECT FROM pg_tables
  WHERE schemaname = 'public'
  AND tablename IN ('shopping_lists', 'shopping_list_items')
);
-- Deve ritornare: true

-- Verifica funzioni
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
  'get_shopping_list_with_items',
  'complete_shopping_list'
);
-- Deve ritornare: 2 funzioni
```

---

### Step 4: RLS Policies - user_activity_logs

**File:** `database/rls/user_activity_logs_policies.sql`

**Cosa fa:**
- Abilita RLS su user_activity_logs
- Policy: Users can view own activities
- Policy: Admins can view all company activities
- Policy: Users can insert own activities
- Crea funzioni helper: log_user_activity(), get_user_activities(), get_company_activities()

**Esegui:**
```sql
-- Copia e incolla TUTTO il contenuto di:
-- database/rls/user_activity_logs_policies.sql
```

**Verifica:**
```sql
-- Verifica RLS abilitato
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'user_activity_logs';
-- rowsecurity deve essere: true

-- Verifica policies
SELECT policyname
FROM pg_policies
WHERE tablename = 'user_activity_logs';
-- Deve ritornare: 4 policies

-- Verifica funzioni
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
  'log_user_activity',
  'get_user_activities',
  'get_company_activities',
  'get_activity_statistics'
);
-- Deve ritornare: 4 funzioni
```

---

### Step 5: RLS Policies - shopping_lists

**File:** `database/rls/shopping_lists_policies.sql`

**Cosa fa:**
- Abilita RLS su shopping_lists e shopping_list_items
- Policies per SELECT, INSERT, UPDATE, DELETE
- Permissions differenziate: users vs admins
- Crea funzioni: create_shopping_list_with_items(), toggle_shopping_list_item()

**Esegui:**
```sql
-- Copia e incolla TUTTO il contenuto di:
-- database/rls/shopping_lists_policies.sql
```

**Verifica:**
```sql
-- Verifica RLS abilitato
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('shopping_lists', 'shopping_list_items');
-- Entrambe devono avere rowsecurity = true

-- Verifica policies su shopping_lists
SELECT COUNT(*)
FROM pg_policies
WHERE tablename = 'shopping_lists';
-- Deve ritornare: 6 policies

-- Verifica policies su shopping_list_items
SELECT COUNT(*)
FROM pg_policies
WHERE tablename = 'shopping_list_items';
-- Deve ritornare: 4 policies

-- Verifica funzioni
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
  'create_shopping_list_with_items',
  'toggle_shopping_list_item',
  'get_shopping_lists_with_stats'
);
-- Deve ritornare: 3 funzioni
```

---

## ✅ FINAL VERIFICATION

Dopo aver eseguito TUTTE le migration, verifica l'intero setup:

```sql
-- Verifica tutte le tabelle
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'user_activity_logs',
  'user_sessions',
  'shopping_lists',
  'shopping_list_items'
)
ORDER BY tablename;
-- Deve ritornare: 4 tabelle

-- Verifica tutte le funzioni
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%activity%'
   OR routine_name LIKE '%shopping%'
   OR routine_name LIKE '%session%'
ORDER BY routine_name;
-- Deve ritornare: ~15 funzioni

-- Verifica RLS policies totali
SELECT tablename, COUNT(*) as policies_count
FROM pg_policies
WHERE tablename IN (
  'user_activity_logs',
  'shopping_lists',
  'shopping_list_items'
)
GROUP BY tablename
ORDER BY tablename;
-- Deve ritornare:
-- shopping_list_items: 4
-- shopping_lists: 6
-- user_activity_logs: 4
```

---

## 🐛 TROUBLESHOOTING

### Errore: "relation already exists"
**Soluzione:** Normale se la tabella esiste già. Lo script gestisce questo caso.

### Errore: "function already exists"
**Soluzione:** Usa `CREATE OR REPLACE FUNCTION` (già presente negli script).

### Errore: "permission denied"
**Soluzione:** Verifica di essere connesso come postgres admin su Supabase.

### Policies non funzionano
**Verifica:**
```sql
-- Check se RLS è abilitato
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Se rowsecurity = false, abilita manualmente:
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list_items ENABLE ROW LEVEL SECURITY;
```

---

## 🎉 NEXT STEPS

Dopo aver completato tutte le migration:

1. ✅ Ricarica l'applicazione frontend
2. ✅ Vai alla Dashboard
3. ✅ Verifica che la card "Lista della Spesa" sia visibile
4. ✅ Prova a selezionare prodotti e creare una lista
5. ✅ Verifica che le attività vengano loggate in `user_activity_logs`

---

## 📊 DATABASE SCHEMA UPDATES

### Nuove Tabelle
- `user_activity_logs` - 10 campi, 7 indici
- `user_sessions` - 6 nuovi campi

### Tabelle Aggiornate
- `shopping_lists` - 2 nuovi campi (status, notes)
- `shopping_list_items` - 2 nuovi campi (is_checked, checked_at)

### Nuove Funzioni (15 totali)
- Activity: log_user_activity, get_user_activities, get_company_activities, get_activity_statistics
- Sessions: end_user_session, get_active_sessions, cleanup_inactive_sessions
- Shopping: create_shopping_list_with_items, toggle_shopping_list_item, get_shopping_lists_with_stats, complete_shopping_list, get_shopping_list_with_items

### RLS Policies (14 totali)
- user_activity_logs: 4 policies
- shopping_lists: 6 policies
- shopping_list_items: 4 policies

---

**Migration Owner:** Claude Code
**Last Updated:** 2025-01-10
**Status:** ✅ Ready for Execution
