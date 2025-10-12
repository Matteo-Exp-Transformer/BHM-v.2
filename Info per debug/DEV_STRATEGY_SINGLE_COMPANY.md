# 🎯 STRATEGIA SVILUPPO - UNA SOLA AZIENDA

**Data**: 12 Ottobre 2025  
**Problema**: Creazione di molteplici company duplicate durante testing  
**Soluzione**: Sistema di "ancoraggio" a una singola company per sviluppo

---

## 📊 SITUAZIONE ATTUALE

Hai **14 company duplicate** tutte chiamate "Al Ritrovo SRL":

```
| company_id                           | company_name   | created_at           |
| ------------------------------------ | -------------- | -------------------- |
| 205c56c7-30b5-4526-b064-bf998c562df3 | Al Ritrovo SRL | 2025-10-12 08:23:45  |
| 90dedb9d-b5f4-454d-a8d3-b3144303ee12 | Al Ritrovo SRL | 2025-10-12 09:15:22  |
| ffc07962-1885-4230-868f-9604388762b3 | Al Ritrovo SRL | 2025-10-12 10:42:11  |
... (e altre 11)
```

**Causa**: Ogni volta che completi l'onboarding, viene creata una NUOVA company.

---

## 🛠️ SOLUZIONE IN 3 STEP

### STEP 1: PULIZIA DATABASE (UNA TANTUM)

Elimina le 13 company duplicate, mantenendo solo la più completa.

**Script**: `database/test_data/cleanup_duplicate_companies.sql`

**Come usare**:

1. **Apri Supabase Dashboard** → SQL Editor

2. **Identifica la company da mantenere**:
   ```sql
   -- Trova la company PIÙ COMPLETA (quella con più dati)
   SELECT 
     c.id as company_id,
     c.name,
     c.created_at,
     (
       (SELECT COUNT(*) FROM public.departments WHERE company_id = c.id) +
       (SELECT COUNT(*) FROM public.staff WHERE company_id = c.id) +
       (SELECT COUNT(*) FROM public.products WHERE company_id = c.id) +
       (SELECT COUNT(*) FROM public.conservation_points WHERE company_id = c.id) +
       (SELECT COUNT(*) FROM public.tasks WHERE company_id = c.id) +
       (SELECT COUNT(*) FROM public.company_members WHERE company_id = c.id)
     ) as completeness_score
   FROM public.companies c
   WHERE c.name = 'Al Ritrovo SRL'
   ORDER BY completeness_score DESC, c.created_at DESC
   LIMIT 1;
   ```

3. **Copia l'ID** della company con score più alto (esempio: `205c56c7-30b5-4526-b064-bf998c562df3`)

4. **Esegui l'eliminazione**:
   ```sql
   DO $$ 
   DECLARE
     company_to_keep UUID := '205c56c7-30b5-4526-b064-bf998c562df3';  -- ⚠️ USA IL TUO ID!
   BEGIN
     DELETE FROM public.companies
     WHERE name = 'Al Ritrovo SRL'
       AND id != company_to_keep;
     
     RAISE NOTICE '✅ Duplicate eliminate - mantenuta: %', company_to_keep;
   END $$;
   ```

5. **Verifica risultato**:
   ```sql
   SELECT COUNT(*) as remaining_companies
   FROM public.companies
   WHERE name = 'Al Ritrovo SRL';
   -- Deve restituire: 1
   ```

---

### STEP 2: ATTIVA MODALITÀ SVILUPPO

Usa la dev utility per "ancorare" sempre la stessa company.

**File**: `src/utils/devCompanyHelper.ts`

**Come attivare**:

1. **Avvia l'app** (`npm run dev`)

2. **Apri la console** del browser (F12)

3. **Trova automaticamente la migliore company**:
   ```javascript
   devCompanyHelper.findBestDevCompany()
   ```
   
   Output:
   ```
   🔍 Cercando la migliore company "Al Ritrovo SRL"...
   📊 Trovate 1 company "Al Ritrovo SRL"
   ✨ Migliore Company: 205c56c7-30b5-4526-b064-bf998c562df3
   💡 Per usare questa company in sviluppo, esegui:
   setDevCompany('205c56c7-30b5-4526-b064-bf998c562df3')
   ```

