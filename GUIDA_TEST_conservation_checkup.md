# 🧪 Guida Test - Card Conservation con Check-up

## Prerequisiti

1. ✅ **Applicare la migration SQL** al database:
   ```bash
   # Opzione 1: Via Supabase CLI
   supabase db push

   # Opzione 2: Manualmente nella console Supabase
   # Copia il contenuto di supabase/migrations/20260201120000_trigger_maintenance_task_recurrence.sql
   # e eseguilo nella SQL Editor di Supabase
   ```

2. ✅ **Verificare che la migration sia applicata**:
   ```sql
   -- Nella SQL Editor di Supabase, esegui:
   SELECT EXISTS (
     SELECT 1
     FROM pg_trigger
     WHERE tgname = 'trigger_update_task_on_completion'
   );
   -- Deve restituire: true
   ```

3. ✅ **Avviare l'applicazione**:
   ```bash
   npm run dev
   ```

---

## Test 1: Check-up Base - Tutto OK

**Scenario**: Punto con temperatura ok e nessuna manutenzione urgente.

**Setup**:
1. Vai su Conservation
2. Crea un punto "Frigorifero Test" con:
   - Temperatura target: 4°C
   - Tipo: Frigorifero
3. Rileva temperatura: 4.2°C

**Atteso**:
- Badge: 🟢 **REGOLARE**
- Nessun messaggio di warning/critico
- Mostra: "Prossima manutenzione: ..." (se ci sono task futuri)

---

## Test 2: Solo Problema Temperatura

**Scenario**: Temperatura fuori range, manutenzioni ok.

**Setup**:
1. Usa il punto "Frigorifero Test"
2. Rileva temperatura: **10°C** (troppo alta!)

**Atteso**:
- Badge: 🔴 **CRITICO**
- **UN BOX** con messaggio temperatura:
  ```
  🌡️ Temperatura troppo alta (10°C). Regola il termostato.
  Clicca per regolare →
  ```
- Cliccando il box → scroll alla sezione Rilevamenti Temperatura

**Verifica**:
- ✅ Messaggio chiaro
- ✅ Badge critico rosso
- ✅ Click funziona

---

## Test 3: Solo Problema Manutenzioni - Arretrate

**Scenario**: Temperatura ok, ma manutenzioni arretrate.

**Setup**:
1. Ripristina temperatura: 4°C
2. Nel database (SQL Editor), crea un task arretrato di 5 giorni:
   ```sql
   INSERT INTO maintenance_tasks (
     company_id,
     conservation_point_id,
     title,
     type,
     frequency,
     estimated_duration,
     next_due,
     status,
     priority
   ) VALUES (
     'TUO_COMPANY_ID',
     'ID_DEL_FRIGORIFERO_TEST',
     'Sanificazione arretrata',
     'sanitization',
     'weekly',
     120,
     NOW() - INTERVAL '5 days', -- 5 giorni fa!
     'scheduled', -- Non completato
     'high'
   );
   ```

**Atteso**:
- Badge: 🔴 **CRITICO** (perché arretrato >3 giorni = severity high)
- **UN BOX** con messaggio manutenzioni:
  ```
  📅 Manutenzioni
  1 manutenzione arretrata

  [Mostra dettagli ▼]
  ```

**Verifica dettagli espansi**:
- Clicca "Mostra dettagli"
- Appare box rosso:
  ```
  ⚠️ Manutenzioni Arretrate

  🟠 Sanificazione arretrata    5 giorni fa
  ```
- **Pallino arancione** (severity: high perché 3-7 giorni)

**Test gravità**:
- Modifica il task per essere arretrato di **10 giorni**:
  ```sql
  UPDATE maintenance_tasks
  SET next_due = NOW() - INTERVAL '10 days'
  WHERE title = 'Sanificazione arretrata';
  ```
- Ricarica pagina
- Ora il pallino è 🔴 **rosso** (severity: critical perché >7 giorni)

---

## Test 4: Solo Problema Manutenzioni - Oggi

**Scenario**: Manutenzione di oggi non completata.

**Setup**:
1. Rimuovi il task arretrato (o completalo)
2. Crea task di oggi:
   ```sql
   INSERT INTO maintenance_tasks (
     company_id,
     conservation_point_id,
     title,
     type,
     frequency,
     estimated_duration,
     next_due,
     status,
     priority
   ) VALUES (
     'TUO_COMPANY_ID',
     'ID_DEL_FRIGORIFERO_TEST',
     'Controllo temperatura',
     'temperature',
     'daily',
     30,
     NOW(), -- OGGI
     'scheduled',
     'medium'
   );
   ```

**Atteso**:
- Badge: 🟡 **ATTENZIONE** (non critico, solo warning)
- Messaggio:
  ```
  📅 1 manutenzione di oggi da completare
  ```

**Dettagli espansi**:
```
⏰ Da Completare Oggi

• Controllo temperatura
```

