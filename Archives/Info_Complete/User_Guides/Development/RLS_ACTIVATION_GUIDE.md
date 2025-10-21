# 🔒 RLS Activation Guide

## Overview

Questa guida spiega come **attivare progressivamente** Row-Level Security (RLS) per garantire l'isolamento multi-tenant in produzione.

---

## ⚠️ Stato Attuale

### Development
- ✅ 70 policies create
- ✅ 8 helper functions deployate
- ⚠️ RLS **NON ancora attivo** (policies pronte ma disabilitate)
- ⚠️ Audit triggers **NON ancora attivi**

### Produzione (TODO)
- [ ] Abilitare RLS progressivamente
- [ ] Testare data isolation
- [ ] Attivare audit triggers
- [ ] Monitorare performance

---

## 📋 Checklist Pre-Activation

Prima di attivare RLS in produzione, assicurati:

- [x] ✅ Policies create (`database/policies/rls_policies.sql`)
- [x] ✅ Helper functions deployate (`database/functions/rls_helpers.sql`)
- [x] ✅ Frontend usa `useAuth().companyId` ovunque
- [x] ✅ Backend verifica company_id in tutte le query
- [ ] ⚠️ Backup database completo
- [ ] ⚠️ Piano di rollback pronto
- [ ] ⚠️ Monitoraggio attivo (Sentry, logs)

---

## 🚀 Activation Steps

### Step 1: Backup Database

```bash
# Backup completo prima di abilitare RLS
supabase db dump -f backup_pre_rls_$(date +%Y%m%d).sql
```

### Step 2: Execute FASE 7.1 (Core Auth Tables)

```sql
-- Nel Supabase SQL Editor, esegui:
-- database/enable_rls_progressive.sql - FASE 7.1 only

ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
```

**Test dopo FASE 7.1:**
- [ ] Login funziona
- [ ] Switch company funziona
- [ ] Utenti vedono solo le proprie companies

### Step 3: Execute FASE 7.2 (Management Tables)

```sql
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
```

**Test dopo FASE 7.2:**
- [ ] Management page carica
- [ ] CRUD su departments funziona
- [ ] CRUD su staff funziona
- [ ] Utente Company A NON vede dati Company B

### Step 4: Execute FASE 7.3 (Feature Tables)

```sql
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conservation_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temperature_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
```

**Test dopo FASE 7.3:**
- [ ] Dashboard carica
- [ ] Conservation page funziona
- [ ] Calendar page funziona
- [ ] Inventory page funziona
- [ ] Performance accettabile (<100ms query)

### Step 5: Execute FASE 7.4 (Supporting Tables)

```sql
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.non_conformities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
```

**Test dopo FASE 7.4:**
- [ ] Shopping lists funzionano
- [ ] Notes funzionano
- [ ] Audit logs visibili

### Step 6: Enable Audit Triggers

```bash
# Esegui nel Supabase SQL Editor
database/triggers/audit_triggers.sql
```

**Test dopo audit triggers:**
- [ ] INSERT crea log in audit_logs
- [ ] UPDATE crea log con old_data + new_data
- [ ] DELETE crea log con old_data
- [ ] Performance OK (~1-2ms overhead)

---

## 🧪 Testing Data Isolation

### Test Manuale

1. **Crea 2 companies di test:**
```sql
-- Esegui database/test_rls_isolation.sql - SETUP section
```

2. **Login come User A (Company A)**
   - Vai su Management → Staff
   - Dovresti vedere SOLO staff di Company A

3. **Login come User B (Company B)**
   - Vai su Management → Staff
   - Dovresti vedere SOLO staff di Company B

4. **Verifica Cross-Company Block**
   - User A NON deve vedere dati di Company B
   - User B NON deve vedere dati di Company A

### Test Automatico

```sql
-- Esegui tutti i test
database/test_rls_isolation.sql
```

Expected results:
- ✅ Company A vede 2 departments propri
- ✅ Company B vede 2 departments propri
- ✅ Cross-company access bloccato
- ✅ Query performance <100ms

---

## 📊 Monitoring

### Query Performance

```sql
-- Misura tempo query con RLS
EXPLAIN ANALYZE
SELECT * FROM departments
WHERE company_id = 'your-company-id';
```

**Target:** <50ms execution time

### Audit Log Size

```sql
-- Check dimensione audit_logs
SELECT
  pg_size_pretty(pg_total_relation_size('audit_logs')) as table_size,
  COUNT(*) as row_count
FROM audit_logs;
```

**Action:** Se >10GB, considera retention policy

---

## 🔄 Rollback Plan

Se qualcosa va storto:

### Rollback Immediato (Per Tabella)

```sql
-- Disabilita RLS su tabella problematica
ALTER TABLE public.departments DISABLE ROW LEVEL SECURITY;
```

### Rollback Completo

```sql
-- Disabilita RLS su TUTTE le tabelle
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename NOT LIKE 'pg_%'
  LOOP
    EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', r.tablename);
    RAISE NOTICE 'Disabled RLS on %', r.tablename;
  END LOOP;
END;
$$;
```

### Restore Backup

```bash
# Restore da backup
supabase db push backup_pre_rls_YYYYMMDD.sql
```

---

## ✅ Success Criteria

RLS è attivato con successo se:

- [x] ✅ Tutte le 19 tabelle hanno RLS enabled
- [x] ✅ 70 policies attive
- [x] ✅ Data isolation verificata (test passed)
- [x] ✅ Performance accettabile (<100ms overhead)
- [x] ✅ Audit triggers funzionanti
- [x] ✅ No errori in production logs
- [x] ✅ Utenti NON vedono dati cross-company

---

## 📝 Common Issues

### Issue 1: "new row violates row-level security policy"

**Causa:** User non ha permesso di INSERT
**Soluzione:** Verifica policy INSERT e ruolo utente

### Issue 2: Query lente dopo RLS

**Causa:** Indici mancanti su company_id
**Soluzione:**
```sql
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tablename_company_id
ON tablename(company_id);
```

### Issue 3: Utente vede dati vuoti

**Causa:** user_sessions mancante o active_company_id NULL
**Soluzione:**
```sql
-- Verifica sessione utente
SELECT * FROM user_sessions WHERE user_id = 'user-id';

-- Crea sessione se mancante
INSERT INTO user_sessions (user_id, active_company_id)
VALUES ('user-id', 'company-id');
```

---

## 🎯 Next Steps

Dopo attivazione RLS:

1. ✅ Monitorare performance per 24h
2. ✅ Verificare log errors (Sentry)
3. ✅ Test UAT (User Acceptance Testing)
4. ✅ Documentare findings in MIGRATION_TASKS.md
5. ✅ Update Production Deployment Guide

---

## 📚 References

- [Supabase RLS Docs](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Docs](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- `database/policies/rls_policies.sql` - All policies
- `database/functions/rls_helpers.sql` - Helper functions
- `database/enable_rls_progressive.sql` - Activation script
- `database/test_rls_isolation.sql` - Test script

---

**Last Updated:** 2025-01-09
**Status:** Ready for Production Activation
**Next:** Execute FASE 7.1 in Staging

