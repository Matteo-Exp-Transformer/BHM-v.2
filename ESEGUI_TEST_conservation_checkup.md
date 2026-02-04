# Esegui i 10 test – Conservation Check-up

**Valori usati** (dal tuo DB):
- `company_id`: `e39639e1-b7c1-43c3-b6c3-25fec15180e0`
- **Frigorifero Test / Frigo A**: `de942961-2846-4c91-af9a-6510176a57b9`
- **Abbattitore**: `9aa202e3-117f-47f4-becd-70fe4bc38675`

---

## Prima di iniziare

1. **App**: `npm run dev` (se non è già avviata).
2. **Trigger**: già verificato presente nel DB.
3. Apri **Conservation** nell’app e, se serve, **Supabase → SQL Editor** per gli script sotto.

---

## Test 1: Check-up base – Tutto OK

**In app:**
1. Vai su **Conservation**.
2. Se non c’è un punto “Frigo A” (o simile) con target 4°C, creane uno: nome "Frigorifero Test", temperatura target 4°C, tipo Frigorifero.
3. Clicca **Rileva Temperatura** per quel punto e inserisci **4.2** °C → Salva.

**Atteso:** badge REGOLARE, nessun warning/critico.

---

## Test 2: Solo problema temperatura

**In app:**
1. Stesso punto del Test 1.
2. **Rileva Temperatura** → inserisci **10** °C → Salva.

**Atteso:** badge CRITICO, un box con “Temperatura troppo alta (10°C). Regola il termostato.” e “Clicca per regolare →”. Clic sul box porta alla sezione Rilevamenti.

---

## Test 3: Solo manutenzioni arretrate

**In app:** rileva di nuovo **4** °C per il frigorifero (per tornare in range).

**In Supabase SQL Editor** – esegui (usa l’id del punto che stai usando, es. Frigo A):

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
  priority,
  assigned_to,
  assignment_type
) VALUES (
  'e39639e1-b7c1-43c3-b6c3-25fec15180e0',
  'de942961-2846-4c91-af9a-6510176a57b9',
  'Sanificazione arretrata',
  'sanitization',
  'weekly',
  120,
  NOW() - INTERVAL '5 days',
  'scheduled',
  'high',
  'Reparto cucina',
  'role'
);
```

Ricarica **Conservation**.

**Atteso:** badge CRITICO, box “1 manutenzione arretrata”, “Mostra dettagli” con pallino arancione (3–7 giorni).

**Gravità >7 giorni:** in SQL Editor:

```sql
UPDATE maintenance_tasks
SET next_due = NOW() - INTERVAL '10 days'
WHERE title = 'Sanificazione arretrata';
```

Ricarica: pallino rosso (critical).

---

## Test 4: Solo manutenzione di oggi

Rimuovi o completa il task “Sanificazione arretrata”. Poi in **SQL Editor**:

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
  priority,
  assigned_to,
  assignment_type
) VALUES (
  'e39639e1-b7c1-43c3-b6c3-25fec15180e0',
  'de942961-2846-4c91-af9a-6510176a57b9',
  'Controllo temperatura',
  'temperature',
  'daily',
  30,
  NOW(),
  'scheduled',
  'medium',
  'Reparto cucina',
  'role'
);
```

Ricarica Conservation.

**Atteso:** badge ATTENZIONE, “1 manutenzione di oggi da completare”. Dettagli: “Da Completare Oggi” → “Controllo temperatura”.

---

## Test 5: Entrambi i problemi (due box)

**In app:** rileva **10** °C per il frigorifero.

**In SQL:** se non c’è già un task arretrato, riesegui l’INSERT del Test 3 (Sanificazione arretrata 5 giorni).

Ricarica Conservation.

**Atteso:** badge CRITICO, **due box**: uno temperatura (“Temperatura troppo alta…”, cliccabile), uno manutenzioni (“1 manutenzione arretrata”, dettagli espandibili).

---

## Test 6: Real-time (Mario e Luca)

1. Apri **due browser** (es. Chrome + Edge o due incognito).
2. Login **utente A** in uno, **utente B** nell’altro (stesso company).
3. Entrambi su **Conservation**; il punto deve mostrare “1 manutenzione di oggi” (es. “Controllo temperatura”).
4. **Browser A**: vai su **Calendario** e completa “Controllo temperatura”.
5. **Browser B**: resta su Conservation, **non** ricaricare.

