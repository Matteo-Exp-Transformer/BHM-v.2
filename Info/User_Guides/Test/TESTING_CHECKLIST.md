# Testing Checklist - User Activity Tracking & Shopping List

**Date:** 2025-01-11
**Branch:** NoClerk
**Commit:** 9b619fbd

---

## ✅ Test 1: Session Tracking (Login/Logout)

### Obiettivo
Verificare che login e logout creino correttamente sessioni e log di attività.

### Steps
1. **Logout** (se già loggato)
2. **Login** con credenziali valide
3. **Verificare nel DB** che:
   - Nuova riga in `user_sessions` con `is_active=true`
   - Nuova riga in `user_activity_logs` con `activity_type='session_start'`
4. **Logout**
5. **Verificare nel DB** che:
   - Session esistente aggiornata con `is_active=false` e `session_end` popolato
   - Nuova riga in `user_activity_logs` con `activity_type='session_end'`

### Query di Verifica
```sql
-- Check active sessions
SELECT id, user_id, is_active, session_start, session_end, last_activity
FROM user_sessions
WHERE user_id = 'YOUR_USER_ID'
ORDER BY session_start DESC
LIMIT 5;

-- Check session activity logs
SELECT id, activity_type, timestamp, activity_data
FROM user_activity_logs
WHERE user_id = 'YOUR_USER_ID'
  AND activity_type IN ('session_start', 'session_end')
ORDER BY timestamp DESC
LIMIT 10;
```

### ✅ Risultato
- [ ] Session creata correttamente on login
- [ ] Session chiusa correttamente on logout
- [ ] Activity logs creati per entrambe le azioni
- [ ] `last_activity` aggiornato (attendere 5+ minuti)

---

## ✅ Test 2: Product Creation with Activity Logging

### Obiettivo
Verificare che la creazione di un prodotto generi un log di attività.

### Steps
1. **Andare** in `/inventario`
2. **Cliccare** "Aggiungi Prodotto"
3. **Compilare** form con dati validi:
   - Nome: "Test Product Activity Log"
   - Categoria: (selezionare una categoria)
   - Quantità: 10
   - Unità: pz
4. **Salvare**
5. **Verificare nel DB** che:
   - Nuovo prodotto creato in `products`
   - Nuova riga in `user_activity_logs` con:
     - `activity_type='product_added'`
     - `entity_type='product'`
     - `entity_id` = ID prodotto creato
     - `activity_data` contiene product_name, category_id, quantity, unit

### Query di Verifica
```sql
-- Check product creation logs
SELECT
  id,
  activity_type,
  entity_type,
  entity_id,
  activity_data,
  timestamp
FROM user_activity_logs
WHERE activity_type = 'product_added'
ORDER BY timestamp DESC
LIMIT 5;

-- Verify product exists
SELECT id, name, category_id, quantity, unit
FROM products
WHERE name = 'Test Product Activity Log';
```

### ✅ Risultato
- [ ] Prodotto creato correttamente
- [ ] Activity log creato con tutti i campi corretti
- [ ] `activity_data` JSONB contiene dettagli prodotto
- [ ] `session_id` presente nel log

---

## ✅ Test 3: Maintenance Task Completion

### Obiettivo
Verificare che il completamento di una manutenzione generi un log di attività.

### Steps
1. **Andare** in `/conservazione`
2. **Selezionare** un conservation point
3. **Completare** una manutenzione esistente OPPURE crearne una nuova e completarla
4. **Verificare nel DB** che:
   - Nuovo record in `maintenance_completions`
   - Nuova riga in `user_activity_logs` con:
     - `activity_type='task_completed'`
     - `entity_type='maintenance_task'`
     - `activity_data` contiene task_type, task_name, conservation_point_id

### Query di Verifica
```sql
-- Check task completion logs
SELECT
  id,
  activity_type,
  entity_type,
  entity_id,
  activity_data,
  timestamp
FROM user_activity_logs
WHERE activity_type = 'task_completed'
ORDER BY timestamp DESC
LIMIT 5;

-- Verify completion exists
SELECT id, maintenance_task_id, completed_by, completed_at, notes
FROM maintenance_completions
ORDER BY completed_at DESC
LIMIT 5;
```

### ✅ Risultato
- [ ] Manutenzione completata correttamente
- [ ] Activity log creato con entity_type='maintenance_task'
- [ ] `activity_data` contiene task details
- [ ] `session_id` presente nel log

---

## ✅ Test 4: Shopping List Creation & Completion

### Obiettivo
Verificare che creazione e completamento lista generino log di attività.

### Steps - Part A: Creation
1. **Andare** in `/inventario`
2. **Aprire** card "Lista della Spesa"
3. **Selezionare** almeno 3 prodotti
4. **Cliccare** "Genera Lista"
5. **Compilare** form:
   - Nome: (default auto-generato OK)
   - Note: "Test shopping list activity"
