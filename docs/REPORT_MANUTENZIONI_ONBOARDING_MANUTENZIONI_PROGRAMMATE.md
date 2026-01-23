# Mini report: Manutenzioni onboarding → Manutenzioni Programmate

**Data:** 2025-10-24  
**File modificato:** `src/features/conservation/components/AddPointModal.tsx`  
**Obiettivo:** Garantire che i dati inseriti nel form manutenzioni (onboarding / AddPointModal) siano correttamente salvati e visualizzati nella sezione **Manutenzioni Programmate** (CollapsibleCard in Conservazione).

---

## 1. Contesto e richiesta

- **MaintenanceTaskForm** (in `AddPointModal`): i 4 task obbligatori (Rilevamento Temperature, Sanificazione, Sbrinamento, Controllo Scadenze) sono compilati durante l’onboarding con frequenza, ruolo, giorni settimana/mese/anno.
- **Manutenzioni Programmate** (`ScheduledMaintenanceCard`): card collassabile che mostra la “Situazione settimanale per punto di conservazione” con le manutenzioni raggruppate per tipo.
- **Richiesta:** usare i dati del form per popolare le Manutenzioni Programmate; ogni manutenzione deve corrispondere al tipo corretto e ai dati configurati (frequenza, assegnazione, scadenze).

---

## 2. Indagine svolta

### 2.1 Flusso dati ricostruito

| Fase | Componente / Hook | Ruolo |
|------|-------------------|--------|
| Form | `AddPointModal` → `MaintenanceTaskForm` | Stato `maintenanceTasks` (`MandatoryMaintenanceTask[]`): `manutenzione`, `frequenza`, `assegnatoARuolo`, `assegnatoACategoria`, `giorniSettimana`, `giornoMese`, `giornoAnno` |
| Salvataggio | `handleSubmit` → `transformMaintenanceTasks` → `onSave` | Trasforma in formato per `useConservationPoints` |
| Persistenza | `useConservationPoints.createConservationPoint` | Insert in `conservation_points` + insert in `maintenance_tasks` |
| Lettura | `useMaintenanceTasks` | Query `maintenance_tasks` per `company_id` (e opz. `conservation_point_id`) |
| UI | `ScheduledMaintenanceCard` | Filtra per `MANDATORY_MAINTENANCE_TYPES`, raggruppa per `task.type`, mostra scadenza e “Assegnato a” |

### 2.2 Mapping tipi

- **Form:** `StandardMaintenanceType` = `rilevamento_temperatura` | `sanificazione` | `sbrinamento` | `controllo_scadenze`.
- **DB / Card:** `MANDATORY_MAINTENANCE_TYPES` = `temperature` | `sanitization` | `defrosting` | `expiry_check`.
- **AddPointModal** usa `MAINTENANCE_TYPE_MAPPING` (form → DB) e `REVERSE_MAINTENANCE_TYPE_MAPPING` (DB → form, in edit).

### 2.3 Utilizzo in onboarding

- `ConservationStep` usa `AddPointModal` con **`showMaintenances={true}`** → le manutenzioni sono inviate anche in onboarding.

---

## 3. Problemi individuati

### 3.1 Tipo “Controllo Scadenze” errato

- **Prima:** `MAINTENANCE_TYPE_MAPPING['controllo_scadenze'] = 'temperature'` (commento: “Fallback a temperature per controllo scadenze”).
- **Effetto:** Le attività “Controllo Scadenze” venivano salvate come `type: 'temperature'` e nella card finivano sotto “Rilevamento Temperature”; non esisteva un gruppo distinto “Controllo Scadenze” e i dati erano incoerenti con il form.

### 3.2 `next_due` ignorava la configurazione del form

- **Prima:** `transformMaintenanceTasks` usava `calculateNextDue(frequency)` (da `useMaintenanceTasks`), che aggiunge 1 giorno/settimana/mese/anno a “oggi” senza considerare:
  - **Giornaliera:** `giorniSettimana` (giorni di apertura selezionati).
  - **Settimanale:** `giorniSettimana[0]` (es. “ogni lunedì”).
  - **Mensile:** `giornoMese` (1–31).
  - **Annuale:** `giornoAnno` (solo sbrinamento; per anno si usa ancora `calculateNextDue`).
- **Effetto:** Le scadenze in Manutenzioni Programmate non rispettavano i giorni configurati nel form.

---

## 4. Modifiche effettuate

### 4.1 Correzione `MAINTENANCE_TYPE_MAPPING` (righe 138–144)

**Prima:**
```ts
'controllo_scadenze': 'temperature', // Fallback a temperature per controllo scadenze
```

**Dopo:**
```ts
'controllo_scadenze': 'expiry_check',
```

- Aggiunto commento: *“allineato a MANDATORY_MAINTENANCE_TYPES in ScheduledMaintenanceCard”*.

### 4.2 Mappa `WEEKDAY_TO_JS_DAY` (righe 173–182)

- **Nuova costante:** `WEEKDAY_TO_JS_DAY: Record<Weekday, number>`.
- Mappa i weekday del form (`lunedi`, `martedi`, …, `domenica`) ai valori di `Date.getDay()` (0 = domenica, 1 = lunedì, …, 6 = sabato).
- Usata in `computeNextDueFromFormTask` per calcolare le date.

### 4.3 Funzione `computeNextDueFromFormTask` (righe 184–235)

- **Input:** `task: MandatoryMaintenanceTask`.
- **Output:** `Date` (prossima scadenza).

Logica per frequenza:

| Frequenza | Condizione | Logica |
|-----------|------------|--------|
| **Giornaliera** | `giorniSettimana` non vuoto | Cerca la prima data ≥ oggi il cui `getDay()` è in `giorniSettimana` (max 8 giorni); fallback: domani. |
| **Settimanale** | `giorniSettimana` non vuoto | Prossima occorrenza di `giorniSettimana[0]` ≥ oggi; se oggi è già quel giorno, `next_due` = oggi. |
| **Mensile** | `giornoMese` in [1, 31] | Prossima data con `getDate() === giornoMese`; se `giornoMese` > ultimo giorno del mese, si usa l’ultimo; se la data è nel passato, si passa al mese successivo. |
| **Annuale** | sempre | `calculateNextDue('annually', today)` (nessun uso di `giornoAnno` per ora). |
| **Fallback** | altre / dati mancanti | `calculateNextDue(englishFreq, today)`. |

`FREQUENCY_MAPPING` continua a definire la corrispondenza `MaintenanceFrequency` → `EnglishMaintenanceFrequency` per i fallback.

### 4.4 Aggiornamento `transformMaintenanceTasks` (righe 958–989)

- **Prima:** `next_due` con `new Date(calculateNextDue(frequency as EnglishMaintenanceFrequency))`.
- **Dopo:** `next_due` con `computeNextDueFromFormTask(task)`.

- Aggiunto commento sulla trasformazione e sull’uso dei dati del form per allineare le Manutenzioni Programmate.
- Rimossi commenti ridondanti; il resto della trasformazione (type, frequency, title, assigned_to, assignment_type, assigned_to_role, assigned_to_category, assigned_to_staff_id, priority, estimated_duration, instructions) è invariato.

---

## 5. File non modificati (solo consultati)

- `src/features/conservation/hooks/useConservationPoints.ts` – insert `maintenance_tasks` (title, type, frequency, next_due, assignment_*, ecc.).
- `src/features/conservation/hooks/useMaintenanceTasks.ts` – `calculateNextDue`, query e tipo `MaintenanceTask`.
- `src/features/dashboard/components/ScheduledMaintenanceCard.tsx` – `MANDATORY_MAINTENANCE_TYPES`, filtro per tipo, raggruppamento, `formatAssignmentDetails`, `renderMaintenanceTask`.
- `src/components/onboarding-steps/ConservationStep.tsx` – uso di `AddPointModal` con `showMaintenances={true}`.
- `src/components/ui/MiniCalendar.tsx` – `mode` month/year e `selectedDay` per giorno mese / giorno anno.
- Schema DB `maintenance_tasks` (Supabase) – colonne `title`, `type`, `instructions`, ecc.

---

## 6. Test e type-check

- **`ScheduledMaintenanceCard`:** `npx vitest run src/features/dashboard/components/__tests__/ScheduledMaintenanceCard.test.tsx` → **10/10 passati**.
- **`AddPointModal`:** `npx vitest run src/features/conservation/components/__tests__/AddPointModal.test.tsx` → 2 test falliti (es. timeout su `readOnlyDiv`), **non legati** alle modifiche su tipo o `next_due`; altri 18 passati.
- **Type-check globale:** `npx tsc --noEmit` → errori preesistenti in altri moduli (calendar, inventory, staff, settings, ecc.). **Nessun errore in `AddPointModal.tsx`.**

---

## 7. Flusso dati finale (sintesi)

1. **Form (onboarding / AddPoint):** l’utente compila i 4 task obbligatori (frequenza, ruolo, categoria, giorni, eventuale dipendente).
2. **Submit:** `transformMaintenanceTasks` converte in tipo DB (`temperature` | `sanitization` | `defrosting` | `expiry_check`), calcola `next_due` con `computeNextDueFromFormTask` e invia a `onSave` → `createConservationPoint` → insert in `maintenance_tasks`.
3. **Manutenzioni Programmate:** `ScheduledMaintenanceCard` legge da `useMaintenanceTasks`, filtra per `MANDATORY_MAINTENANCE_TYPES`, raggruppa per `task.type` e mostra per ogni tipo scadenza e “Assegnato a” (ruolo, categoria, reparto, dipendente). Tipo e `next_due` sono ora allineati ai dati del form.

---

## 8. Cosa non è stato fatto (volutamente o per limiti attuali)

- **`giornoAnno` (annuale):** il MiniCalendar in modalità “year” usa un “working day” nell’anno fiscale, non un giorno gregoriano 1–365. Per semplicità, per la frequenza annuale si continua a usare `calculateNextDue('annually')`; un eventuale uso di `giornoAnno` richiederebbe un’interpretazione chiara (anno fiscale, date di chiusura, ecc.).
- **Persistenza di `giorniSettimana` / `giornoMese` / `giornoAnno`:** non salvati in DB; usati solo per il **primo** `next_due`. I successivi ricalcoli (es. dopo completamento) usano `calculateNextDue(frequency)` nel hook, che non conosce i giorni specifici. Eventuali estensioni (es. campi in `maintenance_tasks` o in `recurrence_config`) non sono state introdotte.
- **Modifiche a `ScheduledMaintenanceCard` o a `useMaintenanceTasks`:** nessuna; tutte le correzioni sono in `AddPointModal` (mapping tipi e calcolo `next_due`).

---

## 9. Riepilogo modifiche per riga (AddPointModal)

| Righe | Modifica |
|-------|----------|
| 138–144 | `MAINTENANCE_TYPE_MAPPING`: `controllo_scadenze` → `expiry_check` + commento |
| 173–182 | Nuova `WEEKDAY_TO_JS_DAY` |
| 184–235 | Nuova `computeNextDueFromFormTask` |
| 958–989 | `transformMaintenanceTasks`: `next_due` da `computeNextDueFromFormTask(task)` + commenti |

---

Fine report.
