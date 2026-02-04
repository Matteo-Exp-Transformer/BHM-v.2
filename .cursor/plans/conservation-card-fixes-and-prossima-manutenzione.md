# Piano: Fix card Conservazione, aggiornamento dati e “Prossima manutenzione” espandibile

## Riepilogo richieste

1. **Sbrinamento completato**: dopo il completamento, la card “Manutenzioni Programmate” non mostra la prossima scadenza ma resta su quella corrente (non riconosce il completamento).
2. **Rilevamento temperatura**: la sezione non si aggiorna con il rilevamento effettuato oggi per quel punto di conservazione.
3. **ConservationPointCard**: mostrare anche le **manutenzioni da fare oggi** (non solo rilevamento temperatura o in ritardo).
4. **Prossima manutenzione**: rendere la riga “Prossima manutenzione: …” **cliccabile** e, una volta aperta, mostrare le **tipologie di manutenzione** assegnate con la **prossima data** di esecuzione per ciascuna.
5. **Rilevamento temperatura da modal Attività**: se l’utente clicca “Completa Manutenzione” su un item **Rilevamento temperatura** nel modal (MacroCategoryModal / Attività), aprire il **modal di rilevamento temperatura** con il punto di conservazione già assegnato, così l’utente deve inserire la temperatura (completamento effettivo al salvataggio della lettura).

---

## 1. Sbrinamento completato – prossima non aggiornata

### Spiegazione in linguaggio semplice

L’app tiene traccia di due cose quando segni una manutenzione come “fatta”:

1. **Lo storico** (“l’ho fatto oggi”) → viene sempre registrato.
2. **La prossima scadenza** (“la prossima volta sarà tra una settimana”) → a volte **non** viene aggiornata.

**Dove succede il problema**

- Se completi la manutenzione **dal Calendario / Attività** (es. clic su un giorno e “Completa Manutenzione”), l’app registra solo che l’hai fatta. **Non** ricalcola e non salva la prossima data (es. “sbrinamento prossimo il 11/02”).
- In più, anche quando la prossima data viene aggiornata correttamente (da un altro punto dell’app), la **pagina Conservazione** e la card “Manutenzioni Programmate” a volte continuano a usare i dati vecchi perché non vengono avvisate di ricaricare.

**Esempi pratici**

- **Esempio 1 – Completamento da Calendario**  
  Marco apre il Calendario, clicca sul 4 febbraio, vede “Sbrinamento – Frigo 2 Cucina” e clicca “Completa Manutenzione”. L’app salva “sbrinamento completato il 04/02” ma **non** aggiorna la scheda della manutenzione con “prossimo sbrinamento 11/02”. Nella card Manutenzioni Programmate e nella pagina Conservazione continua a comparire “Sbrinamento – Scadenza: 04/02/2026” come se non fosse stato completato.  
  **Cosa fare**: dopo “Completa Manutenzione” dal Calendario, l’app deve anche aggiornare la prossima scadenza (come fa quando completi da altri punti), così ovunque si veda subito “prossimo sbrinamento 11/02”.

- **Esempio 2 – Pagina Conservazione non si aggiorna**  
  Marco completa lo sbrinamento da un altro schermo (dove l’app aggiorna già la prossima data). Se poi va sulla pagina Conservazione, la card del punto può ancora mostrare la vecchia scadenza perché quella pagina non è stata avvisata di ricaricare i dati.  
  **Cosa fare**: ogni volta che una manutenzione viene completata (da qualsiasi schermo), l’app deve dire alla pagina Conservazione e alla card “Manutenzioni Programmate” di ricaricare l’elenco, così vedi sempre la prossima scadenza aggiornata.

**In sintesi**

- **Fix A**: Quando completi da **Calendario/Attività**, l’app deve anche **aggiornare la prossima scadenza** (stessa regola che usa altrove: es. settimanale → +7 giorni).
- **Fix B**: Dopo **ogni** completamento manutenzione, l’app deve **far ricaricare** i dati alla pagina Conservazione e alla card Manutenzioni Programmate, così non restano mai con la scadenza vecchia.

