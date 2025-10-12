# ⚡ QUICK START - Risoluzione Company Duplicate

## 🎯 PROBLEMA
Hai **14 company duplicate** tutte chiamate "Al Ritrovo SRL" invece di una sola.

## 🛠️ SOLUZIONE IN 5 MINUTI

### 1️⃣ PULIZIA DATABASE (Supabase SQL Editor)

```sql
-- 1. Trova la company MIGLIORE (quella con più dati)
SELECT 
  c.id as company_id,
  c.name,
  (
    (SELECT COUNT(*) FROM public.departments WHERE company_id = c.id) +
    (SELECT COUNT(*) FROM public.staff WHERE company_id = c.id) +
    (SELECT COUNT(*) FROM public.products WHERE company_id = c.id) +
    (SELECT COUNT(*) FROM public.tasks WHERE company_id = c.id)
  ) as completeness_score
FROM public.companies c
WHERE c.name = 'Al Ritrovo SRL'
ORDER BY completeness_score DESC
LIMIT 1;

-- 📋 COPIA L'ID (esempio: 205c56c7-30b5-4526-b064-bf998c562df3)
```

```sql
-- 2. ELIMINA LE DUPLICATE (sostituisci l'ID!)
DO $$ 
DECLARE
  company_to_keep UUID := '[INCOLLA_ID_QUI]';  -- ⚠️ SOSTITUISCI!
BEGIN
  DELETE FROM public.companies
  WHERE name = 'Al Ritrovo SRL' AND id != company_to_keep;
  
  RAISE NOTICE '✅ Duplicate eliminate!';
END $$;
```

```sql
-- 3. VERIFICA (deve restituire: 1)
SELECT COUNT(*) FROM public.companies WHERE name = 'Al Ritrovo SRL';
```

---

### 2️⃣ ATTIVA DEV MODE (Console Browser F12)

```javascript
// 1. Trova automaticamente la migliore company
devCompanyHelper.findBestDevCompany()

// 2. Impostala come dev company
devCompanyHelper.setDevCompanyFromCurrentUser()

// 3. Verifica
devCompanyHelper.showDevCompanyInfo()
```

**Fatto!** 🎉 Da ora in poi NON verranno più create company duplicate.

---

## ✅ VERIFICA FUNZIONAMENTO

1. **Test Onboarding**:
   - Vai all'onboarding
   - Clicca "Precompila" → "Completa Onboarding"
   - Nella console deve apparire: `🛠️ DEV MODE ATTIVO`

2. **Test Database** (SQL Editor):
   ```sql
   -- Deve SEMPRE restituire: 1
   SELECT COUNT(*) FROM companies WHERE name = 'Al Ritrovo SRL';
   ```

---

## 📚 COMANDI UTILI

```javascript
// Console Browser (F12):

devCompanyHelper.showDevCompanyInfo()      // Info company attuale
devCompanyHelper.clearDevCompany()          // Disabilita dev mode
devCompanyHelper.setDevCompany('ID-QUI')    // Imposta manualmente
```

---

## 📁 FILE UTILI

| File | Scopo |
|------|-------|
| `AL_RITROVO_CLEANUP.sql` | Script con i tuoi ID già inseriti |
| `DEV_STRATEGY_SINGLE_COMPANY.md` | Guida completa dettagliata |
| `cleanup_duplicate_companies.sql` | Script generico di cleanup |

---

## 🚨 SE QUALCOSA VA STORTO

```javascript
// Reset completo dev mode
devCompanyHelper.clearDevCompany()

// Riconfigura
devCompanyHelper.findBestDevCompany()
devCompanyHelper.setDevCompanyFromCurrentUser()
```

```sql
-- Vedi tutte le tue company
SELECT id, name, created_at 
FROM companies 
WHERE name = 'Al Ritrovo SRL'
ORDER BY created_at DESC;
```

---

**Happy Coding!** 🎉