4. **Imposta la dev company**:
   ```javascript
   devCompanyHelper.setDevCompany('205c56c7-30b5-4526-b064-bf998c562df3')
   ```
   
   Oppure (più veloce):
   ```javascript
   devCompanyHelper.setDevCompanyFromCurrentUser()
   ```

5. **Verifica**:
   ```javascript
   devCompanyHelper.showDevCompanyInfo()
   ```

---

### STEP 3: TESTA IL FUNZIONAMENTO

Ora testa che funzioni tutto correttamente.

**Test 1: Onboarding con Dev Company**

1. Vai alla pagina di onboarding
2. Clicca "Precompila" (bottone viola)
3. Clicca "Completa Onboarding Automatico"
4. **Verifica nella console**:
   ```
   🛠️ DEV MODE ATTIVO - Cercando dev company...
   ✅ Dev company trovata e verrà riutilizzata: 205c56c7-...
   🛠️ Modalità sviluppo: riutilizzo company esistente
   ```
5. **Verifica nel database** che NON sia stata creata una nuova company:
   ```sql
   SELECT COUNT(*) FROM public.companies WHERE name = 'Al Ritrovo SRL';
   -- Deve rimanere: 1
   ```

**Test 2: Reset e Onboarding Multipli**

1. Fai "Reset All Data" (bottone rosso)
2. Fai onboarding completo
3. Ripeti il reset 5 volte
4. **Verifica nel database**:
   ```sql
   SELECT COUNT(*) FROM public.companies WHERE name = 'Al Ritrovo SRL';
   -- Deve SEMPRE restituire: 1
   ```

---

## 📚 COMANDI CONSOLE DISPONIBILI

Tutti i comandi sono accessibili tramite `devCompanyHelper`:

```javascript
// 🔍 QUERY

// Trova tutte le company e mostra la migliore
devCompanyHelper.findBestDevCompany()

// Mostra info sulla dev company attuale
devCompanyHelper.showDevCompanyInfo()

// Controlla se dev company è attiva
devCompanyHelper.hasDevCompany()
// → true/false

// Ottieni l'ID della dev company
devCompanyHelper.getDevCompany()
// → '205c56c7-...' o null


// ⚙️ CONFIGURAZIONE

// Imposta dev company manualmente
devCompanyHelper.setDevCompany('205c56c7-30b5-4526-b064-bf998c562df3')

// Imposta automaticamente la company dell'utente corrente
devCompanyHelper.setDevCompanyFromCurrentUser()

// Rimuovi dev company (torna al comportamento normale)
devCompanyHelper.clearDevCompany()


// 🎯 WORKFLOW CONSIGLIATO

// Setup iniziale (una volta sola)
devCompanyHelper.findBestDevCompany()
devCompanyHelper.setDevCompanyFromCurrentUser()

// Durante sviluppo
devCompanyHelper.showDevCompanyInfo()  // Per verificare quale company stai usando

// Prima di passare in produzione
devCompanyHelper.clearDevCompany()     // Disattiva dev mode
```

---

## 🔄 WORKFLOW SVILUPPO GIORNALIERO

### Mattina (Inizio Lavoro)

1. **Avvia app**: `npm run dev`

2. **Verifica dev company** (console F12):
   ```javascript
   devCompanyHelper.showDevCompanyInfo()
   ```

3. **Se non configurata, imposta**:
   ```javascript
   devCompanyHelper.setDevCompanyFromCurrentUser()
   ```

### Durante Sviluppo

- Fai tutte le modifiche e test che vuoi
- Usa "Reset All Data" liberamente
- Fai onboarding quante volte serve
- La company rimarrà **SEMPRE LA STESSA**

### Fine Giornata (Optional)

- **Cleanup dati test** (se vuoi partire pulito domani):
  ```javascript
  // Dall'app: clicca "Reset All Data"
  ```
  
- La company rimarrà, vengono eliminati solo:
  - Departments, Staff, Products
  - Tasks, Conservation Points
  - Temperature Readings

---

## ⚠️ BEST PRACTICES

### ✅ DO (Fai)