### Modifiche da fare (riferimento tecnico)

| # | Dove | Cosa |
|---|------|------|
| 1.1 | **Calendar: completamento manutenzione** | Allineare il flusso a quello di `useMaintenanceTasks`: dopo l’insert in `maintenance_completions`, **aggiornare** la riga in `maintenance_tasks` con la nuova `next_due` (e last_completed, completed_at, completed_by) calcolata in base alla frequenza. Opzione alternativa: chiamare la stessa logica di `completeTask` (hook o funzione condivisa) invece di fare solo l’insert. |
| 1.2 | **useMaintenanceTasks.ts** (`completeTaskMutation.onSuccess`) | Aggiungere: `queryClient.invalidateQueries({ queryKey: ['maintenance-tasks-critical'] })` (e opzionalmente `refetchType: 'all'`) così dopo ogni completamento si aggiornano anche i dati usati dalla pagina Conservazione e dalle card. |

**File coinvolti**

- `src/features/conservation/hooks/useMaintenanceTasks.ts` – invalidation
- `src/features/calendar/components/CategoryEventsModal.tsx` – logica completamento manutenzione (insert + update task o uso di completeTask)
- `src/features/calendar/components/MacroCategoryModal.tsx` – idem (dove si completa manutenzione con insert in `maintenance_completions`)

**Nota DB**

- In `database/migrations/016_create_maintenance_completions.sql` non risulta un trigger che aggiorna `maintenance_tasks` su INSERT in `maintenance_completions`. La logica di aggiornamento è solo in app (useMaintenanceTasks). Per coerenza, il completamento da Calendar deve replicare quella logica (o usarla).

---

## 2. Rilevamento temperatura – dati non aggiornati

### Comportamento attuale

- **ConservationPage** costruisce `pointsWithLastReading` con:
  - `conservationPoints` (useConservationPoints)
  - `temperatureReadings` (useTemperatureReadings senza `conservationPointId`)
  - `getLatestReadingByPoint(temperatureReadings ?? [], point.id)` → `last_temperature_reading` per ogni punto
- Dopo aver inserito una lettura, `createReading` in **useTemperatureReadings** invalida già `['temperature-readings']`, quindi in linea di principio la lista si aggiorna.

### Possibili cause

- Refetch non ancora terminato quando l’utente guarda la card (ritardo di rete / UI).
- Un altro punto della UI (es. sezione “Rilevamento Temperature” nella card “Manutenzioni Programmate”) che dipende da `maintenance_tasks` o da `maintenance-tasks-critical`: se dopo la lettura non si invalidano anche quelle query, il “rilevamento temperatura” come mansione da fare potrebbe restare visibile anche se soddisfatto dalla lettura.

### Modifiche da fare

| # | Dove | Cosa |
|---|------|------|
| 2.1 | **useTemperatureReadings.ts** (createReadingMutation onSuccess / dopo insert) | Verificare che oltre a `['temperature-readings']` si invalidino (come già in parte fatto) anche `['maintenance-tasks']` e `['maintenance-tasks-critical']`, così la card punti e la sezione manutenzioni vedono subito “rilevamento temperatura” soddisfatto. |
| 2.2 | **useTemperatureReadings.ts** (dopo createReading) | Mostrare un messaggio di feedback all’utente: es. “Lettura registrata. Aggiornamento in corso…” (o simile) per rendere l’esperienza più fluida e professionale e far capire che l’aggiornamento è in atto. |

**File coinvolti**

- `src/features/conservation/hooks/useTemperatureReadings.ts` – invalidazioni e eventuale refetch

---

## 3. ConservationPointCard – mostrare anche manutenzioni “da fare oggi”

### Comportamento attuale

- In **pointCheckup.ts** i “task di oggi” sono filtrati con:
  - `taskDate >= todayStart && taskDate <= todayEnd && taskDate <= now`
- Quindi vengono considerati solo i task con **next_due nella giornata corrente e con orario già passato** (`<= now`). I task “scadenza oggi” ma con orario successivo (es. “dopo le 18”) non entrano in “oggi” e non compaiono come “da completare oggi” nella card.

