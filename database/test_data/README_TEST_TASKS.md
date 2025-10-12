# 🧪 Script di Test per Mansioni Retrodatate

## 📋 Panoramica

Questi script ti permettono di testare la funzionalità "Attività in Ritardo" inserendo mansioni retrodatate e poi rimuovendole dopo il test.

---

## 🚀 Come Usare

### STEP 1: Preparazione

1. Apri **Supabase Dashboard** → **SQL Editor**
2. Apri il file `insert_retroactive_tasks.sql`
3. **IMPORTANTE**: Sostituisci i segnaposto con i tuoi ID reali:
   - `[YOUR_COMPANY_ID]` → Il tuo company_id
   - `[YOUR_DEPARTMENT_ID]` → Il tuo department_id (opzionale)
   - `[YOUR_USER_ID]` → Il tuo auth user id

**Come trovare i tuoi ID:**

```sql
-- Trova il tuo Company ID
SELECT id, name FROM public.companies WHERE name ILIKE '%tuo-nome-azienda%';

-- Trova il tuo User ID
SELECT id, email FROM auth.users WHERE email = 'tua-email@example.com';

-- Trova i Department IDs
SELECT id, name FROM public.departments WHERE company_id = 'YOUR_COMPANY_ID';
```

### STEP 2: Inserisci i Task di Test

1. Copia tutto il contenuto di `insert_retroactive_tasks.sql`
2. Sostituisci i valori `[YOUR_COMPANY_ID]`, ecc.
3. Esegui lo script in Supabase SQL Editor

**Task creati:**
- ❌ **1 e 3 Ottobre** (oltre 1 settimana) → NON dovrebbero apparire in "In Ritardo"
- ⚠️ **5, 7, 9, 11 Ottobre** (da 1 settimana fa a ieri) → **DEVONO apparire in "In Ritardo"**
- ✅ **12 Ottobre** (oggi) → Appare in "Attive" (NON in ritardo)
- ✅ **15 Ottobre** (futuro) → Appare in "Attive"

### STEP 3: Verifica nell'App

1. Apri il calendario nell'app
2. Clicca su una data qualsiasi per aprire il pannello laterale
3. **Verifica il count "In Ritardo"**: Dovrebbe mostrare **4**
4. **Verifica la sezione**: Dovresti vedere la sezione "Mansioni/Attività in Ritardo" con:
   - 🧪 TEST: Sanitizzazione Frigo (5 Ott) - IN RITARDO
   - 🧪 TEST: Controllo Scadenze Prodotti (7 Ott) - IN RITARDO
   - 🧪 TEST: Registrazione Temperature (9 Ott) - IN RITARDO
   - 🧪 TEST: Pulizia Sala (11 Ott - IERI) - IN RITARDO
5. **Verifica che NON appaiano** in "In Ritardo":
   - Task del 1 e 3 ottobre (oltre settimana)
   - Task del 12 ottobre (oggi)
   - Task del 15 ottobre (futuro)

### STEP 4: Test Specifici

**Test 1: Count Corretto**
- Count "In Ritardo" = 4 ✅
- Count "Attive" include oggi e futuro ✅
- Count "Completate" = 0 (nessun task completato) ✅

**Test 2: Range Temporale**
- Task del 1 Ott (11 giorni fa) → NON appare ✅
- Task del 5 Ott (7 giorni fa) → APPARE ✅
- Task del 11 Ott (ieri) → APPARE ✅
- Task del 12 Ott (oggi) → NON appare in ritardo ✅

**Test 3: Sezione Visuale**
- Card rosse con bordo spesso ✅
- Badge "IN RITARDO" rosso ✅
- Icona ⚠️ ✅
- Pulsante arancione "Completa Mansione in Ritardo" ✅

### STEP 5: Rimuovi i Task di Test

Dopo aver verificato tutto:

1. Apri `delete_test_tasks.sql`
2. **PRIMA** esegui il preview per vedere cosa verrà eliminato:
   ```sql
   SELECT * FROM public.tasks WHERE name LIKE '🧪 TEST:%';
   ```
3. **POI** esegui l'eliminazione:
   ```sql
   DELETE FROM public.tasks WHERE name LIKE '🧪 TEST:%';
   ```
4. **VERIFICA** che siano stati eliminati:
   ```sql
   SELECT COUNT(*) FROM public.tasks WHERE name LIKE '🧪 TEST:%';
   -- Dovrebbe restituire: 0
   ```

---

## 📊 Risultati Attesi

### Count nel Pannello Laterale

```
Attive: [dipende dai tuoi task reali + 2 task di test (12 e 15 ott)]
In Ritardo: 4 
Completate: [dipende dai tuoi task reali]
```

### Sezioni Visualizzate

1. **Mansioni/Attività Attive**
   - Task del 12 ottobre (oggi)
   - Task del 15 ottobre (futuro)
   - I tuoi task reali attivi

2. **Mansioni/Attività in Ritardo** ⚠️
   - Task del 5 ottobre (7 giorni fa)
   - Task del 7 ottobre (5 giorni fa)
   - Task del 9 ottobre (3 giorni fa)
   - Task del 11 ottobre (ieri)

3. **Mansioni/Attività Completate**
   - I tuoi task reali completati

### Task che NON devono apparire in "In Ritardo"

- Task del 1 ottobre (oltre 1 settimana)
- Task del 3 ottobre (oltre 1 settimana)

---

## ⚠️ Note Importanti

1. **Tutti i task di test hanno l'emoji 🧪** per facile identificazione
2. **Non dimenticare di eliminarli** dopo il test
3. **Se qualcosa va storto**, puoi sempre eliminarli con:
   ```sql
   DELETE FROM public.tasks WHERE name LIKE '🧪 TEST:%';
   ```
4. **I task di test NON interferiscono** con i tuoi task reali

---

## 🐛 Troubleshooting

### "Non vedo i task di test"
- Verifica di aver sostituito `[YOUR_COMPANY_ID]` con il tuo ID reale
- Verifica che lo script sia stato eseguito senza errori
- Ricarica l'app (F5)

### "Il count è diverso da 4"
- Verifica la data corrente nel tuo sistema
- Gli script assumono che oggi sia il 12 ottobre 2025
- Se la data è diversa, il range "in ritardo" cambierà

### "Vedo task che non dovrebbero esserci"
- Task del 1 e 3 ottobre NON devono apparire in "In Ritardo"
- Se appaiono, c'è un bug nella logica del codice

### "Non riesco a eliminarli"
- Usa sempre il comando con il pattern: `WHERE name LIKE '🧪 TEST:%'`
- Verifica di avere i permessi corretti in Supabase

---

## 📝 Checklist Test

- [ ] Ho sostituito i segnaposto con i miei ID
- [ ] Ho eseguito lo script di inserimento
- [ ] Vedo 4 task in "In Ritardo"
- [ ] I task del 1 e 3 ottobre NON appaiono in "In Ritardo"
- [ ] I task del 5, 7, 9, 11 ottobre APPAIONO in "In Ritardo"
- [ ] Il task del 12 ottobre appare in "Attive" (non in ritardo)
- [ ] Ho verificato che le card siano rosse
- [ ] Ho testato il pulsante di completamento
- [ ] Ho eliminato i task di test

---

## 🎯 Obiettivo del Test

Verificare che la logica "Attività in Ritardo" funzioni correttamente:
- ✅ Count corretto (4 task)
- ✅ Range temporale corretto (7 giorni fa - ieri)
- ✅ Oggi NON conta come in ritardo
- ✅ Task oltre 1 settimana NON appaiono
- ✅ UI corretta (card rosse, badge, icone)

