# 🎯 ISTRUZIONI RAPIDE - Setup Nuovo Progetto Supabase

**Data**: 9 Gennaio 2025  
**Per**: Creazione nuovo progetto Supabase completamente vuoto  
**Tempo totale**: ~15-20 minuti

---

## 📋 SITUAZIONE ATTUALE

- ✅ Hai creato un NUOVO progetto Supabase completamente vuoto
- ❌ Il database non ha ancora nessuna tabella
- 🎯 Devi eseguire lo schema base PRIMA delle migrazioni auth di Claude

---

## 🚀 PROCEDURA CORRETTA (3 STEP)

### STEP 1: SCHEMA BASE (15 tabelle) ⬅️ **ESEGUI QUESTO PER PRIMO**

**File da eseguire**: `database/NUOVO_PROGETTO_SUPABASE_COMPLETO.sql`

**Come procedere**:
1. Apri Supabase Dashboard → SQL Editor → New Query
2. Apri il file `database/NUOVO_PROGETTO_SUPABASE_COMPLETO.sql` sul tuo computer
3. **COPIA TUTTO** il contenuto del file (sono circa 450 righe)
4. **INCOLLA** nel SQL Editor di Supabase
5. Clicca **RUN**

✅ **Output atteso**:
```
status: "Schema base creato con successo!"
total_tables: 15
```

📋 **Tabelle create**:
- companies
- departments
- staff
- conservation_points
- temperature_readings
- product_categories
- products
- tasks
- maintenance_tasks
- events
- notes
- non_conformities
- shopping_lists
- shopping_list_items
- user_profiles

⏱️ **Tempo**: 10-15 secondi

---

### STEP 2: TABELLE AUTH (4 tabelle)

**File da eseguire**: `database/migrations/001_supabase_auth_setup.sql`

**Come procedere**:
1. Nel SQL Editor di Supabase, clicca **New Query**
2. Apri il file `database/migrations/001_supabase_auth_setup.sql`
3. **COPIA TUTTO** il contenuto
4. **INCOLLA** nel SQL Editor
5. Clicca **RUN**

✅ **Output atteso**:
```
status: "Migration 001 completed successfully!"
```

📋 **Tabelle create**:
- company_members (gestione membri azienda)
- user_sessions (sessioni utente)
- invite_tokens (token per inviti)
- audit_logs (log di audit HACCP)

⏱️ **Tempo**: 5 secondi

---

### STEP 3: FUNZIONI RLS (8 funzioni)

**File da eseguire**: `database/functions/rls_helpers.sql`

**Come procedere**:
1. Nel SQL Editor di Supabase, clicca **New Query**
2. Apri il file `database/functions/rls_helpers.sql`
3. **COPIA TUTTO** il contenuto
4. **INCOLLA** nel SQL Editor
5. Clicca **RUN**

✅ **Output atteso**:
```
status: "RLS Helper Functions created successfully!"
```

📋 **Funzioni create**:
- get_active_company_id()
- is_company_member(uuid)
- has_management_role(uuid)
- is_admin(uuid)
- get_user_companies()
- ensure_user_session()
- switch_active_company(uuid)
- has_permission(uuid, text)

⏱️ **Tempo**: 3 secondi

---

## ✅ VERIFICA FINALE

Dopo aver completato i 3 step, esegui questa query per verificare:

```sql
-- Conta tabelle base
SELECT 'Tabelle Base' as tipo, COUNT(*) as totale
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'companies', 'departments', 'staff', 
    'conservation_points', 'temperature_readings',
    'product_categories', 'products',
    'tasks', 'maintenance_tasks',
    'events', 'notes', 'non_conformities',
    'shopping_lists', 'shopping_list_items',
    'user_profiles'
  )

UNION ALL

-- Conta tabelle auth
SELECT 'Tabelle Auth' as tipo, COUNT(*) as totale
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'company_members', 'user_sessions', 
    'invite_tokens', 'audit_logs'
  )

UNION ALL

-- Conta funzioni RLS
SELECT 'Funzioni RLS' as tipo, COUNT(*) as totale
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN (
    'get_active_company_id',
    'is_company_member',
    'has_management_role',
    'is_admin',
    'get_user_companies',
    'ensure_user_session',
    'switch_active_company',
    'has_permission'
  );
```

✅ **Risultato atteso**:
```
tipo              | totale
------------------|--------
Tabelle Base      | 15
Tabelle Auth      | 4
Funzioni RLS      | 8
```

---

## 🎯 PROSSIMI PASSI (DOPO QUESTI 3 STEP)

**NON eseguire ancora**:
- ❌ RLS Policies (da attivare DOPO aver implementato Supabase Auth nel frontend)
- ❌ Configurazione Email SMTP (da fare quando pronto)

**Informazioni aggiuntive**:
- 📖 Guida completa: `SUPABASE_MANUAL_SETUP.md`
- 📊 Report verifica schema: `Report Agenti/VERIFICA_SCHEMA_SQL_2025_01_09.md`
- 📝 Migrazioni Claude: `MIGRATION_TASKS.md`

---

## ❓ TROUBLESHOOTING

### Errore: "relation does not exist"
**Problema**: Stai cercando di eseguire Step 2 o 3 prima dello Step 1  
**Soluzione**: Esegui PRIMA lo Step 1 (schema base completo)

### Errore: "duplicate key value"
**Problema**: Stai eseguendo lo stesso step due volte  
**Soluzione**: Controlla quali tabelle/funzioni esistono già con la query di verifica

### Errore: "syntax error"
**Problema**: Non hai copiato tutto il file  
**Soluzione**: Assicurati di copiare dall'inizio alla fine del file SQL

---

## 📞 SUPPORTO

Se hai problemi:
1. Controlla i log: Supabase Dashboard → Logs → Postgres Logs
2. Verifica quali tabelle esistono: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`
3. Leggi la guida completa: `SUPABASE_MANUAL_SETUP.md`

---

**Quando hai completato i 3 step con successo, puoi procedere con la configurazione Email e RLS seguendo `SUPABASE_MANUAL_SETUP.md`**

---

## 📌 CHECKLIST RAPIDA

```
[ ] STEP 1: Eseguito NUOVO_PROGETTO_SUPABASE_COMPLETO.sql (15 tabelle)
[ ] STEP 2: Eseguito 001_supabase_auth_setup.sql (4 tabelle auth)
[ ] STEP 3: Eseguito rls_helpers.sql (8 funzioni)
[ ] VERIFICA: Query di verifica eseguita con successo (15+4+8 = 27 elementi totali)
```

**Quando tutti i box sono ✅, il database è pronto!**