### Modifica

| # | Dove | Cosa |
|---|------|------|
| 3.1 | **pointCheckup.ts** – calcolo `todayTasks` | Cambiare il filtro da “next_due oggi **e** <= now” a “next_due **nella sola giornata** (todayStart ÷ todayEnd)”:
  - Prima: `taskDate >= todayStart && taskDate <= todayEnd && taskDate <= now`
  - Dopo: `taskDate >= todayStart && taskDate <= todayEnd`
- Lasciare invariato il resto: `todayPending` (esclusi completed/skipped e temperatura già soddisfatta da lettura), messaggi e stato (warning/critical) continueranno a basarsi su questi “today” tasks.

**File**

- `src/features/conservation/utils/pointCheckup.ts`

---

## 4. “Prossima manutenzione” – cliccabile con elenco per tipologia e data

### Comportamento attuale

- In **ConservationPointCard** (stato “normal”) viene mostrata una riga:
  - “Prossima manutenzione: [titolo/tipo] oggi / domani / tra N giorni”
- La riga è una sola e non è espandibile; i dati vengono da `checkup.nextMaintenanceDue` (una sola task “prossima” in ordine di next_due).

### Richiesta

- La riga “Prossima manutenzione” deve essere **cliccabile**.
- Al click si apre un blocco che mostra, per **ogni tipologia** di manutenzione assegnata al punto (temperature, sanitization, defrosting, expiry_check), la **prossima data** in cui va eseguita.

### Modifiche da fare

| # | Dove | Cosa |
|---|------|------|
| 4.1 | **types/conservation.ts** – `ConservationPointCheckup` | Aggiungere un campo opzionale, ad es. `nextMaintenanceByType?: { type: string; label: string; next_due: Date; daysUntil: number }[]`, per esporre la “prossima” per ogni tipo (non solo la prima in assoluto). |
| 4.2 | **pointCheckup.ts** – `getPointCheckup` | Calcolare `nextMaintenanceByType`: dai `tasks` del punto, considerare solo task con `next_due > now` (o >= todayStart se si vuole includere “oggi”) e `status === 'scheduled'`; raggruppare per `task.type`; per ogni tipo tenere la task con `next_due` minima. Popolare l’array con type, label (da MAINTENANCE_TASK_TYPES o titolo), next_due, daysUntil. Assegnare il risultato a `checkup.nextMaintenanceByType`. |
| 4.3 | **ConservationPointCard.tsx** | (1) Usare uno state locale, es. `showNextMaintenanceDetails`, per l’espansione. (2) Rendere la riga “Prossima manutenzione: …” un `<button>` (o elemento con onClick) che toggle `showNextMaintenanceDetails`. (3) Quando `showNextMaintenanceDetails` è true, sotto la riga mostrare un elenco (lista o piccola card) con le voci di `checkup.nextMaintenanceByType`: per ogni voce mostrare label della tipologia e “Prossima: [data] (oggi / domani / tra N giorni)”. (4) Icona chevron (es. ChevronDown/ChevronUp) per indicare aperto/chiuso. |

**File**

- `src/types/conservation.ts`
- `src/features/conservation/utils/pointCheckup.ts`
- `src/features/conservation/components/ConservationPointCard.tsx`

**Dettaglio dati e scelte utente**

- I task passati a `getPointCheckup` sono quelli “critici” (useMaintenanceTasksCritical): arretrati + oggi + **una** “prossima” per tipo (getNextTasksPerType). Per costruire `nextMaintenanceByType` si usano le task con next_due nel futuro.
- **Tipologie senza prossima scadenza**: **nasconderle** dall’elenco (non mostrare “Non programmata”).
- **Ordine nell’elenco**: **ordine fisso** come in ScheduledMaintenanceCard: Rilevamento temperature → Sanificazione → Sbrinamento → Controllo scadenze.

---

## 5. Rilevamento temperatura da modal Attività – aprire modal temperatura