6. **Salvare**
7. **Verificare nel DB** che:
   - Nuova lista in `shopping_lists`
   - Items in `shopping_list_items`
   - Nuova riga in `user_activity_logs` con:
     - `activity_type='shopping_list_created'`
     - `entity_type='shopping_list'`
     - `activity_data` contiene list_name, total_items, items array

### Steps - Part B: Completion
1. **Andare** in `/liste-spesa`
2. **Cliccare** sulla lista appena creata
3. **Checkare** tutti gli items
4. **Cliccare** "Completa Lista"
5. **Verificare nel DB** che:
   - Lista aggiornata con `status='completed'`
   - Nuova riga in `user_activity_logs` con:
     - `activity_type='shopping_list_completed'`
     - `entity_type='shopping_list'`
     - `entity_id` = ID lista

### Query di Verifica
```sql
-- Check shopping list logs
SELECT
  id,
  activity_type,
  entity_type,
  entity_id,
  activity_data,
  timestamp
FROM user_activity_logs
WHERE activity_type IN ('shopping_list_created', 'shopping_list_completed')
ORDER BY timestamp DESC
LIMIT 10;

-- Verify shopping list
SELECT id, name, status, created_at, notes
FROM shopping_lists
WHERE notes = 'Test shopping list activity';

-- Check items
SELECT id, product_name, quantity, is_checked
FROM shopping_list_items
WHERE shopping_list_id = 'YOUR_LIST_ID';
```

### ✅ Risultato
- [ ] Lista creata con tutti i prodotti selezionati
- [ ] Activity log 'shopping_list_created' con items array
- [ ] Items checkabili in detail page
- [ ] Lista completata correttamente
- [ ] Activity log 'shopping_list_completed' creato
- [ ] Export CSV funzionante

---

## ✅ Test 5: Shopping List Pages Navigation

### Obiettivo
Verificare funzionamento completo interfaccia shopping lists.

### Steps
1. **Andare** in `/liste-spesa`
2. **Verificare**:
   - Liste visualizzate con cards
   - Filtro status funzionante
   - Ricerca per nome funzionante
   - Progress bar visibile
   - Badge status corretti
3. **Cliccare** su una lista
4. **Verificare** in detail page:
   - Items raggruppati per categoria
   - Checkbox funzionanti
   - Progress aggiornato in real-time
   - Export CSV genera file corretto
5. **Testare** azioni:
   - Delete lista (con conferma)
   - Complete lista (solo se 100%)

### ✅ Risultato
- [ ] ShoppingListsPage mostra tutte le liste
- [ ] Filtri e ricerca funzionano
- [ ] Navigation verso detail page funziona
- [ ] Items checkabili e progress aggiornato
- [ ] Export CSV genera file valido
- [ ] Delete e Complete funzionano

---

## ✅ Test 6: Last Activity Auto-Update

### Obiettivo
Verificare che `last_activity` si aggiorni automaticamente ogni 5 minuti.

### Steps
1. **Effettuare** login
2. **Annotare** timestamp `last_activity` in `user_sessions`
3. **Attendere** 6-7 minuti senza interazioni
4. **Verificare nel DB** che `last_activity` sia stato aggiornato

### Query di Verifica
```sql
-- Monitor last_activity updates
SELECT
  id,
  user_id,
  is_active,
  session_start,
  last_activity,
  EXTRACT(EPOCH FROM (NOW() - last_activity)) / 60 as minutes_since_activity
FROM user_sessions
WHERE is_active = true
  AND user_id = 'YOUR_USER_ID';
```

### ✅ Risultato
- [ ] `last_activity` aggiornato automaticamente
- [ ] Update avviene ogni ~5 minuti
- [ ] Nessun errore in console

---

## 📊 Summary

**Tests Completed:** __/6

**Critical Issues:**
-

**Minor Issues:**
-

**Notes:**
-

---

## 🔍 Database Verification Queries

### Complete Activity Log Overview
```sql
SELECT
  al.id,
  al.activity_type,
  al.entity_type,
  al.entity_id,
  al.timestamp,
  al.activity_data,
  us.session_start,
  us.is_active
FROM user_activity_logs al
LEFT JOIN user_sessions us ON al.session_id = us.id
WHERE al.user_id = 'YOUR_USER_ID'
  AND al.company_id = 'YOUR_COMPANY_ID'
ORDER BY al.timestamp DESC
LIMIT 50;
```

### Session Statistics
```sql
SELECT
  COUNT(*) as total_sessions,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_sessions,
  MAX(session_start) as last_session_start,
  MAX(last_activity) as last_activity
FROM user_sessions
WHERE user_id = 'YOUR_USER_ID';
```

### Activity Type Distribution
```sql
SELECT
  activity_type,
  COUNT(*) as count,
  MIN(timestamp) as first_occurrence,
  MAX(timestamp) as last_occurrence
FROM user_activity_logs
WHERE user_id = 'YOUR_USER_ID'
  AND company_id = 'YOUR_COMPANY_ID'
GROUP BY activity_type
ORDER BY count DESC;
```

---

**Tested By:** Claude Code
**Date:** 2025-01-11