---

## Test 5: ENTRAMBI i Problemi (DUE BOX SEPARATI)

**Scenario**: Temperatura fuori range + manutenzioni arretrate.

**Setup**:
1. Rileva temperatura: **10°C**
2. Crea task arretrato di 5 giorni (vedi Test 3)

**Atteso**:
- Badge: 🔴 **CRITICO**
- **DUE BOX SEPARATI**:

**Box 1 - Temperatura**:
```
🌡️ Temperatura
Temperatura troppo alta (10°C). Regola il termostato.

Clicca per regolare →
```

**Box 2 - Manutenzioni**:
```
📅 Manutenzioni
1 manutenzione arretrata

[Mostra dettagli ▼]
```

**Verifica**:
- ✅ Due box visivamente separati
- ✅ Entrambi mostrati contemporaneamente
- ✅ Box temperatura cliccabile
- ✅ Dettagli manutenzioni espandibili

---

## Test 6: Real-time - Due Utenti (Mario e Luca)

**Scenario**: Mario completa una manutenzione, Luca vede aggiornamento automatico.

**Setup**:
1. Apri **DUE BROWSER** (Chrome + Edge, o due finestre incognito)
2. Login come **utente A** (Mario) nel primo browser
3. Login come **utente B** (Luca) nel secondo browser (stesso company!)
4. Entrambi navigano su Conservation

**Azioni**:
1. **Browser Mario**: Vai su Calendario
2. **Browser Luca**: Guarda la card del Frigorifero Test (deve mostrare "1 manutenzione di oggi")
3. **Browser Mario**: Completa la manutenzione "Controllo temperatura" dal calendario

**Atteso nel Browser Luca (SENZA refresh manuale)**:
- ✅ Dopo 1-3 secondi, la card si aggiorna automaticamente
- ✅ Il messaggio "1 manutenzione di oggi" **sparisce**
- ✅ Badge cambia da 🟡 **ATTENZIONE** a 🟢 **REGOLARE**
- ✅ Compare "Prossima manutenzione: Controllo temperatura domani"

**Console log atteso** (Browser Luca):
```
🔄 Attivando real-time per conservation (company: ...)
✅ Real-time maintenance_completions attivo
✅ Manutenzione completata (real-time): { ... }
```

**Verifica**:
- ✅ Aggiornamento automatico (NO refresh manuale)
- ✅ Latenza < 5 secondi
- ✅ Nessun errore console

---

## Test 7: Completamenti Multipli (Mario + Luca insieme)

**Scenario**: Mario e Luca completano la stessa manutenzione a distanza di 2 secondi.

**Setup**:
1. Due browser come Test 6
2. Crea task "Sanificazione" per oggi
3. Entrambi navigano su Calendario e vedono "Sanificazione - Da completare"

**Azioni (CONTEMPORANEE)**:
1. **10:00:00 - Browser Mario**: Clicca "Completa" su Sanificazione
2. **10:00:02 - Browser Luca**: Clicca "Completa" su Sanificazione (2 secondi dopo!)

**Atteso**:
- ✅ **NESSUN ERRORE** (entrambi i click vengono accettati)
- ✅ Nel database, tabella `maintenance_completions` ha **DUE RECORD**:
  ```sql
  SELECT * FROM maintenance_completions
  WHERE maintenance_task_id = 'ID_TASK_SANIFICAZIONE'
  ORDER BY completed_at;

  -- Risultato:
  -- | id  | completed_by_name | completed_at      |
  -- |-----|-------------------|-------------------|
  -- | ... | Mario Rossi       | 10:00:00          |
  -- | ... | Luca Bianchi      | 10:00:02          |
  ```

**Verifica dettagli task**:
- Nel calendario, vedi task completato con:
  ```
  ✅ Completata da: Mario Rossi (10:00:00), Luca Bianchi (10:00:02)
  ```

---

## Test 8: Trigger Ricorrente (Next_Due Automatico)

**Scenario**: Quando completi un task mensile, next_due si aggiorna automaticamente a +1 mese.

**Setup**:
1. Crea task mensile:
   ```sql
   INSERT INTO maintenance_tasks (
     company_id,
     conservation_point_id,
     title,
     type,
     frequency,
     estimated_duration,
     next_due,
     status,
     priority
   ) VALUES (
     'TUO_COMPANY_ID',
     'ID_FRIGORIFERO_TEST',
     'Sanificazione mensile',
     'sanitization',
     'monthly', -- ← Ricorrenza mensile
     120,
     NOW(),
     'scheduled',
     'high'
   );
   ```

2. Verifica next_due prima del completamento:
   ```sql
   SELECT id, title, next_due, status
   FROM maintenance_tasks
   WHERE title = 'Sanificazione mensile';
   -- Annotati il next_due
   ```

**Azioni**:
1. Vai su Calendario
2. Completa "Sanificazione mensile"