Se l’utente clicca **“Completa Manutenzione”** su un item **Rilevamento temperatura** nel modal Attività (MacroCategoryModal), non completare subito: aprire il **modal di rilevamento temperatura** con il **punto di conservazione** già selezionato. Scopo: chiedere di inserire la temperatura; il completamento avviene al salvataggio della lettura (useTemperatureReadings completa il task). Modifiche: (5.1) useMacroCategoryEvents – aggiungere `maintenance_type: task.type` in metadata; (5.2) MacroCategoryModal – se tipo temperature, navigare a `/conservation` con state `openTemperatureForPointId` invece di handleCompleteMaintenance; (5.3) ConservationPage – se location.state.openTemperatureForPointId, aprire modal temperatura con quel punto e pulire state. Opzionale: stessa logica in CategoryEventsModal (5.4).

---

## Mappatura file

| File | Modifiche |
|------|-----------|
| `src/features/conservation/hooks/useMaintenanceTasks.ts` | Invalidate `maintenance-tasks-critical` in onSuccess di completeTask. |
| `src/features/conservation/hooks/useTemperatureReadings.ts` | Verificare/aggiungere invalidazione di maintenance-tasks e maintenance-tasks-critical dopo createReading. |
| `src/features/conservation/utils/pointCheckup.ts` | todayTasks: togliere `&& taskDate <= now`. Aggiungere calcolo e ritorno di `nextMaintenanceByType`. |
| `src/types/conservation.ts` | Aggiungere `nextMaintenanceByType` a `ConservationPointCheckup`. |
| `src/features/conservation/components/ConservationPointCard.tsx` | Prossima manutenzione cliccabile + blocco espanso con elenco per tipologia e data. |
| `src/features/calendar/components/CategoryEventsModal.tsx` | Completamento manutenzione: dopo insert in maintenance_completions, aggiornare maintenance_tasks (next_due, last_completed, ecc.) con la stessa logica di useMaintenanceTasks, o delegare a quella logica. |
| `src/features/calendar/components/MacroCategoryModal.tsx` | Completamento: insert + update task (fix 1.1). Se tipo = temperature → aprire modal temperatura (navigare a Conservazione con state) invece di completare subito (fix 5.2). |
| `src/features/calendar/hooks/useMacroCategoryEvents.ts` | In `convertMaintenanceToItem` aggiungere `maintenance_type: task.type` in metadata (fix 5.1). |
| `src/features/conservation/ConservationPage.tsx` | All’ingresso: se `location.state.openTemperatureForPointId` → aprire modal temperatura con quel punto e pulire state (fix 5.3). |

---

## Scelte confermate (risposte utente)

1. **Completamento da Calendar**  
   Da chiarire ancora: preferenza tra **(A)** replicare la logica in Calendar oppure **(B)** funzione/hook condivisa (vedi sezione 1).

2. **Tipologie senza “prossima” nella card**  
   **Nasconderle** dall’elenco: non mostrare tipologie senza nessuna prossima scadenza.

3. **Rilevamento temperatura – messaggio di feedback**  
   **Sì**: mostrare un messaggio tipo “Lettura registrata. Aggiornamento in corso…” (o equivalente) per rendere l’esperienza più fluida e professionale. Implementare in useTemperatureReadings dopo createReading (toast o messaggio in UI).

4. **Ordine tipologie nell’elenco “Prossima manutenzione”**  
   **Ordine fisso**: Rilevamento temperature → Sanificazione → Sbrinamento → Controllo scadenze (come in ScheduledMaintenanceCard).

---

## Prossimi passi

Implementare i fix 1.1, 1.2 (vedere prossima manutenzione dopo completamento), 2.1, 2.2, 3.1, 4.1–4.3 e 5.1–5.3 (completamento da Calendar con update next_due; invalidation; todayTasks; messaggio lettura; "Prossima manutenzione" espandibile; Rilevamento temperatura da modal Attività → aprire modal temperatura con punto assegnato). Opzionale: 5.4 in CategoryEventsModal (invalidation, todayTasks, messaggio lettura, tipo checkup e UI “Prossima manutenzione” con elenco a ordine fisso e tipologie senza prossima nascoste). In parallelo definire la scelta per il completamento da Calendar (1.1).