- **Imposta dev company all'inizio del progetto** e non cambiarla mai
- **Usa sempre lo stesso user** per login durante sviluppo
- **Verifica periodicamente** che non si creino duplicate:
  ```sql
  SELECT COUNT(*) FROM companies WHERE name = 'Al Ritrovo SRL';
  ```
- **Fai backup regolari** dal Supabase Dashboard prima di test pesanti

### ❌ DON'T (Non Fare)

- **Non disabilitare dev company** durante sviluppo attivo
- **Non cancellare manualmente** la company dal database (usa `clearDevCompany()` se necessario)
- **Non testare con utenti multipli** senza prima verificare la company
- **Non dimenticare di disabilitare dev mode** prima di deploy in produzione

---

## 🎨 CUSTOMIZZAZIONE

Se vuoi **creare una nuova company da zero** per un nuovo progetto:

1. **Disabilita dev mode**:
   ```javascript
   devCompanyHelper.clearDevCompany()
   ```

2. **Fai onboarding completo** con nuovi dati

3. **Imposta come nuova dev company**:
   ```javascript
   devCompanyHelper.setDevCompanyFromCurrentUser()
   ```

---

## 🐛 TROUBLESHOOTING

### Problema: "Vengono ancora create company duplicate"

**Causa**: Dev company non impostata o disabilitata

**Soluzione**:
```javascript
devCompanyHelper.hasDevCompany()
// Se false:
devCompanyHelper.setDevCompanyFromCurrentUser()
```

---

### Problema: "Dev company non trovata nel database"

**Causa**: Company eliminata manualmente

**Soluzione**:
```javascript
devCompanyHelper.clearDevCompany()
devCompanyHelper.findBestDevCompany()
devCompanyHelper.setDevCompanyFromCurrentUser()
```

---

### Problema: "Vedo dati di un'altra company"

**Causa**: User session punta a company diversa

**Soluzione**:
1. Verifica quale company è attiva:
   ```sql
   SELECT active_company_id 
   FROM user_sessions 
   WHERE user_id = '[TUO_USER_ID]';
   ```

2. Aggiorna user session:
   ```sql
   UPDATE user_sessions
   SET active_company_id = '205c56c7-30b5-4526-b064-bf998c562df3'
   WHERE user_id = '[TUO_USER_ID]';
   ```

3. Ricarica l'app (F5)

---

### Problema: "Errore durante onboarding con dev company"

**Causa**: Company esiste ma manca in company_members

**Soluzione**:
```sql
-- Verifica associazione utente-company
SELECT * FROM company_members 
WHERE user_id = '[TUO_USER_ID]' 
  AND company_id = '205c56c7-30b5-4526-b064-bf998c562df3';

-- Se non esiste, creala:
INSERT INTO company_members (user_id, company_id, role, is_active)
VALUES ('[TUO_USER_ID]', '205c56c7-30b5-4526-b064-bf998c562df3', 'admin', true)
ON CONFLICT (user_id, company_id) DO UPDATE 
SET is_active = true;
```

---

## 📦 FILE CREATI

| File | Scopo |
|------|-------|
| `database/test_data/cleanup_duplicate_companies.sql` | Script per eliminare company duplicate |
| `src/utils/devCompanyHelper.ts` | Utility per gestire dev company |
| `Info per debug/DEV_STRATEGY_SINGLE_COMPANY.md` | Questo documento |

**Modifiche a file esistenti**:
- `src/utils/onboardingHelpers.ts` - Integrazione con dev company helper

---

## 🚀 QUICK START

**3 comandi per iniziare subito**:

```javascript
// 1. Trova la migliore company
devCompanyHelper.findBestDevCompany()

// 2. Imposta automaticamente
devCompanyHelper.setDevCompanyFromCurrentUser()

// 3. Verifica
devCompanyHelper.showDevCompanyInfo()
```

**Fatto!** Ora puoi sviluppare senza preoccuparti di create company duplicate.

---

## 📞 SUPPORTO

Se hai problemi:

1. **Controlla console** (F12) per errori
2. **Verifica database** con le query SQL fornite
3. **Rileggi TROUBLESHOOTING** in questo documento

---

**Happy Coding!** 🎉