**Verifica DOPO completamento**:
```sql
SELECT
  mt.id,
  mt.title,
  mt.next_due AS prossima_scadenza,
  mt.last_completed AS ultima_completata,
  mt.status
FROM maintenance_tasks mt
WHERE mt.title = 'Sanificazione mensile';

-- Atteso:
-- next_due = data_completamento + 1 mese
-- last_completed = data_completamento
-- status = 'scheduled' (resettato!)
```

**Verifica in tabella completions**:
```sql
SELECT * FROM maintenance_completions
WHERE maintenance_task_id = 'ID_TASK'
ORDER BY completed_at DESC
LIMIT 1;

-- Deve esserci il record con completed_at = adesso
```

**Test altre frequency**:
- `daily` → +1 giorno
- `weekly` → +7 giorni
- `annually` → +1 anno

---

## Test 9: Prossima Solo Se Oggi Completato

**Scenario**: La "prossima manutenzione" di un tipo appare solo dopo aver completato quella di oggi.

**Setup**:
1. Crea 2 task "Controllo Temperatura":
   ```sql
   -- Task 1: Oggi
   INSERT INTO maintenance_tasks (...) VALUES (
     ...,
     'Controllo temperatura oggi',
     'temperature',
     'daily',
     30,
     NOW(), -- OGGI
     'scheduled',
     'medium'
   );

   -- Task 2: Domani
   INSERT INTO maintenance_tasks (...) VALUES (
     ...,
     'Controllo temperatura domani',
     'temperature',
     'daily',
     30,
     NOW() + INTERVAL '1 day', -- DOMANI
     'scheduled',
     'medium'
   );
   ```

**Atteso PRIMA del completamento**:
- Card mostra "1 manutenzione di oggi"
- **NON mostra** "Prossima: Controllo temperatura domani"

**Dopo completamento**:
1. Completa il task "Controllo temperatura oggi"
2. Ricarica Conservation

**Atteso DOPO**:
- Card mostra 🟢 **REGOLARE**
- **ORA MOSTRA**: "Prossima manutenzione: Controllo temperatura domani"

---

## Test 10: Abbattitore (Solo Sanificazione)

**Scenario**: Punto abbattitore non ha controllo temperatura, solo manutenzioni.

**Setup**:
1. Crea punto "Abbattitore Test":
   - Tipo: `blast`
   - (Non ha setpoint_temp rilevante)

2. Crea task "Sanificazione settimanale" per l'abbattitore

**Atteso**:
- ❌ **NON mostra** sezione temperatura
- ❌ **NON considera** temperatura per lo stato
- ✅ Stato basato **solo** su manutenzioni
- Se manutenzione arretrata → Badge 🔴 CRITICO
- Se tutto ok → Badge 🟢 REGOLARE

**Verifica**:
- Prova a rilevare temperatura → la card ignora il valore
- Stato dipende solo da manutenzioni

---

## Checklist Finale

Prima di considerare completato:

- [ ] Test 1: Tutto ok ✅
- [ ] Test 2: Solo temperatura ✅
- [ ] Test 3: Solo arretrati con gravità ✅
- [ ] Test 4: Solo oggi ✅
- [ ] Test 5: Entrambi problemi (due box) ✅
- [ ] Test 6: Real-time funziona ✅
- [ ] Test 7: Completamenti multipli ok ✅
- [ ] Test 8: Trigger next_due automatico ✅
- [ ] Test 9: Prossima condizionale ✅
- [ ] Test 10: Abbattitore solo manutenzioni ✅

---

## Troubleshooting

### Real-time non funziona

**Problema**: Card non si aggiorna automaticamente.

**Verifica**:
1. Console browser → cerca log:
   ```
   ✅ Real-time maintenance_completions attivo
   ```
   Se non c'è → real-time non è partito

2. Controlla che Supabase Realtime sia abilitato:
   - Dashboard Supabase → Settings → API → Realtime: **Enabled**

3. Verifica filtro company_id corretto:
   ```javascript
   filter: `company_id=eq.${companyId}`
   ```

### Trigger non esegue

**Problema**: Dopo completamento, next_due non si aggiorna.

**Verifica**:
```sql
-- Controlla che il trigger esista
SELECT tgname FROM pg_trigger WHERE tgname = 'trigger_update_task_on_completion';

-- Se vuoto, riapplica la migration
```

**Debug**:
```sql
-- Abilita log notice
SET client_min_messages TO NOTICE;

-- Poi completa un task e guarda i log
```

### Dettagli non espandibili

**Problema**: Click su "Mostra dettagli" non fa nulla.

**Verifica**:
1. Console → errori JavaScript?
2. Controlla che `showMaintenanceDetails` state funzioni:
   ```javascript
   const [showMaintenanceDetails, setShowMaintenanceDetails] = useState(false)
   ```

---

**Fine Guida Test** 🎯