**Atteso (browser B in 1–3 s):** card si aggiorna, messaggio “1 manutenzione di oggi” sparisce, badge da ATTENZIONE a REGOLARE, compare “Prossima manutenzione: … domani”. In console: “Real-time maintenance_completions attivo” e log di completamento.

---

## Test 7: Completamenti multipli

1. Crea un task “Sanificazione” per oggi (stesso punto, SQL come Test 4 ma title `Sanificazione` e type `sanitization`).
2. Due browser, stesso company, entrambi su **Calendario**, entrambi vedono “Sanificazione - Da completare”.
3. **Browser A**: clic “Completa” su Sanificazione.
4. Dopo ~2 secondi **Browser B**: clic “Completa” sulla stessa Sanificazione.

**Atteso:** nessun errore; in DB due righe in `maintenance_completions` per lo stesso task; in calendario testo tipo “Completata da: [Nome A], [Nome B]”.

---

## Test 8: Trigger ricorrente (next_due automatico)

**SQL Editor** – task mensile:

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
  priority,
  assigned_to,
  assignment_type
) VALUES (
  'e39639e1-b7c1-43c3-b6c3-25fec15180e0',
  'de942961-2846-4c91-af9a-6510176a57b9',
  'Sanificazione mensile',
  'sanitization',
  'monthly',
  120,
  NOW(),
  'scheduled',
  'high',
  'Reparto cucina',
  'role'
);
```

**Prima:** in SQL `SELECT id, title, next_due, status FROM maintenance_tasks WHERE title = 'Sanificazione mensile';` → annota `next_due`.

**In app:** Calendario → completa “Sanificazione mensile”.

**Dopo:** riesegui la stessa SELECT. **Atteso:** `next_due` = circa “ora + 1 mese”, `last_completed` = ora del completamento, `status` = `scheduled`. In `maintenance_completions` una riga con quel `maintenance_task_id` e `completed_at` = adesso.

---

## Test 9: Prossima solo se oggi completato

**SQL** – due task stesso tipo (usa lo stesso `conservation_point_id`):

```sql
-- Task oggi
INSERT INTO maintenance_tasks (
  company_id, conservation_point_id, title, type, frequency,
  estimated_duration, next_due, status, priority, assigned_to, assignment_type
) VALUES (
  'e39639e1-b7c1-43c3-b6c3-25fec15180e0',
  'de942961-2846-4c91-af9a-6510176a57b9',
  'Controllo temperatura oggi',
  'temperature', 'daily', 30, NOW(), 'scheduled', 'medium', 'Reparto cucina', 'role'
);
-- Task domani
INSERT INTO maintenance_tasks (
  company_id, conservation_point_id, title, type, frequency,
  estimated_duration, next_due, status, priority, assigned_to, assignment_type
) VALUES (
  'e39639e1-b7c1-43c3-b6c3-25fec15180e0',
  'de942961-2846-4c91-af9a-6510176a57b9',
  'Controllo temperatura domani',
  'temperature', 'daily', 30, NOW() + INTERVAL '1 day', 'scheduled', 'medium', 'Reparto cucina', 'role'
);
```

**Prima:** Conservation → card mostra “1 manutenzione di oggi”, **non** “Prossima: Controllo temperatura domani”.

**In app:** completa “Controllo temperatura oggi” (Calendario), poi ricarica Conservation.

**Dopo:** badge REGOLARE e testo “Prossima manutenzione: Controllo temperatura domani”.

---

## Test 10: Abbattitore (solo manutenzioni)

**In app:** crea punto “Abbattitore Test” tipo **Abbattitore** (blast). Crea un task “Sanificazione settimanale” per quel punto (o usare punto “Abbattitore” id `9aa202e3-117f-47f4-becd-70fe4bc38675` e aggiungere task da SQL).

**Atteso:** sulla card abbattitore **non** si vede sezione temperatura; stato **solo** da manutenzioni (arretrata → CRITICO, ok → REGOLARE). Rilevare temperatura non cambia lo stato della card abbattitore.

---

## Checklist rapida

- [ ] Test 1: Base OK
- [ ] Test 2: Solo temperatura
- [ ] Test 3: Solo arretrati + gravità
- [ ] Test 4: Solo oggi
- [ ] Test 5: Due box
- [ ] Test 6: Real-time
- [ ] Test 7: Completamenti multipli
- [ ] Test 8: Trigger next_due
- [ ] Test 9: Prossima condizionale
- [ ] Test 10: Abbattitore

**Fine** – Puoi usare questo file come traccia mentre esegui la GUIDA_TEST_conservation_checkup.md.
